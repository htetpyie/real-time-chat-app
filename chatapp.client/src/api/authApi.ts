import axiosClient from "./axiosClient";
import type { AuthData } from "../types/AuthResponse";
import type { ApiResponse } from "../types/ApiResponse";

export const loginApi = (data: { username: string; password: string }) =>
    axiosClient.post<ApiResponse<AuthData>>("/auth/login", data);

export const registerApi = (data: { username: string; password: string;}) =>
    axiosClient.post<ApiResponse<string>>("/auth/register", data);
