import React from 'react';
import PropTypes from 'prop-types';

/**
 * Sidebar component: shows tag filters and navigation
 */

// PUBLIC_INTERFACE
export default function Sidebar({ tags, activeTag, onSelectTag, counts }) {
  /** Renders a sidebar with an 'All' filter and list of tags. */
  const total = Object.values(counts || {}).reduce((a, b) => a + b, 0);

  return (
    <aside className="sidebar">
      <div className="sidebar-section">
        <div className="sidebar-title">Filters</div>
        <button
          className={`tag-item ${!activeTag ? 'active' : ''}`}
          onClick={() => onSelectTag('')}
        >
          All <span className="badge">{total}</span>
        </button>
      </div>
      <div className="sidebar-section">
        <div className="sidebar-title">Tags</div>
        <div className="tags-list">
          {tags.length === 0 && <div className="empty">No tags yet</div>}
          {tags.map((t) => (
            <button
              key={t}
              className={`tag-item ${activeTag === t ? 'active' : ''}`}
              onClick={() => onSelectTag(t)}
              title={`Filter by tag: ${t}`}
            >
              {t} <span className="badge">{counts[t] || 0}</span>
            </button>
          ))}
        </div>
      </div>
    </aside>
  );
}

Sidebar.propTypes = {
  tags: PropTypes.arrayOf(PropTypes.string).isRequired,
  activeTag: PropTypes.string,
  onSelectTag: PropTypes.func.isRequired,
  counts: PropTypes.object
};
