import "../styles/resetPassword.css";
import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { resetPassword } from "../services/loginBS";

export const ResetPassword = () => {
    const [searchParams] = useSearchParams();
    const token = searchParams.get("token");
    const navigate = useNavigate();

    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!password) { setError("Please enter a new password."); return; }
        if (password !== confirmPassword) { setError("Passwords do not match."); return; }
        try {
            await resetPassword(token, password);
            setMessage("Password updated! Redirecting...");
            setTimeout(() => navigate("/"), 2000);
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <div className="reset-page">
            <div className="reset-card">
                <h2 className="modal-title">reset password</h2>
                <form className="modal-form" onSubmit={handleSubmit}>
                    <input
                        type="password"
                        placeholder="new password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="form-input"
                    />
                    <input
                        type="password"
                        placeholder="confirm password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="form-input"
                    />
                    {error && <div className="form-error">{error}</div>}
                    {message && <div className="form-success">{message}</div>}
                    <button type="submit" className="modal-btn-submit">
                        save new password
                    </button>
                </form>
            </div>
        </div>
    );
};
