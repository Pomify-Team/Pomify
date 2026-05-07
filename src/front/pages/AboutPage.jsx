import { useNavigate } from "react-router-dom";
import "../styles/aboutPage.css"
import pomifyLogo from "../assets/img/pomify_logo.png";

const features = [
    {
        badge: "Focus",
        icon: "⏱",
        title: "Pomodoro Timer",
        description:
            "Work in focused sprints and short breaks using the proven Pomodoro technique. Pomify keeps track of your sessions so you stay in flow without burning out. Customize your work and break intervals to match your rhythm.",
        image: "/screenshots/pomodoro-zone.png",
        alt: "Pomify Pomodoro timer interface",
    },
    {
        badge: "Notes",
        icon: "📝",
        title: "Pages & Notes",
        description:
            "Write, edit, and organise your notes while you work — no context switching. Keep ideas, meeting notes, or research right next to your timer inside collapsible pages so nothing slips through the cracks.",
        image: "/screenshots/pages-zone.png",
        alt: "Pomify notes and pages interface",
        reverse: true,
    },
    {
        badge: "Playlists",
        icon: "🎵",
        title: "Ambient Sounds",
        description:
            "Pick a curated soundscape — rain, forest, ocean, café, lo-fi — and let it fade into the background while you work. The music player lives in the app so you never have to leave your flow to change the track.",
        image: "/screenshots/music-zone.png",
        alt: "Pomify ambient sounds and music player",
    },
    {
        badge: "Folders",
        icon: "📁",
        title: "Folders",
        description:
            "Group your pages and notes into folders to keep your workspace tidy. Whether you organise by project, subject, or client — Pomify gives you the structure so you can focus on the work, not the filing.",
        image: "/screenshots/folders-zone.png",
        alt: "Pomify folders and organisation interface",
        reverse: true,
    },
    {
        badge: "Goals",
        icon: "🎯",
        title: "Your Goals",
        description:
        "Create your goals and keep them moving by updating their status to urgent, in progress, or done. Add new ones or remove them whenever you like. Best of all, your goals are always in sight, easily accessible from the navbar.",
        image: "/screenshots/goals-zone.png",
        alt: "Pomify folders and organisation interface",
        reverse: true,
    },
];

export const AboutPage = () => {
    const navigate = useNavigate();

    return (
        <div style={{
            maxWidth: "720px",
            margin: "0 auto",
            padding: "2.5rem 1.5rem",
            fontFamily: "'Inter', 'DM Sans', sans-serif"
        }}>
            <button
                onClick={() => navigate("/home")}
                style={{
                    padding: "8px 16px",
                    borderRadius: "8px",
                    border: "1.5px solid var(--color-divider)",
                    background: "transparent",
                    color: "var(--color-text-primary)",
                    cursor: "pointer",
                    fontSize: "0.9rem",
                    marginBottom: "2rem",
                    display: "inline-block"
                }}
            >← Home</button>

            {/* Hero */}
            <div style={{ textAlign: "center", marginBottom: "3rem" }}>
                <img
                    src={pomifyLogo}
                    alt="Pomify"
                    style={{
                        height: "clamp(60px, 10vw, 120px)",
                        width: "auto",
                        marginBottom: "1rem"
                    }}
                />
                <p style={{
                    fontSize: "1.1rem",
                    color: "var(--color-text-secondary)",
                    lineHeight: 1.7,
                    maxWidth: "520px",
                    margin: "0 auto"
                }}>
                    A productivity app designed to help you focus, organize your work, and achieve your goals — all in one place.
                </p>
            </div>

            <hr className="about-divider" />

            {features.map((feature, index) => (
                <div
                    key={index}
                    className={`about-feature-row${feature.reverse ? " reverse" : ""}`}
                >
                    {feature.image ? (
                        <div className="about-feature-img-wrap">
                            <img
                                src={feature.image}
                                alt={feature.alt}
                                onError={(e) => {
                                    e.currentTarget.parentElement.style.display = "none";
                                }}
                            />
                        </div>
                    ) : (
                        <div className="about-feature-img-placeholder">
                            {feature.icon}
                        </div>
                    )}

                    <div className="about-feature-text">
                        <span className="about-feature-badge">{feature.badge}</span>
                        <h3 className="about-feature-title">{feature.title}</h3>
                        <p className="about-feature-desc">{feature.description}</p>
                    </div>
                </div>
            ))}

            <div className="about-cta-wrap">
                <button className="about-cta-btn" onClick={() => navigate("/home")}>
                    Go to the app →
                </button>
            </div>

            {/* Team */}
            <div style={{
                background: "var(--color-surface)",
                borderRadius: "14px",
                padding: "2rem",
                border: "1px solid var(--color-divider)",
                textAlign: "center"
            }}>
                <h2 style={{
                    fontSize: "1.1rem",
                    fontWeight: 700,
                    color: "var(--color-text-primary)",
                    margin: "0 0 0.5rem"
                }}>Built by</h2>
                <p style={{
                    fontSize: "1rem",
                    color: "var(--color-text-secondary)",
                    margin: "0 0 1rem"
                }}>Dennielys · Messen · Juan</p>
                <p style={{
                    fontSize: "0.82rem",
                    color: "var(--color-text-secondary)",
                    margin: 0
                }}>© 2026 Pomify — All rights reserved</p>
            </div>
        </div>
    );
};