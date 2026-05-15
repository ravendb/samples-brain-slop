"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./MessageInput.module.css";
import SpeechButton from "./SpeechButton";

type MessageInputProps = {
    onSend: (content: string) => Promise<void> | void;
    disabled: boolean;
    chatId: string | null;
};

export default function MessageInput({ onSend, disabled, chatId }: MessageInputProps) {
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const [isEmpty, setIsEmpty] = useState(true);
    const [isConnecting, setIsConnecting] = useState(false);
    const [isRecording, setIsRecording] = useState(false);
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const recognitionRef = useRef<SpeechRecognition | null>(null);

    const storageKey = `chat-draft-${chatId ?? "new"}`;

    useEffect(() => {
        const input = textareaRef.current;
        if (!input) return;

        const saved = localStorage.getItem(storageKey);
        input.value = saved ?? "";
        input.style.height = "auto";
        if (input.value) input.style.height = `${input.scrollHeight}px`;

        setIsEmpty(input.value.trim() === "");
    }, [storageKey]);

    useEffect(() => () => { recognitionRef.current?.stop(); }, []);

    function syncInputState() {
        const input = textareaRef.current;
        if (!input) return;
        
        input.style.height = "auto";
        input.style.height = `${input.scrollHeight}px`;
        setIsEmpty(input.value.trim() === "");

        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => {
            localStorage.setItem(storageKey, input.value);
        }, 300);
    }

    function handleKeyDown(event: React.KeyboardEvent<HTMLTextAreaElement>) {
        if (event.key === "Enter" && !event.shiftKey) {
            event.preventDefault();
            void handleSend();
        }
    }

    async function handleSend() {
        const input = textareaRef.current;
        if (!input || disabled) return;
        const content = input.value.trim();
        if (content === "") return;

        try {
            await onSend(content);
            input.value = "";
            input.style.height = "auto";
            setIsEmpty(true);
            localStorage.removeItem(storageKey);
        } catch (error) {
            console.error("Error sending message:", error);
        }
    }

    function startRecording() {
        const recognition = new window.webkitSpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = true;
        recognition.lang = "en-US";

        recognition.onresult = (event: SpeechRecognitionEvent) => {
            let finalTranscript = "";
            let interimTranscript = "";
            for (let i = 0; i < event.results.length; i++) {
                const result = event.results[i];
                if (result.isFinal) {
                    finalTranscript += result[0].transcript;
                } else {
                    interimTranscript += result[0].transcript;
                }
            }
            const input = textareaRef.current;
            if (input) {
                input.value = finalTranscript + interimTranscript;
                syncInputState();
            }
        };

        recognition.onstart = () => { setIsConnecting(false); setIsRecording(true); };
        recognition.onend = () => stopRecording();
        recognition.onerror = () => stopRecording();

        recognitionRef.current = recognition;
        recognition.start();
        setIsConnecting(true);
    }

    function stopRecording() {
        const recognition = recognitionRef.current;
        recognitionRef.current = null;
        recognition?.stop();
        setIsConnecting(false);
        setIsRecording(false);
        textareaRef.current?.focus();
    }

    return (
        <div className={styles.inputRow}>
            <textarea
                ref={textareaRef}
                className={styles.input}
                placeholder="Message..."
                rows={1}
                disabled={disabled}
                onInput={syncInputState}
                onKeyDown={handleKeyDown}
            />
            {isEmpty || isConnecting || isRecording ? (
                <SpeechButton
                    isConnecting={isConnecting}
                    isRecording={isRecording}
                    onStart={startRecording}
                    onStop={stopRecording}
                    disabled={disabled}
                />
            ) : (
                <button
                    className={styles.sendButton}
                    type="button"
                    onClick={() => void handleSend()}
                    disabled={disabled}
                >
                    Send
                </button>
            )}
        </div>
    );
}
