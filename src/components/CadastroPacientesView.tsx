import React, { useState } from 'react';
import { Patient } from '../types';
import { Users, Search, Plus, Trash2, Edit, ShieldAlert } from 'lucide-react';
import { NovoPacienteModal } from './NovoPacienteModal';

interface CadastroPacientesViewProps {
  patients: Patient[];
  onUpdatePatients: (patients: Patient[]) => void;
  privacyMode: boolean;
}

export const CadastroPacientesView: React.FC<CadastroPacientesViewProps> = ({
  patients,
  onUpdatePatients,
  privacyMode
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const filteredPatients = patients.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.recordNumber.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white">Cadastro de Pacientes</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">Gerenciamento centralizado de prontuários clínicos.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center space-x-2 bg-[#004f28] dark:bg-emerald-700 text-white px-4 py-2 rounded-lg font-bold text-sm hover:bg-emerald-900 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Novo Paciente</span>
        </button>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center bg-slate-50/50 dark:bg-slate-800">
          <Search className="w-4 h-4 text-slate-400 mr-2" />
          <input
            type="text"
            placeholder="Buscar por nome ou prontuário..."
            className="flex-1 bg-transparent border-none text-sm focus:outline-hidden dark:text-slate-200"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <table className="w-full text-sm">
          <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 uppercase font-bold text-[10px]">
            <tr>
              <th className="px-6 py-3 text-left">Prontuário</th>
              <th className="px-6 py-3 text-left">Nome</th>
              <th className="px-6 py-3 text-left">Status</th>
              <th className="px-6 py-3 text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {filteredPatients.map(p => (
              <tr key={p.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800">
                <td className="px-6 py-4 font-mono text-slate-600 dark:text-slate-400">{p.recordNumber}</td>
                <td className={`px-6 py-4 font-semibold text-slate-900 dark:text-slate-200 ${privacyMode ? 'filter blur-xs' : ''}`}>
                  {p.name}
                  {p.mebIndex !== undefined && p.mebIndex > 9.0 && (
                    <span className="ml-2 inline-flex items-center gap-1 text-[10px] font-bold text-red-600 bg-red-100 px-2 py-0.5 rounded-full" title={`MEB Elevado: ${p.mebIndex}%`}>
                      <ShieldAlert className="w-3 h-3" />
                      MEB {p.mebIndex}%
                    </span>
                  )}
                </td>
                <td className="px-6 py-4">
                  <span className="px-2 py-0.5 bg-emerald-100 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200 rounded text-[10px] font-bold uppercase">Ativo</span>
                </td>
                <td className="px-6 py-4 text-right space-x-2">
                  <button className="p-2 text-slate-400 hover:text-sky-600 transition-colors"><Edit className="w-4 h-4" /></button>
                  <button onClick={() => onUpdatePatients(patients.filter(pat => pat.id !== p.id))} className="p-2 text-slate-400 hover:text-red-600 transition-colors"><Trash2 className="w-4 h-4" /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <NovoPacienteModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onAddPatient={(p) => onUpdatePatients([...patients, p])}
      />
    </div>
  );
};
