import { ApiResponse, User } from "./types";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export async function signUp(
  email: string,
  password: string,
  name?: string
): Promise<ApiResponse<{ user: User }>> {
  const res = await fetch(`${API_URL}/api/auth/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ email, password, name }),
  });
  return res.json();
}

export async function signIn(
  email: string,
  password: string
): Promise<ApiResponse<{ user: User }>> {
  const res = await fetch(`${API_URL}/api/auth/signin`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ email, password }),
  });
  return res.json();
}

export async function signOut(): Promise<ApiResponse<null>> {
  const res = await fetch(`${API_URL}/api/auth/signout`, {
    method: "POST",
    credentials: "include",
  });
  return res.json();
}
