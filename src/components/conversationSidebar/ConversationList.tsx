"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import styles from "./ConversationSidebar.module.css";
import { Chat } from "@/models/chat";
import ConversationItem from "./ConversationItem";

function getActiveChatId(pathname: string): string | null {
	if (!pathname.startsWith("/chat/")) {
		return null;
	}

	const encodedChatId = pathname.slice("/chat/".length).split("/")[0];

	try {
		return decodeURIComponent(encodedChatId);
	} catch {
		return null;
	}
}

async function loadChats(signal: AbortSignal): Promise<Chat[]> {
	const response = await fetch("/api/chat", {
		method: "GET",
		cache: "no-store",
		signal,
	});

	if (!response.ok) {
		return [];
	}

	return await response.json() as Chat[];
}

export default function ConversationList() {
	const pathname = usePathname();
	const activeChatId = getActiveChatId(pathname);
	const [chatList, setChatList] = useState<Chat[]>([]);

	useEffect(() => {
		const controller = new AbortController();

		async function refreshChats() {
			try {
				const nextChats = await loadChats(controller.signal);
				if (!controller.signal.aborted) {
					setChatList(nextChats);
				}
			} catch (error) {
				if (error instanceof DOMException && error.name === "AbortError") {
					return;
				}
			}
		}

		refreshChats();

		return () => {
			controller.abort();
		};
	}, [pathname]);

	const sortedChats = chatList.toSorted((a, b) =>
		b.updatedAt.localeCompare(a.updatedAt)
	);

	function handleDeleteChat(chatId: string) {
		setChatList((current) => current.filter((chat) => chat.id !== chatId));
	}

	return (
		<ul className={styles.conversationList}>
			{sortedChats.length === 0 && (
				<li className={styles.item}>
					<p className={styles.itemTitle}>No conversations yet</p>
				</li>
			)}
			{sortedChats.map((chat) => {
				const isActive = activeChatId === chat.id;

				return (
					<ConversationItem
						key={chat.id}
						chat={chat}
						isActive={isActive}
						onDelete={handleDeleteChat}
					/>
				);
			})}
		</ul>
	);
}
