"use server";
import { signIn, signOut } from "@/lib/auth";

export async function handleDeveloperSignIn(email: string) {
  await signIn("credentials", { 
    email: email.trim(), 
    redirectTo: "/dashboard" 
  });
}

export async function handleSignOut() {
  try {
    await signOut({ redirectTo: "/auth/signin" });
  } catch (error: any) {
    if (error.message === "NEXT_REDIRECT") {
      throw error;
    }
    throw error;
  }
}
