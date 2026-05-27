const API_BASE_URL = 'http://localhost:5000/api';

const handleResponse = async (response) => {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
  }
  return response.json();
};

export const api = {
  // Transacciones
  getTransactions: async () => {
    const res = await fetch(`${API_BASE_URL}/transactions`);
    return handleResponse(res);
  },
  
  createTransaction: async (data) => {
    const res = await fetch(`${API_BASE_URL}/transactions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },
  
  deleteTransaction: async (id) => {
    const res = await fetch(`${API_BASE_URL}/transactions/${id}`, {
      method: 'DELETE',
    });
    return handleResponse(res);
  },
  
  getCategories: async () => {
    const res = await fetch(`${API_BASE_URL}/transactions/categories`);
    return handleResponse(res);
  },

  // Metas de Ahorro
  getGoals: async () => {
    const res = await fetch(`${API_BASE_URL}/goals`);
    return handleResponse(res);
  },
  
  createGoal: async (data) => {
    const res = await fetch(`${API_BASE_URL}/goals`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },
  
  addGoalDeposit: async (id, amount) => {
    const res = await fetch(`${API_BASE_URL}/goals/${id}/deposits`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount }),
    });
    return handleResponse(res);
  },
  
  deleteGoal: async (id) => {
    const res = await fetch(`${API_BASE_URL}/goals/${id}`, {
      method: 'DELETE',
    });
    return handleResponse(res);
  },

  // Transacciones Recurrentes
  getRecurring: async () => {
    const res = await fetch(`${API_BASE_URL}/recurring`);
    return handleResponse(res);
  },
  
  createRecurring: async (data) => {
    const res = await fetch(`${API_BASE_URL}/recurring`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },
  
  toggleRecurring: async (id, isActive) => {
    const res = await fetch(`${API_BASE_URL}/recurring/${id}/toggle`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_active: isActive }),
    });
    return handleResponse(res);
  },
  
  deleteRecurring: async (id) => {
    const res = await fetch(`${API_BASE_URL}/recurring/${id}`, {
      method: 'DELETE',
    });
    return handleResponse(res);
  },
  
  getRecurringLogs: async () => {
    const res = await fetch(`${API_BASE_URL}/recurring/logs`);
    return handleResponse(res);
  },
  
  triggerCronManual: async (dateStr) => {
    const res = await fetch(`${API_BASE_URL}/recurring/trigger-cron`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ date: dateStr }),
    });
    return handleResponse(res);
  },

  // Reportes
  getCategoryExpenses: async (month, year) => {
    let url = `${API_BASE_URL}/reports/category-expenses`;
    if (month && year) url += `?month=${month}&year=${year}`;
    const res = await fetch(url);
    return handleResponse(res);
  },
  
  getIncomeVsExpense: async () => {
    const res = await fetch(`${API_BASE_URL}/reports/income-vs-expense`);
    return handleResponse(res);
  },
  
  getInsights: async () => {
    const res = await fetch(`${API_BASE_URL}/reports/insights`);
    return handleResponse(res);
  }
};
export default api;
