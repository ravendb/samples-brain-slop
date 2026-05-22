"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useUser } from "@/hooks/useUser";
import styles from "./user.module.css";

export default function UserPage() {
    const { userId } = useParams<{ userId: string }>();
    const { data: user, isLoading } = useUser(userId);

    if (isLoading) {
        return (
            <div className={styles.container}>
                <p className={styles.empty}>Loading…</p>
            </div>
        );
    }

    if (!user) {
        return (
            <div className={styles.container}>
                <p className={styles.empty}>
                    User not found. <Link href="/auth/login" className={styles.loginLink}>Login</Link>
                </p>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <div className={styles.card}>
                <div className={styles.avatar}>{user.name[0].toUpperCase()}</div>
                <h1 className={styles.name}>{user.name}</h1>
                <p className={styles.username}>@{user.username}</p>
            </div>
        </div>
    );
}
