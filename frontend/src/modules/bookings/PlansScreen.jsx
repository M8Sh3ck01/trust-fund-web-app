/**
 * @file PlansScreen.jsx
 * @description The main landing for the 'Plans' tab. Toggles between 
 * Individual Subscriptions and Event Bookings.
 */
import { useState } from 'react';
import { Repeat, CalendarDays, ArrowRight, CheckCircle2, Utensils, QrCode } from 'lucide-react';
import { useUserStore } from '../../store/useUserStore';
import { useBookingStore } from '../../store/useBookingStore';
import { useMenuStore } from '../../store/useMenuStore';
import BookingWizard from './BookingWizard';
import BookingTracker from './BookingTracker';
import RedeemConfirmSheet from './RedeemConfirmSheet';
import SubscribeSheet from './SubscribeSheet';
import QRCodeModal from '../orders/QRCodeModal';
import { useOrderStore } from '../../store/useOrderStore';
import { useEffect } from 'react';
import EmptyState from '../../components/EmptyState/EmptyState';
import styles from './PlansScreen.module.css';

export default function PlansScreen() {
  const [activeTab, setActiveTab] = useState('daily'); // 'daily' | 'events'
  const { profile } = useUserStore();
  const { activeOrders, setupSocketListeners: setupOrderListeners } = useOrderStore();
  const { userBookings, fetchBookings, setupSocketListeners: setupBookingListeners, isLoading: isBookingsLoading } = useBookingStore();
  
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [selectedBookingId, setSelectedBookingId] = useState(null);
  const [redeemMeal, setRedeemMeal] = useState(null);
  const [isSubscribeOpen, setIsSubscribeOpen] = useState(false);
  const [ticketToSee, setTicketToSee] = useState(null);

  const { meals, fetchMenu } = useMenuStore();

  useEffect(() => {
    if (meals.length === 0) fetchMenu();
    // Fetch real bookings from backend
    fetchBookings();
    
    // Start real-time listeners
    setupOrderListeners();
    setupBookingListeners();
  }, [meals, fetchMenu, fetchBookings, setupOrderListeners, setupBookingListeners]);

  // Detect any active member redemptions
  const activeRedemption = activeOrders.find(o => o.paymentMode === 'Credit');

  // Booking state — match the new backend status enum
  const ACTIVE_STATUSES = ['Requested', 'ChangesMade', 'Confirmed', 'Preparing', 'Ready'];
  const activeBookings = userBookings.filter(b => ACTIVE_STATUSES.includes(b.status));
  const pastBookings = userBookings.filter(b => !ACTIVE_STATUSES.includes(b.status));

  // Days left calculation
  const daysLeft = profile.subscriptionExpiry
    ? Math.max(0, Math.ceil((new Date(profile.subscriptionExpiry) - new Date()) / (1000 * 60 * 60 * 24)))
    : 0;

  if (isWizardOpen) {
    return <BookingWizard onExit={() => setIsWizardOpen(false)} />;
  }

  if (selectedBookingId) {
    const booking = userBookings.find(b => (b._id === selectedBookingId || b.id === selectedBookingId));
    return <BookingTracker booking={booking} onBack={() => setSelectedBookingId(null)} />;
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.pageTitle}>Your Plans</h1>
        <div className={styles.tabBar}>
          <button 
            className={`${styles.tab} ${activeTab === 'daily' ? styles.activeTab : ''}`}
            onClick={() => setActiveTab('daily')}
          >
            <Repeat size={18} />
            Daily Plan
          </button>
          <button 
            className={`${styles.tab} ${activeTab === 'events' ? styles.activeTab : ''}`}
            onClick={() => setActiveTab('events')}
          >
            <CalendarDays size={18} />
            Event Bookings
          </button>
        </div>
      </header>

      <main className={styles.content}>
        {activeTab === 'daily' ? (
          !profile.isSubscriber ? (
            <div className={styles.promoView}>
              <div className={styles.promoHero}>
                <h2 className={styles.promoTitle}>Eat Like a Founder.</h2>
                <p className={styles.promoSubtitle}>Join the Monthly Plan for priority meals, zero-fee collection, and 15% savings.</p>
              </div>

              <div className={styles.promoGrid}>
                <div className={styles.promoCard}>
                  <div className={styles.promoIcon}><Repeat size={24} /></div>
                  <h3>20 Meals/mo</h3>
                  <p>Curated daily selections delivered with priority.</p>
                </div>
                <div className={styles.promoCard}>
                  <div className={styles.promoIcon}><CheckCircle2 size={24} /></div>
                  <h3>Express Hub</h3>
                  <p>2-tap instant redemption at any cafeteria counter.</p>
                </div>
              </div>

              <button className={styles.joinBtn} onClick={() => setIsSubscribeOpen(true)}>
                Join the Monthly Plan
              </button>
            </div>
          ) : (
            <div className={styles.dailyView}>
              {/* Active Redemption Shortcut Card */}
              {activeRedemption && (
                <div className={styles.activeTicketCard}>
                  <div className={styles.ticketHeader}>
                    <div className={styles.ticketNameArea}>
                      <span className={styles.ticketBadge}>Active Ticket</span>
                      <h3 className={styles.ticketMealName}>
                        {activeRedemption.items[0].quantity}x {activeRedemption.items[0].meal.name}
                      </h3>
                    </div>
                    <div className={`${styles.statusPill} ${activeRedemption.status === 'Ready' ? styles.statusReady : ''}`}>
                      {activeRedemption.status}
                    </div>
                  </div>
                  <button 
                    className={styles.ticketBtn}
                    onClick={() => setTicketToSee(activeRedemption.orderNumber || activeRedemption._id)}
                  >
                    <QrCode size={18} /> Show Ticket
                  </button>
                </div>
              )}

              {/* Balance Circle */}
              <div className={styles.balanceCard}>
                <div className={styles.circleContainer}>
                  <svg viewBox="0 0 100 100" className={styles.balanceSvg}>
                    <circle className={styles.circleBg} cx="50" cy="50" r="45" />
                    <circle 
                      className={styles.circleProgress} 
                      cx="50" cy="50" r="45" 
                      style={{ 
                        strokeDashoffset: 283 - (283 * (profile.subscriptionBalance / (profile.currentPlan?.months * 20 || 20))) 
                      }}
                    />
                  </svg>
                  <div className={styles.balanceText}>
                    <span className={styles.balanceNumber}>{profile.subscriptionBalance}</span>
                    <span className={styles.balanceLabel}>Meals Left</span>
                  </div>
                </div>
                <p className={styles.expiryText}>Plan resets in {daysLeft} days</p>
              </div>

              {/* Benefits / Info */}
              <section className={styles.infoSection}>
                <h3 className={styles.sectionTitle}>Subscriber Benefits</h3>
                <div className={styles.benefitRow}>
                  <CheckCircle2 size={18} className={styles.checkIcon} />
                  <span>Priority order fulfillment</span>
                </div>
                <div className={styles.benefitRow}>
                  <CheckCircle2 size={18} className={styles.checkIcon} />
                  <span>Zero convenience fees</span>
                </div>
              </section>

              {/* Instant Redemption List */}
              <section className={styles.redemptionSection}>
                <div className={styles.sectionHeader}>
                  <h3 className={styles.sectionTitle}>Redeem Today's Menu</h3>
                  <Utensils size={16} className={styles.sectionIcon} />
                </div>
                <div className={styles.redeemList}>
                  {meals.map(meal => (
                    <div key={meal._id} className={styles.redeemItem}>
                      <div className={styles.redeemInfo}>
                        <span className={styles.mealName}>{meal.name}</span>
                        <span className={styles.mealDesc}>{meal.description?.substring(0, 40)}...</span>
                      </div>
                      <button 
                        className={styles.instantRedeemBtn}
                        onClick={() => setRedeemMeal(meal)}
                        disabled={profile.subscriptionBalance === 0}
                      >
                        Redeem
                      </button>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          )
        ) : (
          <div className={styles.eventView}>

            {/* All bookings as a tappable list */}
            {userBookings.length > 0 ? (
              <div className={styles.bookingList}>
                {userBookings.map(b => {
                  const bookingId = b._id || b.id;
                  const isActive = ACTIVE_STATUSES.includes(b.status);
                  const isReady = b.status === 'Ready';
                  
                  // Handle both old and new data structure for safety
                  const displayName = b.eventName || b.data?.eventName || `Event #${bookingId.substring(0, 6)}`;
                  const displayDate = b.eventDate ? new Date(b.eventDate).toLocaleDateString() : b.data?.date;
                  const displayCount = b.headcount || b.data?.headcount;

                  return (
                    <button
                      key={bookingId}
                      className={styles.bookingListItem}
                      onClick={() => setSelectedBookingId(bookingId)}
                    >
                      <div className={styles.bookingListLeft}>
                        <span className={styles.bookingListName}>
                          {displayName}
                        </span>
                        <span className={styles.bookingListMeta}>
                          {displayDate} · {displayCount} guests
                        </span>
                      </div>
                      <div className={styles.bookingListRight}>
                        <span className={`${styles.bookingChip} ${isReady ? styles.chipReady : isActive ? styles.chipActive : styles.chipDone}`}>
                          {isReady && <span className={styles.chipDot} />}
                          {b.status}
                        </span>
                        <ArrowRight size={16} className={styles.bookingChevron} />
                      </div>
                    </button>
                  );
                })}
              </div>
            ) : (
              <EmptyState
                icon={<CalendarDays />}
                title="Plan Your Next Event"
                description="Need meals for a large meeting or private event? Book in advance to secure your slot."
                actionLabel="Book a New Event"
                onAction={() => setIsWizardOpen(true)}
              />
            )}

            {userBookings.length > 0 && (
              <button className={styles.bookBtn} onClick={() => setIsWizardOpen(true)}>
                Book a New Event <ArrowRight size={18} />
              </button>
            )}

          </div>
        )}

      </main>

      {redeemMeal && (
        <RedeemConfirmSheet 
          meal={redeemMeal} 
          onClose={() => setRedeemMeal(null)} 
        />
      )}

      {isSubscribeOpen && (
        <SubscribeSheet 
          onClose={() => setIsSubscribeOpen(false)} 
        />
      )}

      {ticketToSee && (
        <QRCodeModal 
          orderId={ticketToSee}
          onClose={() => setTicketToSee(null)}
        />
      )}
    </div>
  );
}
