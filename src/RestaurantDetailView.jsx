import { useState, useEffect } from 'react';
import { ArrowLeft, Star, MapPin, Clock, CheckCircle, AlertCircle } from 'lucide-react';

export default function RestaurantDetailView({ restaurant, onBack, onBook }) {
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [guests, setGuests] = useState('2');
  const [error, setError] = useState('');
  const [availableTimes, setAvailableTimes] = useState([]);

  useEffect(() => {
    if (date) {
      const day = new Date(date).getDay();
      if (day === 0 || day === 6) { 
        setAvailableTimes(['17:00', '18:00', '19:00', '20:00', '21:00', '22:00']);
      } else { 
        setAvailableTimes(['18:00', '19:00', '20:30', '21:00']);
      }
      setTime('');
      setError('');
    } else {
      setAvailableTimes([]);
    }
  }, [date]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!date) {
      setError("Please select a date.");
      return;
    }
    if (!time) {
      setError("Please select an available time.");
      return;
    }
    if (!guests) {
      setError("Please specify the number of guests.");
      return;
    }
    setError('');
    onBook({ date, time, guests });
  };

  return (
    <div className="detail-view fade-in">
      <div className="detail-header-image" style={{ backgroundImage: `url(${restaurant.image})` }}>
        <button className="back-button btn-icon" onClick={onBack}>
          <ArrowLeft size={20} />
        </button>
      </div>

      <div className="detail-content slide-up">
        <div className="detail-header">
          <h2 className="detail-title">{restaurant.name}</h2>
          <div className="restaurant-rating">
            <Star size={16} fill="var(--primary)" color="var(--primary)" />
            <span>{restaurant.rating} ({restaurant.reviews} reviews)</span>
          </div>
        </div>

        <p className="detail-description">{restaurant.about}</p>

        <div className="detail-info-grid">
          <div className="info-item">
            <MapPin size={20} color="var(--primary)" />
            <div>
              <p className="text-caption">Location</p>
              <p className="text-body">{restaurant.distance} away</p>
            </div>
          </div>
          <div className="info-item">
            <Clock size={20} color="var(--primary)" />
            <div>
              <p className="text-caption">Open Hours</p>
              <p className="text-body">10:00 AM - 10:00 PM</p>
            </div>
          </div>
        </div>

        <div className="booking-section">
          <h3 className="section-title">Reserve a Table</h3>
          {error && (
            <div className="error-message" style={{ color: '#ff4d4f', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1rem', padding: '0.5rem', backgroundColor: 'rgba(255, 77, 79, 0.1)', borderRadius: '8px' }}>
              <AlertCircle size={16} /> <span className="text-caption">{error}</span>
            </div>
          )}
          <form onSubmit={handleSubmit} className="booking-form">
            <div className="form-group">
              <label className="text-caption">Date</label>
              <input 
                type="date" 
                className="input-field" 
                required 
                value={date} 
                onChange={(e) => setDate(e.target.value)}
                style={{ paddingLeft: '1rem' }}
              />
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label className="text-caption">Time</label>
                <select className="input-field select-field" required value={time} onChange={(e) => { setTime(e.target.value); setError(''); }} disabled={!date}>
                  <option value="" disabled>{date ? "Select a time" : "Select date first"}</option>
                  {availableTimes.map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="text-caption">Guests</label>
                <select className="input-field select-field" required value={guests} onChange={(e) => setGuests(e.target.value)}>
                  <option value="1">1 Person</option>
                  <option value="2">2 People</option>
                  <option value="3">3 People</option>
                  <option value="4">4 People</option>
                  <option value="5+">5+ People</option>
                </select>
              </div>
            </div>

            <button type="submit" className="btn btn-primary book-btn">
              Confirm Booking
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
