import { buildServer } from "./server.js";

const app = buildServer();

app.listen({ host: "127.0.0.1", port: 4000 }).catch((error) => {
  app.log.error(error);
  process.exit(1);
});
