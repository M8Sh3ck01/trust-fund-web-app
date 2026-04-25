import { useEffect, useState, useMemo } from 'react';
import { useStaffStore } from '../../store/useStaffStore';
import { ShoppingBag, Calendar, QrCode, ClipboardList, CheckCircle, Clock, User } from 'lucide-react';
import StaffFilterBar from './StaffFilterBar';
import StaffDetailView from './StaffDetailView';
import StaffScanner from './StaffScanner';
import styles from './StaffHub.module.css';

export default function StaffHub() {
  const {
    liveOrders,
    eventBookings,
    fetchGlobalData,
    setupSocketListeners,
    isLoading,
    searchQuery,
    selectedTab,
    newOrderIds,
    newBookingIds,
  } = useStaffStore();

  const [selectedRecord, setSelectedRecord] = useState(null);

  useEffect(() => {
    fetchGlobalData();
    setupSocketListeners();
  }, [fetchGlobalData, setupSocketListeners]);

  const filteredOrders = useMemo(() => {
    if (selectedTab !== 'orders') return [];
    return liveOrders.filter(order =>
      order.orderNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.user?.name?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [liveOrders, searchQuery, selectedTab]);

  const filteredBookings = useMemo(() => {
    if (selectedTab !== 'bookings') return [];
    return eventBookings.filter(booking =>
      booking.eventName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.user?.name?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [eventBookings, searchQuery, selectedTab]);

  const renderContent = () => {
    if (isLoading && liveOrders.length === 0) return <div className={styles.loading}>Loading operations...</div>;

    if (selectedTab === 'scanner') return <StaffScanner />;

    const items = selectedTab === 'orders' ? filteredOrders : filteredBookings;

    return (
      <div className={styles.feed}>
        {items.map(item => (
          <CompactCard
            key={item._id}
            item={item}
            type={selectedTab === 'orders' ? 'order' : 'booking'}
            isNew={selectedTab === 'orders' ? newOrderIds.has(item._id) : newBookingIds.has(item._id)}
            onClick={() => setSelectedRecord(item)}
          />
        ))}
        {items.length === 0 && (
          <div className={styles.empty}>
            <p>No {selectedTab} matching "{searchQuery}"</p>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className={styles.container}>
      <StaffFilterBar />

      <main className={styles.content}>
        {renderContent()}
      </main>

      {selectedRecord && (
        <StaffDetailView
          record={selectedRecord}
          type={selectedTab === 'orders' ? 'order' : 'booking'}
          onClose={() => setSelectedRecord(null)}
        />
      )}
    </div>
  );
}

function CompactCard({ item, type, isNew, onClick }) {
  const idPrefix = type === 'order' ? 'ORD' : 'EVT';
  const id = (item.orderNumber || item._id).split('-').pop().toUpperCase();

  return (
    <div
      className={`${styles.compactCard} ${isNew ? styles.newCard : ''}`}
      onClick={onClick}
    >
      <div className={styles.cardInfo}>
        <div className={styles.cardHeader}>
          <span className={styles.compactId}>{idPrefix}-{id}</span>
          <div className={`${styles.statusDot} ${styles[item.status]}`} title={item.status} />
          {isNew && <span className={styles.newBadge}>NEW</span>}
        </div>
        <div className={styles.compactTitle}>
          {type === 'order' ? item.user?.name : item.eventName}
        </div>
        <div className={styles.compactSub}>
          {type === 'order'
            ? `${item.items?.length} items · MWK${item.totalAmount?.toFixed(2)}`
            : `${item.user?.name} · ${item.headcount} guests`
          }
        </div>
      </div>
      <div className={styles.cardIcon}>
        {type === 'order' ? <ShoppingBag size={16} /> : <Calendar size={16} />}
      </div>
    </div>
  );
}
