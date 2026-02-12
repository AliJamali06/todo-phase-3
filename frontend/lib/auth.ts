/**
 * Frontend Auth Utility
 * Uses HTTP-only cookies for authentication
 * No manual JWT handling - cookies are managed by the browser
 */

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "https://dostali-todo-phase-2.hf.space";

export interface User {
  id: string;
  email: string;
  name?: string;
}

export interface LoginParams {
  email: string;
  password: string;
}

export interface SignupParams {
  email: string;
  password: string;
  name?: string;
}

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
}

/**
 * Login user with email and password
 * Cookie is set automatically via HTTP-only response
 */
export async function login({ email, password }: LoginParams): Promise<ApiResponse<{ user: User }>> {
  const response = await fetch(`${BACKEND_URL}/api/auth/signin`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include", // Required for cookies
    body: JSON.stringify({ email, password }),
  });

  return response.json();
}

/**
 * Register new user
 * Cookie is set automatically via HTTP-only response
 */
export async function signup({ email, password, name }: SignupParams): Promise<ApiResponse<{ user: User }>> {
  const response = await fetch(`${BACKEND_URL}/api/auth/signup`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include", // Required for cookies
    body: JSON.stringify({ email, password, name }),
  });

  return response.json();
}

/**
 * Logout user
 * Clears the auth cookie
 */
export async function logout(): Promise<ApiResponse<null>> {
  const response = await fetch(`${BACKEND_URL}/api/auth/signout`, {
    method: "POST",
    credentials: "include", // Required for cookies
  });

  return response.json();
}

/**
 * Get current authenticated user
 * Uses cookie for authentication - no manual token needed
 */
export async function getCurrentUser(): Promise<ApiResponse<{ user: User }>> {
  const response = await fetch(`${BACKEND_URL}/api/auth/me`, {
    method: "GET",
    credentials: "include", // Required for cookies
  });

  return response.json();
}

/**
 * Check if user is authenticated
 * Returns true if /me endpoint returns success
 */
export async function isAuthenticated(): Promise<boolean> {
  try {
    const response = await getCurrentUser();
    return response.success === true;
  } catch {
    return false;
  }
}
