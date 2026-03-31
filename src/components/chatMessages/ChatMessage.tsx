import { Message } from "@/models/chat";
import StreamedContent from "./StreamedContent";
import styles from "./ChatMessages.module.css";



export default function ChatMessage({ message }: { message: Message }) {
    if (!message.content && !message.chunks) {
        return null;
    }

    function renderContent() {
        if (message.chunks) {
            return <StreamedContent chunks={message.chunks} />
        } else {
            return message.content;
        }
    }

    return (
        <li key={message.id} className={styles.message} data-role={message.role}>
            <p className={styles.content}>
                {renderContent()}
            </p>
        </li>
    )
}