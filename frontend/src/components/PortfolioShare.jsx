import React from 'react';

const PortfolioShare = ({ learnerId }) => {
  return (
    <div className="portfolio-share">
      <h3>Sharing Settings</h3>
      <p>This section will allow you to control who can view or collaborate on your portfolio items.</p>
      <p><strong>Public</strong>: Only visible to you.</p>
      <p><strong>Shared with team</strong>: Accessible to team members.</p>
      <p><strong>Invite collaborators</strong>: Enter email addresses to invite others.</p>
      {/* Placeholder for actual sharing UI */}
    </div>
  );
};

export default PortfolioShare;