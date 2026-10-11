import type { BromatologicalProfile } from '../types/smartTag';
import { findOrEstimateFallbackProfile } from './bromatologicalData';

export interface ExtractionResult {
  profile: BromatologicalProfile;
  source: 'ai_gemini' | 'offline_fallback';
  rawResponse?: string;
  errorMessage?: string;
}

export async function extractBromatologicalProfile(
  foodInput: string,
  customApiKey?: string
): Promise<ExtractionResult> {
  const apiKey =
    customApiKey ||
    localStorage.getItem('custom_gemini_api_key') ||
    import.meta.env.VITE_LLM_API_KEY ||
    import.meta.env.VITE_GEMINI_API_KEY ||
    import.meta.env.GEMINI_API_KEY ||
    '';

  const trimmedInput = foodInput.trim();
  if (!trimmedInput) {
    return {
      profile: findOrEstimateFallbackProfile('Alimento no especificado'),
      source: 'offline_fallback',
    };
  }

  // If no API key is provided, use immediate local fallback
  if (!apiKey || apiKey.trim() === '' || apiKey === 'YOUR_API_KEY_HERE') {
    return {
      profile: findOrEstimateFallbackProfile(trimmedInput),
      source: 'offline_fallback',
      errorMessage: 'No se detectó VITE_LLM_API_KEY en .env. Usando base bromatológica local.',
    };
  }

  const systemPrompt = `Eres un experto en bromatología y seguridad alimentaria (normas USDA/FDA). Analiza el plato casero, detecta sus ingredientes perecibles clave y retorna estrictamente un JSON con sus parámetros cinéticos para almacenamiento doméstico refrigerado.`;

  const userPrompt = `Plato casero: "${trimmedInput}"

Responde ÚNICAMENTE con un objeto JSON válido con los siguientes campos y tipos exactos:
{
  "food_name": "${trimmedInput}",
  "category": "string (ej: Proteína, Lácteo, Almidón, Verdura, Legumbre, etc.)",
  "ingredients": ["string con ingredientes clave perecibles detectados"],
  "t0_hours": number (Vida útil base a 4 °C en horas, típicamente entre 24 y 120 según el tipo de plato),
  "q10_factor": number (Factor Q10 de aceleración de deterioro por cada 10 °C de subida, generalmente entre 2.0 y 2.6),
  "t_ref": 4.0,
  "critical_hazard": "string (bacteria o patógeno principal de riesgo, ej: 'Bacillus cereus / Salmonella')",
  "conservation_tip": "string (breve consejo práctico de conservación o recalentamiento seguro)"
}`;

  // Try gemini-2.5-flash, then fallback to gemini-flash-latest
  const modelEndpoints = [
    'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent',
    'https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent',
  ];

  for (const endpoint of modelEndpoints) {
    try {
      const url = `${endpoint}?key=${encodeURIComponent(apiKey)}`;

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              role: 'user',
              parts: [{ text: `${systemPrompt}\n\n${userPrompt}` }],
            },
          ],
          generationConfig: {
            responseMimeType: 'application/json',
            temperature: 0.1,
            maxOutputTokens: 1000,
          },
        }),
      });

      if (!response.ok) {
        console.warn(`Endpoint ${endpoint} returned ${response.status}`);
        continue; // try next endpoint
      }

      const data = await response.json();
      const candidateText =
        data?.candidates?.[0]?.content?.parts?.[0]?.text || '';

      if (!candidateText) continue;

      // Clean any markdown wrapper if present
      const cleanedJson = candidateText
        .replace(/^```json\s*/i, '')
        .replace(/^```\s*/i, '')
        .replace(/```$/i, '')
        .trim();

      const parsed = JSON.parse(cleanedJson);

      // Validate and enforce types
      const profile: BromatologicalProfile = {
        food_name: String(parsed.food_name || trimmedInput),
        category: String(parsed.category || 'Plato Casero Preparado'),
        ingredients: Array.isArray(parsed.ingredients)
          ? parsed.ingredients.map(String)
          : undefined,
        t0_hours: Number(parsed.t0_hours) || 72,
        q10_factor: Number(parsed.q10_factor) || 2.2,
        t_ref: 4.0,
        critical_hazard: String(
          parsed.critical_hazard || 'Bacillus cereus / Staphylococcus aureus'
        ),
        conservation_tip: String(
          parsed.conservation_tip || 'Mantener refrigerado entre 1 °C y 4 °C.'
        ),
      };

      return {
        profile,
        source: 'ai_gemini',
        rawResponse: candidateText,
      };
    } catch (endpointErr) {
      console.warn(`Error on endpoint ${endpoint}:`, endpointErr);
    }
  }

  // If both endpoints failed, use local fallback
  const fallback = findOrEstimateFallbackProfile(trimmedInput);
  return {
    profile: fallback,
    source: 'offline_fallback',
    errorMessage: 'No fue posible conectar con los endpoints de Gemini. Usando base bromatológica local.',
  };
}
