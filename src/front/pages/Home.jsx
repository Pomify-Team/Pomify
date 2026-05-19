import "../styles/home.css";
import { PomodoroZone } from "../components/PomodoroZone";
import { PagesZone } from "../components/PagesZone";
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import useLanguage from "../context/LanguageContext";

const useIsMobile = () => {
    const [isMobile, setIsMobile] = useState(() => window.innerWidth <= 1199);
    useEffect(() => {
        const handler = () => setIsMobile(window.innerWidth <= 1199);
        window.addEventListener("resize", handler);
        return () => window.removeEventListener("resize", handler);
    }, []);
    return isMobile;
};

export const Home = () => {
    const location = useLocation();
    const [showWelcome, setShowWelcome] = useState(false);
    const [mobileTab, setMobileTab] = useState("pomodoro");
    const isMobile = useIsMobile();
    const { t } = useLanguage();

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        if (params.get("welcome") === "true") {
            setShowWelcome(true);
            setTimeout(() => setShowWelcome(false), 3000);
        }
    }, []);

    return (
        <div className="home-wrapper">
            {showWelcome && (
                <div className="welcome-toast">
                    🍅 ¡Bienvenido/a a Pomify!
                </div>
            )}

            {isMobile ? (
                <>
                    <div className="home-tabs">
                        <button
                            className={`home-tab${mobileTab === "pomodoro" ? " home-tab--active" : ""}`}
                            onClick={() => setMobileTab("pomodoro")}
                        >
                            {t("home.pomodoro")}
                        </button>
                        <button
                            className={`home-tab${mobileTab === "pages" ? " home-tab--active" : ""}`}
                            onClick={() => setMobileTab("pages")}
                        >
                            {t("home.pages")}
                        </button>
                    </div>

                    <div className="home-mobile">
                        <div className={`home-mobile-panel${mobileTab === "pomodoro" ? " home-mobile-panel--active" : ""}`}>
                            <div className="home-mobile-pomodoro">
                                <PomodoroZone />
                            </div>
                        </div>
                        <div className={`home-mobile-panel${mobileTab === "pages" ? " home-mobile-panel--active" : ""}`}>
                            <div className="home-mobile-pages">
                                <PagesZone />
                            </div>
                        </div>
                    </div>
                </>
            ) : (
                <div className="row g-0 home-row">
                    <div className="col-12 col-xl-4 home-left">
                        <PomodoroZone />
                    </div>
                    <div className="home-divider d-none d-xl-block" />
                    <div className="col-12 col-xl home-right">
                        <PagesZone />
                    </div>
                </div>
            )}
        </div>
    );
};