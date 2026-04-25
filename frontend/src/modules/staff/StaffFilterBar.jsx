import { Search, ShoppingBag, Calendar, QrCode } from 'lucide-react';
import { useStaffStore } from '../../store/useStaffStore';
import styles from './StaffFilterBar.module.css';

export default function StaffFilterBar() {
  const { searchQuery, setSearchQuery, selectedTab, setSelectedTab, liveOrders, eventBookings } = useStaffStore();

  return (
    <div className={styles.container}>
      <div className={styles.searchRow}>
        <div className={styles.searchWrapper}>
          <Search className={styles.searchIcon} size={18} />
          <input
            type="text"
            placeholder={`Search ${selectedTab}...`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={styles.searchInput}
          />
          {searchQuery && (
            <button className={styles.clearBtn} onClick={() => setSearchQuery('')}>×</button>
          )}
        </div>
      </div>

      <div className={styles.tabs}>
        <button 
          className={selectedTab === 'orders' ? styles.activeTab : ''} 
          onClick={() => { setSelectedTab('orders'); setSearchQuery(''); }}
        >
          <ShoppingBag size={18} />
          <span>Orders</span>
          <span className={styles.count}>{liveOrders.length}</span>
        </button>
        <button 
          className={selectedTab === 'bookings' ? styles.activeTab : ''} 
          onClick={() => { setSelectedTab('bookings'); setSearchQuery(''); }}
        >
          <Calendar size={18} />
          <span>Bookings</span>
          <span className={styles.count}>{eventBookings.length}</span>
        </button>
        <button 
          className={selectedTab === 'scanner' ? styles.activeTab : ''} 
          onClick={() => { setSelectedTab('scanner'); setSearchQuery(''); }}
        >
          <QrCode size={18} />
          <span>Scanner</span>
        </button>
      </div>
    </div>
  );
}
