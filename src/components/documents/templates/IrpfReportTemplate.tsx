import React from 'react';
import { ProfessionalContext, PatientContext, IrpfReportData } from '../../../types/documents';
import { DocumentHeader } from '../DocumentHeader';
import { DocumentFooter } from '../DocumentFooter';
import { formatCpf, numberToPortugueseWords } from '../../../utils/documentUtils';

interface IrpfReportTemplateProps {
  professional: ProfessionalContext;
  patient: PatientContext;
  data: IrpfReportData;
  authHash: string;
}

export const IrpfReportTemplate: React.FC<IrpfReportTemplateProps> = ({
  professional,
  patient,
  data,
  authHash
}) => {
  const totalInWords = numberToPortugueseWords(data.totalPaidBrl || 0);

  return (
    <div className="bg-white text-slate-800 p-8 max-w-[210mm] mx-auto min-h-[297mm] flex flex-col justify-between font-sans leading-relaxed">
      <div>
        <DocumentHeader
          professional={professional}
          patient={patient}
          documentTitle={`Informe de Pagamentos para Fins de IRPF - Ano-Calendário ${data.calendarYear || new Date().getFullYear()}`}
          documentSubtitle="Declaração de Quitação Anual de Despesas com Saúde (Receita Federal do Brasil)"
          issueDate={data.issueDate}
        />

        {/* Quadro Resumo Receita Federal */}
        <div className="mb-6 grid grid-cols-2 gap-4 text-xs bg-slate-50 border border-slate-200 rounded-lg p-3.5">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Prestador do Serviço:</span>
            <p className="font-semibold text-slate-900">{data.professionalName || professional.name}</p>
            <p className="text-slate-600 font-mono">CPF/CNPJ: {formatCpf(data.professionalCpfCnpj || professional.cpfCnpj || '111.222.333-44')}</p>
            <p className="text-[#4A6B5D] font-medium">Conselho: {data.professionalCrn || professional.crn}</p>
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Beneficiário do Pagamento:</span>
            <p className="font-semibold text-slate-900">{data.patientName || patient.name}</p>
            <p className="text-slate-600 font-mono">CPF: {formatCpf(data.patientCpf || patient.cpf)}</p>
            <p className="text-slate-500">Ano-Calendário: <strong>{data.calendarYear || new Date().getFullYear()}</strong></p>
          </div>
        </div>

        {/* Tabela Discriminada de Pagamentos */}
        <div className="mb-6">
          <h3 className="text-xs font-bold text-[#4A6B5D] uppercase tracking-wider mb-2 border-b border-[#4A6B5D]/20 pb-1">
            Discriminação Mensal das Consultas e Atendimentos Nutricionais
          </h3>

          <div className="border border-slate-200 rounded-md overflow-hidden text-xs">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-100 text-[10px] text-slate-600 uppercase font-bold border-b border-slate-200">
                  <th className="py-2 px-3">Data</th>
                  <th className="py-2 px-3">Nº Recibo</th>
                  <th className="py-2 px-3">Descrição do Serviço Clínico</th>
                  <th className="py-2 px-3 text-right">Valor Pago (R$)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data.receipts && data.receipts.length > 0 ? (
                  data.receipts.map((item, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/50">
                      <td className="py-2 px-3 font-mono text-slate-600">{item.date}</td>
                      <td className="py-2 px-3 font-mono text-slate-700 font-semibold">{item.receiptNumber}</td>
                      <td className="py-2 px-3 text-slate-800">{item.serviceDescription}</td>
                      <td className="py-2 px-3 text-right font-mono font-bold text-slate-900">
                        R$ {item.valueBrl?.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="py-4 text-center text-slate-400 italic">
                      Nenhum recibo vinculado a este ano-calendário.
                    </td>
                  </tr>
                )}
              </tbody>
              <tfoot>
                <tr className="bg-[#4A6B5D]/10 font-bold border-t-2 border-[#4A6B5D]">
                  <td colSpan={3} className="py-2.5 px-3 uppercase text-[11px] text-[#4A6B5D]">
                    Total Geral Quitado no Ano-Calendário:
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono text-base text-[#4A6B5D]">
                    R$ {data.totalPaidBrl?.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        {/* Declaração Formal de Quitação Anual */}
        <div className="bg-slate-50 border border-slate-200 rounded p-4 text-xs text-slate-700 leading-relaxed text-justify space-y-2">
          <p>
            Declaro, sob as penas da lei, que o(a) contribuinte acima qualificado(a) efetuou a quitação integral do montante de{' '}
            <strong className="text-slate-900">
              R$ {data.totalPaidBrl?.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ({totalInWords})
            </strong>{' '}
            durante o ano-calendário de {data.calendarYear || new Date().getFullYear()}, referente a honorários de assistência nutricional clínica individualizada.
          </p>
          <p className="text-[11px] text-slate-500">
            * Informações prestadas em conformidade com o Regulamento do Imposto de Renda (Decreto nº 9.580/2018, art. 73) e Instrução Normativa da RFB.
          </p>
        </div>
      </div>

      <DocumentFooter
        professional={professional}
        authHash={authHash}
        city={data.city || professional.unit}
        issueDate={data.issueDate}
        customDisclaimer="Comprovante de rendimentos e despesas médicas para a Declaração de Ajuste Anual do IRPF."
      />
    </div>
  );
};
