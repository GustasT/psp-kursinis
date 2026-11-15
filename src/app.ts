import Fastify from "fastify";
import reservationRoutes from "./routes/reservations.js";

export function buildApp() {
  const app = Fastify({
    logger: true,
  });

  app.get("/health", async () => {
    return { status: "ok" };
  });

  app.register(reservationRoutes);

  return app;
}
