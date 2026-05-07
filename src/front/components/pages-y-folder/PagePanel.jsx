import { useRef, useState, useCallback } from 'react';
import { motion, useInView } from 'motion/react';
import './PagePanel.css';

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

const PagePanel = ({
  pages = [],
  activeFolder = null,
  onOpenPage,
  onMovePage,
  onDeletePage,
  onCreatePage,
  onUpdatePage,
  showCreateForm = false,
  onCancelCreate,
  onSubmitCreate,
  showGradients = true,
  displayScrollbar = true,
}) => {
  const listRef = useRef(null);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [topGradientOpacity, setTopGradientOpacity] = useState(0);
  const [bottomGradientOpacity, setBottomGradientOpacity] = useState(1);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [editingPage, setEditingPage] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');

  const folderPages = activeFolder ? pages.filter(p => p.folder.id === activeFolder.id) : [];

  const handleScroll = useCallback(e => {
    const { scrollTop, scrollHeight, clientHeight } = e.target;
    setTopGradientOpacity(Math.min(scrollTop / 50, 1));
    const bottomDistance = scrollHeight - (scrollTop + clientHeight);
    setBottomGradientOpacity(scrollHeight <= clientHeight ? 0 : Math.min(bottomDistance / 50, 1));
  }, []);

  const handleSubmitCreate = () => {
    if (!newTitle.trim() || !newContent.trim()) return;
    onSubmitCreate(newTitle.trim(), newContent.trim());
    setNewTitle('');
    setNewContent('');
  };

  const handleCancelCreate = () => {
    setNewTitle('');
    setNewContent('');
    onCancelCreate();
  };

  const handleStartEdit = (page, e) => {
    e.stopPropagation();
    setEditingPage(page);
    setEditTitle(page.title);
    setEditContent(page.content);
  };

  const handleSubmitEdit = () => {
    if (!editTitle.trim() || !editContent.trim()) return;
    onUpdatePage(editingPage.id, editTitle.trim(), editContent.trim());
    setEditingPage(null);
  };

  const handleCancelEdit = () => {
    setEditingPage(null);
    setEditTitle('');
    setEditContent('');
  };

  if (editingPage) return (
    <div className="page-create-form">
      <div className="page-create-header">
        <span className="page-create-title">Edit page</span>
        <button className="page-create-close" onClick={handleCancelEdit}>✕</button>
      </div>
      <div className="page-create-body">
        <label className="page-create-label">Title</label>
        <input
          className="page-create-input"
          placeholder="Page title..."
          value={editTitle}
          onChange={e => setEditTitle(e.target.value)}
          autoFocus
        />
        <label className="page-create-label">Contenido</label>
        <textarea
          className="page-create-textarea"
          placeholder="Write your notes here..."
          value={editContent}
          onChange={e => setEditContent(e.target.value)}
        />
      </div>
      <div className="page-create-footer">
        <button className="page-create-btn-cancel" onClick={handleCancelEdit}>Cancel</button>
        <button className="page-create-btn-submit" onClick={handleSubmitEdit}>Save changes</button>
      </div>
    </div>
  );

  if (showCreateForm) return (
    <div className="page-create-form">
      <div className="page-create-header">
        <span className="page-create-title">New page</span>
        <button className="page-create-close" onClick={handleCancelCreate}>✕</button>
      </div>
      <div className="page-create-body">
        <label className="page-create-label">Title</label>
        <input
          className="page-create-input"
          placeholder="Page title..."
          value={newTitle}
          onChange={e => setNewTitle(e.target.value)}
          autoFocus
        />
        <label className="page-create-label">Contenido</label>
        <textarea
          className="page-create-textarea"
          placeholder="Write your notes here..."
          value={newContent}
          onChange={e => setNewContent(e.target.value)}
        />
      </div>
      <div className="page-create-footer">
        <button className="page-create-btn-cancel" onClick={handleCancelCreate}>Cancel</button>
        <button className="page-create-btn-submit" onClick={handleSubmitCreate}>Create page</button>
      </div>
    </div>
  );

  if (!activeFolder) return (
    <div className="page-empty">
      <div className="page-empty-icon">
        <svg width="48" height="48" viewBox="0 0 100 100" fill="#457b9d" xmlns="http://www.w3.org/2000/svg">
          <path d="M10 25 C10 20 14 16 19 16 L38 16 C41 16 44 18 46 20 L50 25 L85 25 C90 25 94 29 94 34 L94 78 C94 83 90 87 85 87 L15 87 C10 87 6 83 6 78 L6 30 C6 27 8 25 10 25 Z"/>
        </svg>
      </div>
      <div className="page-empty-text">Select a folder to see its pages</div>
    </div>
  );

  if (folderPages.length === 0) return (
    <div className="page-empty">
      <div className="page-empty-icon">
        <svg width="48" height="48" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
          <path d="M6 30 L6 78 C6 83 10 87 15 87 L85 87 C90 87 94 83 94 78 L94 34 C94 29 90 25 85 25 L50 25 L46 20 C44 18 41 16 38 16 L19 16 C14 16 10 20 10 25 Z" fill="#457b9d"/>
          <path d="M6 30 L20 30 L85 25 L94 34 L50 25 L46 20 C44 18 41 16 38 16 L19 16 C14 16 10 20 10 25 Z" fill="#2d6a8f"/>
        </svg>
      </div>
      <div className="page-empty-text">No pages in this folder</div>
      <button className="page-empty-btn" onClick={onCreatePage}>+ Create new page or note</button>
    </div>
  );

  return (
    <div className="page-list-container">
      <div
        ref={listRef}
        className={`page-scroll-list ${!displayScrollbar ? 'no-scrollbar' : ''}`}
        onScroll={handleScroll}
      >
        {folderPages.map((page, index) => (
          <AnimatedItem
            key={page.id}
            delay={index * 0.05}
            index={index}
            onMouseEnter={() => setSelectedIndex(index)}
            onClick={() => { setSelectedIndex(index); onOpenPage(page); }}
          >
            <div className={`page-animated-item ${selectedIndex === index ? 'selected' : ''}`}>
              <p className="item-title">{page.title}</p>
              <p className="item-preview">{page.content}</p>
              <div className="item-actions" onClick={e => e.stopPropagation()}>
                <button className="item-act-btn edit" onClick={(e) => handleStartEdit(page, e)} title="Edit page">✏️</button>
                <button className="item-act-btn move" onClick={() => onMovePage(page)} title="Move to folder">📂</button>
                <button className="item-act-btn del" onClick={() => onDeletePage(page)} title="Delete page">✕</button>
              </div>
            </div>
          </AnimatedItem>
        ))}
      </div>
      {showGradients && (
        <>
          <div className="page-top-gradient" style={{ opacity: topGradientOpacity }} />
          <div className="page-bottom-gradient" style={{ opacity: bottomGradientOpacity }} />
        </>
      )}
    </div>
  );
};

export default PagePanel;