import { readFileSync } from "node:fs";
import type { DatabaseSync } from "node:sqlite";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { openDatabase } from "../src/db/database.js";
import { seedDatabase } from "../src/db/seed.js";
import { createReservation } from "../src/services/reservation-service.js";
import {
  getReservedMinutes,
  listMemberReservations,
} from "../src/repositories/reservation-repository.js";
import { splitByDay } from "../src/services/reservation-time.js";

describe("Rezervacijos sukūrimas", () => {
  let db: DatabaseSync;

  const now = Date.parse("2026-11-25T08:00:00+02:00");

  const defaultInput = {
    organizationId: "club-a",
    memberId: "member-1",
    equipmentId: "equipment-1",
    startsAt: Date.parse("2026-11-26T14:00:00+02:00"),
    durationMinutes: 20,
  };

  beforeEach(() => {
    db = openDatabase(":memory:");

    const schema = readFileSync(
      new URL("../src/db/schema.sql", import.meta.url),
      "utf8",
    );

    db.exec(schema);
    seedDatabase(db);
  });

  afterEach(() => {
    db.close();
  });

  it("sukuria ir išsaugo tinkamą rezervaciją", () => {
    const reservation = createReservation(db, defaultInput, now);

    expect(reservation).toMatchObject({
      organizationId: "club-a",
      memberId: "member-1",
      equipmentId: "equipment-1",
      startsAt: defaultInput.startsAt,
      endsAt: defaultInput.startsAt + 20 * 60_000,
      status: "CONFIRMED",
    });

    expect(reservation.id).toEqual(expect.any(String));

    const saved = listMemberReservations(db, "club-a", "member-1");

    expect(saved).toHaveLength(1);
    expect(saved[0]).toMatchObject({
      id: reservation.id,
      status: "CONFIRMED",
    });
  });

  it("neleidžia kitam nariui rezervuoti užimto treniruoklio", () => {
    createReservation(db, defaultInput, now);

    expect(() =>
      createReservation(
        db,
        {
          ...defaultInput,
          memberId: "member-2",
        },
        now,
      ),
    ).toThrowError("Treniruoklis tuo metu jau rezervuotas.");

    expect(listMemberReservations(db, "club-a", "member-2")).toHaveLength(0);
  });

  it("neleidžia nariui vienu metu rezervuoti dviejų treniruoklių", () => {
    createReservation(db, defaultInput, now);

    expect(() =>
      createReservation(
        db,
        {
          ...defaultInput,
          equipmentId: "equipment-2",
        },
        now,
      ),
    ).toThrowError("Narys tuo metu jau turi rezervaciją.");

    expect(listMemberReservations(db, "club-a", "member-1")).toHaveLength(1);
  });

  it("atmeta neegzistuojantį treniruoklį ir nieko neišsaugo", () => {
    expect(() =>
      createReservation(
        db,
        {
          ...defaultInput,
          equipmentId: "unknown",
        },
        now,
      ),
    ).toThrowError("Treniruoklis nerastas.");

    expect(listMemberReservations(db, "club-a", "member-1")).toHaveLength(0);
  });

  it("leidžia pasiekti 60 min. limitą, bet neleidžia jo viršyti", () => {
    createReservation(
      db,
      {
        ...defaultInput,
        durationMinutes: 30,
      },
      now,
    );

    createReservation(
      db,
      {
        ...defaultInput,
        startsAt: Date.parse("2026-11-26T15:00:00+02:00"),
        durationMinutes: 30,
      },
      now,
    );

    expect(() =>
      createReservation(
        db,
        {
          ...defaultInput,
          startsAt: Date.parse("2026-11-26T16:00:00+02:00"),
          durationMinutes: 5,
        },
        now,
      ),
    ).toThrowError("Nepakanka dienos rezervavimo minučių.");

    expect(listMemberReservations(db, "club-a", "member-1")).toHaveLength(2);
  });

  it("per vidurnaktį minutes paskirsto abiem dienoms", () => {
    createReservation(
      db,
      {
        ...defaultInput,
        durationMinutes: 30,
      },
      now,
    );

    createReservation(
      db,
      {
        ...defaultInput,
        startsAt: Date.parse("2026-11-26T15:00:00+02:00"),
        durationMinutes: 20,
      },
      now,
    );

    const reservation = createReservation(
      db,
      {
        ...defaultInput,
        startsAt: Date.parse("2026-11-26T23:55:00+02:00"),
        durationMinutes: 20,
      },
      now,
    );

    const days = splitByDay(reservation.startsAt, reservation.endsAt);

    expect(days.map((day) => day.minutes)).toEqual([5, 15]);

    const reservedMinutes = days.map((day) =>
      getReservedMinutes(db, "club-a", "member-1", day.dayStart, day.dayEnd),
    );

    expect(reservedMinutes).toEqual([55, 15]);
  });
});
