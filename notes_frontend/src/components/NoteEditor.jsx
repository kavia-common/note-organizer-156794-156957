import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';

/**
 * NoteEditor: edit area for a selected note.
 */

// PUBLIC_INTERFACE
export default function NoteEditor({ note, onSave }) {
  /** Renders editor for the given note with title/content/tags fields, debounced save. */
  const [title, setTitle] = useState(note?.title || '');
  const [content, setContent] = useState(note?.content || '');
  const [tagsInput, setTagsInput] = useState((note?.tags || []).join(', '));
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    setTitle(note?.title || '');
    setContent(note?.content || '');
    setTagsInput((note?.tags || []).join(', '));
    setDirty(false);
  }, [note?.id]);

  useEffect(() => {
    if (!note) return;
    setDirty(true);
    const handle = setTimeout(() => {
      const tags = tagsInput
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean);
      onSave({
        title,
        content,
        tags
      });
      setDirty(false);
    }, 500);
    return () => clearTimeout(handle);
  }, [title, content, tagsInput]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!note) {
    return <div className="editor empty centered">Select or create a note to start writing</div>;
  }

  return (
    <div className="editor">
      <div className="field">
        <input
          className="title-input"
          placeholder="Note title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          aria-label="Note title"
        />
      </div>
      <div className="field">
        <textarea
          className="content-input"
          placeholder="Start typing your note..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          aria-label="Note content"
        />
      </div>
      <div className="field row">
        <label htmlFor="tags">Tags</label>
        <input
          id="tags"
          className="tags-input"
          placeholder="e.g. work, personal, ideas"
          value={tagsInput}
          onChange={(e) => setTagsInput(e.target.value)}
          aria-label="Note tags"
        />
        <div className={`dot ${dirty ? 'unsaved' : 'saved'}`} title={dirty ? 'Saving…' : 'Saved'} />
      </div>
    </div>
  );
}

NoteEditor.propTypes = {
  note: PropTypes.object,
  onSave: PropTypes.func.isRequired
};
