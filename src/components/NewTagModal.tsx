import React, { useState } from 'react';
import type { SmartTag } from '../types/smartTag';
import { extractBromatologicalProfile, type ExtractionResult } from '../services/geminiService';
import { createThermalLog } from '../services/kineticModel';
import {
  X,
  Radio,
  Mic,
  MicOff,
  Sparkles,
  Database,
  ArrowRight,
  Lightbulb,
  Refrigerator,
  CheckCircle2,
  RefreshCw,
} from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSaveTag: (newTag: SmartTag) => void;
  nextTagNumber: number;
}

const POPULAR_DISHES = [
  'Arroz con pollo',
  'Cazuela de vacuno',
  'Pastel de choclo',
  'Lasaña boloñesa',
  'Crema de zapallo',
  'Porotos granados',
  'Ensalada rusa con mayonesa',
  'Ceviche de reineta',
  'Pollo con puré',
  'Sopa de verduras',
];

export const NewTagModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onSaveTag,
  nextTagNumber,
}) => {
  const [tagId, setTagId] = useState<string>(
    `Tag #${String(nextTagNumber).padStart(2, '0')}`
  );
  const [foodInput, setFoodInput] = useState<string>('');
  const [isListening, setIsListening] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadingStep, setLoadingStep] = useState<string>('');
  const [extractedResult, setExtractedResult] = useState<ExtractionResult | null>(null);
  const [nfcTapped, setNfcTapped] = useState<boolean>(false);

  if (!isOpen) return null;

  // Simulate NFC scan tap
  const handleSimulateNfcTap = () => {
    setNfcTapped(true);
    setTimeout(() => setNfcTapped(false), 2000);
  };

  // Toggle voice dictation (supports Web Speech API or simulation)
  const handleToggleVoice = () => {
    // Check if SpeechRecognition is available in browser
    const SpeechRecognition =
      (window as unknown as { SpeechRecognition?: unknown; webkitSpeechRecognition?: unknown })
        .SpeechRecognition ||
      (window as unknown as { SpeechRecognition?: unknown; webkitSpeechRecognition?: unknown })
        .webkitSpeechRecognition;

    if (SpeechRecognition && !isListening) {
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const recognition = new (SpeechRecognition as any)();
        recognition.lang = 'es-CL';
        recognition.interimResults = false;
        recognition.maxAlternatives = 1;

        setIsListening(true);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        recognition.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          setFoodInput(transcript);
          setIsListening(false);
        };
        recognition.onerror = () => {
          setIsListening(false);
        };
        recognition.onend = () => {
          setIsListening(false);
        };
        recognition.start();
        return;
      } catch (e) {
        console.warn('SpeechRecognition error:', e);
      }
    }

    // Fallback simulated dictation
    if (!isListening) {
      setIsListening(true);
      const simulatedPhrases = [
        'Arroz con pollo y verduras',
        'Pastel de choclo casero',
        'Lasaña boloñesa con queso parmesano',
        'Cazuela de vacuno con choclo y zapallo',
        'Crema de zapallo con croutons',
      ];
      const randomPhrase =
        simulatedPhrases[Math.floor(Math.random() * simulatedPhrases.length)];

      setTimeout(() => {
        setFoodInput(randomPhrase);
        setIsListening(false);
      }, 1500);
    } else {
      setIsListening(false);
    }
  };

  // Trigger Bromatological analysis via LLM API or fallback
  const handleAnalyzeFood = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!foodInput.trim()) return;

    setIsLoading(true);
    setLoadingStep('Conectando con motor de Inteligencia Artificial (Gemini)...');

    const stepTimer = setTimeout(() => {
      setLoadingStep('Evaluando parámetros cinéticos (Q10, t0, FDA/USDA)...');
    }, 900);

    try {
      const result = await extractBromatologicalProfile(foodInput);
      clearTimeout(stepTimer);
      setExtractedResult(result);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
      setLoadingStep('');
    }
  };

  // Final step: Save Smart Tag and start monitoring in fridge at 4°C
  const handleSaveToFridge = () => {
    if (!extractedResult) return;

    // Generate simulated NFC UID
    const randomHex = () =>
      Math.floor(Math.random() * 256)
        .toString(16)
        .padStart(2, '0')
        .toUpperCase();
    const nfcUid = `04:${randomHex()}:${randomHex()}:${randomHex()}:${randomHex()}`;

    // Initialize with first 0h @ 4.0 °C event
    const initialLog = createThermalLog(
      0.1, // starting snapshot
      4.0,
      'Ingreso inicial al refrigerador (4.0 °C)',
      extractedResult.profile,
      []
    );

    const newSmartTag: SmartTag = {
      id: tagId,
      nfcUid,
      profile: extractedResult.profile,
      createdAt: Date.now(),
      logs: [initialLog],
      source: extractedResult.source,
    };

    onSaveTag(newSmartTag);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-slate-900 via-slate-800 to-teal-950 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="relative">
              <button
                type="button"
                onClick={handleSimulateNfcTap}
                className={`p-2.5 rounded-2xl transition-all ${
                  nfcTapped
                    ? 'bg-teal-400 text-slate-950 scale-110 shadow-lg shadow-teal-400/50'
                    : 'bg-teal-500/20 text-teal-400 hover:bg-teal-500/30'
                }`}
                title="Tocar para simular lectura de sensor NFC"
              >
                <Radio className="w-5 h-5 animate-pulse" />
              </button>
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                Simular Toque NFC
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-teal-950 text-teal-300 border border-teal-800">
                  No-Loss Tag Registration
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Asigna un alimento casero a una etiqueta inteligente
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 sm:p-6 space-y-5 overflow-y-auto max-h-[80vh]">
          {/* Step 1: Tag Identification */}
          <div className="grid grid-cols-2 gap-3 items-center bg-slate-50 p-3 rounded-2xl border border-slate-200/80">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                Identificador de Tag:
              </label>
              <input
                type="text"
                value={tagId}
                onChange={(e) => setTagId(e.target.value)}
                className="w-full text-xs font-mono font-bold rounded-xl border-slate-300 p-2 border bg-white focus:ring-2 focus:ring-teal-500"
              />
            </div>
            <div className="text-right">
              <span className="text-[11px] text-slate-500 block">Frecuencia NFC:</span>
              <span className="text-xs font-mono font-semibold text-slate-700">
                13.56 MHz (ISO 14443A)
              </span>
            </div>
          </div>

          {/* Step 2: Food Input / Voice Simulation */}
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1.5 flex items-center justify-between">
              <span>Nombre o dictado del plato preparado:</span>
              <span className="text-[11px] text-teal-700 font-normal">
                {isListening ? 'Escuchando voz...' : 'Texto o dictado'}
              </span>
            </label>

            <form onSubmit={handleAnalyzeFood} className="relative">
              <input
                type="text"
                value={foodInput}
                onChange={(e) => setFoodInput(e.target.value)}
                placeholder="Ej: Arroz con pollo, Lasaña, Cazuela..."
                disabled={isLoading}
                className="w-full text-sm rounded-2xl border-slate-300 py-3 pl-4 pr-24 border bg-white focus:ring-2 focus:ring-teal-500 shadow-sm placeholder:text-slate-400"
              />

              <div className="absolute right-2 top-1.5 flex items-center gap-1">
                {/* Voice button */}
                <button
                  type="button"
                  onClick={handleToggleVoice}
                  title="Simular dictado por voz del plato"
                  className={`p-2 rounded-xl transition-all ${
                    isListening
                      ? 'bg-rose-500 text-white animate-bounce'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                  }`}
                >
                  {isListening ? (
                    <MicOff className="w-4 h-4" />
                  ) : (
                    <Mic className="w-4 h-4" />
                  )}
                </button>

                {/* Submit query */}
                <button
                  type="submit"
                  disabled={isLoading || !foodInput.trim()}
                  className="p-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white disabled:opacity-50 transition-colors shadow-sm"
                  title="Analizar con IA"
                >
                  {isLoading ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <ArrowRight className="w-4 h-4" />
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Quick Dishes Suggestions */}
          <div>
            <div className="text-[11px] font-semibold text-slate-500 mb-2">
              Sugerencias rápidas (platos caseros comunes):
            </div>
            <div className="flex flex-wrap gap-1.5">
              {POPULAR_DISHES.map((dish) => (
                <button
                  key={dish}
                  type="button"
                  onClick={() => {
                    setFoodInput(dish);
                    setExtractedResult(null);
                  }}
                  className={`text-xs px-2.5 py-1 rounded-xl border transition-colors ${
                    foodInput === dish
                      ? 'bg-teal-50 border-teal-300 text-teal-800 font-bold'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  {dish}
                </button>
              ))}
            </div>
          </div>

          {/* Loading Indicator */}
          {isLoading && (
            <div className="p-6 bg-slate-50 rounded-2xl border border-teal-200 text-center space-y-3 animate-pulse">
              <div className="inline-flex p-3 rounded-2xl bg-teal-100 text-teal-700">
                <RefreshCw className="w-6 h-6 animate-spin" />
              </div>
              <h4 className="text-sm font-bold text-slate-800">
                Consultando parámetros bromatológicos con IA...
              </h4>
              <p className="text-xs text-slate-500 font-mono">{loadingStep}</p>
            </div>
          )}

          {/* Step 3: Extracted Preview Card */}
          {extractedResult && !isLoading && (
            <div className="bg-slate-50/90 rounded-2xl p-4 sm:p-5 border border-slate-200 space-y-4 animate-in fade-in">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span className="text-xs font-bold text-slate-800">
                    Parámetros Bromatológicos Extraídos
                  </span>
                </div>

                {extractedResult.source === 'ai_gemini' ? (
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                    Gemini 2.5 Flash (Online)
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                    <Database className="w-3.5 h-3.5 text-slate-500" />
                    Base Bromatológica Local
                  </span>
                )}
              </div>

              {extractedResult.errorMessage && (
                <div className="text-[11px] text-amber-700 bg-amber-50 p-2 rounded-xl border border-amber-200">
                  {extractedResult.errorMessage}
                </div>
              )}

              {/* Parameters Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs font-mono">
                <div className="bg-white p-2.5 rounded-xl border border-slate-200/80">
                  <span className="text-[10px] text-slate-400 font-sans block">Plato:</span>
                  <span className="font-bold text-slate-800 truncate block">
                    {extractedResult.profile.food_name}
                  </span>
                </div>

                <div className="bg-white p-2.5 rounded-xl border border-slate-200/80">
                  <span className="text-[10px] text-slate-400 font-sans block">Categoría:</span>
                  <span className="font-bold text-slate-800 truncate block">
                    {extractedResult.profile.category}
                  </span>
                </div>

                <div className="bg-white p-2.5 rounded-xl border border-slate-200/80">
                  <span className="text-[10px] text-slate-400 font-sans block">Vida base (4°C):</span>
                  <span className="font-bold text-teal-700">
                    {extractedResult.profile.t0_hours} horas
                  </span>
                </div>

                <div className="bg-white p-2.5 rounded-xl border border-slate-200/80">
                  <span className="text-[10px] text-slate-400 font-sans block">Factor Q₁₀:</span>
                  <span className="font-bold text-indigo-700">
                    {extractedResult.profile.q10_factor.toFixed(2)}
                  </span>
                </div>

                <div className="bg-white p-2.5 rounded-xl border border-slate-200/80 col-span-2">
                  <span className="text-[10px] text-slate-400 font-sans block">Riesgo crítico:</span>
                  <span className="font-bold text-rose-700 truncate block">
                    {extractedResult.profile.critical_hazard}
                  </span>
                </div>
              </div>

              {/* Ingredients list if extracted */}
              {extractedResult.profile.ingredients && extractedResult.profile.ingredients.length > 0 && (
                <div className="bg-white p-2.5 rounded-xl border border-slate-200/80 text-xs">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                    Ingredientes perecibles detectados:
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {extractedResult.profile.ingredients.map((ing, i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 rounded-md bg-teal-50 text-teal-800 border border-teal-200 text-[11px] font-medium"
                      >
                        {ing}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Conservation Tip */}
              <div className="bg-white p-3 rounded-xl border border-slate-200/80 text-xs flex items-start gap-2">
                <Lightbulb className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-slate-700">Tip de conservación: </span>
                  <span className="text-slate-600">{extractedResult.profile.conservation_tip}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-5 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="text-xs text-slate-600 hover:text-slate-900 font-medium px-3 py-2"
          >
            Cancelar
          </button>

          {!extractedResult ? (
            <button
              type="button"
              onClick={() => handleAnalyzeFood()}
              disabled={isLoading || !foodInput.trim()}
              className="py-2.5 px-5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold transition-all shadow-md active:scale-95 disabled:opacity-50 flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              Consultar Parámetros IA
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSaveToFridge}
              className="py-2.5 px-6 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all shadow-md active:scale-95 flex items-center gap-2"
            >
              <Refrigerator className="w-4 h-4 text-teal-400" />
              Guardar en Refrigerador (Iniciar a 4 °C)
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
