import { useNavigate, Link } from 'react-router';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { invoicesApi } from '@/api/invoices';
import { patientsApi } from '@/api/patients';
import { servicesApi } from '@/api/services';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { FormCard } from '@/components/ui/FormCard';
import { FormSelect } from '@/components/ui/FormSelect';
import { Textarea } from '@/components/ui/Textarea';
import { toast } from 'sonner';
import {
  ArrowLeft,
  Plus,
  Trash2,
  Receipt,
  Building2,
  User,
  Hash,
  Euro,
  Layers,
} from 'lucide-react';

const lineSchema = z.object({
  service_id: z.string().optional(),
  description: z.string().min(1, 'Descripción obligatoria'),
  quantity: z.coerce.number().min(1, 'Mín. 1'),
  unit_price: z.coerce.number().min(0, 'Precio no válido'),
});

const invoiceSchema = z.object({
  patient_id: z.string().min(1, 'Selecciona un paciente'),
  notes: z.string().optional(),
  reference_clinic: z.string().optional(),
  lines: z.array(lineSchema).min(1, 'Añade al menos una línea'),
});

type InvoiceFormValues = z.infer<typeof invoiceSchema>;

export default function InvoiceCreatePage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: patients } = useQuery({
    queryKey: ['patients', 'select'],
    queryFn: () => patientsApi.list().then((r) => r.data.data),
  });

  const { data: services } = useQuery({
    queryKey: ['services'],
    queryFn: () => servicesApi.list().then((r) => r.data),
  });

  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    formState: { errors },
  } = useForm<InvoiceFormValues>({
    resolver: zodResolver(invoiceSchema) as any,
    defaultValues: {
      patient_id: '',
      notes: '',
      reference_clinic: '',
      lines: [{ service_id: '', description: '', quantity: 1, unit_price: 0 }],
    },
  });

  const { fields, append, remove } = useFieldArray({ control, name: 'lines' });
  const lines = watch('lines');
  const total = lines.reduce((sum, l) => sum + (l.quantity || 0) * (l.unit_price || 0), 0);

  const showReferenceClinic = useMemo(() => {
    if (!services) return false;
    return lines.some((line) => {
      if (!line.service_id) return false;
      const svc = services.find((s) => s.id === line.service_id);
      return svc?.specialty?.name?.toLowerCase().includes('diagnóstico por imagen');
    });
  }, [lines, services]);

  const handleServiceChange = (index: number, serviceId: string) => {
    if (!serviceId || !services) return;
    const svc = services.find((s) => s.id === serviceId);
    if (svc) {
      setValue(`lines.${index}.description`, svc.name);
      setValue(`lines.${index}.unit_price`, svc.price);
    }
  };

  const serviceOptions = useMemo(
    () => services?.map((s) => ({ value: s.id, label: s.name })) ?? [],
    [services],
  );

  const patientOptions = useMemo(
    () =>
      patients?.map((p) => ({
        value: p.id,
        label: `${p.first_name} ${p.last_name}`,
      })) ?? [],
    [patients],
  );

  const mutation = useMutation({
    mutationFn: (values: InvoiceFormValues) =>
      invoicesApi.create({
        patient_id: values.patient_id,
        notes: values.notes,
        reference_clinic: values.reference_clinic || undefined,
        lines: values.lines.map((l) => ({
          service_id: l.service_id || undefined,
          description: l.description,
          quantity: l.quantity,
          unit_price: l.unit_price,
        })),
      }),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      toast.success('Factura creada');
      navigate(`/invoices/${res.data.id}`);
    },
    onError: () => toast.error('Error al crear la factura'),
  });

  return (
    <div className="space-y-6 animate-fade-in">
      {/* ── Page header ── */}
      <div className="flex items-start gap-3">
        <Link
          to="/invoices"
          className="mt-1 flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-surface text-gray-400 shadow-sm transition-colors hover:bg-primary-50 hover:text-primary-500"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary-100 bg-primary-50/60 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-primary-600">
            <Receipt className="h-3.5 w-3.5" />
            Nueva factura
          </div>
          <h1 className="text-2xl font-black tracking-tight text-gray-950">
            Crear factura
          </h1>
        </div>
      </div>

      <form
        onSubmit={handleSubmit((v) => mutation.mutate(v))}
        className="space-y-5"
      >
        {/* ── 1. Datos generales ── */}
        <FormCard
          accent="primary"
          icon={<User className="h-4 w-4" />}
          title="Datos generales"
          description="Paciente asociado a esta factura"
        >
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Controller
              name="patient_id"
              control={control}
              render={({ field }) => (
                <FormSelect
                  label="Paciente"
                  placeholder="Seleccionar paciente"
                  options={patientOptions}
                  value={field.value}
                  onValueChange={field.onChange}
                  error={errors.patient_id?.message}
                  required
                  clearable
                />
              )}
            />
          </div>
        </FormCard>

        {/* ── 2. Líneas de factura ── */}
        <FormCard
          accent="primary"
          icon={<Layers className="h-4 w-4" />}
          title="Líneas de factura"
          description="Servicios y conceptos incluidos"
          action={
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() =>
                append({ service_id: '', description: '', quantity: 1, unit_price: 0 })
              }
            >
              <Plus className="h-3.5 w-3.5" />
              Añadir línea
            </Button>
          }
        >
          <div className="flex flex-col gap-3">
            {/* Column headers */}
            <div className="hidden grid-cols-12 gap-3 px-0.5 sm:grid">
              {[
                { label: 'Servicio', cols: 'col-span-3' },
                { label: 'Concepto', cols: 'col-span-4' },
                { label: 'Cant.', cols: 'col-span-2' },
                { label: 'Precio (€)', cols: 'col-span-2' },
                { label: '', cols: 'col-span-1' },
              ].map((h) => (
                <div
                  key={h.label}
                  className={`${h.cols} text-[10px] font-semibold uppercase tracking-[0.07em] text-gray-400`}
                >
                  {h.label}
                </div>
              ))}
            </div>

            {fields.map((field, index) => (
              <div
                key={field.id}
                className="grid grid-cols-12 items-start gap-3 rounded-xl border border-border-subtle bg-surface-raised p-3.5 transition-colors hover:border-border"
              >
                {/* Mobile row label */}
                <div className="col-span-12 mb-0.5 flex items-center gap-1.5 sm:hidden">
                  <span className="flex h-4 w-4 items-center justify-center rounded-full bg-primary-100 text-[9px] font-bold text-primary-600">
                    {index + 1}
                  </span>
                  <span className="text-[10px] font-semibold uppercase tracking-wide text-gray-400">
                    Línea {index + 1}
                  </span>
                </div>

                {/* Service */}
                <div className="col-span-12 sm:col-span-3">
                  <Controller
                    name={`lines.${index}.service_id`}
                    control={control}
                    render={({ field: f }) => (
                      <FormSelect
                        placeholder="(manual)"
                        options={serviceOptions}
                        value={f.value ?? ''}
                        onValueChange={(val) => {
                          f.onChange(val);
                          handleServiceChange(index, val);
                        }}
                        clearable
                        size="sm"
                      />
                    )}
                  />
                </div>

                {/* Description */}
                <div className="col-span-12 sm:col-span-4">
                  <Input
                    id={`lines.${index}.description`}
                    placeholder="Descripción"
                    size="sm"
                    error={errors.lines?.[index]?.description?.message}
                    {...register(`lines.${index}.description`)}
                  />
                </div>

                {/* Quantity */}
                <div className="col-span-5 sm:col-span-2">
                  <Input
                    id={`lines.${index}.quantity`}
                    type="number"
                    min={1}
                    size="sm"
                    prefixIcon={<Hash className="h-3 w-3" />}
                    error={errors.lines?.[index]?.quantity?.message}
                    {...register(`lines.${index}.quantity`)}
                  />
                </div>

                {/* Price */}
                <div className="col-span-6 sm:col-span-2">
                  <Input
                    id={`lines.${index}.unit_price`}
                    type="number"
                    step="0.01"
                    min={0}
                    size="sm"
                    suffixIcon={<Euro className="h-3 w-3" />}
                    error={errors.lines?.[index]?.unit_price?.message}
                    {...register(`lines.${index}.unit_price`)}
                  />
                </div>

                {/* Delete */}
                <div className="col-span-1 flex pt-1.5 justify-end">
                  {fields.length > 1 && (
                    <button
                      type="button"
                      onClick={() => remove(index)}
                      className="flex h-7 w-7 items-center justify-center rounded-lg text-gray-300 transition-colors hover:bg-red-50 hover:text-red-400"
                      aria-label="Eliminar línea"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              </div>
            ))}

            {errors.lines?.root?.message && (
              <p className="animate-slide-down text-[11px] font-medium text-red-500">
                {errors.lines.root.message}
              </p>
            )}
          </div>
        </FormCard>

        {/* ── 3. Clínica de referencia (condicional) ── */}
        {showReferenceClinic && (
          <FormCard
            accent="secondary"
            icon={<Building2 className="h-4 w-4" />}
            title="Clínica de referencia"
            description="Indica la clínica que derivó al paciente para este estudio de diagnóstico por imagen"
          >
            <div className="max-w-sm">
              <Input
                id="reference_clinic"
                label="Nombre de la clínica"
                placeholder="Ej: Dr. Pablo Fos"
                optional
                error={errors.reference_clinic?.message}
                {...register('reference_clinic')}
              />
            </div>
          </FormCard>
        )}

        {/* ── 4. Resumen ── */}
        <FormCard
          accent={false}
          icon={<Receipt className="h-4 w-4" />}
          title="Resumen"
        >
          <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
            {/* Notes */}
            <div className="w-full max-w-sm">
              <Textarea
                id="notes"
                label="Notas"
                placeholder="Observaciones internas, condiciones de pago…"
                rows={3}
                resize="vertical"
                optional
                showCount
                maxLength={500}
                {...register('notes')}
              />
            </div>

            {/* Total */}
            <div className="shrink-0 rounded-xl border border-border bg-surface-raised px-5 py-4 sm:min-w-[220px]">
              <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.1em] text-gray-400">
                Importe total
              </p>
              <p className="text-3xl font-black tracking-tight text-primary-500">
                {total.toFixed(2)}
                <span className="ml-1 text-xl font-semibold text-primary-300">€</span>
              </p>
              <p className="mt-1.5 text-[11px] text-gray-400">
                {lines.length} línea{lines.length !== 1 ? 's' : ''} · IVA no incluido
              </p>
            </div>
          </div>
        </FormCard>

        {/* ── Actions ── */}
        <div className="flex justify-end gap-3 pb-6">
          <Button
            variant="ghost"
            type="button"
            onClick={() => navigate('/invoices')}
          >
            Cancelar
          </Button>
          <Button type="submit" disabled={mutation.isPending}>
            {mutation.isPending ? 'Creando…' : 'Crear factura'}
          </Button>
        </div>
      </form>
    </div>
  );
}
