import React from 'react';
import { useFinance } from '../../context/FinanceContext';
import { TrendingUp, TrendingDown, Wallet } from 'lucide-react';
import { Card } from '../ui/Card';

export const SummaryCards = () => {
  const { getTotals } = useFinance();
  const { income, expense, balance } = getTotals();

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(val);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-slide-up">
      {/* CARD 1: BALANCE GENERAL */}
      <Card
        glass={true}
        hoverEffect={true}
        className="relative overflow-hidden group border-indigo-500/20"
      >
        <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/10 rounded-full blur-2xl group-hover:bg-indigo-500/20 transition-all duration-300" />
        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm font-semibold text-dark-muted mb-1">Balance Disponible</p>
            <h2 className={`text-3xl font-extrabold tracking-tight ${balance >= 0 ? 'text-indigo-400' : 'text-rose-400'}`}>
              {formatCurrency(balance)}
            </h2>
            <p className="text-xs text-dark-muted mt-2">Saldo neto en cuenta</p>
          </div>
          <div className="p-3 bg-indigo-500/10 rounded-xl text-indigo-400">
            <Wallet className="w-6 h-6" />
          </div>
        </div>
      </Card>

      {/* CARD 2: TOTAL INGRESOS */}
      <Card
        hoverEffect={true}
        className="relative overflow-hidden group border-emerald-500/10"
      >
        <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl group-hover:bg-emerald-500/15 transition-all duration-300" />
        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm font-semibold text-dark-muted mb-1">Total Ingresos</p>
            <h2 className="text-3xl font-extrabold tracking-tight text-emerald-400">
              {formatCurrency(income)}
            </h2>
            <p className="text-xs text-emerald-500/80 font-medium flex items-center gap-1 mt-2">
              <TrendingUp className="w-3.5 h-3.5" /> Flujo entrante general
            </p>
          </div>
          <div className="p-3 bg-emerald-500/10 rounded-xl text-emerald-400">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>
      </Card>

      {/* CARD 3: TOTAL EGRESOS */}
      <Card
        hoverEffect={true}
        className="relative overflow-hidden group border-rose-500/10"
      >
        <div className="absolute top-0 right-0 w-24 h-24 bg-rose-500/5 rounded-full blur-2xl group-hover:bg-rose-500/15 transition-all duration-300" />
        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm font-semibold text-dark-muted mb-1">Total Egresos</p>
            <h2 className="text-3xl font-extrabold tracking-tight text-rose-400">
              {formatCurrency(expense)}
            </h2>
            <p className="text-xs text-rose-500/80 font-medium flex items-center gap-1 mt-2">
              <TrendingDown className="w-3.5 h-3.5" /> Flujo saliente general
            </p>
          </div>
          <div className="p-3 bg-rose-500/10 rounded-xl text-rose-400">
            <TrendingDown className="w-6 h-6" />
          </div>
        </div>
      </Card>
    </div>
  );
};
export default SummaryCards;
