import React, { useState } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { Trash2, Play, ToggleLeft, ToggleRight, ShieldAlert, History, Calendar, CheckCircle2, XCircle, Settings } from 'lucide-react';
import { Card, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';

export const RecurringList = () => {
  const { recurring, recurringLogs, toggleRecurring, deleteRecurring, triggerCron } = useFinance();
  const [triggering, setTriggering] = useState(false);
  const [testDate, setTestDate] = useState(new Date().toISOString().split('T')[0]);

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(val);
  };

  const handleToggle = async (id, currentStatus) => {
    try {
      await toggleRecurring(id, !currentStatus);
    } catch (error) {
      console.error(error);
    }
  };

  const handleManualTrigger = async () => {
    try {
      setTriggering(true);
      await triggerCron(testDate);
    } catch (error) {
      console.error(error);
    } finally {
      setTriggering(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* SECCIÓN A: WIDGET DE PRUEBAS PARA DESARROLLADOR / ADMINISTRADOR */}
      <Card className="border-indigo-500/30 bg-gradient-to-r from-slate-900/60 to-indigo-950/20" glass={true}>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-indigo-500/10 rounded-xl text-indigo-400 border border-indigo-500/20 shadow-inner">
              <Settings className="w-6 h-6 animate-spin-slow" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-dark-text tracking-wide flex items-center gap-1.5">
                Panel de Verificación Técnica (Cron Simulator)
              </h4>
              <p className="text-[11px] text-dark-muted mt-0.5 max-w-xl leading-relaxed">
                Usa este widget para simular el paso del tiempo y forzar la ejecución del <strong>Cron Job</strong> de Node-Cron inmediatamente.
                Ingresa una fecha y presiona "Simular Ejecución" para registrar de inmediato las transacciones recurrentes programadas.
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2.5 shrink-0 bg-slate-950/40 p-2 border border-dark-border/40 rounded-xl w-full md:w-auto">
            <input
              type="date"
              value={testDate}
              onChange={(e) => setTestDate(e.target.value)}
              className="bg-slate-900 border border-dark-border focus:border-indigo-500 rounded-lg px-2.5 py-1.5 text-xs text-dark-text outline-none"
            />
            <Button
              onClick={handleManualTrigger}
              disabled={triggering}
              variant="gradient-indigo"
              size="sm"
              className="flex items-center gap-1.5 px-3"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              {triggering ? 'Ejecutando...' : 'Simular'}
            </Button>
          </div>
        </div>
      </Card>

      {/* SECCIÓN B: LISTADO DE PLANTILLAS Y LOGS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LISTADO DE PLANTILLAS PROGRAMADAS */}
        <Card className="lg:col-span-2 flex flex-col min-h-[400px]">
          <CardTitle className="mb-2">Transacciones Programadas</CardTitle>
          <p className="text-xs text-dark-muted mb-6">Plantillas base activas para transacciones periódicas de débito o crédito automático.</p>

          {recurring.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-6 border border-dashed border-dark-border rounded-xl">
              <p className="text-sm text-dark-muted">No tienes transacciones recurrentes programadas.</p>
              <p className="text-xs text-dark-muted/60 mt-1">Completa el formulario de la izquierda para ingresar tu primera plantilla.</p>
            </div>
          ) : (
            <div className="flex-1 space-y-3 overflow-y-auto max-h-[400px] pr-1">
              {recurring.map((rec) => (
                <div
                  key={rec.id}
                  className={`flex items-center justify-between p-4 rounded-xl border transition-all duration-200 group ${rec.is_active ? 'bg-slate-900/40 border-dark-border/60 hover:border-indigo-500/20' : 'bg-slate-950/20 border-dark-border/20 opacity-70'}`}
                >
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => handleToggle(rec.id, rec.is_active)}
                      className="p-1 hover:bg-slate-800 rounded-lg text-dark-muted hover:text-dark-text transition-all duration-200"
                      title={rec.is_active ? 'Pausar plantilla' : 'Activar plantilla'}
                    >
                      {rec.is_active ? (
                        <ToggleRight className="w-8 h-8 text-indigo-400" />
                      ) : (
                        <ToggleLeft className="w-8 h-8 text-dark-muted" />
                      )}
                    </button>
                    <div>
                      <h4 className="text-sm font-semibold text-dark-text">{rec.description}</h4>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] bg-slate-800 text-dark-muted px-2 py-0.5 rounded font-medium">
                          {rec.category_name || 'Otros'}
                        </span>
                        <span className="text-[10px] text-indigo-400 font-semibold flex items-center gap-0.5">
                          <Calendar className="w-3 h-3" />
                          Día {rec.day_of_month} del mes
                        </span>
                        {rec.last_processed_date && (
                          <span className="text-[9px] text-dark-muted">
                            (Último cobro: {new Date(rec.last_processed_date).toLocaleDateString('es-MX', {
                              day: 'numeric',
                              month: 'short',
                              timeZone: 'UTC'
                            })})
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <span className={`text-sm font-extrabold ${rec.type === 'income' ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {rec.type === 'income' ? '+' : '-'} {formatCurrency(rec.amount)}
                    </span>
                    <button
                      onClick={() => deleteRecurring(rec.id)}
                      className="p-2 text-dark-muted hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-all duration-200 opacity-0 group-hover:opacity-100"
                      title="Eliminar plantilla"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* LOGS DE EJECUCIONES HISTÓRICAS */}
        <Card className="lg:col-span-1 flex flex-col h-[400px] lg:h-auto">
          <CardTitle className="flex items-center gap-2 mb-2">
            <History className="w-5 h-5 text-indigo-400" />
            Historial de Ejecución (Logs)
          </CardTitle>
          <p className="text-xs text-dark-muted mb-4">Registro técnico del procesamiento diario de los Cron Jobs.</p>

          {recurringLogs.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-6 border border-dashed border-dark-border rounded-xl">
              <p className="text-xs text-dark-muted">No se registran logs históricos aún.</p>
              <p className="text-[10px] text-dark-muted/60 mt-1">El cron registrará entradas automáticamente cuando procese cobros.</p>
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto pr-1 space-y-3 max-h-[300px]">
              {recurringLogs.map((log) => (
                <div
                  key={log.id}
                  className="p-3 bg-slate-900/60 border border-dark-border/40 rounded-xl space-y-1.5 text-left"
                >
                  <div className="flex justify-between items-start">
                    <span className="text-[10px] font-bold text-dark-text truncate max-w-[120px]">
                      {log.recurring_description}
                    </span>
                    <span className="text-[9px] text-dark-muted shrink-0">
                      {new Date(log.created_at).toLocaleTimeString('es-MX', {
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit'
                      })}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center text-[10px] text-dark-muted">
                    <span>
                      Fecha cobro: {new Date(log.processed_date).toLocaleDateString('es-MX', {
                        day: 'numeric',
                        month: 'short',
                        timeZone: 'UTC'
                      })}
                    </span>
                    
                    <span className="flex items-center gap-1">
                      {log.status === 'success' ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                          <span className="text-emerald-400 font-bold">ÉXITO</span>
                        </>
                      ) : (
                        <>
                          <XCircle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                          <span className="text-rose-400 font-bold">FALLA</span>
                        </>
                      )}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};
export default RecurringList;
