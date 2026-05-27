import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const FinanceContext = createContext();

export const FinanceProvider = ({ children }) => {
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [goals, setGoals] = useState([]);
  const [recurring, setRecurring] = useState([]);
  const [recurringLogs, setRecurringLogs] = useState([]);
  const [categoryExpenses, setCategoryExpenses] = useState([]);
  const [incomeVsExpense, setIncomeVsExpense] = useState([]);
  const [insights, setInsights] = useState([]);
  
  const [loading, setLoading] = useState(true);
  const [reportsLoading, setReportsLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Sistema de notificaciones en tiempo real
  const [notifications, setNotifications] = useState([]);

  const addNotification = (title, message, type = 'success') => {
    const id = Date.now();
    setNotifications((prev) => [...prev, { id, title, message, type }]);
    
    // Auto-eliminar después de 4 segundos
    setTimeout(() => {
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    }, 4000);
  };

  const removeNotification = (id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  // Cargar datos iniciales
  const loadInitialData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [txs, cats, gls, recs, logs, incExp, ins] = await Promise.all([
        api.getTransactions(),
        api.getCategories(),
        api.getGoals(),
        api.getRecurring(),
        api.getRecurringLogs(),
        api.getIncomeVsExpense(),
        api.getInsights()
      ]);
      
      setTransactions(txs);
      setCategories(cats);
      setGoals(gls);
      setRecurring(recs);
      setRecurringLogs(logs);
      setIncomeVsExpense(incExp);
      setInsights(ins);
      
      // Cargar gráfico de pastel de gastos para el mes actual por defecto
      const currentMonth = new Date().getMonth() + 1;
      const currentYear = new Date().getFullYear();
      const pieData = await api.getCategoryExpenses(currentMonth, currentYear);
      setCategoryExpenses(pieData);
      
    } catch (err) {
      console.error('Error cargando datos en FinanceContext:', err);
      setError('No se pudieron cargar los datos de la aplicación. Por favor, asegúrate de que el backend y la base de datos estén activos.');
      addNotification('Error de conexión', 'No se pudo conectar con el servidor backend.', 'danger');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInitialData();
  }, []);

  // Recargar reportes agregados
  const refreshReports = async () => {
    try {
      setReportsLoading(true);
      const currentMonth = new Date().getMonth() + 1;
      const currentYear = new Date().getFullYear();
      
      const [pieData, incExp, ins] = await Promise.all([
        api.getCategoryExpenses(currentMonth, currentYear),
        api.getIncomeVsExpense(),
        api.getInsights()
      ]);
      
      setCategoryExpenses(pieData);
      setIncomeVsExpense(incExp);
      setInsights(ins);
    } catch (err) {
      console.error('Error al actualizar reportes:', err);
    } finally {
      setReportsLoading(false);
    }
  };

  // 1. Acciones de Transacciones
  const addTransaction = async (txData) => {
    try {
      const newTx = await api.createTransaction(txData);
      setTransactions((prev) => [newTx, ...prev]);
      addNotification('Transacción registrada', `Se añadió "${newTx.description}" correctamente.`, 'success');
      refreshReports();
      return newTx;
    } catch (err) {
      addNotification('Error', 'No se pudo registrar la transacción.', 'danger');
      throw err;
    }
  };

  const deleteTransaction = async (id) => {
    try {
      await api.deleteTransaction(id);
      setTransactions((prev) => prev.filter((tx) => tx.id !== id));
      addNotification('Transacción eliminada', 'El registro de transacción fue eliminado.', 'info');
      refreshReports();
    } catch (err) {
      addNotification('Error', 'No se pudo eliminar la transacción.', 'danger');
      throw err;
    }
  };

  // 2. Acciones de Metas de Ahorro
  const addGoal = async (goalData) => {
    try {
      const newGoal = await api.createGoal(goalData);
      setGoals((prev) => [newGoal, ...prev]);
      addNotification('Meta de ahorro creada', `Has programado la meta "${newGoal.name}" con éxito.`, 'success');
      refreshReports();
      return newGoal;
    } catch (err) {
      addNotification('Error', 'No se pudo crear la meta de ahorro.', 'danger');
      throw err;
    }
  };

  const addGoalDeposit = async (id, amount) => {
    try {
      const updatedGoal = await api.addGoalDeposit(id, amount);
      setGoals((prev) => prev.map((g) => (g.id === parseInt(id) ? updatedGoal : g)));
      
      // Recargar transacciones completas ya que el depósito inserta un egreso contable en el backend
      const txs = await api.getTransactions();
      setTransactions(txs);
      
      addNotification('Depósito registrado', `¡Aporte de $${amount} añadido a tu meta!`, 'success');
      refreshReports();
      return updatedGoal;
    } catch (err) {
      addNotification('Error', 'No se pudo procesar el depósito en la meta.', 'danger');
      throw err;
    }
  };

  const deleteGoal = async (id) => {
    try {
      await api.deleteGoal(id);
      setGoals((prev) => prev.filter((g) => g.id !== id));
      addNotification('Meta eliminada', 'La meta de ahorro seleccionada fue borrada.', 'info');
      refreshReports();
    } catch (err) {
      addNotification('Error', 'No se pudo eliminar la meta de ahorro.', 'danger');
      throw err;
    }
  };

  // 3. Acciones de Transacciones Recurrentes
  const addRecurring = async (recData) => {
    try {
      const newRec = await api.createRecurring(recData);
      setRecurring((prev) => [...prev, newRec]);
      addNotification('Transacción recurrente programada', `"${newRec.description}" se ejecutará los días ${newRec.day_of_month}.`, 'success');
      refreshReports();
      return newRec;
    } catch (err) {
      addNotification('Error', 'No se pudo programar la transacción recurrente.', 'danger');
      throw err;
    }
  };

  const toggleRecurring = async (id, isActive) => {
    try {
      const updatedRec = await api.toggleRecurring(id, isActive);
      setRecurring((prev) => prev.map((r) => (r.id === id ? updatedRec : r)));
      addNotification(
        isActive ? 'Recurrente activado' : 'Recurrente pausado',
        `La transacción recurrente fue ${isActive ? 'activada' : 'desactivada'}.`,
        isActive ? 'success' : 'info'
      );
    } catch (err) {
      addNotification('Error', 'No se pudo actualizar la transacción programada.', 'danger');
      throw err;
    }
  };

  const deleteRecurring = async (id) => {
    try {
      await api.deleteRecurring(id);
      setRecurring((prev) => prev.filter((r) => r.id !== id));
      addNotification('Recurrente eliminado', 'La transacción recurrente programada fue eliminada.', 'info');
    } catch (err) {
      addNotification('Error', 'No se pudo eliminar la transacción recurrente.', 'danger');
      throw err;
    }
  };

  // Disparar procesamiento del cron manualmente
  const triggerCron = async (customDateStr) => {
    try {
      const result = await api.triggerCronManual(customDateStr);
      
      // Recargar logs y transacciones
      const [txs, logs] = await Promise.all([
        api.getTransactions(),
        api.getRecurringLogs()
      ]);
      setTransactions(txs);
      setRecurringLogs(logs);
      
      if (result.processed > 0) {
        addNotification(
          'Cron Job ejecutado',
          `Se procesaron e ingresaron ${result.processed} transacciones recurrentes correspondientes al día de hoy.`,
          'success'
        );
      } else {
        addNotification(
          'Cron Job verificado',
          'El cron revisó las plantillas y determinó que no hay transacciones pendientes para esta fecha.',
          'info'
        );
      }
      refreshReports();
      return result;
    } catch (err) {
      addNotification('Error de ejecución', 'No se pudo gatillar el cron job manualmente.', 'danger');
      throw err;
    }
  };

  // Calcular balances globales acumulados
  const getTotals = () => {
    let income = 0;
    let expense = 0;
    
    transactions.forEach((tx) => {
      const amt = parseFloat(tx.amount);
      if (tx.type === 'income') {
        income += amt;
      } else {
        expense += amt;
      }
    });
    
    return {
      income,
      expense,
      balance: income - expense
    };
  };

  return (
    <FinanceContext.Provider
      value={{
        transactions,
        categories,
        goals,
        recurring,
        recurringLogs,
        categoryExpenses,
        incomeVsExpense,
        insights,
        loading,
        reportsLoading,
        error,
        notifications,
        addNotification,
        removeNotification,
        addTransaction,
        deleteTransaction,
        addGoal,
        addGoalDeposit,
        deleteGoal,
        addRecurring,
        toggleRecurring,
        deleteRecurring,
        triggerCron,
        getTotals,
        reloadAllData: loadInitialData
      }}
    >
      {children}
    </FinanceContext.Provider>
  );
};

export const useFinance = () => {
  const context = useContext(FinanceContext);
  if (!context) {
    throw new Error('useFinance debe ser utilizado dentro de un FinanceProvider');
  }
  return context;
};
