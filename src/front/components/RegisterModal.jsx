import { registerUser } from "../services/registerBS";
import "../styles/registerModal.css";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import useLanguage from "../context/LanguageContext";

const PASSWORD_RULES = [
    { id: "length", test: (p) => p.length >= 8 },
    { id: "number", test: (p) => /\d/.test(p) },
    { id: "symbol", test: (p) => /[^a-zA-Z0-9]/.test(p) },
];

const getStrength = (password) => {
    const passed = PASSWORD_RULES.filter(r => r.test(password)).length;
    if (passed === 0) return { level: 0, labelKey: "",       color: "transparent" };
    if (passed === 1) return { level: 1, labelKey: "weak",   color: "#E05252" };
    if (passed === 2) return { level: 2, labelKey: "fair",   color: "#E0A852" };
    return               { level: 3, labelKey: "strong", color: "#52A87C" };
};

const ruleKeys = { length: "auth.ruleLength", number: "auth.ruleNumber", symbol: "auth.ruleSymbol" };

export const RegisterModal = ({ onClose, onSwitchToLogin }) => {

    const { t } = useLanguage();
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

    const handleGoogleLogin = () => {
    window.location.href = `${import.meta.env.VITE_BACKEND_URL}api/user/auth/google`;
    };

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
            setError(t("auth.allFieldsRequired"));
            return;
        }
        if (!allRulesPassed) {
            setError(t("auth.passwordRequirements"));
            return;
        }
        if (user.password !== user.confirmPassword) {
            setError(t("auth.passwordsMismatch"));
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
          <button className="modal-close" onClick={onClose}>
            ✕
          </button>

          <h2 className="modal-title">{t("auth.register")}</h2>

          <form className="modal-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <input
                type="text"
                name="name"
                placeholder={t("auth.name")}
                value={user.name}
                onChange={handleChange}
                className="form-input"
              />
            </div>

            <div className="form-group">
              <input
                type="email"
                name="email"
                placeholder={t("auth.email")}
                value={user.email}
                onChange={handleChange}
                className="form-input"
              />
            </div>

            <div className="form-group input-password-wrapper">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder={t("auth.password")}
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
                <span
                  className="strength-label"
                  style={{ color: strength.color }}
                >
                  {strength.labelKey ? t(`auth.${strength.labelKey}`) : ""}
                </span>
                <ul className="password-rules">
                  {PASSWORD_RULES.map((rule) => {
                    const ok = rule.test(user.password);
                    return (
                      <li
                        key={rule.id}
                        className={ok ? "rule-ok" : "rule-fail"}
                      >
                        <span className="rule-icon">{ok ? "✓" : "✗"}</span>
                        {t(ruleKeys[rule.id])}
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
                placeholder={t("auth.confirmPassword")}
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
              <div className="form-success">{t("auth.accountCreated")}</div>
            )}

            <button
              type="submit"
              className="modal-btn-submit"
              disabled={!allRulesPassed || success}
            >
              {success ? t("auth.accountCreatedBtn") : t("auth.createAccount")}
            </button>
          </form>

          <button
            type="button"
            className="modal-btn-google"
            onClick={handleGoogleLogin}
          >
            🔵 {t("auth.loginWithGoogle")}
          </button>

          <p className="modal-footer-text">
            {t("auth.haveAccount")}{" "}
            <span className="modal-link" onClick={onSwitchToLogin}>
              {t("auth.loginLink")}
            </span>
          </p>
        </div>
      </div>
    );
};
