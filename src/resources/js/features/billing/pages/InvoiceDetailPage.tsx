import { useParams, Link } from 'react-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { invoicesApi } from '@/api/invoices';
import { Button } from '@/components/ui/Button';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { InvoiceStatus } from '@/types/enums';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import {
  ArrowLeft, Printer, Download, Check, Ban, CreditCard,
  Receipt, User, CalendarDays, Building2, Hash,
  CheckCircle2, Clock, FileX2, FilePlus2,
} from 'lucide-react';
import { useState, useRef, useCallback } from 'react';
import { cn } from '@/lib/utils';
import type { LucideIcon } from 'lucide-react';

// ─── Status display configuration ─────────────────────────────────────────────
const STATUS_CFG: Record<InvoiceStatus, {
  Icon: LucideIcon;
  label: string;
  heroChip: string;
  sidebarGradient: string;
  sidebarBorder: string;
  iconBg: string;
  iconColor: string;
  textColor: string;
}> = {
  [InvoiceStatus.DRAFT]: {
    Icon: FilePlus2,
    label: 'Borrador',
    heroChip: 'bg-white/10 text-white/70 ring-1 ring-white/15',
    sidebarGradient: 'bg-gradient-to-br from-gray-50 to-white',
    sidebarBorder: 'border-gray-200',
    iconBg: 'bg-gray-100',
    iconColor: 'text-gray-500',
    textColor: 'text-gray-700',
  },
  [InvoiceStatus.ISSUED]: {
    Icon: Clock,
    label: 'Emitida',
    heroChip: 'bg-blue-400/20 text-blue-100 ring-1 ring-blue-300/25',
    sidebarGradient: 'bg-gradient-to-br from-blue-50 to-white',
    sidebarBorder: 'border-blue-200',
    iconBg: 'bg-blue-100',
    iconColor: 'text-blue-600',
    textColor: 'text-blue-700',
  },
  [InvoiceStatus.PAID]: {
    Icon: CheckCircle2,
    label: 'Pagada',
    heroChip: 'bg-emerald-400/20 text-emerald-100 ring-1 ring-emerald-300/25',
    sidebarGradient: 'bg-gradient-to-br from-emerald-50 to-white',
    sidebarBorder: 'border-emerald-200',
    iconBg: 'bg-emerald-100',
    iconColor: 'text-emerald-600',
    textColor: 'text-emerald-700',
  },
  [InvoiceStatus.CANCELLED]: {
    Icon: FileX2,
    label: 'Anulada',
    heroChip: 'bg-red-400/20 text-red-100 ring-1 ring-red-300/25',
    sidebarGradient: 'bg-gradient-to-br from-red-50 to-white',
    sidebarBorder: 'border-red-200',
    iconBg: 'bg-red-100',
    iconColor: 'text-red-600',
    textColor: 'text-red-700',
  },
};

