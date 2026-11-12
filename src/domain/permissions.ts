import { RolePermissions, UserRole, CouncilType } from '../types';

export const DEFAULT_ROLE_PERMISSIONS: Record<string, RolePermissions> = {
  nutricionista: {
    canAccessClinicalRecords: true,
    canPerformAnthropometry: true,
    canManageGrowthCharts: true,
    canPrescribeDiets: true,
    canRequestExams: true,
    canPrescribeSupplements: true,
    canPrescribeMedicalExclusive: false,
    canManageAppointments: true,
    canRegisterPatients: true,
    canDeletePatients: false,
    canManageProfessionals: false,
    canManageSettings: false,
    canViewAuditLogs: false
  },
  medico: {
    canAccessClinicalRecords: true,
    canPerformAnthropometry: true,
    canManageGrowthCharts: true,
    canPrescribeDiets: true,
    canRequestExams: true,
    canPrescribeSupplements: true,
    canPrescribeMedicalExclusive: true,
    canManageAppointments: true,
    canRegisterPatients: true,
    canDeletePatients: false,
    canManageProfessionals: false,
    canManageSettings: false,
    canViewAuditLogs: true
  },
  recepcionista: {
    canAccessClinicalRecords: false,
    canPerformAnthropometry: false,
    canManageGrowthCharts: false,
    canPrescribeDiets: false,
    canRequestExams: false,
    canPrescribeSupplements: false,
    canPrescribeMedicalExclusive: false,
    canManageAppointments: true,
    canRegisterPatients: true,
    canDeletePatients: false,
    canManageProfessionals: false,
    canManageSettings: false,
    canViewAuditLogs: false
  },
  secretaria: {
    canAccessClinicalRecords: false,
    canPerformAnthropometry: false,
    canManageGrowthCharts: false,
    canPrescribeDiets: false,
    canRequestExams: false,
    canPrescribeSupplements: false,
    canPrescribeMedicalExclusive: false,
    canManageAppointments: true,
    canRegisterPatients: true,
    canDeletePatients: false,
    canManageProfessionals: false,
    canManageSettings: false,
    canViewAuditLogs: false
  },
  adm: {
    canAccessClinicalRecords: true,
    canPerformAnthropometry: true,
    canManageGrowthCharts: true,
    canPrescribeDiets: true,
    canRequestExams: true,
    canPrescribeSupplements: true,
    canPrescribeMedicalExclusive: true,
    canManageAppointments: true,
    canRegisterPatients: true,
    canDeletePatients: true,
    canManageProfessionals: true,
    canManageSettings: true,
    canViewAuditLogs: true
  },
  admin: {
    canAccessClinicalRecords: true,
    canPerformAnthropometry: true,
    canManageGrowthCharts: true,
    canPrescribeDiets: true,
    canRequestExams: true,
    canPrescribeSupplements: true,
    canPrescribeMedicalExclusive: true,
    canManageAppointments: true,
    canRegisterPatients: true,
    canDeletePatients: true,
    canManageProfessionals: true,
    canManageSettings: true,
    canViewAuditLogs: true
  }
};

export interface RoleMeta {
  role: UserRole;
  label: string;
  shortLabel: string;
  councilName: CouncilType;
  councilPlaceholder: string;
  badgeBg: string;
  badgeText: string;
  borderColor: string;
  accentColor: string;
  description: string;
  regulatoryRef: string;
  lgpdScope: string;
}

