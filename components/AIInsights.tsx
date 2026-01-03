
import React from 'react';
import { Sparkles, AlertCircle, Lightbulb, TrendingUp, RefreshCw } from 'lucide-react';
import { AIInsight } from '../types';

interface Props {
  insights: AIInsight[];
  onRefresh: () => void;
  loading: boolean;
}

const AIInsights: React.FC<Props> = ({ insights, onRefresh, loading }) => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <div className="bg-violet-100 p-2 rounded-lg">
            <Sparkles className="w-5 h-5 text-violet-600" />
          </div>
          <h2 className="text-2xl font-bold text-slate-800">Smart Insights</h2>
        </div>
        <button 
          onClick={onRefresh}
          disabled={loading}
          className="flex items-center space-x-2 bg-white border border-slate-200 px-4 py-2 rounded-xl text-sm font-semibold hover:bg-slate-50 disabled:opacity-50 transition-all"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          <span>{loading ? 'Analyzing...' : 'Refresh AI'}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {insights.map((insight, idx) => (
          <div 
            key={idx} 
            className={`p-6 rounded-2xl border flex items-start space-x-4 transition-all hover:scale-[1.01] ${
              insight.type === 'alert' ? 'bg-red-50 border-red-100' :
              insight.type === 'investment' ? 'bg-emerald-50 border-emerald-100' :
              'bg-blue-50 border-blue-100'
            }`}
          >
            <div className={`p-3 rounded-xl ${
              insight.type === 'alert' ? 'bg-red-200 text-red-700' :
              insight.type === 'investment' ? 'bg-emerald-200 text-emerald-700' :
              'bg-blue-200 text-blue-700'
            }`}>
              {insight.type === 'alert' ? <AlertCircle className="w-6 h-6" /> :
               insight.type === 'investment' ? <TrendingUp className="w-6 h-6" /> :
               <Lightbulb className="w-6 h-6" />}
            </div>
            <div className="flex-1">
              <div className="flex justify-between items-start mb-1">
                <h3 className="font-bold text-slate-900">{insight.title}</h3>
                <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${
                  insight.severity === 'high' ? 'bg-red-600 text-white' :
                  insight.severity === 'medium' ? 'bg-amber-500 text-white' :
                  'bg-slate-400 text-white'
                }`}>
                  {insight.severity} Priority
                </span>
              </div>
              <p className="text-sm text-slate-700 leading-relaxed">{insight.content}</p>
            </div>
          </div>
        ))}

        {insights.length === 0 && !loading && (
          <div className="lg:col-span-2 text-center py-12 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
            <Sparkles className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500">Click Refresh to generate personalized AI financial advice.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AIInsights;