function fmtCurrency(v: number | string) {
  return Number(v).toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export default function InvoiceDetailPage() {
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [confirmAction, setConfirmAction] = useState<'issue' | 'pay' | 'cancel' | null>(null);
  const [printing, setPrinting] = useState(false);

  const { data: invoice, isLoading } = useQuery({
    queryKey: ['invoices', id],
    queryFn: () => invoicesApi.get(id!).then((r) => r.data),
    enabled: !!id,
  });

  const issueMutation = useMutation({
    mutationFn: () => invoicesApi.issue(id!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      toast.success('Factura emitida');
      setConfirmAction(null);
    },
  });

  const payMutation = useMutation({
    mutationFn: () => invoicesApi.markPaid(id!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      toast.success('Factura marcada como pagada');
      setConfirmAction(null);
    },
  });

  const cancelMutation = useMutation({
    mutationFn: () => invoicesApi.cancel(id!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      toast.success('Factura anulada');
      setConfirmAction(null);
    },
  });

  // PDF: descargar
  const handleDownloadPdf = useCallback(async () => {
    try {
      const { data: blob } = await invoicesApi.downloadPdf(id!);
      const url = URL.createObjectURL(blob as Blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${invoice?.invoice_number || 'factura'}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      toast.error('Error al descargar el PDF');
    }
  }, [id, invoice]);

  // PDF: imprimir con iframe oculto
  const handlePrint = useCallback(async () => {
    setPrinting(true);
    try {
      const { data: blob } = await invoicesApi.downloadPdf(id!);
      const url = URL.createObjectURL(blob as Blob);
      const iframe = iframeRef.current;
      if (iframe) {
        iframe.src = url;
        iframe.onload = () => {
          iframe.contentWindow?.print();
          setPrinting(false);
          // Limpiar después de un rato
          setTimeout(() => URL.revokeObjectURL(url), 10000);
        };
      }
    } catch {
      toast.error('Error al generar la factura para impresión');
      setPrinting(false);
    }
  }, [id]);

  // Emitir + imprimir automáticamente
  const handleIssueAndPrint = useCallback(async () => {
    try {
      await invoicesApi.issue(id!);
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      toast.success('Factura emitida');
      // Imprimir automáticamente tras emitir
      handlePrint();
    } catch {
      toast.error('Error al emitir la factura');
    }
  }, [id, queryClient, handlePrint]);

  // ── Loading skeleton ────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="animate-fade-in space-y-6">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl skeleton" />
          <div className="h-4 w-52 rounded-full skeleton" />
        </div>
        <div className="h-52 w-full rounded-2xl skeleton" />
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="space-y-5 lg:col-span-2">
            <div className="h-28 rounded-2xl skeleton" />
            <div className="h-64 rounded-2xl skeleton" />
          </div>
          <div className="space-y-4">
            <div className="h-24 rounded-2xl skeleton" />
            <div className="h-48 rounded-2xl skeleton" />
            <div className="h-36 rounded-2xl skeleton" />
          </div>
        </div>
      </div>
    );
  }

  if (!invoice) return null;

  const isDraft     = invoice.status === InvoiceStatus.DRAFT;
  const isIssued    = invoice.status === InvoiceStatus.ISSUED;
  const isPaid      = invoice.status === InvoiceStatus.PAID;
  const isCancelled = invoice.status === InvoiceStatus.CANCELLED;

  const cfg         = STATUS_CFG[invoice.status];
  const StatusIcon  = cfg.Icon;
  const patientName = invoice.patient
    ? `${invoice.patient.first_name} ${invoice.patient.last_name}`
    : '—';
  const tax = Number(invoice.total) - Number(invoice.subtotal);

  return (
    <div className="animate-fade-in space-y-6">
      {/* Hidden iframe for PDF printing */}
      <iframe ref={iframeRef} className="hidden" title="Impresión factura" />

      {/* ── Back navigation ──────────────────────────────────────────────── */}
      <div className="flex items-center gap-3">
        <Link
          to="/invoices"
          className="flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-surface text-gray-400 shadow-sm transition-all duration-200 hover:border-primary-200 hover:bg-primary-50 hover:text-primary-500"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <span className="text-[11px] font-semibold uppercase tracking-[0.22em] text-gray-400">
          Control de facturación
        </span>
      </div>

      {/* ── Document hero header with clinic logo ────────────────────────── */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-secondary-600 via-secondary-500 to-primary-500 p-8 shadow-2xl shadow-secondary-500/25">
        {/* Subtle grid overlay */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.05]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)',
            backgroundSize: '28px 28px',
          }}
        />
        <div className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-white/5 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-12 left-1/4 h-48 w-48 rounded-full bg-primary-400/15 blur-3xl" />

        <div className="relative">
          {/* Logo row */}
          <div className="mb-6 flex items-center justify-between">
            <img
              src="/resources/images/LOGO-IMD-CENTRO-MEDICO_HORIZONTAL_COLOR.png"
              alt="IMD Centro Médico"
              className="h-10 brightness-0 invert opacity-90"
            />
            <span
              className={cn(
                'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest',
                cfg.heroChip,
              )}
            >
              <StatusIcon className="h-3 w-3" />
              {cfg.label}
            </span>
          </div>

          <div className="flex flex-col gap-8 sm:flex-row sm:items-end sm:justify-between">
            {/* Left: document identity */}
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.35em] text-white/35">
                Factura
              </p>
              <h1 className="mt-2 font-mono text-3xl font-black tracking-tight text-white sm:text-4xl">
                {invoice.invoice_number}
              </h1>
              <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-[13px] text-white/60">
                <span className="flex items-center gap-1.5">
                  <User className="h-3.5 w-3.5 shrink-0" />
                  {patientName}
                </span>
                {invoice.issued_at ? (
                  <span className="flex items-center gap-1.5">
                    <CalendarDays className="h-3.5 w-3.5 shrink-0" />
                    {format(new Date(invoice.issued_at), "d 'de' MMMM yyyy", { locale: es })}
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5 italic opacity-50">
                    <CalendarDays className="h-3.5 w-3.5 shrink-0" />
                    Pendiente de emisión
                  </span>
                )}
                {invoice.issuer && (
                  <span className="flex items-center gap-1.5">
                    <Receipt className="h-3.5 w-3.5 shrink-0" />
                    {invoice.issuer.name}
                  </span>
                )}
              </div>
            </div>

            {/* Right: total hero amount */}
            <div className="sm:text-right">
              <p className="text-[10px] font-bold uppercase tracking-[0.35em] text-white/35">
                Total factura
              </p>
              <div className="mt-1 flex items-baseline gap-2 sm:justify-end">
                <span className="font-mono text-4xl font-black tabular-nums text-white sm:text-5xl">
                  {fmtCurrency(invoice.total)}
                </span>
                <span className="text-2xl font-bold text-white/50">€</span>
              </div>
              {invoice.lines && (
                <p className="mt-1.5 text-[11px] text-white/35">
                  {invoice.lines.length} {invoice.lines.length === 1 ? 'concepto' : 'conceptos'}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Body: two-column document layout ─────────────────────────────── */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* ── Main content (2/3) ─────────────────────────────────────── */}
        <div className="space-y-5 lg:col-span-2">

          {/* Billing metadata */}
          <div className="overflow-hidden rounded-2xl border border-border bg-surface shadow-sm">
            <div className="border-b border-border-subtle px-6 py-4">
              <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-gray-400">
                Datos de la factura
              </p>
            </div>
            <div className="grid grid-cols-2 divide-x divide-border sm:grid-cols-4">
              <MetaCell icon={User}         label="Paciente"      value={patientName} />
              <MetaCell icon={Receipt}      label="Emitida por"   value={invoice.issuer?.name ?? '—'} />
              <MetaCell
                icon={CalendarDays}
                label="Fecha emisión"
                value={
                  invoice.issued_at
                    ? format(new Date(invoice.issued_at), 'dd/MM/yyyy', { locale: es })
                    : 'Pendiente'
                }
              />
              <MetaCell
                icon={CalendarDays}
                label="Fecha cobro"
                value={
                  invoice.paid_at
                    ? format(new Date(invoice.paid_at), 'dd/MM/yyyy', { locale: es })
                    : '—'
                }
              />
            </div>
          </div>

          {/* Reference clinic */}
          {invoice.reference_clinic && (
            <div className="flex items-center gap-4 overflow-hidden rounded-2xl border border-secondary-100 bg-gradient-to-r from-secondary-50/70 to-transparent px-5 py-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-secondary-100 text-secondary-500">
                <Building2 className="h-4.5 w-4.5" />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-secondary-400">
                  Clínica de referencia
                </p>
                <p className="mt-0.5 text-sm font-semibold text-secondary-700">
                  {invoice.reference_clinic}
                </p>
              </div>
            </div>
          )}

          {/* Invoice lines */}
          <div className="overflow-hidden rounded-2xl border border-border bg-surface shadow-sm">
            <div className="border-b border-border-subtle bg-surface-raised/60 px-6 py-4">
              <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-gray-400">
                Conceptos facturados
              </p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[520px] text-sm">
                <thead>
                  <tr className="bg-gradient-to-r from-secondary-600 via-secondary-500 to-secondary-400">
                    <th className="w-10 px-4 py-3.5 text-center">
                      <Hash className="mx-auto h-3 w-3 text-white/40" />
                    </th>
                    <th className="px-5 py-3.5 text-left text-[10px] font-bold uppercase tracking-wider text-white/70">
                      Concepto
                    </th>
                    <th className="px-5 py-3.5 text-right text-[10px] font-bold uppercase tracking-wider text-white/70">
                      Cant.
                    </th>
                    <th className="px-5 py-3.5 text-right text-[10px] font-bold uppercase tracking-wider text-white/70">
                      P. unit.
                    </th>
                    <th className="px-5 py-3.5 text-right text-[10px] font-bold uppercase tracking-wider text-white/70">
                      Total
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {invoice.lines?.map((line, idx) => (
                    <tr
                      key={line.id}
                      className={cn(
                        'transition-colors duration-100 hover:bg-primary-50/25',
                        idx % 2 === 1 && 'bg-surface-raised/40',
                      )}
                    >
                      <td className="px-4 py-4 text-center font-mono text-[10px] font-bold tabular-nums text-gray-300">
                        {String(idx + 1).padStart(2, '0')}
                      </td>
                      <td className="px-5 py-4 font-medium text-gray-800">
                        {line.description}
                      </td>
                      <td className="px-5 py-4 text-right tabular-nums text-gray-500">
                        {line.quantity}
                      </td>
                      <td className="px-5 py-4 text-right tabular-nums text-gray-500">
                        {fmtCurrency(line.unit_price)} €
                      </td>
                      <td className="px-5 py-4 text-right font-semibold tabular-nums text-gray-900">
                        {fmtCurrency(line.line_total)} €
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Totals breakdown — inside the lines card for document coherence */}
            <div className="border-t-2 border-border bg-surface-raised/50 px-6 py-5">
              <div className="ml-auto max-w-[280px] space-y-2.5">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Subtotal</span>
                  <span className="tabular-nums text-gray-700">
                    {fmtCurrency(invoice.subtotal)} €
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">IVA</span>
                  <span className="tabular-nums text-gray-400">
                    {tax > 0 ? `${fmtCurrency(tax)} €` : 'Exento'}
                  </span>
                </div>
                <div className="flex items-baseline justify-between border-t border-border pt-3">
                  <span className="text-base font-bold text-gray-900">Total</span>
                  <span className="font-mono text-2xl font-black tabular-nums text-primary-500">
                    {fmtCurrency(invoice.total)} €
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Notes */}
          {invoice.notes && (
            <div className="overflow-hidden rounded-2xl border border-border bg-surface shadow-sm">
              <div className="border-b border-border-subtle px-6 py-4">
                <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-gray-400">
                  Notas
                </p>
              </div>
              <div className="px-6 py-4">
                <p className="text-sm leading-relaxed text-gray-600">{invoice.notes}</p>
              </div>
            </div>
          )}

          {/* Legal & GDPR footer */}
          <div className="overflow-hidden rounded-2xl border border-gray-100 bg-gray-50/50 shadow-sm">
            <div className="px-6 py-5 space-y-4">
              <div className="flex items-center gap-3">
                <img
                  src="/resources/images/LOGO-IMD-CENTRO-MEDICO_HORIZONTAL_COLOR.png"
                  alt="IMD Centro Médico"
                  className="h-7 opacity-60"
                />
                <div className="h-4 w-px bg-gray-200" />
                <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                  Información legal
                </p>
              </div>
              <div className="space-y-2 text-[10px] leading-relaxed text-gray-400">
                <p>
                  IMD Centro Médico · CIF: B-XXXXXXXX · C/ Ejemplo, 123 · 46001 Valencia · Tel: 960 000 000
                </p>
                <p>
                  Centro sanitario autorizado por la Conselleria de Sanitat Universal i Salut Pública de la Generalitat Valenciana.
                  Los servicios médicos sanitarios están exentos de IVA según Art. 20.Uno.3º Ley 37/1992.
                </p>
                <p>
                  Protección de datos: Los datos personales recogidos en esta factura serán tratados de conformidad con el
                  Reglamento (UE) 2016/679 (RGPD) y la Ley Orgánica 3/2018 (LOPDGDD). Responsable: IMD Centro Médico.
                  Finalidad: gestión administrativa y facturación de servicios sanitarios. Conservación: durante el plazo legal
                  establecido. Puede ejercer sus derechos de acceso, rectificación, supresión, oposición, limitación y
                  portabilidad dirigiéndose a protecciondedatos@imdcentromedico.es.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ── Sidebar (1/3) ───────────────────────────────────────────── */}
        <div className="space-y-4 lg:sticky lg:top-6 lg:self-start">

          {/* Status card */}
          <div
            className={cn(
              'overflow-hidden rounded-2xl border shadow-sm',
              cfg.sidebarBorder,
              cfg.sidebarGradient,
            )}
          >
            <div className="p-5">
              <div className="flex items-center gap-3">
                <div
                  className={cn(
                    'flex h-11 w-11 shrink-0 items-center justify-center rounded-xl',
                    cfg.iconBg,
                  )}
                >
                  <StatusIcon className={cn('h-5 w-5', cfg.iconColor)} />
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-gray-400">
                    Estado
                  </p>
                  <p className={cn('mt-0.5 text-sm font-bold', cfg.textColor)}>
                    {cfg.label}
                  </p>
                </div>
              </div>
              {isPaid && invoice.paid_at && (
                <p className="mt-3 text-[11px] leading-relaxed text-gray-400">
                  Cobrada el{' '}
                  <span className="font-semibold text-gray-600">
                    {format(new Date(invoice.paid_at), "d 'de' MMMM yyyy", { locale: es })}
                  </span>
                </p>
              )}
            </div>
          </div>

          {/* Actions card */}
          <div className="overflow-hidden rounded-2xl border border-border bg-surface shadow-sm">
            <div className="border-b border-border-subtle px-5 py-4">
              <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-gray-400">
                Acciones
              </p>
            </div>
            <div className="space-y-2.5 p-4">
              {isDraft && (
                <Button className="w-full" onClick={handleIssueAndPrint} disabled={printing}>
                  <Printer className="h-4 w-4" />
                  {printing ? 'Generando…' : 'Emitir e imprimir'}
                </Button>
              )}
              {isDraft && (
                <Button
                  variant="secondary"
                  className="w-full"
                  onClick={() => setConfirmAction('issue')}
                >
                  <Check className="h-4 w-4" /> Emitir factura
                </Button>
              )}
              {(isIssued || isPaid) && (
                <>
                  <Button className="w-full" onClick={handlePrint} disabled={printing}>
                    <Printer className="h-4 w-4" />
                    {printing ? 'Generando…' : 'Imprimir'}
                  </Button>
                  <Button variant="secondary" className="w-full" onClick={handleDownloadPdf}>
                    <Download className="h-4 w-4" /> Descargar PDF
                  </Button>
                </>
              )}
              {isIssued && (
                <Button
                  variant="secondary"
                  className="w-full"
                  onClick={() => setConfirmAction('pay')}
                >
                  <CreditCard className="h-4 w-4" /> Registrar cobro
                </Button>
              )}
              {!isCancelled && !isPaid && (
                <div className="pt-1">
                  <Button
                    variant="destructive"
                    size="sm"
                    className="w-full"
                    onClick={() => setConfirmAction('cancel')}
                  >
                    <Ban className="h-3.5 w-3.5" /> Anular factura
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Document timeline */}
          <div className="overflow-hidden rounded-2xl border border-border bg-surface px-5 py-5 shadow-sm">
            <p className="mb-4 text-[10px] font-bold uppercase tracking-[0.22em] text-gray-400">
              Historial
            </p>
            <div>
              <TimelineEvent label="Creada"  date={invoice.created_at} />
              <TimelineEvent label="Emitida" date={invoice.issued_at} />
              <TimelineEvent label="Cobrada" date={invoice.paid_at} last />
            </div>
          </div>
        </div>
      </div>

      {/* ── Confirm dialogs ──────────────────────────────────────────────── */}
      <ConfirmDialog
        open={confirmAction === 'issue'}
        onClose={() => setConfirmAction(null)}
        onConfirm={() => issueMutation.mutate()}
        title="Emitir factura"
        message="¿Estás seguro de emitir esta factura? Se asignará fecha de emisión y número definitivo."
        confirmLabel="Emitir"
        loading={issueMutation.isPending}
      />
      <ConfirmDialog
        open={confirmAction === 'pay'}
        onClose={() => setConfirmAction(null)}
        onConfirm={() => payMutation.mutate()}
        title="Registrar cobro"
        message="¿Marcar esta factura como pagada?"
        confirmLabel="Cobrar"
        loading={payMutation.isPending}
      />
      <ConfirmDialog
        open={confirmAction === 'cancel'}
        onClose={() => setConfirmAction(null)}
        onConfirm={() => cancelMutation.mutate()}
        title="Anular factura"
        message="¿Estás seguro de anular esta factura? Esta acción no se puede deshacer."
        confirmLabel="Anular"
        destructive
        loading={cancelMutation.isPending}
      />
    </div>
  );
}

