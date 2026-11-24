/**
 * Environment Separation Configuration
 *
 * Vite statically evaluates `import.meta.env.DEV` and `import.meta.env.PROD` at build time.
 * In production builds (`npm run build`), `IS_DEV_MODE` compiles to `false`, ensuring
 * development/testing tools (such as the Role Simulator and Quick Staff Login) are
 * completely removed from the production JavaScript bundle.
 *
 * Authentication-first policy: Even in development mode, unauthenticated visitors
 * are blocked from clinical workspaces unless `VITE_ENABLE_DEV_AUTH="true"` is
 * explicitly configured for local automated testing.
 */
export const IS_DEV_MODE: boolean =
  import.meta.env.DEV === true &&
  import.meta.env.PROD === false &&
  import.meta.env.MODE === 'development' &&
  import.meta.env.VITE_DISABLE_DEV_TOOLS !== 'true';

export const ENABLE_DEV_BYPASS_TOOLS: boolean =
  IS_DEV_MODE && import.meta.env.VITE_ENABLE_DEV_AUTH === 'true';
