export type streamedChunk = {
    chunk?: string;
    error?: {
        message: string;
        name: string;
    }
}