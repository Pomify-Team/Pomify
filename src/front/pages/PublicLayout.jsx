import { Outlet, Navigate } from "react-router-dom"
import ScrollToTop from "../components/ScrollToTop"

export const PublicLayout = () => {
    const token = localStorage.getItem("token");
    if (token) return <Navigate to="/home" replace />;

    return (
        <ScrollToTop>
            <Outlet />
        </ScrollToTop>
    )
}