import React from "react";
import styles from "./layout.module.css";
import { MemberProvider } from "@/context/MemberContext";

export default function UserRingLayout({ children }: { children: React.ReactNode }) {
    return (
        <MemberProvider>
            <div className={styles.container}>
                {children}
            </div>
        </MemberProvider>
    );
}
