import React, { useState } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { Card, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { Target } from 'lucide-react';

export const GoalForm = () => {
  const { addGoal } = useFinance();
  const [name, setName] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [deadline, setDeadline] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !targetAmount || !deadline) return;

    try {
      setSubmitting(true);
      await addGoal({
        name,
        target_amount: parseFloat(targetAmount),
        deadline
      });
      setName('');
      setTargetAmount('');
      setDeadline('');
    } catch (error) {
      console.error(error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card className="h-fit">
      <CardTitle className="flex items-center gap-2">
        <Target className="w-5 h-5 text-indigo-400" />
        Definir Meta de Ahorro
      </CardTitle>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Nombre de la meta */}
        <div>
          <label className="block text-xs font-semibold text-dark-muted mb-1.5 uppercase tracking-wider">
            Nombre de la Meta
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ej. Fondo de Emergencia, Vacaciones, Auto"
            required
            className="w-full bg-slate-900 border border-dark-border focus:border-indigo-500 rounded-xl px-4 py-2.5 text-sm text-dark-text outline-none transition-all duration-200"
          />
        </div>

        {/* Monto Objetivo */}
        <div>
          <label className="block text-xs font-semibold text-dark-muted mb-1.5 uppercase tracking-wider">
            Monto Objetivo ($ MXN)
          </label>
          <input
            type="number"
            value={targetAmount}
            onChange={(e) => setTargetAmount(e.target.value)}
            placeholder="Ej. 10000.00"
            required
            min="0.01"
            className="w-full bg-slate-900 border border-dark-border focus:border-indigo-500 rounded-xl px-4 py-2.5 text-sm text-dark-text outline-none transition-all duration-200"
          />
        </div>

        {/* Fecha Límite */}
        <div>
          <label className="block text-xs font-semibold text-dark-muted mb-1.5 uppercase tracking-wider">
            Fecha Límite
          </label>
          <input
            type="date"
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
            required
            min={new Date().toISOString().split('T')[0]}
            className="w-full bg-slate-900 border border-dark-border focus:border-indigo-500 rounded-xl px-4 py-2.5 text-sm text-dark-text outline-none transition-all duration-200"
          />
        </div>

        {/* Botón de Enviar */}
        <Button
          type="submit"
          variant="gradient-indigo"
          className="w-full mt-2"
          disabled={submitting}
        >
          {submitting ? 'Creando...' : 'Programar Meta'}
        </Button>
      </form>
    </Card>
  );
};
export default GoalForm;
