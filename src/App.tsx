import { useState, useEffect, useMemo } from 'react';
import type { SmartTag } from './types/smartTag';
import { getInitialSmartTags } from './data/initialTags';
import { calculateTagKinetics, createThermalLog } from './services/kineticModel';
import { Header } from './components/Header';
import { SmartTagCard } from './components/SmartTagCard';
import { ThermalSandboxModal } from './components/ThermalSandboxModal';
import { NewTagModal } from './components/NewTagModal';
import {
  ArrowUpDown,
  Radio,
  CheckCircle2,
  AlertTriangle,
  AlertOctagon,
} from 'lucide-react';

const STORAGE_KEY = 'smart_tags_fridge_state_v1';

export function App() {
  // Load tags from localStorage or use rich initial demo tags
  const [tags, setTags] = useState<SmartTag[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn('Error reading from localStorage:', e);
    }
    return getInitialSmartTags();
  });

  // Save tags on change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(tags));
    } catch (e) {
      console.warn('Error saving to localStorage:', e);
    }
  }, [tags]);

  // Live Time Simulation State
  const [isSimRunning, setIsSimRunning] = useState<boolean>(true);
  const [simSpeed, setSimSpeed] = useState<number>(180); // 180x: 1s real = 3m de refrigerador (0.05h/s)

  // Live simulation tick effect: advances real time continuously
  useEffect(() => {
    if (!isSimRunning || simSpeed <= 0) return;

    const interval = setInterval(() => {
      const deltaHours = simSpeed / 3600;

      setTags((prevTags) =>
        prevTags.map((tag) => {
          if (tag.logs.length === 0) {
            const initialLog = createThermalLog(
              deltaHours,
              4.0,
              'Refrigeración continua activa (4.0 °C)',
              tag.profile,
              []
            );
            return { ...tag, logs: [initialLog] };
          }

          const logs = [...tag.logs];
          const lastIdx = logs.length - 1;
          const currentLog = { ...logs[lastIdx] };
          currentLog.duration_hours = Number(
            (currentLog.duration_hours + deltaHours).toFixed(4)
          );
          logs[lastIdx] = currentLog;

          return {
            ...tag,
            logs,
          };
        })
      );
    }, 1000);

    return () => clearInterval(interval);
  }, [isSimRunning, simSpeed]);

  // Modals state
  const [isNewTagModalOpen, setIsNewTagModalOpen] = useState<boolean>(false);
  const [selectedTag, setSelectedTag] = useState<SmartTag | null>(null);

  // Quick notification banner state
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // Filter & Sorting state
  const [filterStatus, setFilterStatus] = useState<'all' | 'danger' | 'warning' | 'safe'>('all');
  const [sortBy, setSortBy] = useState<'urgency' | 'name' | 'newest'>('urgency');

  // Compute calculated metrics for all tags
  const tagsWithKinetics = useMemo(() => {
    return tags.map((tag) => {
      const kinetics = calculateTagKinetics(tag.profile, tag.logs);
      return {
        tag,
        kinetics,
      };
    });
  }, [tags]);

  // Counts for filters and alerts
  const metrics = useMemo(() => {
    let criticalCount = 0;
    let warningCount = 0;
    let safeCount = 0;

    tagsWithKinetics.forEach(({ kinetics }) => {
      if (kinetics.status === 'danger' || kinetics.status === 'expired') {
        criticalCount++;
      } else if (kinetics.status === 'warning') {
        warningCount++;
      } else {
        safeCount++;
      }
    });

    return {
      total: tags.length,
      criticalCount,
      warningCount,
      safeCount,
    };
  }, [tagsWithKinetics, tags.length]);

  // Filter and sort the tag list
  const filteredTags = useMemo(() => {
    let result = [...tagsWithKinetics];

    // Filter
    if (filterStatus === 'danger') {
      result = result.filter(
        (t) => t.kinetics.status === 'danger' || t.kinetics.status === 'expired'
      );
    } else if (filterStatus === 'warning') {
      result = result.filter((t) => t.kinetics.status === 'warning');
    } else if (filterStatus === 'safe') {
      result = result.filter((t) => t.kinetics.status === 'safe');
    }

    // Sort
    result.sort((a, b) => {
      if (sortBy === 'urgency') {
        // Ascending by remaining percent (lowest life first = Semáforo de caducidad)
        return a.kinetics.remaining_percent - b.kinetics.remaining_percent;
      }
      if (sortBy === 'name') {
        return a.tag.profile.food_name.localeCompare(b.tag.profile.food_name);
      }
      if (sortBy === 'newest') {
        return b.tag.createdAt - a.tag.createdAt;
      }
      return 0;
    });

    return result.map((item) => item.tag);
  }, [tagsWithKinetics, filterStatus, sortBy]);

  // Quick stress trigger from Card
  const handleQuickStress = (
    tagId: string,
    durationHours: number,
    tempCelsius: number,
    label: string
  ) => {
    setTags((prev) =>
      prev.map((tag) => {
        if (tag.id === tagId) {
          const newLog = createThermalLog(
            durationHours,
            tempCelsius,
            label,
            tag.profile,
            tag.logs
          );
          const updated = {
            ...tag,
            logs: [...tag.logs, newLog],
          };
          showToast(
            `🔥 Estrés térmico aplicado a ${tag.id} (${tag.profile.food_name}): +${durationHours}h a ${tempCelsius} °C (-${newLog.consumed_hours}h descontadas)`
          );
          return updated;
        }
        return tag;
      })
    );
  };

  // Update tag from Sandbox Modal
  const handleUpdateTag = (updatedTag: SmartTag) => {
    setTags((prev) => prev.map((t) => (t.id === updatedTag.id ? updatedTag : t)));
    setSelectedTag(updatedTag);
  };

  // Delete tag
  const handleDeleteTag = (tagId: string) => {
    setTags((prev) => prev.filter((t) => t.id !== tagId));
    showToast(`🗑️ ${tagId} ha sido desvinculado.`);
  };

  // Add new tag from NFC Modal
  const handleSaveNewTag = (newTag: SmartTag) => {
    setTags((prev) => [newTag, ...prev]);
    showToast(
      `✨ ${newTag.id} (${newTag.profile.food_name}) vinculado con éxito en el refrigerador a 4 °C.`
    );
  };

  // Reset seed data
  const handleResetSeedData = () => {
    if (window.confirm('¿Restablecer los tápers simulados al estado de demostración inicial?')) {
      const initial = getInitialSmartTags();
      setTags(initial);
      localStorage.removeItem(STORAGE_KEY);
      showToast('🔄 Datos iniciales de demostración restablecidos.');
    }
  };

  // Keep selectedTag synced if its data changes
  useEffect(() => {
    if (selectedTag) {
      const refreshed = tags.find((t) => t.id === selectedTag.id);
      if (refreshed) {
        setSelectedTag(refreshed);
      }
    }
  }, [tags, selectedTag]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans selection:bg-teal-200">
      {/* Header */}
      <Header
        totalTags={metrics.total}
        criticalCount={metrics.criticalCount}
        onOpenNewTagModal={() => setIsNewTagModalOpen(true)}
        onResetSeedData={handleResetSeedData}
        isSimRunning={isSimRunning}
        onToggleSim={() => setIsSimRunning(!isSimRunning)}
        simSpeed={simSpeed}
        onChangeSimSpeed={(spd) => setSimSpeed(spd)}
      />

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-2xl border border-slate-700 text-xs sm:text-sm font-medium animate-in slide-in-from-bottom-5 duration-300 max-w-md flex items-center gap-2">
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Container */}
      <main className="max-w-5xl mx-auto px-4 py-6 flex-1 w-full space-y-6">
        {/* Dashboard Controls: Filters & Sort */}
        <section className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          {/* Status Tabs */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-200/70 rounded-2xl overflow-x-auto max-w-full text-xs font-semibold">
            <button
              onClick={() => setFilterStatus('all')}
              className={`px-3 py-1.5 rounded-xl transition-all ${
                filterStatus === 'all'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Todos ({metrics.total})
            </button>

            <button
              onClick={() => setFilterStatus('danger')}
              className={`px-3 py-1.5 rounded-xl flex items-center gap-1.5 transition-all ${
                filterStatus === 'danger'
                  ? 'bg-rose-500 text-white shadow-sm'
                  : 'text-rose-700 hover:bg-rose-100/50'
              }`}
            >
              <AlertOctagon className="w-3.5 h-3.5" />
              Peligro ({metrics.criticalCount})
            </button>

            <button
              onClick={() => setFilterStatus('warning')}
              className={`px-3 py-1.5 rounded-xl flex items-center gap-1.5 transition-all ${
                filterStatus === 'warning'
                  ? 'bg-amber-500 text-white shadow-sm'
                  : 'text-amber-700 hover:bg-amber-100/50'
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              Consumir Pronto ({metrics.warningCount})
            </button>

            <button
              onClick={() => setFilterStatus('safe')}
              className={`px-3 py-1.5 rounded-xl flex items-center gap-1.5 transition-all ${
                filterStatus === 'safe'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-emerald-700 hover:bg-emerald-100/50'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              Seguros ({metrics.safeCount})
            </button>
          </div>

          {/* Sort Selector */}
          <div className="flex items-center gap-2 self-end sm:self-auto text-xs">
            <span className="text-slate-500 flex items-center gap-1">
              <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
              Ordenar por:
            </span>
            <select
              value={sortBy}
              onChange={(e) =>
                setSortBy(e.target.value as 'urgency' | 'name' | 'newest')
              }
              className="bg-white border border-slate-300 rounded-xl px-2.5 py-1.5 font-medium text-slate-800 text-xs focus:ring-2 focus:ring-teal-500"
            >
              <option value="urgency">Urgencia (Semáforo de Caducidad)</option>
              <option value="name">Nombre del Plato</option>
              <option value="newest">Más Recientes</option>
            </select>
          </div>
        </section>

        {/* Smart Tags Grid */}
        <section>
          {filteredTags.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-slate-200/80 shadow-sm space-y-3">
              <div className="w-12 h-12 mx-auto rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400">
                <Radio className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-800">
                No hay tápers en este estado
              </h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                No se encontraron No-Loss Tags activos que coincidan con el filtro seleccionado.
              </p>
              <button
                onClick={() => setFilterStatus('all')}
                className="mt-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors"
              >
                Ver Todos los Tags
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredTags.map((tag) => (
                <SmartTagCard
                  key={tag.id}
                  tag={tag}
                  onOpenSandbox={(clickedTag) => setSelectedTag(clickedTag)}
                  onQuickStress={handleQuickStress}
                />
              ))}
            </div>
          )}
        </section>
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-200 bg-white/60 py-6 text-center text-xs text-slate-500">
        <div className="max-w-5xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>
            No-Loss Tag • Prototipo de Gestión Inteligente con Simulación NFC
          </span>
          <span className="font-mono text-[11px] text-slate-400">
            Cinética Bromatológica FDA / USDA • Algoritmo Q₁₀ determinista en React
          </span>
        </div>
      </footer>

      {/* New Tag Registration Modal */}
      <NewTagModal
        isOpen={isNewTagModalOpen}
        onClose={() => setIsNewTagModalOpen(false)}
        onSaveTag={handleSaveNewTag}
        nextTagNumber={tags.length + 1}
      />

      {/* Thermal Sandbox & Analysis Modal */}
      <ThermalSandboxModal
        tag={selectedTag}
        onClose={() => setSelectedTag(null)}
        onUpdateTag={handleUpdateTag}
        onDeleteTag={handleDeleteTag}
      />
    </div>
  );
}

export default App;
