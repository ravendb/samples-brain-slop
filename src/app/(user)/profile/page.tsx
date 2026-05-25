"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useUser } from "@/hooks/useUser";
import { useUserTeams } from "@/hooks/useUserTeams";
import { useUserContext } from "@/context/UserContext";
import { useMemberContext } from "@/context/MemberContext";
import styles from "./user.module.css";

export default function UserPage() {
    const router = useRouter();
    const { userId, setUserId } = useUserContext();
    const { setMemberId } = useMemberContext();
    const { data: user, isLoading } = useUser(userId ?? "");
    const { data: teams = [] } = useUserTeams(userId ?? "");

    useEffect(() => {
        if (!userId) router.replace("/auth/login");
    }, [userId, router]);

    const memberOf = teams.filter(({ member }) => member.role === "member");
    const managing = teams.filter(({ member }) => member.role === "manager");

    function handleTeamSelect(memberId: string) {
        setMemberId(memberId);
        router.push("/home");
    }

    function handleLogout() {
        setUserId(null);
        setMemberId(null);
        router.push("/auth/login");
    }

    if (!userId || isLoading) {
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
                    <div className={styles.avatar}>{user.name[0].toUpperCase()}</div>
                    <h1 className={styles.name}>{user.name}</h1>
                    <p className={styles.username}>@{user.username}</p>
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
