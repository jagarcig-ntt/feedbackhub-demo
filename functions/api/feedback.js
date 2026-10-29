// POST /api/feedback → guarda un feedback enviado desde el formulario público.
import { leerConfig } from '../../lib/config.js';
import { validarFeedback } from '../../lib/feedback.js';
import { supabaseFetch, error } from '../../lib/supabase.js';

export async function onRequestPost({ request, env }) {
  const config = leerConfig(env);
  if (!config.supabaseUrl || !config.supabaseAnonKey) {
    return error(503, 'El servicio no está configurado en este entorno.');
  }

  let entrada;
  try {
    entrada = await request.json();
  } catch {
    return error(400, 'La petición no es un JSON válido.');
  }

  const resultado = validarFeedback(entrada, { featureValoracion: config.featureValoracion });
  if (!resultado.ok) {
    return error(400, 'Revisa los datos del formulario.', { errores: resultado.errores });
  }

  // return=minimal: el rol anónimo puede insertar pero no leer (RLS), así que no pedimos la fila de vuelta.
  const r = await supabaseFetch(config, '/rest/v1/feedback', {
    method: 'POST',
    body: resultado.datos,
    headers: { Prefer: 'return=minimal' },
  });

  if (!r.ok) {
    // Solo el código de estado en los logs: nunca los datos del usuario.
    console.error('Error al guardar feedback en Supabase:', r.status);
    return error(502, 'No se ha podido guardar el feedback. Inténtalo de nuevo más tarde.');
  }

  return Response.json({ ok: true }, { status: 201 });
}
