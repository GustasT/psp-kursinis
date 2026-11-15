import { describe, expect, it } from "vitest";
import { validateDuration } from "../src/services/reservation-service.js";

describe("Rezervacijos trukmės tikrinimas", () => {
  it("priima trukmę leistinose ribose", () => {
    const result = validateDuration(20, 5, 30);

    expect(result).toEqual({ valid: true });
  });

  it.each([5, 30])("priima ribinę %i min. trukmę", (duration) => {
    const result = validateDuration(duration, 5, 30);

    expect(result).toEqual({ valid: true });
  });

  it.each([4, 31])("atmeta %i min. trukmę už ribų", (duration) => {
    const result = validateDuration(duration, 5, 30);

    expect(result).toEqual({
      valid: false,
      reason: "Rezervacijos trukmė turi būti nuo 5 iki 30 min.",
    });
  });

  it("atmeta trupmeninį minučių skaičių", () => {
    const result = validateDuration(10.5, 5, 30);

    expect(result).toEqual({
      valid: false,
      reason: "Rezervacijos trukmė turi būti sveikas minučių skaičius.",
    });
  });
});
