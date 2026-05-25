"use client";

import { useQuery } from "@tanstack/react-query";
import styles from "./LeftSidebar.module.css";
import { Chat } from "@/models/chat";
import ConversationItem from "./ConversationItem";
import { useMemberId } from "@/context/MemberContext";

async function loadChats(memberId: string): Promise<Chat[]> {
	const response = await fetch(`/api/chat?memberId=${memberId}`, {
		method: "GET",
		cache: "no-store",
	});

	if (!response.ok) {
		throw new Error("Could not load chats.");
	}

	return await response.json() as Chat[];
}

export default function ConversationList() {
    const memberId = useMemberId();

    const { data: chatList = [], error } = useQuery<Chat[]>({
        queryKey: ["chats", memberId],
        queryFn: () => loadChats(memberId),
        staleTime: 1000 * 60,
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
