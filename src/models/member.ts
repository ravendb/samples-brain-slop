const COLORS = [
    "#ef4444", // red
    "#f97316", // orange
    "#eab308", // yellow
    "#22c55e", // green
    "#14b8a6", // teal
    "#3b82f6", // blue
    "#6366f1", // indigo
    "#a855f7", // purple
    "#ec4899", // pink
    "#f43f5e", // rose
    "#06b6d4", // cyan
    "#84cc16", // lime
    "#f59e0b", // amber
    "#8b5cf6", // violet
    "#10b981", // emerald
];

export type MemberInfo = { name: string; color: string };
export type MemberMap = Record<string, MemberInfo>; // keyed by memberId

export class Member {
    id?: string;
    userId: string;
    teamId: string;
    color: string;
    role: "manager" | "member";

    constructor(userId: string, teamId: string, color: string, role: "manager" | "member") {
        this.userId = userId;
        this.teamId = teamId;
        this.color = color;
        this.role = role;
    }

    static withRandomColor(userId: string, teamId: string, role: "manager" | "member") {
        const color = COLORS[Math.floor(Math.random() * COLORS.length)];
        return new Member(userId, teamId, color, role);
    }
}