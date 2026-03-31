import styles from "./ChatMessages.module.css";

type StreamedContentProps = {
    chunks: string[]
};

export default function StreamedContent({ chunks }: StreamedContentProps) {

    return chunks.flatMap((chunk, chunkIndex) => {
        const parts = chunk.split("\n")
        
        return parts.flatMap((part, partIndex) => {
            const result = []
            if (part !== "") {
                result.push(
                    <span key={`${chunkIndex}-${partIndex}`} className={styles.chunk}>
                        {part}
                    </span>
                )
            }
            if (partIndex < parts.length - 1) {
                result.push(<br key={`${chunkIndex}-${partIndex}-br`} />)
            }
            return result;
        });
    });
}