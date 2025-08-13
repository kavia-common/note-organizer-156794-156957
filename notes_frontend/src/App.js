import React, { useEffect, useMemo, useState } from 'react';
import './App.css';
import TopBar from './components/TopBar';
import Sidebar from './components/Sidebar';
import NoteList from './components/NoteList';
import NoteEditor from './components/NoteEditor';
import { createNote, deleteNote, getAllTags, listNotes, updateNote } from './services/notesService';

/**
 * Main Notes App
 * - Sidebar for tags
 * - Top bar for search and quick actions
 * - Main area with list and editor
 */

// PUBLIC_INTERFACE
function App() {
  /** Root application component for the Notes app. */
  const [notes, setNotes] = useState([]);
  const [search, setSearch] = useState('');
  const [activeTag, setActiveTag] = useState('');
  const [selectedId, setSelectedId] = useState('');
  const [tags, setTags] = useState([]);

  // Load notes on first render and when filters change
  useEffect(() => {
    let isMounted = true;
    (async () => {
      const data = await listNotes({ search, tag: activeTag });
      if (isMounted) {
        setNotes(data);
        // if selectedId missing, choose first
        if (data.length > 0 && !data.find((n) => n.id === selectedId)) {
          setSelectedId(data[0].id);
        }
      }
    })();
    return () => {
      isMounted = false;
    };
  }, [search, activeTag]); // eslint-disable-line react-hooks/exhaustive-deps

  // Load tag list
  useEffect(() => {
    let isMounted = true;
    (async () => {
      const all = await getAllTags();
      if (isMounted) setTags(all);
    })();
    return () => {
      isMounted = false;
    };
  }, [notes.length]);

  const selectedNote = useMemo(() => notes.find((n) => n.id === selectedId) || null, [notes, selectedId]);

  const counts = useMemo(() => {
    const c = {};
    for (const n of notes) {
      (n.tags || []).forEach((t) => {
        c[t] = (c[t] || 0) + 1;
      });
    }
    return c;
  }, [notes]);

  // PUBLIC_INTERFACE
  const handleCreate = async () => {
    /** Create a new blank note and select it. */
    const n = await createNote({ title: 'Untitled', content: '', tags: [] });
    // Refresh list
    const data = await listNotes({ search, tag: activeTag });
    setNotes(data);
    setSelectedId(n.id);
  };

  // PUBLIC_INTERFACE
  const handleDelete = async (id) => {
    /** Delete a note and update state. */
    const ok = window.confirm('Delete this note? This cannot be undone.');
    if (!ok) return;
    await deleteNote(id);
    const data = await listNotes({ search, tag: activeTag });
    setNotes(data);
    if (selectedId === id) {
      setSelectedId(data[0]?.id || '');
    }
  };

  // PUBLIC_INTERFACE
  const handleSave = async (updates) => {
    /** Save changes to the selected note. */
    if (!selectedNote) return;
    const u = await updateNote(selectedNote.id, updates);
    if (!u) return;
    // optimistic refresh in memory
    setNotes((prev) => {
      const idx = prev.findIndex((x) => x.id === selectedNote.id);
      if (idx === -1) return prev;
      const copy = [...prev];
      copy[idx] = u;
      return copy.sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at));
    });
  };

  return (
    <div className="app-root">
      <TopBar search={search} onSearchChange={setSearch} onNewNote={handleCreate} />
      <div className="layout">
        <Sidebar
          tags={tags}
          activeTag={activeTag}
          onSelectTag={(t) => setActiveTag(t)}
          counts={counts}
        />
        <main className="main">
          <div className="panel list-panel">
            <NoteList
              notes={notes}
              selectedId={selectedId}
              onSelect={setSelectedId}
              onDelete={handleDelete}
            />
          </div>
          <div className="panel editor-panel">
            <NoteEditor note={selectedNote} onSave={handleSave} />
          </div>
        </main>
      </div>
    </div>
  );
}

export default App;
