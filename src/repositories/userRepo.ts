import { User } from '@/models/user';
import { getStore } from '@/db/ravendb';

export async function signup(username: string) {
    const session = getStore().openSession();

    const existing = await session.query({ collection: "Users" })
        .whereEquals("username", username)
        .firstOrNull();

    if (existing) {
        throw new Error("Username already exists");
    }

    const user: User = new User(username);
    await session.store(user);
    await session.saveChanges();
    return user;
}

export async function login(username: string) {
    const session = getStore().openSession();

    const user = await session.query({ collection: "Users" })
        .whereEquals("username", username)
        .firstOrNull();

    if (!user) {
        throw new Error("User not found");
    }

    return user;
}

export async function getUserById(userId: string) {
    const session = getStore().openSession();
    return session.load<User>(userId);
}
