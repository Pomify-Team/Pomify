import { useEffect } from "react";
import { Outlet, useLocation, Navigate } from "react-router-dom/dist";
import ScrollToTop from "../components/ScrollToTop";
import { Navbar } from "../components/Navbar";
import { Footer } from "../components/Footer";
import useGlobalReducer from "../hooks/useGlobalReducer";
import { getProfile } from "../services/loginBS";

export const Layout = () => {
    const { dispatch } = useGlobalReducer();
    const location = useLocation();
    const isHome = location.pathname === "/home";
    const token = localStorage.getItem("token");

    useEffect(() => {
        const loadUser = async () => {
            if (!token) return;
            const user = await getProfile();
            if (user) {
                dispatch({ type: "set_user", payload: user });
            } else {
                localStorage.removeItem("token");
                dispatch({ type: "logout" });
            }
        };
        loadUser();
    }, []);

    if (!token) return <Navigate to="/" replace />;

    return (
        <ScrollToTop>
            <div
                style={{
                    display: "flex",
                    flexDirection: "column",
                    height: isHome ? "100vh" : "auto",
                    minHeight: "100vh",
                    overflow: isHome ? "hidden" : "visible",
                }}
            >
                <Navbar />
                <main
                    style={{
                        flex: 1,
                        minHeight: 0,
                        display: "flex",
                        flexDirection: "column",
                        overflow: isHome ? "hidden" : "visible",
                    }}
                >
                    <Outlet />
                </main>
                <Footer />
            </div>
        </ScrollToTop>
    );
};