// components/admin/ActivityLogPage.js
import React, { useState, useEffect, useCallback } from 'react';
import { activityLogService } from '../../services/activityLogService';
import './ActivityLogPage.css';

const ActivityLogPage = () => {
  /* ----------------- state ----------------- */
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    module: '',
    action: '',
    userEmail: '',
    page: 1,
    pageSize: 10
  });
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalCount: 0,
    hasNext: false,
    hasPrevious: false
  });

  /* ----------------- constants ----------------- */
  const modules = ['Products', 'Categories', 'Brands', 'Suppliers',
                   'Users', 'User Permissions', 'Authentication'];
  const actions = ['View', 'Create', 'Update', 'Delete', 'Login', 'Logout'];

  /* ----------------- helpers ----------------- */
  const formatDateTime = (d) =>
    d ? new Date(d).toLocaleString('en-US', { 
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false 
    }) : 'N/A';

  const truncate = (txt, len) =>
    !txt ? 'N/A' : txt.length <= len ? txt : `${txt.slice(0, len)}…`;

  const badgeCls = (ok) => ok ? 'status-success' : 'status-error';
  const actionCls = (a) => a ? `action-${a.toLowerCase()}` : 'action-default';

  /* ----------------- fetch ----------------- */
  const fetchActivityLogs = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await activityLogService.getActivityLogs(filters);
      console.log('Activity Logs Response:', res);
      
      if (res.success) {
        setLogs(Array.isArray(res.data) ? res.data : []);
        setPagination({
          currentPage: res.currentPage,
          totalPages: res.totalPages,
          totalCount: res.totalCount,
          hasNext: res.hasNext,
          hasPrevious: res.hasPrevious
        });
      } else {
        setError(res.message || 'Failed to fetch logs');
        setLogs([]);
      }
    } catch (err) {
      console.error('Error fetching activity logs:', err);
      setError('Failed to fetch logs. Please try again.');
      setLogs([]);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => { 
    console.log('Fetching logs with filters:', filters);
    fetchActivityLogs(); 
  }, [fetchActivityLogs]);

  /* ----------------- handlers ----------------- */
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value, page: 1 }));
  };

  const handleClearFilters = () => {
    setFilters({
      startDate: '',
      endDate: '',
      module: '',
      action: '',
      userEmail: '',
      page: 1,
      pageSize: 10
    });
  };

  const handlePageChange = (page) => {
    if (page >= 1 && page <= pagination.totalPages) {
      setFilters(prev => ({ ...prev, page }));
    }
  };

  const handleExportPdf = async () => {
    setExporting(true);
    setError(null);
    try {
      // Show loading state
      const result = await activityLogService.exportToPdf(filters);
      
      if (result.success) {
        // Show success message
        const message = `PDF exported successfully: ${result.filename}`;
        console.log(message);
        // You could add a success notification here if you have a notification system
      } else {
        setError(result.message || 'Failed to export PDF');
      }
    } catch (e) {
      console.error('Export error:', e);
      setError(e.message || 'Failed to export PDF');
    } finally {
      setExporting(false);
    }
  };

  /* ----------------- ui ----------------- */
  return (
    <div className="activity-log-page">
      {/* header */}
      <div className="page-header">
        <h1>Activity Log</h1>
        <div className="header-actions">
          <button className="export-btn"
                  onClick={handleExportPdf} 
                  disabled={loading || exporting}>
            {exporting ? (
              <>
                <span className="loading-spinner"></span>
                Exporting...
              </>
            ) : (
              'Export PDF'
            )}
          </button>
        </div>
      </div>

      {/* error */}
      {error && (
        <div className="error-message">
          <span>⚠️ {error}</span>
          <button onClick={() => setError(null)}>×</button>
        </div>
      )}

      {/* filters */}
      <div className="filters-section">
        <div className="filters-grid">
          {/* dates */}
          {['startDate', 'endDate'].map((f, i) => (
            <div className="filter-group" key={f}>
              <label>{i ? 'End Date' : 'Start Date'}</label>
              <input type="date" name={f}
                     value={filters[f]} onChange={handleFilterChange} />
            </div>
          ))}
          {/* module */}
          <div className="filter-group">
            <label>Module</label>
            <select name="module" value={filters.module} onChange={handleFilterChange}>
              <option value="">All Modules</option>
              {modules.map(m => <option key={m}>{m}</option>)}
            </select>
          </div>
          {/* action */}
          <div className="filter-group">
            <label>Action</label>
            <select name="action" value={filters.action} onChange={handleFilterChange}>
              <option value="">All Actions</option>
              {actions.map(a => <option key={a}>{a}</option>)}
            </select>
          </div>
          {/* email */}
          <div className="filter-group">
            <label>User Email</label>
            <input type="email" name="userEmail" placeholder="Filter by email"
                   value={filters.userEmail} onChange={handleFilterChange} />
          </div>
        </div>

        {/* buttons */}
        <div className="filter-actions">
          <button onClick={() => setFilters(p => ({ ...p, page: 1 }))}
                  className="search-btn" disabled={loading}>
            {loading ? 'Searching…' : 'Search'}
          </button>
          <button onClick={handleClearFilters}
                  className="clear-btn" disabled={loading}>
            Clear Filters
          </button>
        </div>
      </div>

      {/* results */}
      <div className="results-section">
        <div className="results-header">
          <span>Total Records: {pagination.totalCount}</span>
          <span>Page {pagination.currentPage} of {pagination.totalPages}</span>
        </div>

        {loading ? (
          <div className="loading"><span>Loading…</span></div>
        ) : (
          <>
            <div className="table-container">
              <table className="activity-log-table">
                <thead>
                  <tr>
                    <th>Date/Time</th>
                    <th>Status</th>
                    <th>Action</th>
                    <th>Module</th>
                    <th>User Email</th>
                    <th>IP</th>
                    <th>Description</th>
                    <th>Details</th>
                    <th>Error</th>
                  </tr>
                </thead>
                <tbody>
                  {logs && logs.length > 0 ? (
                    logs.map(l => (
                      <tr key={l.id || Math.random()}>
                        <td>{formatDateTime(l.dateTime)}</td>
                        <td>
                          <span className={`status-badge ${badgeCls(l.isSuccess)}`}>
                            {l.isSuccess ? 'Success' : 'Error'}
                          </span>
                        </td>
                        <td>
                          <span className={`action-badge ${actionCls(l.action)}`}>
                            {l.action || 'Unknown'}
                          </span>
                        </td>
                        <td>{l.module || 'N/A'}</td>
                        <td>{l.userEmail || 'N/A'}</td>
                        <td>{l.ipAddress || 'N/A'}</td>
                        <td title={l.description}>{truncate(l.description, 50)}</td>
                        <td title={l.details}>{truncate(l.details, 50)}</td>
                        <td title={l.errorMessage}>{truncate(l.errorMessage, 30)}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="9" className="no-data">
                        {error ? 'Error loading data' : 'No activity logs found'}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* pagination */}
            {pagination.totalPages > 1 && (
              <div className="pagination">
                <button 
                  disabled={!pagination.hasPrevious}
                  onClick={() => handlePageChange(1)}
                  className="pagination-btn"
                >
                  First
                </button>
                <button 
                  disabled={!pagination.hasPrevious}
                  onClick={() => handlePageChange(pagination.currentPage - 1)}
                  className="pagination-btn"
                >
                  Prev
                </button>
                <span className="pagination-info">
                  Page {pagination.currentPage} of {pagination.totalPages}
                </span>
                <button 
                  disabled={!pagination.hasNext}
                  onClick={() => handlePageChange(pagination.currentPage + 1)}
                  className="pagination-btn"
                >
                  Next
                </button>
                <button 
                  disabled={!pagination.hasNext}
                  onClick={() => handlePageChange(pagination.totalPages)}
                  className="pagination-btn"
                >
                  Last
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ActivityLogPage;