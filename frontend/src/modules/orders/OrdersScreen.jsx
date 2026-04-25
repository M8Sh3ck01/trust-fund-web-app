import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ClipboardList, Clock, QrCode, ChevronRight, Repeat, Lock } from 'lucide-react';

import { useOrderStore } from '../../store/useOrderStore';
import StatusPill from '../../components/StatusPill/StatusPill';
import QRCodeModal from './QRCodeModal';
import LoadingState from '../../components/LoadingState/LoadingState';
import EmptyState from '../../components/EmptyState/EmptyState';
import styles from './OrdersScreen.module.css';

export default function OrdersScreen() {
  const { activeOrders, pastOrders, fetchOrders, setupSocketListeners, isLoading, error } = useOrderStore();
  const navigate = useNavigate();
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    fetchOrders();
    setupSocketListeners();
  }, [fetchOrders, setupSocketListeners]);

  const hasOrders = (activeOrders?.length || 0) > 0 || (pastOrders?.length || 0) > 0;

  if (isLoading) {
    return <LoadingState message="Fetching your orders..." />;
  }

  if (error) {
    return (
      <EmptyState
        icon={<ClipboardList />}
        title="Something went wrong"
        description={error}
        actionLabel="Try Again"
        onAction={() => fetchOrders()}
      />
    );
  }
  if (!hasOrders) {
    return (
      <EmptyState
        icon={<ClipboardList />}
        title="No orders yet"
        description="Hungry? Browse our Malawian menu and place your first order today!"
        actionLabel="Browse Menu"
        onAction={() => navigate('/')}
      />
    );
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.pageTitle}>Your Orders</h1>

      {/* Active Orders Section */}
      {activeOrders.length > 0 && (
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Active Orders</h2>
          <div className={styles.orderList}>
            {activeOrders.map((order) => (
              <div key={order._id} className={styles.orderCard}>
                <div className={styles.cardHeader}>
                  <div className={styles.orderMeta}>
                    <span className={styles.orderNumber}>{order.orderNumber}</span>
                    <span className={styles.orderTime}>
                      <Clock size={12} /> {order.createdAt ? new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--'}
                    </span>
                  </div>
                  <StatusPill
                    status={
                      order.status === 'Ready' ? 'avail' :
                        order.status === 'Preparing' ? 'warning' :
                          order.status === 'Requested' ? 'info' : 'danger'
                    }
                    label={order.status}
                  />
                </div>

                {/* Member Identity Card */}
                {order.paymentMode === 'Credit' && (
                  <div className={styles.memberBadge}>
                    <Repeat size={12} /> Member Redemption
                  </div>
                )}

                <div className={styles.cardBody}>
                  <div className={styles.itemList}>
                    {(order.items || []).slice(0, 2).map((item, idx) => (
                      <span key={idx} className={styles.itemTag}>
                        {item.quantity}x {item.nameAtPurchase || item.meal?.name || 'Meal'}
                      </span>
                    ))}
                    {(order.items?.length || 0) > 2 && (
                      <span className={styles.moreItems}>+{(order.items?.length || 0) - 2} more</span>
                    )}
                  </div>
                </div>

                <div className={styles.cardFooter}>
                  {order.status === 'Ready' ? (
                    <button
                      className={`${styles.qrBtn} ${styles.readyBtn}`}
                      onClick={(e) => { e.stopPropagation(); setSelectedOrder(order); }}
                    >
                      <QrCode size={18} />
                      Show for Collection
                    </button>
                  ) : (
                    <div className={styles.qrLocked}>
                      <Lock size={14} />
                      {order.status === 'Preparing' ? 'QR ready when kitchen is done' : 'QR available when Ready'}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Past Orders Section */}
      {pastOrders.length > 0 && (
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Order History</h2>
          <div className={styles.historyList}>
            {pastOrders.map((order) => (
              <div key={order._id} className={styles.historyRow}>
                <div className={styles.historyMeta}>
                  <span className={styles.historyId}>{order.orderNumber}</span>
                  <span className={styles.historyDate}>
                    {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'N/A'}
                  </span>
                </div>
                <div className={styles.historyInfo}>
                  <span className={styles.historyTotal}>
                    {order.paymentMode === 'Credit' ? 'Credit' : `MK ${order.totalAmount}`}
                  </span>
                  <ChevronRight size={16} className={styles.chevron} />
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* QR Code Modal Overlay */}
      {selectedOrder && (
        <QRCodeModal
          orderId={selectedOrder.orderNumber}
          onClose={() => setSelectedOrder(null)}
        />
      )}
    </div>
  );
}
