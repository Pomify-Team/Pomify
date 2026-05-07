import { useState } from "react";
import { createPortal } from "react-dom";
import "../styles/welcomePage.css";
import { TypingText } from "../components/TypingText";
import { RegisterModal } from "../components/RegisterModal";
import { LoginModal } from "../components/LoginModal";
import Folder from "../components/Folder";
import TiltedCard from "../components/TiltedCard";
import pomifyLogo from "../assets/img/pomify_logo.png";

const POMODORO_MODES = [
  { label: "20/5", title: "Light Focus", desc: "20 min focus · 5 min break · 3 cycles", bg: "#E2E8DF" },
  { label: "30/10", title: "Deep Work", desc: "30 min focus · 10 min break · 4 cycles", bg: "#D8E0D4" },
  { label: "60/15", title: "Ultra Focus", desc: "60 min focus · 15 min break · 3 cycles", bg: "#CED8C9" },
];

const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

export const WelcomePage = () => {
  const [showRegister, setShowRegister] = useState(false);
  const [showLogin, setShowLogin] = useState(false);

  return (
    <>
      <div className="welcome-container">

        <header className="welcome-topbar" id="welcome-top">
          <img src={pomifyLogo} alt="Pomify" style={{ height: "32px", width: "auto" }} />
        </header>

        <section className="welcome-hero">
          <div className="welcome-hero-inner">
            <div className="welcome-hero-row">
              <h1 className="welcome-title">
                <TypingText />
              </h1>
              <div className="welcome-hero-right">
                <p className="welcome-text">
                  <strong>Pomify</strong> combines a Pomodoro timer, task planning, and focus music to keep you in the flow —
                  <strong> one focused block at a time.</strong>
                </p>
                <div className="welcome-buttons">
                  <button className="btn-signup" onClick={() => setShowRegister(true)}>Sign up</button>
                  <button className="btn-login" onClick={() => setShowLogin(true)}>Login</button>
                </div>
              </div>
            </div>
          </div>
        </section>

        <div className="welcome-sections">

          <section className="wcard">
            <div className="wcard-split">
              <div className="wcard-text">
                <h2 className="wcard-title">Choose a Pomodoro mode</h2>
                <p className="wcard-desc">Pick the rhythm that best fits your work session.</p>
              </div>
              <div className="wcard-visual wcard-visual--stack">
                {POMODORO_MODES.map((mode, i) => (
                  <div key={mode.label} className="pmode-card" style={{ background: mode.bg, zIndex: i + 1 }}>
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
                <h2 className="wcard-title">Take notes on your pages and save them in Folders.</h2>
                <p className="wcard-desc">Access them anytime, anywhere.</p>
              </div>
              <div className="wcard-visual">
                <div className="folder-outer">
                  <Folder
                    color="#2D3A4A"
                    size={2}
                    items={[
                      <span key="1" style={{ fontSize: 9, color: "#6B7280", padding: 4 }}>Notes</span>,
                    <span key="2" style={{ fontSize: 9, color: "#7f8592", padding: 4,    display: "block",width: "100%",textAlign: "right" }}>Ideas</span>,                      <span key="3" style={{ fontSize: 9, color: "#6B7280", padding: 4 }}>Important</span>,
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
                <h2 className="wcard-title">Pick music that helps you stay focused.</h2>
                <p className="wcard-desc">No distractions — always better.</p>
              </div>
            </div>
          </section>

        </div>

        <section className="welcome-cta">
          <button className="btn-cta" onClick={scrollToTop}>Ready to start?</button>
        </section>

        <footer className="welcome-footer">
          <span>© 2026 Pomify</span>
          <span>Juan · Messen · Denn</span>
        </footer>

      </div>

      {showRegister && createPortal(
        <RegisterModal
          onClose={() => setShowRegister(false)}
          onSwitchToLogin={() => { setShowRegister(false); setShowLogin(true); }}
        />,
        document.body
      )}

      {showLogin && createPortal(
        <LoginModal
          onClose={() => setShowLogin(false)}
          onSwitchToRegister={() => { setShowLogin(false); setShowRegister(true); }}
        />,
        document.body
      )}
    </>
  );
};