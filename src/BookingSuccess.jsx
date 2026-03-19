import { CheckCircle, CalendarDays, Clock, Users } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function BookingSuccess({ onFinish }) {
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    // slight delay for staggered animation
    const timer = setTimeout(() => setShowDetails(true), 600);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="success-view fade-in">
      <div className="success-content">
        <div className="success-icon-wrapper">
          <CheckCircle size={80} color="white" className="bounce-in" />
        </div>
        
        <h2 className="success-title">Booking Confirmed!</h2>
        <p className="success-subtitle">Your table has been reserved successfully.</p>

        {showDetails && (
          <div className="success-details slide-up">
            <h3 className="section-title" style={{ textAlign: 'center', marginBottom: '1.5rem' }}>Reservation Details</h3>
            
            <div className="details-grid">
              <div className="detail-pill">
                <CalendarDays size={18} color="var(--primary)" />
                <span>Oct 24, 2023</span>
              </div>
              <div className="detail-pill">
                <Clock size={18} color="var(--primary)" />
                <span>7:00 PM</span>
              </div>
              <div className="detail-pill">
                <Users size={18} color="var(--primary)" />
                <span>2 People</span>
              </div>
            </div>

            <button className="btn btn-primary w-full mt-4" onClick={onFinish}>
              Back to Home
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
