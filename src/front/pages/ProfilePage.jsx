import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/profile.css";
import useLanguage from "../context/LanguageContext";
import { getShortcuts, createShortcut, updateShortcut, deleteShortcut } from "../components/ShortcutsService";
import pomifyLogo from "../assets/img/pomify_logo.png";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

const AVATARS = ["🐱", "🐻", "🐰", "🐥", "🐼", "😎"];

const PASSWORD_RULES = [
    { id: "length", test: (p) => p.length >= 8 },
    { id: "number", test: (p) => /\d/.test(p) },
    { id: "symbol", test: (p) => /[^a-zA-Z0-9]/.test(p) },
];
const ruleKeys = { length: "auth.ruleLength", number: "auth.ruleNumber", symbol: "auth.ruleSymbol" };

const getStrength = (password) => {
    const passed = PASSWORD_RULES.filter(r => r.test(password)).length;
    if (passed === 0) return { level: 0, labelKey: "", color: "transparent" };
    if (passed === 1) return { level: 1, labelKey: "weak", color: "#E05252" };
    if (passed === 2) return { level: 2, labelKey: "fair", color: "#E0A852" };
    return { level: 3, labelKey: "strong", color: "#52A87C" };
};

const detectService = (url) => {
    if (!url) return "generic";
    const u = url.toLowerCase();
    if (u.includes("slack.com")) return "slack";
    if (u.includes("notion.so") || u.includes("notion.com")) return "notion";
    if (u.includes("meet.google.com")) return "google-meet";
    if (u.includes("calendar.google.com")) return "google-calendar";
    if (u.includes("github.com")) return "github";
    if (u.includes("discord.com") || u.includes("discord.gg")) return "discord";
    if (u.includes("zoom.us")) return "zoom";
    if (u.includes("figma.com")) return "figma";
    if (u.includes("linear.app")) return "linear";
    if (u.includes("trello.com")) return "trello";
    if (u.includes("youtube.com") || u.includes("youtu.be")) return "youtube";
    if (u.includes("google.com/drive") || u.includes("drive.google.com")) return "google-drive";
    if (u.includes("docs.google.com")) return "google-docs";
    if (u.includes("miro.com")) return "miro";
    if (u.includes("teams.microsoft.com")) return "teams";
    if (u.includes("spotify.com")) return "spotify";
    if (u.includes("pomify")) return "pomify";
    return "generic";
};

const SERVICE_CONFIG = {
    slack:            { logo: "https://cdn.simpleicons.org/slack/4A154B",          bg: "#EDE9F5" },
    notion:           { logo: "https://cdn.simpleicons.org/notion/000000",          bg: "#F5F3EE" },
    "google-meet":    { logo: "https://cdn.simpleicons.org/googlemeet/00897B",      bg: "#E8F5EE" },
    "google-calendar":{ logo: "https://cdn.simpleicons.org/googlecalendar/4285F4",  bg: "#EAF0F8" },
    github:           { logo: "https://cdn.simpleicons.org/github/171515",          bg: "#F0F0EC" },
    discord:          { logo: "https://cdn.simpleicons.org/discord/5865F2",         bg: "#EEEEF8" },
    zoom:             { logo: "https://cdn.simpleicons.org/zoom/2D8CFF",            bg: "#E8F0F8" },
    figma:            { logo: "https://cdn.simpleicons.org/figma/F24E1E",           bg: "#FFF0EC" },
    linear:           { logo: "https://cdn.simpleicons.org/linear/5E6AD2",          bg: "#EEEEF8" },
    trello:           { logo: "https://cdn.simpleicons.org/trello/0052CC",          bg: "#E8F0F8" },
    youtube:          { logo: "https://cdn.simpleicons.org/youtube/FF0000",          bg: "#FFF0F0" },
    "google-drive":   { logo: "https://cdn.simpleicons.org/googledrive/4285F4",     bg: "#EAF0F8" },
    "google-docs":    { logo: "https://cdn.simpleicons.org/googledocs/4285F4",      bg: "#EAF0F8" },
    miro:             { logo: "https://cdn.simpleicons.org/miro/FFD02F",             bg: "#FFFBEA" },
    teams:            { logo: "https://cdn.simpleicons.org/microsoftteams/6264A7",  bg: "#EEEEF8" },
    spotify:          { logo: "https://cdn.simpleicons.org/spotify/1DB954",          bg: "#E8F5EE" },
    pomify:           { logo: pomifyLogo,                                            bg: "#E8EDE6" },
    generic:          { logo: null,                                                  bg: "#F5F3EE" },
};

