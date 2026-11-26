import Fastify from "fastify";
import type { DatabaseSync } from "node:sqlite";
import reservationRoutes from "./routes/reservations.js";
import equipmentRoutes from "./routes/equipment.js";

export function buildApp(db: DatabaseSync) {
  const app = Fastify({
    logger: true,
  });

  app.get("/health", async () => {
    return { status: "ok" };
  });

  app.register(reservationRoutes, { db });
  app.register(equipmentRoutes, { db });

  app.addHook("onClose", async () => {
    db.close();
  });

  return app;
}
