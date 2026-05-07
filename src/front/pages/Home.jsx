import "../styles/home.css";
import { PomodoroZone } from "../components/PomodoroZone";
import { PagesZone } from "../components/PagesZone";

export const Home = () => {
    return (
        <div className="home-wrapper">
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