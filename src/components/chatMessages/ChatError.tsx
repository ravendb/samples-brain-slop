import Link from "next/link";
import styles from "./ChatMessages.module.css";

export default function ChatError({ error }: { error: Error }) {
    const isDbMissing = error.name === "DatabaseDoesNotExistException";
    const isInvalidKey = error.name === "InvalidApiKeyException";
    const isConnectionRefused = error.name === "ConnectionRefusedException";
    const showSetupLink = isDbMissing || isInvalidKey || isConnectionRefused;

    let message: string;
    if (isDbMissing) {
        message = error.message;
    } else if (isConnectionRefused) {
        message = "Cannot reach RavenDB. Is the server running?";
    } else if (isInvalidKey) {
        message = "Your OpenAI API key is invalid or has been revoked.";
    } else {
        message = "Something went wrong. Please try again.";
    }

    return (
        <div className={styles.errorBox}>
            <span>{message}</span>
            {showSetupLink && <Link href="/setup">Go to setup →</Link>}
        </div>
    );
}
