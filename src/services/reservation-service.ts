import type { DatabaseSync } from "node:sqlite";
import { findMember } from "../repositories/member-repository.js";
import { findEquipment } from "../repositories/equipment-repository.js";
import { findReservationRules } from "../repositories/rules-repository.js";
import {
  findReservationConflict,
  insertReservation,
  getReservedMinutes,
} from "../repositories/reservation-repository.js";
import { splitByDay } from "./reservation-time.js";

type ValidationResult = { valid: true } | { valid: false; reason: string };

export function validateDuration(
  durationMinutes: number,
  minMinutes: number,
  maxMinutes: number,
): ValidationResult {
  if (!Number.isInteger(durationMinutes)) {
    return {
      valid: false,
      reason: "Rezervacijos trukmė turi būti sveikas minučių skaičius.",
    };
  }

  if (durationMinutes < minMinutes || durationMinutes > maxMinutes) {
    return {
      valid: false,
      reason: `Rezervacijos trukmė turi būti nuo ${minMinutes} iki ${maxMinutes} min.`,
    };
  }

  return { valid: true };
}

export class ReservationError extends Error {
  constructor(
    public readonly code: string,
    message: string,
  ) {
    super(message);
    this.name = "ReservationError";
  }
}

type CreateReservationInput = {
  organizationId: string;
  memberId: string;
  equipmentId: string;
  startsAt: number;
  durationMinutes: number;
};

export function createReservation(
  db: DatabaseSync,
  input: CreateReservationInput,
  now = Date.now(),
) {
  const { organizationId, memberId, equipmentId, startsAt, durationMinutes } =
    input;

  const endsAt = startsAt + durationMinutes * 60_000;

  if (
    !Number.isSafeInteger(startsAt) ||
    Number.isNaN(new Date(startsAt).getTime()) ||
    Number.isNaN(new Date(endsAt).getTime()) ||
    startsAt < now
  ) {
    throw new ReservationError(
      "INVALID_START_TIME",
      "Pradžios laikas netinkamas arba jau praėjęs.",
    );
  }

  db.exec("BEGIN IMMEDIATE");

  try {
    const member = findMember(db, organizationId, memberId);

    if (!member) {
      throw new ReservationError("MEMBER_NOT_FOUND", "Narys nerastas.");
    }

    const equipment = findEquipment(db, organizationId, equipmentId);

    if (!equipment) {
      throw new ReservationError(
        "EQUIPMENT_NOT_FOUND",
        "Treniruoklis nerastas.",
      );
    }

    const rules = findReservationRules(db, organizationId);

    if (!rules) {
      throw new ReservationError(
        "RULES_NOT_FOUND",
        "Klubo rezervavimo taisyklės nerastos.",
      );
    }

    const durationResult = validateDuration(
      durationMinutes,
      rules.minDurationMinutes,
      rules.maxDurationMinutes,
    );

    if (!durationResult.valid) {
      throw new ReservationError("INVALID_DURATION", durationResult.reason);
    }

    for (const day of splitByDay(startsAt, endsAt)) {
      const reservedMinutes = getReservedMinutes(
        db,
        organizationId,
        memberId,
        day.dayStart,
        day.dayEnd,
      );

      if (reservedMinutes + day.minutes > member.dailyLimitMinutes) {
        throw new ReservationError(
          "DAILY_LIMIT_EXCEEDED",
          "Nepakanka dienos rezervavimo minučių.",
        );
      }
    }

    const conflict = findReservationConflict(
      db,
      organizationId,
      memberId,
      equipmentId,
      startsAt,
      endsAt,
    );

    if (conflict) {
      if (conflict.memberId === memberId) {
        throw new ReservationError(
          "MEMBER_TIME_CONFLICT",
          "Narys tuo metu jau turi rezervaciją.",
        );
      }

      throw new ReservationError(
        "EQUIPMENT_TIME_CONFLICT",
        "Treniruoklis tuo metu jau rezervuotas.",
      );
    }

    const reservation = insertReservation(db, {
      organizationId,
      memberId,
      equipmentId,
      startsAt,
      endsAt,
    });

    db.exec("COMMIT");

    return reservation;
  } catch (error) {
    db.exec("ROLLBACK");
    throw error;
  }
}
