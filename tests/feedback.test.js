// Pruebas de la lógica común (lib/): validación del feedback y configuración por entorno.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { validarFeedback } from '../lib/feedback.js';
import { leerConfig, configPublica, esClaveSecreta } from '../lib/config.js';

const valido = { name: 'Ana', email: 'ana@example.com', message: 'Me gusta' };

test('acepta un feedback válido y limpia espacios', () => {
  const r = validarFeedback({ name: '  Ana ', email: ' ana@example.com ', message: ' Me gusta ' });
  assert.deepEqual(r, { ok: true, datos: valido });
});

test('rechaza campos vacíos o con formato incorrecto', () => {
  assert.equal(validarFeedback({}).ok, false);
  assert.equal(validarFeedback({ ...valido, email: 'no-es-un-email' }).ok, false);
  assert.equal(validarFeedback({ ...valido, message: 'x'.repeat(2001) }).ok, false);
});

test('la valoración solo se guarda con el feature flag activo', () => {
  assert.equal(validarFeedback({ ...valido, rating: 4 }).datos.rating, undefined);
  assert.equal(validarFeedback({ ...valido, rating: 4 }, { featureValoracion: true }).datos.rating, 4);
  assert.equal(validarFeedback({ ...valido, rating: 9 }, { featureValoracion: true }).ok, false);
});

test('cada entorno se lee de sus variables', () => {
  const prod = leerConfig({ APP_ENV: 'production', FEATURE_VALORACION: 'false' });
  const staging = leerConfig({ APP_ENV: 'staging', FEATURE_VALORACION: 'true' });
  assert.equal(prod.esProduccion, true);
  assert.equal(prod.featureValoracion, false);
  assert.equal(staging.esProduccion, false);
  assert.equal(staging.featureValoracion, true);
  assert.equal(leerConfig({}).appEnv, 'development');
});

test('una clave secreta nunca llega al navegador', () => {
  assert.equal(esClaveSecreta('sb_secret_inventada'), true);
  assert.equal(esClaveSecreta('sb_publishable_inventada'), false);
  const c = configPublica({ SUPABASE_ANON_KEY: 'sb_secret_inventada' });
  assert.equal(c.supabaseAnonKey, null);
  assert.ok(c.errorConfig);
});
