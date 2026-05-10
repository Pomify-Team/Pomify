import { useState } from "react";
import { createPortal } from "react-dom";
import "../styles/welcomePage.css";
import { TypingText } from "../components/TypingText";
import { RegisterModal } from "../components/RegisterModal";
import { LoginModal } from "../components/LoginModal";
import Folder from "../components/Folder";
import TiltedCard from "../components/TiltedCard";
import pomifyLogo from "../assets/img/pomify_logo.png";
import useLanguage from "../context/LanguageContext";

const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

export const WelcomePage = () => {
  const { t, language, changeLanguage } = useLanguage();
  const [showRegister, setShowRegister] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [isLangOpen, setIsLangOpen] = useState(false);

  const pomodoroModes = [
    {
      label: "20/5",
      title: t("welcome.lightFocusTitle"),
      desc: t("welcome.lightFocusDesc"),
      bg: "#E2E8DF",
    },
    {
      label: "30/10",
      title: t("welcome.deepWorkTitle"),
      desc: t("welcome.deepWorkDesc"),
      bg: "#D8E0D4",
    },
    {
      label: "60/15",
      title: t("welcome.ultraFocusTitle"),
      desc: t("welcome.ultraFocusDesc"),
      bg: "#CED8C9",
    },
  ];

  return (
    <>
      <div className="welcome-container">
        <header className="welcome-topbar" id="welcome-top">
          <img
            src={pomifyLogo}
            alt="Pomify"
            style={{ height: "32px", width: "auto" }}
          />
          <div style={{ flex: 1 }} />
          <div
            className="lang-dropdown-container"
            style={{ position: "relative" }}
            onMouseLeave={() => setIsLangOpen(false)}
          >
            <button
              className="lang-btn"
              onClick={() => setIsLangOpen(!isLangOpen)}
            >
              <span className="lang-label">
                {language === "en" ? "🇺🇸" : "🇪🇸"}
              </span>
              <span className="lang-arrow">▾</span>
            </button>
            {isLangOpen && (
              <div className="lang-menu">
                <button
                  className={`lang-option${language === "en" ? " active" : ""}`}
                  onClick={() => {
                    changeLanguage("en");
                    setIsLangOpen(false);
                  }}
                >
                  🇺🇸 English
                </button>
                <button
                  className={`lang-option${language === "es" ? " active" : ""}`}
                  onClick={() => {
                    changeLanguage("es");
                    setIsLangOpen(false);
                  }}
                >
                  🇪🇸 Español
                </button>
              </div>
            )}
          </div>
        </header>

        <section className="welcome-hero">
          <div className="welcome-hero-inner">
            <div className="welcome-hero-row">
              <h1 className="welcome-title">
                <TypingText />
              </h1>
              <div className="welcome-hero-right">
                <p className="welcome-text">
                  <strong>Pomify</strong> {t("welcome.description")}
                  <strong> {t("welcome.tagline")}</strong>
                </p>
                <div className="welcome-buttons">
                  <button
                    className="btn-signup"
                    onClick={() => setShowRegister(true)}
                  >
                    {t("welcome.signUp")}
                  </button>
                  <button
                    className="btn-login"
                    onClick={() => setShowLogin(true)}
                  >
                    {t("welcome.login")}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        <div className="welcome-sections">
          <section className="wcard">
            <div className="wcard-split">
              <div className="wcard-text">
                <h2 className="wcard-title">{t("welcome.pomodoroTitle")}</h2>
                <p className="wcard-desc">{t("welcome.pomodoroDesc")}</p>
              </div>
              <div className="wcard-visual wcard-visual--stack">
                {pomodoroModes.map((mode, i) => (
                  <div
                    key={mode.label}
                    className="pmode-card"
                    style={{ background: mode.bg, zIndex: i + 1 }}
                  >
                    <span className="pmode-label">{mode.label}</span>
                    <h3 className="pmode-title">{mode.title}</h3>
                    <p className="pmode-desc">{mode.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="wcard">
            <div className="wcard-split">
              <div className="wcard-text">
                <h2 className="wcard-title">{t("welcome.notesTitle")}</h2>
                <p className="wcard-desc">{t("welcome.notesDesc")}</p>
              </div>
              <div className="wcard-visual">
                <div className="folder-outer">
                  <Folder
                    color="#2D3A4A"
                    size={2}
                    items={[
                      <span
                        key="1"
                        style={{ fontSize: 9, color: "#6B7280", padding: 4 }}
                      >
                        Notes
                      </span>,
                      <span
                        key="2"
                        style={{
                          fontSize: 9,
                          color: "#7f8592",
                          padding: 4,
                          display: "block",
                          width: "100%",
                          textAlign: "right",
                        }}
                      >
                        Ideas
                      </span>,
                      <span
                        key="3"
                        style={{ fontSize: 9, color: "#6B7280", padding: 4 }}
                      >
                        Important
                      </span>,
                    ]}
                  />
                </div>
              </div>
            </div>
          </section>

          <section className="wcard">
            <div className="wcard-split wcard-split--reverse">
              <div className="wcard-visual">
                <div className="tiltedcard-outer">
                  <TiltedCard
                    imageSrc="https://i.pinimg.com/736x/be/09/0c/be090cb8fe6361c5209aba57dd19958a.jpg"
                    altText="Focus music"
                    captionText="Focus Music"
                    containerHeight="220px"
                    containerWidth="220px"
                    imageHeight="220px"
                    imageWidth="220px"
                    scaleOnHover={1.05}
                    rotateAmplitude={12}
                    showTooltip={true}
                    showMobileWarning={false}
                  />
                </div>
              </div>
              <div className="wcard-text">
                <h2 className="wcard-title">{t("welcome.musicTitle")}</h2>
                <p className="wcard-desc">{t("welcome.musicDesc")}</p>
              </div>
            </div>
          </section>
        </div>

        <section className="welcome-cta">
          <button className="btn-cta" onClick={scrollToTop}>
            {t("welcome.cta")}
          </button>
        </section>

        <footer className="welcome-footer">
          <span>{t("common.copyright")}</span>
          <span>Juan · Messen · Denn</span>
        </footer>
      </div>

      {showRegister &&
        createPortal(
          <RegisterModal
            onClose={() => setShowRegister(false)}
            onSwitchToLogin={() => {
              setShowRegister(false);
              setShowLogin(true);
            }}
          />,
          document.body,
        )}

      {showLogin &&
        createPortal(
          <LoginModal
            onClose={() => setShowLogin(false)}
            onSwitchToRegister={() => {
              setShowLogin(false);
              setShowRegister(true);
            }}
          />,
          document.body,
        )}
    </>
  );
};
