"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import Link from "next/link";
import styles from "../auth.module.css";
import { useUserContext } from "@/context/UserContext";

export default function LoginPage() {
    const [username, setUsername] = useState("");
    const router = useRouter();
    const { setUserId } = useUserContext();

    const mutation = useMutation({
        mutationFn: async (data: { username: string }) => {
            const res = await fetch("/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });
            if (!res.ok) {
                const json = await res.json().catch(() => ({}));
                throw new Error(json.error ?? "Login failed.");
            }
            return res.json() as Promise<{ userId: string }>;
        },
        onSuccess: ({ userId }) => {
            setUserId(userId);
            router.push("/profile");
        },
    });

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        mutation.mutate({ username });
    }

    return (
        <div className={styles.page}>
            <div className={styles.card}>
                <h1 className={styles.title}>Brain Slop</h1>
                <form onSubmit={handleSubmit} className={styles.form}>
                    <div className={styles.fieldGroup}>
                        <label htmlFor="username" className={styles.label}>Username</label>
                        <input
                            id="username"
                            name="username"
                            type="text"
                            value={username}
                            onChange={e => setUsername(e.target.value)}
                            className={styles.input}
                            autoComplete="username"
                            required
                        />
                    </div>

                    {mutation.error && (
                        <p className={styles.error}>{(mutation.error as Error).message}</p>
                    )}

                    <button type="submit" className={styles.submitButton} disabled={mutation.isPending}>
                        {mutation.isPending && <span className={styles.spinner} aria-hidden="true" />}
                        {mutation.isPending ? "Logging in…" : "Log in"}
                    </button>
                </form>
                <p className={styles.switchLink}>
                    Don&apos;t have an account? <Link href="/auth/signup">Sign up</Link>
                </p>
            </div>
        </div>
    );
}
