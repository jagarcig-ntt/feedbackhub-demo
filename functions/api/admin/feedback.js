// GET /api/admin/feedback → lista de feedback, solo para administradores.
// La API no decide quién es administrador: pasa el token del usuario a Supabase
// y la base de datos (RLS + is_admin()) aplica los permisos.
import { leerConfig } from '../../../lib/config.js';
import { supabaseFetch, error } from '../../../lib/supabase.js';

export async function onRequestGet({ request, env }) {
  const config = leerConfig(env);
  if (!config.supabaseUrl || !config.supabaseAnonKey) {
    return error(503, 'El servicio no está configurado en este entorno.');
  }

  const cabecera = request.headers.get('Authorization') || '';
  const token = cabecera.startsWith('Bearer ') ? cabecera.slice(7).trim() : '';
  if (!token) return error(401, 'Inicia sesión para ver el feedback.');

  // ¿Es administrador? (función de la base de datos; con un token caducado responde 401)
  const rAdmin = await supabaseFetch(config, '/rest/v1/rpc/is_admin', { method: 'POST', body: {}, token });
  if (rAdmin.status === 401) return error(401, 'La sesión ha caducado. Vuelve a iniciar sesión.');
  if (!rAdmin.ok) {
    console.error('Error al comprobar administrador:', rAdmin.status);
    return error(502, 'No se ha podido comprobar tus permisos.');
  }
  if ((await rAdmin.json()) !== true) return error(403, 'Tu usuario no es administrador.');

  const r = await supabaseFetch(
    config,
    '/rest/v1/feedback?select=id,created_at,name,email,message,rating&order=created_at.desc&limit=200',
    { token },
  );
  if (!r.ok) {
    console.error('Error al leer feedback:', r.status);
    return error(502, 'No se ha podido cargar el feedback.');
  }

  return Response.json({ feedback: await r.json() }, { headers: { 'Cache-Control': 'no-store' } });
}