// ─── Sub-components ────────────────────────────────────────────────────────────

function MetaCell({
  icon: Icon,
  label,
  value,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
}) {
  return (
    <div className="px-6 py-4">
      <div className="mb-1.5 flex items-center gap-1.5">
        <Icon className="h-3 w-3 text-gray-300" />
        <dt className="text-[10px] font-bold uppercase tracking-[0.18em] text-gray-400">{label}</dt>
      </div>
      <dd className="text-sm font-medium leading-snug text-gray-900">{value}</dd>
    </div>
  );
}

function TimelineEvent({
  label,
  date,
  last = false,
}: {
  label: string;
  date: string | null | undefined;
  last?: boolean;
}) {
  const active = !!date;
  return (
    <div className="flex items-start gap-3">
      <div className="flex shrink-0 flex-col items-center">
        <div
          className={cn(
            'mt-0.5 h-2.5 w-2.5 rounded-full ring-2 ring-offset-2',
            active
              ? 'bg-primary-400 ring-primary-200'
              : 'bg-gray-200 ring-gray-100',
          )}
        />
        {!last && (
          <div
            className={cn('mt-1 min-h-6 w-px flex-1', active ? 'bg-primary-100' : 'bg-border')}
          />
        )}
      </div>
      <div className={cn('min-w-0', last ? 'pb-0' : 'pb-4')}>
        <p className={cn('text-xs font-semibold', active ? 'text-gray-800' : 'text-gray-400')}>
          {label}
        </p>
        {date ? (
          <p className="mt-0.5 text-[10px] text-gray-400">
            {format(new Date(date), 'd MMM yyyy', { locale: es })}
          </p>
        ) : (
          <p className="mt-0.5 text-[10px] text-gray-300">Pendiente</p>
        )}
      </div>
    </div>
  );
}
