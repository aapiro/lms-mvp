import React, { useState, useEffect } from 'react';
import api from '../../api/api';
import { useToast } from '../../components/ToastProvider';
import Pagination from '../../components/common/Pagination';
import Modal from '../../components/common/Modal';
import LoadingSkeleton from '../../components/common/LoadingSkeleton';
import EmptyState from '../../components/common/EmptyState';
import '../Admin.css';

function AdminPurchases() {
  const { addToast } = useToast();

  const [purchases, setPurchases] = useState([]);
  const [purchasePage, setPurchasePage] = useState(0);
  const [purchaseSize] = useState(20);
  const [loadingPurchases, setLoadingPurchases] = useState(false);
  const [showPurchaseDetail, setShowPurchaseDetail] = useState(false);
  const [purchaseDetail, setPurchaseDetail] = useState(null);

  useEffect(() => {
    loadPurchases();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadPurchases = async (page = 0) => {
    setLoadingPurchases(true);
    try {
      const res = await api.get(`/admin/purchases?page=${page}&size=${purchaseSize}`);
      setPurchases(res.data.content || res.data);
      setPurchasePage(page);
    } catch (err) {
      addToast('Error al cargar compras', { type: 'error' });
      console.error('Error loading purchases:', err);
    } finally {
      setLoadingPurchases(false);
    }
  };

  const openPurchaseDetail = async (id) => {
    try {
      const res = await api.get(`/admin/purchases/${id}`);
      setPurchaseDetail(res.data);
      setShowPurchaseDetail(true);
    } catch (err) {
      addToast('Error al cargar detalle de compra', { type: 'error' });
      console.error('Error loading purchase detail:', err);
    }
  };

  return (
    <div>
      <div className="section-header">
        <h2>Compras</h2>
      </div>

      {loadingPurchases ? (
        <LoadingSkeleton variant="table-row" count={5} />
      ) : (
        <>
          <div className="purchase-list">
            {purchases.length === 0 && <EmptyState icon="💳" title="Sin compras" description="No hay compras registradas." />}
            {purchases.map((p) => (
              <div key={p.id} className="purchase-item">
                <div className="purchase-item__info">
                  <span className="purchase-item__course">{p.courseTitle}</span>
                  <span className="purchase-item__email">{p.userEmail}</span>
                  <span className="purchase-item__amount">${p.amount}</span>
                  <span className={`purchase-item__status purchase-item__status--${p.status}`}>
                    {p.status}
                  </span>
                </div>
                <button
                  className="btn btn--sm btn--outline"
                  onClick={() => openPurchaseDetail(p.id)}
                >
                  Ver detalle
                </button>
              </div>
            ))}
          </div>

          <Pagination
            currentPage={purchasePage}
            onPageChange={(page) => loadPurchases(page)}
            hasMore={purchases.length >= purchaseSize}
          />
        </>
      )}

      <Modal
        isOpen={showPurchaseDetail}
        onClose={() => setShowPurchaseDetail(false)}
        title="Detalle de Compra"
      >
        {purchaseDetail && (
          <div className="purchase-detail">
            <p><strong>ID:</strong> {purchaseDetail.id}</p>
            <p><strong>Email:</strong> {purchaseDetail.userEmail}</p>
            <p><strong>User ID:</strong> {purchaseDetail.userId}</p>
            <p><strong>Curso:</strong> {purchaseDetail.courseTitle}</p>
            <p><strong>Course ID:</strong> {purchaseDetail.courseId}</p>
            <p><strong>Monto:</strong> ${purchaseDetail.amount}</p>
            <p><strong>Estado:</strong> {purchaseDetail.status}</p>
            <p><strong>Stripe Payment ID:</strong> {purchaseDetail.stripePaymentId}</p>
            <p><strong>Fecha de compra:</strong> {purchaseDetail.purchasedAt}</p>
          </div>
        )}
      </Modal>
    </div>
  );
}

export default AdminPurchases;
