import { useNavigate } from "react-router-dom";
import "../styles/aboutPage.css"
import pomifyLogo from "../assets/img/pomify_logo.png";
import useLanguage from "../context/LanguageContext";

export const AboutPage = () => {
    const navigate = useNavigate();
    const { t } = useLanguage();
    const features = t("about.features");

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
            >{t("common.home")}</button>

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
                    {t("about.description")}
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
                    {t("about.goToApp")}
                </button>
            </div>

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
                }}>{t("about.builtBy")}</h2>
                <p style={{
                    fontSize: "1rem",
                    color: "var(--color-text-secondary)",
                    margin: "0 0 1rem"
                }}>Dennielys · Messen · Juan</p>
                <p style={{
                    fontSize: "0.82rem",
                    color: "var(--color-text-secondary)",
                    margin: 0
                }}>{t("common.allRightsReserved")}</p>
            </div>
        </div>
    );
};
