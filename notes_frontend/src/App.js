import React, { useEffect, useMemo, useState } from 'react';
import './App.css';
import { createNote, deleteNote, listNotes, searchNotes, updateNote } from './api/notes';

// Helpers
const debounce = (fn, ms = 400) => {
  let t;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), ms);
  };
};

// PUBLIC_INTERFACE
function App() {
  /** Notes application root component. Provides layout and CRUD operations. */
  const [notes, setNotes] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [query, setQuery] = useState('');

  const activeNote = useMemo(() => notes.find(n => n.id === activeId) || null, [notes, activeId]);

  useEffect(() => {
    // initial load
    (async () => {
      setLoading(true);
      try {
        const data = await listNotes();
        setNotes(data);
        if (data.length) setActiveId(data[0].id);
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error(e);
        alert('Failed to load notes. Check console for details.');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // PUBLIC_INTERFACE
  const onSearch = useMemo(
    () =>
      debounce(async (q) => {
        setQuery(q);
        setLoading(true);
        try {
          const data = await searchNotes(q);
          setNotes(data);
          if (data.length && !data.find(n => n.id === activeId)) {
            setActiveId(data[0].id);
          }
          if (!data.length) {
            setActiveId(null);
          }
        } catch (e) {
          // eslint-disable-next-line no-console
          console.error(e);
        } finally {
          setLoading(false);
        }
      }, 350),
    [activeId]
  );

  // PUBLIC_INTERFACE
  async function handleCreate() {
    /** Creates a new note and focuses it. */
    setSaving(true);
    try {
      const newNote = await createNote({ title: 'New note', content: '' });
      setNotes(prev => [newNote, ...prev]);
      setActiveId(newNote.id);
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error(e);
      alert('Failed to create note');
    } finally {
      setSaving(false);
    }
  }

  // PUBLIC_INTERFACE
  async function handleDelete(id) {
    /** Deletes a note and updates the list. */
    if (!window.confirm('Delete this note? This action cannot be undone.')) return;
    setSaving(true);
    try {
      await deleteNote(id);
      setNotes(prev => prev.filter(n => n.id !== id));
      if (id === activeId) {
        setActiveId(notes.length ? notes[0]?.id || null : null);
      }
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error(e);
      alert('Failed to delete note');
    } finally {
      setSaving(false);
    }
  }

  // PUBLIC_INTERFACE
  async function handleTitleChange(e) {
    /** Updates note title in state and persists after small debounce. */
    const title = e.target.value;
    if (!activeNote) return;
    const id = activeNote.id;
    setNotes(prev => prev.map(n => (n.id === id ? { ...n, title } : n)));
    schedulePersist(id, { title });
  }

  // PUBLIC_INTERFACE
  async function handleContentChange(e) {
    /** Updates note content in state and persists after small debounce. */
    const content = e.target.value;
    if (!activeNote) return;
    const id = activeNote.id;
    setNotes(prev => prev.map(n => (n.id === id ? { ...n, content } : n)));
    schedulePersist(id, { content });
  }

  // Debounced persistence map (per note)
  const persistMap = React.useRef({});
  const schedulePersist = (id, patch) => {
    if (!persistMap.current[id]) {
      persistMap.current[id] = debounce(async (payload) => {
        setSaving(true);
        try {
          const updated = await updateNote(id, payload);
          setNotes(prev => prev.map(n => (n.id === id ? updated : n)));
        } catch (e) {
          // eslint-disable-next-line no-console
          console.error(e);
          alert('Failed to save note');
        } finally {
          setSaving(false);
        }
      }, 600);
    }
    persistMap.current[id](patch);
  };

  return (
    <div className="app" role="application" aria-label="Notes application">
      <header className="topbar" role="banner">
        <div className="brand" aria-label="App brand">
          <span className="dot" />
          Notes
        </div>
        <div className="search" role="search">
          <input
            className="input"
            placeholder="Search notes..."
            aria-label="Search notes"
            defaultValue={query}
            onChange={(e) => onSearch(e.target.value)}
          />
          <button className="btn btn-primary" onClick={handleCreate} disabled={saving}>
            + New
          </button>
        </div>
      </header>

      <section className="content">
        <aside className="sidebar" aria-label="Notes list">
          <div className="sidebar-header">
            <input
              className="input"
              placeholder="Filter titles..."
              aria-label="Filter titles"
              onChange={(e) => onSearch(e.target.value)}
            />
            <button className="btn btn-secondary" onClick={() => onSearch('')}>
              Clear
            </button>
          </div>
          <div className="list">
            {loading ? (
              <div style={{ padding: 12, color: '#6b7280' }}>Loading...</div>
            ) : notes.length === 0 ? (
              <div style={{ padding: 12, color: '#6b7280' }}>No notes found</div>
            ) : (
              notes.map((n) => (
                <div
                  key={n.id}
                  className={`note-item ${n.id === activeId ? 'active' : ''}`}
                  onClick={() => setActiveId(n.id)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => e.key === 'Enter' && setActiveId(n.id)}
                >
                  <div className="note-title">{n.title || 'Untitled'}</div>
                  <div className="note-snippet">
                    {(n.content || '').slice(0, 80) || 'No content'}
                  </div>
                </div>
              ))
            )}
          </div>
        </aside>

        <main className="editor" aria-label="Editor">
          <div className="editor-header">
            <input
              className="title-input"
              placeholder={activeNote ? 'Note title' : 'No note selected'}
              value={activeNote?.title || ''}
              onChange={handleTitleChange}
              disabled={!activeNote}
              aria-label="Note title"
            />
            <div className="sep" />
            <button
              className="btn btn-secondary"
              onClick={() => activeNote && handleDelete(activeNote.id)}
              disabled={!activeNote || saving}
              aria-label="Delete note"
              title="Delete note"
            >
              Delete
            </button>
          </div>
          <div className="editor-body">
            <textarea
              className="textarea"
              placeholder={activeNote ? 'Write your content here...' : 'Select or create a note to start writing'}
              value={activeNote?.content || ''}
              onChange={handleContentChange}
              disabled={!activeNote}
              aria-label="Note content"
            />
          </div>
        </main>
      </section>
    </div>
  );
}

export default App;
