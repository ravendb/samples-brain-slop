"use client";

import { useRef } from "react";
import styles from "./MessageInput.module.css";

export default function MessageInput() {
	const textareaRef = useRef<HTMLTextAreaElement>(null);

	function handleInput() {
		const el = textareaRef.current;
		if (!el) return;
		el.style.height = "auto";
		el.style.height = `${el.scrollHeight}px`;
	}

	return (
		<div className={styles.inputRow}>
			<textarea
				ref={textareaRef}
				className={styles.input}
				placeholder="Message..."
				rows={1}
				onInput={handleInput}
			/>
			<button className={styles.sendButton} type="button">Send</button>
		</div>
	);
}
