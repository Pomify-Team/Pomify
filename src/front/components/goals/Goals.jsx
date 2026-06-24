import { useEffect, useState } from "react";
import "./Goals.css";
import useLanguage from "../../context/LanguageContext";

import {
  getGoals,
  createGoal,
  updateGoal,
  deleteGoal
} from "./GoalsService";

const PencilIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M12 20h9" />
    <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4Z" />
  </svg>
);

const TrashIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M3 6h18" />
    <path d="M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2" />
    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
  </svg>
);

export const Goals = () => {
  const { t } = useLanguage();
  const [goals, setGoals] = useState([]);
  const [newGoal, setNewGoal] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editingText, setEditingText] = useState("");
  const [openStatusId, setOpenStatusId] = useState(null);
  const [addColumn, setAddColumn] = useState(null);
  const [columnDraft, setColumnDraft] = useState("");

  useEffect(() => {
    loadGoals();

    const handleRefresh = () => loadGoals();
    const handleVisibility = () => { if (!document.hidden) loadGoals(); };
    window.addEventListener("goals:updated", handleRefresh);
    document.addEventListener("visibilitychange", handleVisibility);
    return () => {
      window.removeEventListener("goals:updated", handleRefresh);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, []);

  // Close the inline status picker when clicking anywhere outside a card.
  useEffect(() => {
    if (openStatusId === null) return;
    const close = () => setOpenStatusId(null);
    document.addEventListener("click", close);
    return () => document.removeEventListener("click", close);
  }, [openStatusId]);

  const loadGoals = async () => {
    const data = await getGoals();
    if (data) setGoals(data.filter(g => g));
  };

  const handleCreateGoal = async () => {
    if (!newGoal.trim()) return;
    const data = await createGoal(newGoal, newGoal);
    if (!data?.goal) return;
    const status = "progress";
    await updateGoal(data.goal.id, { status });
    setNewGoal("");
    setGoals(prev => [{ ...data.goal, status }, ...prev]);
  };

  // Quick-add directly inside a column, with that column's status preset.
  const handleColumnCreate = async (status) => {
    if (!columnDraft.trim()) { setAddColumn(null); return; }
    const data = await createGoal(columnDraft, columnDraft);
    if (!data?.goal) { setAddColumn(null); return; }
    await updateGoal(data.goal.id, { status });
    setGoals(prev => [{ ...data.goal, status }, ...prev]);
    setColumnDraft("");
    setAddColumn(null);
  };

  const startEditing = (goal) => {
    setEditingId(goal.id);
    setEditingText(goal.title);
  };

  const saveEdit = async (id) => {
    if (!editingText.trim()) { setEditingId(null); return; }
    const data = await updateGoal(id, { title: editingText });
    if (!data?.goal) return;
    setGoals(goals.map(g => (g.id === id ? data.goal : g)));
    setEditingId(null);
    setEditingText("");
  };

  const handleDelete = async (id) => {
    await deleteGoal(id);
    setGoals(goals.filter(g => g.id !== id));
  };

  const changeStatus = async (id, status) => {
    const data = await updateGoal(id, { status });
    if (!data?.goal) return;
    setGoals(goals.map(g => (g.id === id ? data.goal : g)));
    setOpenStatusId(null);
  };

  const columns = [
    { key: "urgent", label: t("goals.urgent") },
    { key: "progress", label: t("goals.inProgress") },
    { key: "done", label: t("goals.done") }
  ];

  // "progress" doubles as the catch-all bucket so legacy/empty statuses stay visible.
  const isStatus = (goal, key) => {
    if (key === "urgent") return goal.status === "urgent";
    if (key === "done") return goal.status === "done";
    return goal.status !== "urgent" && goal.status !== "done";
  };

  const goalsFor = (key) => goals.filter(g => isStatus(g, key));

  return (
    <div className="goals-page">

      <header className="goals-topbar">
        <h1 className="goals-title">{t("goals.yourGoals")}</h1>
        <input
          className="goal-input"
          placeholder={t("goals.createPlaceholder")}
          value={newGoal}
          onChange={(e) => setNewGoal(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleCreateGoal()}
        />
        <button type="button" className="btn-add" onClick={handleCreateGoal}>
          + {t("goals.add")}
        </button>
      </header>

      <div className="goals-stats">
        {columns.map(col => (
          <span key={col.key} className={`stat-pill ${col.key}`}>
            <i className="stat-dot" />
            {col.label}
            <b>{goalsFor(col.key).length}</b>
          </span>
        ))}
      </div>

      <div className="goals-board">
        {columns.map(col => {
          const colGoals = goalsFor(col.key);
          return (
            <section key={col.key} className={`goals-col ${col.key}`}>
              <div className="col-head">
                <span className="col-title">{col.label}</span>
                <span className="col-count">{colGoals.length}</span>
              </div>

              <div className="col-body">
                {colGoals.map(goal => (
                  <article
                    key={goal.id}
                    className={`goal-card ${openStatusId === goal.id ? "open" : ""}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      setOpenStatusId(prev => (prev === goal.id ? null : goal.id));
                    }}
                  >
                    {editingId === goal.id ? (
                      <input
                        className="goal-edit-input"
                        value={editingText}
                        onClick={(e) => e.stopPropagation()}
                        onChange={(e) => setEditingText(e.target.value)}
                        onBlur={() => saveEdit(goal.id)}
                        onKeyDown={(e) => e.key === "Enter" && saveEdit(goal.id)}
                        autoFocus
                      />
                    ) : (
                      <h3
                        className="goal-card-title"
                        onDoubleClick={(e) => { e.stopPropagation(); startEditing(goal); }}
                      >
                        {goal.title}
                      </h3>
                    )}

                    {openStatusId === goal.id && (
                      <div className="goal-status-options" onClick={(e) => e.stopPropagation()}>
                        {columns.map(opt => (
                          <button
                            type="button"
                            key={opt.key}
                            className={`status-btn ${opt.key} ${isStatus(goal, opt.key) ? "active" : ""}`}
                            onClick={(e) => { e.stopPropagation(); changeStatus(goal.id, opt.key); }}
                          >
                            {opt.label}
                          </button>
                        ))}
                      </div>
                    )}

                    <div className="goal-card-actions">
                      <button
                        type="button"
                        className="icon-btn"
                        aria-label={t("goals.editStatus")}
                        onClick={(e) => { e.stopPropagation(); startEditing(goal); }}
                      >
                        <PencilIcon />
                      </button>
                      <button
                        type="button"
                        className="icon-btn"
                        aria-label={t("common.delete")}
                        onClick={(e) => { e.stopPropagation(); handleDelete(goal.id); }}
                      >
                        <TrashIcon />
                      </button>
                    </div>
                  </article>
                ))}

                {addColumn === col.key ? (
                  <input
                    className="col-add-input"
                    placeholder={t("goals.createPlaceholder")}
                    value={columnDraft}
                    autoFocus
                    onChange={(e) => setColumnDraft(e.target.value)}
                    onBlur={() => { setAddColumn(null); setColumnDraft(""); }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleColumnCreate(col.key);
                      if (e.key === "Escape") { setAddColumn(null); setColumnDraft(""); }
                    }}
                  />
                ) : (
                  <button
                    type="button"
                    className="col-add-btn"
                    onClick={() => { setAddColumn(col.key); setColumnDraft(""); }}
                  >
                    + {t("goals.add")}
                  </button>
                )}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
};
