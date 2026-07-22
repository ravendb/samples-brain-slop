"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import Link from "next/link";
import styles from "../auth.module.css";

export default function SignupPage() {
    const [form, setForm] = useState({ username: "" });
    const router = useRouter();

    const mutation = useMutation({
        mutationFn: async (data: { username: string }) => {
            const res = await fetch("/api/auth/signup", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });
            if (!res.ok) {
                const json = await res.json().catch(() => ({}));
                throw new Error(json.error ?? "Signup failed.");
            }
            return res.json();
        },
        onSuccess: () => router.push("/profile"),
    });

    function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
        setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    }

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        mutation.mutate(form);
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
                            value={form.username}
                            onChange={handleChange}
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
                        {mutation.isPending ? "Signing up…" : "Sign up"}
                    </button>
                </form>
                <p className={styles.switchLink}>
                    Already have an account? <Link href="/auth/login">Log in</Link>
                </p>
            </div>
        </div>
    );
}