export const ROLE_METADATA: Record<string, RoleMeta> = {
  nutricionista: {
    role: 'nutricionista',
    label: 'Nutricionista Clínico(a)',
    shortLabel: 'Nutricionista',
    councilName: 'CRN',
    councilPlaceholder: 'Ex: CRN-3 48910',
    badgeBg: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    badgeText: 'text-emerald-800',
    borderColor: 'border-emerald-300',
    accentColor: '#004f28',
    description: 'Diagnóstico nutricional, cálculo de TMB/macros, curvas OMS, requisição de exames (CFN 702/2021) e suplementação.',
    regulatoryRef: 'Conselho Federal de Nutricionistas (CFN)',
    lgpdScope: 'Acesso clínico integral aos dados de saúde dos próprios pacientes.'
  },
  medico: {
    role: 'medico',
    label: 'Médico(a) / Nutrólogo(a)',
    shortLabel: 'Médico',
    councilName: 'CRM',
    councilPlaceholder: 'Ex: CRM-SP 123456',
    badgeBg: 'bg-blue-50 text-blue-900 border-blue-200',
    badgeText: 'text-blue-900',
    borderColor: 'border-blue-300',
    accentColor: '#1e3a8a',
    description: 'Prescrição médica ampla, suplementação hormonal/injetável, requisição de exames laboratoriais e diagnósticos clínicos.',
    regulatoryRef: 'Conselho Federal de Medicina (CFM)',
    lgpdScope: 'Acesso clínico e prontuário médico sob sigilo profissional (CFM 2.217/2018).'
  },
  recepcionista: {
    role: 'recepcionista',
    label: 'Recepcionista / Atendimento',
    shortLabel: 'Recepcionista',
    councilName: 'MATRICULA',
    councilPlaceholder: 'Ex: REC-2024-08',
    badgeBg: 'bg-amber-50 text-amber-900 border-amber-200',
    badgeText: 'text-amber-900',
    borderColor: 'border-amber-300',
    accentColor: '#b45309',
    description: 'Gestão da agenda de consultas, agendamentos, confirmações por WhatsApp e cadastro inicial de pacientes.',
    regulatoryRef: 'Atendimento & Triagem Ambulatorial',
    lgpdScope: 'Escudo LGPD Ativo: Acesso restrito a dados cadastrais. Bloqueio de prontuário, dobras e exames.'
  },
  secretaria: {
    role: 'recepcionista',
    label: 'Recepcionista / Atendimento',
    shortLabel: 'Recepcionista',
    councilName: 'MATRICULA',
    councilPlaceholder: 'Ex: REC-2024-08',
    badgeBg: 'bg-amber-50 text-amber-900 border-amber-200',
    badgeText: 'text-amber-900',
    borderColor: 'border-amber-300',
    accentColor: '#b45309',
    description: 'Gestão da agenda de consultas, agendamentos e cadastro de pacientes sem acesso a prontuário.',
    regulatoryRef: 'Atendimento Ambulatorial',
    lgpdScope: 'Escudo LGPD Ativo: Bloqueio de dados clínicos sensíveis.'
  },
  adm: {
    role: 'adm',
    label: 'Administrador(a) & Gestor(a)',
    shortLabel: 'ADM',
    councilName: 'MATRICULA',
    councilPlaceholder: 'Ex: ADM-001',
    badgeBg: 'bg-purple-50 text-purple-900 border-purple-200',
    badgeText: 'text-purple-900',
    borderColor: 'border-purple-300',
    accentColor: '#4c1d95',
    description: 'Direção técnica, governança da clínica, cadastro e controle de permissões de profissionais, exclusão e auditoria.',
    regulatoryRef: 'Governança & Direção Administrativa',
    lgpdScope: 'Responsável Técnico / DPO perante a LGPD e gestão de acessos.'
  },
  admin: {
    role: 'adm',
    label: 'Administrador(a) & Gestor(a)',
    shortLabel: 'ADM',
    councilName: 'MATRICULA',
    councilPlaceholder: 'Ex: ADM-001',
    badgeBg: 'bg-purple-50 text-purple-900 border-purple-200',
    badgeText: 'text-purple-900',
    borderColor: 'border-purple-300',
    accentColor: '#4c1d95',
    description: 'Direção técnica e governança da clínica.',
    regulatoryRef: 'Governança Administrativa',
    lgpdScope: 'DPO / Gestor de Acessos.'
  }
};

export interface PermissionDefinition {
  key: keyof RolePermissions;
  label: string;
  category: 'Clínico & Avaliação' | 'Prescrição & Condutas' | 'Recepção & Atendimento' | 'Governança & Segurança';
  description: string;
  critical?: boolean;
}

