"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  AuthResponse,
  LoginCredentials,
  SignupCredentials,
  SignupResponseData,
} from "../types";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export function useAuth() {
  const queryClient = useQueryClient();
  const router = useRouter();

  const loginMutation = useMutation<
    AuthResponse<null>,
    Error,
    LoginCredentials
  >({
    mutationFn: async ({ email, password }) => {
      console.log("useAuth: Sending login request:", { email });
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
        credentials: "include",
      });
      console.log("useAuth: Login response status:", response.status);
      if (!response.ok) {
        const errorData = await response.json();
        console.error("useAuth: Login error data:", errorData);
        throw new Error(errorData.message || "Login failed");
      }
      const data = await response.json();
      console.log("useAuth: Login response data:", data);
      localStorage.setItem("access_token", data.data.access_token);
      return data;
    },
    onSuccess: async () => {
      console.log("useAuth: Login success, verifying auth");
      const response = await fetch(`${API_BASE_URL}/auth/profile`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });
      console.log("useAuth: /auth/profile status:", response.status);
      if (response.ok) {
        console.log("useAuth: Authenticated, redirecting to /dashboard");
        toast.success("Login successful", {
          style: {
            backgroundColor: "green",
            color: "white",
          },
        });
        queryClient.invalidateQueries({ queryKey: ["profile"] });
        window.location.href = "/dashboard";
      } else {
        console.error("useAuth: Authentication failed:", await response.text());
        toast.error("Authentication failed", {
          style: {
            backgroundColor: "red",
            color: "white",
          },
        });
      }
    },
    onError: (error) => {
      console.error("useAuth: Login error:", error.message);
      toast.error(error.message || "Login failed", {
        style: {
          backgroundColor: "red",
          color: "white",
        },
      });
    },
  });

  const signupMutation = useMutation<
    AuthResponse<SignupResponseData>,
    Error,
    SignupCredentials
  >({
    mutationFn: async ({ email, password, confirmPassword, name }) => {
      console.log("useAuth: Sending signup request:", { email, name });
      const response = await fetch(`${API_BASE_URL}/auth/signup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password, confirmPassword, name }),
        credentials: "include",
      });
      console.log("useAuth: Signup response status:", response.status);
      if (!response.ok) {
        const errorData = await response.json();
        console.error("useAuth: Signup error data:", errorData);
        throw new Error(
          errorData?.errors?.[0] || errorData.message || "Sign Up failed"
        );
      }
      const data = await response.json();
      console.log("useAuth: Signup response data:", data);
      return data;
    },
    onSuccess: async () => {
      console.log("useAuth: Signup success, verifying auth");
      const response = await fetch(`${API_BASE_URL}/auth/profile`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });
      console.log("useAuth: /auth/profile status:", response.status);
      if (response.ok) {
        console.log("useAuth: Authenticated, redirecting to /dashboard");
        toast.success("Signup successful", {
          style: {
            backgroundColor: "green",
            color: "white",
          },
        });
        queryClient.invalidateQueries({ queryKey: ["profile"] });
        window.location.href = "/dashboard";
      } else {
        console.error("useAuth: Authentication failed:", await response.text());
        toast.error("Authentication failed", {
          style: {
            backgroundColor: "red",
            color: "white",
          },
        });
      }
    },
    onError: (error) => {
      console.error("useAuth: Signup error:", error.message);
      toast.error(error.message || "Sign Up failed", {
        style: {
          backgroundColor: "red",
          color: "white",
        },
      });
    },
  });

  const logoutMutation = useMutation<AuthResponse<null>, Error, void>({
    mutationFn: async () => {
      console.log("useAuth: Sending logout request");
      const response = await fetch(`${API_BASE_URL}/auth/logout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });
      console.log("useAuth: Logout response status:", response.status);
      if (!response.ok) {
        const errorData = await response.json();
        console.error("useAuth: Logout error data:", errorData);
        throw new Error(errorData.message || "Logout failed");
      }
      const data = await response.json();
      console.log("useAuth: Logout response data:", data);
      return data;
    },
    onSuccess: () => {
      console.log("useAuth: Logout success");
      localStorage.removeItem("access_token");
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      queryClient.removeQueries({ queryKey: ["profile"] });
      toast.success("Logout successful", {
        style: {
          backgroundColor: "green",
          color: "white",
        },
      });
      router.push("/auth/login");
    },
    onError: (error) => {
      console.error("useAuth: Logout error:", error.message);
      toast.error(error.message || "Logout failed", {
        style: {
          backgroundColor: "red",
          color: "white",
        },
      });
    },
  });

  return {
    login: loginMutation.mutate,
    loginStatus: {
      isPending: loginMutation.isPending,
      isSuccess: loginMutation.isSuccess,
      isError: loginMutation.isError,
      error: loginMutation.error,
      data: loginMutation.data,
    },
    signup: signupMutation.mutate,
    signupStatus: {
      isPending: signupMutation.isPending,
      isSuccess: signupMutation.isSuccess,
      isError: signupMutation.isError,
      error: signupMutation.error,
      data: signupMutation.data,
    },
    logout: logoutMutation.mutate,
    logoutStatus: {
      isPending: logoutMutation.isPending,
      isSuccess: logoutMutation.isSuccess,
      isError: logoutMutation.isError,
      error: logoutMutation.error,
      data: logoutMutation.data,
    },
  };
}
