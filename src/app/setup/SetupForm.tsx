"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import Link from "next/link";
import styles from "./setup.module.css";

type FormState = {
    openAiApiKey: string;
    mainModel: string;
    smallModel: string;
    ravenDbLicense: string;
};

type SetupFormProps = {
    initialConfig?: FormState;
};

export default function SetupForm({ initialConfig }: SetupFormProps) {
    const isReconfigure = initialConfig !== undefined;
    const [form, setForm] = useState<FormState>({
        openAiApiKey: initialConfig?.openAiApiKey ?? "",
        mainModel: initialConfig?.mainModel ?? "gpt-5",
        smallModel: initialConfig?.smallModel ?? "gpt-4o-mini",
        ravenDbLicense: initialConfig?.ravenDbLicense ?? "",
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

    function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
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
                    <Link href="/auth/login" className={styles.submitButton}>
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
                    <Field label="RavenDB License" name="ravenDbLicense" value={form.ravenDbLicense} onChange={handleChange} hint="Paste your license JSON" multiline />
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
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
    type?: string;
    hint?: string;
    multiline?: boolean;
};

function Field({ label, name, value, onChange, type = "text", hint, multiline }: FieldProps) {
    return (
        <div className={styles.fieldGroup}>
            <label htmlFor={name} className={styles.label}>
                {label}
                {hint && <span className={styles.hint}> ({hint})</span>}
            </label>
            {multiline ? (
                <textarea
                    id={name}
                    name={name}
                    value={value}
                    onChange={onChange}
                    className={styles.input}
                    rows={4}
                    required
                />
            ) : (
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
            )}
        </div>
    );
}
