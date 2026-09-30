import React, { useState } from 'react';

export default function ExpandableList({ items = [], initialCount = 5, renderItem, className = '' }) {
  const [expanded, setExpanded] = useState(false);
  const visibleItems = expanded ? items : items.slice(0, initialCount);
  return <div className={`expandable-list ${className}`.trim()}>
    {visibleItems.map((item, index) => renderItem(item, index))}
    {items.length > initialCount && <button type="button" className="see-more-list" aria-expanded={expanded} onClick={() => setExpanded((value) => !value)}>
      {expanded ? 'Show less' : `See more (${items.length - initialCount})`}
    </button>}
  </div>;
}
