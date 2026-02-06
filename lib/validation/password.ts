// Password validation utilities

export interface PasswordRequirement {
  label: string;
  test: (password: string) => boolean;
}

export const PASSWORD_REQUIREMENTS: PasswordRequirement[] = [
  { label: "At least 8 characters", test: (p) => p.length >= 8 },
  { label: "One uppercase letter", test: (p) => /[A-Z]/.test(p) },
  { label: "One lowercase letter", test: (p) => /[a-z]/.test(p) },
  { label: "One number", test: (p) => /[0-9]/.test(p) },
  { label: "One special character (!@#$%^&*)", test: (p) => /[!@#$%^&*(),.?":{}|<>]/.test(p) },
];

export type PasswordStrength = "weak" | "medium" | "strong";

export interface PasswordValidationResult {
  isValid: boolean;
  strength: PasswordStrength;
  passedCount: number;
  totalCount: number;
  errors: string[];
}

export function validatePassword(password: string): PasswordValidationResult {
  const passed = PASSWORD_REQUIREMENTS.filter((req) => req.test(password));
  const failed = PASSWORD_REQUIREMENTS.filter((req) => !req.test(password));
  const passedCount = passed.length;
  const totalCount = PASSWORD_REQUIREMENTS.length;

  let strength: PasswordStrength;
  if (passedCount <= 2) {
    strength = "weak";
  } else if (passedCount <= 4) {
    strength = "medium";
  } else {
    strength = "strong";
  }

  return {
    isValid: passedCount === totalCount,
    strength,
    passedCount,
    totalCount,
    errors: failed.map((req) => req.label),
  };
}

export function getStrengthColor(strength: PasswordStrength): string {
  switch (strength) {
    case "weak":
      return "#ef4444"; // red
    case "medium":
      return "#f59e0b"; // amber
    case "strong":
      return "#22c55e"; // green
  }
}

export function getStrengthLabel(strength: PasswordStrength): string {
  switch (strength) {
    case "weak":
      return "Weak";
    case "medium":
      return "Medium";
    case "strong":
      return "Strong";
  }
}
