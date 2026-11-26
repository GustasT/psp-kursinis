import type { FastifyPluginAsync } from "fastify";
import { DateTime } from "luxon";
import type { DatabaseSync } from "node:sqlite";
import {
  createReservation,
  ReservationError,
} from "../services/reservation-service.js";

type ReservationBody = {
  memberId: string;
  equipmentId: string;
  startsAt: string;
  durationMinutes: number;
};

const reservationRoutes: FastifyPluginAsync<{ db: DatabaseSync }> = async (
  app,
  { db },
) => {
  app.post<{
    Headers: { "x-organization-id": string };
    Body: ReservationBody;
  }>(
    "/reservations",
    {
      schema: {
        headers: {
          type: "object",
          required: ["x-organization-id"],
          properties: {
            "x-organization-id": { type: "string", minLength: 1 },
          },
        },
        body: {
          type: "object",
          required: ["memberId", "equipmentId", "startsAt", "durationMinutes"],
          properties: {
            memberId: { type: "string", minLength: 1 },
            equipmentId: { type: "string", minLength: 1 },
            startsAt: { type: "string", format: "date-time" },
            durationMinutes: { type: "number" },
          },
        },
      },
    },
    async (request, reply) => {
      const { memberId, equipmentId, startsAt, durationMinutes } = request.body;

      try {
        const reservation = createReservation(db, {
          organizationId: request.headers["x-organization-id"],
          memberId,
          equipmentId,
          startsAt: DateTime.fromISO(startsAt).toMillis(),
          durationMinutes,
        });

        return reply.code(201).send(reservation);
      } catch (error) {
        if (!(error instanceof ReservationError)) {
          throw error;
        }

        let status = 422;

        switch (error.code) {
          case "MEMBER_NOT_FOUND":
          case "EQUIPMENT_NOT_FOUND":
          case "RULES_NOT_FOUND":
            status = 404;
            break;
          case "MEMBER_TIME_CONFLICT":
          case "EQUIPMENT_TIME_CONFLICT":
          case "DAILY_LIMIT_EXCEEDED":
            status = 409;
            break;
        }

        return reply.code(status).send({
          code: error.code,
          message: error.message,
        });
      }
    },
  );
};

export default reservationRoutes;
