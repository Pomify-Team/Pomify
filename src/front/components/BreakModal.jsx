import { useEffect, useState } from "react";
import "../styles/breakModal.css";
import useLanguage from "../context/LanguageContext";

const formatTime = (s) =>
    `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

export const BreakModal = ({ timeLeft, presetBreak, onSkip, onBreakEnd }) => {
    const { t } = useLanguage();

    const getTipsForPreset = (breakSeconds) => {
        if (breakSeconds <= 5 * 60) return t("break.tips5");
        if (breakSeconds <= 10 * 60) return t("break.tips10");
        return t("break.tips15");
    };

    const [tip] = useState(() => {
        const tips = getTipsForPreset(presetBreak);
        return tips[Math.floor(Math.random() * tips.length)];
    });
    const [showConfirm, setShowConfirm] = useState(false);



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

                        <p className="bm-label">{t("break.label")}</p>
                        <h2 className="bm-timer">{formatTime(timeLeft)}</h2>

                        <div className="bm-divider" />

                        <p className="bm-tip">{tip}</p>
                    </>
                ) : (
                    <div className="bm-confirm">
                        <p className="bm-confirm-text">
                            {t("break.confirmText").split("\n").map((line, i) => (
                                <span key={i}>{line}{i === 0 && <br />}</span>
                            ))}
                        </p>
                        <div className="bm-confirm-actions">
                            <button
                                className="bm-btn bm-btn-yes"
                                onClick={() => onSkip(timeLeft)}
                            >
                                {t("break.yesContinue")}
                            </button>
                            <button
                                className="bm-btn bm-btn-no"
                                onClick={() => setShowConfirm(false)}
                            >
                                {t("break.noResting")}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
