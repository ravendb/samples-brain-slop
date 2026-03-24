"use client";

import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
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
        throw new Error('Failed to update task status');
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

    const { data, error } = useQuery({
        queryKey,
        queryFn: () => isTaskCompleted(taskId),
        staleTime: 1000 * 60 * 5, // 5 minute
    });

    const mutation = useMutation<MutationResult, unknown, boolean, MutationContext>({
		mutationFn: (completed: boolean) => markTaskCompleted(taskId, completed),
        onMutate: async (completed: boolean) => {
            await queryClient.cancelQueries({ queryKey });
            const previousValue = queryClient.getQueryData<boolean>(queryKey);
            queryClient.setQueryData(queryKey, completed);
            return { previousValue }
        },
		onError: (_err, _variables, context) => {
            if (context?.previousValue) {
                queryClient.setQueryData(queryKey, context.previousValue);
            }
		},
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey });
        },
	});

	const handleToggle = () => {
		queryClient.setQueryData(queryKey, (prev: boolean) => !prev);
        mutation.mutate(!data.completed);
	};

    return <span
        className={styles.checkbox}
        data-checked={data?.completed}
        role="checkbox"
        onClick={handleToggle}
    >
        {data?.completed && (
            <img
                src="/check_small.svg"
                alt="Checked"
                className={styles.checkmark}
            />
        )}
    </span>
}