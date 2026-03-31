import { SendMessageResult } from "@/models/chat";

const decoder = new TextDecoder();

type StreamReader = ReadableStreamDefaultReader<Uint8Array<ArrayBuffer>>;

export async function decodeStream(reader: StreamReader, onChunk: (chunk: string) => void, onFinalResult: (result: SendMessageResult) => void) {
    let isStreamOver = false;
    while (!isStreamOver) {
        const { done, value } = await reader.read();
        isStreamOver = done;

        if (value) {
            decodeStreamMessage(value, done, onChunk, onFinalResult);
        }
    }
}
 
function decodeStreamMessage(
    value: Uint8Array, 
    done: boolean, 
    onChunk: (chunk: string) => void,
    onFinalResult: (result: SendMessageResult) => void
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
                onFinalResult(parsed as SendMessageResult);
            }
        }
        catch (err) {
            throw new Error('Failed to parse message.')
        }
    }
}