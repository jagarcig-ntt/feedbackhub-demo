// Panel de administración: login con Supabase Auth y lista de feedback.
// El login lo hace el navegador con la clave PÚBLICA (llega de /api/config).
// La lista la pide a nuestra API con el token del usuario; la base de datos decide si puede verla.
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.50.0/+esm';

const $ = (id) => document.getElementById(id);
let supabase;

function aviso(id, texto, tipo = 'error') {
  const el = $(id);
  el.textContent = texto;
  el.className = `message visible ${tipo}`;
}

function limpiarAviso(id) {
  $(id).className = 'message';
}

function mostrarVista(nombre) {
  $('vistaLogin').classList.toggle('oculto', nombre !== 'login');
  $('vistaPanel').classList.toggle('oculto', nombre !== 'panel');
}

// Los datos vienen de usuarios anónimos: se pintan SIEMPRE con textContent, nunca como HTML.
function celda(texto, clase) {
  const td = document.createElement('td');
  td.textContent = texto;
  if (clase) td.className = clase;
  return td;
}

function pintarFeedback(lista) {
  const filas = $('filas');
  filas.replaceChildren();
  const hace24h = Date.now() - 24 * 60 * 60 * 1000;
  const valoraciones = lista.map((f) => f.rating).filter((r) => r);

  for (const f of lista) {
    const tr = document.createElement('tr');
    tr.append(
      celda(new Date(f.created_at).toLocaleString('es-ES'), 'date'),
      celda(f.name),
      celda(f.email, 'email'),
      celda(f.rating ? '★'.repeat(f.rating) : '–'),
      celda(f.message),
    );
    filas.append(tr);
  }

  $('total').textContent = lista.length;
  $('ultimas24').textContent = lista.filter((f) => new Date(f.created_at).getTime() > hace24h).length;
  $('media').textContent = valoraciones.length
    ? (valoraciones.reduce((a, b) => a + b, 0) / valoraciones.length).toFixed(1)
    : '–';
  if (!lista.length) aviso('avisoPanel', 'Todavía no hay feedback.', 'success');
}

async function cargarFeedback(session) {
  limpiarAviso('avisoPanel');
  $('usuario').textContent = session.user.email + ' · ';
  const r = await fetch('/api/admin/feedback', {
    headers: { Authorization: `Bearer ${session.access_token}` },
  });
  const datos = await r.json().catch(() => ({}));

  if (r.ok) {
    $('tabla').classList.remove('oculto');
    pintarFeedback(datos.feedback || []);
  } else {
    $('tabla').classList.add('oculto');
    aviso('avisoPanel', datos.error || 'No se ha podido cargar el feedback.');
    if (r.status === 401) { await supabase.auth.signOut(); mostrarVista('login'); }
  }
}

async function entrar(evento) {
  evento.preventDefault();
  limpiarAviso('avisoLogin');
  $('entrar').disabled = true;
  const { data, error } = await supabase.auth.signInWithPassword({
    email: $('loginEmail').value.trim(),
    password: $('loginPassword').value,
  });
  $('entrar').disabled = false;

  if (error) {
    aviso('avisoLogin', 'Email o contraseña incorrectos.');
    return;
  }
  $('loginForm').reset();
  mostrarVista('panel');
  await cargarFeedback(data.session);
}

async function salir() {
  await supabase.auth.signOut();
  mostrarVista('login');
}

async function iniciar() {
  let config;
  try {
    config = await (await fetch('/api/config')).json();
  } catch {
    aviso('avisoLogin', 'No se ha podido cargar la configuración. Recarga la página.');
    return;
  }

  if (config.appEnv !== 'production') {
    $('banner').classList.add('visible');
    document.body.classList.add('con-banner');
  }
  if (!config.supabaseUrl || !config.supabaseAnonKey) {
    aviso('avisoLogin', config.errorConfig || 'El login no está configurado en este entorno.');
    $('entrar').disabled = true;
    return;
  }

  supabase = createClient(config.supabaseUrl, config.supabaseAnonKey);
  $('loginForm').addEventListener('submit', entrar);
  $('salir').addEventListener('click', salir);

  const { data } = await supabase.auth.getSession();
  if (data.session) {
    mostrarVista('panel');
    await cargarFeedback(data.session);
  }
}

iniciar();
