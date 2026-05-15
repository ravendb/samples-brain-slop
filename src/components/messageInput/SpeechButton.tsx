"use client";

import styles from "./SpeechButton.module.css";

type SpeechButtonProps = {
    isConnecting: boolean;
    isRecording: boolean;
    onStart: () => void;
    onStop: () => void;
    disabled: boolean;
};

export default function SpeechButton({ isConnecting, isRecording, onStart, onStop, disabled }: SpeechButtonProps) {
    if (isRecording) {
        return (
            <button className={styles.stopButton} type="button" onClick={onStop}>
                <img src="/stop.svg" alt="Stop recording" width={24} height={24} />
            </button>
        );
    }
    return (
        <button
            className={styles.micButton}
            data-connecting={isConnecting}
            type="button"
            onClick={onStart}
            disabled={disabled || isConnecting}
        >
            <img src="/mic.svg" alt="Start recording" width={24} height={24} />
        </button>
    );
}
