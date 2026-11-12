import React, { useState } from 'react';
import { Patient } from '../types';
import { X, Save } from 'lucide-react';

interface NovoPacienteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddPatient: (patient: Patient) => void;
}

export const NovoPacienteModal: React.FC<NovoPacienteModalProps> = ({ isOpen, onClose, onAddPatient }) => {
  const [formData, setFormData] = useState({ name: '', recordNumber: '', age: 25, weight: 70, height: 1.70 });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-xl w-full max-w-md p-6 border border-slate-200 dark:border-slate-800">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-black text-slate-900 dark:text-white">Novo Paciente</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
        </div>
        
        <div className="space-y-4">
          <input type="text" placeholder="Nome Completo" className="w-full p-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800" onChange={e => setFormData({...formData, name: e.target.value})} />
          <input type="text" placeholder="Nº Prontuário" className="w-full p-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800" onChange={e => setFormData({...formData, recordNumber: e.target.value})} />
          
          <button 
            onClick={() => {
              onAddPatient({
                id: Date.now().toString(),
                name: formData.name,
                birthDate: new Date().toISOString().split('T')[0],
                recordNumber: formData.recordNumber,
                age: formData.age,
                currentWeightKg: formData.weight,
                initialWeightKg: formData.weight,
                heightCm: formData.height * 100,
                imc: formData.weight / (formData.height * formData.height),
                avatarInitials: formData.name.substring(0,2).toUpperCase() || 'P',
                unit: 'Central',
                sex: 'male',
                goal: 'Manutenção',
                lastAssessmentDate: 'Hoje'
              } as Patient);
              onClose();
            }}
            className="w-full py-3 bg-[#004f28] text-white rounded-lg font-bold flex items-center justify-center space-x-2 hover:bg-emerald-900"
          >
            <Save className="w-4 h-4" />
            <span>Salvar Paciente</span>
          </button>
        </div>
      </div>
    </div>
  );
};
