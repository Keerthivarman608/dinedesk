import { useState } from 'react';
import { ArrowLeft, Star, MapPin, Clock, CheckCircle } from 'lucide-react';

export default function RestaurantDetailView({ restaurant, onBack, onBook }) {
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [guests, setGuests] = useState('2');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (date && time && guests) {
      onBook({ date, time, guests });
    } else {
      alert("Please fill in all booking details");
    }
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
                <select className="input-field select-field" required value={time} onChange={(e) => setTime(e.target.value)}>
                  <option value="" disabled>Select</option>
                  <option value="18:00">6:00 PM</option>
                  <option value="19:00">7:00 PM</option>
                  <option value="20:00">8:00 PM</option>
                  <option value="21:00">9:00 PM</option>
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
