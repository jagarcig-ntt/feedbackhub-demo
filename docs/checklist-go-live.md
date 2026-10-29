# Checklist de go-live · FeedbackHub

Antes de salir a producción, alguien recorre esta lista y responde **sí o no** a cada punto.
Si hay un "no", se decide de forma consciente: se arregla, se acepta el riesgo o no se sale.

> Viene de la Familia 4 de la sesión "Git, Deployment y Producción" (AI PM Pro · The Hero Camp).
> Cada punto indica de qué familia sale.

| # | Pregunta | Sí / No | Familia |
|---|---|---|---|
| 1 | ¿Lo que sale ha pasado por un PR revisado, con checks en verde? | | F1, F3 |
| 2 | ¿Se ha probado en staging o en la preview, con el flujo principal de usuario de principio a fin? | | F2, F3 |
| 3 | ¿Están configuradas en producción todas las variables y secretos que necesita? | | F2 |
| 4 | ¿Cambia algo en la base de datos? Si es así, ¿se puede deshacer? | | F2, F4 |
| 5 | ¿Sabemos cómo volver atrás y cuánto se tarda? | | F4 |
| 6 | ¿Hay forma de apagarlo sin cambiar el código (*feature flag*)? | | F1, F2 |
| 7 | ¿Alguien estará mirando las señales durante la primera hora tras salir? | | F4 |
| 8 | ¿Saben soporte y los usuarios afectados lo que cambia? | | F4 |

**Decisión:** ☐ Salimos · ☐ Salimos asumiendo riesgos (¿cuáles?) · ☐ No salimos

## En FeedbackHub, en concreto

| Punto | Dónde se comprueba |
|---|---|
| 1 | La pestaña *Checks* del PR en GitHub |
| 2 | La URL de preview del PR (o `https://staging-prueba.feedbackhub-demo.pages.dev`) |
| 3 | Cloudflare → *Workers & Pages → feedbackhub-demo → Settings → Variables and secrets* → *Production* (`APP_ENV`, `FEATURE_VALORACION`, `SUPABASE_URL`, `SUPABASE_ANON_KEY`) |
| 4 | ¿El PR toca `supabase/schema.sql`? Entonces hay que aplicarlo a mano en el proyecto de producción y pensar cómo se deshace |
| 5 | Rollback: Cloudflare → *Deployments* → despliegue anterior → *Rollback to this deployment* (unos 5 segundos, probado el 28-oct-2026) |
| 6 | `FEATURE_VALORACION` en las variables de producción. Al cambiarla hay que volver a desplegar el mismo código (*Retry deployment*) |
| 7 | Prueba de humo: `/api/health` responde `{"status":"ok"}`, la portada muestra el formulario y el panel deja entrar. **Mira el contenido, no solo que responda 200:** Cloudflare Pages sirve la portada para cualquier ruta que no existe |
| 8 | Aviso en el canal del equipo con qué cambia y cómo reportar problemas |
