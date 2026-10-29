// Validación del feedback. Función pura: no toca red ni base de datos, así se puede probar sola.
// Los límites son los mismos que los CHECK de supabase/schema.sql: si alguien salta la API,
// la base de datos los vuelve a aplicar.

export const LIMITES = {
  nombre: 100,
  email: 254,
  mensaje: 2000,
};

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Devuelve { ok: true, datos } o { ok: false, errores: [...] }.
// Si el feature flag de valoración está apagado, la valoración se ignora aunque llegue.
export function validarFeedback(entrada, { featureValoracion = false } = {}) {
  const errores = [];
  const e = entrada && typeof entrada === 'object' ? entrada : {};

  const name = typeof e.name === 'string' ? e.name.trim() : '';
  const email = typeof e.email === 'string' ? e.email.trim() : '';
  const message = typeof e.message === 'string' ? e.message.trim() : '';

  if (!name) errores.push('El nombre es obligatorio.');
  else if (name.length > LIMITES.nombre) errores.push(`El nombre no puede pasar de ${LIMITES.nombre} caracteres.`);

  if (!email) errores.push('El email es obligatorio.');
  else if (email.length > LIMITES.email || !EMAIL.test(email)) errores.push('El email no es válido.');

  if (!message) errores.push('El mensaje es obligatorio.');
  else if (message.length > LIMITES.mensaje) errores.push(`El mensaje no puede pasar de ${LIMITES.mensaje} caracteres.`);

  const datos = { name, email, message };

  if (featureValoracion && e.rating !== undefined && e.rating !== null && e.rating !== '') {
    const rating = Number(e.rating);
    if (!Number.isInteger(rating) || rating < 1 || rating > 5) errores.push('La valoración debe ser un número del 1 al 5.');
    else datos.rating = rating;
  }

  return errores.length ? { ok: false, errores } : { ok: true, datos };
}
