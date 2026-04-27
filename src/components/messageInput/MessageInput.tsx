"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./MessageInput.module.css";

type MessageInputProps = {
	onSend: (content: string) => Promise<void> | void;
	disabled: boolean;
	lockedValue?: string;
};

export default function MessageInput({ onSend, disabled, lockedValue }: MessageInputProps) {
	const textareaRef = useRef<HTMLTextAreaElement>(null);
    const isLocked = lockedValue !== undefined;
    const [isEmpty, setIsEmpty] = useState(true);

    useEffect(() => {
        const input = textareaRef.current;
        if (!input || !isLocked) return;
        input.value = lockedValue;
        input.style.height = "auto";
        input.style.height = `${input.scrollHeight}px`;
    }, [lockedValue, isLocked]);

	function handleInput() {
		const input = textareaRef.current;
		if (!input) return;
		input.style.height = "auto";
		input.style.height = `${input.scrollHeight}px`;
		setIsEmpty(input.value.trim() === "");
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
        const content = isLocked ? lockedValue! : input.value.trim();
        if (content === "") return;

		try {
			await onSend(content);
            if (!isLocked) {
                input.value = "";
                input.style.height = "auto";
            }
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
				readOnly={isLocked}
				onInput={handleInput}
                onKeyDown={handleKeyDown}
			/>
            <button 
                className={styles.sendButton} 
                type="button" 
                onClick={() => void handleSend()} 
                disabled={disabled || (isLocked ? lockedValue === "" : isEmpty)}
            >
                Send
            </button>
		</div>
	);
}
