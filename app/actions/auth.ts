// app/actions/auth.ts
"use server";

import { hash } from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const RegisterSchema = z
  .object({
    name: z.string().trim().min(2, "Name must be at least 2 characters").max(80),
    email: z.string().trim().toLowerCase().email("Enter a valid email address"),
    password: z.string().min(8, "Password must be at least 8 characters").max(100),
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type AuthActionState = {
  success?: boolean;
  message?: string;
  errors?: Record<string, string[]>;
} | null;

export async function registerUser(
  _prevState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const parsed = RegisterSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });

  if (!parsed.success) {
    return {
      success: false,
      message: "Please fix the errors below.",
      errors: parsed.error.flatten().fieldErrors,
    };
  }

  const { name, email, password } = parsed.data;

  try {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return {
        success: false,
        message: "An account with this email already exists.",
        errors: { email: ["This email is already registered."] },
      };
    }

    const passwordHash = await hash(password, 12);
    await prisma.user.create({
      data: { name, email, passwordHash, role: "CLIENT" },
    });

    return { success: true, message: "Account created. You can now sign in." };
  } catch (error) {
    console.error("[registerUser]", error);
    return { success: false, message: "Something went wrong. Please try again." };
  }
}