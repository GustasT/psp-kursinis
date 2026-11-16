import { readFileSync } from "node:fs";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import type { FastifyInstance } from "fastify";
import { buildApp } from "../src/app.js";
import { openDatabase } from "../src/db/database.js";
import { seedDatabase } from "../src/db/seed.js";

describe("Treniruoklių duomenų atskyrimas", () => {
  let app: FastifyInstance;

  beforeEach(async () => {
    const db = openDatabase(":memory:");

    const schema = readFileSync(
      new URL("../src/db/schema.sql", import.meta.url),
      "utf8",
    );

    db.exec(schema);
    seedDatabase(db);

    app = buildApp(db);
    await app.ready();
  });

  afterEach(async () => {
    await app.close();
  });

  it.each(["club-a", "club-b"])(
    "%s gauna tik savo treniruoklius",
    async (organizationId) => {
      const response = await app.inject({
        method: "GET",
        url: "/equipment",
        headers: {
          "x-organization-id": organizationId,
        },
      });

      const equipment = response.json<Array<{ organization_id: string }>>();

      expect(response.statusCode).toBe(200);
      expect(equipment).toHaveLength(2);

      for (const item of equipment) {
        expect(item.organization_id).toBe(organizationId);
      }
    },
  );

  it("atmeta užklausą be organizacijos antraštės", async () => {
    const response = await app.inject({
      method: "GET",
      url: "/equipment",
    });

    expect(response.statusCode).toBe(400);
  });

  it("atmeta neegzistuojančią organizaciją", async () => {
    const response = await app.inject({
      method: "GET",
      url: "/equipment",
      headers: {
        "x-organization-id": "unknown",
      },
    });

    expect(response.statusCode).toBe(404);
    expect(response.json()).toEqual({
      error: "Sporto klubas nerastas.",
    });
  });
});
