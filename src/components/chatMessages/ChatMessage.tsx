import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Message } from "@/models/chat";
import styles from "./ChatMessages.module.css";
import mdStyles from "./MarkdownContent.module.css";


export default function ChatMessage({ message }: { message: Message }) {
    if (!message.content && !message.chunks) {
        return null;
    }

    let text: string = "";
    if (message.chunks && message.chunks.length > 0) {
        text = message.chunks.join("");
    }
    else if (message.content) {
        text = message.content;
    }

    return (
        <li key={message.id} className={styles.message} data-role={message.role}>
            <div className={`${styles.content} ${mdStyles.root}`}>
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {text}
                </ReactMarkdown>
            </div>
        </li>
    );
}
