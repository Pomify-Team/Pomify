import { useRef, useState, useCallback } from 'react';
import { motion, useInView } from 'motion/react';
import './FolderPanel.css';

const FolderClosedIcon = () => (
  <svg width="20" height="20" viewBox="0 0 100 100" fill="#457b9d" xmlns="http://www.w3.org/2000/svg">
    <path d="M10 25 C10 20 14 16 19 16 L38 16 C41 16 44 18 46 20 L50 25 L85 25 C90 25 94 29 94 34 L94 78 C94 83 90 87 85 87 L15 87 C10 87 6 83 6 78 L6 30 C6 27 8 25 10 25 Z"/>
  </svg>
);

const FolderOpenIcon = () => (
  <svg width="20" height="20" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
   
    <path d="M6 30 L6 78 C6 83 10 87 15 87 L85 87 C90 87 94 83 94 78 L94 34 C94 29 90 25 85 25 L50 25 L46 20 C44 18 41 16 38 16 L19 16 C14 16 10 20 10 25 Z" fill="#457b9d"/>
    
    <path d="M6 30 L20 30 L85 25 L94 34 L50 25 L46 20 C44 18 41 16 38 16 L19 16 C14 16 10 20 10 25 Z" fill="#2d6a8f"/>
    
    <rect x="32" y="38" width="36" height="44" rx="3" fill="white" opacity="0.95"/>
    
    <line x1="38" y1="48" x2="62" y2="48" stroke="#B0BBA8" strokeWidth="2.5" strokeLinecap="round"/>
    <line x1="38" y1="56" x2="62" y2="56" stroke="#B0BBA8" strokeWidth="2.5" strokeLinecap="round"/>
    <line x1="38" y1="64" x2="55" y2="64" stroke="#B0BBA8" strokeWidth="2.5" strokeLinecap="round"/>
  </svg>
);

const AnimatedItem = ({ children, delay = 0, index, onMouseEnter, onClick }) => {
  const ref = useRef(null);
  const inView = useInView(ref, { amount: 0.5, triggerOnce: false });
  return (
    <motion.div
      ref={ref}
      data-index={index}
      onMouseEnter={onMouseEnter}
      onClick={onClick}
      initial={{ scale: 0.7, opacity: 0 }}
      animate={inView ? { scale: 1, opacity: 1 } : { scale: 0.7, opacity: 0 }}
      transition={{ duration: 0.2, delay }}
      style={{ marginBottom: '8px', cursor: 'pointer' }}
    >
      {children}
    </motion.div>
  );
};

const FolderPanel = ({
  folders = [],
  pages = [],
  activeFolder = null,
  onSelectFolder,
  editMode = false,
  selectedFolders = [],
  onToggleSelect,
  onRenameFolder,
  showGradients = true,
  displayScrollbar = true,
}) => {
  const listRef = useRef(null);
  const [topGradientOpacity, setTopGradientOpacity] = useState(0);
  const [bottomGradientOpacity, setBottomGradientOpacity] = useState(1);
  const [editingId, setEditingId] = useState(null);
  const [editingTitle, setEditingTitle] = useState('');

  const handleScroll = useCallback(e => {
    const { scrollTop, scrollHeight, clientHeight } = e.target;
    setTopGradientOpacity(Math.min(scrollTop / 50, 1));
    const bottomDistance = scrollHeight - (scrollTop + clientHeight);
    setBottomGradientOpacity(scrollHeight <= clientHeight ? 0 : Math.min(bottomDistance / 50, 1));
  }, []);

  const startEditing = (folder, e) => {
    e.stopPropagation();
    setEditingId(folder.id);
    setEditingTitle(folder.title);
  };

  const confirmEdit = (id) => {
    if (editingTitle.trim()) onRenameFolder(id, editingTitle.trim());
    setEditingId(null);
  };

  const cancelEdit = () => setEditingId(null);

  const folderHasPages = (folderId) => pages.some(p => p.folder.id === folderId);

  return (
    <div className="folder-list-container">
      <div
        ref={listRef}
        className={`folder-scroll-list ${!displayScrollbar ? 'no-scrollbar' : ''}`}
        onScroll={handleScroll}
      >
        {folders.length === 0 && (
          <div style={{ textAlign: 'center', color: '#6B7280', fontSize: '13px', padding: '20px 0' }}>
            No folders yet
          </div>
        )}
        {folders.map((folder, index) => (
          <AnimatedItem
            key={folder.id}
            delay={index * 0.05}
            index={index}
            onMouseEnter={() => {}}
            onClick={() => { if (!editMode) onSelectFolder(folder); }}
          >
            <div className={`folder-animated-item ${activeFolder?.id === folder.id ? 'selected' : ''}`}>
              {editMode && (
                <input
                  type="checkbox"
                  style={{ width: '15px', height: '15px', accentColor: '#dc2626', cursor: 'pointer', flexShrink: 0 }}
                  checked={selectedFolders.includes(folder.id)}
                  onChange={() => onToggleSelect(folder.id)}
                  onClick={e => e.stopPropagation()}
                />
              )}

              
              <span className="folder-icon" style={{ flexShrink: 0 }}>
                {folderHasPages(folder.id) ? <FolderOpenIcon /> : <FolderClosedIcon />}
              </span>

              
              {editingId === folder.id ? (
                <>
                  <input
                    className="folder-rename-input"
                    value={editingTitle}
                    onChange={e => setEditingTitle(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter') confirmEdit(folder.id);
                      if (e.key === 'Escape') cancelEdit();
                    }}
                    onClick={e => e.stopPropagation()}
                    autoFocus
                  />
                  <button className="folder-rename-btn confirm" onClick={e => { e.stopPropagation(); confirmEdit(folder.id); }}>✓</button>
                  <button className="folder-rename-btn cancel" onClick={e => { e.stopPropagation(); cancelEdit(); }}>✕</button>
                </>
              ) : (
                <>
                  <p className="item-text">{folder.title}</p>
                  {editMode && (
                    <button className="folder-edit-btn" onClick={(e) => startEditing(folder, e)}>✏️</button>
                  )}
                  {!editMode && <span style={{ color: '#B0BBA8', fontSize: '12px' }}>›</span>}
                </>
              )}
            </div>
          </AnimatedItem>
        ))}
      </div>
      {showGradients && (
        <>
          <div className="folder-top-gradient" style={{ opacity: topGradientOpacity }} />
          <div className="folder-bottom-gradient" style={{ opacity: bottomGradientOpacity }} />
        </>
      )}
    </div>
  );
};

export default FolderPanel;