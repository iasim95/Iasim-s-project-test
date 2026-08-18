const KEYWORD_CATEGORY: [RegExp, string][] = [
  [/vivienda|alquiler|hipoteca|renta\b|\bpiso\b|\bcasa\b/i, "Vivienda"],
  [/aliment|super|mercado|comida|grocer/i, "Alimentación"],
  [/servicio|factura|\bluz\b|\bagua\b|internet|telefon|\bgas\b/i, "Servicios"],
  [/transp|gasolina|uber|taxi|metro|autobus|parking|coche/i, "Transporte"],
  [/ocio|cine|netflix|spotify|juego|entretenim|concierto/i, "Ocio"],
  [/salud|medic|farmacia|dentista|\bgym\b|hospital/i, "Salud"],
];

/** Guesses a category name from free-text (e.g. an expense description). */
export function guessCategoryName(description: string): string | null {
  const match = KEYWORD_CATEGORY.find(([pattern]) => pattern.test(description));
  return match ? match[1] : null;
}
