import type { BromatologicalProfile } from '../types/smartTag';

/**
 * Fallback bromatológico con más de 15 platos caseros y tradicionales chilenos
 * Parametrizados según directrices de seguridad alimentaria USDA / FDA y microbiología predictiva.
 */
export const LOCAL_BROMATOLOGICAL_DATABASE: BromatologicalProfile[] = [
  {
    food_name: 'Arroz con pollo',
    category: 'Proteína y Almidón',
    t0_hours: 72,
    q10_factor: 2.3,
    t_ref: 4.0,
    critical_hazard: 'Bacillus cereus / Salmonella enterica',
    conservation_tip: 'Enfriar rápidamente en porciones bajas antes de tapar. Recalentar hasta hervir (>75 °C).',
  },
  {
    food_name: 'Cazuela de vacuno',
    category: 'Proteína y Caldo',
    t0_hours: 72,
    q10_factor: 2.2,
    t_ref: 4.0,
    critical_hazard: 'Clostridium perfringens / Bacillus cereus',
    conservation_tip: 'Separar carne y caldo si el volumen es alto para acelerar el enfriamiento.',
  },
  {
    food_name: 'Pastel de choclo',
    category: 'Mixto (Lácteo, Proteína, Maíz)',
    t0_hours: 72,
    q10_factor: 2.3,
    t_ref: 4.0,
    critical_hazard: 'Staphylococcus aureus / Salmonella enterica',
    conservation_tip: 'Contiene pino y huevo duro; mantener refrigerado herméticamente.',
  },
  {
    food_name: 'Lasaña boloñesa',
    category: 'Pasta, Carne y Lácteo',
    t0_hours: 72,
    q10_factor: 2.4,
    t_ref: 4.0,
    critical_hazard: 'Bacillus cereus / Listeria monocytogenes',
    conservation_tip: 'Capa superficial de queso retiene humedad; recalentar en horno a >74 °C en el centro.',
  },
  {
    food_name: 'Crema de zapallo',
    category: 'Verdura y Lácteo',
    t0_hours: 96,
    q10_factor: 2.1,
    t_ref: 4.0,
    critical_hazard: 'Listeria monocytogenes / Esporas bacterianas',
    conservation_tip: 'Si lleva leche o crema espesa, consumir preferentemente antes de 4 días.',
  },
  {
    food_name: 'Porotos granados con mazamorra',
    category: 'Legumbre y Almidón',
    t0_hours: 96,
    q10_factor: 2.2,
    t_ref: 4.0,
    critical_hazard: 'Clostridium perfringens / Bacillus subtilis',
    conservation_tip: 'El zapallo y porotos fermentan si la temperatura sube de 8 °C. Conservar al fondo del refri.',
  },
  {
    food_name: 'Charquicán con huevo frito',
    category: 'Guiso mixto y Huevo',
    t0_hours: 48,
    q10_factor: 2.4,
    t_ref: 4.0,
    critical_hazard: 'Salmonella enteritidis / Clostridium perfringens',
    conservation_tip: 'El huevo reduce drásticamente la vida útil. Guardar sin el huevo si se conservará varios días.',
  },
  {
    food_name: 'Pollo al horno con puré de papas',
    category: 'Proteína y Tubérculo lácteo',
    t0_hours: 72,
    q10_factor: 2.3,
    t_ref: 4.0,
    critical_hazard: 'Campylobacter jejuni / Salmonella',
    conservation_tip: 'El puré con leche tiene alta actividad de agua; recalentar mezclando uniformemente.',
  },
  {
    food_name: 'Pescado frito (Reineta / Merluza)',
    category: 'Pescado y Marisco',
    t0_hours: 48,
    q10_factor: 2.5,
    t_ref: 4.0,
    critical_hazard: 'Vibrio parahaemolyticus / Histamina',
    conservation_tip: 'Los pescados tienen rápida degradación enzimática. Consumir dentro de las 48h.',
  },
  {
    food_name: 'Empanadas de pino',
    category: 'Carne y Masa horneada',
    t0_hours: 72,
    q10_factor: 2.3,
    t_ref: 4.0,
    critical_hazard: 'Clostridium perfringens / Staphylococcus aureus',
    conservation_tip: 'La cebolla cocida y carne molida son sustratos de riesgo; mantener en recipiente cerrado.',
  },
  {
    food_name: 'Lentejas con longaniza',
    category: 'Legumbre y Embutido',
    t0_hours: 96,
    q10_factor: 2.2,
    t_ref: 4.0,
    critical_hazard: 'Bacillus cereus / Clostridium botulinum',
    conservation_tip: 'Plato denso: enfriar en recipiente extendido antes de apilar en el refrigerador.',
  },
  {
    food_name: 'Fideos con salsa boloñesa',
    category: 'Pasta y Carne',
    t0_hours: 72,
    q10_factor: 2.3,
    t_ref: 4.0,
    critical_hazard: 'Bacillus cereus / Salmonella',
    conservation_tip: 'La salsa ácida de tomate ayuda ligeramente al pH, pero la carne requiere <4 °C estricto.',
  },
  {
    food_name: 'Ensalada rusa con mayonesa casera',
    category: 'Tubérculo y Emulsión de huevo',
    t0_hours: 36,
    q10_factor: 2.6,
    t_ref: 4.0,
    critical_hazard: 'Salmonella enteritidis / Listeria monocytogenes',
    conservation_tip: 'Crítico: La mayonesa casera tiene alto riesgo microbiológico. Nunca superar los 8 °C.',
  },
  {
    food_name: 'Guiso de zapallitos italianos',
    category: 'Verdura y Huevo',
    t0_hours: 72,
    q10_factor: 2.2,
    t_ref: 4.0,
    critical_hazard: 'Staphylococcus aureus / Pseudomonas',
    conservation_tip: 'Alto contenido de agua libre. Mantener siempre tapado en frío.',
  },
  {
    food_name: 'Carne mechada con arroz blanco',
    category: 'Proteína y Almidón',
    t0_hours: 72,
    q10_factor: 2.3,
    t_ref: 4.0,
    critical_hazard: 'Bacillus cereus / Clostridium perfringens',
    conservation_tip: 'Separar el arroz de la carne al guardar para evitar zonas de humedad atrapada.',
  },
  {
    food_name: 'Sopa casera de verduras',
    category: 'Verdura y Caldo',
    t0_hours: 120,
    q10_factor: 2.1,
    t_ref: 4.0,
    critical_hazard: 'Listeria monocytogenes / Hongos psicrófilos',
    conservation_tip: 'Vida útil más amplia por ausencia de proteína animal. Hervir brevemente al recalentar.',
  },
  {
    food_name: 'Ceviche de pescado fresco',
    category: 'Pescado crudo cítrico',
    t0_hours: 24,
    q10_factor: 2.6,
    t_ref: 4.0,
    critical_hazard: 'Vibrio cholerae / Anisakis simplex / Histamina',
    conservation_tip: 'El limón NO esteriliza el pescado. Consumo inmediato recomendado (<24 horas a 2-4 °C).',
  },
  {
    food_name: 'Leche asada casera',
    category: 'Postre Lácteo y Huevo',
    t0_hours: 96,
    q10_factor: 2.2,
    t_ref: 4.0,
    critical_hazard: 'Salmonella enteritidis / Bacillus coagulans',
    conservation_tip: 'Contiene caramelo y leche cocida. Mantener en la repisa media del refrigerador.',
  },
];

