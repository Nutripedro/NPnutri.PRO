import React from 'react';
import { GestaoProfissionaisView } from './GestaoProfissionaisView';
import { Professional, Patient, AppSettings } from '../types';

interface GestaoAcessoViewProps {
  patients?: Patient[];
  professionals: Professional[];
  currentProfessional?: Professional | null;
  settings?: AppSettings;
  onUpdateSettings?: (s: AppSettings) => void;
  onUpdateProfessionals: (p: Professional[]) => void;
  onSelectCurrentProfessional?: (prof: Professional) => void;
}

export const GestaoAcessoView: React.FC<GestaoAcessoViewProps> = ({
  professionals,
  currentProfessional,
  onUpdateProfessionals,
  onSelectCurrentProfessional
}) => {
  return (
    <GestaoProfissionaisView
      professionals={professionals}
      currentProfessional={currentProfessional || professionals[0] || null}
      onUpdateProfessionals={onUpdateProfessionals}
      onSelectCurrentProfessional={onSelectCurrentProfessional || (() => {})}
    />
  );
};

export default GestaoAcessoView;
