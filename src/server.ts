import { buildApp } from "./app.js";
import { openDatabase } from "./db/database.js";

const db = openDatabase();
const app = buildApp(db);

try {
  await app.listen({
    port: 3000,
    host: "127.0.0.1",
  });
} catch (error) {
  app.log.error(error);
  await app.close();
  process.exit(1);
}
