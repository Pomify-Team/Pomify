import "../styles/pomodoroZone.css";
import { useMemo, useRef, useEffect, useState } from "react";
import { BreakModal } from "./BreakModal";
import useGlobalReducer from "../hooks/useGlobalReducer";
import { TIMER_PRESETS_LIST } from "../store";
import { useNavigate } from "react-router-dom";

const formatTotal = (s) => {
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    if (h > 0) {
        return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
    }
    return `${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
};

const hasHours = (s) => s >= 3600;

export const PomodoroZone = () => {
    const { store, dispatch, audioRef } = useGlobalReducer();
    const p = store.pomodoro;
    const { currentPlaylist, currentTrackIndex, isPlaying } = store;
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [audioProgress, setAudioProgress] = useState(0);
    const [isDragging, setIsDragging] = useState(false);
    const progressRef = useRef(null);
    const dropdownRef = useRef(null);
    const navigate = useNavigate();

    useEffect(() => {
        if (!isMenuOpen) return;
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setIsMenuOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [isMenuOpen]);

    useEffect(() => {
        const audio = audioRef?.current;
        if (!audio) return;
        const update = () => {
            if (audio.duration) {
                setAudioProgress(audio.currentTime / audio.duration);
            }
        };
        audio.addEventListener("timeupdate", update);
        return () => audio.removeEventListener("timeupdate", update);
    }, [audioRef, currentTrackIndex]);

    const handleSeek = (e) => {
        const audio = audioRef?.current;
        if (!audio || !audio.duration) return;
        const rect = progressRef.current.getBoundingClientRect();
        const ratio = Math.min(Math.max((e.clientX - rect.left) / rect.width, 0), 1);
        audio.currentTime = ratio * audio.duration;
        setAudioProgress(ratio);
    };

    const handleDragStart = (e) => {
        e.preventDefault();
        if (!audioRef?.current?.duration) return;
        setIsDragging(true);
        const onMove = (ev) => {
            const rect = progressRef.current.getBoundingClientRect();
            const ratio = Math.min(Math.max((ev.clientX - rect.left) / rect.width, 0), 1);
            setAudioProgress(ratio);
        };
        const onUp = (ev) => {
            const rect = progressRef.current.getBoundingClientRect();
            const ratio = Math.min(Math.max((ev.clientX - rect.left) / rect.width, 0), 1);
            audioRef.current.currentTime = ratio * audioRef.current.duration;
            setAudioProgress(ratio);
            setIsDragging(false);
            document.removeEventListener("mousemove", onMove);
            document.removeEventListener("mouseup", onUp);
        };
        document.addEventListener("mousemove", onMove);
        document.addEventListener("mouseup", onUp);
    };

    const phaseLabel = useMemo(() => {
        return p.currentPhase === "focus" ? "time to focus!" : "break time";
    }, [p.currentPhase]);

    const startBtnLabel = p.breakSkipped ? "continue break" : p.isRunning ? "pause" : "start";
    const startBtnClass = `pomodoro-start-button${p.isRunning ? " is-running" : ""}${p.breakSkipped ? " is-break-skipped" : ""}`;

    const handleStartPause = () => dispatch({ type: "pomodoro_start_pause" });
    const handleContinueBreak = () => dispatch({ type: "pomodoro_continue_break" });
    const handleSkipBreak = () => dispatch({ type: "pomodoro_skip_break" });
    const handleBreakEnd = () => dispatch({ type: "pomodoro_break_end" });
    const handleRestorePomodoro = () => dispatch({ type: "pomodoro_restore" });
    const handlePresetSelect = (preset) => {
        dispatch({ type: "pomodoro_set_preset", payload: preset });
        setIsMenuOpen(false);
    };

    const handlePreviousTrack = () => {
        if (!currentPlaylist || currentTrackIndex <= 0) return;
        dispatch({ type: "set_track_index", payload: currentTrackIndex - 1 });
    };

    const handleTogglePlay = () => {
        dispatch({ type: "set_playing", payload: !isPlaying });
    };

    const handleNextTrack = () => {
        if (!currentPlaylist || currentTrackIndex >= currentPlaylist.sounds.length - 1) return;
        dispatch({ type: "set_track_index", payload: currentTrackIndex + 1 });
    };

    return (
        <>
            <div className="pomodoro-card">
                <div className="pomodoro-topbar">
                    <div className="pomodoro-dropdown-wrapper" ref={dropdownRef}>
                        <button
                            className="pomodoro-time-button"
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                        >
                            Pomodoro Time
                        </button>

                        {isMenuOpen && (
                            <div className="pomodoro-dropdown">
                                {TIMER_PRESETS_LIST.map((preset) => (
                                    <button
                                        key={preset.id}
                                        className="pomodoro-dropdown-item"
                                        onClick={() => handlePresetSelect(preset)}
                                    >
                                        {preset.label}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                <div className="pomodoro-timer-block">
                    <h2
                        className="pomodoro-time"
                        data-phase={p.currentPhase}
                        data-format={hasHours(p.focusLeft) ? "hms" : "ms"}
                    >
                        {formatTotal(p.focusLeft)}
                    </h2>
                    <p className="pomodoro-phase">{phaseLabel}</p>

                    <button
                        className={startBtnClass}
                        onClick={p.breakSkipped ? handleContinueBreak : handleStartPause}
                    >
                        {startBtnLabel}
                    </button>

                    {p.breakSkipped && (
                        <button
                            className="pomodoro-restore-btn"
                            onClick={handleRestorePomodoro}
                        >
                            restore pomodoro
                        </button>
                    )}
                </div>

                <div className="pomodoro-player">
                    <div
                        ref={progressRef}
                        className="pomodoro-progress-line"
                        onClick={handleSeek}
                        style={{ cursor: currentPlaylist ? "pointer" : "default" }}
                    >
                        <div style={{
                            position: "absolute",
                            left: 0,
                            top: 0,
                            height: "100%",
                            width: `${audioProgress * 100}%`,
                            background: "#1A1A1A",
                            opacity: 0.75,
                            transition: isDragging ? "none" : "width 0.5s linear"
                        }} />
                        <span
                            className="pomodoro-progress-dot"
                            style={{ left: `${audioProgress * 100}%`, cursor: "grab" }}
                            onMouseDown={handleDragStart}
                        />
                    </div>

                    <div className="pomodoro-controls">
                        <button
                            className="pomodoro-control-btn"
                            onClick={handlePreviousTrack}
                            disabled={!currentPlaylist || currentTrackIndex <= 0}
                            style={{
                                width: "36px", height: "36px", borderRadius: "50%",
                                border: "1.5px solid #2D3A4A", background: "transparent",
                                cursor: "pointer", display: "flex", alignItems: "center",
                                justifyContent: "center", opacity: (!currentPlaylist || currentTrackIndex <= 0) ? 0.3 : 1
                            }}
                        >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="#2D3A4A"><path d="M6 6h2v12H6zm3.5 6 8.5 6V6z"/></svg>
                        </button>
                        <button
                            className="pomodoro-control-btn is-main"
                            onClick={handleTogglePlay}
                            disabled={!currentPlaylist}
                            style={{
                                width: "48px", height: "48px", borderRadius: "50%",
                                border: "none", background: "#2D3A4A",
                                cursor: "pointer", display: "flex", alignItems: "center",
                                justifyContent: "center", opacity: !currentPlaylist ? 0.3 : 1
                            }}
                        >
                            {isPlaying
                                ? <svg width="16" height="16" viewBox="0 0 24 24" fill="#F2F5F0"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
                                : <svg width="16" height="16" viewBox="0 0 24 24" fill="#F2F5F0"><path d="M8 5v14l11-7z"/></svg>
                            }
                        </button>
                        <button
                            className="pomodoro-control-btn"
                            onClick={handleNextTrack}
                            disabled={!currentPlaylist || currentTrackIndex >= (currentPlaylist?.sounds.length - 1)}
                            style={{
                                width: "36px", height: "36px", borderRadius: "50%",
                                border: "1.5px solid #2D3A4A", background: "transparent",
                                cursor: "pointer", display: "flex", alignItems: "center",
                                justifyContent: "center", opacity: (!currentPlaylist || currentTrackIndex >= (currentPlaylist?.sounds.length - 1)) ? 0.3 : 1
                            }}
                        >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="#2D3A4A"><path d="M6 18l8.5-6L6 6v12zm2-8.14L11.03 12 8 14.14V9.86zM16 6h2v12h-2z"/></svg>
                        </button>
                    </div>

                    <button
                        className="pomodoro-music-button"
                        onClick={() => navigate("/music")}
                    >
                        choose music
                    </button>
                </div>
            </div>

            {p.showBreakModal && (
                <BreakModal
                    timeLeft={p.phaseLeft}
                    presetBreak={p.selectedPreset.break}
                    onSkip={handleSkipBreak}
                    onBreakEnd={handleBreakEnd}
                />
            )}
        </>
    );
};