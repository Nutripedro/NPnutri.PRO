import React from 'react';
import { ProfessionalContext } from '../../types/documents';
import { getQrCodeSvgDataUrl } from '../../utils/documentUtils';

interface DocumentFooterProps {
  professional: ProfessionalContext;
  authHash: string;
  city?: string;
  issueDate?: string;
  customDisclaimer?: string;
  digitalSignatureUrl?: string;
}

export const DocumentFooter: React.FC<DocumentFooterProps> = ({
  professional,
  authHash,
  city = 'São Paulo - SP',
  issueDate,
  customDisclaimer,
  digitalSignatureUrl
}) => {
  const now = new Date();
  const formattedDate = issueDate
    ? new Date(issueDate).toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' })
    : now.toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' });

  const qrDataUrl = getQrCodeSvgDataUrl(`VALIDACAO:${authHash}|PROF:${professional.name}|CRN:${professional.crn}|DATA:${now.toISOString()}`);

  const storedSignature = typeof window !== 'undefined' ? localStorage.getItem('nutri_digital_signature') : null;
  const activeSignature = digitalSignatureUrl || storedSignature;

  return (
    <div className="mt-8 pt-6 border-t border-slate-200 text-xs">
      {/* Cidade e Data */}
      <div className="text-right text-slate-600 mb-8 italic">
        {city}, {formattedDate}.
      </div>

      {/* Bloco de Assinatura e Validação Digital */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pb-6">
        {/* Validação QR Code e Hash */}
        <div className="flex items-center gap-3">
          <img 
            src={qrDataUrl} 
            alt="QR Code de Validação" 
            className="w-16 h-16 border border-slate-200 rounded p-0.5 bg-white shadow-xs" 
          />
          <div className="text-[10px] text-slate-500 leading-tight">
            <span className="font-semibold text-slate-700 block uppercase tracking-wider text-[9px]">
              Assinatura & Autenticação Digital
            </span>
            <p className="font-mono text-[9px] text-[#4A6B5D] font-bold mt-0.5">
              {authHash}
            </p>
            <p className="text-slate-400 mt-0.5">
              Documento assinado eletronicamente conforme Medida Provisória nº 2.200-2/2001.
            </p>
          </div>
        </div>

        {/* Linha & Imagem de Assinatura do Profissional */}
        <div className="text-center min-w-[220px] relative">
          {activeSignature && (
            <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 h-14 flex items-center justify-center pointer-events-none">
              <img 
                src={activeSignature} 
                alt="Assinatura Digital do Nutricionista" 
                className="max-h-14 max-w-[200px] object-contain opacity-95" 
              />
            </div>
          )}
          <div className="w-56 border-b border-slate-400 mb-1.5 mx-auto"></div>
          <p className="font-bold text-slate-800 text-xs">{professional.name}</p>
          <p className="text-[11px] text-[#4A6B5D] font-medium">{professional.crn}</p>
          <p className="text-[10px] text-slate-500">{professional.specialty}</p>
        </div>
      </div>

      {/* Disclaimer de Privacidade e LGPD */}
      <div className="text-[9px] text-slate-400 text-center border-t border-slate-100 pt-3">
        {customDisclaimer || (
          'Este documento contém dados clínicos protegidos por sigilo profissional e pela Lei Geral de Proteção de Dados (Lei nº 13.709/2018). É vedada a sua divulgação ou utilização para fins não clínicos sem prévia autorização expressa.'
        )}
      </div>
    </div>
  );
};
