// Pruebas de la portada. Sin red ni secretos: funcionan igual en un fork.
// En la demo de la Familia 3 se rompe a propósito la primera para ver el check en rojo.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const leer = (fichero) => readFileSync(new URL(`../public/${fichero}`, import.meta.url), 'utf8');
const portada = leer('index.html');

test('la portada muestra el título del producto', () => {
  assert.match(portada, /<h1>FeedbackHub<\/h1>/);
});

test('la portada tiene el formulario con email, nombre y mensaje', () => {
  for (const id of ['feedbackForm', 'email', 'name', 'message']) {
    assert.match(portada, new RegExp(`id="${id}"`), `falta el elemento #${id}`);
  }
});

test('el frontend no lleva URLs ni claves escritas (llegan de /api/config)', () => {
  for (const fichero of ['index.html', 'app.js', 'admin.html', 'admin.js']) {
    const contenido = leer(fichero);
    assert.doesNotMatch(contenido, /\.supabase\.co/, `${fichero} contiene una URL de Supabase`);
    assert.doesNotMatch(contenido, /sb_(publishable|secret)_/, `${fichero} contiene una clave de Supabase`);
    assert.doesNotMatch(contenido, /eyJ[A-Za-z0-9_-]{20,}/, `${fichero} contiene un token JWT`);
  }
});
