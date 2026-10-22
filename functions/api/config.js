// GET /api/config → configuración del entorno para el navegador.
// El frontend no lleva ninguna URL ni clave escrita: las pide aquí al arrancar.
import { configPublica } from '../../lib/config.js';

export function onRequestGet({ env }) {
  return Response.json(configPublica(env), {
    headers: { 'Cache-Control': 'no-store' },
  });
}
