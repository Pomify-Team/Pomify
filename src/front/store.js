const TIMER_PRESETS = [
    { id: 0, label: "1/1 - test",       focus: 1 * 60,  break: 1 * 60,  cycles: 6 },
    { id: 1, label: "20/5 - 1 hour",   focus: 20 * 60, break: 5 * 60,  cycles: 3 },
    { id: 2, label: "30/10 - 2 hours", focus: 30 * 60, break: 10 * 60, cycles: 4 },
    { id: 3, label: "60/15 - 3 hours", focus: 60 * 60, break: 15 * 60, cycles: 3 },
];

const calcFocusTotal = (preset) => preset.focus * preset.cycles;

const buildPomodoroState = (preset) => ({
    selectedPreset: preset,
    focusLeft: calcFocusTotal(preset),
    phaseLeft: preset.focus,
    isRunning: false,
    currentPhase: "focus",
    completedFocusSessions: 0,
    showBreakModal: false,
    breakSkipped: false,
});

export const TIMER_PRESETS_LIST = TIMER_PRESETS;

export const initialStore = () => {
    return {
        message: null,
        currentUser: null,
        pomodoro: buildPomodoroState(TIMER_PRESETS[1]),
        currentPlaylist: null,
        currentTrackIndex: 0,
        isPlaying: false,
    };
};

export default function storeReducer(store, action = {}) {
    switch (action.type) {
        case "set_hello":
            return { ...store, message: action.payload };

        case "set_user":
            return { ...store, currentUser: action.payload };

        case "logout":
            return { ...store, currentUser: null };

        case "set_playlist":
            return {
                ...store,
                currentPlaylist: action.payload,
                currentTrackIndex: 0,
                isPlaying: true,
            };

        case "set_track_index":
            return { ...store, currentTrackIndex: action.payload };

        case "set_playing":
            return { ...store, isPlaying: action.payload };

        case "pomodoro_tick": {
            const p = store.pomodoro;
            if (!p.isRunning) return store;
            const newPhaseLeft = p.phaseLeft > 1 ? p.phaseLeft - 1 : 0;
            const newFocusLeft = p.currentPhase === "focus" && p.focusLeft > 1
                ? p.focusLeft - 1
                : p.focusLeft;
            return {
                ...store,
                pomodoro: { ...p, phaseLeft: newPhaseLeft, focusLeft: newFocusLeft },
            };
        }

        case "pomodoro_phase_end": {
            const p = store.pomodoro;
            if (p.currentPhase === "focus") {
                const next = p.completedFocusSessions + 1;
                if (next < p.selectedPreset.cycles) {
                    return {
                        ...store,
                        pomodoro: {
                            ...p,
                            currentPhase: "break",
                            phaseLeft: p.selectedPreset.break,
                            completedFocusSessions: next,
                            showBreakModal: true,
                            breakSkipped: false,
                        },
                    };
                }
                return {
                    ...store,
                    pomodoro: {
                        ...p,
                        isRunning: false,
                        completedFocusSessions: next,
                    },
                };
            }
            return {
                ...store,
                pomodoro: {
                    ...p,
                    currentPhase: "focus",
                    phaseLeft: p.selectedPreset.focus,
                    showBreakModal: false,
                    breakSkipped: false,
                },
            };
        }

        case "pomodoro_start_pause":
            return {
                ...store,
                pomodoro: { ...store.pomodoro, isRunning: !store.pomodoro.isRunning },
            };

        case "pomodoro_set_preset":
            return {
                ...store,
                pomodoro: buildPomodoroState(action.payload),
            };

        case "pomodoro_skip_break":
            return {
                ...store,
                pomodoro: {
                    ...store.pomodoro,
                    showBreakModal: false,
                    isRunning: false,
                    breakSkipped: true,
                },
            };

        case "pomodoro_continue_break":
            return {
                ...store,
                pomodoro: {
                    ...store.pomodoro,
                    currentPhase: "break",
                    showBreakModal: true,
                    breakSkipped: false,
                    isRunning: true,
                },
            };

        case "pomodoro_break_end":
            return {
                ...store,
                pomodoro: {
                    ...store.pomodoro,
                    showBreakModal: false,
                    currentPhase: "focus",
                    phaseLeft: store.pomodoro.selectedPreset.focus,
                    breakSkipped: false,
                },
            };

        case "pomodoro_restore":
            return {
                ...store,
                pomodoro: {
                    ...store.pomodoro,
                    currentPhase: "focus",
                    phaseLeft: store.pomodoro.selectedPreset.focus,
                    breakSkipped: false,
                    isRunning: true,
                },
            };

        default:
            throw Error("Unknown action: " + action.type);
    }
}