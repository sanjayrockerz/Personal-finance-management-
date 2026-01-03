
import React, { useState } from 'react';
import { ShoppingCart, Plus, CheckCircle2, Trash2, AlertCircle, AlertTriangle, X } from 'lucide-react';
import { ExpenseTask, Category } from '../types';

interface Props {
  activeTask: ExpenseTask | null;
  onStartTask: (name: string, budget: number) => void;
  onAddItem: (amount: number, description: string) => void;
  onCompleteTask: () => void;
  onCancelTask: () => void;
}

const ExpenseTaskTracker: React.FC<Props> = ({ 
  activeTask, onStartTask, onAddItem, onCompleteTask, onCancelTask 
}) => {
  const [taskName, setTaskName] = useState('Grocery Run');
  const [taskBudget, setTaskBudget] = useState(100);
  const [itemName, setItemName] = useState('');
  const [itemPrice, setItemPrice] = useState('');
  const [showConfirm, setShowConfirm] = useState(false);

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!itemName || !itemPrice) return;
    onAddItem(parseFloat(itemPrice), itemName);
    setItemName('');
    setItemPrice('');
  };

  const progress = activeTask ? (activeTask.spent / activeTask.budget) * 100 : 0;
  const isOver = activeTask && activeTask.spent > activeTask.budget;

  const handleFinishClick = () => {
    setShowConfirm(true);
  };

  const confirmCompletion = () => {
    setShowConfirm(false);
    onCompleteTask();
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden relative">
      <div className="bg-slate-900 p-6 text-white">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <ShoppingCart className="w-6 h-6 text-emerald-400" />
            <h2 className="text-xl font-bold">Shopping Task Mode</h2>
          </div>
          {activeTask && (
            <span className="bg-emerald-500/20 text-emerald-400 px-3 py-1 rounded-full text-xs font-semibold animate-pulse">
              LIVE TRACKING
            </span>
          )}
        </div>
        
        {!activeTask ? (
          <div className="space-y-4">
            <p className="text-slate-400 text-sm">Start a shopping session to track spending in real-time against a dedicated budget.</p>
            <div className="grid grid-cols-2 gap-4">
              <input 
                type="text" 
                placeholder="Session Name" 
                className="bg-slate-800 border-slate-700 rounded-xl px-4 py-2 focus:ring-2 focus:ring-emerald-500 outline-none"
                value={taskName}
                onChange={e => setTaskName(e.target.value)}
              />
              <input 
                type="number" 
                placeholder="Budget ($)" 
                className="bg-slate-800 border-slate-700 rounded-xl px-4 py-2 focus:ring-2 focus:ring-emerald-500 outline-none"
                value={taskBudget}
                onChange={e => setTaskBudget(Number(e.target.value))}
              />
            </div>
            <button 
              onClick={() => onStartTask(taskName, taskBudget)}
              className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-emerald-500/10"
            >
              Start Session
            </button>
          </div>
        ) : (
          <div>
            <div className="flex justify-between items-end mb-2">
              <p className="text-2xl font-bold">{activeTask.name}</p>
              <p className="text-sm">
                <span className={isOver ? 'text-red-400 font-bold' : 'text-emerald-400 font-bold'}>
                  ${activeTask.spent.toFixed(2)}
                </span> / ${activeTask.budget}
              </p>
            </div>
            <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden">
              <div 
                className={`h-full transition-all duration-500 ${isOver ? 'bg-red-500' : 'bg-emerald-500'}`}
                style={{ width: `${Math.min(progress, 100)}%` }}
              ></div>
            </div>
            {isOver && (
              <div className="flex items-center mt-2 text-red-400 text-xs font-medium animate-bounce">
                <AlertCircle className="w-4 h-4 mr-1" />
                Budget exceeded! Adjust spending now.
              </div>
            )}
          </div>
        )}
      </div>

      {activeTask && (
        <div className="p-6">
          <form onSubmit={handleAddItem} className="flex gap-2 mb-6">
            <input 
              type="text" 
              placeholder="Item Name" 
              className="flex-1 border-slate-200 border rounded-xl px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
              value={itemName}
              onChange={e => setItemName(e.target.value)}
            />
            <input 
              type="number" 
              step="0.01"
              placeholder="$" 
              className="w-24 border-slate-200 border rounded-xl px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
              value={itemPrice}
              onChange={e => setItemPrice(e.target.value)}
            />
            <button 
              type="submit"
              className="bg-blue-600 text-white p-2 rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/20"
            >
              <Plus className="w-6 h-6" />
            </button>
          </form>

          <div className="max-h-[300px] overflow-y-auto space-y-3 pr-2 scrollbar-thin">
            {activeTask.items.length === 0 ? (
              <p className="text-center text-slate-400 py-8">Add your first item to begin tracking.</p>
            ) : (
              activeTask.items.map(item => (
                <div key={item.id} className="flex justify-between items-center p-3 bg-slate-50 rounded-xl border border-slate-100 hover:border-slate-200 transition-colors">
                  <span className="font-medium text-slate-700">{item.name}</span>
                  <span className="font-bold text-slate-900">${item.amount.toFixed(2)}</span>
                </div>
              ))
            )}
          </div>

          <div className="mt-8 pt-6 border-t border-slate-100 grid grid-cols-2 gap-4">
            <button 
              onClick={onCancelTask}
              className="flex items-center justify-center py-3 text-slate-400 font-semibold hover:text-red-500 transition-colors"
            >
              <Trash2 className="w-5 h-5 mr-2" />
              Cancel Task
            </button>
            <button 
              onClick={handleFinishClick}
              className="flex items-center justify-center py-3 bg-emerald-50 text-emerald-600 rounded-xl font-bold hover:bg-emerald-100 transition-colors shadow-sm"
            >
              <CheckCircle2 className="w-5 h-5 mr-2" />
              Log & Finish
            </button>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {showConfirm && activeTask && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[70] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-8 text-center">
              <div className="bg-amber-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                <AlertTriangle className="w-8 h-8 text-amber-600" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-2">Confirm Expenses</h3>
              <p className="text-slate-500 mb-8">
                You've recorded <span className="font-bold text-slate-900">{activeTask.items.length} items</span> totaling <span className="font-bold text-emerald-600">${activeTask.spent.toFixed(2)}</span>. 
                Would you like to log this to your transactions?
              </p>
              <div className="space-y-3">
                <button 
                  onClick={confirmCompletion}
                  className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-4 rounded-2xl transition-all shadow-lg shadow-emerald-500/20"
                >
                  Confirm & Log
                </button>
                <button 
                  onClick={() => setShowConfirm(false)}
                  className="w-full bg-slate-50 hover:bg-slate-100 text-slate-600 font-bold py-4 rounded-2xl transition-all"
                >
                  Back to Editing
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExpenseTaskTracker;
