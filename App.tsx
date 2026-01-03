
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  LayoutDashboard, 
  ShoppingCart, 
  Target, 
  Sparkles, 
  PieChart, 
  Settings,
  Bell,
  Search,
  Plus,
  ArrowRight,
  TrendingUp,
  User as UserIcon,
  X,
  CreditCard,
  History
} from 'lucide-react';
import Dashboard from './components/Dashboard';
import ExpenseTaskTracker from './components/ExpenseTaskTracker';
import SavingsGoals from './components/SavingsGoals';
import AIInsights from './components/AIInsights';
import { Transaction, Budget, SavingsGoal, ExpenseTask, AIInsight, Category, UserPersona, Bill } from './types';
import { getFinancialAdvice } from './services/geminiService';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'tracking' | 'goals' | 'ai'>('dashboard');
  const [showPersonaModal, setShowPersonaModal] = useState(false);
  
  // Single Source of Truth: Core Financial State
  const [persona, setPersona] = useState<UserPersona>({
    name: 'Alex Johnson',
    salary: 6500,
    familySize: 3,
    totalLoans: 15000,
    investmentNiche: 'SGB & Tech Stocks',
    isSetup: true
  });

  const [transactions, setTransactions] = useState<Transaction[]>([
    { id: '1', amount: 6500, category: 'Other', description: 'Monthly Salary', date: new Date().toISOString(), type: 'income' },
    { id: '2', amount: 1500, category: 'Housing', description: 'Rent Payment', date: new Date().toISOString(), type: 'expense' },
  ]);

  const [budgets, setBudgets] = useState<Budget[]>([
    { category: 'Groceries', limit: 800, spent: 350 },
    { category: 'Entertainment', limit: 400, spent: 120 },
    { category: 'Housing', limit: 2000, spent: 1500 },
    { category: 'Utilities', limit: 300, spent: 0 },
    { category: 'Travel', limit: 500, spent: 0 },
  ]);

  const [goals, setGoals] = useState<SavingsGoal[]>([
    { id: 'g1', name: 'Emergency Fund', target: 20000, current: 4500, priority: 1, isEmergencyFund: true },
    { id: 'g3', name: 'Gold Reserve (SGB)', target: 8000, current: 1200, priority: 2, isEmergencyFund: false, categoryPreference: 'SGB' },
    { id: 'g4', name: 'Family Vacation', target: 3500, current: 400, priority: 3, isEmergencyFund: false },
  ]);

  const [bills, setBills] = useState<Bill[]>([
    { id: 'b1', name: 'Fast Fiber Internet', amount: 75, dueDate: '2024-05-28', category: 'Utilities', isPaid: false },
    { id: 'b2', name: 'Smart Grid Electric', amount: 120, dueDate: '2024-05-30', category: 'Utilities', isPaid: false },
  ]);

  const [activeTask, setActiveTask] = useState<ExpenseTask | null>(null);
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [loadingInsights, setLoadingInsights] = useState(false);

  // Auto-refresh insights whenever core financial data changes
  useEffect(() => {
    const timer = setTimeout(() => {
      if (insights.length > 0) refreshInsights();
    }, 1000);
    return () => clearTimeout(timer);
  }, [persona, budgets, goals, transactions]);

  const refreshInsights = useCallback(async () => {
    setLoadingInsights(true);
    const newInsights = await getFinancialAdvice(transactions, goals, budgets, persona, bills);
    setInsights(newInsights);
    setLoadingInsights(false);
  }, [transactions, goals, budgets, persona, bills]);

  // Financial Handlers: Ensuring Real-time Recalculations
  const handleUpdateBudget = (category: string, newLimit: number) => {
    setBudgets(prev => prev.map(b => b.category === category ? { ...b, limit: newLimit } : b));
  };

  const handleStartTask = (name: string, budget: number) => {
    setActiveTask({ id: Date.now().toString(), name, budget, spent: 0, items: [], isActive: true });
  };

  const handleAddItemToTask = (amount: number, description: string) => {
    if (!activeTask) return;
    setActiveTask({
      ...activeTask,
      spent: activeTask.spent + amount,
      items: [...activeTask.items, { id: Date.now().toString(), name: description, amount }]
    });
  };

  const handleCompleteTask = () => {
    if (!activeTask) return;
    
    const surplus = activeTask.budget - activeTask.spent;
    
    const newTransaction: Transaction = {
      id: Date.now().toString(),
      amount: activeTask.spent,
      category: 'Groceries',
      description: `Task: ${activeTask.name}`,
      date: new Date().toISOString(),
      type: 'expense',
    };

    setTransactions(prev => [newTransaction, ...prev]);
    setBudgets(prev => prev.map(b => b.category === 'Groceries' ? { ...b, spent: b.spent + activeTask.spent } : b));

    // REAL-TIME SURPLUS FLOW: Instantly recalculate and move leftovers to priority 1 goal
    if (surplus > 0) {
      const topGoal = [...goals].sort((a,b) => a.priority - b.priority)[0];
      if (topGoal) {
        setGoals(prev => prev.map(g => g.id === topGoal.id ? { ...g, current: g.current + surplus } : g));
        setTransactions(prev => [{
          id: Date.now().toString(),
          amount: surplus,
          category: 'Other',
          description: `Surplus flow from ${activeTask.name}`,
          date: new Date().toISOString(),
          type: 'expense'
        }, ...prev]);
      }
    }

    setActiveTask(null);
  };

  const handleAddGoal = (goalData: Omit<SavingsGoal, 'id' | 'current'>) => {
    setGoals(prev => [...prev, { ...goalData, id: `g${Date.now()}`, current: 0 }]);
  };

  const handleAddContribution = (goalId: string, amount: number) => {
    setGoals(prev => prev.map(g => g.id === goalId ? { ...g, current: g.current + amount } : g));
    setTransactions(prev => [{
      id: Date.now().toString(),
      amount,
      category: 'Other',
      description: `Direct Contribution: ${goals.find(g => g.id === goalId)?.name}`,
      date: new Date().toISOString(),
      type: 'expense'
    }, ...prev]);
  };

  const handlePayBill = (billId: string) => {
    const bill = bills.find(b => b.id === billId);
    if (!bill) return;

    setBills(prev => prev.map(b => b.id === billId ? { ...b, isPaid: true } : b));
    setTransactions(prev => [{
      id: Date.now().toString(),
      amount: bill.amount,
      category: bill.category,
      description: `Paid Bill: ${bill.name}`,
      date: new Date().toISOString(),
      type: 'expense'
    }, ...prev]);
    
    setBudgets(prev => prev.map(b => b.category === bill.category ? { ...b, spent: b.spent + bill.amount } : b));
  };

  const handleUpdatePersona = (data: Partial<UserPersona>) => {
    setPersona(prev => ({ ...prev, ...data, isSetup: true }));
    setShowPersonaModal(false);
  };

  const handleAddIncome = (amount: number) => {
    const incomeTx: Transaction = {
      id: Date.now().toString(),
      amount,
      category: 'Other',
      description: 'Side Hustle / Extra Income',
      date: new Date().toISOString(),
      type: 'income'
    };
    setTransactions(prev => [incomeTx, ...prev]);
    
    // Automatically allocate 20% of new income to Emergency Fund
    const emergencyGoal = goals.find(g => g.isEmergencyFund);
    if (emergencyGoal) {
      handleAddContribution(emergencyGoal.id, amount * 0.2);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      {/* Dynamic Sidebar */}
      <nav className="w-full md:w-72 bg-slate-900 text-slate-400 flex flex-col h-auto md:h-screen sticky top-0 z-50 p-8">
        <div className="flex items-center space-x-3 text-white mb-12">
          <div className="bg-emerald-500 p-2.5 rounded-2xl shadow-lg shadow-emerald-500/20">
            <TrendingUp className="w-6 h-6" />
          </div>
          <span className="text-2xl font-black tracking-tighter">WEALTHFLOW</span>
        </div>

        <div className="space-y-2 flex-1">
          {[
            { id: 'dashboard', icon: LayoutDashboard, label: 'Control Center' },
            { id: 'tracking', icon: ShoppingCart, label: 'Shopping Pulse' },
            { id: 'goals', icon: Target, label: 'Capital Targets' },
            { id: 'ai', icon: Sparkles, label: 'Wealth Oracle' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id as any)}
              className={`w-full flex items-center space-x-3 px-5 py-4 rounded-2xl transition-all duration-300 ${
                activeTab === item.id 
                  ? 'bg-emerald-500 text-white font-black shadow-xl shadow-emerald-500/30 translate-x-1' 
                  : 'hover:bg-slate-800 hover:text-white hover:translate-x-1'
              }`}
            >
              <item.icon className="w-5 h-5" />
              <span className="text-sm font-bold uppercase tracking-wide">{item.label}</span>
            </button>
          ))}
        </div>

        <div className="mt-auto space-y-4 pt-8 border-t border-slate-800">
          <button 
            onClick={() => setShowPersonaModal(true)}
            className="flex items-center space-x-4 w-full px-5 py-4 hover:text-white transition-all bg-slate-800/40 rounded-2xl group border border-slate-800 hover:border-emerald-500/50"
          >
            <div className="bg-slate-700 p-2.5 rounded-xl group-hover:bg-emerald-500 transition-colors shadow-inner">
              <UserIcon className="w-5 h-5 text-white" />
            </div>
            <div className="text-left">
              <p className="text-xs font-black text-slate-500 group-hover:text-emerald-400 uppercase tracking-tighter">Profile Sync</p>
              <p className="text-sm font-bold text-white truncate max-w-[120px]">{persona.name}</p>
            </div>
          </button>
        </div>
      </nav>

      {/* Main Execution Arena */}
      <main className="flex-1 p-4 md:p-12 lg:p-16 max-w-[1600px] mx-auto w-full">
        {/* Global Toolbar */}
        <div className="flex justify-between items-center mb-12">
           <div>
              <h1 className="text-4xl font-black text-slate-900 tracking-tight">
                {activeTab === 'dashboard' && 'Financial Nexus'}
                {activeTab === 'tracking' && 'Real-time Pulse'}
                {activeTab === 'goals' && 'Wealth Accumulation'}
                {activeTab === 'ai' && 'AI Synthesis'}
              </h1>
              <div className="flex items-center mt-2 space-x-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                <p className="text-slate-500 text-sm font-medium">All financial systems nominal. Household sync active.</p>
              </div>
           </div>
           
           <div className="flex items-center space-x-4">
              <div className="hidden lg:flex items-center bg-white border border-slate-200 rounded-2xl p-1.5 shadow-sm">
                 <button className="px-4 py-2 text-xs font-bold bg-slate-100 rounded-xl text-slate-600 flex items-center">
                    <History className="w-3.5 h-3.5 mr-2" />
                    History
                 </button>
              </div>
              <button 
                onClick={() => handleAddIncome(1000)}
                className="bg-slate-900 text-white py-3.5 px-6 rounded-2xl hover:bg-slate-800 flex items-center space-x-3 shadow-xl shadow-slate-900/10 transition-transform active:scale-95"
              >
                <Plus className="w-5 h-5" />
                <span className="text-sm font-black uppercase tracking-wider">Inject Capital</span>
              </button>
           </div>
        </div>

        {/* Tab View Logic */}
        <div className="animate-in fade-in slide-in-from-bottom-8 duration-700">
          {activeTab === 'dashboard' && (
            <Dashboard 
              transactions={transactions} 
              budgets={budgets} 
              goals={goals} 
              persona={persona}
              bills={bills}
              onPayBill={handlePayBill}
              onUpdateBudget={handleUpdateBudget}
            />
          )}
          
          {activeTab === 'tracking' && (
            <div className="max-w-3xl mx-auto">
              <div className="bg-emerald-900 p-8 rounded-[2.5rem] text-white mb-10 shadow-2xl shadow-emerald-900/20 flex items-center justify-between border-4 border-emerald-500/20">
                <div className="space-y-2">
                  <h3 className="text-2xl font-black italic tracking-tighter">AUTOMATED SURPLUS ENGINE</h3>
                  <p className="text-emerald-400 font-bold text-sm uppercase tracking-widest">Target: {goals[0]?.name}</p>
                  <p className="text-emerald-100/60 text-xs leading-relaxed max-w-sm">Every dollar saved during this task will be instantly redirected to your highest priority savings goal to accelerate wealth building.</p>
                </div>
                <div className="bg-emerald-500 p-4 rounded-3xl animate-bounce">
                  <TrendingUp className="w-8 h-8" />
                </div>
              </div>
              <ExpenseTaskTracker 
                activeTask={activeTask}
                onStartTask={handleStartTask}
                onAddItem={handleAddItemToTask}
                onCompleteTask={handleCompleteTask}
                onCancelTask={() => setActiveTask(null)}
              />
            </div>
          )}

          {activeTab === 'goals' && (
            <SavingsGoals 
              goals={goals} 
              onAddContribution={handleAddContribution} 
              onAddGoal={handleAddGoal}
            />
          )}

          {activeTab === 'ai' && (
            <AIInsights 
              insights={insights} 
              onRefresh={refreshInsights} 
              loading={loadingInsights} 
            />
          )}
        </div>
      </main>

      {/* Household Setup / Settings Modal */}
      {showPersonaModal && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-xl z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-[3rem] shadow-[0_0_100px_rgba(0,0,0,0.5)] w-full max-w-xl overflow-hidden animate-in zoom-in-90 duration-300">
            <div className="p-10 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <div>
                <h3 className="text-3xl font-black text-slate-900 tracking-tighter uppercase">Household Nexus</h3>
                <p className="text-slate-500 text-sm font-bold mt-1">Updates here ripple through all budgets and AI models.</p>
              </div>
              <button onClick={() => setShowPersonaModal(false)} className="bg-white p-3 rounded-2xl border border-slate-200 text-slate-400 hover:text-red-500 transition-colors shadow-sm">
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-10 space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Head of Household</label>
                  <input 
                    type="text" 
                    className="w-full border-slate-200 border-2 rounded-2xl p-4 font-bold focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all"
                    value={persona.name}
                    onChange={e => setPersona({...persona, name: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Monthly Inflow ($)</label>
                  <input 
                    type="number" 
                    className="w-full border-slate-200 border-2 rounded-2xl p-4 font-bold focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all"
                    value={persona.salary}
                    onChange={e => setPersona({...persona, salary: Number(e.target.value)})}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Family Density</label>
                  <input 
                    type="number" 
                    className="w-full border-slate-200 border-2 rounded-2xl p-4 font-bold focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all"
                    value={persona.familySize}
                    onChange={e => setPersona({...persona, familySize: Number(e.target.value)})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Liabilities ($)</label>
                  <input 
                    type="number" 
                    className="w-full border-slate-200 border-2 rounded-2xl p-4 font-bold focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all text-red-600"
                    value={persona.totalLoans}
                    onChange={e => setPersona({...persona, totalLoans: Number(e.target.value)})}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Investment Target Niche</label>
                <input 
                  type="text" 
                  className="w-full border-slate-200 border-2 rounded-2xl p-4 font-bold focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all"
                  value={persona.investmentNiche}
                  onChange={e => setPersona({...persona, investmentNiche: e.target.value})}
                  placeholder="e.g. SGB, Crypto, ETFs"
                />
              </div>
              <button 
                onClick={() => handleUpdatePersona(persona)}
                className="w-full bg-slate-900 text-white font-black py-5 rounded-[2rem] hover:bg-slate-800 transition-all mt-6 shadow-2xl shadow-slate-900/20 uppercase tracking-widest text-sm"
              >
                Sync Financial Reality
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
