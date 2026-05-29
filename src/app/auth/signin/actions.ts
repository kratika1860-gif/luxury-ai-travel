"use server";
import { signIn, signOut } from "@/lib/auth";

export async function handleDeveloperSignIn() {
  try {
    await signIn("credentials", { 
      email: "test@example.com", 
      redirectTo: "/dashboard" 
    });
  } catch (error: any) {
    // NextAuth v5 uses redirects which throw errors under the hood, so we must re-throw them so Next.js handles the redirect correctly
    if (error.message === "NEXT_REDIRECT") {
      throw error;
    }
    throw error;
  }
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
