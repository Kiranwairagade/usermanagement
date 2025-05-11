// src/components/common/AccessDenied.js
import React from 'react';

const AccessDenied = () => {
  return (
    <div style={{ padding: "2rem", textAlign: "center" }}>
      <h1>403 - Access Denied</h1>
      <p>You do not have permission to view this page.</p>
    </div>
  );
};

export default AccessDenied;