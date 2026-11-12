/**
 * Full-Stack API Client for Clinical Nutrition SaaS
 * Interfaces seamlessly with Express backend (/api/*)
 * Supports offline-first reading, local edits, and automatic background queue sync via offlineSyncEngine
 */

import { Patient, AppSettings, Professional } from '../types';
import { PediatricMeasurement } from '../types/growth';
import { offlineSyncEngine } from './offlineSync';

export const apiClient = {
  // Check backend health
  async checkHealth(): Promise<{ status: string }> {
    try {
      const res = await fetch('/api/health');
      if (!res.ok) throw new Error('API offline');
      return await res.json();
    } catch {
      return { status: 'offline' };
    }
  },

  // Patients (Offline-first with local persistence and background sync queue)
  async getPatients(): Promise<Patient[]> {
    try {
      if (navigator.onLine) {
        const res = await fetch('/api/patients');
        if (res.ok) {
          const patients: Patient[] = await res.json();
          offlineSyncEngine.saveLocalPatients(patients);
          return patients;
        }
      }
    } catch (err) {
      console.warn('[API Client] Backend fetch failed, falling back to local cache:', err);
    }

    // Fallback to local cache if offline or fetch failed
    const local = offlineSyncEngine.getLocalPatients();
    if (local && local.length > 0) {
      return local;
    }

    throw new Error('Sem conexão com o servidor e nenhum cache local disponível.');
  },

  async createPatient(patient: Partial<Patient>): Promise<Patient> {
    const tempId = patient.id || `pat_off_${Date.now()}`;
    const fullPatient: Patient = {
      id: tempId,
      recordNumber: patient.recordNumber || `PR-${Math.floor(100000 + Math.random() * 900000)}`,
      name: patient.name || 'Novo Paciente',
      email: patient.email || '',
      phone: patient.phone || '',
      cpf: patient.cpf || '',
      birthDate: patient.birthDate || '1990-01-01',
      age: patient.age || 30,
      sex: patient.sex || 'female',
      currentWeightKg: patient.currentWeightKg || 70,
      initialWeightKg: patient.initialWeightKg || patient.currentWeightKg || 70,
      heightCm: patient.heightCm || 170,
      imc: patient.imc || 24.2,
      avatarInitials: patient.avatarInitials || (patient.name ? patient.name.slice(0, 2).toUpperCase() : 'NP'),
      goal: patient.goal || 'Hipertrofia e Saúde',
      lastAssessmentDate: patient.lastAssessmentDate || new Date().toISOString().split('T')[0],
      unit: patient.unit || 'Matriz',
      ...patient
    } as Patient;

    // Save locally immediately
    offlineSyncEngine.updateSingleLocalPatient(fullPatient);

    if (navigator.onLine) {
      try {
        const res = await fetch('/api/patients', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(patient)
        });
        if (res.ok) {
          const created: Patient = await res.json();
          offlineSyncEngine.updateSingleLocalPatient(created);
          return created;
        }
      } catch (err) {
        console.warn('[API Client] Server create failed, queuing offline mutation:', err);
      }
    }

    // Offline or server call failed -> Queue for background sync
    offlineSyncEngine.queueMutation('CREATE_PATIENT', patient, tempId);
    return fullPatient;
  },

  async updatePatient(id: string, updates: Partial<Patient>): Promise<Patient> {
    const localPatients = offlineSyncEngine.getLocalPatients() || [];
    const existing = localPatients.find(p => p.id === id);
    const updatedPatient: Patient = {
      ...(existing || {
        id,
        name: 'Paciente',
        email: '',
        phone: '',
        cpf: '',
        birthDate: '1990-01-01',
        age: 30,
        sex: 'female',
        currentWeightKg: 70,
        initialWeightKg: 70,
        heightCm: 170,
        imc: 24.2,
        avatarInitials: 'NP',
        recordNumber: 'PR-100000',
        goal: 'Manutenção',
        lastAssessmentDate: new Date().toISOString().split('T')[0],
        unit: 'Matriz'
      }),
      ...updates
    } as Patient;

    // Recalculate IMC if weight or height updated
    if (updates.currentWeightKg || updates.heightCm) {
      const w = updatedPatient.currentWeightKg;
      const hM = updatedPatient.heightCm / 100;
      if (hM > 0) updatedPatient.imc = Number((w / (hM * hM)).toFixed(1));
    }

    // Update local cache immediately so UI is 100% responsive
    offlineSyncEngine.updateSingleLocalPatient(updatedPatient);

    if (navigator.onLine) {
      try {
        const res = await fetch(`/api/patients/${encodeURIComponent(id)}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updates)
        });
        if (res.ok) {
          const serverUpdated: Patient = await res.json();
          offlineSyncEngine.updateSingleLocalPatient(serverUpdated);
          return serverUpdated;
        }
      } catch (err) {
        console.warn('[API Client] Server update failed, queuing offline mutation:', err);
      }
    }

    // Offline or server call failed -> Queue for background sync
    offlineSyncEngine.queueMutation('UPDATE_PATIENT', updates, id);
    return updatedPatient;
  },

  async deletePatient(id: string): Promise<void> {
    // Remove locally immediately
    offlineSyncEngine.removeSingleLocalPatient(id);

    if (navigator.onLine) {
      try {
        const res = await fetch(`/api/patients/${encodeURIComponent(id)}`, {
          method: 'DELETE'
        });
        if (res.ok) return;
      } catch (err) {
        console.warn('[API Client] Server delete failed, queuing offline mutation:', err);
      }
    }

    // Queue mutation if offline
    offlineSyncEngine.queueMutation('DELETE_PATIENT', { id }, id);
  },

  // Pediatric Measurements
  async addPediatricMeasurement(
    patientId: string,
    measurement: Partial<PediatricMeasurement>
  ): Promise<{ measurement: PediatricMeasurement; patient: Patient }> {
    const localPatients = offlineSyncEngine.getLocalPatients() || [];
    const existing = localPatients.find(p => p.id === patientId);

    const fullMeasurement: PediatricMeasurement = {
      id: measurement.id || `ped_off_${Date.now()}`,
      consultationDate: measurement.consultationDate || new Date().toISOString().split('T')[0],
      ageMonths: measurement.ageMonths || 0,
      ageDisplay: measurement.ageDisplay || `${measurement.ageMonths || 0} meses`,
      weightKg: measurement.weightKg || 0,
      heightCm: measurement.heightCm || 0,
      headCircumferenceCm: measurement.headCircumferenceCm,
      notes: measurement.notes || ''
    };

    let updatedPatient = existing;
    if (existing) {
      const pediatricMeasurements = [...(existing.pediatricMeasurements || []), fullMeasurement];
      updatedPatient = { ...existing, pediatricMeasurements };
      offlineSyncEngine.updateSingleLocalPatient(updatedPatient);
    }

    if (navigator.onLine) {
      try {
        const res = await fetch(`/api/patients/${encodeURIComponent(patientId)}/pediatric-measurements`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(measurement)
        });
        if (res.ok) {
          const result = await res.json();
          offlineSyncEngine.updateSingleLocalPatient(result.patient);
          return result;
        }
      } catch (err) {
        console.warn('[API Client] Server pediatric measurement failed, queuing offline mutation:', err);
      }
    }

    // Queue mutation for offline
    offlineSyncEngine.queueMutation('ADD_PEDIATRIC_MEASUREMENT', measurement, patientId);
    return {
      measurement: fullMeasurement,
      patient: updatedPatient!
    };
  },

  // Settings
  async getSettings(): Promise<AppSettings> {
    try {
      if (navigator.onLine) {
        const res = await fetch('/api/settings');
        if (res.ok) return await res.json();
      }
    } catch {
      // ignore
    }
    const saved = localStorage.getItem('nutripro_offline_settings');
    if (saved) return JSON.parse(saved);
    throw new Error('Falha ao carregar configurações.');
  },

  async updateSettings(settings: AppSettings): Promise<AppSettings> {
    localStorage.setItem('nutripro_offline_settings', JSON.stringify(settings));

    if (navigator.onLine) {
      try {
        const res = await fetch('/api/settings', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(settings)
        });
        if (res.ok) return await res.json();
      } catch {
        // queue offline
      }
    }
    offlineSyncEngine.queueMutation('UPDATE_SETTINGS', settings);
    return settings;
  },

  // Professionals & Team RBAC
  async getProfessionals(): Promise<Professional[]> {
    try {
      if (navigator.onLine) {
        const res = await fetch('/api/professionals');
        if (res.ok) return await res.json();
      }
    } catch {
      // ignore
    }
    const saved = localStorage.getItem('nutripro_offline_professionals');
    if (saved) return JSON.parse(saved);
    return [];
  },

  async createProfessional(prof: Partial<Professional>): Promise<Professional> {
    const res = await fetch('/api/professionals', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(prof)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Erro ao cadastrar profissional no servidor');
    }
    return await res.json();
  },

  async updateProfessional(id: string, updates: Partial<Professional>): Promise<Professional> {
    const res = await fetch(`/api/professionals/${encodeURIComponent(id)}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Erro ao atualizar profissional no servidor');
    }
    return await res.json();
  },

  async deleteProfessional(id: string): Promise<void> {
    const res = await fetch(`/api/professionals/${encodeURIComponent(id)}`, {
      method: 'DELETE'
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Erro ao excluir profissional no servidor');
    }
  },

  async getCurrentUser(): Promise<Professional | null> {
    try {
      const res = await fetch('/api/current-user');
      if (!res.ok) return null;
      return await res.json();
    } catch {
      return null;
    }
  },

  async switchCurrentUser(userId: string): Promise<Professional> {
    const res = await fetch('/api/current-user', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId })
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Erro ao alternar usuário ativo');
    }
    return await res.json();
  }
};
