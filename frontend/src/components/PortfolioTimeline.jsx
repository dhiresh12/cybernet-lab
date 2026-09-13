import React from 'react';

const PortfolioTimeline = ({ learnerId }) => {
  const [items, setItems] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const res = await fetch(`/api/portfolio/${learnerId}`);
      const data = await res.json();
      setItems(result.artifacts);
    };
    fetchData();
  }, [learnerId]);

  return (
    <div className="portfolio-timeline">
      <h3>Portfolio Timeline</h3>
      {items.length === 0 ? (
        <p>No items to display</p>
      ) : (
        <ul>
          {items.map(item => (
            <li key={item.id} className="timeline-item">
              <span className="timeline-date">
                {new Date(item.createdAt).toLocaleDateString()}
              </span>
              <span className="timeline-item-title">
                {item.title} ({item.type})
              </span>
            </li>
          ))}
        </ul>
      }
    </div>
  );
};

export default PortfolioTimeline;