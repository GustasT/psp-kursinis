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
