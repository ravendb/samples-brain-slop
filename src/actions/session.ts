"use server";

import { setMemberIdCookie, clearSession } from "@/lib/session";

export async function selectMember(memberId: string) {
    await setMemberIdCookie(memberId);
}

export async function logout() {
    await clearSession();
}
