import { useEffect, useRef, useState } from "react";
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
    <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
  </svg>
);

const TrashIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M3 6h18" />
    <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
  </svg>
);

export const Goals = () => {
  const { t } = useLanguage();
  const [goals, setGoals] = useState([]);
  const [draft, setDraft] = useState("");
  const [filter, setFilter] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editingText, setEditingText] = useState("");
  const [draftCol, setDraftCol] = useState(null);
  const [draftColText, setDraftColText] = useState("");

  // Refs keep the blur-to-commit flow from firing twice or saving on cancel.
  const skipBlur = useRef(false);
  const cancelEdit = useRef(false);
  const cancelMeta = useRef(false);

  const columns = [
    { id: "urgent", label: t("goals.urgent") },
    { id: "progress", label: t("goals.inProgress") },
    { id: "done", label: t("goals.done") }
  ];

  useEffect(() => {
    loadGoals();

    const refresh = () => loadGoals();
    const onVisible = () => { if (!document.hidden) loadGoals(); };
    window.addEventListener("goals:updated", refresh);
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      window.removeEventListener("goals:updated", refresh);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, []);

  const loadGoals = async () => {
    const data = await getGoals();
    if (data) setGoals(data.filter(Boolean));
  };

  // "urgent" is also the catch-all so a goal with an empty/unknown status stays visible.
  const bucketOf = (status) =>
    status === "progress" ? "progress" : status === "done" ? "done" : "urgent";

  const goalsFor = (colId) => goals.filter(g => bucketOf(g.status) === colId);

  // ── create ────────────────────────────────────────────────────────────
  const persistNew = async (text, status) => {
    const data = await createGoal(text, text);
    if (!data?.goal) return;
    const res = await updateGoal(data.goal.id, { status });
    const goal = res?.goal || { ...data.goal, status };
    setGoals(prev => [...prev, goal]);
  };

  const handleAddDraft = async () => {
    const text = draft.trim();
    if (!text) return;
    setDraft("");
    await persistNew(text, "urgent");
  };

  const openMetaDraft = (colId) => { setDraftCol(colId); setDraftColText(""); };

  const commitMetaDraft = async () => {
    if (cancelMeta.current) {
      cancelMeta.current = false;
      setDraftCol(null);
      setDraftColText("");
      return;
    }
    const colId = draftCol;
    const text = draftColText.trim();
    setDraftCol(null);
    setDraftColText("");
    if (!colId || !text) return;
    await persistNew(text, colId);
  };

  // ── edit text + status ────────────────────────────────────────────────
  const startEdit = (goal) => {
    if (editingId === goal.id) return;
    setEditingId(goal.id);
    setEditingText(goal.title);
  };

  const commitEditText = async () => {
    if (skipBlur.current) { skipBlur.current = false; return; }
    const id = editingId;
    if (id == null) return;
    setEditingId(null);
    if (cancelEdit.current) { cancelEdit.current = false; return; }
    const text = editingText.trim();
    if (!text) {
      await deleteGoal(id);
      setGoals(gs => gs.filter(g => g.id !== id));
      return;
    }
    const data = await updateGoal(id, { title: text });
    if (data?.goal) setGoals(gs => gs.map(g => (g.id === id ? data.goal : g)));
  };

  const applyStatus = async (status) => {
    skipBlur.current = true;
    const id = editingId;
    const text = editingText.trim();
    setEditingId(null);
    if (id == null) return;
    const payload = text ? { title: text, status } : { status };
    const data = await updateGoal(id, payload);
    if (data?.goal) setGoals(gs => gs.map(g => (g.id === id ? data.goal : g)));
  };

  const handleDelete = async (id) => {
    if (editingId === id) { skipBlur.current = true; setEditingId(null); }
    await deleteGoal(id);
    setGoals(gs => gs.filter(g => g.id !== id));
  };

  const counts = columns.reduce((acc, c) => ({ ...acc, [c.id]: goalsFor(c.id).length }), {});

  return (
    <div className="goals-page">
      <h1 className="goals-title">{t("goals.yourGoals")}</h1>

      {/* Filter chips (also act as the stats summary) */}
      <div className="goals-filters">
        {columns.map(c => {
          const active = filter === c.id;
          return (
            <button
              key={c.id}
              type="button"
              className={`goal-chip ${c.id} ${active ? "active" : ""}`}
              onClick={() => setFilter(active ? null : c.id)}
            >
              <span className="goal-chip-dot" />
              {c.label}
              <span className="goal-chip-count">{counts[c.id]}</span>
            </button>
          );
        })}
        {filter && (
          <button type="button" className="goal-chip-clear" onClick={() => setFilter(null)}>
            {t("goals.viewAll")}
          </button>
        )}
      </div>

      {/* Add row */}
      <div className="goals-add">
        <input
          className="goal-input"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") handleAddDraft(); }}
          placeholder={t("goals.createPlaceholder")}
        />
        <button type="button" className="btn-add" onClick={handleAddDraft}>
          + {t("goals.add")}
        </button>
      </div>

      {/* Board */}
      <div className="row g-4 align-items-start goals-board">
        {columns.map(col => {
          const colGoals = goalsFor(col.id);
          const dimmed = filter && filter !== col.id;
          return (
            <div key={col.id} className="col-12 col-md-4">
              <section className={`goals-col ${col.id} ${dimmed ? "dimmed" : ""}`}>
                <div className="goal-col-head">
                  <span className="goal-col-title">{col.label}</span>
                  <span className="goal-col-count">{colGoals.length}</span>
                </div>

                {colGoals.map(goal => {
                  const isEditing = editingId === goal.id;
                  return (
                    <article key={goal.id} className={`goal-card ${isEditing ? "editing" : ""}`}>
                      {isEditing ? (
                        <input
                          className="goal-card-input"
                          value={editingText}
                          autoFocus
                          onChange={(e) => setEditingText(e.target.value)}
                          onBlur={commitEditText}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") e.currentTarget.blur();
                            if (e.key === "Escape") { cancelEdit.current = true; e.currentTarget.blur(); }
                          }}
                          placeholder={t("goals.writeNewGoal")}
                        />
                      ) : (
                        <div className="goal-card-text">{goal.title}</div>
                      )}

                      <div className="goal-card-actions">
                        <button
                          type="button"
                          className="icon-btn"
                          title={t("goals.editStatus")}
                          aria-label={t("goals.editStatus")}
                          onClick={() => startEdit(goal)}
                        >
                          <PencilIcon />
                        </button>
                        <button
                          type="button"
                          className="icon-btn danger"
                          title={t("common.delete")}
                          aria-label={t("common.delete")}
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={() => handleDelete(goal.id)}
                        >
                          <TrashIcon />
                        </button>
                      </div>

                      {isEditing && (
                        <div className="status-popover">
                          {columns.map(opt => (
                            <button
                              key={opt.id}
                              type="button"
                              className={`status-opt ${opt.id} ${bucketOf(goal.status) === opt.id ? "active" : ""}`}
                              onMouseDown={(e) => e.preventDefault()}
                              onClick={() => applyStatus(opt.id)}
                            >
                              {opt.label}
                            </button>
                          ))}
                        </div>
                      )}
                    </article>
                  );
                })}

                {draftCol === col.id && (
                  <article className="goal-card editing">
                    <input
                      className="goal-card-input"
                      value={draftColText}
                      autoFocus
                      onChange={(e) => setDraftColText(e.target.value)}
                      onBlur={commitMetaDraft}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") e.currentTarget.blur();
                        if (e.key === "Escape") { cancelMeta.current = true; e.currentTarget.blur(); }
                      }}
                      placeholder={t("goals.writeNewGoal")}
                    />
                  </article>
                )}

                <button type="button" className="col-add-btn" onClick={() => openMetaDraft(col.id)}>
                  + {t("goals.add")}
                </button>
              </section>
            </div>
          );
        })}
      </div>
    </div>
  );
};
