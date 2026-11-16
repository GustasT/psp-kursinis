import type { FastifyPluginAsync } from "fastify";
import type { DatabaseSync } from "node:sqlite";
import { listEquipment } from "../repositories/equipment-repository.js";

type EquipmentRoutesOptions = {
  db: DatabaseSync;
};

const equipmentRoutes: FastifyPluginAsync<EquipmentRoutesOptions> = async (
  app,
  options,
) => {
  app.get<{ Headers: { "x-organization-id": string } }>(
    "/equipment",
    {
      schema: {
        headers: {
          type: "object",
          required: ["x-organization-id"],
          properties: {
            "x-organization-id": {
              type: "string",
              minLength: 1,
            },
          },
        },
      },
    },
    async (request, reply) => {
      const organizationId = request.headers["x-organization-id"];
      const equipment = listEquipment(options.db, organizationId);

      if (equipment === undefined) {
        return reply.code(404).send({
          error: "Sporto klubas nerastas.",
        });
      }

      return equipment;
    },
  );
};

export default equipmentRoutes;
