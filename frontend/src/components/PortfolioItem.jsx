import React from 'react';

const PortfolioItem = ({ item }) => {
  return (
    <li className="portfolio-item">
      <div className="portfolio-item-header">
        <strong>{item.title}</strong>
        <span className="portfolio-item-type">{item.type}</span>
        <span classSpan className="portfolio-item-date">{new Date(item.createdAt).toLocaleDateString()}</span>
      </div>
      <div className="portfolio-item-description">
        {item.description}
      </div>
      <div className="portfolio-item-actions">
        <button className="btn" onClick={() => alert('View details')}>View</button>
        <button className="btn btn-sm" onClick={() => alert('Edit')}>Edit</button>
        <button className="btn btn-sm" onClick={() => alert('Delete')}>Delete</button>
      </div>
    </li>
  );
};

export default PortfolioItem;