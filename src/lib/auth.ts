import api from "@/lib/api";
import { User } from "@/types/auth";

/** GET /api/Users/me - fetches the current authenticated user's profile */
export const getCurrentUserApiCall = async (): Promise<
  | { success: true; user: User }
  | { success: false; error: string }
> => {
  try {
    const response = await api.get("/api/Users/me");
    const user = response.data?.result ?? response.data;
    return { success: true, user };
  } catch (error: unknown) {
    const err = error as { response?: { data?: { message?: string } } };
    return { success: false, error: err.response?.data?.message ?? "Failed to fetch user profile" };
  }
};




/** POST /api/Auth/refresh-token - returns { accessToken, expiresAt } */

export const axiosRefreshTokenCall = async () => {
  const response = await api.post("/api/Auth/refresh-token");
  if (response.status === 200) {
    return response.data.accessToken ?? response.data.AccessToken;
  }
  throw new Error("Failed to refresh token");
};

/** POST /api/Auth/login - body: { email, password }, response: { accessToken, expiresAt, user } */
export const loginApiCall = async (
  email: string,
  password: string
): Promise<
  | { success: true; accessToken: string; user: User; expiresAt: string }
  | { success: false; error: string }
> => {
  try {
    const response = await api.post("/api/Auth/login", { email, password });
    // Backend wraps payload in result: { statusCode, isSuccess, message, result: { accessToken, expiresAt, user } }
    const data = response.data?.result ?? response.data;
    const accessToken = data.accessToken ?? data.AccessToken;
    const expiresAt = data.expiresAt ?? data.ExpiresAt;
    const user = data.user ?? data.User;
    if (!accessToken || !user) {
      return { success: false, error: "Invalid login response" };
    }
    return { success: true, accessToken, user, expiresAt: expiresAt ?? "" };
  } catch (error: unknown) {
    const err = error as { response?: { data?: { message?: string } } };
    const message = err.response?.data?.message ?? "Unexpected error during login!";
    return { success: false, error: message };
  }
};

/** POST /api/Users/register - FormData: fullName, userName, email, password, profileImage (optional) */
export const registerApiCall = async (
  formData: FormData
): Promise<{ success: boolean; data?: unknown; error?: string }> => {
  try {
    const response = await api.post("/api/Users/register", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return { success: true, data: response.data };
  } catch (error: unknown) {
    const err = error as { response?: { data?: { errors?: string | string[] } } };
    const raw = err.response?.data?.errors;
    const errorMessage = Array.isArray(raw) ? raw.join(" ") : typeof raw === "string" ? raw : "Registration failed!";
    return { success: false, error: errorMessage };
  }
};

/** POST /api/Auth/logout - body: { logoutAllDevices?: boolean } */
export const logoutApiCall = async (
  logoutAllDevices = false
): Promise<{ success: true } | { success: false; error: string }> => {
  try {
    console.log("Sending logout request to backend...");
    const response = await api.post("/api/Auth/logout", { logoutAllDevices });
    console.log("Backend logout response:", response.status);
    return { success: true };
  } catch (error: unknown) {

    const err = error as {
      response?: { data?: { message?: string }; status?: number };
    };
    if (err.response?.status === 404) {
      return {
        success: false,
        error: "Session expired or invalid logout endpoint (Backend Redirect Issue)",
      };
    }
    return {
      success: false,
      error: err.response?.data?.message ?? "Logout failed",
    };
  }
};

/** POST /api/Auth/forgot-password - body: { email } */
export const forgetPasswordApiCall = async (
  email: string
): Promise<{ success: true } | { success: false; error: string }> => {
  try {
    await api.post("/api/Auth/forgot-password", { email });
    return { success: true };
  } catch (error: unknown) {
    const err = error as { response?: { data?: { message?: string } } };
    return { success: false, error: err.response?.data?.message ?? "Request failed" };
  }
};

/** POST /api/Auth/reset-password - body: { email, token, newPassword, confirmPassword } */
export const resetPasswordApiCall = async (
  email: string,
  token: string,
  newPassword: string,
  confirmPassword: string
): Promise<void | { success: false; error: string }> => {
  try {
    await api.post("/api/Auth/reset-password", {
      email,
      token,
      newPassword,
      confirmPassword,
    });
  } catch (error: unknown) {
    const err = error as { response?: { data?: { message?: string } } };
    return { success: false, error: err.response?.data?.message ?? "Reset password failed" };
  }
};

/** POST /api/Auth/resend-confirmation - body: { email } */
export const sendVerificationEmailApiCall = async (
  email: string
): Promise<{ success: true; message?: string } | { success: false; error: string }> => {
  try {
    const response = await api.post("/api/Auth/resend-confirmation", { email });
    return { success: true, message: response.data?.message };
  } catch (error: unknown) {
    const err = error as { response?: { data?: { message?: string } } };
    return { success: false, error: err.response?.data?.message ?? "Request failed" };
  }
};

/** POST /api/Auth/resend-reset-token - body: { email } */
export const resendResetPasswordTokenApiCall = async (
  email: string
): Promise<{ success: true; message?: string } | { success: false; error: string }> => {
  try {
    const response = await api.post("/api/Auth/resend-reset-token", { email });
    return { success: true, message: response.data?.message };
  } catch (error: unknown) {
    const err = error as { response?: { data?: { message?: string } } };
    return { success: false, error: err.response?.data?.message ?? "Request failed" };
  }
};
/** POST /api/Auth/social-login - body: { email, name, provider, providerId } */
export const socialLoginApiCall = async (data: {
  email?: string | null;
  name?: string | null;
  provider: string;
  providerId: string;
}): Promise<
  | { success: true; accessToken: string; user: User; expiresAt: string }
  | { success: false; error: string }
> => {
  try {
    const url = "/api/Auth/social-login";
    console.log(`Sending Social Login request to: ${url}`);
    const response = await api.post(url, data);
    console.log("Social Login Backend Response:", response.status);
    
    const result = response.data?.result ?? response.data;
    
    return {
      success: true,
      accessToken: result.accessToken ?? result.AccessToken,
      user: result.user ?? result.User,
      expiresAt: result.expiresAt ?? result.ExpiresAt ?? "",
    };
  } catch (error: any) {
    console.error("Social login API call failed:");
    if (error.response) {
      console.error("Data:", error.response.data);
      console.error("Status:", error.response.status);
    } else {
      console.error("Message:", error.message);
    }
    return { success: false, error: error.response?.data?.message ?? "Social login failed" };
  }

};