/**
 * Intelligent heuristic fallback for any user input
 */
export function findOrEstimateFallbackProfile(dishInput: string): BromatologicalProfile {
  const cleanInput = dishInput.trim().toLowerCase();

  // 1. Direct or partial match in local database
  const directMatch = LOCAL_BROMATOLOGICAL_DATABASE.find(
    item =>
      cleanInput.includes(item.food_name.toLowerCase()) ||
      item.food_name.toLowerCase().includes(cleanInput)
  );
  if (directMatch) {
    return { ...directMatch, food_name: dishInput.trim() };
  }

  // 2. Keyword heuristic categorizer (FDA / USDA domestic food safety rules)
  if (
    cleanInput.includes('ceviche') ||
    cleanInput.includes('sushi') ||
    cleanInput.includes('tartar') ||
    cleanInput.includes('crudo')
  ) {
    return {
      food_name: dishInput.trim(),
      category: 'Pescado/Marisco Crudo',
      t0_hours: 24,
      q10_factor: 2.6,
      t_ref: 4.0,
      critical_hazard: 'Vibrio parahaemolyticus / Histamina / Anisakis',
      conservation_tip: 'Consumo crítico ultra rápido. No romper cadena de frío bajo ninguna circunstancia.',
    };
  }

  if (
    cleanInput.includes('pescad') ||
    cleanInput.includes('marisc') ||
    cleanInput.includes('reineta') ||
    cleanInput.includes('salmon') ||
    cleanInput.includes('atun') ||
    cleanInput.includes('camaron')
  ) {
    return {
      food_name: dishInput.trim(),
      category: 'Pescado / Marisco cocido',
      t0_hours: 48,
      q10_factor: 2.5,
      t_ref: 4.0,
      critical_hazard: 'Vibrio parahaemolyticus / Listeria monocytogenes',
      conservation_tip: 'Consumir en un plazo máximo de 48 horas a temperatura <4 °C.',
    };
  }

  if (
    cleanInput.includes('mayonesa') ||
    cleanInput.includes('huevo') ||
    cleanInput.includes('rusa')
  ) {
    return {
      food_name: dishInput.trim(),
      category: 'Huevo / Emulsión perecible',
      t0_hours: 36,
      q10_factor: 2.5,
      t_ref: 4.0,
      critical_hazard: 'Salmonella enterica / Staphylococcus aureus',
      conservation_tip: 'Riesgo alto de proliferación bacteriana por encima de 6 °C.',
    };
  }

  if (
    cleanInput.includes('pollo') ||
    cleanInput.includes('pavo') ||
    cleanInput.includes('ave')
  ) {
    return {
      food_name: dishInput.trim(),
      category: 'Proteína de Ave',
      t0_hours: 72,
      q10_factor: 2.3,
      t_ref: 4.0,
      critical_hazard: 'Campylobacter / Salmonella enterica',
      conservation_tip: 'Recalentar asegurando que el centro supere los 74 °C.',
    };
  }

  if (
    cleanInput.includes('carne') ||
    cleanInput.includes('vacuno') ||
    cleanInput.includes('cerdo') ||
    cleanInput.includes('asado') ||
    cleanInput.includes('bistec') ||
    cleanInput.includes('hamburguesa')
  ) {
    return {
      food_name: dishInput.trim(),
      category: 'Proteína Roja Cocida',
      t0_hours: 72,
      q10_factor: 2.3,
      t_ref: 4.0,
      critical_hazard: 'Clostridium perfringens / Salmonella',
      conservation_tip: 'Refrigerar en recipiente hermético no más de 2 horas tras cocinar.',
    };
  }

  if (
    cleanInput.includes('arroz') ||
    cleanInput.includes('pasta') ||
    cleanInput.includes('fideo') ||
    cleanInput.includes('tallarin') ||
    cleanInput.includes('lasa')
  ) {
    return {
      food_name: dishInput.trim(),
      category: 'Almidón / Pasta cocida',
      t0_hours: 72,
      q10_factor: 2.4,
      t_ref: 4.0,
      critical_hazard: 'Bacillus cereus (Toxina emética)',
      conservation_tip: 'El arroz cocido produce esporas termorresistentes si se deja tibio en el mesón.',
    };
  }

  if (
    cleanInput.includes('poroto') ||
    cleanInput.includes('lenteja') ||
    cleanInput.includes('garbanzo')
  ) {
    return {
      food_name: dishInput.trim(),
      category: 'Legumbres',
      t0_hours: 96,
      q10_factor: 2.2,
      t_ref: 4.0,
      critical_hazard: 'Bacillus cereus / Clostridium perfringens',
      conservation_tip: 'Conservar en el estante más frío del refrigerador.',
    };
  }

  if (
    cleanInput.includes('sopa') ||
    cleanInput.includes('caldo') ||
    cleanInput.includes('verdura') ||
    cleanInput.includes('guiso') ||
    cleanInput.includes('zapallo')
  ) {
    return {
      food_name: dishInput.trim(),
      category: 'Vegetales y Caldos',
      t0_hours: 96,
      q10_factor: 2.1,
      t_ref: 4.0,
      critical_hazard: 'Listeria monocytogenes / Psicrófilos',
      conservation_tip: 'Guardar tapado para evitar absorción de olores y contaminación cruzada.',
    };
  }

  // Generic fallback if completely unrecognized
  return {
    food_name: dishInput.trim(),
    category: 'Plato Casero Preparado',
    t0_hours: 72,
    q10_factor: 2.3,
    t_ref: 4.0,
    critical_hazard: 'Bacillus cereus / Staphylococcus aureus',
    conservation_tip: 'Regla general USDA: Consumir dentro de 3 a 4 días a 4 °C.',
  };
}
