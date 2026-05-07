import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Goals.css";

import {
  getGoals,
  createGoal,
  updateGoal,
  deleteGoal
} from "./GoalsService";

export const Goals = () => {
  const [goals, setGoals] = useState([]);
  const [newGoal, setNewGoal] = useState("");
  const [newGoalStatus, setNewGoalStatus] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editingText, setEditingText] = useState("");
  const [selectedGoals, setSelectedGoals] = useState([]);
  const [statusOpen, setStatusOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    loadGoals();

    const handleRefresh = () => loadGoals();
    window.addEventListener("goals:updated", handleRefresh);
    document.addEventListener("visibilitychange", () => {
      if (!document.hidden) loadGoals();
    });
    return () => {
      window.removeEventListener("goals:updated", handleRefresh);
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = () => setStatusOpen(false);
    if (statusOpen) document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [statusOpen]);

  const loadGoals = async () => {
    const data = await getGoals();
    if (data) setGoals(data.filter(g => g));
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
    const allElements = document.querySelectorAll("*");
    allElements.forEach(el => {
      if (el.scrollTop > 0) {
        el.scrollTo({ top: 0, behavior: "smooth" });
      }
    });
  };

  const handleCreateGoal = async () => {
    if (!newGoal.trim()) return;
    const data = await createGoal(newGoal, newGoal);
    if (!data?.goal) return;
    await updateGoal(data.goal.id, { status: newGoalStatus });
    setNewGoal("");
    setNewGoalStatus("");
    setGoals(prev => [{ ...data.goal, status: newGoalStatus }, ...prev]);
  };

  const toggleSelect = (id) => {
    setSelectedGoals(prev =>
      prev.includes(id) ? prev.filter(g => g !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedGoals.length === goals.length && goals.length > 0) {
      setSelectedGoals([]);
    } else {
      setSelectedGoals(goals.map(g => g.id));
    }
  };

  const bulkChangeStatus = async (status) => {
    await Promise.all(selectedGoals.map(id => updateGoal(id, { status })));
    setGoals(goals.map(g =>
      selectedGoals.includes(g.id) ? { ...g, status } : g
    ));
  };

  const bulkDelete = async () => {
    await Promise.all(selectedGoals.map(id => deleteGoal(id)));
    setGoals(goals.filter(g => !selectedGoals.includes(g.id)));
    setSelectedGoals([]);
  };

  const startEditing = (goal) => {
    setEditingId(goal.id);
    setEditingText(goal.title);
  };

  const saveEdit = async (id) => {
    if (!editingText.trim()) return;
    const data = await updateGoal(id, { title: editingText });
    if (!data?.goal) return;
    setGoals(goals.map(g => (g.id === id ? data.goal : g)));
    setEditingId(null);
    setEditingText("");
  };

  const handleDelete = async (id) => {
    await deleteGoal(id);
    setGoals(goals.filter(g => g.id !== id));
    setSelectedGoals(prev => prev.filter(g => g !== id));
  };

  const changeStatus = async (id, status) => {
    const data = await updateGoal(id, { status });
    if (!data?.goal) return;
    setGoals(goals.map(g => (g.id === id ? data.goal : g)));
  };

  const stats = {
    urgent: goals.filter(g => g.status === "urgent").length,
    progress: goals.filter(g => g.status === "progress").length,
    done: goals.filter(g => g.status === "done").length
  };

  const total = goals.length || 1;
  const allSelected = goals.length > 0 && selectedGoals.length === goals.length;

  const statusOptions = [
    { value: "progress", label: "In Progress", bg: "rgba(168,218,220,0.3)", color: "#457b9d" },
    { value: "urgent",   label: "Urgent",      bg: "rgba(230,57,70,0.15)",  color: "#e63946" },
    { value: "done",     label: "Done",        bg: "rgba(69,123,157,0.15)", color: "#457b9d" },
  ];

  const statusLabel = {
    progress: "In Progress",
    urgent: "Urgent",
    done: "Done"
  };

  return (
    <div className="goals-page">
      <button
        onClick={() => navigate("/home")}
        style={{
          margin: "0 0 1rem 0",
          padding: "8px 16px",
          borderRadius: "8px",
          border: "1.5px solid var(--color-divider)",
          background: "transparent",
          color: "var(--color-text-primary)",
          cursor: "pointer",
          fontSize: "0.9rem"
        }}
      >
        ← Home
      </button>

      <h1 className="goals-title">Your Goals</h1>
      <p className="goals-subtitle">
        Break your session into clear goals. Small steps lead to big results — write down what you want to achieve today.
      </p>

      <div className="goals-layout">
        <div className="goals-column">
          <div className="goal-create">
            <input
              className="goal-input"
              placeholder="Create a new goal..."
              value={newGoal}
              onChange={(e) => setNewGoal(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleCreateGoal()}
            />

            <div style={{ position: "relative" }} onClick={e => e.stopPropagation()}>
              <button
                onClick={() => setStatusOpen(prev => !prev)}
                style={{
                  padding: "12px 32px 12px 16px",
                  borderRadius: "10px",
                  border: "1px solid var(--color-divider)",
                  background: "var(--color-surface)",
                  color: newGoalStatus ? "var(--color-text-primary)" : "var(--color-text-secondary)",
                  fontFamily: "inherit",
                  fontSize: "0.95rem",
                  fontWeight: "500",
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                  backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23999' d='M6 8L1 3h10z'/%3E%3C/svg%3E\")",
                  backgroundRepeat: "no-repeat",
                  backgroundPosition: "right 12px center",
                }}
              >
                {newGoalStatus ? statusLabel[newGoalStatus] : "Status"}
              </button>

              {statusOpen && (
                <div style={{
                  position: "absolute",
                  top: "calc(100% + 6px)",
                  left: 0,
                  zIndex: 100,
                  background: "var(--color-surface)",
                  border: "1px solid var(--color-divider)",
                  borderRadius: "10px",
                  overflow: "hidden",
                  boxShadow: "0 4px 16px rgba(0,0,0,0.10)",
                  minWidth: "140px"
                }}>
                  {statusOptions.map(opt => (
                    <button
                      key={opt.value}
                      onClick={() => { setNewGoalStatus(opt.value); setStatusOpen(false); }}
                      style={{
                        display: "block",
                        width: "100%",
                        padding: "10px 16px",
                        border: "none",
                        background: newGoalStatus === opt.value ? opt.bg : "transparent",
                        color: opt.color,
                        fontFamily: "inherit",
                        fontSize: "0.9rem",
                        fontWeight: "500",
                        cursor: "pointer",
                        textAlign: "left",
                        transition: "background 0.15s ease"
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = opt.bg}
                      onMouseLeave={e => e.currentTarget.style.background = newGoalStatus === opt.value ? opt.bg : "transparent"}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button className="btn-primary" onClick={handleCreateGoal}>
              Add
            </button>
          </div>

          {goals.length > 0 && (
            <div style={{
              display: "flex",
              justifyContent: "flex-end",
              margin: "0.75rem 0 0.4rem"
            }}>
              <button
                onClick={toggleSelectAll}
                style={{
                  fontSize: "12px",
                  padding: "4px 10px",
                  borderRadius: "6px",
                  border: "1px solid var(--color-divider)",
                  background: "transparent",
                  color: "var(--color-text-primary)",
                  cursor: "pointer"
                }}
              >
                {allSelected ? "Deselect all" : "Select all"}
              </button>
            </div>
          )}

          {selectedGoals.length > 0 && (
            <div style={{
              display: "flex",
              gap: "8px",
              alignItems: "center",
              flexWrap: "wrap",
              padding: "10px 12px",
              marginBottom: "10px",
              borderRadius: "10px",
              background: "var(--color-surface)",
              border: "1px solid var(--color-divider)"
            }}>
              <span style={{
                fontSize: "12px",
                color: "var(--color-text-secondary)",
                marginRight: "4px"
              }}>
                {selectedGoals.length} selected —
              </span>
              <button className="status-btn urgent" onClick={() => bulkChangeStatus("urgent")}>Urgent</button>
              <button className="status-btn progress" onClick={() => bulkChangeStatus("progress")}>In Progress</button>
              <button className="status-btn done" onClick={() => bulkChangeStatus("done")}>Done</button>
              <div style={{
                width: "1px",
                height: "18px",
                background: "var(--color-divider)",
                margin: "0 4px",
                flexShrink: 0
              }} />
              <button
                className="status-btn urgent"
                onClick={bulkDelete}
                style={{ opacity: 0.85 }}
              >
                Delete all
              </button>
            </div>
          )}

          {goals.map(goal => (
            <div key={goal.id} className="goal-card">
              <div className="goal-header">
                <div className="goal-left">
                  {editingId === goal.id ? (
                    <input
                      className="edit-input"
                      value={editingText}
                      onChange={(e) => setEditingText(e.target.value)}
                      onBlur={() => saveEdit(goal.id)}
                      onKeyDown={(e) => e.key === "Enter" && saveEdit(goal.id)}
                      autoFocus
                    />
                  ) : (
                    <h3 onDoubleClick={() => startEditing(goal)}>
                      {goal.title}
                    </h3>
                  )}
                </div>

                <button
                  onClick={() => toggleSelect(goal.id)}
                  style={{
                    padding: "4px 10px",
                    borderRadius: "20px",
                    border: "1px solid var(--color-divider)",
                    background: selectedGoals.includes(goal.id) ? "#e63946" : "transparent",
                    color: selectedGoals.includes(goal.id) ? "white" : "var(--color-text-secondary)",
                    fontSize: "0.78rem",
                    fontWeight: "500",
                    cursor: "pointer",
                    fontFamily: "inherit",
                    transition: "all 0.2s ease",
                    whiteSpace: "nowrap"
                  }}
                >
                  {selectedGoals.includes(goal.id) ? "✓ Selected" : "Edit status"}
                </button>
              </div>

              <div className={`goal-status-wrapper ${selectedGoals.includes(goal.id) ? "show" : ""}`}>
                <div className="goal-status">
                  <button
                    className={`status-btn urgent ${goal.status === "urgent" ? "active" : ""}`}
                    onClick={() => changeStatus(goal.id, "urgent")}
                  >
                    Urgent
                  </button>
                  <button
                    className={`status-btn progress ${goal.status === "progress" ? "active" : ""}`}
                    onClick={() => changeStatus(goal.id, "progress")}
                  >
                    In Progress
                  </button>
                  <button
                    className={`status-btn done ${goal.status === "done" ? "active" : ""}`}
                    onClick={() => changeStatus(goal.id, "done")}
                  >
                    Done
                  </button>
                </div>
              </div>

              <div className="goal-actions">
                <button onClick={() => startEditing(goal)}>✏</button>
                <button onClick={() => handleDelete(goal.id)}>🗑</button>
              </div>
            </div>
          ))}

          {goals.length > 3 && (
            <button className="back-to-top-simple" onClick={scrollToTop}>
              ↑ Back to top
            </button>
          )}
        </div>

        <div className="chart-column">
          <div className="chart-card">
            <div
              className="pie"
              style={{
                background: `
                  conic-gradient(
                    #e63946 0% ${(stats.urgent / total) * 100}%,
                    #a8dadc ${(stats.urgent / total) * 100}% ${((stats.urgent + stats.progress) / total) * 100}%,
                    #457b9d ${((stats.urgent + stats.progress) / total) * 100}% 100%
                  )
                `
              }}
            />
            <div className="legend">
              <span>Urgent: {stats.urgent}</span>
              <span>Progress: {stats.progress}</span>
              <span>Done: {stats.done}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};