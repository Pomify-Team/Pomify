import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function GoogleCallback() {
    const navigate = useNavigate();

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const token = params.get("token");
        const isNew = params.get("is_new") === "True";

        if (token) {
            localStorage.setItem("token", token);
            // pequeño delay para asegurarse que el token está guardado
            setTimeout(() => {
                if (isNew) {
                    navigate("/home?welcome=true");
                } else {
                    navigate("/home");
                }
            }, 100);
        } else {
            navigate("/");
        }
    }, []);

    return <p>Iniciando sesión...</p>;
}