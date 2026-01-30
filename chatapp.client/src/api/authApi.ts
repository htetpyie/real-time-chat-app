import axiosClient from "./axiosClient";
import type { AuthResponse } from "../types/AuthResponse";
import type { RegisterResponse } from "../types/AuthResponse";

export const loginApi = (data: { username: string; password: string }) =>
    axiosClient.post<AuthResponse>("/auth/login", data);

export const registerApi = (data: { username: string; password: string;}) =>
    axiosClient.post<RegisterResponse>("/auth/register", data);
