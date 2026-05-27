import React, { useState } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { Card, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { CalendarClock } from 'lucide-react';

export const RecurringForm = () => {
  const { categories, addRecurring } = useFinance();
  
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState('expense');
  const [categoryId, setCategoryId] = useState('');
  const [dayOfMonth, setDayOfMonth] = useState('1');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!description || !amount || !dayOfMonth) return;

    try {
      setSubmitting(true);
      await addRecurring({
        description,
        amount: parseFloat(amount),
        type,
        category_id: categoryId ? parseInt(categoryId) : null,
        day_of_month: parseInt(dayOfMonth)
      });
      setDescription('');
      setAmount('');
      setCategoryId('');
      setDayOfMonth('1');
    } catch (error) {
      console.error(error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card className="h-fit">
      <CardTitle className="flex items-center gap-2">
        <CalendarClock className="w-5 h-5 text-indigo-400" />
        Programar Transacción Recurrente
      </CardTitle>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Descripción */}
        <div>
          <label className="block text-xs font-semibold text-dark-muted mb-1.5 uppercase tracking-wider">
            Concepto / Suscripción
          </label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Ej. Renta, Netflix, Gimnasio, Nómina"
            required
            className="w-full bg-slate-900 border border-dark-border focus:border-indigo-500 rounded-xl px-4 py-2.5 text-sm text-dark-text outline-none transition-all duration-200"
          />
        </div>

        {/* Monto */}
        <div>
          <label className="block text-xs font-semibold text-dark-muted mb-1.5 uppercase tracking-wider">
            Monto Fijo ($ MXN)
          </label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            required
            min="0.01"
            className="w-full bg-slate-900 border border-dark-border focus:border-indigo-500 rounded-xl px-4 py-2.5 text-sm text-dark-text outline-none transition-all duration-200"
          />
        </div>

        {/* Tipo de flujo */}
        <div>
          <label className="block text-xs font-semibold text-dark-muted mb-1.5 uppercase tracking-wider">
            Tipo de Flujo Recurrente
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setType('expense')}
              className={`py-2 px-3 text-xs font-bold rounded-lg border transition-all duration-200 ${type === 'expense' ? 'bg-rose-500/10 border-rose-500 text-rose-400 shadow-md shadow-rose-500/5' : 'bg-slate-900 border-dark-border text-dark-muted hover:border-slate-600'}`}
            >
              Gasto Fijo
            </button>
            <button
              type="button"
              onClick={() => setType('income')}
              className={`py-2 px-3 text-xs font-bold rounded-lg border transition-all duration-200 ${type === 'income' ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400 shadow-md shadow-emerald-500/5' : 'bg-slate-900 border-dark-border text-dark-muted hover:border-slate-600'}`}
            >
              Ingreso Fijo
            </button>
          </div>
        </div>

        {/* Categoría */}
        <div>
          <label className="block text-xs font-semibold text-dark-muted mb-1.5 uppercase tracking-wider">
            Categoría
          </label>
          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className="w-full bg-slate-900 border border-dark-border focus:border-indigo-500 rounded-xl px-4 py-2.5 text-sm text-dark-text outline-none transition-all duration-200 appearance-none"
          >
            <option value="">Selecciona una categoría</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        {/* Día del mes */}
        <div>
          <label className="block text-xs font-semibold text-dark-muted mb-1.5 uppercase tracking-wider">
            Día de Cobro/Depósito (Día del Mes)
          </label>
          <input
            type="number"
            min="1"
            max="31"
            value={dayOfMonth}
            onChange={(e) => setDayOfMonth(e.target.value)}
            required
            className="w-full bg-slate-900 border border-dark-border focus:border-indigo-500 rounded-xl px-4 py-2.5 text-sm text-dark-text outline-none transition-all duration-200"
          />
          <p className="text-[10px] text-dark-muted mt-1.5">
            Nota: Si seleccionas los días 29, 30 o 31, la transacción se procesará el último día del mes en meses más cortos.
          </p>
        </div>

        {/* Botón de Enviar */}
        <Button
          type="submit"
          variant={type === 'income' ? 'gradient-emerald' : 'gradient-indigo'}
          className="w-full mt-2"
          disabled={submitting}
        >
          {submitting ? 'Programando...' : 'Programar Recurrente'}
        </Button>
      </form>
    </Card>
  );
};
export default RecurringForm;
