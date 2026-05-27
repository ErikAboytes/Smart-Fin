import React, { useState } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { PlusCircle, Trash2, Home, Utensils, Car, Zap, Tv, Gamepad2, Briefcase, TrendingUp, HeartPulse, GraduationCap, HelpCircle } from 'lucide-react';
import { Card, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';

// Mapeo dinámico de strings de íconos a componentes Lucide
const iconMap = {
  Home,
  Utensils,
  Car,
  Zap,
  Tv,
  Gamepad2,
  Briefcase,
  TrendingUp,
  HeartPulse,
  GraduationCap,
  HelpCircle
};

export const TransactionList = () => {
  const { transactions, categories, addTransaction, deleteTransaction } = useFinance();
  
  // Estado del formulario
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState('expense');
  const [categoryId, setCategoryId] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!description || !amount) return;

    try {
      setSubmitting(true);
      await addTransaction({
        description,
        amount: parseFloat(amount),
        type,
        category_id: categoryId ? parseInt(categoryId) : null,
        date: date || null
      });
      // Limpiar formulario
      setDescription('');
      setAmount('');
      setCategoryId('');
    } catch (error) {
      console.error(error);
    } finally {
      setSubmitting(false);
    }
  };

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(val);
  };

  const getIcon = (iconName) => {
    const IconComponent = iconMap[iconName] || HelpCircle;
    return <IconComponent className="w-4 h-4" />;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-slide-up">
      {/* SECCIÓN 1: FORMULARIO DE NUEVA TRANSACCIÓN */}
      <Card className="lg:col-span-1 h-fit">
        <CardTitle className="flex items-center gap-2">
          <PlusCircle className="w-5 h-5 text-indigo-400" />
          Registrar Transacción
        </CardTitle>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Descripción */}
          <div>
            <label className="block text-xs font-semibold text-dark-muted mb-1.5 uppercase tracking-wider">
              Concepto / Descripción
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Ej. Súper semanal, Sueldo, Gasolina"
              required
              className="w-full bg-slate-900 border border-dark-border focus:border-indigo-500 rounded-xl px-4 py-2.5 text-sm text-dark-text outline-none transition-all duration-200"
            />
          </div>

          {/* Monto */}
          <div>
            <label className="block text-xs font-semibold text-dark-muted mb-1.5 uppercase tracking-wider">
              Monto ($ MXN)
            </label>
            <input
              type="number"
              step="0.01"
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
              Tipo de Flujo
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setType('expense')}
                className={`py-2 px-3 text-xs font-bold rounded-lg border transition-all duration-200 ${type === 'expense' ? 'bg-rose-500/10 border-rose-500 text-rose-400 shadow-md shadow-rose-500/5' : 'bg-slate-900 border-dark-border text-dark-muted hover:border-slate-600'}`}
              >
                Egreso / Gasto
              </button>
              <button
                type="button"
                onClick={() => setType('income')}
                className={`py-2 px-3 text-xs font-bold rounded-lg border transition-all duration-200 ${type === 'income' ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400 shadow-md shadow-emerald-500/5' : 'bg-slate-900 border-dark-border text-dark-muted hover:border-slate-600'}`}
              >
                Ingreso
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

          {/* Fecha */}
          <div>
            <label className="block text-xs font-semibold text-dark-muted mb-1.5 uppercase tracking-wider">
              Fecha
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
              className="w-full bg-slate-900 border border-dark-border focus:border-indigo-500 rounded-xl px-4 py-2.5 text-sm text-dark-text outline-none transition-all duration-200"
            />
          </div>

          {/* Botón de Enviar */}
          <Button
            type="submit"
            variant={type === 'income' ? 'gradient-emerald' : 'gradient-indigo'}
            className="w-full mt-2"
            disabled={submitting}
          >
            {submitting ? 'Registrando...' : 'Añadir Transacción'}
          </Button>
        </form>
      </Card>

      {/* SECCIÓN 2: HISTORIAL DE TRANSACCIONES */}
      <Card className="lg:col-span-2 flex flex-col h-[525px]">
        <CardTitle className="mb-2">Historial de Transacciones</CardTitle>
        <p className="text-xs text-dark-muted mb-4">Registro completo de tus movimientos de ingresos y egresos recientes.</p>

        {transactions.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-6 border border-dashed border-dark-border rounded-xl">
            <p className="text-sm text-dark-muted">No has registrado transacciones aún.</p>
            <p className="text-xs text-dark-muted/60 mt-1">Completa el formulario de la izquierda para ingresar tu primer movimiento.</p>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto pr-1 space-y-3">
            {transactions.map((tx) => (
              <div
                key={tx.id}
                className="flex items-center justify-between p-4 bg-slate-900/40 border border-dark-border/60 rounded-xl hover:border-indigo-500/20 hover:bg-slate-900/60 transition-all duration-200 group"
              >
                <div className="flex items-center gap-3">
                  {/* Icono de Categoría */}
                  <div
                    className="p-2.5 rounded-lg text-white"
                    style={{ backgroundColor: `${tx.category_color || '#475569'}20`, color: tx.category_color || '#94a3b8' }}
                  >
                    {getIcon(tx.category_icon)}
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-dark-text">{tx.description}</h4>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] bg-slate-800 text-dark-muted px-2 py-0.5 rounded font-medium">
                        {tx.category_name || 'Sin categoría'}
                      </span>
                      <span className="text-[10px] text-dark-muted">
                        {new Date(tx.date).toLocaleDateString('es-MX', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                          timeZone: 'UTC'
                        })}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <span className={`text-sm font-bold ${tx.type === 'income' ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {tx.type === 'income' ? '+' : '-'} {formatCurrency(tx.amount)}
                  </span>
                  
                  {/* Botón de Borrado */}
                  <button
                    onClick={() => deleteTransaction(tx.id)}
                    className="p-2 text-dark-muted hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-all duration-200 opacity-0 group-hover:opacity-100"
                    title="Eliminar transacción"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};
export default TransactionList;
