
import React, { useState } from 'react';
import { 
  Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell
} from 'recharts';
import { Transaction, Budget, SavingsGoal, UserPersona, Bill } from '../types';
import { 
  Wallet, TrendingUp, Target, AlertTriangle, Users, Landmark, 
  Calendar, ArrowRightLeft, Edit3, Save, X, Info 
} from 'lucide-react';

interface Props {
  transactions: Transaction[];
  budgets: Budget[];
  goals: SavingsGoal[];
  persona: UserPersona;
  bills: Bill[];
  onPayBill: (billId: string) => void;
  onUpdateBudget: (category: string, newLimit: number) => void;
}

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

const Dashboard: React.FC<Props> = ({ transactions, budgets, goals, persona, bills, onPayBill, onUpdateBudget }) => {
  const [editingBudget, setEditingBudget] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<number>(0);

  const totalBalance = transactions.reduce((acc, t) => acc + (t.type === 'income' ? t.amount : -t.amount), 0);
  const monthlyExpenses = transactions
    .filter(t => t.type === 'expense' && t.date.startsWith(new Date().toISOString().slice(0, 7)))
    .reduce((acc, t) => acc + t.amount, 0);
  
  const totalBudgeted = budgets.reduce((sum, b) => sum + b.limit, 0);
  const unpaidBillsTotal = bills.filter(b => !b.isPaid).reduce((sum, b) => sum + b.amount, 0);
  const unallocatedSalary = persona.salary - totalBudgeted - unpaidBillsTotal;

  const startEdit = (b: Budget) => {
    setEditingBudget(b.category);
    setEditValue(b.limit);
  };

  const saveEdit = (category: string) => {
    onUpdateBudget(category, editValue);
    setEditingBudget(null);
  };

  return (
    <div className="space-y-6">
      {/* Persona Context Banner - Single Source of Truth Header */}
      <div className="bg-slate-900 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 blur-3xl -mr-32 -mt-32 rounded-full"></div>
        <div className="relative z-10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          <div className="flex items-center space-x-6">
            <div className="w-20 h-20 bg-emerald-500 rounded-2xl flex items-center justify-center text-4xl font-black shadow-lg shadow-emerald-500/20">
              {persona.name[0]}
            </div>
            <div>
              <h2 className="text-3xl font-black tracking-tight">{persona.name}'s Wealth Center</h2>
              <div className="flex flex-wrap gap-4 mt-3">
                <span className="flex items-center bg-slate-800 px-3 py-1.5 rounded-xl text-xs font-bold border border-slate-700">
                  <Users className="w-3.5 h-3.5 mr-1.5 text-emerald-400"/> {persona.familySize} Members
                </span>
                <span className="flex items-center bg-slate-800 px-3 py-1.5 rounded-xl text-xs font-bold border border-slate-700">
                  <Landmark className="w-3.5 h-3.5 mr-1.5 text-red-400"/> ${persona.totalLoans.toLocaleString()} Debt
                </span>
                <span className="flex items-center bg-slate-800 px-3 py-1.5 rounded-xl text-xs font-bold border border-slate-700">
                  <TrendingUp className="w-3.5 h-3.5 mr-1.5 text-blue-400"/> Strategy: {persona.investmentNiche}
                </span>
              </div>
            </div>
          </div>
          <div className="bg-white/5 backdrop-blur-sm p-6 rounded-2xl border border-white/10 w-full lg:w-auto">
            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-1">Monthly Salary Stream</p>
            <p className="text-5xl font-black text-emerald-400">${persona.salary.toLocaleString()}</p>
            <div className="mt-4 flex items-center text-xs">
              <span className={`font-bold ${unallocatedSalary >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                ${unallocatedSalary.toLocaleString()}
              </span>
              <span className="text-slate-400 ml-1.5 font-medium">unallocated after bills & budgets</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Financial Pulse Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 group hover:border-emerald-200 transition-colors">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <Wallet className="w-5 h-5 text-emerald-600" />
              <span className="text-sm text-slate-500 font-bold uppercase tracking-tighter">Current Balance</span>
            </div>
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
          </div>
          <p className="text-3xl font-black text-slate-900">${totalBalance.toLocaleString()}</p>
          <p className="text-xs text-slate-400 mt-1">Real-time liquid assets</p>
        </div>
        
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 group hover:border-amber-200 transition-colors">
          <div className="flex items-center space-x-2 mb-2">
            <Calendar className="w-5 h-5 text-amber-600" />
            <span className="text-sm text-slate-500 font-bold uppercase tracking-tighter">Pending Bills</span>
          </div>
          <p className="text-3xl font-black text-amber-600">${unpaidBillsTotal.toLocaleString()}</p>
          <p className="text-xs text-slate-400 mt-1">Due within this cycle</p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 group hover:border-blue-200 transition-colors">
          <div className="flex items-center space-x-2 mb-2">
            <Target className="w-5 h-5 text-blue-600" />
            <span className="text-sm text-slate-500 font-bold uppercase tracking-tighter">Savings Progress</span>
          </div>
          <p className="text-3xl font-black text-slate-900">
            {((goals.reduce((a,b) => a + b.current, 0) / goals.reduce((a,b) => a + b.target, 1)) * 100).toFixed(1)}%
          </p>
          <p className="text-xs text-slate-400 mt-1">Aggregate of all goals</p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 group hover:border-red-200 transition-colors">
          <div className="flex items-center space-x-2 mb-2">
            <AlertTriangle className="w-5 h-5 text-red-600" />
            <span className="text-sm text-slate-500 font-bold uppercase tracking-tighter">Budget Burn</span>
          </div>
          <p className="text-3xl font-black text-slate-900">
            {((budgets.reduce((a,b) => a + b.spent, 0) / totalBudgeted) * 100).toFixed(1)}%
          </p>
          <p className="text-xs text-slate-400 mt-1">Of total monthly allocation</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Dynamic Budget Management Section */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h3 className="text-xl font-black text-slate-900">Monthly Budget Allocations</h3>
                <p className="text-sm text-slate-500">Edit limits to instantly see the impact on your savings capacity.</p>
              </div>
              <div className="bg-slate-50 px-4 py-2 rounded-xl flex items-center text-xs font-bold text-slate-600 border border-slate-100">
                <Info className="w-4 h-4 mr-2 text-blue-500" />
                Live Sync Enabled
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {budgets.map((budget, idx) => (
                <div key={budget.category} className="p-5 rounded-2xl border border-slate-100 bg-slate-50/50 hover:bg-white hover:shadow-md transition-all">
                  <div className="flex justify-between items-center mb-4">
                    <span className="font-bold text-slate-700">{budget.category}</span>
                    <div className="flex items-center space-x-2">
                      {editingBudget === budget.category ? (
                        <div className="flex items-center bg-white border border-emerald-500 rounded-lg overflow-hidden shadow-sm">
                          <input 
                            type="number"
                            className="w-20 px-2 py-1 text-sm font-bold outline-none"
                            value={editValue}
                            onChange={(e) => setEditValue(Number(e.target.value))}
                            autoFocus
                          />
                          <button onClick={() => saveEdit(budget.category)} className="p-1 text-emerald-600 hover:bg-emerald-50"><Save className="w-4 h-4" /></button>
                          <button onClick={() => setEditingBudget(null)} className="p-1 text-red-600 hover:bg-red-50"><X className="w-4 h-4" /></button>
                        </div>
                      ) : (
                        <button 
                          onClick={() => startEdit(budget)}
                          className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-end mb-2">
                    <p className="text-xs font-bold text-slate-400">SPENT</p>
                    <p className="text-lg font-black text-slate-900">${budget.spent} <span className="text-sm text-slate-400 font-bold">/ ${budget.limit}</span></p>
                  </div>
                  
                  <div className="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-700 ${budget.spent > budget.limit ? 'bg-red-500' : 'bg-emerald-500'}`}
                      style={{ width: `${Math.min((budget.spent / budget.limit) * 100, 100)}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
            <h3 className="text-xl font-black text-slate-900 mb-6">Spending Distribution</h3>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={budgets.map(b => ({ name: b.category, value: b.spent }))}
                    cx="50%"
                    cy="50%"
                    innerRadius={80}
                    outerRadius={120}
                    paddingAngle={8}
                    dataKey="value"
                  >
                    {budgets.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Bill & Task Remainder Section */}
        <div className="space-y-6">
          <div className="bg-slate-900 p-8 rounded-3xl shadow-xl text-white">
            <div className="flex items-center space-x-3 mb-6">
              <ArrowRightLeft className="w-6 h-6 text-emerald-400" />
              <h3 className="text-xl font-black">Financial Flow</h3>
            </div>
            
            <div className="space-y-6">
              <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                <p className="text-xs text-slate-400 font-bold uppercase mb-2">Next Surplus Allocation</p>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">{goals[0]?.name || 'N/A'}</span>
                  <span className="text-emerald-400 font-black text-xl">100%</span>
                </div>
              </div>

              <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                <p className="text-xs text-slate-400 font-bold uppercase mb-2">Monthly Fixed Costs</p>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Unpaid Bills</span>
                  <span className="text-amber-400 font-black text-xl">${unpaidBillsTotal}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
            <h3 className="text-xl font-black text-slate-900 mb-6">Active Bills</h3>
            <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
              {bills.filter(b => !b.isPaid).map(bill => (
                <div key={bill.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:border-blue-200 transition-all flex justify-between items-center group">
                  <div className="flex items-center space-x-4">
                    <div className="bg-blue-100 p-2 rounded-xl">
                      <Calendar className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-black text-slate-900 text-sm">{bill.name}</p>
                      <p className="text-[10px] text-slate-500 font-bold uppercase">{new Date(bill.dueDate).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-black text-slate-900">${bill.amount}</p>
                    <button 
                      onClick={() => onPayBill(bill.id)}
                      className="text-xs font-black text-blue-600 hover:text-blue-800 underline decoration-2 underline-offset-4"
                    >
                      Pay Now
                    </button>
                  </div>
                </div>
              ))}
              {bills.filter(b => !b.isPaid).length === 0 && (
                <div className="text-center py-12">
                  <div className="bg-emerald-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Target className="w-6 h-6 text-emerald-600" />
                  </div>
                  <p className="text-slate-500 font-bold text-sm">Debt Free for May!</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
