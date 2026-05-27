import React from 'react';
import { useFinance } from '../../context/FinanceContext';
import { Card, CardTitle } from '../ui/Card';
import { Sparkles, CheckCircle2, AlertTriangle, Info, AlertOctagon } from 'lucide-react';

export const PatternInsights = () => {
  const { insights, reportsLoading } = useFinance();

  const getInsightIcon = (type) => {
    switch (type) {
      case 'success':
        return <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />;
      case 'danger':
        return <AlertOctagon className="w-5 h-5 text-rose-400 shrink-0" />;
      case 'info':
      default:
        return <Info className="w-5 h-5 text-sky-400 shrink-0" />;
    }
  };

  const getInsightClasses = (type) => {
    switch (type) {
      case 'success':
        return 'border-emerald-500/20 bg-emerald-500/5 text-emerald-100 hover:border-emerald-500/40';
      case 'warning':
        return 'border-amber-500/20 bg-amber-500/5 text-amber-100 hover:border-amber-500/40';
      case 'danger':
        return 'border-rose-500/20 bg-rose-500/5 text-rose-100 hover:border-rose-500/40';
      case 'info':
      default:
        return 'border-sky-500/20 bg-sky-500/5 text-sky-100 hover:border-sky-500/40';
    }
  };

  return (
    <Card className="h-full flex flex-col justify-between" hoverEffect={true}>
      <div>
        <CardTitle className="flex items-center gap-2 mb-1">
          <Sparkles className="w-5 h-5 text-indigo-400" />
          Análisis de Patrones de Consumo
        </CardTitle>
        <p className="text-xs text-dark-muted mb-4">Insights inteligentes generados automáticamente a partir de tu actividad contable.</p>
      </div>

      {reportsLoading ? (
        <div className="flex-1 flex items-center justify-center min-h-[200px]">
          <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : insights.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center p-6 min-h-[200px]">
          <p className="text-sm text-dark-muted">Reopilando información...</p>
          <p className="text-xs text-dark-muted/60 mt-1">Registra más movimientos para que el sistema analice tus hábitos financieros.</p>
        </div>
      ) : (
        <div className="flex-1 space-y-3 max-h-[300px] overflow-y-auto pr-1">
          {insights.map((insight, index) => (
            <div
              key={index}
              className={`flex gap-3 p-4 rounded-xl border transition-all duration-200 ${getInsightClasses(insight.type)}`}
            >
              {getInsightIcon(insight.type)}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider mb-1">{insight.title}</h4>
                <p className="text-xs leading-relaxed text-dark-text/90">{insight.description}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
};
export default PatternInsights;
