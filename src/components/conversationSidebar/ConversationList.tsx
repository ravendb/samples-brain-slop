"use client";

import { useQuery } from "@tanstack/react-query";
import styles from "./ConversationSidebar.module.css";
import { Chat } from "@/models/chat";
import ConversationItem from "./ConversationItem";

async function loadChats(): Promise<Chat[]> {
	const response = await fetch("/api/chat", {
		method: "GET",
		cache: "no-store",
	});

	if (!response.ok) {
		throw new Error("Could not load chats.");
	}

	return await response.json() as Chat[];
}

export default function ConversationList() {
    const { data: chatList = [], error } = useQuery<Chat[]>({
        queryKey: ["chats"],
        queryFn: loadChats,
        staleTime: 1000 * 60, // 1 minute
    });

	const sortedChats = chatList.toSorted((a, b) =>
		new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
	);

	return (
		<ul className={styles.conversationList}>
			{error && (
				<li className={styles.item}>
					<p className={`${styles.itemTitle} ${styles.itemError}`}>Could not load chats</p>
				</li>
			)}
			{!error && sortedChats.length === 0 && (
				<li className={styles.item}>
					<p className={styles.itemTitle}>No conversations yet</p>
				</li>
			)}
			{sortedChats.map((chat) => (
				<ConversationItem
					key={chat.id}
					chat={chat}
				/>
			))}
		</ul>
	);
}
