import React, { useState, useMemo } from 'react';
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  PlusCircle, 
  MinusCircle, 
  Receipt, 
  FileSpreadsheet, 
  CreditCard, 
  Wallet, 
  Search, 
  Filter, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  XCircle, 
  Calendar, 
  ArrowUpRight, 
  ArrowDownRight, 
  Printer, 
  Download, 
  Check, 
  X, 
  Edit3, 
  Trash2, 
  PieChart as PieIcon, 
  BarChart3, 
  Building2, 
  User, 
  FileText, 
  Sparkles,
  Share2
} from 'lucide-react';
import { 
  FinancialTransaction, 
  FinancialCategory, 
  PaymentMethod, 
  PaymentStatus, 
  Patient, 
  Professional 
} from '../types';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';

interface ModuloFinanceiroViewProps {
  transactions: FinancialTransaction[];
  onUpdateTransactions: (transactions: FinancialTransaction[]) => void;
  patients: Patient[];
  currentProfessional: Professional;
  privacyMode: boolean;
}

const CATEGORY_LABELS: Record<FinancialCategory, string> = {
  consulta_primeira: 'Primeira Consulta',
  consulta_retorno: 'Consulta de Retorno',
  pacote_nutricional: 'Pacote / Programa Nutricional',
  bioimpedancia_avulsa: 'Bioimpedância Avulsa',
  suplementos_venda: 'Venda de Suplementos',
  aluguel_consultorio: 'Aluguel do Consultório',
  software_sistemas: 'Software & Prontuário Eletrônico',
  marketing_anuncios: 'Marketing & Anúncios',
  impostos_taxas: 'Impostos & Taxas de Cartão',
  material_clinico: 'Material Clínico & Insumos',
  outros: 'Outros Lançamentos'
};

const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  pix: 'PIX Instantâneo',
  cartao_credito: 'Cartão de Crédito',
  cartao_debito: 'Cartão de Débito',
  dinheiro: 'Dinheiro Espécie',
  boleto: 'Boleto Bancário',
  transferencia: 'TED / Transferência'
};

const PAYMENT_METHOD_COLORS: Record<PaymentMethod, string> = {
  pix: '#004f28',
  cartao_credito: '#0ea5e9',
  cartao_debito: '#6366f1',
  dinheiro: '#10b981',
  boleto: '#f59e0b',
  transferencia: '#8b5cf6'
};

