/** Runs once when the Node server process starts (including Cloud Run). Helps diagnose startup vs listen issues in GCP logs. */

export async function register() {
  console.info("[forest-poker] instrumentation register", {
    PORT: process.env.PORT,
    HOSTNAME: process.env.HOSTNAME,
    NODE_ENV: process.env.NODE_ENV,
  });
}
