// Portada: formulario público de feedback.
// La configuración del entorno (aviso de staging, feature flag) llega de /api/config:
// en este fichero no hay ninguna URL ni clave escrita.

const form = document.getElementById('feedbackForm');
const aviso = document.getElementById('aviso');
const botonEnviar = document.getElementById('enviar');

function mostrarAviso(texto, tipo) {
  aviso.textContent = texto;
  aviso.className = `message visible ${tipo}`;
}

async function cargarConfig() {
  try {
    const config = await (await fetch('/api/config')).json();
    if (config.appEnv !== 'production') {
      document.getElementById('banner').classList.add('visible');
      document.body.classList.add('con-banner');
    }
    if (config.featureValoracion) {
      document.getElementById('grupoValoracion').classList.remove('oculto');
    }
    if (config.errorConfig) mostrarAviso(config.errorConfig, 'error');
  } catch {
    mostrarAviso('No se ha podido cargar la configuración. Recarga la página.', 'error');
  }
}

async function enviar(evento) {
  evento.preventDefault();
  const datos = Object.fromEntries(new FormData(form));
  botonEnviar.disabled = true;

  try {
    const r = await fetch('/api/feedback', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(datos),
    });
    const respuesta = await r.json().catch(() => ({}));

    if (r.ok) {
      mostrarAviso('¡Gracias! Hemos recibido tu feedback.', 'success');
      form.reset();
    } else {
      const detalle = respuesta.errores ? ' ' + respuesta.errores.join(' ') : '';
      mostrarAviso((respuesta.error || 'No se ha podido enviar.') + detalle, 'error');
    }
  } catch {
    mostrarAviso('Error de conexión. Inténtalo de nuevo.', 'error');
  } finally {
    botonEnviar.disabled = false;
  }
}

form.addEventListener('submit', enviar);
cargarConfig();
