import React, { useState, useEffect, useMemo } from 'react';
import {
  Wallet,
  PiggyBank,
  TrendingUp,
  CreditCard,
  Target,
  BarChart3,
  Sliders,
  Plus,
  Trash2,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  Download,
  AlertTriangle,
  CheckCircle2,
  Sparkles,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  Filter,
  Search,
  Layers,
  ShieldCheck,
  Info,
  Save,
  Check,
  DollarSign,
  Receipt,
  Copy,
  Repeat,
  CalendarRange,
  CheckCircle,
  Clock,
  Edit3,
  X,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';

// ============================================================================
// CONSTANTES DOS 12 MESES DO ANO (2026)
// ============================================================================
const MONTHS_2026 = [
  { index: 0, key: '2026-01', short: 'Jan', name: 'Janeiro' },
  { index: 1, key: '2026-02', short: 'Fev', name: 'Fevereiro' },
  { index: 2, key: '2026-03', short: 'Mar', name: 'Março' },
  { index: 3, key: '2026-04', short: 'Abr', name: 'Abril' },
  { index: 4, key: '2026-05', short: 'Mai', name: 'Maio' },
  { index: 5, key: '2026-06', short: 'Jun', name: 'Junho' },
  { index: 6, key: '2026-07', short: 'Jul', name: 'Julho' },
  { index: 7, key: '2026-08', short: 'Ago', name: 'Agosto' },
  { index: 8, key: '2026-09', short: 'Set', name: 'Setembro' },
  { index: 9, key: '2026-10', short: 'Out', name: 'Outubro' },
  { index: 10, key: '2026-11', short: 'Nov', name: 'Novembro' },
  { index: 11, key: '2026-12', short: 'Dez', name: 'Dezembro' },
];

// ============================================================================
// MODELO BASE DO ORÇAMENTO (EXATAMENTE FIEL À IMAGEM DE REFERÊNCIA)
// Renda: 6.599 | Moradia: 1.940 | Mercado: 2.500 | Cartões: 992 | Transp/Farm: 360
// Total Gasto: 5.792,00 (87,8%) | Total Poupado: 807,00 (12,2%)
// ============================================================================
const createBaseCategories = () => [
  {
    id: 'moradia',
    name: 'Moradia & Contas Fixas',
    shortName: 'Moradia',
    color: '#38bdf8',
    badgeBg: 'rgba(56, 189, 248, 0.15)',
    badgeText: '#7dd3fc',
    expanded: true,
    type: 'necessity',
    items: [
      { id: 'aluguel', name: 'Aluguel', value: 1200, max: 3500 },
      { id: 'luz', name: 'Conta de Luz', value: 600, max: 1500 },
      { id: 'internet', name: 'Internet', value: 140, max: 600 },
    ],
  },
  {
    id: 'mercado',
    name: 'Supermercado, Limpeza & Higiene (Híbrido)',
    shortName: 'Mercado',
    color: '#fb923c',
    badgeBg: 'rgba(251, 146, 60, 0.15)',
    badgeText: '#fdba74',
    expanded: true,
    type: 'necessity',
    hasWeeklyPixEnvelope: true,
    weeklyTargetItemId: 'pereciveis',
    items: [
      {
        id: 'secos',
        name: '1. Compra Mensal Secos/Limpeza',
        value: 1200,
        max: 3000,
      },
      {
        id: 'pereciveis',
        name: '2. Perecíveis & Açougue (4 sem.)',
        value: 1300,
        max: 3000,
      },
    ],
  },
  {
    id: 'cartoes',
    name: 'Cartões de Crédito & Cheque Especial',
    shortName: 'Cartões/Cheque',
    color: '#f87171',
    badgeBg: 'rgba(248, 113, 113, 0.15)',
    badgeText: '#fca5a5',
    expanded: true,
    type: 'lifestyle',
    isCreditCardGroup: true,
    items: [
      {
        id: 'bmg',
        name: 'Cartão BMG',
        value: 657,
        max: 3000,
        limit: 2500,
        closingDay: 10,
      },
      {
        id: 'itau',
        name: 'Cartão Itaú',
        value: 335,
        max: 3000,
        limit: 3200,
        closingDay: 15,
      },
      {
        id: 'itau_plat',
        name: 'Cartão Itaú Platinum',
        value: 0,
        max: 4000,
        limit: 5000,
        closingDay: 20,
      },
      {
        id: 'nubank',
        name: 'Cartão Nubank',
        value: 0,
        max: 4000,
        limit: 4500,
        closingDay: 5,
      },
      {
        id: 'cheque',
        name: 'Cheque Especial',
        value: 0,
        max: 2000,
        limit: 1500,
        closingDay: 1,
      },
      {
        id: 'outras_parcelas',
        name: 'Outras Despesas / Parcelas',
        value: 0,
        max: 2500,
        limit: 2500,
        closingDay: 25,
      },
    ],
  },
  {
    id: 'transporte_saude',
    name: 'Transporte, Saúde & Farmácia',
    shortName: 'Transp./Farmácia',
    color: '#facc15',
    badgeBg: 'rgba(250, 204, 21, 0.15)',
    badgeText: '#fde047',
    expanded: true,
    type: 'necessity',
    items: [
      {
        id: 'combustivel',
        name: 'Combustível & Transporte',
        value: 210,
        max: 1500,
      },
      { id: 'farmacia', name: 'Farmácia & Saúde', value: 150, max: 1200 },
    ],
  },
];

// ============================================================================
// GERADOR DOS 12 MESES DO ANO (2026) COM LANÇAMENTOS INICIAIS REALISTAS
// ============================================================================
const buildInitialYearMonths = () => {
  const monthsMap = {};

  MONTHS_2026.forEach((m) => {
    const monthNum = String(m.index + 1).padStart(2, '0');
    const isPastOrCurrent = m.index <= 10; // Jan a Nov (mês atual Nov/2026)
    const defaultStatus = m.index < 10 ? 'paid' : 'pending';

    // Lançamentos base recorrentes em todos os meses
    const baseTransactions = [
      {
        id: `tx_${m.key}_aluguel`,
        date: `2026-${monthNum}-05`,
        description: 'Aluguel Residencial',
        categoryId: 'moradia',
        subItem: 'Aluguel',
        amount: 1200,
        type: 'expense',
        paymentMethod: 'Pix / Transferência',
        status: isPastOrCurrent ? 'paid' : 'pending',
      },
      {
        id: `tx_${m.key}_luz`,
        date: `2026-${monthNum}-12`,
        description: 'Conta de Energia Elétrica',
        categoryId: 'moradia',
        subItem: 'Conta de Luz',
        amount:
          m.index === 10 ? 600 : m.index < 10 ? 565 + (m.index % 4) * 12 : 600,
        type: 'expense',
        paymentMethod: 'Débito Automático',
        status: isPastOrCurrent ? 'paid' : 'pending',
      },
      {
        id: `tx_${m.key}_internet`,
        date: `2026-${monthNum}-15`,
        description: 'Internet Fibra Óptica',
        categoryId: 'moradia',
        subItem: 'Internet',
        amount: 140,
        type: 'expense',
        paymentMethod: 'Cartão Itaú',
        status: isPastOrCurrent ? 'paid' : 'pending',
      },
      {
        id: `tx_${m.key}_secos`,
        date: `2026-${monthNum}-07`,
        description: 'Compra Mensal Secos & Limpeza',
        categoryId: 'mercado',
        subItem: '1. Compra Mensal Secos/Limpeza',
        amount:
          m.index === 10
            ? 1200
            : m.index < 10
            ? 1150 + (m.index % 3) * 25
            : 1200,
        type: 'expense',
        paymentMethod: 'Débito',
        status: isPastOrCurrent ? 'paid' : 'pending',
      },
      {
        id: `tx_${m.key}_pix_s1`,
        date: `2026-${monthNum}-08`,
        description: 'Envelope Pix Sem. 1 - Perecíveis & Açougue',
        categoryId: 'mercado',
        subItem: '2. Perecíveis & Açougue (4 sem.)',
        amount: 325,
        type: 'expense',
        paymentMethod: 'Pix Semanal',
        status: isPastOrCurrent ? 'paid' : 'pending',
      },
      {
        id: `tx_${m.key}_pix_s2`,
        date: `2026-${monthNum}-15`,
        description: 'Envelope Pix Sem. 2 - Perecíveis & Açougue',
        categoryId: 'mercado',
        subItem: '2. Perecíveis & Açougue (4 sem.)',
        amount: 325,
        type: 'expense',
        paymentMethod: 'Pix Semanal',
        status: isPastOrCurrent ? 'paid' : 'pending',
      },
      {
        id: `tx_${m.key}_pix_s3`,
        date: `2026-${monthNum}-22`,
        description: 'Envelope Pix Sem. 3 - Perecíveis & Açougue',
        categoryId: 'mercado',
        subItem: '2. Perecíveis & Açougue (4 sem.)',
        amount: 325,
        type: 'expense',
        paymentMethod: 'Pix Semanal',
        status: m.index <= 10 ? 'paid' : 'pending',
      },
      {
        id: `tx_${m.key}_pix_s4`,
        date: `2026-${monthNum}-28`,
        description: 'Envelope Pix Sem. 4 - Perecíveis & Açougue',
        categoryId: 'mercado',
        subItem: '2. Perecíveis & Açougue (4 sem.)',
        amount: 325,
        type: 'expense',
        paymentMethod: 'Pix Semanal',
        status: defaultStatus,
      },
      {
        id: `tx_${m.key}_bmg`,
        date: `2026-${monthNum}-10`,
        description: 'Fatura Cartão BMG',
        categoryId: 'cartoes',
        subItem: 'Cartão BMG',
        amount: 657,
        type: 'expense',
        paymentMethod: 'Cartão BMG',
        status: isPastOrCurrent ? 'paid' : 'pending',
      },
      {
        id: `tx_${m.key}_itau`,
        date: `2026-${monthNum}-18`,
        description: 'Fatura Cartão Itaú',
        categoryId: 'cartoes',
        subItem: 'Cartão Itaú',
        amount: 335,
        type: 'expense',
        paymentMethod: 'Cartão Itaú',
        status: isPastOrCurrent ? 'paid' : 'pending',
      },
      {
        id: `tx_${m.key}_transp`,
        date: `2026-${monthNum}-14`,
        description: 'Combustível & Mobilidade',
        categoryId: 'transporte_saude',
        subItem: 'Combustível & Transporte',
        amount: 210,
        type: 'expense',
        paymentMethod: 'Débito',
        status: isPastOrCurrent ? 'paid' : 'pending',
      },
      {
        id: `tx_${m.key}_farmacia`,
        date: `2026-${monthNum}-19`,
        description: 'Farmácia & Cuidados',
        categoryId: 'transporte_saude',
        subItem: 'Farmácia & Saúde',
        amount: 150,
        type: 'expense',
        paymentMethod: 'Cartão Itaú',
        status: isPastOrCurrent ? 'paid' : 'pending',
      },
    ];

    monthsMap[m.key] = {
      key: m.key,
      netIncome: 6599,
      categories: createBaseCategories(),
      transactions: baseTransactions,
    };
  });

  return monthsMap;
};

const INITIAL_DATA = {
  selectedYear: 2026,
  selectedMonthKey: '2026-11', // Novembro de 2026 por padrão
  monthsData: buildInitialYearMonths(),
  goals: [
    {
      id: 'g1',
      name: 'Reserva de Emergência (6 meses)',
      category: 'Segurança',
      current: 14500,
      target: 34750,
      allocationPercent: 60,
      yieldRateAnnual: 11.25,
      color: '#10b981',
    },
    {
      id: 'g2',
      name: 'Férias & Viagem em Família',
      category: 'Lazer',
      current: 3200,
      target: 8500,
      allocationPercent: 25,
      yieldRateAnnual: 10.5,
      color: '#38bdf8',
    },
    {
      id: 'g3',
      name: 'Carteira de Investimentos / Longo Prazo',
      category: 'Patrimônio',
      current: 9800,
      target: 50000,
      allocationPercent: 15,
      yieldRateAnnual: 12.4,
      color: '#a78bfa',
    },
  ],
};

const STORAGE_KEY = 'fincontrol_pro_familia_anual_2026_v2';

// Helpers de formatação monetária e percentual (BRL)
const formatBRL = (value) => {
  const num = Number(value) || 0;
  return num.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

const formatPercent = (value) => {
  const num = Number(value) || 0;
  return `${num.toFixed(1).replace('.', ',')}%`;
};

// Helper para calcular resumo de qualquer mês
const calculateMonthMetrics = (monthObj) => {
  const baseIncome = Math.max(0, Number(monthObj?.netIncome) || 0);
  const transactions = monthObj?.transactions || [];
  const categories = monthObj?.categories || [];

  // Receitas extras lançadas no mês
  const extraIncome = transactions
    .filter((t) => t.type === 'income')
    .reduce((acc, t) => acc + (Number(t.amount) || 0), 0);

  const income = baseIncome + extraIncome;

  const categorySummaries = categories.map((cat) => {
    const subtotal = cat.items.reduce(
      (acc, item) => acc + (Number(item.value) || 0),
      0
    );
    const percentOfIncome = income > 0 ? (subtotal / income) * 100 : 0;

    let weeklyPixValue = 0;
    if (cat.hasWeeklyPixEnvelope) {
      const targetItem =
        cat.items.find((i) => i.id === cat.weeklyTargetItemId) ||
        cat.items.find((i) => i.name.toLowerCase().includes('perec')) ||
        cat.items[1];
      weeklyPixValue = targetItem ? (Number(targetItem.value) || 0) / 4 : 0;
    }

    return {
      ...cat,
      subtotal,
      percentOfIncome,
      weeklyPixValue,
    };
  });

  const totalPlannedExpenses = categorySummaries.reduce(
    (acc, c) => acc + c.subtotal,
    0
  );
  const totalPlannedSaved = income - totalPlannedExpenses;
  const expensePercent = income > 0 ? (totalPlannedExpenses / income) * 100 : 0;
  const savingsRate = income > 0 ? (totalPlannedSaved / income) * 100 : 0;

  // Lançamentos reais
  const actualSpentByCategory = {};
  let totalActualExpenses = 0;
  let totalPaidExpenses = 0;
  let totalPendingExpenses = 0;

  transactions.forEach((tx) => {
    const amt = Number(tx.amount) || 0;
    if (tx.type === 'expense') {
      actualSpentByCategory[tx.categoryId] =
        (actualSpentByCategory[tx.categoryId] || 0) + amt;
      totalActualExpenses += amt;
      if (tx.status === 'paid') {
        totalPaidExpenses += amt;
      } else {
        totalPendingExpenses += amt;
      }
    }
  });

  const totalActualSaved = income - totalActualExpenses;

  const necessitiesTotal = categorySummaries
    .filter((c) => c.type === 'necessity')
    .reduce((acc, c) => acc + c.subtotal, 0);
  const lifestyleTotal = categorySummaries
    .filter((c) => c.type === 'lifestyle')
    .reduce((acc, c) => acc + c.subtotal, 0);

  return {
    baseIncome,
    extraIncome,
    income,
    categorySummaries,
    totalExpenses: totalPlannedExpenses,
    totalSaved: totalPlannedSaved,
    expensePercent,
    savingsRate,
    necessitiesPct: income > 0 ? (necessitiesTotal / income) * 100 : 0,
    lifestylePct: income > 0 ? (lifestyleTotal / income) * 100 : 0,
    actualSpentByCategory,
    totalActualSpent: totalActualExpenses,
    totalPaidExpenses,
    totalPendingExpenses,
    totalActualSaved,
    txCount: transactions.length,
  };
};

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================
export default function App() {
  // Estado principal com persistência local
  const [state, setState] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.monthsData && parsed.selectedMonthKey) {
          return parsed;
        }
      }
    } catch (e) {
      console.error('Erro ao carregar dados do localStorage:', e);
    }
    return INITIAL_DATA;
  });

  const [activeTab, setActiveTab] = useState('simulator');
  const [toastMessage, setToastMessage] = useState(null);

  // Estados de modais/formulários inline no Simulador
  const [addingItemToCat, setAddingItemToCat] = useState(null);
  const [newItemName, setNewItemName] = useState('');
  const [newItemValue, setNewItemValue] = useState('');

  // Estados da aba de Lançamentos Mensais
  const [txFilterCategory, setTxFilterCategory] = useState('all');
  const [txFilterStatus, setTxFilterStatus] = useState('all');
  const [txSearch, setTxSearch] = useState('');
  const [editingTxId, setEditingTxId] = useState(null);

  // Mês selecionado atual
  const selectedMonthMeta = useMemo(
    () =>
      MONTHS_2026.find((m) => m.key === state.selectedMonthKey) ||
      MONTHS_2026[10],
    [state.selectedMonthKey]
  );

  const currentMonthData = useMemo(
    () =>
      state.monthsData[state.selectedMonthKey] || state.monthsData['2026-11'],
    [state.monthsData, state.selectedMonthKey]
  );

  const [newTx, setNewTx] = useState({
    type: 'expense', // 'expense' | 'income'
    description: '',
    amount: '',
    categoryId: 'mercado',
    subItem: '',
    paymentMethod: 'Pix Semanal',
    date: `${state.selectedMonthKey}-15`,
    status: 'paid',
    recurrenceMode: 'single', // 'single' | 'repeat_year' | 'installments'
    installmentsCount: 3,
    syncWithBudget: false,
  });

  // Atualiza data padrão do formulário quando usuário troca de mês
  useEffect(() => {
    setNewTx((prev) => ({
      ...prev,
      date: `${state.selectedMonthKey}-10`,
    }));
  }, [state.selectedMonthKey]);

  // Estados da aba de Metas
  const [newGoalName, setNewGoalName] = useState('');
  const [newGoalTarget, setNewGoalTarget] = useState('');
  const [newGoalCurrent, setNewGoalCurrent] = useState('');
  const [newGoalAllocation, setNewGoalAllocation] = useState('10');

  // Salvar no localStorage automaticamente
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      console.error('Erro ao salvar no localStorage:', e);
    }
  }, [state]);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // ============================================================================
  // MÉTRICAS DO MÊS SELECIONADO E CONSOLIDADO DOS 12 MESES
  // ============================================================================
  const metrics = useMemo(
    () => calculateMonthMetrics(currentMonthData),
    [currentMonthData]
  );

  const annualSummary = useMemo(() => {
    let accSavedPlanned = 0;
    let accSavedActual = 0;
    let totalYearIncome = 0;
    let totalYearPlannedExpense = 0;
    let totalYearActualExpense = 0;

    const monthsList = MONTHS_2026.map((m) => {
      const mData = state.monthsData[m.key];
      const mMetrics = calculateMonthMetrics(mData);
      accSavedPlanned += mMetrics.totalSaved;
      accSavedActual += mMetrics.totalActualSaved;
      totalYearIncome += mMetrics.income;
      totalYearPlannedExpense += mMetrics.totalExpenses;
      totalYearActualExpense += mMetrics.totalActualSpent;

      return {
        ...m,
        metrics: mMetrics,
        accSavedPlanned,
        accSavedActual,
      };
    });

    return {
      monthsList,
      totalYearIncome,
      totalYearPlannedExpense,
      totalYearActualExpense,
      totalYearPlannedSaved: totalYearIncome - totalYearPlannedExpense,
      totalYearActualSaved: totalYearIncome - totalYearActualExpense,
    };
  }, [state.monthsData]);

  // Helper para atualizar dados apenas do mês selecionado
  const updateCurrentMonth = (updaterFn) => {
    setState((prev) => {
      const curr = prev.monthsData[prev.selectedMonthKey];
      if (!curr) return prev;
      return {
        ...prev,
        monthsData: {
          ...prev.monthsData,
          [prev.selectedMonthKey]: updaterFn(curr),
        },
      };
    });
  };

  // ============================================================================
  // MANIPULADORES DE AÇÕES DO SIMULADOR (POR MÊS)
  // ============================================================================
  const handleSelectMonth = (monthKey) => {
    setState((prev) => ({ ...prev, selectedMonthKey: monthKey }));
  };

  const handleCopyFromPreviousMonth = () => {
    const currIdx = selectedMonthMeta.index;
    if (currIdx === 0) {
      showToast('Janeiro já é o primeiro mês do ano.');
      return;
    }
    const prevMonthMeta = MONTHS_2026[currIdx - 1];
    const prevMonthData = state.monthsData[prevMonthMeta.key];
    if (!prevMonthData) return;

    const clonedCategories = JSON.parse(
      JSON.stringify(prevMonthData.categories)
    );
    const targetMonthNum = String(currIdx + 1).padStart(2, '0');

    // Clona lançamentos ajustando o mês da data e marcando como pendente se for mês futuro
    const clonedTransactions = prevMonthData.transactions.map((t, idx) => {
      const dayPart = t.date.split('-')[2] || '10';
      return {
        ...t,
        id: `tx_${state.selectedMonthKey}_copy_${Date.now()}_${idx}`,
        date: `2026-${targetMonthNum}-${dayPart}`,
        status: currIdx >= 11 ? 'pending' : t.status,
      };
    });

    updateCurrentMonth((curr) => ({
      ...curr,
      netIncome: prevMonthData.netIncome,
      categories: clonedCategories,
      transactions: clonedTransactions,
    }));

    showToast(
      `Planejamento e lançamentos de ${prevMonthMeta.name} copiados para ${selectedMonthMeta.name}!`
    );
  };

  const handleIncomeChange = (val) => {
    const clean = Math.max(0, Number(val) || 0);
    updateCurrentMonth((curr) => ({ ...curr, netIncome: clean }));
  };

  const handleItemValueChange = (catId, itemId, newValue) => {
    const numericVal = Math.max(0, Number(newValue) || 0);
    updateCurrentMonth((curr) => ({
      ...curr,
      categories: curr.categories.map((cat) => {
        if (cat.id !== catId) return cat;
        return {
          ...cat,
          items: cat.items.map((item) => {
            if (item.id !== itemId) return item;
            const updatedMax =
              numericVal > item.max ? Math.ceil(numericVal * 1.25) : item.max;
            return { ...item, value: numericVal, max: updatedMax };
          }),
        };
      }),
    }));
  };

  const toggleCategoryExpand = (catId) => {
    updateCurrentMonth((curr) => ({
      ...curr,
      categories: curr.categories.map((cat) =>
        cat.id === catId ? { ...cat, expanded: !cat.expanded } : cat
      ),
    }));
  };

  const handleAddItem = (catId) => {
    if (!newItemName.trim()) return;
    const val = Math.max(0, Number(newItemValue) || 0);
    const newItem = {
      id: `item_${Date.now()}`,
      name: newItemName.trim(),
      value: val,
      max: Math.max(2000, Math.ceil(val * 1.5)),
      limit: Math.max(3000, Math.ceil(val * 2)),
      closingDay: 15,
    };

    updateCurrentMonth((curr) => ({
      ...curr,
      categories: curr.categories.map((cat) =>
        cat.id === catId
          ? { ...cat, expanded: true, items: [...cat.items, newItem] }
          : cat
      ),
    }));

    setNewItemName('');
    setNewItemValue('');
    setAddingItemToCat(null);
    showToast(
      `Item "${newItem.name}" adicionado em ${selectedMonthMeta.name}!`
    );
  };

  const handleDeleteItem = (catId, itemId) => {
    updateCurrentMonth((curr) => ({
      ...curr,
      categories: curr.categories.map((cat) =>
        cat.id === catId
          ? { ...cat, items: cat.items.filter((i) => i.id !== itemId) }
          : cat
      ),
    }));
    showToast('Item removido do planejamento do mês.');
  };

  const handleResetToImageDefaults = () => {
    setState(INITIAL_DATA);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_DATA));
    showToast('Todos os 12 meses foram restaurados para o modelo original!');
  };

  const applyOptimizedScenario = () => {
    updateCurrentMonth((curr) => ({
      ...curr,
      categories: curr.categories.map((cat) => {
        if (cat.id === 'mercado') {
          return {
            ...cat,
            items: cat.items.map((item) => ({
              ...item,
              value: Math.round(item.value * 0.85),
            })),
          };
        }
        if (cat.id === 'cartoes') {
          return {
            ...cat,
            items: cat.items.map((item) => ({
              ...item,
              value: Math.round(item.value * 0.8),
            })),
          };
        }
        return cat;
      }),
    }));
    showToast(
      `Simulação Otimizada aplicada em ${selectedMonthMeta.name}! Veja o salto na Taxa de Poupança.`
    );
  };

  // ============================================================================
  // MANIPULADORES DE LANÇAMENTOS MENSAIS (ÚNICO, RECORRENTE OU PARCELADO)
  // ============================================================================
  const handleAddTransaction = (e) => {
    e.preventDefault();
    if (!newTx.description.trim() || !newTx.amount) return;

    const totalAmount = Math.abs(Number(newTx.amount));
    const startIdx = selectedMonthMeta.index;
    const dayPart = newTx.date.split('-')[2] || '10';

    setState((prev) => {
      const updatedMonthsData = { ...prev.monthsData };

      if (newTx.recurrenceMode === 'single') {
        const mKey = prev.selectedMonthKey;
        const tx = {
          id: `tx_${Date.now()}`,
          date: newTx.date,
          description: newTx.description.trim(),
          categoryId: newTx.categoryId,
          subItem: newTx.subItem,
          amount: totalAmount,
          type: newTx.type,
          paymentMethod: newTx.paymentMethod,
          status: newTx.status,
        };
        updatedMonthsData[mKey] = {
          ...updatedMonthsData[mKey],
          transactions: [tx, ...updatedMonthsData[mKey].transactions],
        };
      } else if (newTx.recurrenceMode === 'repeat_year') {
        // Replica para o mês atual e todos os meses seguintes até Dezembro
        for (let i = startIdx; i < 12; i++) {
          const m = MONTHS_2026[i];
          const monthNum = String(i + 1).padStart(2, '0');
          const tx = {
            id: `tx_rec_${Date.now()}_${i}`,
            date: `2026-${monthNum}-${dayPart}`,
            description: `${newTx.description.trim()} (Recorrente)`,
            categoryId: newTx.categoryId,
            subItem: newTx.subItem,
            amount: totalAmount,
            type: newTx.type,
            paymentMethod: newTx.paymentMethod,
            status: i === startIdx ? newTx.status : 'pending',
          };
          updatedMonthsData[m.key] = {
            ...updatedMonthsData[m.key],
            transactions: [tx, ...updatedMonthsData[m.key].transactions],
          };
        }
      } else if (newTx.recurrenceMode === 'installments') {
        // Divide em Nx parcelas distribuídas nos meses subsequentes
        const count = Math.min(
          12,
          Math.max(2, Number(newTx.installmentsCount) || 2)
        );
        const installmentValue = Number((totalAmount / count).toFixed(2));

        for (let p = 0; p < count; p++) {
          const targetIdx = startIdx + p;
          if (targetIdx >= 12) break; // Limita ao ano calendário 2026
          const m = MONTHS_2026[targetIdx];
          const monthNum = String(targetIdx + 1).padStart(2, '0');
          const tx = {
            id: `tx_parc_${Date.now()}_${p}`,
            date: `2026-${monthNum}-${dayPart}`,
            description: `${newTx.description.trim()} (${p + 1}/${count})`,
            categoryId: newTx.categoryId,
            subItem: newTx.subItem,
            amount: installmentValue,
            type: newTx.type,
            paymentMethod: newTx.paymentMethod,
            status: p === 0 ? newTx.status : 'pending',
          };
          updatedMonthsData[m.key] = {
            ...updatedMonthsData[m.key],
            transactions: [tx, ...updatedMonthsData[m.key].transactions],
          };
        }
      }

      return {
        ...prev,
        monthsData: updatedMonthsData,
      };
    });

    if (newTx.recurrenceMode === 'repeat_year') {
      const monthsAffected = 12 - startIdx;
      showToast(
        `Lançamento replicado para ${monthsAffected} meses (${selectedMonthMeta.short} a Dez)!`
      );
    } else if (newTx.recurrenceMode === 'installments') {
      showToast(`Compra parcelada lançada automaticamente nos próximos meses!`);
    } else {
      showToast(`Lançamento registrado em ${selectedMonthMeta.name}!`);
    }

    setNewTx((prev) => ({
      ...prev,
      description: '',
      amount: '',
      recurrenceMode: 'single',
    }));
  };

  const handleToggleTransactionStatus = (txId) => {
    updateCurrentMonth((curr) => ({
      ...curr,
      transactions: curr.transactions.map((t) =>
        t.id === txId
          ? { ...t, status: t.status === 'paid' ? 'pending' : 'paid' }
          : t
      ),
    }));
  };

  const handleUpdateTransactionAmount = (txId, newAmount) => {
    const val = Math.max(0, Number(newAmount) || 0);
    updateCurrentMonth((curr) => ({
      ...curr,
      transactions: curr.transactions.map((t) =>
        t.id === txId ? { ...t, amount: val } : t
      ),
    }));
    setEditingTxId(null);
    showToast('Valor do lançamento atualizado.');
  };

  const handleDeleteTransaction = (id) => {
    updateCurrentMonth((curr) => ({
      ...curr,
      transactions: curr.transactions.filter((t) => t.id !== id),
    }));
    showToast('Lançamento excluído.');
  };

  const handleSyncActualToBudget = () => {
    // Atualiza os valores dos sliders do mês com a soma real lançada em cada categoria
    updateCurrentMonth((curr) => ({
      ...curr,
      categories: curr.categories.map((cat) => {
        const actualCatTotal = metrics.actualSpentByCategory[cat.id];
        if (actualCatTotal === undefined || cat.items.length === 0) return cat;
        const currentPlanned = cat.items.reduce((a, b) => a + b.value, 0);
        if (currentPlanned === 0) {
          return {
            ...cat,
            items: cat.items.map((item, idx) =>
              idx === 0 ? { ...item, value: Math.round(actualCatTotal) } : item
            ),
          };
        }
        const ratio = actualCatTotal / currentPlanned;
        return {
          ...cat,
          items: cat.items.map((item) => {
            const newVal = Math.round(item.value * ratio);
            return {
              ...item,
              value: newVal,
              max: newVal > item.max ? Math.ceil(newVal * 1.25) : item.max,
            };
          }),
        };
      }),
    }));
    showToast(
      `Sliders de ${selectedMonthMeta.name} sincronizados com os lançamentos reais!`
    );
  };

  // ============================================================================
  // MANIPULADORES DE METAS
  // ============================================================================
  const handleAddGoal = (e) => {
    e.preventDefault();
    if (!newGoalName.trim() || !newGoalTarget) return;

    const goal = {
      id: `goal_${Date.now()}`,
      name: newGoalName.trim(),
      category: 'Personalizada',
      current: Math.max(0, Number(newGoalCurrent) || 0),
      target: Math.max(100, Number(newGoalTarget) || 1000),
      allocationPercent: Math.min(
        100,
        Math.max(0, Number(newGoalAllocation) || 10)
      ),
      yieldRateAnnual: 11.0,
      color: '#34d399',
    };

    setState((prev) => ({
      ...prev,
      goals: [...prev.goals, goal],
    }));

    setNewGoalName('');
    setNewGoalTarget('');
    setNewGoalCurrent('');
    showToast(`Meta "${goal.name}" criada com sucesso!`);
  };

  const handleContributeToGoal = (goalId, amount) => {
    if (amount <= 0) return;
    setState((prev) => ({
      ...prev,
      goals: prev.goals.map((g) =>
        g.id === goalId ? { ...g, current: g.current + amount } : g
      ),
    }));
    showToast(`Aporte de ${formatBRL(amount)} registrado na meta!`);
  };

  // ============================================================================
  // EXPORTAÇÃO DE RELATÓRIO CSV (MENSAL OU ANUAL COMPLETO)
  // ============================================================================
  const handleExportCSV = (scope = 'month') => {
    let rows = [];
    let filename = '';

    if (scope === 'annual') {
      rows = [
        [
          'Mês (2026)',
          'Renda Total (R$)',
          'Gasto Planejado (R$)',
          'Gasto Realizado (R$)',
          'Poupança Planejada (R$)',
          'Poupança Realizada (R$)',
          'Acumulado Ano Real (R$)',
        ],
      ];
      annualSummary.monthsList.forEach((m) => {
        rows.push([
          `${m.name}/2026`,
          m.metrics.income.toFixed(2),
          m.metrics.totalExpenses.toFixed(2),
          m.metrics.totalActualSpent.toFixed(2),
          m.metrics.totalSaved.toFixed(2),
          m.metrics.totalActualSaved.toFixed(2),
          m.accSavedActual.toFixed(2),
        ]);
      });
      filename = `controle_financeiro_anual_2026.csv`;
    } else {
      rows = [
        [
          'Mês',
          'Categoria',
          'Item / Despesa',
          'Valor Planejado (R$)',
          '% da Renda',
        ],
        [
          `${selectedMonthMeta.name}/2026`,
          'Renda Líquida Mensal',
          'Salário + Extras',
          metrics.income.toFixed(2),
          '100.0%',
        ],
      ];

      metrics.categorySummaries.forEach((cat) => {
        cat.items.forEach((item) => {
          const pct =
            metrics.income > 0
              ? ((item.value / metrics.income) * 100).toFixed(1)
              : '0.0';
          rows.push([
            `${selectedMonthMeta.name}/2026`,
            cat.name,
            item.name,
            item.value.toFixed(2),
            `${pct}%`,
          ]);
        });
      });

      rows.push([
        `${selectedMonthMeta.name}/2026`,
        'RESUMO PLANEJADO',
        'Total Gasto no Mês',
        metrics.totalExpenses.toFixed(2),
        `${metrics.expensePercent.toFixed(1)}%`,
      ]);
      rows.push([
        `${selectedMonthMeta.name}/2026`,
        'RESUMO PLANEJADO',
        'Total Poupado / Saldo Livre',
        metrics.totalSaved.toFixed(2),
        `${metrics.savingsRate.toFixed(1)}%`,
      ]);
      rows.push([]);
      rows.push([
        'LANÇAMENTOS REAIS DO MÊS',
        'Data',
        'Descrição',
        'Forma Pgto',
        'Valor (R$)',
        'Status',
      ]);
      currentMonthData.transactions.forEach((tx) => {
        rows.push([
          selectedMonthMeta.short,
          tx.date,
          tx.description,
          tx.paymentMethod,
          tx.amount.toFixed(2),
          tx.status === 'paid' ? 'Pago' : 'Pendente',
        ]);
      });

      filename = `orcamento_${selectedMonthMeta.key}.csv`;
    }

    const csvContent =
      'data:text/csv;charset=utf-8,\uFEFF' +
      rows.map((e) => e.map((cell) => `"${cell ?? ''}"`).join(';')).join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast(
      `Planilha ${
        scope === 'annual' ? 'Anual 2026' : selectedMonthMeta.name
      } exportada!`
    );
  };

  // ============================================================================
  // DADOS PARA GRÁFICOS (RECHARTS)
  // ============================================================================
  const analyticsData = useMemo(() => {
    const evolution = annualSummary.monthsList.map((m) => ({
      month: m.short,
      renda: m.metrics.income,
      planejado: m.metrics.totalExpenses,
      realizado: m.metrics.totalActualSpent,
      poupadoReal: Math.max(0, m.metrics.totalActualSaved),
      acumulado: m.accSavedActual,
    }));

    const plannedVsActual = metrics.categorySummaries.map((cat) => ({
      name: cat.shortName,
      Planejado: cat.subtotal,
      Realizado: metrics.actualSpentByCategory[cat.id] || 0,
      color: cat.color,
    }));

    const donutData = [
      ...metrics.categorySummaries.map((c) => ({
        name: c.shortName,
        value: c.subtotal,
        color: c.color,
      })),
      ...(metrics.totalSaved > 0
        ? [{ name: 'Poupado', value: metrics.totalSaved, color: '#34d399' }]
        : []),
    ];

    return { evolution, plannedVsActual, donutData };
  }, [annualSummary, metrics]);

  // ============================================================================
  // RENDERIZAÇÃO
  // ============================================================================
  return (
    <div className="min-h-screen bg-[#0f1115] text-slate-100 font-sans selection:bg-emerald-500/30 selection:text-emerald-200 pb-16">
      {/* Estilos customizados para Range Sliders e Scrollbars */}
      <style>{`
        .tabular-nums {
          font-variant-numeric: tabular-nums;
        }
        input[type="range"].fintech-slider {
          -webkit-appearance: none;
          appearance: none;
          width: 100%;
          height: 6px;
          border-radius: 999px;
          background: #1e293b;
          outline: none;
          cursor: pointer;
          transition: background 0.2s;
        }
        input[type="range"].fintech-slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 18px;
          height: 18px;
          border-radius: 50%;
          background: #38bdf8;
          border: 3px solid #0f172a;
          box-shadow: 0 0 0 2px rgba(56, 189, 248, 0.35), 0 4px 10px rgba(0, 0, 0, 0.4);
          cursor: grab;
          transition: transform 0.15s ease, background-color 0.15s ease;
        }
        input[type="range"].fintech-slider::-webkit-slider-thumb:hover {
          transform: scale(1.15);
          background: #7dd3fc;
        }
        input[type="range"].fintech-slider::-webkit-slider-thumb:active {
          cursor: grabbing;
          transform: scale(1.05);
        }
        input[type="range"].fintech-slider::-moz-range-thumb {
          width: 18px;
          height: 18px;
          border-radius: 50%;
          background: #38bdf8;
          border: 3px solid #0f172a;
          box-shadow: 0 0 0 2px rgba(56, 189, 248, 0.35);
          cursor: grab;
        }
      `}</style>

      {/* Notificação Flutuante (Toast) */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2.5 bg-[#161920]/95 border border-emerald-500/40 text-emerald-300 px-4 py-3 rounded-xl shadow-2xl backdrop-blur-md">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="text-sm font-medium">{toastMessage}</span>
        </div>
      )}

      {/* ====================================================================
          TOPBAR EXECUTIVA, SELETOR DOS 12 MESES & NAVEGAÇÃO
         ==================================================================== */}
      <header className="sticky top-0 z-30 bg-[#0f1115]/95 backdrop-blur-xl border-b border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Linha 1: Título + Ações Rápidas */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between py-3 gap-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                  <Wallet className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h1 className="text-lg sm:text-xl font-bold tracking-tight text-white">
                      Controle Financeiro e Metas Familiar
                    </h1>
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      {selectedMonthMeta.name} 2026
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">
                    Planejamento Mensal & Lançamentos Anuais (Jan–Dez 2026)
                  </p>
                </div>
              </div>

              {/* Ações Rápidas Mobile */}
              <div className="flex md:hidden items-center gap-1.5">
                <button
                  onClick={handleCopyFromPreviousMonth}
                  title="Copiar do Mês Anterior"
                  className="p-2 rounded-lg bg-[#161920] hover:bg-slate-800 text-sky-300 border border-slate-700/70 transition"
                >
                  <Copy className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleExportCSV('month')}
                  title="Exportar CSV"
                  className="p-2 rounded-lg bg-[#161920] hover:bg-slate-800 text-slate-300 border border-slate-700/70 transition"
                >
                  <Download className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Ações Rápidas Desktop */}
            <div className="hidden md:flex items-center gap-2">
              {selectedMonthMeta.index > 0 && (
                <button
                  onClick={handleCopyFromPreviousMonth}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-sky-500/10 hover:bg-sky-500/20 text-sky-300 border border-sky-500/30 transition cursor-pointer"
                >
                  <Copy className="w-3.5 h-3.5" />
                  Copiar de {MONTHS_2026[selectedMonthMeta.index - 1].short}
                </button>
              )}
              <button
                onClick={applyOptimizedScenario}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 transition cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                Otimizar Mês
              </button>
              <button
                onClick={() => handleExportCSV('month')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-[#161920] hover:bg-slate-800 text-slate-200 border border-slate-700 transition cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                CSV Mês
              </button>
              <button
                onClick={handleResetToImageDefaults}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-[#161920] hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-700 transition cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Restaurar
              </button>
            </div>
          </div>

          {/* Linha 2: SELETOR HORIZONTAL DOS 12 MESES DO ANO (JAN A DEZ 2026) */}
          <div className="py-2 border-t border-slate-800/70">
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-0.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 px-2 shrink-0 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-emerald-400" />
                2026:
              </span>
              {annualSummary.monthsList.map((m) => {
                const isSelected = m.key === state.selectedMonthKey;
                const isPositive = m.metrics.totalSaved >= 0;
                const txCount = m.metrics.txCount;

                return (
                  <button
                    key={m.key}
                    onClick={() => handleSelectMonth(m.key)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all shrink-0 cursor-pointer border ${
                      isSelected
                        ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-md shadow-emerald-500/20'
                        : 'bg-[#161920] hover:bg-slate-800 text-slate-300 border-slate-800'
                    }`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        isSelected
                          ? 'bg-slate-950'
                          : isPositive
                          ? 'bg-emerald-400'
                          : 'bg-rose-400'
                      }`}
                    />
                    <span>{m.short}</span>
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded-full tabular-nums ${
                        isSelected
                          ? 'bg-slate-950/20 text-slate-950 font-bold'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {txCount}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Linha 3: Barra de Navegação por Abas */}
          <nav className="flex items-center gap-1 overflow-x-auto pb-2.5 pt-1.5 border-t border-slate-800/50 no-scrollbar">
            {[
              {
                id: 'simulator',
                label: 'Simulador & Orçamento',
                icon: Sliders,
              },
              {
                id: 'transactions',
                label: `Fluxo & Lançamentos (${selectedMonthMeta.short})`,
                icon: Receipt,
              },
              {
                id: 'annual',
                label: 'Visão Anual (12 Meses)',
                icon: CalendarRange,
              },
              { id: 'cards', label: 'Cartões & Faturas', icon: CreditCard },
              { id: 'goals', label: 'Metas & Patrimônio', icon: Target },
              {
                id: 'analytics',
                label: 'Analytics & Insights',
                icon: BarChart3,
              },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs sm:text-sm font-medium whitespace-nowrap transition-all cursor-pointer ${
                    isActive
                      ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 shadow-sm'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-[#161920] border border-transparent'
                  }`}
                >
                  <Icon
                    className={`w-4 h-4 ${
                      isActive ? 'text-emerald-400' : 'text-slate-400'
                    }`}
                  />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>
      </header>

      {/* ====================================================================
          CONTEÚDO PRINCIPAL
         ==================================================================== */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-6">
        {/* ==================================================================
            1. KPIs PRINCIPAIS DO MÊS SELECIONADO NO TOPO
           ================================================================== */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* KPI 1: Total Gasto no Mês */}
          <div className="bg-[#161920] border border-slate-800/90 rounded-2xl p-5 flex flex-col items-center justify-center text-center shadow-lg relative overflow-hidden">
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-1.5">
              Total gasto em {selectedMonthMeta.name}
            </span>
            <div className="text-3xl sm:text-4xl font-extrabold text-white tabular-nums tracking-tight">
              {formatBRL(metrics.totalExpenses)}
            </div>
            <div className="mt-2.5 flex flex-wrap items-center justify-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-slate-800/90 text-slate-300 border border-slate-700/80 tabular-nums">
                {formatPercent(metrics.expensePercent)} da renda gasta
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium bg-sky-500/10 text-sky-300 border border-sky-500/20 tabular-nums">
                Lançado: {formatBRL(metrics.totalActualSpent)}
              </span>
            </div>
          </div>

          {/* KPI 2: Total Poupado / Saldo Livre */}
          <div
            className={`bg-[#161920] border rounded-2xl p-5 flex flex-col items-center justify-center text-center shadow-lg relative overflow-hidden ${
              metrics.totalSaved >= 0
                ? 'border-emerald-500/25'
                : 'border-rose-500/40'
            }`}
          >
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-1.5">
              Total poupado / saldo livre ({selectedMonthMeta.short})
            </span>
            <div
              className={`text-3xl sm:text-4xl font-extrabold tabular-nums tracking-tight ${
                metrics.totalSaved >= 0 ? 'text-emerald-400' : 'text-rose-400'
              }`}
            >
              {formatBRL(metrics.totalSaved)}
            </div>
            <div className="mt-2.5 flex flex-wrap items-center justify-center gap-2">
              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border tabular-nums ${
                  metrics.totalSaved >= 0
                    ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                    : 'bg-rose-500/15 text-rose-300 border-rose-500/30'
                }`}
              >
                {metrics.totalSaved >= 0
                  ? `${formatPercent(metrics.savingsRate)} da renda poupada`
                  : `Déficit de ${formatPercent(
                      Math.abs(metrics.savingsRate)
                    )}`}
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium bg-slate-800/90 text-slate-300 border border-slate-700/80 tabular-nums">
                Saldo Real: {formatBRL(metrics.totalActualSaved)}
              </span>
            </div>
          </div>

          {/* KPI 3: Taxa de Poupança */}
          <div className="bg-[#161920] border border-slate-800/90 rounded-2xl p-5 flex flex-col items-center justify-center text-center shadow-lg relative overflow-hidden">
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-1.5">
              Taxa de poupança ({selectedMonthMeta.short})
            </span>
            <div
              className={`text-3xl sm:text-4xl font-extrabold tabular-nums tracking-tight ${
                metrics.savingsRate >= 10
                  ? 'text-emerald-400'
                  : metrics.savingsRate > 0
                  ? 'text-amber-400'
                  : 'text-rose-400'
              }`}
            >
              {formatPercent(Math.max(0, metrics.savingsRate))}
            </div>
            <button
              onClick={() => setActiveTab('annual')}
              className="mt-2.5 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-slate-800/90 hover:bg-slate-800 text-slate-300 border border-slate-700/80 transition cursor-pointer tabular-nums"
            >
              Acumulado 2026: {formatBRL(annualSummary.totalYearPlannedSaved)}
              <ArrowUpRight className="w-3.5 h-3.5 text-emerald-400" />
            </button>
          </div>
        </section>

        {/* ==================================================================
            VISÃO 1: SIMULADOR & ORÇAMENTO BASE ZERO DO MÊS SELECIONADO
           ================================================================== */}
        {activeTab === 'simulator' && (
          <div className="space-y-6">
            {/* Bloco de Renda Líquida Mensal & Barra de Distribuição */}
            <section className="bg-[#161920] border border-slate-800/90 rounded-2xl p-5 sm:p-6 shadow-lg space-y-6">
              <div>
                <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                  <label
                    htmlFor="net-income-input"
                    className="text-sm font-semibold text-slate-200 flex items-center gap-2"
                  >
                    Renda líquida mensal — {selectedMonthMeta.name}/2026 (R$)
                    {metrics.extraIncome > 0 && (
                      <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 tabular-nums">
                        + {formatBRL(metrics.extraIncome)} receitas extras
                        lançadas
                      </span>
                    )}
                  </label>
                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <span>Regra 50-30-20:</span>
                    <span className="text-sky-400 font-medium tabular-nums">
                      Essenciais {formatPercent(metrics.necessitiesPct)}
                    </span>
                    <span>•</span>
                    <span className="text-rose-400 font-medium tabular-nums">
                      Cartões {formatPercent(metrics.lifestylePct)}
                    </span>
                  </div>
                </div>

                <div className="relative flex items-center bg-[#0f1115] border border-slate-700/90 focus-within:border-emerald-500/70 focus-within:ring-2 focus-within:ring-emerald-500/20 rounded-xl px-4 py-3 transition">
                  <span className="text-slate-400 font-semibold text-base mr-2.5 select-none">
                    R$
                  </span>
                  <input
                    id="net-income-input"
                    type="number"
                    min="0"
                    step="50"
                    value={currentMonthData.netIncome}
                    onChange={(e) => handleIncomeChange(e.target.value)}
                    className="w-full bg-transparent text-white font-bold text-lg tabular-nums focus:outline-none"
                    placeholder="0,00"
                  />
                  <div className="hidden sm:flex items-center gap-1.5 ml-3">
                    {[5000, 6599, 8000, 10000].map((preset) => (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => handleIncomeChange(preset)}
                        className={`px-2.5 py-1 rounded-md text-xs font-medium tabular-nums transition cursor-pointer ${
                          Number(currentMonthData.netIncome) === preset
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                            : 'bg-slate-800/80 text-slate-400 hover:text-slate-200 border border-slate-700/60'
                        }`}
                      >
                        R$ {preset.toLocaleString('pt-BR')}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Barra Horizontal Segmentada de Distribuição */}
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs sm:text-sm">
                  <span className="font-semibold text-slate-200">
                    Distribuição da renda: Gasto vs. Poupado (%)
                  </span>
                  <span className="text-slate-400 text-xs">
                    Percentual sobre a renda
                  </span>
                </div>

                <div className="w-full h-3.5 bg-slate-800 rounded-full overflow-hidden flex gap-0.5 p-0.5 border border-slate-700/60">
                  {metrics.categorySummaries.map((cat) => {
                    const widthPct =
                      metrics.income > 0
                        ? Math.min(
                            100,
                            (cat.subtotal /
                              Math.max(metrics.income, metrics.totalExpenses)) *
                              100
                          )
                        : 0;
                    if (widthPct <= 0) return null;
                    return (
                      <div
                        key={cat.id}
                        style={{
                          width: `${widthPct}%`,
                          backgroundColor: cat.color,
                        }}
                        title={`${cat.shortName}: ${formatBRL(
                          cat.subtotal
                        )} (${formatPercent(cat.percentOfIncome)})`}
                        className="h-full first:rounded-l-full last:rounded-r-full transition-all duration-300"
                      />
                    );
                  })}
                  {metrics.totalSaved > 0 && (
                    <div
                      style={{
                        width: `${
                          (metrics.totalSaved / metrics.income) * 100
                        }%`,
                        backgroundColor: '#34d399',
                      }}
                      title={`Poupado: ${formatBRL(
                        metrics.totalSaved
                      )} (${formatPercent(metrics.savingsRate)})`}
                      className="h-full rounded-r-full transition-all duration-300"
                    />
                  )}
                </div>

                {/* Legenda Colorida com Percentuais */}
                <div className="flex flex-wrap items-center gap-x-5 gap-y-2 pt-1">
                  {metrics.categorySummaries.map((cat) => (
                    <div
                      key={cat.id}
                      className="flex items-center gap-2 text-xs"
                    >
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: cat.color }}
                      />
                      <span className="text-slate-300 font-medium">
                        {cat.shortName}:
                      </span>
                      <span className="text-white font-bold tabular-nums">
                        {formatPercent(cat.percentOfIncome)}
                      </span>
                    </div>
                  ))}
                  <div className="flex items-center gap-2 text-xs">
                    <span className="w-2.5 h-2.5 rounded-full shrink-0 bg-emerald-400" />
                    <span className="text-slate-300 font-medium">Poupado:</span>
                    <span
                      className={`font-bold tabular-nums ${
                        metrics.totalSaved >= 0
                          ? 'text-emerald-400'
                          : 'text-rose-400'
                      }`}
                    >
                      {formatPercent(metrics.savingsRate)}
                    </span>
                  </div>
                </div>
              </div>
            </section>

            {/* ==============================================================
                SEÇÕES EXPANSÍVEIS (ACCORDIONS) COM SLIDERS + INPUTS SINCRONIZADOS
               ============================================================== */}
            <div className="space-y-4">
              {metrics.categorySummaries.map((cat) => (
                <section
                  key={cat.id}
                  className="bg-[#161920] border border-slate-800/90 rounded-2xl overflow-hidden shadow-lg transition-all"
                >
                  {/* Cabeçalho do Accordion */}
                  <div
                    onClick={() => toggleCategoryExpand(cat.id)}
                    className="px-5 py-4 flex flex-wrap items-center justify-between gap-3 cursor-pointer hover:bg-slate-800/40 transition select-none"
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className="w-3 h-3 rounded-full shrink-0 shadow-sm"
                        style={{ backgroundColor: cat.color }}
                      />
                      <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
                        {cat.name}
                      </h2>
                    </div>

                    <div className="flex items-center gap-3 ml-auto">
                      <span
                        style={{
                          backgroundColor: cat.badgeBg,
                          color: cat.badgeText,
                        }}
                        className="px-2.5 py-1 rounded-full text-xs font-semibold tabular-nums"
                      >
                        {formatPercent(cat.percentOfIncome)} da renda
                      </span>
                      <span className="text-base sm:text-lg font-extrabold text-white tabular-nums">
                        {formatBRL(cat.subtotal)}
                      </span>
                      <button
                        type="button"
                        aria-label="Expandir ou recolher categoria"
                        className="p-1 rounded-lg text-slate-400 hover:text-white"
                      >
                        {cat.expanded ? (
                          <ChevronUp className="w-5 h-5" />
                        ) : (
                          <ChevronDown className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Corpo do Accordion */}
                  {cat.expanded && (
                    <div className="px-5 pb-5 pt-2 border-t border-slate-800/70 space-y-5">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5 pt-2">
                        {cat.items.map((item) => {
                          const itemPct =
                            metrics.income > 0
                              ? (item.value / metrics.income) * 100
                              : 0;
                          const sliderFillPct = Math.min(
                            100,
                            item.max > 0 ? (item.value / item.max) * 100 : 0
                          );

                          return (
                            <div key={item.id} className="space-y-2.5 group">
                              <div className="flex items-center justify-between gap-2">
                                <div className="flex items-center gap-1.5 min-w-0">
                                  <span className="text-sm font-medium text-slate-200 truncate">
                                    {item.name}
                                  </span>
                                  <span className="text-xs text-slate-400 tabular-nums shrink-0">
                                    ({formatPercent(itemPct)})
                                  </span>
                                </div>

                                <div className="flex items-center gap-1.5 shrink-0">
                                  <div className="flex items-center bg-[#0f1115] border border-slate-700/90 focus-within:border-sky-400 rounded-lg px-2.5 py-1.5 w-32 transition">
                                    <span className="text-xs text-slate-400 mr-1.5 select-none">
                                      R$
                                    </span>
                                    <input
                                      type="number"
                                      min="0"
                                      step="10"
                                      value={item.value}
                                      onChange={(e) =>
                                        handleItemValueChange(
                                          cat.id,
                                          item.id,
                                          e.target.value
                                        )
                                      }
                                      className="w-full bg-transparent text-right text-sm font-bold text-white tabular-nums focus:outline-none"
                                    />
                                  </div>

                                  {cat.items.length > 1 && (
                                    <button
                                      type="button"
                                      onClick={() =>
                                        handleDeleteItem(cat.id, item.id)
                                      }
                                      title="Remover item"
                                      className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition cursor-pointer"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  )}
                                </div>
                              </div>

                              <div className="relative flex items-center">
                                <input
                                  type="range"
                                  min="0"
                                  max={item.max}
                                  step="5"
                                  value={item.value}
                                  onChange={(e) =>
                                    handleItemValueChange(
                                      cat.id,
                                      item.id,
                                      e.target.value
                                    )
                                  }
                                  style={{
                                    background: `linear-gradient(to right, #38bdf8 0%, #38bdf8 ${sliderFillPct}%, #1e293b ${sliderFillPct}%, #1e293b 100%)`,
                                  }}
                                  className="fintech-slider"
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Envelope Pix Semanal */}
                      {cat.hasWeeklyPixEnvelope && (
                        <div className="mt-4 rounded-xl bg-amber-950/35 border border-amber-600/40 px-4 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <div className="flex items-center gap-2.5">
                            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                            <span className="text-xs sm:text-sm font-semibold text-amber-300">
                              Envelope Pix Semanal (Perecíveis ÷ 4):
                            </span>
                          </div>
                          <div className="text-sm sm:text-base font-extrabold text-amber-300 tabular-nums">
                            {formatBRL(cat.weeklyPixValue)}{' '}
                            <span className="text-xs font-medium text-amber-400/90">
                              / semana
                            </span>
                          </div>
                        </div>
                      )}

                      {/* Adicionar Novo Item */}
                      <div className="pt-1">
                        {addingItemToCat === cat.id ? (
                          <div className="flex flex-wrap items-center gap-2 bg-[#0f1115] p-3 rounded-xl border border-slate-700/80">
                            <input
                              type="text"
                              placeholder="Nome da despesa ou cartão..."
                              value={newItemName}
                              onChange={(e) => setNewItemName(e.target.value)}
                              className="flex-1 min-w-[180px] bg-[#161920] border border-slate-700 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-sky-400"
                            />
                            <div className="flex items-center bg-[#161920] border border-slate-700 rounded-lg px-2.5 py-1.5 w-32">
                              <span className="text-xs text-slate-400 mr-1">
                                R$
                              </span>
                              <input
                                type="number"
                                placeholder="0,00"
                                value={newItemValue}
                                onChange={(e) =>
                                  setNewItemValue(e.target.value)
                                }
                                className="w-full bg-transparent text-sm text-white text-right tabular-nums focus:outline-none"
                              />
                            </div>
                            <button
                              type="button"
                              onClick={() => handleAddItem(cat.id)}
                              className="px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-semibold text-xs transition cursor-pointer"
                            >
                              Salvar
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setAddingItemToCat(null);
                                setNewItemName('');
                                setNewItemValue('');
                              }}
                              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs transition cursor-pointer"
                            >
                              Cancelar
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setAddingItemToCat(cat.id)}
                            className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-400 hover:text-sky-400 transition cursor-pointer"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            Adicionar item em {cat.shortName} (
                            {selectedMonthMeta.short})
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </section>
              ))}
            </div>
          </div>
        )}

        {/* ==================================================================
            VISÃO 2: FLUXO & LANÇAMENTOS MENSAIS (MÊS SELECIONADO + RECORRÊNCIA/PARCELAS)
           ================================================================== */}
        {activeTab === 'transactions' && (
          <div className="space-y-6">
            {/* Controle de Envelopes do Mês Selecionado */}
            <section className="bg-[#161920] border border-slate-800/90 rounded-2xl p-5 shadow-lg">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                <div>
                  <h2 className="text-base font-bold text-white flex items-center gap-2">
                    Controle de Envelopes — {selectedMonthMeta.name} de 2026
                  </h2>
                  <p className="text-xs text-slate-400">
                    Comparativo em tempo real entre o Orçamento (Sliders) e os
                    Lançamentos Reais do mês
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={handleSyncActualToBudget}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-sky-500/10 hover:bg-sky-500/20 text-sky-300 border border-sky-500/30 transition cursor-pointer"
                    title="Atualiza os sliders deste mês com base nos gastos reais lançados"
                  >
                    <Sliders className="w-3.5 h-3.5" />
                    Sincronizar Realizado → Sliders
                  </button>
                  <div className="text-xs font-semibold text-slate-300 bg-[#0f1115] px-3 py-1.5 rounded-lg border border-slate-800 tabular-nums">
                    Pago:{' '}
                    <span className="text-emerald-400">
                      {formatBRL(metrics.totalPaidExpenses)}
                    </span>{' '}
                    • Pendente:{' '}
                    <span className="text-amber-400">
                      {formatBRL(metrics.totalPendingExpenses)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {metrics.categorySummaries.map((cat) => {
                  const spent = metrics.actualSpentByCategory[cat.id] || 0;
                  const remaining = cat.subtotal - spent;
                  const usedPct =
                    cat.subtotal > 0
                      ? Math.min(100, (spent / cat.subtotal) * 100)
                      : 0;
                  const isOver = spent > cat.subtotal;

                  return (
                    <div
                      key={cat.id}
                      className="bg-[#0f1115] border border-slate-800 rounded-xl p-4 space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span
                            className="w-2.5 h-2.5 rounded-full"
                            style={{ backgroundColor: cat.color }}
                          />
                          <span className="text-xs font-bold text-slate-200">
                            {cat.shortName}
                          </span>
                        </div>
                        <span
                          className={`text-[11px] font-semibold px-2 py-0.5 rounded-full tabular-nums ${
                            isOver
                              ? 'bg-rose-500/15 text-rose-300'
                              : 'bg-emerald-500/10 text-emerald-300'
                          }`}
                        >
                          {isOver
                            ? `Estourado +${formatBRL(Math.abs(remaining))}`
                            : `Resta ${formatBRL(remaining)}`}
                        </span>
                      </div>

                      <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                        <div
                          style={{
                            width: `${usedPct}%`,
                            backgroundColor: isOver ? '#f43f5e' : cat.color,
                          }}
                          className="h-full rounded-full transition-all duration-300"
                        />
                      </div>

                      <div className="flex items-center justify-between text-xs text-slate-400 tabular-nums">
                        <span>Realizado: {formatBRL(spent)}</span>
                        <span>Orçado: {formatBRL(cat.subtotal)}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* Formulário Completo de Lançamento Mensal (Único, Recorrente ou Parcelado) */}
            <section className="bg-[#161920] border border-slate-800/90 rounded-2xl p-5 shadow-lg space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Plus className="w-4 h-4 text-emerald-400" />
                  Novo Lançamento em {selectedMonthMeta.name} de 2026
                </h3>
                <div className="flex items-center gap-1.5 bg-[#0f1115] p-1 rounded-lg border border-slate-800">
                  <button
                    type="button"
                    onClick={() => setNewTx({ ...newTx, type: 'expense' })}
                    className={`px-3 py-1 rounded-md text-xs font-semibold transition cursor-pointer ${
                      newTx.type === 'expense'
                        ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Despesa / Saída
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewTx({ ...newTx, type: 'income' })}
                    className={`px-3 py-1 rounded-md text-xs font-semibold transition cursor-pointer ${
                      newTx.type === 'income'
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Receita Extra / Entrada
                  </button>
                </div>
              </div>

              <form onSubmit={handleAddTransaction} className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
                  <input
                    type="text"
                    required
                    placeholder={
                      newTx.type === 'expense'
                        ? 'Descrição (ex: Envelope Pix Açougue)'
                        : 'Descrição (ex: Hora Extra / 13º Salário)'
                    }
                    value={newTx.description}
                    onChange={(e) =>
                      setNewTx({ ...newTx, description: e.target.value })
                    }
                    className="lg:col-span-2 bg-[#0f1115] border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                  />

                  <div className="flex items-center bg-[#0f1115] border border-slate-700 rounded-xl px-3 py-2">
                    <span className="text-xs text-slate-400 mr-1.5">R$</span>
                    <input
                      type="number"
                      required
                      step="0.01"
                      min="0.01"
                      placeholder="0,00"
                      value={newTx.amount}
                      onChange={(e) =>
                        setNewTx({ ...newTx, amount: e.target.value })
                      }
                      className="w-full bg-transparent text-sm text-white tabular-nums focus:outline-none"
                    />
                  </div>

                  {newTx.type === 'expense' ? (
                    <select
                      value={newTx.categoryId}
                      onChange={(e) =>
                        setNewTx({ ...newTx, categoryId: e.target.value })
                      }
                      className="bg-[#0f1115] border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-emerald-500"
                    >
                      {currentMonthData.categories.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.shortName}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <div className="bg-[#0f1115] border border-slate-800 rounded-xl px-3 py-2 text-xs text-emerald-400 flex items-center font-medium">
                      Entrada Extra na Renda
                    </div>
                  )}

                  <select
                    value={newTx.paymentMethod}
                    onChange={(e) =>
                      setNewTx({ ...newTx, paymentMethod: e.target.value })
                    }
                    className="bg-[#0f1115] border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-emerald-500"
                  >
                    <option value="Pix Semanal">Pix Semanal</option>
                    <option value="Pix / Transferência">
                      Pix / Transferência
                    </option>
                    <option value="Cartão BMG">Cartão BMG</option>
                    <option value="Cartão Itaú">Cartão Itaú</option>
                    <option value="Cartão Itaú Platinum">
                      Cartão Itaú Platinum
                    </option>
                    <option value="Cartão Nubank">Cartão Nubank</option>
                    <option value="Débito">Cartão de Débito</option>
                    <option value="Dinheiro">Dinheiro</option>
                  </select>

                  <input
                    type="date"
                    value={newTx.date}
                    onChange={(e) =>
                      setNewTx({ ...newTx, date: e.target.value })
                    }
                    className="bg-[#0f1115] border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                {/* Linha de Opções Inteligentes: Status + Recorrência Anual ou Parcelamento */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                  <div className="flex flex-wrap items-center gap-3">
                    {/* Status Inicial */}
                    <select
                      value={newTx.status}
                      onChange={(e) =>
                        setNewTx({ ...newTx, status: e.target.value })
                      }
                      className="bg-[#0f1115] border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none"
                    >
                      <option value="paid">Status: Pago / Efetivado</option>
                      <option value="pending">
                        Status: Pendente / Agendado
                      </option>
                    </select>

                    {/* Modo de Repetição nos 12 Meses */}
                    <div className="flex items-center gap-1.5 bg-[#0f1115] border border-slate-700 rounded-lg p-1">
                      <button
                        type="button"
                        onClick={() =>
                          setNewTx({ ...newTx, recurrenceMode: 'single' })
                        }
                        className={`px-2.5 py-1 rounded text-xs font-medium transition cursor-pointer ${
                          newTx.recurrenceMode === 'single'
                            ? 'bg-slate-700 text-white'
                            : 'text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        Apenas {selectedMonthMeta.short}
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          setNewTx({ ...newTx, recurrenceMode: 'repeat_year' })
                        }
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs font-medium transition cursor-pointer ${
                          newTx.recurrenceMode === 'repeat_year'
                            ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30'
                            : 'text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        <Repeat className="w-3 h-3" />
                        Repetir até Dez/26
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          setNewTx({ ...newTx, recurrenceMode: 'installments' })
                        }
                        className={`px-2.5 py-1 rounded text-xs font-medium transition cursor-pointer ${
                          newTx.recurrenceMode === 'installments'
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                            : 'text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        Parcelado Nx
                      </button>
                    </div>

                    {newTx.recurrenceMode === 'installments' && (
                      <div className="flex items-center gap-1.5 text-xs text-slate-300">
                        <span>Parcelas:</span>
                        <select
                          value={newTx.installmentsCount}
                          onChange={(e) =>
                            setNewTx({
                              ...newTx,
                              installmentsCount: Number(e.target.value),
                            })
                          }
                          className="bg-[#0f1115] border border-slate-700 rounded-lg px-2 py-1 text-xs text-white"
                        >
                          {[2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((n) => (
                            <option key={n} value={n}>
                              {n}x
                            </option>
                          ))}
                        </select>
                        {newTx.amount && (
                          <span className="text-amber-300 font-semibold tabular-nums">
                            (
                            {formatBRL(
                              Number(newTx.amount) / newTx.installmentsCount
                            )}
                            /mês)
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  <button
                    type="submit"
                    className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-sm rounded-xl px-5 py-2 transition cursor-pointer shadow-md shadow-emerald-500/20 ml-auto"
                  >
                    + Lançar em {selectedMonthMeta.short}
                  </button>
                </div>
              </form>
            </section>

            {/* Tabela Completa de Lançamentos do Mês Selecionado */}
            <section className="bg-[#161920] border border-slate-800/90 rounded-2xl overflow-hidden shadow-lg">
              <div className="p-5 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-base font-bold text-white">
                    Extrato de {selectedMonthMeta.name} 2026 (
                    {currentMonthData.transactions.length} lançamentos)
                  </h3>
                  <p className="text-xs text-slate-400">
                    Clique no status para alternar entre Pago e Pendente ou
                    clique no valor para editar
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <div className="relative">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2" />
                    <input
                      type="text"
                      placeholder="Buscar lançamento..."
                      value={txSearch}
                      onChange={(e) => setTxSearch(e.target.value)}
                      className="bg-[#0f1115] border border-slate-700 rounded-lg pl-9 pr-3 py-1.5 text-xs text-white focus:outline-none focus:border-sky-400"
                    />
                  </div>
                  <select
                    value={txFilterCategory}
                    onChange={(e) => setTxFilterCategory(e.target.value)}
                    className="bg-[#0f1115] border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none"
                  >
                    <option value="all">Todas Categorias</option>
                    {currentMonthData.categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.shortName}
                      </option>
                    ))}
                  </select>
                  <select
                    value={txFilterStatus}
                    onChange={(e) => setTxFilterStatus(e.target.value)}
                    className="bg-[#0f1115] border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none"
                  >
                    <option value="all">Todos Status</option>
                    <option value="paid">Pagos</option>
                    <option value="pending">Pendentes</option>
                  </select>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-800 text-[11px] uppercase tracking-wider text-slate-400 bg-[#0f1115]/60">
                      <th className="py-3 px-4">Data</th>
                      <th className="py-3 px-4">Descrição</th>
                      <th className="py-3 px-4">Categoria</th>
                      <th className="py-3 px-4">Forma Pgto.</th>
                      <th className="py-3 px-4 text-center">Status</th>
                      <th className="py-3 px-4 text-right">Valor</th>
                      <th className="py-3 px-4 text-center">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/70 text-sm">
                    {currentMonthData.transactions
                      .filter(
                        (t) =>
                          (txFilterCategory === 'all' ||
                            t.categoryId === txFilterCategory) &&
                          (txFilterStatus === 'all' ||
                            t.status === txFilterStatus) &&
                          t.description
                            .toLowerCase()
                            .includes(txSearch.toLowerCase())
                      )
                      .map((tx) => {
                        const cat = currentMonthData.categories.find(
                          (c) => c.id === tx.categoryId
                        );
                        const isIncome = tx.type === 'income';
                        const isPaid = tx.status === 'paid';

                        return (
                          <tr
                            key={tx.id}
                            className="hover:bg-slate-800/30 transition"
                          >
                            <td className="py-3 px-4 text-xs text-slate-400 tabular-nums whitespace-nowrap">
                              {tx.date.split('-').reverse().join('/')}
                            </td>
                            <td className="py-3 px-4 font-medium text-slate-200">
                              {tx.description}
                            </td>
                            <td className="py-3 px-4">
                              {isIncome ? (
                                <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/15 text-emerald-300">
                                  Receita Extra
                                </span>
                              ) : (
                                <span
                                  style={{
                                    backgroundColor:
                                      cat?.badgeBg || 'rgba(148,163,184,0.15)',
                                    color: cat?.badgeText || '#cbd5e1',
                                  }}
                                  className="px-2.5 py-0.5 rounded-full text-xs font-medium"
                                >
                                  {cat?.shortName || 'Geral'}
                                </span>
                              )}
                            </td>
                            <td className="py-3 px-4 text-xs text-slate-400">
                              {tx.paymentMethod}
                            </td>
                            <td className="py-3 px-4 text-center">
                              <button
                                type="button"
                                onClick={() =>
                                  handleToggleTransactionStatus(tx.id)
                                }
                                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold transition cursor-pointer ${
                                  isPaid
                                    ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                                    : 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                                }`}
                              >
                                {isPaid ? (
                                  <>
                                    <CheckCircle className="w-3 h-3" />
                                    Pago
                                  </>
                                ) : (
                                  <>
                                    <Clock className="w-3 h-3" />
                                    Pendente
                                  </>
                                )}
                              </button>
                            </td>
                            <td className="py-3 px-4 text-right font-bold tabular-nums">
                              {editingTxId === tx.id ? (
                                <input
                                  type="number"
                                  step="0.01"
                                  defaultValue={tx.amount}
                                  autoFocus
                                  onBlur={(e) =>
                                    handleUpdateTransactionAmount(
                                      tx.id,
                                      e.target.value
                                    )
                                  }
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                      handleUpdateTransactionAmount(
                                        tx.id,
                                        e.target.value
                                      );
                                    } else if (e.key === 'Escape') {
                                      setEditingTxId(null);
                                    }
                                  }}
                                  className="w-28 bg-[#0f1115] border border-sky-400 rounded px-2 py-1 text-right text-sm text-white focus:outline-none"
                                />
                              ) : (
                                <span
                                  onClick={() => setEditingTxId(tx.id)}
                                  title="Clique para editar o valor"
                                  className={`cursor-pointer hover:underline ${
                                    isIncome ? 'text-emerald-400' : 'text-white'
                                  }`}
                                >
                                  {isIncome
                                    ? `+ ${formatBRL(tx.amount)}`
                                    : formatBRL(tx.amount)}
                                </span>
                              )}
                            </td>
                            <td className="py-3 px-4 text-center">
                              <div className="flex items-center justify-center gap-1">
                                <button
                                  onClick={() => setEditingTxId(tx.id)}
                                  className="p-1.5 rounded-lg text-slate-400 hover:text-sky-400 hover:bg-sky-500/10 transition cursor-pointer"
                                  title="Editar valor"
                                >
                                  <Edit3 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => handleDeleteTransaction(tx.id)}
                                  className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition cursor-pointer"
                                  title="Excluir lançamento"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            </section>
          </div>
        )}

        {/* ==================================================================
            VISÃO 3: VISÃO ANUAL CONSOLIDADA (TODOS OS 12 MESES DE 2026)
           ================================================================== */}
        {activeTab === 'annual' && (
          <div className="space-y-6">
            {/* KPIs Consolidados do Ano 2026 */}
            <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-[#161920] border border-slate-800 rounded-2xl p-4 shadow-lg">
                <span className="text-xs text-slate-400 uppercase font-semibold">
                  Renda Total 2026
                </span>
                <div className="text-2xl font-extrabold text-white mt-1 tabular-nums">
                  {formatBRL(annualSummary.totalYearIncome)}
                </div>
                <span className="text-[11px] text-slate-400">
                  Soma dos 12 meses
                </span>
              </div>

              <div className="bg-[#161920] border border-slate-800 rounded-2xl p-4 shadow-lg">
                <span className="text-xs text-slate-400 uppercase font-semibold">
                  Gasto Planejado 2026
                </span>
                <div className="text-2xl font-extrabold text-sky-400 mt-1 tabular-nums">
                  {formatBRL(annualSummary.totalYearPlannedExpense)}
                </div>
                <span className="text-[11px] text-slate-400">
                  Baseado nos sliders mensais
                </span>
              </div>

              <div className="bg-[#161920] border border-slate-800 rounded-2xl p-4 shadow-lg">
                <span className="text-xs text-slate-400 uppercase font-semibold">
                  Gasto Realizado 2026
                </span>
                <div className="text-2xl font-extrabold text-amber-400 mt-1 tabular-nums">
                  {formatBRL(annualSummary.totalYearActualExpense)}
                </div>
                <span className="text-[11px] text-slate-400">
                  Soma dos lançamentos do ano
                </span>
              </div>

              <div className="bg-[#161920] border border-emerald-500/30 rounded-2xl p-4 shadow-lg">
                <span className="text-xs text-emerald-400 uppercase font-semibold">
                  Poupança Acumulada 2026
                </span>
                <div className="text-2xl font-extrabold text-emerald-400 mt-1 tabular-nums">
                  {formatBRL(annualSummary.totalYearActualSaved)}
                </div>
                <span className="text-[11px] text-emerald-300/80 tabular-nums">
                  Planejada: {formatBRL(annualSummary.totalYearPlannedSaved)}
                </span>
              </div>
            </section>

            {/* Gráfico Anual de Evolução nos 12 Meses */}
            <section className="bg-[#161920] border border-slate-800/90 rounded-2xl p-5 shadow-lg">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
                <div>
                  <h3 className="text-base font-bold text-white">
                    Fluxo Anual & Acumulação de Patrimônio (Jan – Dez 2026)
                  </h3>
                  <p className="text-xs text-slate-400">
                    Acompanhe o comportamento mensal de gastos planejados,
                    realizados e reserva acumulada
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleExportCSV('annual')}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/30 transition cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  Exportar Consolidado Anual (CSV)
                </button>
              </div>

              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={analyticsData.evolution}>
                    <defs>
                      <linearGradient
                        id="gradAcumulado"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="5%"
                          stopColor="#10b981"
                          stopOpacity={0.35}
                        />
                        <stop
                          offset="95%"
                          stopColor="#10b981"
                          stopOpacity={0}
                        />
                      </linearGradient>
                      <linearGradient
                        id="gradRealizado"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="5%"
                          stopColor="#38bdf8"
                          stopOpacity={0.25}
                        />
                        <stop
                          offset="95%"
                          stopColor="#38bdf8"
                          stopOpacity={0}
                        />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} />
                    <YAxis
                      stroke="#94a3b8"
                      fontSize={12}
                      tickFormatter={(v) => `R$${(v / 1000).toFixed(1)}k`}
                    />
                    <RechartsTooltip
                      contentStyle={{
                        backgroundColor: '#0f1115',
                        borderColor: '#334155',
                        borderRadius: '12px',
                        color: '#f8fafc',
                      }}
                      formatter={(value) => formatBRL(value)}
                    />
                    <Legend />
                    <Area
                      type="monotone"
                      dataKey="acumulado"
                      name="Poupança Acumulada no Ano"
                      stroke="#10b981"
                      strokeWidth={2.5}
                      fillOpacity={1}
                      fill="url(#gradAcumulado)"
                    />
                    <Area
                      type="monotone"
                      dataKey="realizado"
                      name="Gasto Realizado Mensal"
                      stroke="#38bdf8"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#gradRealizado)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </section>

            {/* Matriz Anual Interativa (12 Meses) */}
            <section className="bg-[#161920] border border-slate-800/90 rounded-2xl overflow-hidden shadow-lg">
              <div className="p-5 border-b border-slate-800 flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-white">
                    Matriz Financeira Anual — Janeiro a Dezembro de 2026
                  </h3>
                  <p className="text-xs text-slate-400">
                    Clique em qualquer mês para abrir e editar seus lançamentos
                    ou sliders
                  </p>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-800 text-[11px] uppercase tracking-wider text-slate-400 bg-[#0f1115]/70">
                      <th className="py-3.5 px-4">Mês</th>
                      <th className="py-3.5 px-4 text-right">Renda Líquida</th>
                      <th className="py-3.5 px-4 text-right">
                        Gasto Planejado
                      </th>
                      <th className="py-3.5 px-4 text-right">
                        Gasto Realizado
                      </th>
                      <th className="py-3.5 px-4 text-right">
                        Saldo Livre Real
                      </th>
                      <th className="py-3.5 px-4 text-right">Acumulado Ano</th>
                      <th className="py-3.5 px-4 text-center">Lançamentos</th>
                      <th className="py-3.5 px-4 text-center">Ação</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/70 text-sm">
                    {annualSummary.monthsList.map((m) => {
                      const isCurrentSelected =
                        m.key === state.selectedMonthKey;
                      return (
                        <tr
                          key={m.key}
                          onClick={() => {
                            handleSelectMonth(m.key);
                            setActiveTab('transactions');
                          }}
                          className={`cursor-pointer transition ${
                            isCurrentSelected
                              ? 'bg-emerald-500/10 hover:bg-emerald-500/15'
                              : 'hover:bg-slate-800/40'
                          }`}
                        >
                          <td className="py-3 px-4 font-bold text-white flex items-center gap-2">
                            <span
                              className={`w-2 h-2 rounded-full ${
                                m.metrics.totalActualSaved >= 0
                                  ? 'bg-emerald-400'
                                  : 'bg-rose-400'
                              }`}
                            />
                            {m.name}
                          </td>
                          <td className="py-3 px-4 text-right text-slate-200 tabular-nums">
                            {formatBRL(m.metrics.income)}
                          </td>
                          <td className="py-3 px-4 text-right text-slate-300 tabular-nums">
                            {formatBRL(m.metrics.totalExpenses)}
                          </td>
                          <td className="py-3 px-4 text-right font-semibold text-sky-300 tabular-nums">
                            {formatBRL(m.metrics.totalActualSpent)}
                          </td>
                          <td
                            className={`py-3 px-4 text-right font-bold tabular-nums ${
                              m.metrics.totalActualSaved >= 0
                                ? 'text-emerald-400'
                                : 'text-rose-400'
                            }`}
                          >
                            {formatBRL(m.metrics.totalActualSaved)}
                          </td>
                          <td className="py-3 px-4 text-right font-extrabold text-emerald-300 tabular-nums">
                            {formatBRL(m.accSavedActual)}
                          </td>
                          <td className="py-3 px-4 text-center">
                            <span className="px-2.5 py-0.5 rounded-full text-xs bg-slate-800 text-slate-300 tabular-nums">
                              {m.metrics.txCount} itens
                            </span>
                          </td>
                          <td className="py-3 px-4 text-center">
                            <span className="text-xs font-semibold text-emerald-400 hover:underline">
                              Abrir Mês →
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </section>
          </div>
        )}

        {/* ==================================================================
            VISÃO 4: GESTÃO DE CARTÕES DE CRÉDITO & FATURAS
           ================================================================== */}
        {activeTab === 'cards' &&
          (() => {
            const cardsCat = metrics.categorySummaries.find(
              (c) => c.id === 'cartoes'
            );
            const totalCards = cardsCat?.subtotal || 0;
            const cardsIncomePct = cardsCat?.percentOfIncome || 0;

            return (
              <div className="space-y-6">
                {/* Resumo de Comprometimento com Cartões */}
                <section className="bg-[#161920] border border-slate-800/90 rounded-2xl p-6 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <h2 className="text-lg font-bold text-white flex items-center gap-2">
                      <CreditCard className="w-5 h-5 text-rose-400" />
                      Monitoramento de Cartões & Cheque Especial (
                      {selectedMonthMeta.name})
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-400">
                      Especialistas recomendam manter faturas de cartão abaixo
                      de 20% da renda líquida mensal.
                    </p>
                  </div>

                  <div className="flex items-center gap-4 bg-[#0f1115] px-5 py-3.5 rounded-xl border border-slate-800">
                    <div>
                      <div className="text-xs text-slate-400">
                        Total Faturas
                      </div>
                      <div className="text-xl font-extrabold text-white tabular-nums">
                        {formatBRL(totalCards)}
                      </div>
                    </div>
                    <div className="h-8 w-px bg-slate-800" />
                    <div>
                      <div className="text-xs text-slate-400">
                        Comprometimento
                      </div>
                      <div
                        className={`text-xl font-extrabold tabular-nums ${
                          cardsIncomePct <= 15
                            ? 'text-emerald-400'
                            : cardsIncomePct <= 25
                            ? 'text-amber-400'
                            : 'text-rose-400'
                        }`}
                      >
                        {formatPercent(cardsIncomePct)}
                      </div>
                    </div>
                  </div>
                </section>

                {/* Grid de Cartões Individuais */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {cardsCat?.items.map((card, index) => {
                    const limit = card.limit || 3000;
                    const limitUsagePct = Math.min(
                      100,
                      (card.value / limit) * 100
                    );
                    const gradients = [
                      'from-orange-500/20 via-[#161920] to-[#161920] border-orange-500/30',
                      'from-blue-600/20 via-[#161920] to-[#161920] border-blue-500/30',
                      'from-slate-600/25 via-[#161920] to-[#161920] border-slate-500/30',
                      'from-purple-600/20 via-[#161920] to-[#161920] border-purple-500/30',
                      'from-rose-600/20 via-[#161920] to-[#161920] border-rose-500/30',
                      'from-teal-600/20 via-[#161920] to-[#161920] border-teal-500/30',
                    ];
                    const styleClass = gradients[index % gradients.length];

                    return (
                      <div
                        key={card.id}
                        className={`bg-gradient-to-br ${styleClass} border rounded-2xl p-5 shadow-lg flex flex-col justify-between space-y-5`}
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <span className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold">
                              Fechamento dia {card.closingDay || 10}
                            </span>
                            <h3 className="text-base font-bold text-white mt-0.5">
                              {card.name}
                            </h3>
                          </div>
                          <CreditCard className="w-6 h-6 text-slate-300/80" />
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-baseline justify-between">
                            <span className="text-xs text-slate-400">
                              Fatura Atual
                            </span>
                            <span className="text-2xl font-extrabold text-white tabular-nums">
                              {formatBRL(card.value)}
                            </span>
                          </div>

                          <input
                            type="range"
                            min="0"
                            max={card.max}
                            step="10"
                            value={card.value}
                            onChange={(e) =>
                              handleItemValueChange(
                                'cartoes',
                                card.id,
                                e.target.value
                              )
                            }
                            className="fintech-slider"
                          />

                          <div className="flex items-center justify-between text-xs text-slate-400 pt-1 tabular-nums">
                            <span>Limite est.: {formatBRL(limit)}</span>
                            <span>Uso: {formatPercent(limitUsagePct)}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })()}

        {/* ==================================================================
            VISÃO 5: METAS DE POUPANÇA & PATRIMÔNIO
           ================================================================== */}
        {activeTab === 'goals' && (
          <div className="space-y-6">
            {/* Banner de Direcionamento Automático do Saldo Livre */}
            <section className="bg-gradient-to-r from-emerald-950/60 via-[#161920] to-[#161920] border border-emerald-500/30 rounded-2xl p-6 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1">
                <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-emerald-400">
                  <PiggyBank className="w-4 h-4" />
                  Motor de Acumulação Familiar
                </span>
                <h2 className="text-xl font-bold text-white">
                  Saldo Livre em {selectedMonthMeta.name}:{' '}
                  <span className="text-emerald-400 tabular-nums">
                    {formatBRL(Math.max(0, metrics.totalSaved))}
                  </span>
                </h2>
                <p className="text-xs sm:text-sm text-slate-300">
                  Cada real economizado nos sliders do orçamento acelera
                  automaticamente o prazo das suas metas abaixo.
                </p>
              </div>

              <div className="bg-[#0f1115]/90 border border-slate-800 rounded-xl px-4 py-3 text-right shrink-0">
                <div className="text-xs text-slate-400">
                  Patrimônio Total nas Metas
                </div>
                <div className="text-2xl font-extrabold text-emerald-400 tabular-nums">
                  {formatBRL(
                    state.goals.reduce((acc, g) => acc + g.current, 0)
                  )}
                </div>
              </div>
            </section>

            {/* Cards de Metas com Projeção Dinâmica */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
              {state.goals.map((goal) => {
                const progressPct = Math.min(
                  100,
                  (goal.current / goal.target) * 100
                );
                const monthlyContribution =
                  Math.max(0, metrics.totalSaved) *
                  (goal.allocationPercent / 100);
                const remainingAmount = Math.max(0, goal.target - goal.current);
                const monthsToTarget =
                  monthlyContribution > 0
                    ? Math.ceil(remainingAmount / monthlyContribution)
                    : null;

                return (
                  <div
                    key={goal.id}
                    className="bg-[#161920] border border-slate-800/90 rounded-2xl p-5 shadow-lg flex flex-col justify-between space-y-5"
                  >
                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <span className="text-[11px] font-semibold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full">
                            {goal.category} • {goal.allocationPercent}% do saldo
                            livre
                          </span>
                          <h3 className="text-base font-bold text-white mt-2">
                            {goal.name}
                          </h3>
                        </div>
                      </div>

                      <div className="flex items-baseline justify-between pt-1 tabular-nums">
                        <div>
                          <span className="text-2xl font-extrabold text-white">
                            {formatBRL(goal.current)}
                          </span>
                          <span className="text-xs text-slate-400 ml-1.5">
                            de {formatBRL(goal.target)}
                          </span>
                        </div>
                        <span className="text-sm font-bold text-emerald-400">
                          {formatPercent(progressPct)}
                        </span>
                      </div>

                      <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden">
                        <div
                          style={{
                            width: `${progressPct}%`,
                            backgroundColor: goal.color,
                          }}
                          className="h-full rounded-full transition-all duration-500"
                        />
                      </div>

                      <div className="bg-[#0f1115] rounded-xl p-3 border border-slate-800/80 space-y-1.5 text-xs">
                        <div className="flex justify-between text-slate-300 tabular-nums">
                          <span>Aporte mensal previsto:</span>
                          <span className="font-bold text-emerald-400">
                            +{formatBRL(monthlyContribution)}/mês
                          </span>
                        </div>
                        <div className="flex justify-between text-slate-400 tabular-nums">
                          <span>Prazo estimado para concluir:</span>
                          <span className="font-semibold text-slate-200">
                            {remainingAmount === 0
                              ? 'Meta Concluída!'
                              : monthsToTarget
                              ? `${monthsToTarget} ${
                                  monthsToTarget === 1 ? 'mês' : 'meses'
                                }`
                              : 'Sem saldo livre'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() =>
                          handleContributeToGoal(
                            goal.id,
                            Math.round(monthlyContribution) || 100
                          )
                        }
                        className="flex-1 bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/30 font-semibold text-xs py-2 px-3 rounded-xl transition cursor-pointer"
                      >
                        + Aportar{' '}
                        {formatBRL(Math.round(monthlyContribution) || 100)}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Criar Nova Meta */}
            <section className="bg-[#161920] border border-slate-800/90 rounded-2xl p-5 shadow-lg">
              <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                <Target className="w-4 h-4 text-emerald-400" />
                Criar Nova Meta Familiar
              </h3>
              <form
                onSubmit={handleAddGoal}
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3"
              >
                <input
                  type="text"
                  required
                  placeholder="Nome da meta (ex: Troca de Carro)"
                  value={newGoalName}
                  onChange={(e) => setNewGoalName(e.target.value)}
                  className="lg:col-span-2 bg-[#0f1115] border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                />
                <input
                  type="number"
                  min="0"
                  placeholder="Saldo já guardado (R$)"
                  value={newGoalCurrent}
                  onChange={(e) => setNewGoalCurrent(e.target.value)}
                  className="bg-[#0f1115] border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white tabular-nums focus:outline-none focus:border-emerald-500"
                />
                <input
                  type="number"
                  required
                  min="100"
                  placeholder="Objetivo Total (R$)"
                  value={newGoalTarget}
                  onChange={(e) => setNewGoalTarget(e.target.value)}
                  className="bg-[#0f1115] border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white tabular-nums focus:outline-none focus:border-emerald-500"
                />
                <button
                  type="submit"
                  className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-sm rounded-xl px-4 py-2 transition cursor-pointer"
                >
                  Criar Meta
                </button>
              </form>
            </section>
          </div>
        )}

        {/* ==================================================================
            VISÃO 6: ANALYTICS & INTELIGÊNCIA FINANCEIRA (RECHARTS)
           ================================================================== */}
        {activeTab === 'analytics' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Gráfico 1: Evolução Mensal de Gastos vs. Poupança */}
              <section className="bg-[#161920] border border-slate-800/90 rounded-2xl p-5 shadow-lg">
                <h3 className="text-base font-bold text-white mb-1">
                  Evolução Anual: Planejado vs. Realizado (2026)
                </h3>
                <p className="text-xs text-slate-400 mb-4">
                  Comparativo dos 12 meses de 2026
                </p>
                <div className="h-72 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={analyticsData.evolution}>
                      <defs>
                        <linearGradient
                          id="colorGastos"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="5%"
                            stopColor="#38bdf8"
                            stopOpacity={0.35}
                          />
                          <stop
                            offset="95%"
                            stopColor="#38bdf8"
                            stopOpacity={0}
                          />
                        </linearGradient>
                        <linearGradient
                          id="colorPoupado"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="5%"
                            stopColor="#34d399"
                            stopOpacity={0.4}
                          />
                          <stop
                            offset="95%"
                            stopColor="#34d399"
                            stopOpacity={0}
                          />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                      <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} />
                      <YAxis
                        stroke="#94a3b8"
                        fontSize={12}
                        tickFormatter={(v) => `R$${(v / 1000).toFixed(1)}k`}
                      />
                      <RechartsTooltip
                        contentStyle={{
                          backgroundColor: '#0f1115',
                          borderColor: '#334155',
                          borderRadius: '12px',
                          color: '#f8fafc',
                        }}
                        formatter={(value) => formatBRL(value)}
                      />
                      <Legend />
                      <Area
                        type="monotone"
                        dataKey="realizado"
                        name="Gasto Realizado"
                        stroke="#38bdf8"
                        strokeWidth={2.5}
                        fillOpacity={1}
                        fill="url(#colorGastos)"
                      />
                      <Area
                        type="monotone"
                        dataKey="poupadoReal"
                        name="Poupança Realizada"
                        stroke="#34d399"
                        strokeWidth={2.5}
                        fillOpacity={1}
                        fill="url(#colorPoupado)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </section>

              {/* Gráfico 2: Planejado vs. Realizado por Categoria */}
              <section className="bg-[#111827] border border-slate-800/90 rounded-2xl p-5 shadow-lg">
                <h3 className="text-base font-bold text-white mb-1">
                  Planejado (Simulador) vs. Realizado (Extrato)
                </h3>
                <p className="text-xs text-slate-400 mb-4">
                  Aderência ao orçamento por grupo de despesa
                </p>
                <div className="h-72 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={analyticsData.plannedVsActual}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                      <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} />
                      <YAxis
                        stroke="#94a3b8"
                        fontSize={12}
                        tickFormatter={(v) => `R$${v}`}
                      />
                      <RechartsTooltip
                        contentStyle={{
                          backgroundColor: '#0f172a',
                          borderColor: '#334155',
                          borderRadius: '12px',
                          color: '#f8fafc',
                        }}
                        formatter={(value) => formatBRL(value)}
                      />
                      <Legend />
                      <Bar
                        dataKey="Planejado"
                        fill="#6366f1"
                        radius={[6, 6, 0, 0]}
                      />
                      <Bar
                        dataKey="Realizado"
                        fill="#10b981"
                        radius={[6, 6, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </section>
            </div>

            {/* Gráfico 3 + Insights Acionáveis */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <section className="bg-[#111827] border border-slate-800/90 rounded-2xl p-5 shadow-lg">
                <h3 className="text-base font-bold text-white mb-1">
                  Composição da Renda
                </h3>
                <p className="text-xs text-slate-400 mb-2">
                  Visão proporcional do orçamento
                </p>
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={analyticsData.donutData}
                        cx="50%"
                        cy="50%"
                        innerRadius={55}
                        outerRadius={85}
                        paddingAngle={3}
                        dataKey="value"
                      >
                        {analyticsData.donutData.map((entry, idx) => (
                          <Cell key={`cell-${idx}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <RechartsTooltip
                        contentStyle={{
                          backgroundColor: '#0f172a',
                          borderColor: '#334155',
                          borderRadius: '12px',
                          color: '#f8fafc',
                        }}
                        formatter={(value) => formatBRL(value)}
                      />
                      <Legend wrapperStyle={{ fontSize: '12px' }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </section>

              <section className="lg:col-span-2 bg-[#111827] border border-slate-800/90 rounded-2xl p-5 shadow-lg space-y-4">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-emerald-400" />
                  Diagnóstico & Recomendações Inteligentes
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-[#0B0F19] border border-slate-800 rounded-xl p-4 space-y-1.5">
                    <div className="text-xs font-bold text-amber-400 uppercase">
                      1. Estratégia do Envelope Pix Semanal
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      Ao dividir os perecíveis em 4 transferências semanais de{' '}
                      <strong className="text-white">
                        {formatBRL(
                          metrics.categorySummaries.find(
                            (c) => c.id === 'mercado'
                          )?.weeklyPixValue || 0
                        )}
                      </strong>
                      , você evita o estouro do orçamento nas primeiras semanas
                      do mês e reduz desperdícios em até 18%.
                    </p>
                  </div>

                  <div className="bg-[#0B0F19] border border-slate-800 rounded-xl p-4 space-y-1.5">
                    <div className="text-xs font-bold text-sky-400 uppercase">
                      2. Concentração de Cartões
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      Você possui 4 cartões cadastrados, mas concentra gastos no
                      BMG e Itaú. Centralizar os gastos em 1 único cartão sem
                      anuidade facilita o controle e maximiza cashback/pontos.
                    </p>
                  </div>

                  <div className="bg-[#0B0F19] border border-slate-800 rounded-xl p-4 space-y-1.5">
                    <div className="text-xs font-bold text-emerald-400 uppercase">
                      3. Poder dos Juros Compostos
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      Investindo seu saldo livre atual de{' '}
                      <strong className="text-emerald-400">
                        {formatBRL(Math.max(0, metrics.totalSaved))}
                      </strong>{' '}
                      por mês a 100% do CDI (~0,88% a.m.), sua família acumulará{' '}
                      <strong className="text-white">
                        {formatBRL(Math.max(0, metrics.totalSaved) * 38.2)}
                      </strong>{' '}
                      em 3 anos.
                    </p>
                  </div>

                  <div className="bg-[#0B0F19] border border-slate-800 rounded-xl p-4 space-y-1.5">
                    <div className="text-xs font-bold text-indigo-400 uppercase">
                      4. Segurança da Moradia
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      Seus custos fixos de moradia representam{' '}
                      <strong className="text-white">
                        {formatPercent(
                          metrics.categorySummaries.find(
                            (c) => c.id === 'moradia'
                          )?.percentOfIncome || 0
                        )}
                      </strong>{' '}
                      da renda líquida — dentro do patamar saudável recomendado
                      (até 30%).
                    </p>
                  </div>
                </div>
              </section>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
