import { useEffect, useState } from "react";
import "../styles/breakModal.css";

const TIPS = {
    5: [
        "Shake your hands and relax your wrists.",
        "Close your eyes and take three deep breaths.",
        "Look out the window or focus on a distant point to rest your eyes.",
        "Roll your shoulders back and stretch your neck — 30 seconds each side.",
        "Stand up, take a couple of steps, and sit back down.",
    ],
    10: [
        "Take a short walk — any distance counts.",
        "Get a glass of water or make a warm drink.",
        "Do 5 minutes of stretching: back, legs, arms.",
        "Listen to a song you like and do nothing else.",
        "Close your laptop for a moment and let your eyes rest.",
    ],
    15: [
        "Step outside for a minute — natural light recharges you.",
        "Have a light snack and drink some water.",
        "Go for a short 5–10 minute walk.",
        "Write on paper what you want to accomplish in the next block.",
        "Try box breathing: inhale 4s, hold 4s, exhale 4s.",
    ],
};

const formatTime = (s) =>
    `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

const getTipsForPreset = (breakSeconds) => {
    if (breakSeconds <= 5 * 60) return TIPS[5];
    if (breakSeconds <= 10 * 60) return TIPS[10];
    return TIPS[15];
};

export const BreakModal = ({ timeLeft, presetBreak, onSkip, onBreakEnd }) => {
    const [tip] = useState(() => {
        const tips = getTipsForPreset(presetBreak);
        return tips[Math.floor(Math.random() * tips.length)];
    });
    const [showConfirm, setShowConfirm] = useState(false);

    useEffect(() => {
        if (timeLeft === 0) {
            onBreakEnd();
        }
    }, [timeLeft, onBreakEnd]);

    return (
        <div className="bm-overlay">
            <div className="bm-card">
                {!showConfirm ? (
                    <>
                        <button
                            className="bm-close"
                            onClick={() => setShowConfirm(true)}
                            aria-label="Close modal"
                        >
                            ✕
                        </button>

                        <p className="bm-label">break time</p>
                        <h2 className="bm-timer">{formatTime(timeLeft)}</h2>

                        <div className="bm-divider" />

                        <p className="bm-tip">{tip}</p>
                    </>
                ) : (
                    <div className="bm-confirm">
                        <p className="bm-confirm-text">
                            We recommend not skipping your breaks.
                            <br />
                            Are you sure you want to continue your pomodoro?
                        </p>
                        <div className="bm-confirm-actions">
                            <button
                                className="bm-btn bm-btn-yes"
                                onClick={() => onSkip(timeLeft)}
                            >
                                yes, continue
                            </button>
                            <button
                                className="bm-btn bm-btn-no"
                                onClick={() => setShowConfirm(false)}
                            >
                                no, keep resting
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};