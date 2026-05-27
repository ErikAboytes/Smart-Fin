import React, { useState } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { Trash2, PiggyBank, Calendar, Coins, ArrowUpRight, Plus, Check, X } from 'lucide-react';
import { Card, CardTitle } from '../ui/Card';
import { ProgressBar } from '../ui/ProgressBar';

export const GoalList = () => {
  const { goals, addGoalDeposit, deleteGoal } = useFinance();
  
  // Guardar el estado de depósito activo por ID de meta
  const [activeDepositId, setActiveDepositId] = useState(null);
  const [depositAmount, setDepositAmount] = useState('');
  const [depositing, setDepositing] = useState(false);

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(val);
  };

  const getDaysRemaining = (deadlineDate) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const target = new Date(deadlineDate);
    target.setHours(0, 0, 0, 0);
    
    const diffTime = target.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return 'Vencida';
    if (diffDays === 0) return 'Hoy';
    return `${diffDays} días restantes`;
  };

  const handleDepositSubmit = async (goalId) => {
    if (!depositAmount || parseFloat(depositAmount) <= 0) return;
    
    try {
      setDepositing(true);
      await addGoalDeposit(goalId, parseFloat(depositAmount));
      setDepositAmount('');
      setActiveDepositId(null);
    } catch (error) {
      console.error(error);
    } finally {
      setDepositing(false);
    }
  };

  return (
    <Card className="flex flex-col min-h-[400px]">
      <CardTitle className="mb-2">Metas de Ahorro Activas</CardTitle>
      <p className="text-xs text-dark-muted mb-6">Monitorea el progreso de tus fondos financieros y añade aportaciones en tiempo real.</p>

      {goals.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center p-6 border border-dashed border-dark-border rounded-xl">
          <p className="text-sm text-dark-muted">No tienes metas de ahorro definidas.</p>
          <p className="text-xs text-dark-muted/60 mt-1">Completa el formulario de la izquierda para establecer tu primer objetivo.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 overflow-y-auto max-h-[500px] pr-1">
          {goals.map((goal) => {
            const isCompleted = parseFloat(goal.current_amount) >= parseFloat(goal.target_amount);
            const remaining = Math.max(0, parseFloat(goal.target_amount) - parseFloat(goal.current_amount));
            const progress = parseFloat(goal.progress_percentage || 0);

            return (
              <div
                key={goal.id}
                className="flex flex-col justify-between p-5 bg-slate-900/40 border border-dark-border/60 rounded-xl hover:border-indigo-500/20 hover:bg-slate-900/60 transition-all duration-200 group relative"
              >
                {/* Cabecera de la meta */}
                <div className="flex justify-between items-start gap-4">
                  <div className="flex items-center gap-2.5">
                    <div className={`p-2 rounded-lg ${isCompleted ? 'bg-emerald-500/10 text-emerald-400' : 'bg-indigo-500/10 text-indigo-400'}`}>
                      <PiggyBank className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-dark-text">{goal.name}</h4>
                      <span className="text-[10px] text-dark-muted flex items-center gap-1 mt-0.5">
                        <Calendar className="w-3 h-3" />
                        Límite: {new Date(goal.deadline).toLocaleDateString('es-MX', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                          timeZone: 'UTC'
                        })} ({getDaysRemaining(goal.deadline)})
                      </span>
                    </div>
                  </div>

                  {/* Borrar */}
                  <button
                    onClick={() => deleteGoal(goal.id)}
                    className="p-1.5 text-dark-muted hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-all duration-200 opacity-0 group-hover:opacity-100"
                    title="Eliminar meta"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Info Financiera */}
                <div className="grid grid-cols-2 gap-2 my-4 bg-slate-900/40 p-3 rounded-lg border border-dark-border/20">
                  <div>
                    <span className="block text-[9px] font-bold text-dark-muted uppercase tracking-wider">Acumulado</span>
                    <span className={`text-sm font-extrabold ${isCompleted ? 'text-emerald-400' : 'text-indigo-400'}`}>
                      {formatCurrency(goal.current_amount)}
                    </span>
                  </div>
                  <div>
                    <span className="block text-[9px] font-bold text-dark-muted uppercase tracking-wider">Objetivo</span>
                    <span className="text-sm font-extrabold text-dark-text">
                      {formatCurrency(goal.target_amount)}
                    </span>
                  </div>
                </div>

                {/* Barra de progreso */}
                <div className="mb-4">
                  <ProgressBar
                    value={progress}
                    color={isCompleted ? 'emerald' : 'indigo'}
                    showLabel={true}
                    glow={!isCompleted}
                  />
                  {!isCompleted && (
                    <span className="block text-[10px] text-dark-muted text-right mt-1 font-medium">
                      Faltan {formatCurrency(remaining)} para cumplir la meta
                    </span>
                  )}
                  {isCompleted && (
                    <span className="block text-[10px] text-emerald-400 text-right mt-1 font-bold">
                      ¡Felicidades! Meta alcanzada 🎉
                    </span>
                  )}
                </div>

                {/* Controles de Depósito / Aportación */}
                <div className="pt-2 border-t border-dark-border/40 flex justify-end">
                  {activeDepositId === goal.id ? (
                    <div className="flex items-center gap-2 w-full animate-fade-in">
                      <div className="relative flex-1">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-dark-muted">$</span>
                        <input
                          type="number"
                          value={depositAmount}
                          onChange={(e) => setDepositAmount(e.target.value)}
                          placeholder="Monto"
                          required
                          min="0.01"
                          disabled={depositing}
                          className="w-full bg-slate-900 border border-dark-border focus:border-indigo-500 rounded-lg pl-6 pr-2 py-1.5 text-xs text-dark-text outline-none"
                        />
                      </div>
                      <button
                        onClick={() => handleDepositSubmit(goal.id)}
                        disabled={depositing}
                        className="p-2 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/30 rounded-lg transition-all duration-200"
                        title="Confirmar aporte"
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          setActiveDepositId(null);
                          setDepositAmount('');
                        }}
                        disabled={depositing}
                        className="p-2 bg-slate-800 hover:bg-slate-700 text-dark-muted border border-dark-border rounded-lg transition-all duration-200"
                        title="Cancelar"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    !isCompleted && (
                      <button
                        onClick={() => setActiveDepositId(goal.id)}
                        className="flex items-center gap-1.5 text-xs font-bold text-indigo-400 bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/20 px-3 py-1.5 rounded-lg transition-all duration-200"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        Hacer Aporte
                      </button>
                    )
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
};
export default GoalList;
