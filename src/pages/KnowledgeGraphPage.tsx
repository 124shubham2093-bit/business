import React from 'react';
import { Navigate } from 'react-router-dom';

/**
 * Knowledge Graph visualization was removed as part of the data integrity cleanup.
 */
export const KnowledgeGraphPage: React.FC = () => {
  return <Navigate to="/dashboard" replace />;
};

export default KnowledgeGraphPage;
