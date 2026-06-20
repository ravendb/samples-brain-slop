"use client";

import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import styles from './Checkbox.module.css';

type MutationContext = {
    previousValue?: boolean;
};

type MutationResult = {
    completed: boolean;
};

async function markTaskCompleted(taskId: string, completed: boolean) {
    const result = await fetch('/api/task/completed', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ taskId, completed }),
    });

    if (!result.ok) {
        let message = 'Failed to update task status';
        try {
            const body = await result.json();
            if (body?.error) message = body.error;
        } catch { /* ignore */ }
        throw new Error(message);
    }

    return result.json();
}

async function isTaskCompleted(taskId: string) {
    const encodedTaskId = encodeURIComponent(taskId);
    const result = await fetch(`/api/task/completed?taskId=${encodedTaskId}`);

    if (!result.ok) {
        throw new Error('Failed to get task status');
    }

    return result.json();
}

export default function Checkbox({ taskId }: { taskId: string }) {
    const queryClient = useQueryClient();
    const queryKey = ['task', taskId, 'completed'];
    const [error, setError] = useState<string | null>(null);
    const [tooltipPos, setTooltipPos] = useState<{ top: number; left: number } | null>(null);
    const wrapRef = useRef<HTMLSpanElement>(null);

    useEffect(() => {
        if (!error) return;
        const t = setTimeout(() => {
            setError(null);
            setTooltipPos(null);
        }, 3000);
        return () => clearTimeout(t);
    }, [error]);

    const { data } = useQuery({
        queryKey,
        queryFn: () => isTaskCompleted(taskId),
        staleTime: 1000 * 60 * 5,
    });

    const mutation = useMutation<MutationResult, unknown, boolean, MutationContext>({
        mutationFn: (completed: boolean) => markTaskCompleted(taskId, completed),
        onMutate: async (completed: boolean) => {
            await queryClient.cancelQueries({ queryKey });
            const previousValue = queryClient.getQueryData<boolean>(queryKey);
            queryClient.setQueryData(queryKey, completed);
            return { previousValue }
        },
        onError: (err, _variables, context) => {
            if (context?.previousValue !== undefined) {
                queryClient.setQueryData(queryKey, context.previousValue);
            }
            const message = err instanceof Error ? err.message : 'Failed to update task status';
            setError(message);
            if (wrapRef.current) {
                const rect = wrapRef.current.getBoundingClientRect();
                setTooltipPos({
                    top: rect.top - 8,
                    left: rect.left + rect.width / 2,
                });
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey });
        },
    });

    const handleToggle = () => {
        setError(null);
        mutation.mutate(!data.completed);
    };

    return (
        <span ref={wrapRef} className={styles.wrap}>
            <span
                className={styles.checkbox}
                data-checked={data?.completed}
                role="checkbox"
                aria-checked={data?.completed ?? false}
                onClick={handleToggle}
            >
                {data?.completed && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                        src="/check_small.svg"
                        alt="Checked"
                        className={styles.checkmark}
                    />
                )}
            </span>
            {error && tooltipPos && createPortal(
                <span
                    role="alert"
                    className={styles.tooltip}
                    style={{ top: tooltipPos.top, left: tooltipPos.left }}
                >
                    {error}
                </span>,
                document.body
            )}
        </span>
    );
}
