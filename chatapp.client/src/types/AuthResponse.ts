export interface AuthData {
    userId: string;        // GUID string
    userName: string;
    isAdmin: boolean;
    token: string;
}

export interface AuthResponse {
    responseCode: number;
    message: string;
    data: AuthData;
    isSuccess: boolean;
}