const getFaviconUrl = (url) => {
    try {
        const domain = new URL(url).hostname;
        return `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;
    } catch {
        return null;
    }
};

const getServiceConfig = (service, name, url) => {
    const cfg = SERVICE_CONFIG[service] || SERVICE_CONFIG.generic;
    const favicon = cfg.logo ? null : getFaviconUrl(url);
    return { ...cfg, logo: cfg.logo || favicon, fallbackIcon: name?.[0]?.toUpperCase() ?? "?" };
};

export const ProfilePage = () => {
    const navigate = useNavigate();
    const { t } = useLanguage();
    const [user, setUser] = useState(null);
    const [shortcuts, setShortcuts] = useState([]);

    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showLogoutModal, setShowLogoutModal] = useState(false);
    const [showAddLinkModal, setShowAddLinkModal] = useState(false);

    // Edit modal state (local — only applies on save)
    const [editName, setEditName] = useState("");
    const [editEmail, setEditEmail] = useState("");
    const [editAvatar, setEditAvatar] = useState(null);
    const [avatarTab, setAvatarTab] = useState("emoji");
    const [editPassword, setEditPassword] = useState("");
    const [editPasswordConfirm, setEditPasswordConfirm] = useState("");
    const [passwordTouched, setPasswordTouched] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);
    const [editError, setEditError] = useState("");
    const [editSuccess, setEditSuccess] = useState(false);
    const [editSaving, setEditSaving] = useState(false);

    const [newLinkName, setNewLinkName] = useState("");
    const [newLinkUrl, setNewLinkUrl] = useState("");
    const [linkError, setLinkError] = useState("");

    const [editingShortcut, setEditingShortcut] = useState(null);
    const [editLinkName, setEditLinkName] = useState("");
    const [editLinkUrl, setEditLinkUrl] = useState("");
    const [editLinkError, setEditLinkError] = useState("");

    const strength = getStrength(editPassword);
    const allRulesPassed = PASSWORD_RULES.every(r => r.test(editPassword));

    useEffect(() => {
        const load = async () => {
            const res = await fetch(`${BACKEND_URL}/api/user/profile`, {
                headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
            });
            if (!res.ok) { navigate("/"); return; }
            setUser(await res.json());
        };
        load();
        loadShortcuts();
    }, []);

    const loadShortcuts = async () => setShortcuts(await getShortcuts());

    const handleOpenEdit = () => {
        setEditName(user.name || "");
        setEditEmail(user.email || "");
        setEditAvatar(user.avatar_url || null);
        setEditPassword("");
        setEditPasswordConfirm("");
        setPasswordTouched(false);
        setShowPassword(false);
        setShowPasswordConfirm(false);
        setEditError("");
        setEditSuccess(false);
        setAvatarTab("emoji");
        setShowEditModal(true);
    };

    const handleSaveEdit = async () => {
        if (!editName.trim() || !editEmail.trim()) {
            setEditError(t("profile.nameEmailRequired")); return;
        }
        if (editPassword) {
            if (!allRulesPassed) { setEditError(t("profile.passwordRequirements")); return; }
            if (editPassword !== editPasswordConfirm) { setEditError(t("auth.passwordsMismatch")); return; }
        }
        const body = {
            name: editName.trim(),
            email: editEmail.trim(),
            avatar_url: editAvatar,
        };
        if (editPassword) body.password = editPassword;

        setEditSaving(true);
        const res = await fetch(`${BACKEND_URL}/api/user/profile`, {
            method: "PUT",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${localStorage.getItem("token")}` },
            body: JSON.stringify(body)
        });
        setEditSaving(false);
        if (!res.ok) { const err = await res.json(); setEditError(err.message || t("profile.updateError")); return; }
        const data = await res.json();
        setUser(data.user);
        setEditSuccess(true);
        setTimeout(() => { setShowEditModal(false); setEditSuccess(false); }, 900);
    };

    const handlePhotoUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (ev) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement("canvas");
                const MAX = 200;
                let { width, height } = img;
                if (width > height) {
                    if (width > MAX) { height = Math.round(height * MAX / width); width = MAX; }
                } else {
                    if (height > MAX) { width = Math.round(width * MAX / height); height = MAX; }
                }
                canvas.width = width;
                canvas.height = height;
                canvas.getContext("2d").drawImage(img, 0, 0, width, height);
                setEditAvatar(canvas.toDataURL("image/jpeg", 0.82));
            };
            img.src = ev.target.result;
        };
        reader.readAsDataURL(file);
    };

    const handleAddLink = async () => {
        if (!newLinkName.trim() || !newLinkUrl.trim()) { setLinkError("Nombre y URL son obligatorios"); return; }
        const rawUrl = newLinkUrl.trim();
        const normalizedUrl = rawUrl.startsWith("http://") || rawUrl.startsWith("https://") ? rawUrl : `https://${rawUrl}`;
        const service = detectService(normalizedUrl);
        const data = await createShortcut(newLinkName.trim(), normalizedUrl, service);
        if (!data?.shortcut) { setLinkError("Error al guardar el enlace"); return; }
        setShortcuts(prev => [...prev, data.shortcut]);
        setNewLinkName(""); setNewLinkUrl(""); setLinkError("");
        setShowAddLinkModal(false);
    };

    const handleOpenEditShortcut = (s, e) => {
        e.preventDefault();
        e.stopPropagation();
        setEditingShortcut(s);
        setEditLinkName(s.name);
        setEditLinkUrl(s.url);
        setEditLinkError("");
    };

    const handleSaveEditShortcut = async () => {
        if (!editLinkName.trim() || !editLinkUrl.trim()) { setEditLinkError("Nombre y URL son obligatorios"); return; }
        const rawUrl = editLinkUrl.trim();
        const normalizedUrl = rawUrl.startsWith("http://") || rawUrl.startsWith("https://") ? rawUrl : `https://${rawUrl}`;
        const service = detectService(normalizedUrl);
        const data = await updateShortcut(editingShortcut.id, editLinkName.trim(), normalizedUrl, service);
        if (!data?.shortcut) { setEditLinkError("Error al guardar"); return; }
        setShortcuts(prev => prev.map(s => s.id === editingShortcut.id ? data.shortcut : s));
        setEditingShortcut(null);
    };

    const handleDeleteShortcut = async (id, e) => {
        e.preventDefault();
        e.stopPropagation();
        await deleteShortcut(id);
        setShortcuts(prev => prev.filter(s => s.id !== id));
    };

    const handleDeleteAccount = async () => {
        await fetch(`${BACKEND_URL}/api/user/profile`, {
            method: "DELETE",
            headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
        });
        localStorage.removeItem("token");
        navigate("/");
    };

    const handleLogout = () => { localStorage.removeItem("token"); navigate("/"); };

    const getInitial = () => (user?.name || user?.email || "U")[0].toUpperCase();

    const renderAvatarFrom = (av, size = 64) => {
        if (!av) return <span className="prof-avatar-initial" style={{ fontSize: size * 0.38 }}>{getInitial()}</span>;
        if (av.startsWith("http") || av.startsWith("data:"))
            return <img src={av} alt="avatar" style={{ width: "100%", height: "100%", borderRadius: "50%", objectFit: "cover" }} />;
        return <span className="prof-avatar-emoji" style={{ fontSize: size * 0.4 }}>{av}</span>;
    };

    if (!user) return <div className="prof-loading">{t("common.loading")}</div>;

    return (
        <div className="prof-page">
            <div className="prof-layout">

                {/* ── Header ── */}
                <div className="prof-header">
                    <div className="prof-header-left">
                        <div className="prof-avatar-wrap">{renderAvatarFrom(user.avatar_url, 64)}</div>
                        <span className="prof-header-name">{user.name}</span>
                    </div>
                    <div className="prof-header-actions">
                        <button className="prof-btn-outline" onClick={handleOpenEdit}>{t("profile.edit")}</button>
                        <button className="prof-btn-logout" onClick={() => setShowLogoutModal(true)}>{t("auth.logout")}</button>
                    </div>
                </div>

                <div className="prof-divider" />

                {/* ── Shortcuts ── */}
                <div className="prof-shortcuts-section">
                    <div className="prof-shortcuts-top">
                        <div>
                            <h2 className="prof-shortcuts-title">{t("profile.shortcuts")}</h2>
                            <p className="prof-shortcuts-sub">{t("profile.shortcutsSub")}</p>
                        </div>
                        <button className="prof-add-link-btn" onClick={() => setShowAddLinkModal(true)}>{t("profile.addLink")}</button>
                    </div>

                    <div className="prof-shortcuts-grid">
                        {shortcuts.map(s => {
                            const cfg = getServiceConfig(s.service, s.name, s.url);
                            return (
                                <a key={s.id} href={s.url} target="_blank" rel="noopener noreferrer"
                                    className="prof-shortcut-card" style={{ background: cfg.bg }}>
                                    <div className="prof-shortcut-icon-wrap">
                                        {cfg.logo
                                            ? <img src={cfg.logo} alt={s.service} className="prof-shortcut-logo" />
                                            : <span className="prof-shortcut-fallback">{cfg.fallbackIcon}</span>
                                        }
                                    </div>
                                    <div className="prof-shortcut-info">
                                        <span className="prof-shortcut-name">{s.name}</span>
                                        <span className="prof-shortcut-service">{s.service === "generic" ? "" : s.service.replace("-", " ")}</span>
                                    </div>
                                    <div className="prof-shortcut-actions">
                                        <button className="prof-shortcut-edit" onClick={(e) => handleOpenEditShortcut(s, e)} title="Editar">✎</button>
                                        <button className="prof-shortcut-del" onClick={(e) => handleDeleteShortcut(s.id, e)} title="Eliminar">✕</button>
                                    </div>
                                </a>
                            );
                        })}
                        <button className="prof-shortcut-card prof-shortcut-empty" onClick={() => setShowAddLinkModal(true)}>
                            {t("profile.addLink")}
                        </button>
                    </div>
                </div>
            </div>

            {/* ── Modal: edit profile ── */}
            {showEditModal && (
                <div className="prof-overlay" onClick={() => setShowEditModal(false)}>
                    <div className="prof-modal" onClick={e => e.stopPropagation()}>
                        <div className="prof-modal-header">
                            <span className="prof-modal-title">{t("profile.edit")}</span>
                            <button className="prof-modal-close" onClick={() => setShowEditModal(false)}>✕</button>
                        </div>
                        <div className="prof-modal-body">
                            <label className="prof-label">{t("profile.avatar")}</label>
                            <div className="prof-avatar-edit-row">
                                <div className="prof-avatar-wrap" style={{ width: 52, height: 52, flexShrink: 0 }}>
                                    {renderAvatarFrom(editAvatar, 52)}
                                </div>
                                <div className="prof-avatar-tabs-wrap">
                                    <div className="prof-avatar-tabs">
                                        <button className={`prof-avatar-tab${avatarTab === "emoji" ? " active" : ""}`} onClick={() => setAvatarTab("emoji")}>emoji</button>
                                        <button className={`prof-avatar-tab${avatarTab === "photo" ? " active" : ""}`} onClick={() => setAvatarTab("photo")}>foto</button>
                                    </div>
                                    {avatarTab === "emoji" && (
                                        <div className="prof-avatar-picker">
                                            {AVATARS.map(emoji => (
                                                <button key={emoji}
                                                    className={`prof-avatar-option${editAvatar === emoji ? " selected" : ""}`}
                                                    onClick={() => setEditAvatar(emoji)}>{emoji}</button>
                                            ))}
                                            {editAvatar && (
                                                <button className="prof-avatar-option prof-avatar-remove" onClick={() => setEditAvatar(null)} title="Quitar">✕</button>
                                            )}
                                        </div>
                                    )}
                                    {avatarTab === "photo" && (
                                        <div className="prof-photo-upload">
                                            <label className="prof-photo-label">
                                                <input type="file" accept="image/*" style={{ display: "none" }} onChange={handlePhotoUpload} />
                                                <span className="prof-photo-btn">subir foto</span>
                                            </label>
                                            <span className="prof-photo-hint">jpg, png, gif · máx 5MB</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <label className="prof-label">{t("profile.name")}</label>
                            <input className="prof-input" value={editName} onChange={e => setEditName(e.target.value)} placeholder={t("profile.yourName")} />

                            <label className="prof-label">{t("profile.email")}</label>
                            <input className="prof-input" type="email" value={editEmail} onChange={e => setEditEmail(e.target.value)} placeholder={t("profile.yourEmail")} />

                            <label className="prof-label">{t("profile.newPassword")} <span className="prof-label-optional">{t("common.optional")}</span></label>
                            <div className="prof-input-wrapper">
                                <input className="prof-input" type={showPassword ? "text" : "password"} value={editPassword}
                                    onChange={e => { setPasswordTouched(true); setEditPassword(e.target.value); }} placeholder={t("profile.minChars")} />
                                <button type="button" className="prof-toggle-password" onClick={() => setShowPassword(!showPassword)}>
                                    {showPassword ? "●" : "○"}
                                </button>
                            </div>

                            {passwordTouched && editPassword.length > 0 && (
                                <div className="prof-strength-wrapper">
                                    <div className="prof-strength-track">
                                        <div className="prof-strength-fill" style={{ width: `${(strength.level / 3) * 100}%`, background: strength.color }} />
                                    </div>
                                    <span className="prof-strength-label" style={{ color: strength.color }}>
                                        {strength.labelKey ? t(`auth.${strength.labelKey}`) : ""}
                                    </span>
                                    <ul className="prof-rules">
                                        {PASSWORD_RULES.map(rule => {
                                            const ok = rule.test(editPassword);
                                            return (
                                                <li key={rule.id} className={ok ? "prof-rule-ok" : "prof-rule-fail"}>
                                                    <span>{ok ? "✓" : "✗"}</span> {t(ruleKeys[rule.id])}
                                                </li>
                                            );
                                        })}
                                    </ul>
                                </div>
                            )}

                            <label className="prof-label">{t("profile.confirmPassword")}</label>
                            <div className="prof-input-wrapper">
                                <input className="prof-input" type={showPasswordConfirm ? "text" : "password"} value={editPasswordConfirm}
                                    onChange={e => setEditPasswordConfirm(e.target.value)} placeholder={t("profile.repeatPassword")} />
                                <button type="button" className="prof-toggle-password" onClick={() => setShowPasswordConfirm(!showPasswordConfirm)}>
                                    {showPasswordConfirm ? "●" : "○"}
                                </button>
                            </div>

                            {editError && <p className="prof-error">{editError}</p>}
                            {editSuccess && <p className="prof-success">{t("profile.savedSuccess")}</p>}
                        </div>
                        <div className="prof-modal-bottom">
                            <button className="prof-btn-delete-inline" onClick={() => { setShowEditModal(false); setShowDeleteModal(true); }}>
                                {t("profile.deleteAccount")}
                            </button>
                            <div className="prof-modal-actions" style={{ margin: 0 }}>
                                <button className="prof-btn-cancel" onClick={() => setShowEditModal(false)}>{t("common.cancel")}</button>
                                <button className="prof-btn-primary" onClick={handleSaveEdit} disabled={editSaving}>
                                    {editSaving ? "..." : t("profile.saveChanges")}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Modal: add link ── */}
            {showAddLinkModal && (
                <div className="prof-overlay" onClick={() => { setShowAddLinkModal(false); setLinkError(""); }}>
                    <div className="prof-modal prof-modal-sm" onClick={e => e.stopPropagation()}>
                        <div className="prof-modal-header">
                            <span className="prof-modal-title">add shortcut</span>
                            <button className="prof-modal-close" onClick={() => { setShowAddLinkModal(false); setLinkError(""); }}>✕</button>
                        </div>
                        <div className="prof-modal-body">
                            <label className="prof-label">nombre</label>
                            <input className="prof-input" value={newLinkName} onChange={e => setNewLinkName(e.target.value)}
                                placeholder="ej: Math 201 — Class Slack" autoFocus />
                            <label className="prof-label" style={{ marginTop: 8 }}>url</label>
                            <input className="prof-input" value={newLinkUrl} onChange={e => setNewLinkUrl(e.target.value)}
                                placeholder="https://..." onKeyDown={e => e.key === "Enter" && handleAddLink()} />
                            <p className="prof-link-hint">el servicio se detecta automáticamente</p>
                            {linkError && <p className="prof-error">{linkError}</p>}
                        </div>
                        <div className="prof-modal-actions">
                            <button className="prof-btn-cancel" onClick={() => { setShowAddLinkModal(false); setLinkError(""); }}>cancelar</button>
                            <button className="prof-btn-primary" onClick={handleAddLink}>añadir</button>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Modal: edit shortcut ── */}
            {editingShortcut && (
                <div className="prof-overlay" onClick={() => setEditingShortcut(null)}>
                    <div className="prof-modal prof-modal-sm" onClick={e => e.stopPropagation()}>
                        <div className="prof-modal-header">
                            <span className="prof-modal-title">editar shortcut</span>
                            <button className="prof-modal-close" onClick={() => setEditingShortcut(null)}>✕</button>
                        </div>
                        <div className="prof-modal-body">
                            <label className="prof-label">nombre</label>
                            <input className="prof-input" value={editLinkName} onChange={e => setEditLinkName(e.target.value)} autoFocus />
                            <label className="prof-label" style={{ marginTop: 8 }}>url</label>
                            <input className="prof-input" value={editLinkUrl} onChange={e => setEditLinkUrl(e.target.value)}
                                onKeyDown={e => e.key === "Enter" && handleSaveEditShortcut()} />
                            {editLinkError && <p className="prof-error">{editLinkError}</p>}
                        </div>
                        <div className="prof-modal-actions">
                            <button className="prof-btn-cancel" onClick={() => setEditingShortcut(null)}>cancelar</button>
                            <button className="prof-btn-primary" onClick={handleSaveEditShortcut}>guardar</button>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Modal: logout ── */}
            {showLogoutModal && (
                <div className="prof-overlay" onClick={() => setShowLogoutModal(false)}>
                    <div className="prof-modal prof-modal-confirm" onClick={e => e.stopPropagation()}>
                        <div className="prof-modal-title">{t("profile.signOut")}</div>
                        <p className="prof-confirm-text">{t("profile.sessionClose")}</p>
                        <div className="prof-modal-actions">
                            <button className="prof-btn-cancel" onClick={() => setShowLogoutModal(false)}>{t("common.cancel")}</button>
                            <button className="prof-btn-primary" onClick={handleLogout}>{t("profile.yesSignOut")}</button>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Modal: delete account ── */}
            {showDeleteModal && (
                <div className="prof-overlay" onClick={() => setShowDeleteModal(false)}>
                    <div className="prof-modal prof-modal-confirm" onClick={e => e.stopPropagation()}>
                        <div className="prof-modal-icon">🗑️</div>
                        <div className="prof-modal-title">{t("profile.deleteAccountQ")}</div>
                        <p className="prof-confirm-text">{t("profile.permanentAction")}</p>
                        <div className="prof-modal-actions">
                            <button className="prof-btn-cancel" onClick={() => setShowDeleteModal(false)}>{t("common.cancel")}</button>
                            <button className="prof-btn-danger" onClick={handleDeleteAccount}>{t("profile.yesDelete")}</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