export const ModuloFinanceiroView: React.FC<ModuloFinanceiroViewProps> = ({
  transactions,
  onUpdateTransactions,
  patients,
  currentProfessional,
  privacyMode
}) => {
  // Filters & State
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'todos' | 'receita' | 'despesa'>('todos');
  const [filterStatus, setFilterStatus] = useState<'todos' | PaymentStatus>('todos');
  const [selectedMonth, setSelectedMonth] = useState<string>('2026-11');

  // Modals state
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  const [receiptTx, setReceiptTx] = useState<FinancialTransaction | null>(null);

  // New Transaction Form State
  const [newType, setNewType] = useState<'receita' | 'despesa'>('receita');
  const [newCategory, setNewCategory] = useState<FinancialCategory>('consulta_primeira');
  const [newDescription, setNewDescription] = useState('');
  const [newAmount, setNewAmount] = useState<number>(420);
  const [newDate, setNewDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [newPaymentMethod, setNewPaymentMethod] = useState<PaymentMethod>('pix');
  const [newStatus, setNewStatus] = useState<PaymentStatus>('pago');
  const [newPatientId, setNewPatientId] = useState<string>('');
  const [newNotes, setNewNotes] = useState('');

  // Computed Financial Totals
  const summary = useMemo(() => {
    let totalIncome = 0;
    let totalExpense = 0;
    let pendingIncome = 0;
    let pendingExpense = 0;

    transactions.forEach(t => {
      if (t.type === 'receita') {
        if (t.status === 'pago') {
          totalIncome += t.amount;
        } else if (t.status === 'pendente' || t.status === 'atrasado') {
          pendingIncome += t.amount;
        }
      } else if (t.type === 'despesa') {
        if (t.status === 'pago') {
          totalExpense += t.amount;
        } else if (t.status === 'pendente' || t.status === 'atrasado') {
          pendingExpense += t.amount;
        }
      }
    });

    const netProfit = totalIncome - totalExpense;
    const profitMarginPercent = totalIncome > 0 ? Math.round((netProfit / totalIncome) * 100) : 0;

    return {
      totalIncome,
      totalExpense,
      netProfit,
      profitMarginPercent,
      pendingIncome,
      pendingExpense
    };
  }, [transactions]);

  // Filtered Transactions
  const filteredTransactions = useMemo(() => {
    return transactions.filter(t => {
      // Type Filter
      if (filterType !== 'todos' && t.type !== filterType) return false;
      // Status Filter
      if (filterStatus !== 'todos' && t.status !== filterStatus) return false;
      // Search
      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase();
        const descMatch = t.description.toLowerCase().includes(term);
        const patientMatch = t.patientName?.toLowerCase().includes(term);
        const catMatch = CATEGORY_LABELS[t.category].toLowerCase().includes(term);
        if (!descMatch && !patientMatch && !catMatch) return false;
      }
      return true;
    });
  }, [transactions, filterType, filterStatus, searchTerm]);

  // Chart Data: Income vs Expense per Category
  const categoryPieData = useMemo(() => {
    const map: Record<string, number> = {};
    transactions
      .filter(t => t.type === 'receita' && t.status === 'pago')
      .forEach(t => {
        const label = CATEGORY_LABELS[t.category] || t.category;
        map[label] = (map[label] || 0) + t.amount;
      });

    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [transactions]);

  // Chart Data: Payment Methods
  const paymentMethodPieData = useMemo(() => {
    const map: Record<PaymentMethod, number> = {
      pix: 0,
      cartao_credito: 0,
      cartao_debito: 0,
      dinheiro: 0,
      boleto: 0,
      transferencia: 0
    };

    transactions
      .filter(t => t.type === 'receita' && t.status === 'pago')
      .forEach(t => {
        map[t.paymentMethod] = (map[t.paymentMethod] || 0) + t.amount;
      });

    return Object.entries(map)
      .filter(([_, val]) => val > 0)
      .map(([method, value]) => ({
        name: PAYMENT_METHOD_LABELS[method as PaymentMethod],
        value,
        color: PAYMENT_METHOD_COLORS[method as PaymentMethod]
      }));
  }, [transactions]);

  // Chart Data: Monthly Flow
  const monthlyFlowData = [
    { month: 'Jul', receita: 17640, despesa: 4200, lucro: 13440 },
    { month: 'Ago', receita: 18900, despesa: 4350, lucro: 14550 },
    { month: 'Set', receita: 20160, despesa: 4100, lucro: 16060 },
    { month: 'Out', receita: 21000, despesa: 4500, lucro: 16500 },
    { month: 'Nov', receita: summary.totalIncome + summary.pendingIncome, despesa: summary.totalExpense, lucro: summary.netProfit }
  ];

  // Handler: Add New Transaction
  const handleCreateTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    const selectedPat = patients.find(p => p.id === newPatientId);

    const newTx: FinancialTransaction = {
      id: `tx-${Date.now()}`,
      type: newType,
      category: newCategory,
      description: newDescription || `${CATEGORY_LABELS[newCategory]} ${selectedPat ? `- ${selectedPat.name}` : ''}`,
      amount: Number(newAmount),
      date: newDate,
      dueDate: newDate,
      status: newStatus,
      paymentMethod: newPaymentMethod,
      patientId: selectedPat?.id,
      patientName: selectedPat?.name,
      notes: newNotes,
      receiptNumber: newType === 'receita' ? `REC-2026-${Math.floor(100 + Math.random() * 900)}` : undefined
    };

    onUpdateTransactions([newTx, ...transactions]);
    setIsNewModalOpen(false);

    // Reset Form
    setNewDescription('');
    setNewAmount(420);
    setNewNotes('');
  };

  // Handler: Toggle Transaction Status
  const handleToggleStatus = (id: string) => {
    const updated = transactions.map(t => {
      if (t.id === id) {
        const nextStatus: PaymentStatus = t.status === 'pago' ? 'pendente' : 'pago';
        return { ...t, status: nextStatus };
      }
      return t;
    });
    onUpdateTransactions(updated);
  };

  // Handler: Delete Transaction
  const handleDeleteTransaction = (id: string) => {
    if (confirm('Tem certeza que deseja excluir esta transação financeira?')) {
      onUpdateTransactions(transactions.filter(t => t.id !== id));
    }
  };

  // Open Receipt Modal
  const handleOpenReceipt = (tx: FinancialTransaction) => {
    setReceiptTx(tx);
    setIsReceiptModalOpen(true);
  };

  const COLORS = ['#004f28', '#0ea5e9', '#f59e0b', '#8b5cf6', '#ec4899', '#10b981'];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Header Banner */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-[#004f28] text-white flex items-center space-x-1">
              <DollarSign className="w-3.5 h-3.5 inline mr-1" />
              <span>Gestão Financeira & Caixa</span>
            </span>
            <span className="text-xs text-slate-400 dark:text-slate-500 font-mono">Faturamento, Receitas, Despesas & DRE Clínico</span>
          </div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight mt-1">
            Módulo Financeiro do Consultório
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-mono mt-0.5">
            Controle completo de entradas, saídas, emissão de recibos médicos para IR, fluxo de caixa e relatórios de lucratividade.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => {
              setNewType('receita');
              setIsNewModalOpen(true);
            }}
            className="px-3.5 py-2 bg-[#004f28] hover:bg-[#003c1e] text-white font-bold rounded-lg text-xs flex items-center space-x-1.5 transition-all shadow-xs"
          >
            <PlusCircle className="w-4 h-4" />
            <span>+ Nova Receita</span>
          </button>

          <button
            onClick={() => {
              setNewType('despesa');
              setIsNewModalOpen(true);
            }}
            className="px-3.5 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-lg text-xs flex items-center space-x-1.5 transition-all shadow-xs"
          >
            <MinusCircle className="w-4 h-4" />
            <span>+ Nova Despesa</span>
          </button>

          <button
            onClick={() => window.print()}
            className="px-3 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold rounded-lg text-xs flex items-center space-x-1.5 transition-colors border border-slate-200 dark:border-slate-700"
          >
            <Printer className="w-4 h-4" />
            <span>Imprimir DRE</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Row (Receitas, Despesas, Lucro Líquido & Pendentes) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1: Receita Total Pago */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs space-y-2 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider font-mono">Receitas Confirmadas</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/80 text-[#004f28] dark:text-emerald-400 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900 dark:text-slate-100 font-mono tabular-nums">
              R$ {summary.totalIncome.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
            <div className="flex items-center space-x-1 text-[11px] font-mono font-bold text-emerald-600 dark:text-emerald-400 mt-1">
              <ArrowUpRight className="w-3.5 h-3.5" />
              <span>A Receber: R$ {summary.pendingIncome.toLocaleString('pt-BR')}</span>
            </div>
          </div>
          <div className="text-[10px] text-slate-400 dark:text-slate-500 font-mono border-t border-slate-100 dark:border-slate-800 pt-2 flex justify-between">
            <span>Atendimentos: <strong className="dark:text-slate-300">{transactions.filter(t => t.type === 'receita').length}</strong></span>
            <span>Ticket Médio: <strong className="dark:text-slate-300">R$ 412,00</strong></span>
          </div>
        </div>

        {/* Card 2: Despesas Totais */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs space-y-2 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider font-mono">Despesas da Clínica</span>
            <div className="w-8 h-8 rounded-lg bg-rose-50 dark:bg-rose-950/80 text-rose-600 dark:text-rose-400 flex items-center justify-center">
              <TrendingDown className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black text-rose-600 dark:text-rose-400 font-mono tabular-nums">
              R$ {summary.totalExpense.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
            <div className="flex items-center space-x-1 text-[11px] font-mono font-bold text-slate-500 dark:text-slate-400 mt-1">
              <span>A Pagar: R$ {summary.pendingExpense.toLocaleString('pt-BR')}</span>
            </div>
          </div>
          <div className="text-[10px] text-slate-400 dark:text-slate-500 font-mono border-t border-slate-100 dark:border-slate-800 pt-2 flex justify-between">
            <span>Fixo (Aluguel/Sistemas): <strong className="dark:text-slate-300">R$ 3.499</strong></span>
            <span>Variável: <strong className="dark:text-slate-300">R$ 1.070</strong></span>
          </div>
        </div>

        {/* Card 3: Lucro Líquido & Margem */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs space-y-2 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider font-mono">Lucro Líquido</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-950 text-emerald-400 flex items-center justify-center">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className={`text-2xl font-black font-mono tabular-nums ${summary.netProfit >= 0 ? 'text-[#004f28] dark:text-emerald-400' : 'text-rose-600'}`}>
              R$ {summary.netProfit.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
            <div className="flex items-center space-x-1 text-[11px] font-mono font-bold text-emerald-600 dark:text-emerald-400 mt-1">
              <Sparkles className="w-3.5 h-3.5 inline mr-1" />
              <span>Margem de Lucro: {summary.profitMarginPercent}%</span>
            </div>
          </div>
          <div className="text-[10px] text-slate-400 dark:text-slate-500 font-mono border-t border-slate-100 dark:border-slate-800 pt-2 flex justify-between">
            <span>Saúde Financeira: <strong className="text-emerald-600 dark:text-emerald-400 uppercase font-bold">Excelente</strong></span>
          </div>
        </div>

        {/* Card 4: Inadimplência / Pendências */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs space-y-2 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider font-mono">Saldo a Receber</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-950/80 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black text-amber-600 dark:text-amber-400 font-mono tabular-nums">
              R$ {summary.pendingIncome.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
            <div className="flex items-center space-x-1 text-[11px] font-mono font-bold text-amber-700 dark:text-amber-400 mt-1">
              <span>{transactions.filter(t => t.type === 'receita' && t.status === 'pendente').length} parcelas pendentes</span>
            </div>
          </div>
          <div className="text-[10px] text-slate-400 dark:text-slate-500 font-mono border-t border-slate-100 dark:border-slate-800 pt-2 flex justify-between">
            <span>Taxa de Inadimplência: <strong className="text-emerald-600 dark:text-emerald-400 font-bold">&lt; 2.1%</strong></span>
          </div>
        </div>

      </div>

      {/* Interactive Charts Section (Fluxo de Caixa, Origem das Receitas & Meios de Pagamento) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Fluxo de Caixa Mensal (7 cols) */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center space-x-2">
              <BarChart3 className="w-4 h-4 text-[#004f28] dark:text-emerald-400" />
              <span>Evolução do Fluxo de Caixa (Receitas vs Despesas)</span>
            </h3>
            <span className="text-[10px] font-mono text-slate-400 dark:text-slate-500">Últimos 5 Meses</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyFlowData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="incomeGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#004f28" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#004f28" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="expenseGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#e11d48" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#e11d48" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" opacity={0.6} />
                <XAxis dataKey="month" tick={{ fontSize: 10, fontWeight: 700 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fontWeight: 600 }} axisLine={false} tickLine={false} tickFormatter={(v) => `kR$${v/1000}`} />
                <Tooltip 
                  formatter={(val: any) => [`R$ ${Number(val).toLocaleString('pt-BR')}`, '']}
                  contentStyle={{ borderRadius: '8px', fontSize: '11px', fontFamily: 'monospace' }}
                />
                <Area type="monotone" dataKey="receita" name="Receita Bruta" stroke="#004f28" strokeWidth={3} fillOpacity={1} fill="url(#incomeGradient)" />
                <Area type="monotone" dataKey="despesa" name="Despesas Totais" stroke="#e11d48" strokeWidth={2} fillOpacity={1} fill="url(#expenseGradient)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="flex items-center justify-between text-[11px] font-mono text-slate-500 dark:text-slate-400 px-1 border-t border-slate-100 dark:border-slate-800 pt-3">
            <div className="flex items-center space-x-3">
              <span className="flex items-center"><span className="w-2.5 h-2.5 rounded-full bg-[#004f28] inline-block mr-1" /> Receita Bruta</span>
              <span className="flex items-center"><span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block mr-1" /> Despesas Operacionais</span>
            </div>
            <span>Resultado Acumulado: <strong className="text-[#004f28] dark:text-emerald-400">R$ {summary.netProfit.toLocaleString('pt-BR')}</strong></span>
          </div>
        </div>

        {/* Formas de Pagamento & Origem de Receita (5 cols) */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center space-x-2">
              <PieIcon className="w-4 h-4 text-sky-600 dark:text-sky-400" />
              <span>Receita por Forma de Pagamento</span>
            </h3>
            <span className="text-[10px] font-mono text-slate-400 dark:text-slate-500">Pix, Cartão & Espécie</span>
          </div>

          <div className="h-44 w-full relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={paymentMethodPieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={68}
                  paddingAngle={4}
                  dataKey="value"
                  stroke="none"
                >
                  {paymentMethodPieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(val: any) => [`R$ ${Number(val).toLocaleString('pt-BR')}`, '']} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs font-mono pt-1 border-t border-slate-100 dark:border-slate-800">
            {paymentMethodPieData.map(pm => (
              <div key={pm.name} className="flex items-center justify-between p-1.5 bg-slate-50 dark:bg-slate-800/60 rounded">
                <span className="text-slate-600 dark:text-slate-400 text-[10px] flex items-center">
                  <span className="w-2 h-2 rounded-full mr-1.5 shrink-0" style={{ backgroundColor: pm.color }} />
                  {pm.name}
                </span>
                <strong className="text-slate-900 dark:text-slate-100 text-[11px]">R$ {pm.value.toLocaleString('pt-BR')}</strong>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Transações Tabela com Filtros e Ações */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs space-y-4">
        
        {/* Filters & Search Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex items-center space-x-2">
            <FileText className="w-4 h-4 text-[#004f28] dark:text-emerald-400" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              Extrato Detalhado de Lançamentos ({filteredTransactions.length})
            </h3>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar descrição, paciente..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-[#004f28]"
              />
            </div>

            {/* Filter by Type */}
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as any)}
              className="py-1.5 px-2.5 text-xs font-mono font-bold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 focus:outline-none"
            >
              <option value="todos">Todos os Tipos</option>
              <option value="receita">Apenas Receitas (+)</option>
              <option value="despesa">Apenas Despesas (-)</option>
            </select>

            {/* Filter by Status */}
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              className="py-1.5 px-2.5 text-xs font-mono font-bold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 focus:outline-none"
            >
              <option value="todos">Todos os Status</option>
              <option value="pago">Confirmados / Pagos</option>
              <option value="pendente">Pendentes</option>
              <option value="atrasado">Atrasados</option>
            </select>
          </div>
        </div>

        {/* Transactions Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono border-collapse">
            <thead className="bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 uppercase text-[10px]">
              <tr>
                <th className="p-3 border border-slate-200 dark:border-slate-700">Data</th>
                <th className="p-3 border border-slate-200 dark:border-slate-700">Tipo</th>
                <th className="p-3 border border-slate-200 dark:border-slate-700">Categoria</th>
                <th className="p-3 border border-slate-200 dark:border-slate-700">Descrição / Paciente</th>
                <th className="p-3 border border-slate-200 dark:border-slate-700">Forma Pagto</th>
                <th className="p-3 border border-slate-200 dark:border-slate-700 text-right">Valor R$</th>
                <th className="p-3 border border-slate-200 dark:border-slate-700">Status</th>
                <th className="p-3 border border-slate-200 dark:border-slate-700 text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-slate-800 dark:text-slate-200">
              {filteredTransactions.map(tx => {
                const isIncome = tx.type === 'receita';
                return (
                  <tr key={tx.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="p-3 font-bold border border-slate-200 dark:border-slate-800 whitespace-nowrap">
                      {tx.date}
                    </td>
                    
                    {/* Type Badge */}
                    <td className="p-3 border border-slate-200 dark:border-slate-800">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        isIncome ? 'bg-emerald-100 dark:bg-emerald-950 text-[#004f28] dark:text-emerald-400' : 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-400'
                      }`}>
                        {isIncome ? '+ Receita' : '- Despesa'}
                      </span>
                    </td>

                    {/* Category */}
                    <td className="p-3 border border-slate-200 dark:border-slate-800 font-sans text-slate-700 dark:text-slate-300 font-semibold">
                      {CATEGORY_LABELS[tx.category]}
                    </td>

                    {/* Description / Patient */}
                    <td className="p-3 border border-slate-200 dark:border-slate-800 font-sans">
                      <div className="font-bold text-slate-900 dark:text-slate-100">{tx.description}</div>
                      {tx.patientName && (
                        <span className="text-[10px] text-slate-500 font-mono block">
                          Paciente: {privacyMode ? 'Confidencial' : tx.patientName}
                        </span>
                      )}
                    </td>

                    {/* Payment Method */}
                    <td className="p-3 border border-slate-200 dark:border-slate-800 font-mono text-slate-600 dark:text-slate-400">
                      {PAYMENT_METHOD_LABELS[tx.paymentMethod]}
                    </td>

                    {/* Amount */}
                    <td className={`p-3 border border-slate-200 dark:border-slate-800 text-right font-black text-sm ${
                      isIncome ? 'text-[#004f28] dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                    }`}>
                      {isIncome ? '+' : '-'} R$ {tx.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>

                    {/* Status Badge */}
                    <td className="p-3 border border-slate-200 dark:border-slate-800">
                      <button
                        onClick={() => handleToggleStatus(tx.id)}
                        className={`px-2 py-1 rounded text-[10px] font-bold uppercase flex items-center space-x-1 cursor-pointer transition-all ${
                          tx.status === 'pago' 
                            ? 'bg-emerald-100 dark:bg-emerald-950 text-[#004f28] dark:text-emerald-400 hover:bg-emerald-200' 
                            : 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-400 hover:bg-amber-200'
                        }`}
                        title="Clique para alternar o status do pagamento"
                      >
                        {tx.status === 'pago' ? <CheckCircle2 className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                        <span>{tx.status === 'pago' ? 'Confirmado' : 'Pendente'}</span>
                      </button>
                    </td>

                    {/* Actions */}
                    <td className="p-3 border border-slate-200 dark:border-slate-800 text-center">
                      <div className="flex items-center justify-center space-x-1">
                        {isIncome && (
                          <button
                            onClick={() => handleOpenReceipt(tx)}
                            className="p-1 text-slate-500 hover:text-[#004f28] hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-colors"
                            title="Gerar Recibo Médico / Nutricional para IR"
                          >
                            <Receipt className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteTransaction(tx.id)}
                          className="p-1 text-slate-400 hover:text-rose-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-colors"
                          title="Excluir Lançamento"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {filteredTransactions.length === 0 && (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-xs text-slate-400 italic">
                    Nenhum lançamento financeiro encontrado com os filtros selecionados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL 1: Novo Lançamento Financeiro (Receita / Despesa) */}
      {isNewModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center space-x-2">
                <div className={`p-2 rounded-lg ${newType === 'receita' ? 'bg-emerald-50 text-[#004f28]' : 'bg-rose-50 text-rose-600'}`}>
                  {newType === 'receita' ? <PlusCircle className="w-5 h-5" /> : <MinusCircle className="w-5 h-5" />}
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                  {newType === 'receita' ? 'Lançar Nova Receita' : 'Lançar Nova Despesa'}
                </h3>
              </div>
              <button onClick={() => setIsNewModalOpen(false)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTransaction} className="space-y-4 text-xs">
              
              {/* Type Switcher */}
              <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg">
                <button
                  type="button"
                  onClick={() => setNewType('receita')}
                  className={`py-2 text-center rounded-md font-bold transition-all ${
                    newType === 'receita' ? 'bg-[#004f28] text-white shadow-2xs' : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  + Receita (Entrada)
                </button>
                <button
                  type="button"
                  onClick={() => setNewType('despesa')}
                  className={`py-2 text-center rounded-md font-bold transition-all ${
                    newType === 'despesa' ? 'bg-rose-600 text-white shadow-2xs' : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  - Despesa (Saída)
                </button>
              </div>

              {/* Category */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 font-mono mb-1">
                  Categoria
                </label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value as FinancialCategory)}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 font-mono focus:outline-none"
                >
                  {Object.entries(CATEGORY_LABELS).map(([catKey, label]) => (
                    <option key={catKey} value={catKey}>{label}</option>
                  ))}
                </select>
              </div>

              {/* Description */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 font-mono mb-1">
                  Descrição do Lançamento
                </label>
                <input
                  type="text"
                  placeholder="Ex: Consulta de Retorno + Bioimpedância"
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 focus:outline-none"
                />
              </div>

              {/* Patient (Optional) */}
              {newType === 'receita' && (
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 font-mono mb-1">
                    Vincular a Paciente (Opcional)
                  </label>
                  <select
                    value={newPatientId}
                    onChange={(e) => setNewPatientId(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 font-mono focus:outline-none"
                  >
                    <option value="">Selecione um paciente...</option>
                    {patients.map(p => (
                      <option key={p.id} value={p.id}>{p.name} ({p.recordNumber})</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Amount & Date */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 font-mono mb-1">
                    Valor R$
                  </label>
                  <input
                    type="number"
                    step={10}
                    value={newAmount}
                    onChange={(e) => setNewAmount(Number(e.target.value))}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 font-mono font-bold focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 font-mono mb-1">
                    Data do Pagamento
                  </label>
                  <input
                    type="date"
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 font-mono focus:outline-none"
                    required
                  />
                </div>
              </div>

              {/* Payment Method & Status */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 font-mono mb-1">
                    Forma de Pagamento
                  </label>
                  <select
                    value={newPaymentMethod}
                    onChange={(e) => setNewPaymentMethod(e.target.value as PaymentMethod)}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 font-mono focus:outline-none"
                  >
                    {Object.entries(PAYMENT_METHOD_LABELS).map(([key, label]) => (
                      <option key={key} value={key}>{label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 font-mono mb-1">
                    Status do Lançamento
                  </label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value as PaymentStatus)}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 font-mono focus:outline-none"
                  >
                    <option value="pago">Confirmado / Pago</option>
                    <option value="pendente">Pendente / A Receber</option>
                  </select>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsNewModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold rounded-lg"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className={`px-5 py-2 text-white font-bold rounded-lg shadow-xs ${
                    newType === 'receita' ? 'bg-[#004f28] hover:bg-[#003c1e]' : 'bg-rose-600 hover:bg-rose-700'
                  }`}
                >
                  Salvar Lançamento
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Recibo Clínico Médico / Nutricional para Imposto de Renda */}
      {isReceiptModalOpen && receiptTx && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white text-slate-900 border border-slate-200 rounded-2xl max-w-xl w-full p-8 shadow-2xl space-y-6 animate-in fade-in zoom-in-95 duration-150 print:p-0 print:border-none print:shadow-none">
            
            {/* Modal Printable Header */}
            <div className="flex items-center justify-between border-b-2 border-[#004f28] pb-4">
              <div>
                <h2 className="text-xl font-black text-[#004f28] tracking-tight uppercase">
                  Recibo de Prestação de Serviços Nutricionais
                </h2>
                <span className="text-xs text-slate-500 font-mono font-bold block">
                  Documento Válido para Declaração de Imposto de Renda (IRPF)
                </span>
              </div>
              <div className="text-right">
                <span className="text-xs font-mono font-bold bg-emerald-50 text-[#004f28] px-2.5 py-1 rounded border border-emerald-200">
                  {receiptTx.receiptNumber || 'REC-2026-001'}
                </span>
              </div>
            </div>

            {/* Receipt Body */}
            <div className="space-y-4 text-sm font-sans leading-relaxed text-slate-800">
              <p className="bg-slate-50 p-4 rounded-xl border border-slate-200 font-mono text-xs">
                Recebi de <strong>{receiptTx.patientName || 'Paciente'}</strong>, a quantia de{' '}
                <strong className="text-[#004f28] text-base">
                  R$ {receiptTx.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </strong>{' '}
                referente a <strong>{receiptTx.description}</strong>.
              </p>

              <div className="grid grid-cols-2 gap-4 text-xs font-mono pt-2">
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                  <span className="text-slate-400 block text-[10px] uppercase">Forma de Pagamento</span>
                  <strong className="text-slate-800">{PAYMENT_METHOD_LABELS[receiptTx.paymentMethod]}</strong>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                  <span className="text-slate-400 block text-[10px] uppercase">Data do Atendimento</span>
                  <strong className="text-slate-800">{receiptTx.date}</strong>
                </div>
              </div>

              {/* Professional Signature Block */}
              <div className="pt-8 text-center space-y-1">
                <div className="w-64 h-0.5 bg-slate-400 mx-auto mb-2" />
                <div className="font-bold text-slate-900">{currentProfessional.name}</div>
                <div className="text-xs font-mono text-slate-600">
                  {currentProfessional.councilType}: {currentProfessional.registrationCode}
                </div>
                <div className="text-[11px] font-mono text-slate-500">
                  {currentProfessional.specialty} • {currentProfessional.unit}
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="pt-4 border-t border-slate-200 flex items-center justify-between print:hidden">
              <button
                onClick={() => setIsReceiptModalOpen(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg"
              >
                Fechar
              </button>

              <button
                onClick={() => window.print()}
                className="px-5 py-2 bg-[#004f28] hover:bg-[#003c1e] text-white text-xs font-bold rounded-lg flex items-center space-x-2 shadow-xs"
              >
                <Printer className="w-4 h-4" />
                <span>Imprimir Recibo PDF</span>
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
