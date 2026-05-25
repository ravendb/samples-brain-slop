"use client";

import React from "react";
import Link from "next/link";
import { useTeamId } from "@/context/MemberContext";
import { useUserId } from "@/context/UserContext";
import { useTeam } from "@/hooks/useTeam";
import styles from "./LeftSidebar.module.css";

export default function TeamPanel() {
    const teamId = useTeamId();
    const userId = useUserId();
    const { data, isLoading } = useTeam(teamId);

    if (isLoading || !data) {
        return (
            <div className={styles.teamSection}>
                <p className={styles.teamRow}>Loading team…</p>
            </div>
        );
    }

    const { team, members } = data;
    const manager = members.find(({ member }) => member.role === "manager");
    const regularMembers = members.filter(({ member }) => member.role === "member");

    return (
        <div className={styles.teamSection}>
            <div className={styles.header}>
                <h2 className={styles.teamTitle}>{team.name}</h2>
                <Link href="/profile" className={styles.newChatLink}>Your Profile</Link>
            </div>

            <p className={styles.teamRow}>
                <span className={styles.teamRowLabel}>Manager:</span>
                {manager
                    ? manager.member.userId === userId
                        ? <span style={{ color: manager.member.color }}>You</span>
                        : (manager.user?.name ?? "—")
                    : "—"
                }
            </p>

            <p className={styles.teamRow}>
                <span className={styles.teamRowLabel}>Members:</span>
                {regularMembers.length === 0
                    ? "None"
                    : regularMembers.map(({ member, user }, i) => (
                        <React.Fragment key={member.id}>
                            {i > 0 && " "}
                            <span className={styles.memberName}>
                                {member.userId === userId
                                    ? <span style={{ color: member.color }}>You</span>
                                    : (user?.name ?? "Unknown")
                                }
                                {i < regularMembers.length - 1 && ","}
                            </span>
                        </React.Fragment>
                    ))
                }
            </p>
        </div>
    );
}
