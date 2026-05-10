import { z } from "zod";

/** Same rules as onboarding — Unicode letters, numbers, underscore. */
export const usernameSchema = z
  .string()
  .trim()
  .min(3)
  .max(32)
  .regex(/^[\p{L}\p{N}_]+$/u);
