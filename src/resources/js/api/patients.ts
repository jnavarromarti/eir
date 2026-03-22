import client from './client';
import type { Patient, Paginated, CreatePatientPayload, UpdatePatientPayload, ClinicalRecord } from '@/types/patient';

export const patientsApi = {
  list(params?: { search?: string; is_active?: boolean; page?: number; sort?: string; direction?: 'asc' | 'desc' }) {
    return client.get<Paginated<Patient>>('/patients', { params });
  },

  get(id: string) {
    return client.get<Patient>(`/patients/${id}`);
  },

  create(payload: CreatePatientPayload) {
    return client.post<Patient>('/patients', payload);
  },

  update(id: string, payload: UpdatePatientPayload) {
    return client.put<Patient>(`/patients/${id}`, payload);
  },

  deactivate(id: string) {
    return client.delete(`/patients/${id}`);
  },

  activate(id: string) {
    return client.patch(`/patients/${id}/activate`);
  },

  // Clinical records
  listRecords(patientId: string) {
    return client.get<ClinicalRecord[]>(`/patients/${patientId}/clinical-records`);
  },

  getRecord(patientId: string, recordId: string) {
    return client.get<ClinicalRecord>(`/patients/${patientId}/clinical-records/${recordId}`);
  },

  createRecord(patientId: string, payload: Omit<ClinicalRecord, 'id' | 'patient_id' | 'created_at' | 'specialty' | 'practitioner'>) {
    return client.post<ClinicalRecord>(`/patients/${patientId}/clinical-records`, payload);
  },
};
