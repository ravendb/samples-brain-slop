"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useUser } from "@/hooks/useUser";
import { useUserTeams } from "@/hooks/useUserTeams";
import { useUserId } from "@/context/UserContext";
import { selectMember, logout } from "@/actions/session";
import styles from "./user.module.css";

export default function UserPage() {
    const router = useRouter();
    const userId = useUserId();
    const { data: user, isLoading } = useUser(userId);
    const { data: teams = [] } = useUserTeams(userId);

    const memberOf = teams.filter(({ member }) => member.role === "member");
    const managing = teams.filter(({ member }) => member.role === "manager");

    async function handleTeamSelect(memberId: string) {
        await selectMember(memberId);
        router.push("/home");
    }

    async function handleLogout() {
        await logout();
        router.push("/auth/login");
    }

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
            <div className={styles.inner}>
                <div className={styles.card}>
                    <div className={styles.avatar}>{user.username[0].toUpperCase()}</div>
                    <h1 className={styles.username}>@{user.username}</h1>
                    <button className={styles.logoutButton} onClick={handleLogout}>
                        Logout
                    </button>
                </div>

                <div className={styles.teamsRow}>
                    <div className={styles.teamSection}>
                        <h2 className={styles.sectionTitle}>Member of</h2>
                        {memberOf.length === 0
                            ? <p className={styles.empty}>No teams.</p>
                            : memberOf.map(({ team, member }) => (
                                <button key={member.id} onClick={() => handleTeamSelect(member.id!)} className={styles.teamItem}>
                                    <span className={styles.colorDot} style={{ background: member.color }} />
                                    <span className={styles.teamName}>{team?.name}</span>
                                </button>
                            ))
                        }
                        <Link href="/join-team" className={styles.newTeamButton}>
                            + Join team
                        </Link>
                    </div>

                    <div className={styles.teamSection}>
                        <h2 className={styles.sectionTitle}>Managing</h2>
                        {managing.length === 0
                            ? <p className={styles.empty}>No teams.</p>
                            : managing.map(({ team, member }) => (
                                <button key={member.id} onClick={() => handleTeamSelect(member.id!)} className={styles.teamItem}>
                                    <span className={styles.colorDot} style={{ background: member.color }} />
                                    <span className={styles.teamName}>{team?.name}</span>
                                </button>
                            ))
                        }
                        <Link href="/create-team" className={styles.newTeamButton}>
                            + New team
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
