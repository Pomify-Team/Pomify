import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { getFolders, createFolder } from "./pages-y-folder/FolderServices";
import { getPages, createPage } from "./pages-y-folder/PageServices";
import "../styles/pagesZone.css";

export const PagesZone = () => {
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [folders, setFolders] = useState([]);
    const [showSaveModal, setShowSaveModal] = useState(false);
    const [showCreateFolderModal, setShowCreateFolderModal] = useState(false);
    const [showLoadModal, setShowLoadModal] = useState(false);
    const [newFolderTitle, setNewFolderTitle] = useState("");
    const [selectedFolder, setSelectedFolder] = useState("");
    const [saved, setSaved] = useState(false);
    const [error, setError] = useState("");
    const [showDropdown, setShowDropdown] = useState(false);
    const [editingPageId, setEditingPageId] = useState(null);
    const [loadFolderId, setLoadFolderId] = useState("");
    const [loadPages, setLoadPages] = useState([]);
    const [loadingPages, setLoadingPages] = useState(false);
    const [inlineFolderTitle, setInlineFolderTitle] = useState("");
    const [showNewPageModal, setShowNewPageModal] = useState(false);
    const [clearAfterSave, setClearAfterSave] = useState(false);

    const dropdownRef = useRef(null);
    const navigate = useNavigate();

    useEffect(() => {
        const load = async () => {
            const data = await getFolders();
            if (data) setFolders(data);
        };
        load();
    }, []);

    useEffect(() => {
        const stored = localStorage.getItem("pz_edit_page");
        if (stored) {
            const page = JSON.parse(stored);
            setTitle(page.title);
            setContent(page.content);
            setEditingPageId(page.id);
            localStorage.removeItem("pz_edit_page");
        }
    }, []);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setShowDropdown(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    useEffect(() => {
        if (!loadFolderId) { setLoadPages([]); return; }
        const load = async () => {
            setLoadingPages(true);
            const data = await getPages(parseInt(loadFolderId));
            if (data) setLoadPages(data);
            setLoadingPages(false);
        };
        load();
    }, [loadFolderId]);

    const handleSave = async () => {
        if (!selectedFolder) return;
        if (!title.trim()) {
            setError("Title cannot be empty.");
            return;
        }
        const data = await createPage(parseInt(selectedFolder), title.trim(), content.trim());
        if (data) {
            setSaved(true);
            setShowSaveModal(false);
            if (clearAfterSave) {
                clearEditor();
                setClearAfterSave(false);
            } else {
                setTitle("");
                setContent("");
                setSelectedFolder("");
                setEditingPageId(null);
                setError("");
            }
            setTimeout(() => setSaved(false), 3000);
        }
    };

    const handleOpenSaveModal = () => {
        if (!title.trim()) {
            setError("Write a title before saving.");
            return;
        }
        setError("");
        setInlineFolderTitle("");
        setShowSaveModal(true);
    };

    
    const handleInlineCreateFolder = async () => {
        if (!inlineFolderTitle.trim()) return;
        const data = await createFolder(inlineFolderTitle.trim());
        if (data) {
            const updatedFolders = [...folders, data];
            setFolders(updatedFolders);
            setSelectedFolder(String(data.id));
            setInlineFolderTitle("");
        }
    };

    const handleCreateFolder = async () => {
        if (!newFolderTitle.trim()) return;
        const data = await createFolder(newFolderTitle.trim());
        if (data) {
            setFolders(prev => [...prev, data]);
            setNewFolderTitle("");
            setShowCreateFolderModal(false);
        }
    };

    const handleNewPage = () => {
        setShowDropdown(false);
        if (title.trim() || content.trim()) {
            setShowNewPageModal(true);
        } else {
            clearEditor();
        }
    };

    const clearEditor = () => {
        setTitle("");
        setContent("");
        setEditingPageId(null);
        setError("");
    };

    const handleSaveAndNew = () => {
        setShowNewPageModal(false);
        setInlineFolderTitle("");
        setSelectedFolder("");
        setClearAfterSave(true);
        setShowSaveModal(true);
    };

    const handleDiscardAndNew = () => {
        setShowNewPageModal(false);
        clearEditor();
    };

    const handleSelectLoadPage = (page) => {
        setTitle(page.title);
        setContent(page.content);
        setEditingPageId(page.id);
        setShowLoadModal(false);
        setLoadFolderId("");
        setLoadPages([]);
    };

    const handleCancelLoad = () => {
        setShowLoadModal(false);
        setLoadFolderId("");
        setLoadPages([]);
    };

    return (
        <div className="pz-container">
            <div className="pz-header">
                <h2 className="pz-title">
                    {editingPageId ? "Editing page" : "start writing..."}
                </h2>
                <div className="pz-header-right">
                    {saved && <span className="pz-saved-badge">✓ saved</span>}

                    <button className="pz-save-inline-btn" onClick={handleOpenSaveModal}>
                        save
                    </button>

                    <div className="pz-dropdown-wrapper" ref={dropdownRef}>
                        <button
                            className="pz-dropdown-btn"
                            onClick={() => setShowDropdown(!showDropdown)}
                        >+</button>
                        {showDropdown && (
                            <div className="pz-dropdown-menu">
                                <button
                                    className="pz-dropdown-item"
                                    onClick={handleNewPage}
                                >New page</button>
                                <button
                                    className="pz-dropdown-item"
                                    onClick={() => { setShowDropdown(false); setShowCreateFolderModal(true); }}
                                >New folder</button>
                                <button
                                    className="pz-dropdown-item"
                                    onClick={() => { setShowDropdown(false); setShowLoadModal(true); }}
                                >Load page</button>
                                <button
                                    className="pz-dropdown-item"
                                    onClick={() => { setShowDropdown(false); navigate("/folders"); }}
                                >Go to files</button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <input
                className="pz-input-title"
                placeholder="Title..."
                value={title}
                onChange={e => setTitle(e.target.value)}
            />

            <textarea
                className="pz-textarea"
                placeholder="Write your notes here while you work..."
                value={content}
                onChange={e => setContent(e.target.value)}
            />

            {error && <p className="pz-error">{error}</p>}

           
            {showSaveModal && (
                <div className="pz-overlay" onClick={() => setShowSaveModal(false)}>
                    <div className="pz-modal" onClick={e => e.stopPropagation()}>
                        <div className="pz-modal-title">Which folder to save in?</div>

                        {folders.length === 0 ? (
                            <>
                                <p className="pz-modal-empty">You have no folders. Create one to save.</p>
                                <input
                                    className="pz-select"
                                    placeholder="Folder name..."
                                    value={inlineFolderTitle}
                                    onChange={e => setInlineFolderTitle(e.target.value)}
                                    onKeyDown={e => e.key === "Enter" && handleInlineCreateFolder()}
                                    autoFocus
                                    style={{ marginTop: "4px" }}
                                />
                                <div className="pz-modal-actions">
                                    <button className="pz-btn-cancel" onClick={() => setShowSaveModal(false)}>Cancel</button>
                                    <button
                                        className="pz-btn-primary"
                                        disabled={!inlineFolderTitle.trim()}
                                        onClick={handleInlineCreateFolder}
                                    >Create folder</button>
                                </div>
                            </>
                        ) : (
                            <>
                                <select
                                    className="pz-select"
                                    value={selectedFolder}
                                    onChange={e => setSelectedFolder(e.target.value)}
                                >
                                    <option value="">-- Select a folder --</option>
                                    {folders.map(f => (
                                        <option key={f.id} value={f.id}>{f.title}</option>
                                    ))}
                                </select>
                                <div className="pz-modal-actions">
                                    <button className="pz-btn-cancel" onClick={() => setShowSaveModal(false)}>Cancel</button>
                                    <button
                                        className="pz-btn-primary"
                                        disabled={!selectedFolder}
                                        onClick={handleSave}
                                    >Save</button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}

            
            {showLoadModal && (
                <div className="pz-overlay" onClick={handleCancelLoad}>
                    <div className="pz-modal" onClick={e => e.stopPropagation()}>
                        <div className="pz-modal-title">Load page</div>
                        {folders.length === 0 ? (
                            <p className="pz-modal-empty">You have no folders yet.</p>
                        ) : (
                            <>
                                <label className="pz-modal-label">Folder</label>
                                <select
                                    className="pz-select"
                                    value={loadFolderId}
                                    onChange={e => setLoadFolderId(e.target.value)}
                                >
                                    <option value="">-- Select a folder --</option>
                                    {folders.map(f => (
                                        <option key={f.id} value={f.id}>{f.title}</option>
                                    ))}
                                </select>
                                {loadFolderId && (
                                    <>
                                        <label className="pz-modal-label" style={{ marginTop: "12px" }}>Page</label>
                                        {loadingPages ? (
                                            <p className="pz-modal-empty">Loading...</p>
                                        ) : loadPages.length === 0 ? (
                                            <p className="pz-modal-empty">This folder has no pages.</p>
                                        ) : (
                                            <div className="pz-page-list">
                                                {loadPages.map(page => (
                                                    <button
                                                        key={page.id}
                                                        className="pz-page-item"
                                                        onClick={() => handleSelectLoadPage(page)}
                                                    >
                                                        <span className="pz-page-item-title">{page.title}</span>
                                                        <span className="pz-page-item-preview">{page.content?.slice(0, 50)}...</span>
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </>
                                )}
                            </>
                        )}
                        <div className="pz-modal-actions" style={{ marginTop: "16px" }}>
                            <button className="pz-btn-cancel" onClick={handleCancelLoad}>Cancel</button>
                        </div>
                    </div>
                </div>
            )}

            
            {showCreateFolderModal && (
                <div className="pz-overlay" onClick={() => setShowCreateFolderModal(false)}>
                    <div className="pz-modal" onClick={e => e.stopPropagation()}>
                        <div className="pz-modal-title">New folder</div>
                        <input
                            className="pz-input-title"
                            placeholder="Folder name..."
                            value={newFolderTitle}
                            onChange={e => setNewFolderTitle(e.target.value)}
                            onKeyDown={e => e.key === "Enter" && handleCreateFolder()}
                            autoFocus
                        />
                        <div className="pz-modal-actions" style={{ marginTop: "16px" }}>
                            <button className="pz-btn-cancel" onClick={() => setShowCreateFolderModal(false)}>Cancel</button>
                            <button className="pz-btn-primary" onClick={handleCreateFolder}>Create</button>
                        </div>
                    </div>
                </div>
            )}

            
            {showNewPageModal && (
                <div className="pz-overlay" onClick={() => setShowNewPageModal(false)}>
                    <div className="pz-modal" onClick={e => e.stopPropagation()}>
                        <div className="pz-modal-title">You have unsaved content</div>
                        <p style={{ fontSize: "0.88rem", color: "var(--color-text-secondary)", margin: "0 0 1rem" }}>
                            What do you want to do with "<strong>{title || "Untitled"}</strong>"?
                        </p>
                        <div className="pz-modal-actions" style={{ justifyContent: "space-between" }}>
                            <button className="pz-btn-cancel" onClick={() => setShowNewPageModal(false)}>Cancel</button>
                            <div style={{ display: "flex", gap: "8px" }}>
                                <button className="pz-btn-cancel" onClick={handleDiscardAndNew}>Discard</button>
                                <button className="pz-btn-primary" onClick={handleSaveAndNew}>Save</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};