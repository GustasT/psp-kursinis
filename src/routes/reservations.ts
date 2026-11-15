import type { FastifyPluginAsync } from "fastify";
import { validateDuration } from "../services/reservation-service.js";

const reservationRoutes: FastifyPluginAsync = async (app) => {
  app.post<{ Body: { durationMinutes: number } }>(
    "/reservations/validate",
    {
      schema: {
        body: {
          type: "object",
          required: ["durationMinutes"],
          additionalProperties: false,
          properties: {
            durationMinutes: { type: "number" },
          },
        },
      },
    },
    async (request, reply) => {
      const result = validateDuration(request.body.durationMinutes, 5, 30);

      return reply.code(result.valid ? 200 : 422).send(result);
    },
  );
};

export default reservationRoutes;
