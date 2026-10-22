// GET /api/health → comprobación rápida de que la API responde (prueba de humo, Familia 4)
export function onRequestGet() {
  return Response.json({ status: 'ok' });
}
