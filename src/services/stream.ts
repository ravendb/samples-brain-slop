import { streamedChunk } from "@/models/stream";

const decoder = new TextDecoder();

type StreamReader = ReadableStreamDefaultReader<Uint8Array<ArrayBuffer>>;

function isInvalidApiKeyError(message: string) {
    return /401|unauthorized|invalid.*api.*key/i.test(message);
}

function isConnectionRefusedError(err: Error) {
    return (err as NodeJS.ErrnoException).code === "ECONNREFUSED" || err.message.includes("ECONNREFUSED");
}

function formatDBNotFoundErrorMessage(message: string) {
    const firstLine = message.split("\n")[0].trim();
    const colonIdx = firstLine.indexOf(": ");
    return colonIdx !== -1 ? firstLine.slice(colonIdx + 2) : firstLine;
}

export function encodeStream<T>(streamingFunction: (onChunk: (chunk: string) => void) => Promise<T>) {
    const encoder = new TextEncoder();
    return new ReadableStream({
        async start(controller) {
            try {
                const result = await streamingFunction((chunk) => {
                    const payload = JSON.stringify({ chunk });
                    controller.enqueue(encoder.encode(payload + "\n"));
                });

                const finalPayload = JSON.stringify(result);
                controller.enqueue(encoder.encode(finalPayload + "\n"));
                controller.close();
            } catch (err) {
                let message = "Failed to send message.";
                let errorName = "Error";

                if (err instanceof Error) {
                    errorName = err.name;
                    if (err.name === "DatabaseDoesNotExistException") {
                        message = formatDBNotFoundErrorMessage(err.message);
                    } else if (isConnectionRefusedError(err)) {
                        message = "Cannot reach RavenDB. Is the server running?";
                        errorName = "ConnectionRefusedException";
                    } else if (isInvalidApiKeyError(err.message)) {
                        message = "Invalid OpenAI API key.";
                        errorName = "InvalidApiKeyException";
                    }
                }

                const errPayload = JSON.stringify({
                    error: {
                        message,
                        name: errorName
                    }
                });
                controller.enqueue(encoder.encode(errPayload + "\n"));
                controller.close();
            }
        }
    });
}

export async function decodeStream<T>(reader: StreamReader, onChunk: (chunk: string) => void, onFinalResult: (result: T) => void) {
    let isStreamOver = false;
    while (!isStreamOver) {
        const { done, value } = await reader.read();
        isStreamOver = done;

        if (value) {
            decodeStreamMessage(value, done, onChunk, onFinalResult);
        }
    }
}

function decodeStreamMessage<T>(
    value: Uint8Array,
    done: boolean,
    onChunk: (chunk: string) => void,
    onFinalResult: (result: T) => void
) {
    const text = decoder.decode(value, { stream: !done });
    const chunks = text.split("\n").filter(line => line.trim() !== "");

    for (const chunk of chunks) {
        let parsedChunk: streamedChunk;
        try {
            parsedChunk = JSON.parse(chunk);
        } catch {
            throw new Error('Failed to parse message.');
        }

        if (parsedChunk.error) {
            const err = new Error(parsedChunk.error.message);
            err.name = parsedChunk.error.name;
            throw err;
        } else if (parsedChunk.chunk) {
            onChunk(parsedChunk.chunk);
        } else {
            onFinalResult(parsedChunk as T);
        }
    }
}
