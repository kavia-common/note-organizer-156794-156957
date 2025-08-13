import React from 'react';
import PropTypes from 'prop-types';

/**
 * NoteList: renders list of notes, allows selection and quick delete
 */

// PUBLIC_INTERFACE
export default function NoteList({ notes, selectedId, onSelect, onDelete }) {
  /** Renders the notes list with title, snippet, tags and updated time. */
  return (
    <div className="note-list">
      {notes.length === 0 && <div className="empty centered">No notes yet</div>}
      {notes.map((n) => (
        <div
          key={n.id}
          className={`note-list-item ${selectedId === n.id ? 'active' : ''}`}
          onClick={() => onSelect(n.id)}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && onSelect(n.id)}
        >
          <div className="note-item-header">
            <div className="note-title">{n.title || 'Untitled'}</div>
            <button
              type="button"
              className="icon-button"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(n.id);
              }}
              aria-label={`Delete ${n.title || 'note'}`}
              title="Delete note"
            >
              🗑
            </button>
          </div>
          <div className="note-snippet">{(n.content || '').slice(0, 120) || 'No content'}</div>
          <div className="note-meta">
            <div className="tags">
              {(n.tags || []).map((t) => (
                <span key={t} className="tag">
                  {t}
                </span>
              ))}
            </div>
            <div className="time">
              {n.updated_at ? new Date(n.updated_at).toLocaleString() : ''}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

NoteList.propTypes = {
  notes: PropTypes.array.isRequired,
  selectedId: PropTypes.string,
  onSelect: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired
};
