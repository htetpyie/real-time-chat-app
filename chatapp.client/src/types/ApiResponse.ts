export interface ApiResponse<T> {
    responseCode: number;
    message: string;
    data: T;
    isSuccess: boolean;
}