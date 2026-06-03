// Constantes para formatação de telefone
export const PHONE_CONFIG = {
  MAX_LENGTH: 11, // DDD (2) + número (9)
  DDD_LENGTH: 2,
  FIRST_PART_LENGTH: 7, // DDD + 5 primeiros dígitos
} as const;

/**
 * Remove todos os caracteres não numéricos de uma string
 */
export const extractNumbers = (value: string): string => {
  return value.replace(/\D/g, "");
};

/**
 * Formata um número de telefone brasileiro no padrão (DD) XXXXX-XXXX
 * @param value - String contendo números ou texto com formatação
 * @returns Telefone formatado ou string vazia
 */
export const formatPhone = (value: string): string => {
  const numbers = extractNumbers(value);
  const limitedNumbers = numbers.slice(0, PHONE_CONFIG.MAX_LENGTH);

  if (limitedNumbers.length === 0) {
    return "";
  }

  if (limitedNumbers.length <= PHONE_CONFIG.DDD_LENGTH) {
    return `(${limitedNumbers}`;
  }

  const ddd = limitedNumbers.slice(0, PHONE_CONFIG.DDD_LENGTH);
  const remaining = limitedNumbers.slice(PHONE_CONFIG.DDD_LENGTH);

  if (limitedNumbers.length <= PHONE_CONFIG.FIRST_PART_LENGTH) {
    return `(${ddd}) ${remaining}`;
  }

  const firstPart = remaining.slice(0, 5);
  const secondPart = remaining.slice(5);

  return `(${ddd}) ${firstPart}-${secondPart}`;
};
