"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Chat } from "@/models/chat";
import styles from "./ConversationSidebar.module.css";

async function deleteChat(chatId: string): Promise<void> {
	const response = await fetch(`/api/chat/${encodeURIComponent(chatId)}`, {
		method: "DELETE",
	});

	if (!response.ok) {
		throw new Error("Failed to delete chat");
	}
}

type ConversationItemProps = {
	chat: Chat;
	isActive: boolean;
	onDelete: (chatId: string) => void;
};

export default function ConversationItem({ chat, isActive, onDelete }: ConversationItemProps) {
	const router = useRouter();
	const [isDeleting, setIsDeleting] = useState(false);

	async function handleDelete() {
		const title = chat.title.trim() || "this chat";
		const shouldDelete = window.confirm(
			`Delete ${title}? This cannot be undone.`
		);

		if (!shouldDelete) {
			return;
		}

		setIsDeleting(true);

		try {
			await deleteChat(chat.id);
			onDelete(chat.id);

			if (isActive) {
				router.push("/chat/new");
			}
		} catch (error) {
			console.error("Failed to delete chat:", error);
			setIsDeleting(false);
		}
	}

	return (
		<li
			className={`${styles.item} ${isActive ? styles.itemActive : ""}`.trim()}
		>
			<div className={styles.itemRow}>
				<Link
					href={`/chat/${encodeURIComponent(chat.id)}`}
					className={styles.itemLink}
				>
					<p className={styles.itemTitle}>{chat.title}</p>
					<span className={styles.updatedAt}>{chat.updatedAt}</span>
				</Link>
				<button
					type="button"
					className={styles.deleteButton}
					onClick={handleDelete}
					disabled={isDeleting}
					aria-label={`Delete chat ${chat.title}`}
				>
					<Image
						src="/delete.svg"
						alt="Delete"
						width={16}
						height={16}
					/>
				</button>
			</div>
		</li>
	);
}
