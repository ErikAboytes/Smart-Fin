import React, { useState } from 'react';
import { FinanceProvider, useFinance } from './context/FinanceContext';
import {
  LayoutDashboard,
  BarChart3,
  Target,
  CalendarClock,
  Menu,
  X,
  XCircle,
  CheckCircle2,
  Info,
  AlertOctagon,
  Sparkles
} from 'lucide-react';

import SummaryCards from './components/Dashboard/SummaryCards';
import TransactionList from './components/Dashboard/TransactionList';
import CategoryPieChart from './components/Reports/CategoryPieChart';
import IncomeExpenseBarChart from './components/Reports/IncomeExpenseBarChart';
import PatternInsights from './components/Reports/PatternInsights';
import GoalForm from './components/Goals/GoalForm';
import GoalList from './components/Goals/GoalList';
import RecurringForm from './components/Recurring/RecurringForm';
import RecurringList from './components/Recurring/RecurringList';

const NotificationStack = () => {
  const { notifications, removeNotification } = useFinance();

  const getIcon = (type) => {
    switch (type) {
      case 'success':
        return <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />;
      case 'danger':
        return <AlertOctagon className="w-5 h-5 text-rose-400 shrink-0" />;
      case 'info':
      default:
        return <Info className="w-5 h-5 text-sky-400 shrink-0" />;
    }
  };

  const getBgClass = (type) => {
    switch (type) {
      case 'success':
        return 'border-emerald-500/20 bg-slate-900/90 text-slate-100 shadow-emerald-500/5';
      case 'danger':
        return 'border-rose-500/20 bg-slate-900/90 text-slate-100 shadow-rose-500/5';
      case 'info':
      default:
        return 'border-sky-500/20 bg-slate-900/90 text-slate-100 shadow-sky-500/5';
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 max-w-sm w-full pointer-events-none">
      {notifications.map((n) => (
        <div
          key={n.id}
          className={`flex items-start gap-3 p-4 rounded-xl border shadow-xl pointer-events-auto animate-slide-up ${getBgClass(n.type)}`}
        >
          {getIcon(n.type)}
          <div className="flex-1">
            <h5 className="text-xs font-bold text-dark-text">{n.title}</h5>
            <p className="text-[11px] text-dark-muted mt-0.5 leading-relaxed">{n.message}</p>
          </div>
          <button
            onClick={() => removeNotification(n.id)}
            className="text-dark-muted hover:text-dark-text p-0.5"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
};

const DashboardTab = () => (
  <div className="space-y-6">
    <SummaryCards />
    <TransactionList />
  </div>
);

const ReportsTab = () => (
  <div className="space-y-6">
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-slide-up">
      <CategoryPieChart />
      <IncomeExpenseBarChart />
    </div>
    <div className="animate-slide-up">
      <PatternInsights />
    </div>
  </div>
);

const GoalsTab = () => (
  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-slide-up">
    <div className="lg:col-span-1">
      <GoalForm />
    </div>
    <div className="lg:col-span-2">
      <GoalList />
    </div>
  </div>
);

const RecurringTab = () => (
  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-slide-up">
    <div className="lg:col-span-1">
      <RecurringForm />
    </div>
    <div className="lg:col-span-2">
      <RecurringList />
    </div>
  </div>
);

const MainLayout = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { loading, error } = useFinance();

  const menuItems = [
    { id: 'dashboard', label: 'Panel de Control', icon: LayoutDashboard },
    { id: 'reports', label: 'Reportes y Gráficos', icon: BarChart3 },
    { id: 'goals', label: 'Metas de Ahorro', icon: Target },
    { id: 'recurring', label: 'Pagos Recurrentes', icon: CalendarClock },
  ];

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'reports':
        return <ReportsTab />;
      case 'goals':
        return <GoalsTab />;
      case 'recurring':
        return <RecurringTab />;
      case 'dashboard':
      default:
        return <DashboardTab />;
    }
  };

  return (
    <div className="flex min-h-screen bg-transparent relative overflow-hidden">
      {/* 1. SIDEBAR DE NAVEGACIÓN (Desktop) */}
      <aside className={`fixed inset-y-0 left-0 z-40 w-64 glass-panel border-r border-dark-border/40 transform transition-transform duration-300 md:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} flex flex-col justify-between`}>
        <div className="flex-1 py-6 px-4 space-y-8">
          {/* Logo */}
          <div className="flex items-center justify-between px-3">
            <div className="flex items-center gap-2">
              <span className="text-2xl">💎</span>
              <span className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-indigo-400 via-violet-400 to-emerald-400 bg-clip-text text-transparent font-sans">
                Smart Fin
              </span>
            </div>
            {/* Botón cerrar móvil */}
            <button
              onClick={() => setSidebarOpen(false)}
              className="md:hidden text-dark-muted hover:text-dark-text p-1 hover:bg-slate-800 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Menú de Opciones */}
          <nav className="space-y-1.5">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setSidebarOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold tracking-wide transition-all duration-200 ${isActive ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/10' : 'text-dark-muted hover:text-dark-text hover:bg-slate-800/60'}`}
                >
                  <Icon className="w-5 h-5 shrink-0" />
                  {item.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Footer Sidebar */}
        <div className="p-4 border-t border-dark-border/40 text-center">
          <p className="text-[10px] text-dark-muted/80 font-medium">Smart Fin v1.0.0 • Premium Edition</p>
        </div>
      </aside>

      {/* Backdrop Móvil */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-30 bg-slate-950/60 backdrop-blur-sm md:hidden"
        />
      )}

      {/* 2. ÁREA DE CONTENIDO PRINCIPAL */}
      <div className="flex-1 md:pl-64 flex flex-col min-h-screen">
        {/* Encabezado Superior (Header) */}
        <header className="sticky top-0 z-20 glass-panel border-b border-dark-border/30 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* Botón menú móvil */}
            <button
              onClick={() => setSidebarOpen(true)}
              className="md:hidden text-dark-muted hover:text-dark-text p-2 hover:bg-slate-800 rounded-xl"
            >
              <Menu className="w-6 h-6" />
            </button>
            
            <div>
              <h1 className="text-lg font-bold text-dark-text uppercase tracking-wider flex items-center gap-2">
                {menuItems.find((m) => m.id === activeTab)?.label}
              </h1>
              <p className="text-xs text-dark-muted hidden sm:block">Control contable inteligente y automatizado.</p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 bg-slate-900/60 border border-dark-border/40 px-3 py-1.5 rounded-xl">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-[10px] font-bold text-emerald-400 tracking-wider">LIVE DATA</span>
          </div>
        </header>

        {/* Contenido de la Vista */}
        <main className="flex-1 p-6 space-y-6 overflow-x-hidden">
          {loading ? (
            <div className="h-[calc(100vh-180px)] flex flex-col items-center justify-center space-y-3">
              <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
              <p className="text-xs text-dark-muted font-semibold tracking-widest animate-pulse">CARGANDO MÓDULOS DE SMART FIN...</p>
            </div>
          ) : error ? (
            <div className="h-[calc(100vh-180px)] flex flex-col items-center justify-center p-6 text-center max-w-md mx-auto space-y-4">
              <div className="p-4 bg-rose-500/10 text-rose-400 rounded-full border border-rose-500/20 shadow-inner">
                <AlertOctagon className="w-10 h-10" />
              </div>
              <h3 className="text-base font-extrabold tracking-wide uppercase text-rose-400">Error de Inicialización</h3>
              <p className="text-xs text-dark-muted leading-relaxed">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-slate-800 border border-dark-border hover:border-slate-500 text-xs font-bold rounded-xl transition-all"
              >
                Reintentar Conexión
              </button>
            </div>
          ) : (
            renderActiveTab()
          )}
        </main>
      </div>

      {/* Notificaciones */}
      <NotificationStack />
    </div>
  );
};

export default function App() {
  return (
    <FinanceProvider>
      <MainLayout />
    </FinanceProvider>
  );
}
