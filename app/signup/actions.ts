"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { validatePassword } from "@/lib/validation/password";

export async function signup(formData: FormData) {
  const supabase = await createClient();

  const fullName = formData.get("full_name") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  // Basic field validation
  if (!fullName || !email || !password) {
    return { error: "All fields are required." };
  }

  // Validate full name
  if (fullName.trim().length < 2) {
    return { error: "Please enter your full name." };
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { error: "Please enter a valid email address." };
  }

  // Server-side password validation
  const passwordValidation = validatePassword(password);
  if (!passwordValidation.isValid) {
    return {
      error: `Password requirements not met: ${passwordValidation.errors.join(", ")}`,
    };
  }

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName.trim(),
      },
    },
  });

  if (error) {
    // Handle specific Supabase errors
    if (error.message.includes("already registered")) {
      return { error: "An account with this email already exists." };
    }
    return { error: error.message };
  }

  redirect("/onboarding");
}
