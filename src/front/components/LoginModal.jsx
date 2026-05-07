import "../styles/loginModal.css";
import { useState } from "react";
import { loginUser, forgotPassword } from "../services/loginBS";
import { useNavigate } from "react-router-dom";

export const LoginModal = ({ onClose, onSwitchToRegister }) => {

    const [user, setUser] = useState({ email: "", password: "" });
    const [error, setError] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [view, setView] = useState("login");
    const [forgotEmail, setForgotEmail] = useState("");
    const [forgotMessage, setForgotMessage] = useState("");
    const navigate = useNavigate();

    const handleOverlayClick = (e) => {
        if (e.target === e.currentTarget) onClose();
    };

    const handleChange = (e) => {
        setUser({ ...user, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!user.email || !user.password) {
            setError("All fields are required.");
            return;
        }
        try {
            const data = await loginUser({ ...user, email: user.email.trim().toLowerCase() });
            localStorage.setItem("token", data.token);
            onClose();
            navigate("/about");
        } catch (err) {
            setError(err.message);
        }
    };

    const handleForgot = async (e) => {
        e.preventDefault();
        if (!forgotEmail) { setForgotMessage("Please enter your email."); return; }
        try {
            await forgotPassword(forgotEmail.trim().toLowerCase());
            setForgotMessage("Check your email for the reset link!");
        } catch (err) {
            setForgotMessage(err.message);
        }
    };

    return (
        <div className="modal-overlay" onClick={handleOverlayClick}>
            <div className="modal-card">

                <button className="modal-close" onClick={onClose}>✕</button>

                {view === "login" ? (
                    <>
                        <h2 className="modal-title">log in</h2>

                        <form className="modal-form" onSubmit={handleSubmit}>
                            <div className="form-group">
                                <input
                                    type="email"
                                    name="email"
                                    value={user.email}
                                    placeholder="email"
                                    onChange={handleChange}
                                    className="form-input"
                                />
                            </div>

                            <div className="form-group input-password-wrapper">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    name="password"
                                    placeholder="password"
                                    value={user.password}
                                    onChange={handleChange}
                                    className="form-input"
                                />
                                <button
                                    type="button"
                                    className="toggle-password"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? "●" : "○"}
                                </button>
                            </div>

                            {error && (
                                <div className="form-error">
                                    {error}{" "}
                                    <span
                                        className="form-error-link"
                                        onClick={() => { setView("forgot"); setError(""); }}
                                    >
                                        <u>Reset password</u>
                                    </span>
                                </div>
                            )}

                            <button type="submit" className="modal-btn-submit">
                                log in
                            </button>
                        </form>

                        <p className="modal-footer-text">
                            Don't have an account?{" "}
                            <span className="modal-link" onClick={onSwitchToRegister}>
                                Sign up
                            </span>
                        </p>
                    </>
                ) : (
                    <>
                        <h2 className="modal-title">reset password</h2>

                        <p className="modal-subtitle">
                            Enter your email to receive a reset link.
                        </p>

                        <form className="modal-form" onSubmit={handleForgot}>
                            <div className="form-group">
                                <input
                                    type="email"
                                    placeholder="email"
                                    value={forgotEmail}
                                    onChange={(e) => setForgotEmail(e.target.value)}
                                    className="form-input"
                                />
                            </div>

                            {forgotMessage && (
                                <div className="form-error">{forgotMessage}</div>
                            )}

                            <button type="submit" className="modal-btn-submit">
                                send reset link
                            </button>
                        </form>

                        <p className="modal-footer-text">
                            <span className="modal-link" onClick={() => setView("login")}>
                                ← Back to log in
                            </span>
                            {" · "}
                            <span className="modal-link" onClick={onSwitchToRegister}>
                                Sign up
                            </span>
                        </p>
                    </>
                )}

            </div>
        </div>
    );
};