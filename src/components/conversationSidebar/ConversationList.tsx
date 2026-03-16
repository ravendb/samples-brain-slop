"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "./ConversationSidebar.module.css";
import { Chat } from "@/models/chat";

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

type ConversationListProps = {
    chats: Chat[];
};

export default function ConversationList({ chats }: ConversationListProps) {
	const pathname = usePathname();
	const activeChatId = getActiveChatId(pathname);

	return (
		<ul className={styles.conversationList}>
			{chats.length === 0 && (
				<li className={styles.item}>
					<p className={styles.itemTitle}>No conversations yet</p>
				</li>
			)}
			{chats.map((chat) => {
				const isActive = activeChatId === chat.id;

				return (
					<li
						key={chat.id}
						className={`${styles.item} ${isActive ? styles.itemActive : ""}`.trim()}
					>
						<Link href={`/chat/${encodeURIComponent(chat.id)}`} className={styles.itemLink}>
							<p className={styles.itemTitle}>{chat.title}</p>
							<span className={styles.updatedAt}>{chat.updatedAt}</span>
						</Link>
					</li>
				);
			})}
		</ul>
	);
}
