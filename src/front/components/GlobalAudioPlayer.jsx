import useGlobalReducer from "../hooks/useGlobalReducer";

export const GlobalAudioPlayer = () => {
  const { store, dispatch, audioRef } = useGlobalReducer();
  const { currentPlaylist, currentTrackIndex, isPlaying } = store;

  const playNext = () => {
    if (!currentPlaylist || currentTrackIndex >= currentPlaylist.sounds.length - 1) return;
    dispatch({ type: "set_track_index", payload: currentTrackIndex + 1 });
  };

  const playPrevious = () => {
    if (!currentPlaylist || currentTrackIndex <= 0) return;
    dispatch({ type: "set_track_index", payload: currentTrackIndex - 1 });
  };

  if (!currentPlaylist) return null;

  return (
    <div style={{
      position: "fixed",
      bottom: 0,
      left: 0,
      width: "100%",
      background: "var(--color-btn-primary-bg)",
      padding: "10px 20px",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      zIndex: 1000,
      gap: "12px"
    }}>
      <button onClick={playPrevious} style={{ background: "var(--color-surface)", border: "none", fontSize: "20px", padding: "8px 12px", borderRadius: "6px", cursor: "pointer" }}>⏮</button>
      <audio ref={audioRef} controls style={{ width: "600px" }} />
      <button onClick={playNext} style={{ background: "var(--color-surface)", border: "none", fontSize: "20px", padding: "8px 12px", borderRadius: "6px", cursor: "pointer" }}>⏭</button>
    </div>
  );
};