export const PERMISSION_DEFINITIONS: PermissionDefinition[] = [
  // Categoria 1: Clínico & Avaliação
  {
    key: 'canAccessClinicalRecords',
    label: 'Acesso a Prontuários & Histórico',
    category: 'Clínico & Avaliação',
    description: 'Visualizar evolução clínica, anamnese e histórico do paciente.',
    critical: true
  },
  {
    key: 'canPerformAnthropometry',
    label: 'Avaliação Antropométrica & Bioimpedância',
    category: 'Clínico & Avaliação',
    description: 'Realizar e registrar Dobras ISAK, Bioimpedância 4C, RCQ, Pescoço e Fotogrametria.'
  },
  {
    key: 'canManageGrowthCharts',
    label: 'Curvas de Crescimento OMS & Escore-Z',
    category: 'Clínico & Avaliação',
    description: 'Registrar medições pediátricas (0 a 19 anos) e avaliar Z-Scores e diagnóstico SISVAN.'
  },

  // Categoria 2: Prescrição & Condutas
  {
    key: 'canPrescribeDiets',
    label: 'Prescrição de Dietas & Metas Calóricas',
    category: 'Prescrição & Condutas',
    description: 'Definir TMB/GET (Mifflin/Harris), g/kg de macronutrientes, cardápios e lembretes.'
  },
  {
    key: 'canRequestExams',
    label: 'Requisição de Exames Laboratoriais',
    category: 'Prescrição & Condutas',
    description: 'Emitir pedidos de exames bioquímicos conforme Resolução CFN 702/2021 e CFM.'
  },
  {
    key: 'canPrescribeSupplements',
    label: 'Prescrição de Suplementos (Nutricionista)',
    category: 'Prescrição & Condutas',
    description: 'Prescrever fitoterápicos, vitaminas, minerais, aminoácidos e ergogênicos.'
  },
  {
    key: 'canPrescribeMedicalExclusive',
    label: 'Prescrição Médica Exclusiva (Médico)',
    category: 'Prescrição & Condutas',
    description: 'Prescrever fármacos, hormônios e compostos de via parenteral e injetáveis.',
    critical: true
  },

  // Categoria 3: Recepção & Atendimento
  {
    key: 'canManageAppointments',
    label: 'Gestão da Agenda & Atendimentos',
    category: 'Recepção & Atendimento',
    description: 'Marcar, reagendar, confirmar consultas presenciais ou teleconsultas.'
  },
  {
    key: 'canRegisterPatients',
    label: 'Cadastro & Edição de Pacientes',
    category: 'Recepção & Atendimento',
    description: 'Cadastrar novos prontuários e atualizar dados pessoais e de contato.'
  },

  // Categoria 4: Governança & Segurança
  {
    key: 'canDeletePatients',
    label: 'Permissão de Excluir Pacientes',
    category: 'Governança & Segurança',
    description: 'Permitir exclusão irreversível de pacientes (sujeito à trava de governança).',
    critical: true
  },
  {
    key: 'canManageProfessionals',
    label: 'Gerenciar Profissionais & Permissões',
    category: 'Governança & Segurança',
    description: 'Cadastrar, editar e definir permissões granulares dos colaboradores.',
    critical: true
  },
  {
    key: 'canManageSettings',
    label: 'Configurações Globais do Sistema',
    category: 'Governança & Segurança',
    description: 'Ajustar nome da clínica, unidades, moeda, integrações e teleconsulta.'
  },
  {
    key: 'canViewAuditLogs',
    label: 'Relatórios de Auditoria & LGPD',
    category: 'Governança & Segurança',
    description: 'Consultar logs de acesso a dados de saúde e conformidade regulatória.'
  }
];

export function getRolePermissions(role: UserRole): RolePermissions {
  const normalized = role === 'admin' ? 'adm' : role === 'secretaria' ? 'recepcionista' : role;
  return DEFAULT_ROLE_PERMISSIONS[normalized] || DEFAULT_ROLE_PERMISSIONS.nutricionista;
}

export function isClinicalRestrictedForRole(role: UserRole, permissions?: RolePermissions): boolean {
  if (role === 'adm' || role === 'admin') return false;
  if (permissions) {
    return !permissions.canAccessClinicalRecords;
  }
  return role === 'recepcionista' || role === 'secretaria';
}
