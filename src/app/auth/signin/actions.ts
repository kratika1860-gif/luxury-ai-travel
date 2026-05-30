"use server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { setSessionCookie, removeSessionCookie, hashPassword, verifyPassword } from "@/lib/customAuth";

export async function handleCustomSignIn(email: string, password?: string) {
  const targetEmail = email.trim().toLowerCase();
  if (!targetEmail) {
    throw new Error("Email is required");
  }
  if (!password) {
    throw new Error("Password is required");
  }

  // Find user
  const user = await prisma.user.findUnique({
    where: { email: targetEmail }
  });

  if (!user) {
    throw new Error("No account found with this email. Please sign up first.");
  }

  // If the user was created during passwordless dev mode and has no password,
  // we save this password as their password to ease migration!
  if (!user.password) {
    const hashedPassword = hashPassword(password);
    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword }
    });
  } else {
    // Verify password
    const isValid = verifyPassword(password, user.password);
    if (!isValid) {
      throw new Error("Incorrect password. Please try again.");
    }
  }

  // Set secure HTTP-only cookie
  setSessionCookie({
    id: user.id,
    email: user.email,
    name: user.name || user.email.split("@")[0],
    image: user.image || "",
  });

  redirect("/dashboard");
}

export async function handleCustomSignUp(email: string, password?: string) {
  const targetEmail = email.trim().toLowerCase();
  if (!targetEmail) {
    throw new Error("Email is required");
  }
  if (!password || password.length < 6) {
    throw new Error("Password must be at least 6 characters long");
  }

  // Check if user already exists
  const existingUser = await prisma.user.findUnique({
    where: { email: targetEmail }
  });

  if (existingUser) {
    throw new Error("An account already exists with this email. Please sign in.");
  }

  const hashedPassword = hashPassword(password);
  const generatedName = targetEmail.split("@")[0].charAt(0).toUpperCase() + targetEmail.split("@")[0].slice(1);

  // Create user record in the database (but do not log in yet!)
  await prisma.user.create({
    data: {
      email: targetEmail,
      name: generatedName,
      password: hashedPassword,
      image: `https://avatar.iran.liara.run/public/${Math.floor(Math.random() * 99) + 1}`,
    }
  });

  return { success: true };
}

export async function handleSignOut() {
  removeSessionCookie();
  redirect("/auth/signin");
}
