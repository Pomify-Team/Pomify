import { registerUser } from "../services/registerBS";
import "../styles/registerModal.css";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const PASSWORD_RULES = [
    { id: "length", label: "At least 8 characters",    test: (p) => p.length >= 8 },
    { id: "number", label: "At least 1 number",         test: (p) => /\d/.test(p) },
    { id: "symbol", label: "At least 1 symbol (!@#$…)", test: (p) => /[^a-zA-Z0-9]/.test(p) },
];

const getStrength = (password) => {
    const passed = PASSWORD_RULES.filter(r => r.test(password)).length;
    if (passed === 0) return { level: 0, label: "",       color: "transparent" };
    if (passed === 1) return { level: 1, label: "Weak",   color: "#E05252" };
    if (passed === 2) return { level: 2, label: "Fair",   color: "#E0A852" };
    return               { level: 3, label: "Strong", color: "#52A87C" };
};

export const RegisterModal = ({ onClose, onSwitchToLogin }) => {

    const [error, setError] = useState("");
    const [user, setUser] = useState({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
    });
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [passwordTouched, setPasswordTouched] = useState(false);
    const [success, setSuccess] = useState(false);
    const navigate = useNavigate();

    const strength = getStrength(user.password);
    const allRulesPassed = PASSWORD_RULES.every(r => r.test(user.password));

    const handleOverlayClick = (e) => {
        if (e.target === e.currentTarget) onClose();
    };

    const handleChange = (e) => {
        setUser({ ...user, [e.target.name]: e.target.value });
    };

    const handlePasswordChange = (e) => {
        setPasswordTouched(true);
        handleChange(e);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!user.name || !user.email || !user.password || !user.confirmPassword) {
            setError("All fields are required.");
            return;
        }
        if (!allRulesPassed) {
            setError("Your password doesn't meet the security requirements.");
            return;
        }
        if (user.password !== user.confirmPassword) {
            setError("Passwords do not match.");
            return;
        }
        try {
            await registerUser({ ...user, email: user.email.trim().toLowerCase() });
            setSuccess(true);
            setTimeout(() => {
                onSwitchToLogin();
            }, 2000);
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <div className="modal-overlay" onClick={handleOverlayClick}>
            <div className="modal-card">

                <button className="modal-close" onClick={onClose}>✕</button>

                <h2 className="modal-title">register</h2>

                <form className="modal-form" onSubmit={handleSubmit}>

                    <div className="form-group">
                        <input
                            type="text"
                            name="name"
                            placeholder="name"
                            value={user.name}
                            onChange={handleChange}
                            className="form-input"
                        />
                    </div>

                    <div className="form-group">
                        <input
                            type="email"
                            name="email"
                            placeholder="email"
                            value={user.email}
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
                            onChange={handlePasswordChange}
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

                    {passwordTouched && user.password.length > 0 && (
                        <div className="password-strength-wrapper">
                            <div className="strength-bar-track">
                                <div
                                    className="strength-bar-fill"
                                    style={{
                                        width: `${(strength.level / 3) * 100}%`,
                                        background: strength.color,
                                    }}
                                />
                            </div>
                            <span className="strength-label" style={{ color: strength.color }}>
                                {strength.label}
                            </span>
                            <ul className="password-rules">
                                {PASSWORD_RULES.map(rule => {
                                    const ok = rule.test(user.password);
                                    return (
                                        <li key={rule.id} className={ok ? "rule-ok" : "rule-fail"}>
                                            <span className="rule-icon">{ok ? "✓" : "✗"}</span>
                                            {rule.label}
                                        </li>
                                    );
                                })}
                            </ul>
                        </div>
                    )}

                    <div className="form-group input-password-wrapper">
                        <input
                            type={showConfirmPassword ? "text" : "password"}
                            name="confirmPassword"
                            placeholder="confirm password"
                            value={user.confirmPassword}
                            onChange={handleChange}
                            className="form-input"
                        />
                        <button
                            type="button"
                            className="toggle-password"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        >
                            {showConfirmPassword ? "●" : "○"}
                        </button>
                    </div>

                    {error && <div className="form-error">{error}</div>}

                    {success && (
                        <div className="form-success">
                            ✓ Account created! Redirecting to login...
                        </div>
                    )}

                    <button
                        type="submit"
                        className="modal-btn-submit"
                        disabled={!allRulesPassed || success}
                    >
                        {success ? "Account created!" : "create account"}
                    </button>
                </form>

                <p className="modal-footer-text">
                    Already have an account?{" "}
                    <span className="modal-link" onClick={onSwitchToLogin}>Log in</span>
                </p>

            </div>
        </div>
    );
};