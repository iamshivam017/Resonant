import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import { createServer } from "vite";

const port = Number(process.env.MOBILE_RUNTIME_TEST_PORT ?? 4174);
const server = await createServer({
  logLevel: "warn",
  server: {
    host: "127.0.0.1",
    port,
    strictPort: true,
  },
});

let closed = false;
const closeServer = async () => {
  if (closed) return;
  closed = true;
  await server.close();
};

for (const signal of ["SIGINT", "SIGTERM"]) {
  process.once(signal, async () => {
    await closeServer();
    process.exitCode = 1;
  });
}

try {
  await server.listen();

  const playwrightCli = fileURLToPath(
    new URL("../node_modules/@playwright/test/cli.js", import.meta.url),
  );
  const child = spawn(
    process.execPath,
    [playwrightCli, "test", "tests/e2e"],
    {
      stdio: "inherit",
      env: {
        ...process.env,
        MOBILE_RUNTIME_TEST_PORT: String(port),
        RESONANT_EXTERNAL_TEST_SERVER: "1",
      },
    },
  );

  const exitCode = await new Promise((resolve, reject) => {
    child.once("error", reject);
    child.once("exit", (code, signal) => {
      resolve(code ?? (signal ? 1 : 0));
    });
  });

  process.exitCode = exitCode;
} finally {
  await closeServer();
}
