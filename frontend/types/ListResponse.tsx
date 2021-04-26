export interface ListResponse<T extends {}> {
    results: T[];
    total_size: number;
    size: number;
}