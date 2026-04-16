import React, { useState, useEffect } from 'react';
import api from '../../api/api';
import { useToast } from '../../components/ToastProvider';
import Pagination from '../../components/common/Pagination';
import LoadingSkeleton from '../../components/common/LoadingSkeleton';
import EmptyState from '../../components/common/EmptyState';
import '../Admin.css';

function AdminAuditLogs() {
  const { addToast } = useToast();

  const [auditLogs, setAuditLogs] = useState([]);
  const [auditPage, setAuditPage] = useState(0);
  const [auditSize] = useState(20);
  const [loadingAudit, setLoadingAudit] = useState(false);

  useEffect(() => {
    loadAuditLogs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadAuditLogs = async (page = 0) => {
    setLoadingAudit(true);
    try {
      const res = await api.get(`/admin/audit?page=${page}&size=${auditSize}`);
      setAuditLogs(res.data.content || res.data);
      setAuditPage(page);
    } catch (err) {
      addToast('Error al cargar audit logs', { type: 'error' });
      console.error('Error loading audit logs:', err);
    } finally {
      setLoadingAudit(false);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    try {
      return new Date(dateStr).toLocaleString();
    } catch {
      return dateStr;
    }
  };

  return (
    <div>
      <div className="section-header">
        <h2>Audit Logs</h2>
        <button className="btn btn--sm btn--outline" onClick={() => loadAuditLogs(auditPage)}>
          Recargar
        </button>
      </div>

      {loadingAudit ? (
        <LoadingSkeleton variant="table-row" count={5} />
      ) : (
        <>
          <div className="audit-logs-list">
            {auditLogs.length === 0 && <EmptyState icon="📜" title="Sin logs" description="No hay audit logs disponibles." />}
            {auditLogs.map((log, idx) => (
              <div key={log.id || idx} className="audit-log-item">
                <div className="audit-log-item__header">
                  <span className="audit-log-item__date">{formatDate(log.createdAt)}</span>
                  <span className="audit-log-item__action">{log.action}</span>
                  <span className="audit-log-item__actor">Actor: {log.actorId}</span>
                </div>
                {log.payload && (
                  <pre className="audit-log-item__payload">{
                    typeof log.payload === 'string' ? log.payload : JSON.stringify(log.payload, null, 2)
                  }</pre>
                )}
              </div>
            ))}
          </div>

          <Pagination
            currentPage={auditPage}
            onPageChange={(page) => loadAuditLogs(page)}
            hasMore={auditLogs.length >= auditSize}
          />
        </>
      )}
    </div>
  );
}

export default AdminAuditLogs;
