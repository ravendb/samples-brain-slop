"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import Image from "next/image";
import { Chat } from "@/models/chat";
import styles from "./ConversationSidebar.module.css";
import { useMutation, useQueryClient } from "@tanstack/react-query";

async function deleteChat(chatId: string): Promise<void> {
	const response = await fetch(`/api/chat/${encodeURIComponent(chatId)}`, {
		method: "DELETE",
	});

	if (!response.ok) {
		throw new Error("Failed to delete chat");
	}
}

function isActiveChat(pathname: string, chatId: string): boolean {
    if (!pathname?.startsWith("/chat/")) {
        return false;
    }

    const encodedChatId = pathname.slice("/chat/".length).split("/")[0];

    try {
        return decodeURIComponent(encodedChatId) === chatId;
    } catch {
        return false;
    }
}

type ConversationItemProps = {
	chat: Chat;
};

export default function ConversationItem({ chat }: ConversationItemProps) {
	const pathname = usePathname();
	const isActive = isActiveChat(pathname, chat.id);
	const router = useRouter();
    const queryClient = useQueryClient();

    const deleteMutation = useMutation({
        mutationFn: deleteChat,
        onMutate: () => {
            queryClient.setQueryData(["chats"], (oldChats: Chat[] | undefined) => {
                if (!oldChats) return oldChats;
                return oldChats.filter(c => c.id !== chat.id);
            });

            if (isActive) {
				router.push("/chat/new");
			}
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["chats"] });
        },
        onError: (error) => {
            console.error("Failed to delete chat:", error);
        }
    });

	async function handleDelete() {
		const title = chat.title.trim() || "this chat";
		const isDeleteConfirmed = window.confirm(
			`Delete ${title}? This cannot be undone.`
		);

		if (isDeleteConfirmed) {
			deleteMutation.mutate(chat.id);
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
					disabled={deleteMutation.isPending}
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
