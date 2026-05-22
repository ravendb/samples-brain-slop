"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import styles from "./create-team.module.css";

async function createTeam(userId: string, name: string) {
    const res = await fetch(`/api/users/${userId}/teams`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
    });
    if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        throw new Error(json.error ?? "Failed to create team.");
    }
    return res.json();
}

export default function CreateTeamPage() {
    const { userId } = useParams<{ userId: string }>();
    const router = useRouter();
    const queryClient = useQueryClient();
    const [name, setName] = useState("");

    const mutation = useMutation({
        mutationFn: (name: string) => createTeam(userId, name),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["userTeams", userId] });
            router.push(`/${userId}`);
        },
    });

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (name.trim()) mutation.mutate(name.trim());
    }

    return (
        <div className={styles.container}>
            <div className={styles.card}>
                <h1 className={styles.title}>New team</h1>
                <form onSubmit={handleSubmit} className={styles.form}>
                    <div className={styles.fieldGroup}>
                        <label htmlFor="name" className={styles.label}>Team name</label>
                        <input
                            id="name"
                            autoFocus
                            className={styles.input}
                            value={name}
                            onChange={e => setName(e.target.value)}
                            disabled={mutation.isPending}
                            required
                        />
                    </div>

                    {mutation.error && (
                        <p className={styles.error}>{(mutation.error as Error).message}</p>
                    )}

                    <div className={styles.actions}>
                        <button type="button" className={styles.cancelButton} onClick={() => router.push(`/${userId}`)}>
                            Cancel
                        </button>
                        <button type="submit" className={styles.submitButton} disabled={mutation.isPending || !name.trim()}>
                            {mutation.isPending ? "Creating…" : "Create team"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
