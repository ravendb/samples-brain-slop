import styles from "./AssigneeChip.module.css";

type AssigneeChipProps = {
    name: string;
    color: string;
};

export default function AssigneeChip({ name, color }: AssigneeChipProps) {
    return (
        <span
            className={styles.chip}
            style={{
                backgroundColor: `color-mix(in srgb, ${color} 18%, transparent)`,
                borderColor: `color-mix(in srgb, ${color} 40%, transparent)`,
                color,
            }}
        >
            {name}
        </span>
    );
}
