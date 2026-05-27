import React from 'react';
import { useFinance } from '../../context/FinanceContext';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';
import { Card, CardTitle } from '../ui/Card';
import { PieChart as PieIcon } from 'lucide-react';

export const CategoryPieChart = () => {
  const { categoryExpenses, reportsLoading } = useFinance();

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(val);
  };

  // Calcular total de gastos representados en el gráfico de torta
  const totalExpenses = categoryExpenses.reduce((sum, item) => sum + item.amount, 0);

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const percentage = totalExpenses > 0 ? (data.amount / totalExpenses) * 100 : 0;
      return (
        <div className="glass-panel p-3 rounded-lg border border-dark-border shadow-xl">
          <p className="text-xs font-bold text-dark-text flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: data.color }} />
            {data.category}
          </p>
          <p className="text-sm font-extrabold text-indigo-400 mt-1">
            {formatCurrency(data.amount)}
          </p>
          <p className="text-[10px] text-dark-muted font-semibold mt-0.5">
            {percentage.toFixed(1)}% del gasto total
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="h-[400px] flex flex-col justify-between" hoverEffect={true}>
      <div>
        <CardTitle className="flex items-center gap-2 mb-1">
          <PieIcon className="w-5 h-5 text-indigo-400" />
          Gastos por Categoría
        </CardTitle>
        <p className="text-xs text-dark-muted">Distribución de egresos durante el mes en curso.</p>
      </div>

      {reportsLoading ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : categoryExpenses.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center p-6">
          <p className="text-sm text-dark-muted">Sin egresos este mes</p>
          <p className="text-xs text-dark-muted/60 mt-1">Registra gastos bajo alguna categoría para activar este reporte.</p>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center relative min-h-[220px]">
          {/* Valor de Total en el centro del Donut */}
          <div className="absolute flex flex-col items-center justify-center text-center pointer-events-none">
            <span className="text-[10px] font-semibold text-dark-muted uppercase tracking-wider">Total Gastado</span>
            <span className="text-lg font-extrabold text-dark-text mt-0.5">{formatCurrency(totalExpenses)}</span>
          </div>

          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie
                data={categoryExpenses}
                nameKey="category"
                dataKey="amount"
                innerRadius={65}
                outerRadius={85}
                paddingAngle={4}
                stroke="none"
              >
                {categoryExpenses.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color || '#6366f1'} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Lista/Leyenda elegante manual para diseño Premium */}
      <div className="grid grid-cols-3 gap-2 text-left pt-2 border-t border-dark-border/40">
        {categoryExpenses.slice(0, 3).map((item, idx) => {
          const pct = totalExpenses > 0 ? (item.amount / totalExpenses) * 100 : 0;
          return (
            <div key={idx} className="flex flex-col">
              <span className="text-[10px] font-semibold text-dark-text truncate flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                {item.category}
              </span>
              <span className="text-xs font-bold text-dark-muted pl-2.5 mt-0.5">
                {pct.toFixed(0)}%
              </span>
            </div>
          );
        })}
        {categoryExpenses.length > 3 && (
          <div className="col-span-3 text-center text-[10px] text-dark-muted mt-1 font-medium">
            + {categoryExpenses.length - 3} categorías adicionales
          </div>
        )}
      </div>
    </Card>
  );
};
export default CategoryPieChart;
