import React from 'react';
import { useFinance } from '../../context/FinanceContext';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { Card, CardTitle } from '../ui/Card';
import { BarChart3 } from 'lucide-react';

export const IncomeExpenseBarChart = () => {
  const { incomeVsExpense, reportsLoading } = useFinance();

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
      maximumFractionDigits: 0
    }).format(val);
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="glass-panel p-4 rounded-xl border border-dark-border shadow-xl space-y-1.5">
          <p className="text-xs font-bold text-dark-text tracking-wide mb-1">{label}</p>
          <div className="flex items-center justify-between gap-6">
            <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded bg-emerald-400" />
              Ingresos:
            </span>
            <span className="text-sm font-extrabold text-emerald-400">
              {formatCurrency(payload[0].value)}
            </span>
          </div>
          <div className="flex items-center justify-between gap-6">
            <span className="text-xs font-semibold text-rose-400 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded bg-rose-400" />
              Egresos:
            </span>
            <span className="text-sm font-extrabold text-rose-400">
              {formatCurrency(payload[1].value)}
            </span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="h-[400px] flex flex-col justify-between" hoverEffect={true}>
      <div>
        <CardTitle className="flex items-center gap-2 mb-1">
          <BarChart3 className="w-5 h-5 text-indigo-400" />
          Ingresos vs Egresos
        </CardTitle>
        <p className="text-xs text-dark-muted">Historial comparativo de flujos financieros de los últimos meses.</p>
      </div>

      {reportsLoading ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : incomeVsExpense.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center p-6">
          <p className="text-sm text-dark-muted">Sin datos históricos suficientes</p>
          <p className="text-xs text-dark-muted/60 mt-1">Registra movimientos en meses distintos para ver la comparación histórica.</p>
        </div>
      ) : (
        <div className="flex-1 min-h-[260px] pt-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={incomeVsExpense}
              margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
            >
              {/* Degradados lineales SVG */}
              <defs>
                <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#059669" stopOpacity={0.1}/>
                </linearGradient>
                <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#e11d48" stopOpacity={0.1}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.2} vertical={false} />
              <XAxis 
                dataKey="name" 
                stroke="#64748b" 
                fontSize={10} 
                fontWeight={600}
                tickLine={false}
                axisLine={false}
              />
              <YAxis 
                stroke="#64748b" 
                fontSize={10} 
                fontWeight={600}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `$${value}`}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)', radius: 4 }} />
              <Bar 
                dataKey="income" 
                name="Ingresos"
                fill="url(#colorIncome)" 
                radius={[4, 4, 0, 0]} 
                maxBarSize={30}
              />
              <Bar 
                dataKey="expense" 
                name="Egresos"
                fill="url(#colorExpense)" 
                radius={[4, 4, 0, 0]} 
                maxBarSize={30}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Leyenda premium */}
      <div className="flex justify-center gap-6 pt-2 border-t border-dark-border/40 text-xs font-semibold text-dark-muted">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded bg-emerald-500" />
          <span>Ingresos</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded bg-rose-500" />
          <span>Egresos</span>
        </div>
      </div>
    </Card>
  );
};
export default IncomeExpenseBarChart;
