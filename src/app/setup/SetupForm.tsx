"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import Link from "next/link";
import styles from "./setup.module.css";

type FormState = {
    ravenUrl: string;
    ravenDb: string;
    openAiApiKey: string;
    mainModel: string;
    smallModel: string;
};

type SetupFormProps = {
    initialConfig?: FormState;
};

export default function SetupForm({ initialConfig }: SetupFormProps) {
    const isReconfigure = initialConfig !== undefined;
    const [form, setForm] = useState<FormState>({
        ravenUrl: initialConfig?.ravenUrl ?? "http://127.0.0.1:8080",
        ravenDb: initialConfig?.ravenDb ?? "BrainSlop",
        openAiApiKey: initialConfig?.openAiApiKey ?? "",
        mainModel: initialConfig?.mainModel ?? "gpt-5",
        smallModel: initialConfig?.smallModel ?? "gpt-4o-mini",
    });

    const mutation = useMutation({
        mutationFn: async (data: FormState) => {
            const res = await fetch("/api/setup", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });
            if (!res.ok) {
                const json = await res.json().catch(() => ({}));
                throw new Error(json.error ?? "Setup failed.");
            }
        },
    });

    function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
        setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    }

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        mutation.mutate(form);
    }

    if (mutation.isSuccess) {
        return (
            <div className={styles.page}>
                <div className={styles.card}>
                    <h1 className={styles.title}>Brain Slop</h1>
                    <p className={styles.successMessage}>
                        {isReconfigure ? "Configuration updated." : "Setup complete. Your AI assistant is ready."}
                    </p>
                    <Link href="/" className={styles.submitButton}>
                        Open the app
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.page}>
            <div className={styles.card}>
                <h1 className={styles.title}>Brain Slop</h1>
                <p className={styles.description}>
                    AI-assisted task management for busy managers. Capture unstructured thoughts and turn them into actionable tasks — automatically.
                </p>
                <form onSubmit={handleSubmit} className={styles.form}>
                    <Field label="RavenDB URL" name="ravenUrl" value={form.ravenUrl} onChange={handleChange} />
                    <Field label="Database Name" name="ravenDb" value={form.ravenDb} onChange={handleChange} hint="Created automatically if it doesn't exist" />
                    <Field label="OpenAI API Key" name="openAiApiKey" value={form.openAiApiKey} onChange={handleChange} type="password" />
                    <Field label="Main Model" name="mainModel" value={form.mainModel} onChange={handleChange} hint="Used for the AI assistant" />
                    <Field label="Small Model" name="smallModel" value={form.smallModel} onChange={handleChange} hint="Used for title generation" />

                    {mutation.error && (
                        <p className={styles.error}>{(mutation.error as Error).message}</p>
                    )}

                    <button type="submit" className={styles.submitButton} disabled={mutation.isPending}>
                        {mutation.isPending && <span className={styles.spinner} aria-hidden="true" />}
                        {mutation.isPending
                            ? (isReconfigure ? "Saving…" : "Setting up…")
                            : (isReconfigure ? "Save configuration" : "Set up Brain Slop")}
                    </button>
                </form>
            </div>
        </div>
    );
}

type FieldProps = {
    label: string;
    name: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    type?: string;
    hint?: string;
};

function Field({ label, name, value, onChange, type = "text", hint }: FieldProps) {
    return (
        <div className={styles.fieldGroup}>
            <label htmlFor={name} className={styles.label}>
                {label}
                {hint && <span className={styles.hint}> ({hint})</span>}
            </label>
            <input
                id={name}
                name={name}
                type={type}
                value={value}
                onChange={onChange}
                className={styles.input}
                autoComplete={type === "password" ? "new-password" : "off"}
                required
            />
        </div>
    );
}
