"use client";

import { useRef } from "react";
import styles from "./MessageInput.module.css";

type MessageInputProps = {
	onSend: (content: string) => Promise<void> | void;
	disabled: boolean;
};

export default function MessageInput({ onSend, disabled }: MessageInputProps) {
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
				disabled={disabled}
				onInput={handleInput}
                onKeyDown={handleKeyDown}
			/>
			<button className={styles.sendButton} type="button" onClick={() => void handleSend()}>
				Send
			</button>
		</div>
	);
}
