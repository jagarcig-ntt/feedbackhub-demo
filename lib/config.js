// Lee las variables de entorno y devuelve la configuración que necesita la app.
// El código es el mismo en todos los entornos: lo único que cambia son estas variables.

const ENTORNOS = ['development', 'staging', 'production'];

export function leerConfig(env = {}) {
  const appEnv = ENTORNOS.includes(env.APP_ENV) ? env.APP_ENV : 'development';

  return {
    appEnv,
    esProduccion: appEnv === 'production',
    featureValoracion: env.FEATURE_VALORACION === 'true',
    supabaseUrl: env.SUPABASE_URL || null,
    // Clave pública de Supabase: el navegador la necesita para el login.
    // Es pública por diseño; lo que protege los datos son los permisos (RLS) de la base de datos.
    supabaseAnonKey: env.SUPABASE_ANON_KEY || null,
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
  };
}
