# ❄️ SmartTag Fridge — Sistema Inteligente de Gestión de Alimentos

> 🌐 **Demo en Vivo (Deploy en Render):** [https://smarttag-fridge.onrender.com/](https://smarttag-fridge.onrender.com/)

Prototipo funcional Single Page Application (SPA) responsive y mobile-first para la gestión inteligente de alimentos en el refrigerador mediante **Smart Tags simulados (NFC)**.

Este proyecto implementa una **arquitectura híbrida de dos niveles**:
1. **Inteligencia Artificial (Gemini 2.5 Flash):** Se consulta **únicamente al registrar un plato** para clasificar sus parámetros cinéticos y bromatológicos oficiales (normas FDA/USDA) en formato JSON estructurado.
2. **Modelo Microbiológico Determinista en Cliente (React):** Calcula en tiempo real el desgaste de vida útil acumulado frente a las variaciones y choques térmicos, sin reconsultar el LLM.

---

## 🚀 Inicio Rápido

### Requisitos
- [Node.js](https://nodejs.org/) v18+ o v24+
- `npm`

### Instalación y Ejecución
```bash
# 1. Instalar dependencias
npm install

# 2. Iniciar servidor de desarrollo
npm run dev

# 3. Compilar para producción
npm run build
```

La aplicación se ejecutará en: `http://localhost:5173`

---

## 🔑 Configuración de API Key (Gemini)

El archivo `.env` en la raíz del proyecto admite las siguientes variables:

```env
VITE_LLM_API_KEY=tu_api_key_de_gemini
GEMINI_API_KEY=tu_api_key_de_gemini
```

> **Fallback Bromatológico Offline Automático:**  
> Si la API Key no está configurada, falla la conexión o se agota la cuota, la app activa de forma transparente su base de datos local con más de 18 platos caseros chilenos tradicionales parametrizados (`Arroz con pollo`, `Pastel de choclo`, `Cazuela de vacuno`, `Lasaña boloñesa`, `Crema de zapallo`, `Porotos granados`, `Ceviche`, etc.) y un clasificador heurístico por palabras clave para cualquier ingrediente.

---

## 🧮 Modelo Cinético de Deterioro Térmico ($Q_{10}$)

El cliente calcula la degradación microbiana usando la aproximación de van 't Hoff / Arrhenius:

### 1. Tasa Relativa Instantánea de Deterioro $r(T)$:
$$r(T) = Q_{10}^{\frac{T - T_{ref}}{10}}$$

- $T_{ref} = 4.0^\circ\text{C}$ (Temperatura de referencia del refrigerador).
- $Q_{10} \in [2.0, 2.6]$ (Factor cinético específico extraído por la IA según el plato).

### 2. Horas Efectivas Consumidas:
$$\Delta t_{\text{efectivo}} = r(T) \cdot \Delta t_{\text{reloj}}$$

- **A 4.0 °C ($T = T_{ref}$):** $r(4) = Q_{10}^0 = 1.0$ (1 hora real descuenta 1 hora base).
- **A 14.0 °C ($Q_{10} = 2.2$):** $r(14) = 2.2^1 = 2.2$ (descuenta 2.2 horas por hora real).
- **A 22.0 °C (Mesón de cocina):** $r(22) = 2.2^{1.8} \approx 4.14$ (1 hora en el mesón envejece la comida más de 4 horas).

### 3. Semáforo de Caducidad:
- 🟢 **Seguro:** $> 40\%$ de vida útil restante.
- 🟡 **Consumir Pronto:** $15\% - 40\%$ de vida útil restante.
- 🔴 **Peligro Crítico:** $< 15\%$ o caducado ($0\%$).

---

## 📱 Vistas y Funcionalidades del Prototipo

1. **Dashboard Principal ("Mis Tápers"):**
   - Tarjetas informativas de Smart Tags activos.
   - Semáforo visual con barra de progreso y horas restantes.
   - Badge con bacteria patógena crítica (`critical_hazard`).
   - Botón de estrés rápido directo: `+2h Mesón (22 °C)` con recálculo visual en tiempo real.
   - Filtros por estado de riesgo y ordenamiento por urgencia.

2. **Modal de Nuevo Registro ("Simular Toque NFC"):**
   - Efecto visual de aproximación NFC.
   - Dictado por voz simulado y reconocimiento de voz (Web Speech API).
   - Consulta a Gemini 1.5 Flash en modo JSON structured.
   - Previsualización técnica antes de guardar.

3. **Panel de Simulación de Estrés Térmico (Sandbox):**
   - Ficha técnica completa devuelta por la IA ($t_0$, $Q_{10}$, patógeno, tip).
   - Slider interactivo para experimentar con la tasa instantánea $r(T)$.
   - Botones de escenarios rápidos: "Olvido en mesón", "Corte de luz", "Refrigeración óptima", "Puerta abierta".
   - Inyección personalizada de exposición ($\Delta t$ y $T$).
   - Gráfico de doble eje con **Recharts**: Curva histórica de temperatura vs. degradación porcentual acumulada.
   - Tabla cronológica de auditoría de los registros del sensor.

---

## 🛠️ Stack Tecnológico
- **Framework:** React 19 + TypeScript + Vite
- **Estilos:** Tailwind CSS con estética moderna y paleta fría de refrigeración
- **Iconografía:** `lucide-react`
- **Visualización:** `recharts`
