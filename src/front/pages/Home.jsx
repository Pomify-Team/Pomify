import "../styles/home.css";
import { PomodoroZone } from "../components/PomodoroZone";
import { PagesZone } from "../components/PagesZone";
import { useEffect, useState } from "react";  // ← añade
import { useLocation } from "react-router-dom";  // ← añade

export const Home = () => {
    const location = useLocation();
    const [showWelcome, setShowWelcome] = useState(false);

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

            <div className="row g-0 home-row">
                <div className="col-12 col-xl-4 home-left">
                    <PomodoroZone />
                </div>
                <div className="home-divider d-none d-xl-block" />
                <div className="col-12 col-xl home-right">
                    <PagesZone />
                </div>
            </div>
        </div>
    );
};