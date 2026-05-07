import React, { useEffect, useState } from "react";
import { searchSounds } from "./freesound";
import { useNavigate } from "react-router-dom";
import "./freesound.css";
import useGlobalReducer from "../../hooks/useGlobalReducer";
import CALM from "../../assets/img/CALM.png";
import STORM from "../../assets/img/STORM.png";
import WIND from "../../assets/img/WIND.png";
import SEA from "../../assets/img/SEA.png";
import NATURE from "../../assets/img/NATURE.png";
import CITY from "../../assets/img/CITY.png";

export const SoundList = () => {
  const [playlistsData, setPlaylistsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedPlaylist, setSelectedPlaylist] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [playingPlaylist, setPlayingPlaylist] = useState(null);

  const { dispatch } = useGlobalReducer();
  const navigate = useNavigate();

  const playlists = [
    { name: "Relax",   query: "relax ambient meditation calm", coverImage: CALM },
    { name: "Thunder", query: "thunder",                       coverImage: STORM },
    { name: "Wind",    query: "wind",                          coverImage: WIND },
    { name: "Ocean",   query: "ocean",                         coverImage: SEA },
    { name: "Forest",  query: "forest",                        coverImage: NATURE },
    { name: "City",    query: "city ambience",                 coverImage: CITY },
  ];

  useEffect(() => {
    const loadPlaylists = async () => {
      try {
        const results = await Promise.all(
          playlists.map(async (pl) => {
            const sounds = await searchSounds(pl.query);
            const filtered = sounds
              .filter(s => s.previews?.["preview-lq-mp3"] || s.previews?.["preview-hq-mp3"] || s.previews?.["preview-lq-ogg"])
              .slice(0, 25);
            return { ...pl, sounds: filtered };
          })
        );
        setPlaylistsData(results);
      } catch (err) {
        console.error(err);
        setError("Could not load playlists");
      }
      setLoading(false);
    };
    loadPlaylists();
  }, []);

  const getPreview = (sound) => {
    return sound.previews?.["preview-lq-mp3"] || sound.previews?.["preview-hq-mp3"] || sound.previews?.["preview-lq-ogg"];
  };

  const openModal = (pl) => {
    setSelectedPlaylist(pl);
    setTimeout(() => setModalVisible(true), 10);
  };

  const closeModal = () => {
    setModalVisible(false);
    setTimeout(() => setSelectedPlaylist(null), 350);
  };

  const handleSelect = (pl) => {
    dispatch({ type: "set_playlist", payload: pl });
    navigate("/home");
  };

  const handlePlayInPlace = (pl) => {
    if (playingPlaylist?.name === pl.name) {
      setPlayingPlaylist(null);
      dispatch({ type: "set_playing", payload: false });
    } else {
      setPlayingPlaylist(pl);
      dispatch({ type: "set_playlist", payload: pl });
    }
  };

  if (loading) return <p className="sound-loading">Loading playlists...</p>;
  if (error) return <p className="text-danger">{error}</p>;

  return (
    <>
      <div className="sound-btn-home-wrapper">
        <button className="sound-btn-home" onClick={() => navigate("/home")}>
          ← Home
        </button>
      </div>

      <div className="sound-hero">
        <h1 className="sound-hero-title">Ambient Sounds</h1>
        <p className="sound-hero-subtitle">
          Choose the sounds that inspire your focus. Let the right atmosphere carry you through your session.
        </p>
      </div>

      <div className="sound-playlists container">
        <div className="row">
          {playlistsData.map((pl) => (
            <div key={pl.name} className="col-md-4 mb-4">
              <div className="playlist-card h-100 shadow-sm">
                <div className="playlist-image-container" onClick={() => handlePlayInPlace(pl)}>
                  <img src={pl.coverImage} alt={pl.name} />
                  <button
                    className="play-button"
                    onClick={(e) => { e.stopPropagation(); handlePlayInPlace(pl); }}
                  >
                    {playingPlaylist?.name === pl.name ? "⏸" : "▶"}
                  </button>
                </div>
                <div className="card-body">
                  <button className="btn btn-primary btn-sm" onClick={() => openModal(pl)}>
                    Preview
                  </button>
                  <button className="btn btn-outline btn-sm" onClick={() => handleSelect(pl)}>
                    Select
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {selectedPlaylist && (
        <div
          className={`sound-modal-overlay ${modalVisible ? "visible" : ""}`}
          onClick={closeModal}
        >
          <div
            className={`modal-playlist ${modalVisible ? "visible" : ""}`}
            onClick={e => e.stopPropagation()}
          >
            <div className="modal-playlist-header">
              <h2>{selectedPlaylist.name}</h2>
              <button className="close-modal" onClick={closeModal}>✕</button>
            </div>
            <div className="modal-sounds">
              {selectedPlaylist.sounds.map((sound, index) => {
                const previewUrl = getPreview(sound);
                if (!previewUrl) return null;
                return (
                  <div
                    key={sound.id}
                    className="modal-sound-item"
                    style={{ animationDelay: `${index * 0.05}s` }}
                  >
                    <p>{sound.name}</p>
                    <audio controls>
                      <source src={previewUrl} />
                    </audio>
                  </div>
                );
              })}
            </div>
            <div className="modal-playlist-footer">
              <button className="btn-primary" onClick={() => { handleSelect(selectedPlaylist); closeModal(); }}>
                Select this playlist
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};