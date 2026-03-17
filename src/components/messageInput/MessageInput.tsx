"use client";

import { useRef } from "react";
import styles from "./MessageInput.module.css";

type MessageInputProps = {
	chatId: string;
};

async function sendMessage(chatId: string, content: string) {
    const response = await fetch("/api/chat/message", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ chatId, content }),
    });

    if (!response.ok) {
        throw new Error(`Failed to send message: ${response.status}`);
    }

    console.log(await response.text());
}

export default function MessageInput({ chatId }: MessageInputProps) {
	const textareaRef = useRef<HTMLTextAreaElement>(null);

	function handleInput() {
		const input = textareaRef.current;
		if (!input) return;
		input.style.height = "auto";
		input.style.height = `${input.scrollHeight}px`;
	}

	function handleKeyDown(event: React.KeyboardEvent<HTMLTextAreaElement>) {
		if (event.key === 'Enter' && !event.shiftKey) {
			event.preventDefault();
			handleSend();
		}
	}

	function handleSend() {
        const input = textareaRef.current;
        if (!input) return;
        const content = input.value.trim();
        if (content === "") return;

		try {
            sendMessage(chatId, content);
			input.value = "";
			input.style.height = "auto";
		} catch (error) {
			console.error("Error sending message:", error);
		}
    }

	return (
		<div className={styles.inputRow}>
			<textarea
				ref={textareaRef}
				className={styles.input}
				placeholder="Message..."
				rows={1}
				onInput={handleInput}
                onKeyDown={handleKeyDown}
			/>
			<button className={styles.sendButton} type="button" onClick={handleSend}>
				Send
			</button>
		</div>
	);
}
