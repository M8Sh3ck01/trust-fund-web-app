import { useEffect, useState } from 'react';
import { X, CheckCircle } from 'lucide-react';
import { QRCode } from 'react-qr-code';
import { useOrderStore } from '../../store/useOrderStore';
import apiClient from '../../api/client';
import styles from './QRCodeModal.module.css';

export default function QRCodeModal({ orderId, onClose }) {
  const { activeOrders, pastOrders, fetchOrders } = useOrderStore();
  
  const allOrders = [...activeOrders, ...pastOrders];
  const order = allOrders.find(o => o.orderNumber === orderId || o._id === orderId || o.id === orderId);

  const [isCollected, setIsCollected] = useState(order?.status === 'Collected');
  const [error, setError] = useState(null);

  useEffect(() => {
    // Socket listeners in the store handle real-time status updates.
    // No polling required here anymore.
  }, [order]);

  const simulateStaffScan = async () => {
    try {
      if (!order) return;
      // Use the internal Mongo _id for the API call
      const targetId = order._id || order.id;
      
      await apiClient.patch(`/api/orders/${targetId}/collect`, {
        token: order.collectionToken
      });

      setIsCollected(true);
      fetchOrders();
    } catch (err) {
      // Backend uses 'error' field for messages
      setError(err.response?.data?.error || 'Failed to collect manually');
    }
  };

  if (!order) {
    return (
      <div className={styles.overlay} onClick={onClose}>
        <div className={styles.modal} onClick={e => e.stopPropagation()}>
          <p>Order not found</p>
          <button onClick={onClose}>Close</button>
        </div>
      </div>
    );
  }

  // Format: "ORDER-{id}:{token}" — gives the scanner everything it needs in one scan
  const orderId_raw = order._id || order.id;
  const qrValue = order.collectionToken 
    ? `ORDER-${orderId_raw}:${order.collectionToken}` 
    : `ORDER-${orderId_raw}`;

  return (
    <div 
      className={styles.overlay} 
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        {/* Close Button */}
        <button 
          className={styles.closeBtn} 
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }} 
          aria-label="Close"
        >
          <X size={24} />
        </button>

        {order?.status === 'Collected' ? (
          <div className={styles.successState}>
            <CheckCircle size={64} color="#22c55e" style={{ margin: '0 auto 16px' }} />
            <h2 className={styles.title}>Order Collected!</h2>
            <p className={styles.subtitle}>Enjoy your meal.</p>
            <button className={styles.doneBtn} onClick={onClose}>Done</button>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className={styles.modalHeader}>
              <h2 className={styles.title}>Pickup Code</h2>
              <p className={styles.subtitle}>Present this at the cafeteria counter</p>
            </div>

            {/* QR Code Area */}
            <div className={styles.qrWrapper}>
               <div className={styles.qrBox}>
                  <QRCode 
                    value={qrValue} 
                    size={200}
                    level="M"
                    bgColor="#ffffff"
                    fgColor="#000000"
                  />
               </div>
            </div>

            {/* Footer Details */}
            <div className={styles.modalFooter}>
              <span className={styles.orderNumber}>Order ID: #{order.orderNumber}</span>
              <p className={styles.helpText}>Staff will scan this code to fulfil your order.</p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
