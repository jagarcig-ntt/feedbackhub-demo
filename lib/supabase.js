// Llamadas a la API REST de Supabase con fetch (sin dependencias).
// Siempre con la clave PÚBLICA. Cuando hay un usuario con sesión, se envía su token:
// así es la base de datos (RLS) la que decide qué puede ver.

export async function supabaseFetch(config, ruta, { method = 'GET', body, token, headers = {} } = {}) {
  return fetch(`${config.supabaseUrl}${ruta}`, {
    method,
    headers: {
      apikey: config.supabaseAnonKey,
      Authorization: `Bearer ${token || config.supabaseAnonKey}`,
      ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}),
      ...headers,
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
}

// Respuesta de error en JSON, sin datos personales ni detalles internos.
export function error(status, mensaje, extra = {}) {
  return Response.json({ error: mensaje, ...extra }, { status, headers: { 'Cache-Control': 'no-store' } });
}
