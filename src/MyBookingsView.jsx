import { CalendarClock, MapPin, Users, TicketCheck } from 'lucide-react';

export default function MyBookingsView({ bookings }) {
  return (
    <div className="bookings-view fade-in">
      <header className="home-header">
        <h2 className="text-title">My Bookings</h2>
      </header>
      
      <div className="bookings-content p-4">
        {bookings.length === 0 ? (
          <div className="empty-state">
            <CalendarClock size={48} color="var(--text-muted)" />
            <h3 className="mt-4">No Bookings Yet</h3>
            <p className="text-caption text-center mt-2">Looks like you haven't reserved any tables yet. Discover amazing restaurants near you!</p>
          </div>
        ) : (
          <div className="bookings-list">
            {bookings.map((booking) => (
              <div key={booking.id} className="booking-card slide-up">
                <div className="booking-card-header">
                  <h3 className="restaurant-name">{booking.restaurant.name}</h3>
                  <span className="booking-status">{booking.status}</span>
                </div>
                
                <div className="booking-details-grid">
                  <div className="detail-item">
                    <MapPin size={16} color="var(--primary)" />
                    <span className="text-caption">{booking.restaurant.distance}</span>
                  </div>
                  <div className="detail-item">
                    <CalendarClock size={16} color="var(--primary)" />
                    <span className="text-caption">{booking.date} at {booking.time}</span>
                  </div>
                  <div className="detail-item">
                    <Users size={16} color="var(--primary)" />
                    <span className="text-caption">{booking.guests} People</span>
                  </div>
                  <div className="detail-item">
                    <TicketCheck size={16} color="var(--primary)" />
                    <span className="text-caption">ID: {booking.id.toUpperCase()}</span>
                  </div>
                </div>
                
                <div className="booking-actions">
                  <button className="btn btn-outline" style={{width: '100%'}}>Modify</button>
                  <button className="btn btn-primary" style={{width: '100%'}}>Directions</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
