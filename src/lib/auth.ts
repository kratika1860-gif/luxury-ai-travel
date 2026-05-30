import { getCustomSession } from "./customAuth";

export const auth = getCustomSession;

export const handlers = {
  GET: async () => new Response("OK"),
  POST: async () => new Response("OK"),
};

export const signIn = async () => {};
export const signOut = async () => {};
