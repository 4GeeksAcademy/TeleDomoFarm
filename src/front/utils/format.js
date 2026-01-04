/**
 * Formatea un número como moneda
 * @param {number} amount - Cantidad a formatear
 * @param {string} [currency='$'] - Símbolo de moneda
 * @returns {string} Cantidad formateada como moneda
 */
export const formatCurrency = (amount, currency = "$") => {
  return `${currency}${amount.toLocaleString("es-AR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

/**
 * Formatea una fecha en formato legible
 * @param {Date} date - Fecha a formatear
 * @returns {string} Fecha formateada
 */
export const formatDate = (date) => {
  return new Date(date).toLocaleDateString("es-AR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "long",
  });
};

/**
 * Formatea un número con separadores de miles
 * @param {number} number - Número a formatear
 * @param {number} [decimals=0] - Cantidad de decimales
 * @returns {string} Número formateado
 */
export const formatNumber = (number, decimals = 0) => {
  return number.toLocaleString("es-AR", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
};
