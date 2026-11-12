import React, { useState } from 'react';
import { Professional, UserRole, RolePermissions, CouncilType } from '../types';
import { 
  DEFAULT_ROLE_PERMISSIONS, 
  ROLE_METADATA, 
  PERMISSION_DEFINITIONS, 
  getRolePermissions 
} from '../domain/permissions';
import { apiClient } from '../lib/api';
import {
  Users,
  UserPlus,
  ShieldCheck,
  ShieldAlert,
  Edit2,
  Trash2,
  CheckCircle2,
  XCircle,
  Stethoscope,
  Apple,
  Briefcase,
  KeyRound,
  Lock,
  Building2,
  Mail,
  Phone,
  Fingerprint,
  RotateCcw,
  Save,
  Check,
  AlertTriangle,
  Info,
  Calendar,
  Eye,
  FileText
} from 'lucide-react';

interface GestaoProfissionaisViewProps {
  professionals: Professional[];
  currentProfessional: Professional | null;
  onUpdateProfessionals: (list: Professional[]) => void;
  onSelectCurrentProfessional: (prof: Professional) => void;
}

export const GestaoProfissionaisView: React.FC<GestaoProfissionaisViewProps> = ({
  professionals,
  currentProfessional,
  onUpdateProfessionals,
  onSelectCurrentProfessional
}) => {
  const [activeTab, setActiveTab] = useState<'equipe' | 'novo' | 'matriz' | 'auditoria'>('equipe');
  const [filterRole, setFilterRole] = useState<string>('todos');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [editingProfId, setEditingProfId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [feedbackMessage, setFeedbackMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Form State
  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formCpf, setFormCpf] = useState('');
  const [formRole, setFormRole] = useState<UserRole>('nutricionista');
  const [formCouncilType, setFormCouncilType] = useState<CouncilType>('CRN');
  const [formRegCode, setFormRegCode] = useState('');
  const [formSpecialty, setFormSpecialty] = useState('');
  const [formUnit, setFormUnit] = useState('Clínica Jardins - SP');
  const [formIsActive, setFormIsActive] = useState<boolean>(true);
  const [formPermissions, setFormPermissions] = useState<RolePermissions>(DEFAULT_ROLE_PERMISSIONS.nutricionista);

  const resetForm = () => {
    setEditingProfId(null);
    setFormName('');
    setFormEmail('');
    setFormPhone('');
    setFormCpf('');
    setFormRole('nutricionista');
    setFormCouncilType('CRN');
    setFormRegCode('');
    setFormSpecialty('Nutrição Clínica & Esportiva');
    setFormUnit('Clínica Jardins - SP');
    setFormIsActive(true);
    setFormPermissions(DEFAULT_ROLE_PERMISSIONS.nutricionista);
  };

  const handleRoleChange = (newRole: UserRole) => {
    setFormRole(newRole);
    const meta = ROLE_METADATA[newRole] || ROLE_METADATA.nutricionista;
    setFormCouncilType(meta.councilName);
    
    // Auto-suggest specialty based on role
    if (newRole === 'nutricionista') {
      setFormSpecialty('Nutrição Clínica & Esportiva');
      if (!formRegCode.startsWith('CRN')) setFormRegCode('CRN-3 ');
    } else if (newRole === 'medico') {
      setFormSpecialty('Nutrologia & Medicina do Esporte');
      if (!formRegCode.startsWith('CRM')) setFormRegCode('CRM-SP ');
    } else if (newRole === 'recepcionista') {
      setFormSpecialty('Atendimento, Triagem & Recepção');
      if (!formRegCode.startsWith('REC')) setFormRegCode('REC-2024-');
    } else if (newRole === 'adm') {
      setFormSpecialty('Direção Clínica & Governança Geral');
      if (!formRegCode.startsWith('ADM')) setFormRegCode('ADM-');
    }

    // Apply default role permissions
    setFormPermissions({ ...getRolePermissions(newRole) });
  };

  const handleStartEdit = (prof: Professional) => {
    setEditingProfId(prof.id);
    setFormName(prof.name);
    setFormEmail(prof.email);
    setFormPhone(prof.phone || '');
    setFormCpf(prof.cpf || '');
    setFormRole(prof.role);
    setFormCouncilType(prof.councilType);
    setFormRegCode(prof.registrationCode);
    setFormSpecialty(prof.specialty);
    setFormUnit(prof.unit);
    setFormIsActive(prof.isActive);
    setFormPermissions({ ...prof.permissions });
    setActiveTab('novo');
  };

  const handleTogglePermission = (key: keyof RolePermissions) => {
    setFormPermissions(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleResetToRoleDefaults = () => {
    setFormPermissions({ ...getRolePermissions(formRole) });
  };

  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setFeedbackMessage(null);

    const initials = formName
      .split(' ')
      .filter(Boolean)
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2) || 'PR';

    if (editingProfId) {
      // Update existing professional
      const updated: Professional = {
        id: editingProfId,
        name: formName,
        email: formEmail,
        phone: formPhone,
        cpf: formCpf,
        role: formRole,
        councilType: formCouncilType,
        registrationCode: formRegCode,
        specialty: formSpecialty,
        unit: formUnit,
        isActive: formIsActive,
        admissionDate: professionals.find(p => p.id === editingProfId)?.admissionDate || new Date().toISOString().split('T')[0],
        permissions: formPermissions,
        avatarInitials: initials
      };

      try {
        await apiClient.updateProfessional(editingProfId, updated);
      } catch (err) {
        console.warn('[Sync API] Stored locally:', err);
      }

      const updatedList = professionals.map(p => p.id === editingProfId ? updated : p);
      onUpdateProfessionals(updatedList);
      if (currentProfessional?.id === editingProfId) {
        onSelectCurrentProfessional(updated);
      }

      setFeedbackMessage({ type: 'success', text: `Profissional "${updated.name}" atualizado com sucesso!` });
      resetForm();
      setActiveTab('equipe');
    } else {
      // Create new professional
      const newProf: Professional = {
        id: `prof-${Date.now()}`,
        name: formName,
        email: formEmail,
        phone: formPhone,
        cpf: formCpf,
        role: formRole,
        councilType: formCouncilType,
        registrationCode: formRegCode,
        specialty: formSpecialty,
        unit: formUnit,
        isActive: formIsActive,
        admissionDate: new Date().toISOString().split('T')[0],
        permissions: formPermissions,
        avatarInitials: initials
      };

      try {
        await apiClient.createProfessional(newProf);
      } catch (err) {
        console.warn('[Sync API] Stored locally:', err);
      }

      const updatedList = [...professionals, newProf];
      onUpdateProfessionals(updatedList);
      setFeedbackMessage({ type: 'success', text: `Profissional "${newProf.name}" cadastrado com sucesso com perfil de ${ROLE_METADATA[formRole]?.label || formRole}!` });
      resetForm();
      setActiveTab('equipe');
    }

    setIsSaving(false);
  };

  const handleToggleStatus = async (prof: Professional) => {
    // If trying to deactivate the only active ADM, block it
    if (prof.isActive && (prof.role === 'adm' || prof.role === 'admin')) {
      const activeAdms = professionals.filter(p => (p.role === 'adm' || p.role === 'admin') && p.isActive && p.id !== prof.id);
      if (activeAdms.length === 0) {
        alert('Ação bloqueada: A clínica deve manter pelo menos um Administrador (ADM) ativo no sistema.');
        return;
      }
    }

    const updated = { ...prof, isActive: !prof.isActive };
    try {
      await apiClient.updateProfessional(prof.id, updated);
    } catch (err) {
      console.warn('[Sync API] Updated locally:', err);
    }

    const updatedList = professionals.map(p => p.id === prof.id ? updated : p);
    onUpdateProfessionals(updatedList);
    if (currentProfessional?.id === prof.id) {
      onSelectCurrentProfessional(updated);
    }
  };

  const handleDelete = async (prof: Professional) => {
    if (prof.role === 'adm' || prof.role === 'admin') {
      const remainingAdms = professionals.filter(p => (p.role === 'adm' || p.role === 'admin') && p.id !== prof.id);
      if (remainingAdms.length === 0) {
        alert('Ação bloqueada: Não é permitido excluir o único Administrador (ADM) da clínica.');
        return;
      }
    }

    if (!confirm(`Tem certeza que deseja remover o profissional ${prof.name} (${prof.registrationCode})? Esta ação revogará todos os acessos.`)) {
      return;
    }

    try {
      await apiClient.deleteProfessional(prof.id);
    } catch (err: any) {
      alert(err.message || 'Erro ao excluir profissional');
      return;
    }

    const updatedList = professionals.filter(p => p.id !== prof.id);
    onUpdateProfessionals(updatedList);
    if (currentProfessional?.id === prof.id && updatedList.length > 0) {
      onSelectCurrentProfessional(updatedList[0]);
    }
  };

  const handleSwitchSession = async (prof: Professional) => {
    onSelectCurrentProfessional(prof);
    try {
      await apiClient.switchCurrentUser(prof.id);
    } catch (err) {
      console.warn('[Session Switch] Stored locally:', err);
    }
  };

  // Filtered Professionals
  const filteredProfessionals = professionals.filter(p => {
    const matchesRole = filterRole === 'todos' || p.role === filterRole;
    const matchesSearch = 
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.registrationCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.specialty.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesRole && matchesSearch;
  });

  // Role Counts
  const counts = {
    total: professionals.length,
    nutri: professionals.filter(p => p.role === 'nutricionista').length,
    medico: professionals.filter(p => p.role === 'medico').length,
    recep: professionals.filter(p => p.role === 'recepcionista' || p.role === 'secretaria').length,
    adm: professionals.filter(p => p.role === 'adm' || p.role === 'admin').length,
    ativos: professionals.filter(p => p.isActive).length
  };

  return (
    <div className="space-y-4 sm:space-y-6 max-w-7xl mx-auto pb-8 animate-in fade-in duration-300">
      
      {/* Feedback Banner */}
      {feedbackMessage && (
        <div className={`p-4 rounded-xl border flex items-center justify-between gap-3 ${
          feedbackMessage.type === 'success' 
            ? 'bg-emerald-50 border-emerald-300 text-emerald-900' 
            : 'bg-rose-50 border-rose-300 text-rose-900'
        }`}>
          <div className="flex items-center gap-2">
            {feedbackMessage.type === 'success' ? <CheckCircle2 className="w-5 h-5 text-emerald-600" /> : <AlertTriangle className="w-5 h-5 text-rose-600" />}
            <span className="text-sm font-semibold">{feedbackMessage.text}</span>
          </div>
          <button 
            onClick={() => setFeedbackMessage(null)}
            className="text-xs font-bold uppercase underline tracking-wider opacity-80 hover:opacity-100"
          >
            Fechar
          </button>
        </div>
      )}

      {/* Header Clínico & Gestão de Acessos */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-[#004f28] flex items-center justify-center border border-emerald-200 shrink-0">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                Cadastro de Profissionais & Permissões
              </h2>
              <span className="text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded-full border border-slate-200">
                RBAC Clínico
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Controle de acesso por função: <strong>Nutricionista (CRN)</strong>, <strong>Médico (CRM)</strong>, <strong>Recepcionista (LGPD Shield)</strong> e <strong>Administrador (ADM)</strong>.
            </p>
          </div>
        </div>

        {/* Simulador de Sessão Ativa */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600">Sessão Ativa:</span>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={currentProfessional?.id || ''}
              onChange={(e) => {
                const found = professionals.find(p => p.id === e.target.value);
                if (found) handleSwitchSession(found);
              }}
              className="px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-800 shadow-2xs focus:ring-2 focus:ring-[#004f28] outline-none"
            >
              {professionals.map(p => {
                const meta = ROLE_METADATA[p.role] || ROLE_METADATA.nutricionista;
                return (
                  <option key={p.id} value={p.id}>
                    {p.name} — [{meta.shortLabel}]
                  </option>
                );
              })}
            </select>

            {currentProfessional && (
              <span className={`text-[10px] font-bold px-2 py-1 rounded-md border shrink-0 ${
                ROLE_METADATA[currentProfessional.role]?.badgeBg || 'bg-slate-100 text-slate-800'
              }`}>
                {ROLE_METADATA[currentProfessional.role]?.shortLabel || currentProfessional.role}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Banner Informativo do Papel Ativo */}
      {currentProfessional && (
        <div className={`p-4 rounded-xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
          ROLE_METADATA[currentProfessional.role]?.badgeBg || 'bg-slate-50 text-slate-800'
        }`}>
          <div className="flex items-start sm:items-center gap-3">
            <div className="p-2 rounded-lg bg-white/80 border border-current shadow-2xs shrink-0">
              {currentProfessional.role === 'nutricionista' && <Apple className="w-5 h-5 text-[#004f28]" />}
              {currentProfessional.role === 'medico' && <Stethoscope className="w-5 h-5 text-[#1e3a8a]" />}
              {(currentProfessional.role === 'recepcionista' || currentProfessional.role === 'secretaria') && <Briefcase className="w-5 h-5 text-[#b45309]" />}
              {(currentProfessional.role === 'adm' || currentProfessional.role === 'admin') && <KeyRound className="w-5 h-5 text-[#4c1d95]" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider">
                  Você está navegando como: {currentProfessional.name}
                </span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white/70 border border-current font-bold">
                  {currentProfessional.registrationCode}
                </span>
              </div>
              <p className="text-xs mt-0.5 opacity-90">
                {ROLE_METADATA[currentProfessional.role]?.description}
              </p>
            </div>
          </div>

          <div className="text-[11px] font-mono font-bold bg-white/70 px-3 py-1.5 rounded-lg border border-current shrink-0">
            {ROLE_METADATA[currentProfessional.role]?.lgpdScope}
          </div>
        </div>
      )}

      {/* Cards de Métricas e Distribuição dos 4 Papéis */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-white rounded-xl border border-slate-200 p-3.5 shadow-2xs">
          <span className="text-[10px] uppercase font-bold text-slate-500 block">Total Equipe</span>
          <span className="text-2xl font-black text-slate-900 tabular-nums">{counts.total}</span>
          <span className="text-[10px] text-slate-400 block mt-0.5">{counts.ativos} ativos</span>
        </div>

        <div className="bg-white rounded-xl border border-emerald-200/80 p-3.5 shadow-2xs bg-emerald-50/20">
          <span className="text-[10px] uppercase font-bold text-emerald-800 block flex items-center gap-1">
            <Apple className="w-3 h-3 text-emerald-700" /> Nutricionistas
          </span>
          <span className="text-2xl font-black text-emerald-950 tabular-nums">{counts.nutri}</span>
          <span className="text-[10px] text-emerald-700 block mt-0.5">CRN Habilitado</span>
        </div>

        <div className="bg-white rounded-xl border border-blue-200/80 p-3.5 shadow-2xs bg-blue-50/20">
          <span className="text-[10px] uppercase font-bold text-blue-800 block flex items-center gap-1">
            <Stethoscope className="w-3 h-3 text-blue-700" /> Médicos
          </span>
          <span className="text-2xl font-black text-blue-950 tabular-nums">{counts.medico}</span>
          <span className="text-[10px] text-blue-700 block mt-0.5">CRM Habilitado</span>
        </div>

        <div className="bg-white rounded-xl border border-amber-200/80 p-3.5 shadow-2xs bg-amber-50/20">
          <span className="text-[10px] uppercase font-bold text-amber-800 block flex items-center gap-1">
            <Briefcase className="w-3 h-3 text-amber-700" /> Recepção
          </span>
          <span className="text-2xl font-black text-amber-950 tabular-nums">{counts.recep}</span>
          <span className="text-[10px] text-amber-700 block mt-0.5">LGPD Shield</span>
        </div>

        <div className="bg-white rounded-xl border border-purple-200/80 p-3.5 shadow-2xs bg-purple-50/20">
          <span className="text-[10px] uppercase font-bold text-purple-800 block flex items-center gap-1">
            <KeyRound className="w-3 h-3 text-purple-700" /> ADMs
          </span>
          <span className="text-2xl font-black text-purple-950 tabular-nums">{counts.adm}</span>
          <span className="text-[10px] text-purple-700 block mt-0.5">Governança Total</span>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-3.5 shadow-2xs flex flex-col justify-center">
          <span className="text-[10px] uppercase font-bold text-slate-500 block">Conformidade</span>
          <span className="text-xs font-bold text-emerald-700 flex items-center gap-1 mt-1">
            <ShieldCheck className="w-4 h-4 text-emerald-600" /> CFN / CFM / LGPD
          </span>
          <span className="text-[10px] text-slate-400 block mt-0.5">100% Auditável</span>
        </div>
      </div>

      {/* Navegação entre Abas do Módulo */}
      <div className="flex border-b border-slate-200 bg-white rounded-t-xl px-2 sm:px-4 pt-3 space-x-1 sm:space-x-2 overflow-x-auto custom-scrollbar flex-nowrap shrink-0 whitespace-nowrap">
        <button
          onClick={() => {
            setActiveTab('equipe');
            setEditingProfId(null);
          }}
          className={`pb-3 px-3 sm:px-4 text-xs font-bold flex items-center gap-1.5 sm:gap-2 border-b-2 shrink-0 whitespace-nowrap transition-all ${
            activeTab === 'equipe'
              ? 'border-[#004f28] text-[#004f28]'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Equipe ({counts.total})</span>
        </button>

        <button
          onClick={() => {
            if (!editingProfId) resetForm();
            setActiveTab('novo');
          }}
          className={`pb-3 px-3 sm:px-4 text-xs font-bold flex items-center gap-1.5 sm:gap-2 border-b-2 shrink-0 whitespace-nowrap transition-all ${
            activeTab === 'novo'
              ? 'border-[#004f28] text-[#004f28]'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <UserPlus className="w-4 h-4" />
          <span>{editingProfId ? 'Editar Profissional' : '+ Novo Cadastro'}</span>
        </button>

        <button
          onClick={() => setActiveTab('matriz')}
          className={`pb-3 px-3 sm:px-4 text-xs font-bold flex items-center gap-1.5 sm:gap-2 border-b-2 shrink-0 whitespace-nowrap transition-all ${
            activeTab === 'matriz'
              ? 'border-[#004f28] text-[#004f28]'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <KeyRound className="w-4 h-4" />
          <span>Matriz de Permissões</span>
        </button>

        <button
          onClick={() => setActiveTab('auditoria')}
          className={`pb-3 px-3 sm:px-4 text-xs font-bold flex items-center gap-1.5 sm:gap-2 border-b-2 shrink-0 whitespace-nowrap transition-all ${
            activeTab === 'auditoria'
              ? 'border-[#004f28] text-[#004f28]'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Lock className="w-4 h-4" />
          <span>Segurança & LGPD</span>
        </button>
      </div>

      {/* ABA 1: LISTA DE PROFISSIONAIS */}
      {activeTab === 'equipe' && (
        <div className="bg-white rounded-b-xl border border-t-0 border-slate-200 p-5 shadow-xs space-y-4">
          
          {/* Barra de Filtros e Busca */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-[11px] font-bold uppercase text-slate-500 mr-1">Filtrar:</span>
              {[
                { id: 'todos', label: 'Todos' },
                { id: 'nutricionista', label: 'Nutricionistas' },
                { id: 'medico', label: 'Médicos' },
                { id: 'recepcionista', label: 'Recepcionistas' },
                { id: 'adm', label: 'ADMs' }
              ].map(f => (
                <button
                  key={f.id}
                  onClick={() => setFilterRole(f.id)}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                    filterRole === f.id
                      ? 'bg-[#004f28] text-white shadow-2xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <input
                type="text"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                placeholder="Buscar por nome, registro ou cargo..."
                className="px-3 py-1.5 border border-slate-200 rounded-lg text-xs w-full sm:w-64 focus:ring-2 focus:ring-[#004f28] outline-none"
              />
              <button
                onClick={() => {
                  resetForm();
                  setActiveTab('novo');
                }}
                className="px-3.5 py-1.5 bg-[#004f28] text-white rounded-lg text-xs font-bold hover:bg-[#003b1e] transition-colors flex items-center gap-1.5 shrink-0 shadow-2xs"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Adicionar</span>
              </button>
            </div>
          </div>

          {/* Cards & Tabela de Profissionais */}
          <div className="space-y-3">
            {filteredProfessionals.length === 0 ? (
              <div className="p-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200">
                <Users className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                <p className="text-sm font-semibold text-slate-700">Nenhum profissional encontrado com os filtros atuais.</p>
                <button
                  onClick={() => { setFilterRole('todos'); setSearchTerm(''); }}
                  className="mt-2 text-xs font-bold text-[#004f28] underline"
                >
                  Limpar filtros
                </button>
              </div>
            ) : (
              filteredProfessionals.map(prof => {
                const meta = ROLE_METADATA[prof.role] || ROLE_METADATA.nutricionista;
                const isCurrent = currentProfessional?.id === prof.id;

                return (
                  <div
                    key={prof.id}
                    className={`p-4 rounded-xl border transition-all ${
                      isCurrent
                        ? 'bg-emerald-50/30 border-emerald-300 ring-1 ring-emerald-200 shadow-xs'
                        : 'bg-white border-slate-200 hover:border-slate-300 shadow-2xs'
                    }`}
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      
                      {/* Avatar & Identificação Principal */}
                      <div className="flex items-start sm:items-center gap-3.5">
                        <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-sm font-black border shrink-0 ${
                          meta.badgeBg
                        }`}>
                          {prof.avatarInitials || prof.name.slice(0, 2).toUpperCase()}
                        </div>

                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="text-sm sm:text-base font-bold text-slate-900">
                              {prof.name}
                            </h3>

                            {/* Badge do Papel (Nutricionista, Médico, Recepcionista, ADM) */}
                            <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${meta.badgeBg}`}>
                              {meta.shortLabel}
                            </span>

                            {/* Status Ativo/Inativo */}
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                              prof.isActive 
                                ? 'bg-emerald-50 text-emerald-800 border-emerald-200' 
                                : 'bg-slate-100 text-slate-500 border-slate-200'
                            }`}>
                              {prof.isActive ? 'Ativo' : 'Inativo'}
                            </span>

                            {isCurrent && (
                              <span className="text-[10px] font-bold uppercase bg-slate-900 text-white px-2 py-0.5 rounded-full shadow-2xs">
                                Sua Sessão
                              </span>
                            )}
                          </div>

                          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-xs text-slate-500">
                            <span className="font-mono font-semibold text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                              {prof.registrationCode}
                            </span>
                            <span>• {prof.specialty}</span>
                            <span>• {prof.unit}</span>
                            <span>• Desde {prof.admissionDate}</span>
                          </div>
                        </div>
                      </div>

                      {/* Resumo de Contato & Permissões */}
                      <div className="flex flex-wrap items-center gap-2 text-xs">
                        <div className="hidden xl:flex flex-col text-right mr-2 text-[11px] text-slate-500">
                          <span>{prof.email}</span>
                          <span className="font-mono">{prof.phone || 'Sem telefone'}</span>
                        </div>

                        {/* Botão de Alternar Sessão Simulada */}
                        {!isCurrent && (
                          <button
                            onClick={() => handleSwitchSession(prof)}
                            title="Alternar sessão ativa para testar visão deste usuário"
                            className="px-2.5 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-semibold flex items-center gap-1 transition-colors"
                          >
                            <Eye className="w-3.5 h-3.5 text-slate-500" />
                            <span>Simular Visão</span>
                          </button>
                        )}

                        {/* Toggle Status Ativo/Inativo */}
                        <button
                          onClick={() => handleToggleStatus(prof)}
                          title={prof.isActive ? 'Desativar acesso deste profissional' : 'Reativar acesso'}
                          className={`p-1.5 rounded-lg border text-xs font-bold transition-colors ${
                            prof.isActive 
                              ? 'text-emerald-700 border-emerald-200 hover:bg-emerald-50' 
                              : 'text-slate-400 border-slate-200 hover:bg-slate-100'
                          }`}
                        >
                          {prof.isActive ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <XCircle className="w-4 h-4 text-slate-400" />}
                        </button>

                        {/* Editar */}
                        <button
                          onClick={() => handleStartEdit(prof)}
                          className="px-2.5 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-semibold flex items-center gap-1 transition-colors"
                        >
                          <Edit2 className="w-3.5 h-3.5 text-slate-500" />
                          <span>Editar & Permissões</span>
                        </button>

                        {/* Excluir */}
                        <button
                          onClick={() => handleDelete(prof)}
                          className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 border border-transparent hover:border-rose-200 transition-colors"
                          title="Excluir profissional"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                    </div>

                    {/* Chips de Permissões Rápidas */}
                    <div className="mt-3 pt-3 border-t border-slate-100 flex flex-wrap items-center gap-1.5 text-[11px]">
                      <span className="text-[10px] font-bold uppercase text-slate-400 mr-1">Permissões:</span>
                      
                      {prof.permissions.canAccessClinicalRecords ? (
                        <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 font-medium">Prontuário Clínico</span>
                      ) : (
                        <span className="px-2 py-0.5 rounded bg-rose-50 text-rose-800 border border-rose-200 font-medium">Prontuário Bloqueado (LGPD)</span>
                      )}

                      {prof.permissions.canPrescribeDiets && (
                        <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 font-medium">Prescrição Dietas/Macros</span>
                      )}

                      {prof.permissions.canPerformAnthropometry && (
                        <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 font-medium">Antropometria ISAK/BIA</span>
                      )}

                      {prof.permissions.canManageGrowthCharts && (
                        <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 font-medium">Curvas OMS/SISVAN</span>
                      )}

                      {prof.permissions.canRequestExams && (
                        <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-800 border border-blue-200 font-medium">Requisição de Exames</span>
                      )}

                      {prof.permissions.canPrescribeMedicalExclusive && (
                        <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-900 border border-blue-300 font-bold">Prescrição Médica Exclusiva</span>
                      )}

                      {prof.permissions.canManageAppointments && (
                        <span className="px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200 font-medium">Agenda & Atendimento</span>
                      )}

                      {prof.permissions.canManageProfessionals && (
                        <span className="px-2 py-0.5 rounded bg-purple-50 text-purple-800 border border-purple-200 font-bold">Gestão de Equipe (ADM)</span>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* ABA 2: FORMULÁRIO DE NOVO CADASTRO OU EDIÇÃO */}
      {activeTab === 'novo' && (
        <div className="bg-white rounded-b-xl border border-t-0 border-slate-200 p-6 shadow-xs animate-in fade-in duration-200">
          <div className="flex items-center justify-between pb-4 mb-6 border-b border-slate-100">
            <div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
                {editingProfId ? <Edit2 className="w-5 h-5 text-[#004f28]" /> : <UserPlus className="w-5 h-5 text-[#004f28]" />}
                {editingProfId ? 'Editar Cadastro & Permissões do Profissional' : 'Novo Cadastro de Profissional'}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Preencha os dados de identificação profissional e personalize a matriz de permissões (RBAC).
              </p>
            </div>

            {editingProfId && (
              <button
                type="button"
                onClick={resetForm}
                className="text-xs text-slate-600 hover:text-slate-900 font-semibold px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50"
              >
                Cancelar Edição
              </button>
            )}
          </div>

          <form onSubmit={handleSubmitForm} className="space-y-6">
            
            {/* 1. SELEÇÃO DA FUNÇÃO / PAPEL CLÍNICO */}
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-2 uppercase tracking-wider">
                1. Selecione a Função / Perfil Clínico:
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {[
                  {
                    role: 'nutricionista' as UserRole,
                    title: 'Nutricionista',
                    badge: 'CRN',
                    desc: 'Prescrição dietética, Escore-Z, Antropometria, Exames CFN 702/2021 e Suplementos.',
                    icon: Apple,
                    borderActive: 'border-emerald-500 bg-emerald-50/50 ring-2 ring-emerald-300'
                  },
                  {
                    role: 'medico' as UserRole,
                    title: 'Médico',
                    badge: 'CRM',
                    desc: 'Prescrição médica ampla, exames TUSS/SUS, suplementação hormonal e diagnósticos.',
                    icon: Stethoscope,
                    borderActive: 'border-blue-500 bg-blue-50/50 ring-2 ring-blue-300'
                  },
                  {
                    role: 'recepcionista' as UserRole,
                    title: 'Recepcionista',
                    badge: 'Recepção / LGPD',
                    desc: 'Agenda, confirmações WhatsApp e cadastro de pacientes. Bloqueio de prontuário.',
                    icon: Briefcase,
                    borderActive: 'border-amber-500 bg-amber-50/50 ring-2 ring-amber-300'
                  },
                  {
                    role: 'adm' as UserRole,
                    title: 'Administrador (ADM)',
                    badge: 'Diretoria / Gestão',
                    desc: 'Acesso total, gestão da equipe, permissões, governança e exclusão auditada.',
                    icon: KeyRound,
                    borderActive: 'border-purple-500 bg-purple-50/50 ring-2 ring-purple-300'
                  }
                ].map(item => {
                  const Icon = item.icon;
                  const isSelected = formRole === item.role;
                  return (
                    <div
                      key={item.role}
                      onClick={() => handleRoleChange(item.role)}
                      className={`p-4 rounded-xl border cursor-pointer transition-all ${
                        isSelected 
                          ? item.borderActive 
                          : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className={`p-1.5 rounded-lg ${isSelected ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-700'}`}>
                            <Icon className="w-4 h-4" />
                          </div>
                          <span className="text-sm font-bold text-slate-900">{item.title}</span>
                        </div>
                        <span className="text-[10px] font-mono font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md border border-slate-200">
                          {item.badge}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 leading-relaxed">{item.desc}</p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 2. DADOS CADASTRAIS DO PROFISSIONAL */}
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-2 uppercase tracking-wider">
                2. Dados Pessoais & Registro de Conselho:
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-600 block mb-1">Nome Completo</label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={e => setFormName(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-[#004f28] outline-none"
                    placeholder="Ex: Dra. Mariana Costa Santos"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-600 block mb-1">E-mail Institucional</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="email"
                      required
                      value={formEmail}
                      onChange={e => setFormEmail(e.target.value)}
                      className="w-full pl-10 pr-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-[#004f28] outline-none"
                      placeholder="profissional@nutritrack.com"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-600 block mb-1">Telefone / WhatsApp</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="tel"
                      value={formPhone}
                      onChange={e => setFormPhone(e.target.value)}
                      className="w-full pl-10 pr-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-[#004f28] outline-none"
                      placeholder="(11) 98765-4321"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-600 block mb-1">CPF</label>
                  <div className="relative">
                    <Fingerprint className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      value={formCpf}
                      onChange={e => setFormCpf(e.target.value)}
                      className="w-full pl-10 pr-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-[#004f28] outline-none"
                      placeholder="000.000.000-00"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-600 block mb-1">
                    Tipo de Conselho / Registro
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    <select
                      value={formCouncilType}
                      onChange={e => setFormCouncilType(e.target.value as CouncilType)}
                      className="px-2 py-2 border border-slate-200 rounded-lg text-xs bg-white focus:ring-2 focus:ring-[#004f28] outline-none font-bold"
                    >
                      <option value="CRN">CRN</option>
                      <option value="CRM">CRM</option>
                      <option value="MATRICULA">Matrícula</option>
                      <option value="OUTRO">Outro</option>
                    </select>

                    <input
                      type="text"
                      required
                      value={formRegCode}
                      onChange={e => setFormRegCode(e.target.value)}
                      className="col-span-2 px-3 py-2 border border-slate-200 rounded-lg text-sm font-mono focus:ring-2 focus:ring-[#004f28] outline-none"
                      placeholder={ROLE_METADATA[formRole]?.councilPlaceholder || 'Ex: CRN-3 12345'}
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-600 block mb-1">Especialidade / Cargo</label>
                  <input
                    type="text"
                    required
                    value={formSpecialty}
                    onChange={e => setFormSpecialty(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-[#004f28] outline-none"
                    placeholder="Ex: Nutrição Esportiva & Fitoterapia"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-600 block mb-1">Unidade Padrão</label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      value={formUnit}
                      onChange={e => setFormUnit(e.target.value)}
                      className="w-full pl-10 pr-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-[#004f28] outline-none"
                      placeholder="Clínica Jardins - SP"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-600 block mb-1">Status do Acesso</label>
                  <div className="flex items-center gap-3 h-10">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="isActive"
                        checked={formIsActive}
                        onChange={() => setFormIsActive(true)}
                        className="text-[#004f28] focus:ring-[#004f28]"
                      />
                      <span className="text-xs font-bold text-emerald-800">Ativo</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="isActive"
                        checked={!formIsActive}
                        onChange={() => setFormIsActive(false)}
                        className="text-slate-600 focus:ring-slate-500"
                      />
                      <span className="text-xs font-bold text-slate-600">Inativo (Bloqueado)</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* 3. MATRIZ DE PERMISSÕES GRANULARES (RBAC) */}
            <div className="border border-slate-200 rounded-xl p-4 sm:p-5 bg-slate-50/50">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 pb-3 border-b border-slate-200">
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2">
                    <KeyRound className="w-4 h-4 text-[#004f28]" />
                    3. Matriz de Permissões Granulares para este Profissional
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Definido automaticamente para <strong>{ROLE_METADATA[formRole]?.label}</strong>. Você pode personalizar toggles específicos conforme o contrato do colaborador.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleResetToRoleDefaults}
                  className="text-xs font-bold text-[#004f28] hover:underline flex items-center gap-1.5 self-start sm:self-auto shrink-0"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Restaurar Padrão do Cargo</span>
                </button>
              </div>

              {/* Grid Categorizado de Permissões */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  'Clínico & Avaliação',
                  'Prescrição & Condutas',
                  'Recepção & Atendimento',
                  'Governança & Segurança'
                ].map(category => {
                  const perms = PERMISSION_DEFINITIONS.filter(p => p.category === category);
                  return (
                    <div key={category} className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs">
                      <h5 className="text-[11px] font-black uppercase tracking-wider text-slate-700 pb-2 mb-3 border-b border-slate-100 flex items-center justify-between">
                        <span>{category}</span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {perms.filter(p => formPermissions[p.key]).length}/{perms.length} ativas
                        </span>
                      </h5>

                      <div className="space-y-3">
                        {perms.map(p => {
                          const isChecked = !!formPermissions[p.key];
                          return (
                            <label
                              key={p.key}
                              className={`flex items-start justify-between gap-3 p-2 rounded-lg border cursor-pointer transition-all ${
                                isChecked 
                                  ? 'bg-emerald-50/40 border-emerald-200 text-slate-900' 
                                  : 'bg-slate-50/50 border-slate-150 text-slate-500 hover:bg-slate-100/60'
                              }`}
                            >
                              <div className="flex-1">
                                <div className="flex items-center gap-1.5">
                                  <span className="text-xs font-bold leading-tight">{p.label}</span>
                                  {p.critical && (
                                    <span className="text-[9px] font-bold uppercase bg-amber-100 text-amber-800 px-1 rounded border border-amber-200">
                                      Crítico
                                    </span>
                                  )}
                                </div>
                                <p className="text-[10px] text-slate-500 mt-0.5 leading-snug">{p.description}</p>
                              </div>

                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => handleTogglePermission(p.key)}
                                className="mt-0.5 h-4 w-4 rounded border-slate-300 text-[#004f28] focus:ring-[#004f28] cursor-pointer"
                              />
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Botões de Ação do Formulário */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => {
                  resetForm();
                  setActiveTab('equipe');
                }}
                className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-50 transition-colors"
              >
                Cancelar
              </button>

              <button
                type="submit"
                disabled={isSaving}
                className="px-6 py-2.5 rounded-xl bg-[#004f28] hover:bg-[#003b1e] text-white font-bold text-xs flex items-center gap-2 shadow-xs transition-colors disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                <span>{isSaving ? 'Salvando...' : editingProfId ? 'Salvar Alterações do Profissional' : 'Confirmar Cadastro do Profissional'}</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ABA 3: MATRIZ COMPARATIVA DE PERMISSÕES (AUDITORIA DOS 4 PAPÉIS) */}
      {activeTab === 'matriz' && (
        <div className="bg-white rounded-b-xl border border-t-0 border-slate-200 p-6 shadow-xs space-y-6">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <KeyRound className="w-5 h-5 text-[#004f28]" />
              Matriz Comparativa de Permissões por Função Clínica
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Esta matriz reflete o desenho de governança clínica e conformidade regulatória (CFN, CFM e LGPD).
            </p>
          </div>

          <div className="overflow-x-auto border border-slate-200 rounded-xl">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-900 text-white">
                  <th className="p-3.5 font-bold uppercase tracking-wider text-[11px] w-1/3">
                    Funcionalidade / Permissão
                  </th>
                  <th className="p-3.5 font-bold uppercase tracking-wider text-[11px] text-center bg-emerald-950/60 text-emerald-300 border-l border-slate-800">
                    Nutricionista (CRN)
                  </th>
                  <th className="p-3.5 font-bold uppercase tracking-wider text-[11px] text-center bg-blue-950/60 text-blue-300 border-l border-slate-800">
                    Médico (CRM)
                  </th>
                  <th className="p-3.5 font-bold uppercase tracking-wider text-[11px] text-center bg-amber-950/60 text-amber-300 border-l border-slate-800">
                    Recepcionista
                  </th>
                  <th className="p-3.5 font-bold uppercase tracking-wider text-[11px] text-center bg-purple-950/60 text-purple-300 border-l border-slate-800">
                    ADM (Governança)
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {PERMISSION_DEFINITIONS.map(p => {
                  const nutri = DEFAULT_ROLE_PERMISSIONS.nutricionista[p.key];
                  const medico = DEFAULT_ROLE_PERMISSIONS.medico[p.key];
                  const recep = DEFAULT_ROLE_PERMISSIONS.recepcionista[p.key];
                  const adm = DEFAULT_ROLE_PERMISSIONS.adm[p.key];

                  return (
                    <tr key={p.key} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-3">
                        <div className="font-bold text-slate-900">{p.label}</div>
                        <div className="text-[10px] text-slate-400 mt-0.5">{p.description}</div>
                      </td>

                      <td className="p-3 text-center border-l border-slate-100 bg-emerald-50/10">
                        {nutri ? (
                          <span className="inline-flex items-center gap-1 text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                            <Check className="w-3.5 h-3.5" /> Permitido
                          </span>
                        ) : (
                          <span className="text-slate-300 font-mono">—</span>
                        )}
                      </td>

                      <td className="p-3 text-center border-l border-slate-100 bg-blue-50/10">
                        {medico ? (
                          <span className="inline-flex items-center gap-1 text-blue-700 font-bold bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                            <Check className="w-3.5 h-3.5" /> Permitido
                          </span>
                        ) : (
                          <span className="text-slate-300 font-mono">—</span>
                        )}
                      </td>

                      <td className="p-3 text-center border-l border-slate-100 bg-amber-50/10">
                        {recep ? (
                          <span className="inline-flex items-center gap-1 text-amber-700 font-bold bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                            <Check className="w-3.5 h-3.5" /> Permitido
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-rose-600 font-bold bg-rose-50 px-2 py-0.5 rounded border border-rose-200 text-[10px]">
                            <Lock className="w-3 h-3" /> Bloqueado (LGPD)
                          </span>
                        )}
                      </td>

                      <td className="p-3 text-center border-l border-slate-100 bg-purple-50/10">
                        {adm ? (
                          <span className="inline-flex items-center gap-1 text-purple-700 font-bold bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                            <Check className="w-3.5 h-3.5" /> Total
                          </span>
                        ) : (
                          <span className="text-slate-300 font-mono">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ABA 4: DIRETRIZES DE SEGURANÇA & LGPD */}
      {activeTab === 'auditoria' && (
        <div className="bg-white rounded-b-xl border border-t-0 border-slate-200 p-6 shadow-xs space-y-6">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-slate-900 text-white">
              <ShieldCheck className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Governança, Sigilo Clínico & Conformidade LGPD (Lei 13.709/2018)
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Regras estruturantes aplicadas em todo o software para proteção jurídica do nutricionista e do paciente.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/60">
              <span className="text-xs font-bold text-slate-900 block mb-1">
                1. Escudo de Proteção da Recepção
              </span>
              <p className="text-xs text-slate-600 leading-relaxed">
                Colaboradores com perfil de <strong>Recepcionista</strong> não possuem autorização para visualizar dietas, valores antropométricos, dobras cutâneas ou resultados de exames bioquímicos. Seu escopo limita-se à agenda e cadastros.
              </p>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/60">
              <span className="text-xs font-bold text-slate-900 block mb-1">
                2. Autonomia Profissional (CFN / CFM)
              </span>
              <p className="text-xs text-slate-600 leading-relaxed">
                Nutricionistas possuem competência exclusiva para prescrição dietética e cálculo de macros, enquanto médicos possuem escopo de prescrição médica e suplementação parenteral exclusiva.
              </p>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/60">
              <span className="text-xs font-bold text-slate-900 block mb-1">
                3. Trava de Exclusão de Prontuários
              </span>
              <p className="text-xs text-slate-600 leading-relaxed">
                Por padrão ético do CFN (Resolução nº 594/2017), o prontuário nutricional deve ser mantido por no mínimo 5 a 20 anos. A exclusão de pacientes é travada para profissionais de saúde e permitida somente por ADMs caso configurado.
              </p>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
