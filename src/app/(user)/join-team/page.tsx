"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useUserId } from "@/context/UserContext";
import styles from "../team-form.module.css";

async function joinTeam(userId: string, teamName: string) {
    const res = await fetch(`/api/users/${userId}/teams/join`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ teamName }),
    });
    if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        throw new Error(json.error ?? "Failed to join team.");
    }
    return res.json();
}

export default function JoinTeamPage() {
    const userId = useUserId();
    const router = useRouter();
    const queryClient = useQueryClient();
    const [teamName, setTeamName] = useState("");

    const mutation = useMutation({
        mutationFn: (teamName: string) => joinTeam(userId, teamName),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["userTeams", userId] });
            router.push("/profile");
        },
    });

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (teamName.trim()) mutation.mutate(teamName.trim());
    }

    return (
        <div className={styles.container}>
            <div className={styles.card}>
                <h1 className={styles.title}>Join a team</h1>
                <form onSubmit={handleSubmit} className={styles.form}>
                    <div className={styles.fieldGroup}>
                        <label htmlFor="teamName" className={styles.label}>Team name</label>
                        <input
                            id="teamName"
                            autoFocus
                            className={styles.input}
                            value={teamName}
                            onChange={e => setTeamName(e.target.value)}
                            disabled={mutation.isPending}
                            required
                        />
                    </div>

                    {mutation.error && (
                        <p className={styles.error}>{(mutation.error as Error).message}</p>
                    )}

                    <div className={styles.actions}>
                        <button type="button" className={styles.cancelButton} onClick={() => router.push("/profile")}>
                            Cancel
                        </button>
                        <button type="submit" className={styles.submitButton} disabled={mutation.isPending || !teamName.trim()}>
                            {mutation.isPending ? "Joining…" : "Join team"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
