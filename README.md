# FeedbackHub · producto demo

Producto de ejemplo de la sesión **"Git, Deployment y Producción"** (AI PM Pro · The Hero Camp · 21-nov-2026).
Es pequeño a propósito: tiene las piezas de cualquier producto real para practicar el camino profesional hasta producción.

- **Producción:** https://feedbackhub-demo.pages.dev
- **Staging (preview):** https://staging-prueba.feedbackhub-demo.pages.dev (y cada PR tiene la suya)

## Qué es

Un formulario público para dejar feedback y un panel de administración para leerlo.

| Pieza | Qué es | Dónde |
|---|---|---|
| Interfaz (frontend) | Formulario (`/`) y panel con login (`/admin`) | `public/` |
| API (backend) | `/api/health`, `/api/config`, `/api/feedback`, `/api/admin/feedback` | `functions/` (Cloudflare Pages Functions) |
| Lógica común | Validación del feedback y configuración por entorno | `lib/` |
| Base de datos | Tablas, permisos (RLS) y datos de ejemplo | `supabase/` (Supabase) |
| Pruebas | Se ejecutan sin red ni secretos | `tests/` |

No hay paso de compilación ni dependencias que instalar. El navegador nunca lleva URLs ni claves escritas: las pide a `/api/config`, que las lee de las variables del entorno.

## Entornos

| | Development | Staging | Production |
|---|---|---|---|
| Dónde | Tu ordenador (`npm run dev`) | Previews de Cloudflare Pages | `feedbackhub-demo.pages.dev` |
| Base de datos | Proyecto de staging | `feedbackhub-staging` (datos de ejemplo) | `feedbackhub-prod` (datos reales) |
| Configuración | Fichero `.env` (no se sube) | Variables *Preview* de Cloudflare | Variables *Production* de Cloudflare |
| Valoración (feature flag) | Encendida | Encendida | Apagada |

Variables (mismo nombre en todos los entornos, distinto valor): `APP_ENV`, `FEATURE_VALORACION`, `SUPABASE_URL`, `SUPABASE_ANON_KEY`. Plantilla: [`.env.example`](.env.example).

## Cómo trabajamos

- **`main` siempre funciona.** Todo cambio va en una rama y entra por Pull Request.
- **Ramas:** `feature/<qué-añade>` para lo nuevo y `fix/<qué-arregla>` para arreglos. Por ejemplo, `feature/texto-portada` o `fix/email-obligatorio`.
- **Commits:** una sola cosa por commit, con un mensaje que diga qué cambia y por qué.
- **Antes de salir a producción:** [checklist de go-live](docs/checklist-go-live.md).

## Practica con tu propia copia (fork)

1. Arriba a la derecha, **Fork** → crea la copia en tu cuenta de GitHub.
2. En tu fork, pestaña **Actions** → **I understand my workflows, go ahead and enable them**. En los forks viene desactivado por defecto.
3. Crea una rama (selector de ramas → escribe `feature/texto-portada` → *Create branch*).
4. Abre `public/index.html`, pulsa el lápiz ✏️, cambia el texto de la portada y haz commit en tu rama con un mensaje con sentido.
5. **Compare & pull request** → rellena la plantilla → abre el PR dentro de tu fork.
6. Mira cómo se ejecuta el check en tu PR. En tu fork no se despliega nada: el despliegue solo funciona en el repositorio original.

## Levantarlo en local (opcional)

Necesitas [Node.js](https://nodejs.org/) 22 o superior (las pruebas usan patrones de fichero en `node --test`).

```bash
cp .env.example .env      # y rellena SUPABASE_URL y SUPABASE_ANON_KEY (la clave pública)
npm run dev               # http://localhost:8788
npm test                  # pruebas
```

Para la base de datos: crea un proyecto en Supabase, ejecuta `supabase/schema.sql` en su SQL Editor, crea un usuario y dalo de alta en la tabla `admins`.

> Usa siempre la clave **pública** (*publishable*) de Supabase, nunca la secreta. Si por error pones una clave secreta, `/api/config` se niega a enviarla al navegador.
