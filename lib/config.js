// Lee las variables de entorno y devuelve la configuración que necesita la app.
// El código es el mismo en todos los entornos: lo único que cambia son estas variables.

const ENTORNOS = ['development', 'staging', 'production'];

// Una clave secreta de Supabase (sb_secret_… o una JWT con rol service_role) se salta
// todos los permisos de la base de datos. Nunca debe llegar al navegador.
export function esClaveSecreta(clave) {
  if (!clave) return false;
  if (clave.startsWith('sb_secret_')) return true;
  const partes = clave.split('.');
  if (partes.length === 3) {
    try {
      const payload = JSON.parse(atob(partes[1].replace(/-/g, '+').replace(/_/g, '/')));
      return payload.role === 'service_role';
    } catch {
      return false;
    }
  }
  return false;
}

export function leerConfig(env = {}) {
  const appEnv = ENTORNOS.includes(env.APP_ENV) ? env.APP_ENV : 'development';
  const clave = env.SUPABASE_ANON_KEY || null;
  const claveSecreta = esClaveSecreta(clave);

  return {
    appEnv,
    esProduccion: appEnv === 'production',
    featureValoracion: env.FEATURE_VALORACION === 'true',
    supabaseUrl: env.SUPABASE_URL || null,
    // Clave pública de Supabase (sb_publishable_…): el navegador la necesita para el login.
    // Es pública por diseño; lo que protege los datos son los permisos (RLS) de la base de datos.
    // Si por error se configura una clave secreta, no se usa ni se envía.
    supabaseAnonKey: claveSecreta ? null : clave,
    errorConfig: claveSecreta
      ? 'SUPABASE_ANON_KEY contiene una clave secreta. Configura la clave pública (publishable) y revoca la secreta en Supabase.'
      : null,
  };
}

// Lo que se puede enviar al navegador. Nunca incluye claves privadas
// (y la app no usa ninguna: no hay service_role en este proyecto).
export function configPublica(env = {}) {
  const c = leerConfig(env);
  return {
    appEnv: c.appEnv,
    featureValoracion: c.featureValoracion,
    supabaseUrl: c.supabaseUrl,
    supabaseAnonKey: c.supabaseAnonKey,
    errorConfig: c.errorConfig,
  };
}
