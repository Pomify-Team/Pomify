import { Link, useLocation, useNavigate } from "react-router-dom";
import "../styles/Navbar.css";
import { useState, useEffect } from "react";
import { LoginModal } from "./LoginModal";
import { RegisterModal } from "./RegisterModal";
import { getGoals, updateGoal, deleteGoal, createGoal } from "./goals/GoalsService";
import pomifyLogo from "../assets/img/pomify_logo.png";

const backend_url = import.meta.env.VITE_BACKEND_URL;

export const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [user, setUser] = useState(null);

  const [showGoalsModal, setShowGoalsModal] = useState(false);
  const [goals, setGoals] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editingText, setEditingText] = useState("");
  const [newGoalText, setNewGoalText] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsLoggedIn(!!token);
    if (token) fetchUser();
  }, [location]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest(".user-dropdown-container")) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchUser = async () => {
    const res = await fetch(`${backend_url}/api/user/profile`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
    });
    if (!res.ok) return;
    const data = await res.json();
    setUser(data);
  };

  const fetchGoals = async () => {
    const data = await getGoals();
    if (data) setGoals(data.filter(g => g));
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsLoggedIn(false);
    setUser(null);
    window.location.href = "/";
  };

  const openGoalsModal = () => {
    fetchGoals();
    setShowGoalsModal(true);
  };

  const saveEdit = async (id) => {
    if (!editingText.trim()) return;
    const data = await updateGoal(id, { title: editingText });
    if (!data?.goal) return;
    setGoals(goals.map(g => g.id === id ? data.goal : g));
    setEditingId(null);
    setEditingText("");
  };

  const handleDelete = async (id) => {
    await deleteGoal(id);
    setGoals(goals.filter(g => g.id !== id));
    if (selectedGoal === id) setSelectedGoal(null);
  };

  const handleCreateGoal = async () => {
    if (!newGoalText.trim()) return;
    const data = await createGoal(newGoalText.trim(), newGoalText.trim());
    if (!data?.goal) return;
    setGoals([...goals, data.goal]);
    setNewGoalText("");
    window.dispatchEvent(new Event("goals:updated"));
  };

  const handleCreateGoalAndGo = async () => {
    if (newGoalText.trim()) {
      await handleCreateGoal();
    }
    setShowGoalsModal(false);
    navigate("/goals");
  };

  const changeStatus = async (id, status) => {
    const data = await updateGoal(id, { status });
    if (!data?.goal) return;
    setGoals(goals.map(g => g.id === id ? data.goal : g));
  };

  const getInitial = () => {
    if (!user) return "U";
    return (user.name || user.email || "U")[0].toUpperCase();
  };

  const renderAvatar = () => {
    if (!user?.avatar_url) return getInitial();
    if (user.avatar_url.startsWith("http")) {
      return <img src={user.avatar_url} alt="avatar" style={{ width: "100%", height: "100%", borderRadius: "50%", objectFit: "cover" }} />;
    }
    return <span style={{ fontSize: "1.1rem" }}>{user.avatar_url}</span>;
  };

  const statusColors = {
    urgent: { bg: "rgba(230,57,70,0.15)", color: "#e63946", active: "#e63946" },
    progress: { bg: "rgba(168,218,220,0.3)", color: "#457b9d", active: "#457b9d" },
    done: { bg: "rgba(69,123,157,0.15)", color: "#457b9d", active: "#457b9d" }
  };

  return (
    <>
      <nav className="navbar-container">
        <div className="navbar-content">

          
          <div className="navbar-left" onClick={() => navigate("/about")} style={{ cursor: "pointer", display: "flex", alignItems: "center" }}>
            <img src={pomifyLogo} alt="Pomify" style={{ height: "32px", width: "auto" }} />
          </div>

          
          {isLoggedIn && (
            <button className="btn-goals-center" onClick={openGoalsModal}>
              Your Goals
            </button>
          )}

          
          <div className="navbar-right">
            {isLoggedIn ? (
              <div className="user-dropdown-container">
                <button
                  className="user-pill"
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                >
                  <span className="user-name">{user?.name || "Usuario"}</span>
                  <div className="user-avatar">
                    {renderAvatar()}
                  </div>
                </button>

                {isDropdownOpen && (
                  <div className="dropdown-menu">
                    <Link to="/profile" onClick={() => setIsDropdownOpen(false)}>
                      Edit profile
                    </Link>
                    <Link to="/folders" onClick={() => setIsDropdownOpen(false)}>
                      My folders
                    </Link>
                    <button onClick={handleLogout}>Logout</button>
                  </div>
                )}
              </div>
            ) : (
              <div className="auth-buttons">
                <button className="btn-outline" onClick={() => setShowRegister(true)}>Register</button>
                <button className="btn-primary" onClick={() => setShowLogin(true)}>Login</button>
              </div>
            )}
          </div>
        </div>
      </nav>

      
      {showGoalsModal && (
        <div className="gmodal-overlay" onClick={() => setShowGoalsModal(false)}>
          <div className="gmodal-box" onClick={e => e.stopPropagation()}>

            <div className="gmodal-header">
              <h2>Your Goals</h2>
              <button className="gmodal-close" onClick={() => setShowGoalsModal(false)}>✕</button>
            </div>

            <div className="gmodal-list">
              {goals.length === 0 && (
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "1rem", gap: "0.75rem" }}>
                  <p style={{ color: "var(--color-text-secondary)", textAlign: "center", margin: 0 }}>
                    No goals yet. Create one!
                  </p>
                  <div style={{ display: "flex", gap: "0.5rem", width: "100%" }}>
                    <input
                      className="gmodal-edit-input"
                      style={{ flex: 1 }}
                      placeholder="Write your new goal..."
                      value={newGoalText}
                      onChange={e => setNewGoalText(e.target.value)}
                      onKeyDown={e => e.key === "Enter" && handleCreateGoal()}
                      autoFocus
                    />
                    <button className="btn-primary" onClick={handleCreateGoal} style={{ whiteSpace: "nowrap" }}>
                      + Create
                    </button>
                  </div>
                </div>
              )}
              {goals.map(goal => (
                <div key={goal.id} className="gmodal-item">
                  <div className="gmodal-item-top">
                    {editingId === goal.id ? (
                      <input
                        className="gmodal-edit-input"
                        value={editingText}
                        onChange={e => setEditingText(e.target.value)}
                        onBlur={() => saveEdit(goal.id)}
                        onKeyDown={e => e.key === "Enter" && saveEdit(goal.id)}
                        autoFocus
                      />
                    ) : (
                      <span className="gmodal-title" onDoubleClick={() => { setEditingId(goal.id); setEditingText(goal.title); }}>
                        {goal.title}
                      </span>
                    )}
                    <div className="gmodal-actions">
                      <button onClick={() => { setEditingId(goal.id); setEditingText(goal.title); }}>✏</button>
                      <button onClick={() => handleDelete(goal.id)}>🗑</button>
                    </div>
                  </div>

                  <div className="gmodal-status">
                    {["urgent", "progress", "done"].map(s => (
                      <button
                        key={s}
                        onClick={() => changeStatus(goal.id, s)}
                        style={{
                          flex: 1,
                          padding: "5px 0",
                          borderRadius: "25px",
                          border: "none",
                          cursor: "pointer",
                          fontSize: "0.72rem",
                          whiteSpace: "nowrap",
                          transition: "all 0.2s ease",
                          background: goal.status === s ? statusColors[s].active : statusColors[s].bg,
                          color: goal.status === s ? "white" : statusColors[s].color,
                          height: "auto",
                          overflow: "visible",
                          display: "inline-block",
                          lineHeight: "1.5"
                        }}
                      >
                        {s === "urgent" ? "Urgent" : s === "progress" ? "In Progress" : "Done"}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="gmodal-footer">
              <button className="btn-primary" onClick={goals.length === 0 ? handleCreateGoalAndGo : () => { setShowGoalsModal(false); navigate("/goals"); }}>
                {goals.length === 0 ? "Go to Goals" : "View All"}
              </button>
            </div>

          </div>
        </div>
      )}

      {showLogin && (
        <LoginModal onClose={() => setShowLogin(false)} onSwitchToRegister={() => { setShowLogin(false); setShowRegister(true); }} />
      )}
      {showRegister && (
        <RegisterModal onClose={() => setShowRegister(false)} onSwitchToLogin={() => { setShowRegister(false); setShowLogin(true); }} />
      )}

    </>
  );
};