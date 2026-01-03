
import React, { useState } from 'react';
import { Target, ShieldCheck, ArrowUpRight, TrendingUp, Plus, X } from 'lucide-react';
import { SavingsGoal } from '../types';

interface Props {
  goals: SavingsGoal[];
  onAddContribution: (goalId: string, amount: number) => void;
  onAddGoal: (goal: Omit<SavingsGoal, 'id' | 'current'>) => void;
}

const SavingsGoals: React.FC<Props> = ({ goals, onAddContribution, onAddGoal }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [newGoal, setNewGoal] = useState({
    name: '',
    target: 0,
    priority: 1,
    isEmergencyFund: false,
    categoryPreference: ''
  });

  const sortedGoals = [...goals].sort((a, b) => a.priority - b.priority);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGoal.name || newGoal.target <= 0) return;
    onAddGoal(newGoal);
    setIsAdding(false);
    setNewGoal({ name: '', target: 0, priority: 1, isEmergencyFund: false, categoryPreference: '' });
  };

  return (
    <div className="space-y-6 relative">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-800">Savings & Goals</h2>
        <button 
          onClick={() => setIsAdding(true)}
          className="bg-slate-900 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-slate-800 transition-colors flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>Add Goal</span>
        </button>
      </div>

      {/* Add Goal Modal */}
      {isAdding && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <h3 className="text-xl font-bold text-slate-900">New Savings Goal</h3>
              <button onClick={() => setIsAdding(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-6 h-6" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Goal Name</label>
                <input 
                  required
                  type="text"
                  className="w-full border-slate-200 border rounded-xl px-4 py-2 focus:ring-2 focus:ring-emerald-500 outline-none"
                  placeholder="e.g., New Laptop, House Deposit"
                  value={newGoal.name}
                  onChange={e => setNewGoal({...newGoal, name: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Target Amount ($)</label>
                  <input 
                    required
                    type="number"
                    className="w-full border-slate-200 border rounded-xl px-4 py-2 focus:ring-2 focus:ring-emerald-500 outline-none"
                    value={newGoal.target || ''}
                    onChange={e => setNewGoal({...newGoal, target: Number(e.target.value)})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Priority (1-5)</label>
                  <input 
                    type="number"
                    min="1"
                    max="5"
                    className="w-full border-slate-200 border rounded-xl px-4 py-2 focus:ring-2 focus:ring-emerald-500 outline-none"
                    value={newGoal.priority}
                    onChange={e => setNewGoal({...newGoal, priority: Number(e.target.value)})}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Investment Preference (Optional)</label>
                <input 
                  type="text"
                  className="w-full border-slate-200 border rounded-xl px-4 py-2 focus:ring-2 focus:ring-emerald-500 outline-none"
                  placeholder="e.g., Index Funds, SGBs"
                  value={newGoal.categoryPreference}
                  onChange={e => setNewGoal({...newGoal, categoryPreference: e.target.value})}
                />
              </div>
              <div className="flex items-center space-x-3 p-3 bg-slate-50 rounded-xl">
                <input 
                  type="checkbox"
                  id="isEmergency"
                  className="w-5 h-5 rounded text-emerald-500 focus:ring-emerald-500 border-slate-300"
                  checked={newGoal.isEmergencyFund}
                  onChange={e => setNewGoal({...newGoal, isEmergencyFund: e.target.checked})}
                />
                <label htmlFor="isEmergency" className="text-sm font-medium text-slate-700 cursor-pointer">
                  Is this an Emergency Fund?
                </label>
              </div>
              <button 
                type="submit"
                className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-emerald-500/20 mt-4"
              >
                Create Goal
              </button>
            </form>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sortedGoals.map(goal => {
          const progress = (goal.current / goal.target) * 100;
          return (
            <div key={goal.id} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col h-full hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <div className={`p-3 rounded-xl ${goal.isEmergencyFund ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'}`}>
                  {goal.isEmergencyFund ? <ShieldCheck className="w-6 h-6" /> : <Target className="w-6 h-6" />}
                </div>
                <div className="bg-slate-100 px-2 py-1 rounded text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  Priority {goal.priority}
                </div>
              </div>

              <h3 className="text-lg font-bold text-slate-800 mb-1">{goal.name}</h3>
              <p className="text-sm text-slate-500 mb-6">
                Target: <span className="font-semibold text-slate-900">${goal.target.toLocaleString()}</span>
              </p>

              <div className="mt-auto space-y-4">
                <div className="flex justify-between items-end text-sm mb-1">
                  <span className="font-medium text-slate-600">${goal.current.toLocaleString()} saved</span>
                  <span className="font-bold text-blue-600">{progress.toFixed(0)}%</span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-700 ${goal.isEmergencyFund ? 'bg-red-500' : 'bg-blue-600'}`}
                    style={{ width: `${Math.min(progress, 100)}%` }}
                  ></div>
                </div>

                {goal.categoryPreference && (
                  <div className="bg-emerald-50 p-2 rounded-lg flex items-center text-xs text-emerald-700">
                    <TrendingUp className="w-4 h-4 mr-2" />
                    Preferred: {goal.categoryPreference}
                  </div>
                )}

                <button 
                  onClick={() => onAddContribution(goal.id, 100)}
                  className="w-full flex items-center justify-center space-x-2 py-2 border-2 border-slate-100 rounded-xl hover:border-blue-600 hover:text-blue-600 transition-all font-semibold text-sm"
                >
                  <ArrowUpRight className="w-4 h-4" />
                  <span>Contribute $100</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default SavingsGoals;
