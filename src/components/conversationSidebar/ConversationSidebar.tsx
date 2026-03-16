import styles from "./ConversationSidebar.module.css";

type Conversation = {
	id: string;
	title: string;
	updatedAt: string;
};

const conversations: Conversation[] = [
	{
		id: "c-quarterly-planning",
		title: "Quarterly planning prep",
		updatedAt: "2m ago",
	},
	{
		id: "c-team-retro-notes",
		title: "Team retro action items",
		updatedAt: "18m ago",
	},
	{
		id: "c-priority-shuffle",
		title: "Priority reshuffle for launch week",
		updatedAt: "1h ago",
	},
	{
		id: "c-client-followups",
		title: "Client follow-ups",
		updatedAt: "Yesterday",
	},
];

export default function ConversationSidebar() {
	return (
		<aside className={styles.sidebar}>
			<h2 className={styles.title}>Your chats</h2>
			<ul className={styles.conversationList}>
				{conversations.map((conversation) => (
					<li key={conversation.id} className={styles.item}>
						<p className={styles.itemTitle}>{conversation.title}</p>
						<span className={styles.updatedAt}>{conversation.updatedAt}</span>
					</li>
				))}
			</ul>
		</aside>
	);
}