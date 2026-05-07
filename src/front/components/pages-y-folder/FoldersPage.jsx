import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import FolderPanel from "./FolderPanel";
import PagePanel from "./PagePanel";
import { getPages, createPage, updatePage, deletePage, movePage } from "./PageServices";
import { getFolders, createFolder, updateFolder, deleteFolder } from "./FolderServices";
import "./FoldersPage.css"

const FoldersPage = () => {
    const navigate = useNavigate();
    const [folders, setFolders] = useState([]);
    const [pages, setPages] = useState([]);
    const [activeFolder, setActiveFolder] = useState(null);
    const [editMode, setEditMode] = useState(false);
    const [selectedFolders, setSelectedFolders] = useState([]);
    const [openPage, setOpenPage] = useState(null);
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [showMobileMain, setShowMobileMain] = useState(false);

    const [showFolderModal, setShowFolderModal] = useState(false);
    const [confirmModal, setConfirmModal] = useState(null);
    const [moveModal, setMoveModal] = useState(null);

    const [newFolderTitle, setNewFolderTitle] = useState("");
    const [moveTarget, setMoveTarget] = useState("");

    useEffect(() => {
        const loadFolders = async () => {
            const data = await getFolders();
            if (data) setFolders(data);
        };
        loadFolders();
    }, []);

    useEffect(() => {
        if (!activeFolder) return;
        const loadPages = async () => {
            const data = await getPages(activeFolder.id);
            if (data) {
                setPages(prev => {
                    const filtered = prev.filter(p => p.folder.id !== activeFolder.id);
                    return [...filtered, ...data];
                });
            }
        };
        loadPages();
    }, [activeFolder]);

    const folderPages = activeFolder ? pages.filter(p => p.folder.id === activeFolder.id) : [];

    const toggleSelect = (id) => {
        setSelectedFolders(prev => prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]);
    };

    const handleSelectFolder = (folder) => {
        setActiveFolder(folder);
        setShowMobileMain(true);
    };

    const handleCreateFolder = async () => {
        if (!newFolderTitle.trim()) return;
        const data = await createFolder(newFolderTitle);
        if (data) setFolders(prev => [...prev, data]);
        setNewFolderTitle("");
        setShowFolderModal(false);
    };

    const handleDeleteFolders = async () => {
        for (const id of selectedFolders) await deleteFolder(id);
        setFolders(prev => prev.filter(f => !selectedFolders.includes(f.id)));
        setPages(prev => prev.filter(p => !selectedFolders.includes(p.folder.id)));
        if (activeFolder && selectedFolders.includes(activeFolder.id)) setActiveFolder(null);
        setSelectedFolders([]);
        setEditMode(false);
        setConfirmModal(null);
    };

    const handleRenameFolder = async (id, newTitle) => {
        const data = await updateFolder(id, newTitle);
        if (data) setFolders(prev => prev.map(f => f.id === id ? { ...f, title: newTitle } : f));
    };

    const handleCreatePage = async (title, content) => {
        const data = await createPage(activeFolder.id, title, content);
        if (data) setPages(prev => [...prev, data]);
        setShowCreateForm(false);
    };

    const handleUpdatePage = async (id, title, content) => {
        const data = await updatePage(id, title, content);
        if (data) setPages(prev => prev.map(p => p.id === id ? { ...p, title, content } : p));
    };

    const handleDeletePage = async (page) => {
        await deletePage(page.id);
        setPages(prev => prev.filter(p => p.id !== page.id));
        setConfirmModal(null);
    };

    const confirmLabel = selectedFolders.length === 1
        ? `the folder "${folders.find(f => f.id === selectedFolders[0])?.title}"`
        : `these ${selectedFolders.length} folders`;

    return (
        <>
            <div className="fp-page">
                <div className="fp-layout">

                    
                    <div className={`fp-sidebar ${showMobileMain ? 'd-none d-md-flex' : 'd-flex'}`}>
                        <div className="fp-sidebar-header">
                            <div className="d-flex align-items-center gap-2">
                                <button
                                    className="fp-btn-cancel"
                                    onClick={() => navigate("/home")}
                                    style={{ padding: '6px 12px', fontSize: '12px' }}
                                >← Home</button>
                                <span className="fp-sidebar-title">Folders</span>
                            </div>
                            <div className="fp-sidebar-btns">
                                <button
                                    className="fp-icon-btn edit"
                                    onClick={() => { setEditMode(!editMode); setSelectedFolders([]); }}
                                >✏️</button>
                                {editMode && (
                                    <button
                                        className="fp-icon-btn del"
                                        disabled={selectedFolders.length === 0}
                                        onClick={() => setConfirmModal({ type: "folders" })}
                                    >🗑️</button>
                                )}
                            </div>
                        </div>

                        <div className="fp-sidebar-body">
                            <FolderPanel
                                folders={folders}
                                pages={pages}
                                activeFolder={activeFolder}
                                onSelectFolder={handleSelectFolder}
                                editMode={editMode}
                                selectedFolders={selectedFolders}
                                onToggleSelect={toggleSelect}
                                onRenameFolder={handleRenameFolder}
                            />
                        </div>

                        <div className="fp-sidebar-footer">
                            {editMode && (
                                <button
                                    className="fp-delete-selected w-100 mb-2"
                                    disabled={selectedFolders.length === 0}
                                    onClick={() => setConfirmModal({ type: "folders" })}
                                >
                                    Delete {selectedFolders.length > 0 ? `(${selectedFolders.length})` : "selected"}
                                </button>
                            )}
                            <button className="fp-new-folder-btn w-100" onClick={() => setShowFolderModal(true)}>
                                + New folder
                            </button>
                        </div>
                    </div>

                    
                    <div className={`fp-main ${!showMobileMain ? 'd-none d-md-flex' : 'd-flex'}`}>
                        <div className="fp-main-header">
                            <div className="d-flex align-items-center gap-2">
                                
                                <button
                                    className="fp-btn-cancel d-md-none"
                                    onClick={() => setShowMobileMain(false)}
                                    style={{ padding: '6px 12px', fontSize: '12px' }}
                                >← Folders</button>
                                <span className="fp-main-title">
                                    {activeFolder ? activeFolder.title : "Select a folder"}
                                </span>
                            </div>
                            {activeFolder && !showCreateForm && (
                                <button className="fp-new-page-btn" onClick={() => setShowCreateForm(true)}>
                                    + New page
                                </button>
                            )}
                        </div>
                        <div className="fp-main-body">
                            <PagePanel
                                pages={pages}
                                activeFolder={activeFolder}
                                onOpenPage={setOpenPage}
                                onMovePage={(page) => { setMoveModal(page); setMoveTarget(""); }}
                                onDeletePage={(page) => setConfirmModal({ type: "page", id: page.id, title: page.title })}
                                onCreatePage={() => setShowCreateForm(true)}
                                onUpdatePage={handleUpdatePage}
                                showCreateForm={showCreateForm}
                                onCancelCreate={() => setShowCreateForm(false)}
                                onSubmitCreate={handleCreatePage}
                            />
                        </div>
                    </div>
                </div>
            </div>

           
            {openPage && (
                <div className="fp-overlay" onClick={() => setOpenPage(null)}>
                    <div className="fp-detail" onClick={e => e.stopPropagation()}>
                        <div className="fp-detail-header">
                            <div className="fp-detail-title">{openPage.title}</div>
                            <button className="fp-detail-close" onClick={() => setOpenPage(null)}>✕</button>
                        </div>
                        <div className="fp-detail-body">
                            <div className="fp-detail-content">{openPage.content}</div>
                        </div>
                    </div>
                </div>
            )}

            
            {showFolderModal && (
                <div className="fp-overlay" onClick={() => setShowFolderModal(false)}>
                    <div className="fp-modal" onClick={e => e.stopPropagation()}>
                        <div className="fp-modal-title">New folder</div>
                        <div className="fp-input-group">
                            <label className="fp-label">Name</label>
                            <input
                                className="fp-input"
                                placeholder="Folder name..."
                                value={newFolderTitle}
                                onChange={e => setNewFolderTitle(e.target.value)}
                                onKeyDown={e => e.key === "Enter" && handleCreateFolder()}
                                autoFocus
                            />
                        </div>
                        <div className="fp-modal-actions">
                            <button className="fp-btn-cancel" onClick={() => setShowFolderModal(false)}>Cancel</button>
                            <button className="fp-btn-primary" onClick={handleCreateFolder}>Create</button>
                        </div>
                    </div>
                </div>
            )}

            
            {moveModal && (
                <div className="fp-overlay" onClick={() => setMoveModal(null)}>
                    <div className="fp-modal" onClick={e => e.stopPropagation()}>
                        <div className="fp-modal-title">Move to folder</div>
                        <div className="fp-input-group">
                            <label className="fp-label">Destination folder</label>
                            <select
                                className="fp-select"
                                value={moveTarget}
                                onChange={e => setMoveTarget(e.target.value)}
                            >
                                <option value="">-- Select --</option>
                                {folders.filter(f => f.id !== moveModal.folder.id).map(f => (
                                    <option key={f.id} value={f.id}>{f.title}</option>
                                ))}
                            </select>
                        </div>
                        <div className="fp-modal-actions">
                            <button className="fp-btn-cancel" onClick={() => setMoveModal(null)}>Cancel</button>
                            <button className="fp-btn-primary" disabled={!moveTarget} onClick={async () => {
                                const targetFolder = folders.find(f => f.id === parseInt(moveTarget));
                                const result = await movePage(moveModal.id, parseInt(moveTarget));
                                if (result) {
                                    setPages(prev => prev.map(p => p.id === moveModal.id
                                        ? { ...p, folder: { id: targetFolder.id, title: targetFolder.title } }
                                        : p
                                    ));
                                }
                                setMoveModal(null);
                                setMoveTarget("");
                            }}>Move</button>
                        </div>
                    </div>
                </div>
            )}

            
            {confirmModal && (
                <div className="fp-overlay" onClick={() => setConfirmModal(null)}>
                    <div className="fp-modal confirm" onClick={e => e.stopPropagation()}>
                        <div className="fp-modal-icon">🗑️</div>
                        <div className="fp-modal-title">Are you sure?</div>
                        <p>
                            You are about to delete {confirmModal.type === "page"
                                ? `the page "${confirmModal.title}"`
                                : confirmLabel
                            }.<br />This action cannot be undone.
                        </p>
                        <div className="fp-modal-actions">
                            <button className="fp-btn-cancel" onClick={() => setConfirmModal(null)}>Cancel</button>
                            <button
                                className="fp-btn-danger"
                                onClick={confirmModal.type === "page"
                                    ? () => handleDeletePage({ id: confirmModal.id, title: confirmModal.title })
                                    : handleDeleteFolders
                                }
                            >Yes, delete</button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default FoldersPage;