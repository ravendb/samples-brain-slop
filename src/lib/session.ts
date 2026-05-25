import { cookies } from "next/headers";

export async function getSession() {
    const jar = await cookies();
    return {
        userId: jar.get("userId")?.value ?? null,
        memberId: jar.get("memberId")?.value ?? null,
    };
}

export async function setUserIdCookie(userId: string) {
    const jar = await cookies();
    jar.set("userId", userId, { httpOnly: true, path: "/", sameSite: "lax" });
}

export async function setMemberIdCookie(memberId: string) {
    const jar = await cookies();
    jar.set("memberId", memberId, { httpOnly: true, path: "/", sameSite: "lax" });
}

export async function clearSession() {
    const jar = await cookies();
    jar.delete("userId");
    jar.delete("memberId");
}
