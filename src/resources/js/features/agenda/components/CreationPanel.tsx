import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { patientsApi } from '@/api/patients';
import { specialtiesApi } from '@/api/specialties';
import { servicesApi } from '@/api/services';
import { usersApi } from '@/api/users';
import { Select } from '@/components/ui/Select';
import { CalendarPlus, GripVertical, Clock, User, Stethoscope } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DragData {
  type: 'new';
  patientId: string;
  specialtyId: string;
  serviceId: string;
  practitionerId: string;
  durationMinutes: number;
  patientName: string;
  serviceName: string;
  practitionerName: string;
}

function DraggableCard({
  data,
  patientName,
  serviceName,
  practitionerName,
  durationMinutes,
}: {
  data: DragData;
  patientName: string;
  serviceName: string;
  practitionerName: string;
  durationMinutes: number;
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: 'new-appointment',
    data,
  });

  const style = transform ? { transform: CSS.Translate.toString(transform) } : undefined;

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      style={style}
      className={cn(
        'relative cursor-grab rounded-xl border border-primary-200/60 bg-white p-3 shadow-sm transition-all duration-200',
        'hover:shadow-md hover:border-primary-300/60',
        isDragging && 'opacity-40 shadow-xl ring-2 ring-primary-300/50 scale-[0.97]',
      )}
    >
      {/* Left accent bar */}
      <div className="absolute inset-y-2 left-0 w-1 rounded-full bg-gradient-to-b from-primary-400 to-primary-500" />

      <div className="flex items-start gap-2.5 pl-2">
        <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary-50 text-primary-400">
          <GripVertical className="h-3.5 w-3.5" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-gray-900">{patientName}</p>
          <div className="mt-1 flex items-center gap-1.5 text-[10px] text-gray-500">
            <User className="h-3 w-3 shrink-0" />
            <span className="truncate">{practitionerName}</span>
          </div>
          <div className="mt-0.5 flex items-center gap-1.5 text-[10px] text-gray-500">
            <Stethoscope className="h-3 w-3 shrink-0" />
            <span className="truncate">{serviceName}</span>
          </div>
          <div className="mt-1 flex items-center gap-1.5">
            <Clock className="h-3 w-3 text-primary-400" />
            <span className="text-[10px] font-semibold text-primary-500">{durationMinutes} min</span>
          </div>
        </div>
      </div>

      <p className="mt-2.5 text-center text-[10px] font-medium text-gray-400">
        Arrastra al calendario →
      </p>
    </div>
  );
}

export default function CreationPanel() {
  const [patientId, setPatientId] = useState('');
  const [specialtyId, setSpecialtyId] = useState('');
  const [serviceId, setServiceId] = useState('');
  const [practitionerId, setPractitionerId] = useState('');

  const { data: patients } = useQuery({
    queryKey: ['patients', 'select'],
    queryFn: () => patientsApi.list().then((r) => r.data.data),
  });

  const { data: specialties } = useQuery({
    queryKey: ['specialties'],
    queryFn: () => specialtiesApi.list().then((r) => r.data),
  });

  const { data: services } = useQuery({
    queryKey: ['services'],
    queryFn: () => servicesApi.list().then((r) => r.data),
  });

  const { data: users } = useQuery({
    queryKey: ['users'],
    queryFn: () => usersApi.list().then((r) => r.data),
  });

  // Filtrar servicios y profesionales por especialidad
  const filteredServices = services?.filter((s) => s.is_active && s.specialty_id === specialtyId) ?? [];
  const practitioners = users?.filter(
    (u) => u.is_active && u.role !== 'ADMIN' && u.role !== 'ADMINISTRATIVE' && u.specialty_id === specialtyId,
  ) ?? [];

  // Reset dependientes al cambiar especialidad
  const handleSpecialtyChange = (newId: string) => {
    setSpecialtyId(newId);
    setServiceId('');
    setPractitionerId('');
  };

  const selectedPatient = patients?.find((p) => p.id === patientId);
  const selectedSpecialty = specialties?.find((s) => s.id === specialtyId);
  const selectedService = services?.find((s) => s.id === serviceId);
  const selectedPractitioner = users?.find((u) => u.id === practitionerId);

  const allReady = selectedPatient && selectedSpecialty && selectedService && selectedPractitioner;

  return (
    <div className="w-64 shrink-0 space-y-3 overflow-y-auto rounded-2xl border border-border bg-surface p-4 shadow-sm">
      {/* Header */}
      <div className="flex items-center gap-2.5">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary-400 to-primary-500 shadow-sm shadow-primary-400/20">
          <CalendarPlus className="h-4 w-4 text-white" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-gray-900">Nueva cita</h3>
          <p className="text-[10px] text-gray-400">Configura y arrastra</p>
        </div>
      </div>

      <div className="h-px bg-gray-100" />

      <Select
        id="panel-patient"
        label="Paciente"
        placeholder="Seleccionar paciente"
        value={patientId}
        onChange={(e) => setPatientId(e.target.value)}
        options={patients?.map((p) => ({ value: p.id, label: `${p.first_name} ${p.last_name}` })) ?? []}
      />

      <Select
        id="panel-specialty"
        label="Especialidad"
        placeholder="Seleccionar especialidad"
        value={specialtyId}
        onChange={(e) => handleSpecialtyChange(e.target.value)}
        options={specialties?.map((s) => ({ value: s.id, label: s.name })) ?? []}
      />

      <Select
        id="panel-service"
        label="Servicio"
        placeholder={specialtyId ? 'Seleccionar servicio' : 'Elige especialidad'}
        value={serviceId}
        onChange={(e) => setServiceId(e.target.value)}
        options={filteredServices.map((s) => ({ value: s.id, label: `${s.name} (${s.duration_minutes} min)` }))}
        disabled={!specialtyId}
      />

      <Select
        id="panel-practitioner"
        label="Profesional"
        placeholder={specialtyId ? 'Seleccionar profesional' : 'Elige especialidad'}
        value={practitionerId}
        onChange={(e) => setPractitionerId(e.target.value)}
        options={practitioners.map((u) => ({ value: u.id, label: u.name }))}
        disabled={!specialtyId}
      />

      {allReady ? (
        <DraggableCard
          data={{
            type: 'new',
            patientId,
            specialtyId,
            serviceId,
            practitionerId,
            durationMinutes: selectedService.duration_minutes,
            patientName: `${selectedPatient.first_name} ${selectedPatient.last_name}`,
            serviceName: selectedService.name,
            practitionerName: selectedPractitioner.name,
          }}
          patientName={`${selectedPatient.first_name} ${selectedPatient.last_name}`}
          serviceName={selectedService.name}
          practitionerName={selectedPractitioner.name}
          durationMinutes={selectedService.duration_minutes}
        />
      ) : (
        <p className="text-center text-xs text-gray-400">
          Rellena todos los campos para arrastrar la cita al calendario
        </p>
      )}
    </div>
  );
}
