import { useState } from 'react';
import BottomSheet from '../../components/BottomSheet/BottomSheet';
import { useStaffStore } from '../../store/useStaffStore';
import { Phone, Calendar, Clock, Users, Tag, CreditCard, Clipboard, Save } from 'lucide-react';
import styles from './StaffDetailView.module.css';

const ORDER_STATUSES = ['Requested', 'Preparing', 'Ready', 'Collected', 'Cancelled'];
const BOOKING_STATUSES = ['Requested', 'ChangesMade', 'Confirmed', 'Scheduled', 'Preparing', 'Ready', 'Collected', 'Cancelled'];

export default function StaffDetailView({ record, type, onClose }) {
  const { updateOrderStatus, updateBookingStatus } = useStaffStore();
  const [headcount, setHeadcount] = useState(record?.headcount || 0);
  const [notes, setNotes] = useState(record?.notes || '');
  const [status, setStatus] = useState(record?.status);
  const [isSaving, setIsSaving] = useState(false);

  if (!record) return null;

  const handleUpdate = async (newStatus) => {
    setIsSaving(true);
    const targetStatus = typeof newStatus === 'string' ? newStatus : status;
    
    if (type === 'order') {
      await updateOrderStatus(record._id, targetStatus);
    } else {
      await updateBookingStatus(record._id, targetStatus, notes, headcount);
    }
    setIsSaving(false);
    onClose();
  };

  const statusOptions = type === 'order' ? ORDER_STATUSES : BOOKING_STATUSES;

  return (
    <BottomSheet
      isOpen={!!record}
      onClose={onClose}
      title={type === 'order' ? `Order #${record.orderNumber?.split('-').pop()}` : `Event: ${record.eventName}`}
    >
       <div className={styles.container}>
        {/* ID and Created Date */}
        <div className={styles.metaHeader}>
          <div className={styles.idBadge}>
            <Tag size={12} />
            <span>{record.orderNumber || record._id}</span>
          </div>
          <div className={styles.dateLabel}>
            Requested {new Date(record.createdAt).toLocaleString()}
          </div>
        </div>

        {/* Status Dropdown */}
        <div className={styles.statusSection}>
          <div className={styles.field}>
            <label>Current Status</label>
            <div className={styles.statusControl}>
              <select 
                value={status} 
                onChange={(e) => setStatus(e.target.value)}
                className={`${styles.statusSelect} ${styles[status]}`}
              >
                {statusOptions.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
              <button 
                className={styles.saveStatusBtn} 
                onClick={handleUpdate}
                disabled={isSaving || status === record.status}
              >
                <Save size={16} />
                Update
              </button>
            </div>
          </div>
        </div>

        {/* Customer Info (No Avatar) */}
        <section className={styles.section}>
          <h4 className={styles.sectionTitle}>Customer</h4>
          <div className={styles.customerCard}>
            <div className={styles.customerMain}>
              <div className={styles.customerName}>{record.user?.name}</div>
              <div className={styles.customerEmail}>{record.user?.email}</div>
            </div>
          </div>
          {record.contactNumber && (
            <div className={styles.detailRow}>
              <Phone size={16} />
              <span>{record.contactNumber}</span>
            </div>
          )}
        </section>

        {/* Timing & Payment */}
        <section className={styles.section}>
          <h4 className={styles.sectionTitle}>Event & Payment</h4>
          <div className={styles.timingGrid}>
            {type === 'booking' && (
              <>
                <div className={styles.detailRow}>
                  <Calendar size={16} />
                  <span>{new Date(record.eventDate).toLocaleDateString()}</span>
                </div>
                <div className={styles.detailRow}>
                  <Clock size={16} />
                  <span>{record.eventTime}</span>
                </div>
                <div className={styles.detailRow}>
                  <Users size={16} />
                  <span>{record.headcount} Guests</span>
                </div>
              </>
            )}
            <div className={styles.detailRow}>
              <CreditCard size={16} />
              <span className={styles.paymentStatus}>
                {record.paymentStatus || 'Pending'}
              </span>
            </div>
          </div>
        </section>

        {/* Items List */}
        <section className={styles.section}>
          <h4 className={styles.sectionTitle}>Items</h4>
          <div className={styles.itemsList}>
            {(type === 'order' ? record.items : record.selectedMeals).map((item, idx) => (
              <div key={idx} className={styles.itemRow}>
                <div className={styles.itemInfo}>
                  <div className={styles.itemName}>{item.nameAtPurchase || item.name}</div>
                  <div className={styles.itemMeta}>
                    MWK{item.priceAtPurchase || item.price} × {item.quantity || record.headcount}
                  </div>
                </div>
                <div className={styles.itemPrice}>
                  MWK{((item.priceAtPurchase || item.price) * (item.quantity || record.headcount)).toFixed(2)}
                </div>
              </div>
            ))}
            <div className={styles.totalRow}>
              <span>Estimated Total</span>
              <span>MWK{record.totalAmount?.toFixed(2)}</span>
            </div>
          </div>
        </section>

         {/* Direct Edits */}
        {type === 'booking' && (record.status === 'Requested' || record.status === 'Confirmed') && (
          <section className={styles.section}>
            <h4 className={styles.sectionTitle}>Adjustments</h4>
            <div className={styles.editGrid}>
              <div className={styles.field}>
                <label>Update Headcount</label>
                <div className={styles.headcountControl}>
                  <Users size={16} className={styles.fieldIcon} />
                  <input 
                    type="number" 
                    value={headcount} 
                    onChange={(e) => setHeadcount(parseInt(e.target.value) || 0)}
                    min="1"
                  />
                </div>
              </div>
              <div className={styles.field}>
                <label>Kitchen/Admin Notes</label>
                <div className={styles.notesControl}>
                  <Clipboard size={16} className={styles.fieldIcon} />
                  <textarea 
                    value={notes} 
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Enter notes for host or kitchen internal tracking..."
                  />
                </div>
              </div>
            </div>
            <button className={styles.finalSaveBtn} onClick={() => handleUpdate()} disabled={isSaving}>
              Save All Changes
            </button>
          </section>
        )}
      </div>
    </BottomSheet>
  );
}

