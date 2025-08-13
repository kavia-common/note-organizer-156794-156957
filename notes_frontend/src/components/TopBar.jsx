import React from 'react';
import PropTypes from 'prop-types';

/**
 * TopBar component: search input and quick actions
 */

// PUBLIC_INTERFACE
export default function TopBar({ search, onSearchChange, onNewNote }) {
  /** Renders top bar with search field and new note action. */
  return (
    <div className="topbar">
      <div className="brand">
        <span className="brand-dot" />
        <span className="brand-name">Notes</span>
      </div>
      <div className="search">
        <input
          aria-label="Search notes"
          type="text"
          placeholder="Search notes..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>
      <div className="actions">
        <button className="btn btn-primary" onClick={onNewNote} aria-label="Create new note">
          + New Note
        </button>
      </div>
    </div>
  );
}

TopBar.propTypes = {
  search: PropTypes.string.isRequired,
  onSearchChange: PropTypes.func.isRequired,
  onNewNote: PropTypes.func.isRequired
};
