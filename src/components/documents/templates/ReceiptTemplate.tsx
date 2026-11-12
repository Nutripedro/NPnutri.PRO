import React from 'react';
import { ProfessionalContext, PatientContext, ReceiptData } from '../../../types/documents';
import { DocumentHeader } from '../DocumentHeader';
import { DocumentFooter } from '../DocumentFooter';
import { formatCpf, numberToPortugueseWords, formatDateExtendedPtBr } from '../../../utils/documentUtils';

interface ReceiptTemplateProps {
  professional: ProfessionalContext;
  patient: PatientContext;
  data: ReceiptData;
  authHash: string;
}

export const ReceiptTemplate: React.FC<ReceiptTemplateProps> = ({
  professional,
  patient,
  data,
  authHash
}) => {
  const valueInWords = data.valueInWords || numberToPortugueseWords(data.valueBrl);
  const paymentDateExtended = formatDateExtendedPtBr(data.paymentDate || new Date().toISOString().split('T')[0]);

  const paymentMethodNames: Record<string, string> = {
    pix: 'PIX (Transferência Instantânea)',
    cartao_credito: 'Cartão de Crédito',
    cartao_debito: 'Cartão de Débito',
    dinheiro: 'Espécie / Dinheiro',
    transferencia: 'Transferência Bancária (TED/DOC)'
  };

  const isPayerDifferent = data.payerCpfCnpj && data.payerCpfCnpj !== patient.cpf;

  return (
    <div className="bg-white text-slate-800 p-8 max-w-[210mm] mx-auto min-h-[297mm] flex flex-col justify-between font-sans leading-relaxed">
      <div>
        <DocumentHeader
          professional={professional}
          patient={patient}
          documentTitle="Recibo de Pagamento de Honorários Profissionais"
          documentSubtitle={`Recibo Oficial Nº ${data.receiptNumber || 'REC-2026-001'}`}
          issueDate={data.paymentDate}
        />

        {/* Caixa de Valor em Destaque */}
        <div className="my-6 bg-[#4A6B5D]/5 border-2 border-[#4A6B5D]/30 rounded-lg p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <span className="text-xs uppercase tracking-wider text-slate-500 font-semibold block">
              Valor dos Honorários Profissionais
            </span>
            <div className="text-3xl font-bold font-mono text-[#4A6B5D]">
              R$ {data.valueBrl?.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          </div>

          <div className="text-right text-xs text-slate-600 bg-white border border-slate-200 rounded px-3 py-2 shadow-2xs">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Forma de Liquidação:</span>
            <span className="font-semibold text-slate-800">
              {paymentMethodNames[data.paymentMethod] || 'PIX'}
            </span>
          </div>
        </div>

        {/* Declaração Formal de Quitação */}
        <div className="border border-slate-200 rounded-lg p-6 bg-slate-50/50 space-y-4 text-sm text-slate-800 leading-relaxed text-justify">
          <p>
            Recebi de{' '}
            <strong className="text-slate-900 font-semibold">{data.payerName || patient.name}</strong>, inscrito(a) no CPF/MF sob o nº{' '}
            <strong className="font-mono text-slate-900">{formatCpf(data.payerCpfCnpj || patient.cpf)}</strong>, a quantia líquida e certa de{' '}
            <strong className="text-[#4A6B5D] font-semibold">
              R$ {data.valueBrl?.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ({valueInWords})
            </strong>, referente a{' '}
            <span className="font-medium text-slate-900">
              {data.serviceRendered || 'serviços profissionais de consulta e planejamento nutricional individualizado'}
            </span>.
          </p>

          {isPayerDifferent && (
            <p className="text-xs text-slate-600 border-t border-slate-200 pt-3">
              <strong>Nota Fiscal / IRPF:</strong> Pagamento efetuado em benefício do(a) paciente dependente{' '}
              <strong>{patient.name}</strong>, CPF nº <strong>{formatCpf(patient.cpf)}</strong>.
            </p>
          )}

          <p className="text-xs text-slate-600">
            Pelo que firmo o presente recibo em uma única via para que produza os seus regulares efeitos de direito e quitação, servindo para fins de comprovação e dedução de despesas com saúde na Declaração de Ajuste Anual do Imposto sobre a Renda da Pessoa Física (IRPF), conforme legislação vigente da Secretaria da Receita Federal do Brasil.
          </p>
        </div>

        {/* Dados do Prestador para fins de IRPF */}
        <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs bg-white border border-slate-200 rounded-lg p-3.5">
          <div>
            <span className="text-[10px] text-slate-400 block uppercase font-semibold">Profissional Emitente:</span>
            <span className="font-semibold text-slate-800">{professional.name}</span>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 block uppercase font-semibold">Registro no Conselho:</span>
            <span className="font-semibold text-[#4A6B5D]">{professional.crn}</span>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 block uppercase font-semibold">CPF/CNPJ do Prestador:</span>
            <span className="font-mono text-slate-700">{formatCpf(professional.cpfCnpj || '111.222.333-44')}</span>
          </div>
        </div>
      </div>

      <DocumentFooter
        professional={professional}
        authHash={authHash}
        city={data.city || professional.unit}
        issueDate={data.paymentDate}
        customDisclaimer="Recibo emitido para quitação de honorários e dedução de despesas médicas/nutricionais no IRPF conforme Lei nº 9.250/1995."
      />
    </div>
  );
};
