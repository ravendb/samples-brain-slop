import { SendMessageResult } from "@/models/chat";

const decoder = new TextDecoder();

type StreamReader = ReadableStreamDefaultReader<Uint8Array<ArrayBuffer>>;

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
                const errPayload = JSON.stringify({ error: "Failed to send message." });
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
        try {
            const parsed = JSON.parse(chunk);
            if (parsed.error) {
                throw new Error(parsed.error);
            }
            else if (parsed.chunk) {
                onChunk(parsed.chunk);
            }
            else {
                onFinalResult(parsed as T);
            }
        }
        catch (err) {
            throw new Error('Failed to parse message.')
        }
    }
}