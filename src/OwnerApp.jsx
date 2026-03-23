import { useState, useEffect } from 'react';
import { IconCalendar, IconClock, IconUsers, IconUser, IconX, IconStore } from './Icons';
import * as api from './api';

export default function OwnerApp({ user, onLogout, showToast }) {
  const [view, setView] = useState('bookings');
  const [venues, setVenues] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [addOpen, setAddOpen] = useState(false);
  const [newV, setNewV] = useState({ name:'', cuisine:'American', priceRange:'$$', image:'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4', distance:'1.0 mi', about:'' });
  const [loading, setLoading] = useState(true);

  const fetchVenuesAndBookings = async () => {
    try {
      setLoading(true);
      const vData = await api.getOwnerRestaurants(user.id);
      setVenues(vData);

      if (vData.length > 0) {
        const bData = await api.getRestaurantBookings(vData[0].id);
        setBookings(bData);
      }
    } catch(err){
      showToast('Network error: Retrying connection...', 'error');
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchVenuesAndBookings(); }, [user.id]);

  const updateStatus = async (id, status) => {
    try {
      await api.updateBookingStatus(id, status);
      setBookings(p => p.map(b => b.id === id ? { ...b, status } : b));
      showToast(`Booking marked as ${status}`, 'success');
    } catch (err) {
      showToast('Failed to update. Check connection.', 'error');
    }
  };

  const submitVenue = async () => {
    if (!newV.name) { showToast('Please enter a venue name.'); return; }
    try {
      await api.createRestaurant({...newV, ownerId: user.id, tags:['New']});
      setAddOpen(false);
      showToast('Venue successfully added!', 'success');
      fetchVenuesAndBookings();
    } catch(err) {
      showToast('Error saving venue. Are you online?', 'error');
    }
  };

  const Nav = () => (
    <nav className="bottom-nav">
      <button className={`nav-item ${view==='bookings'?'active':''}`} onClick={()=>setView('bookings')}><IconCalendar size={24} /><span className="nav-label">Queue</span></button>
      <button className={`nav-item ${view==='venues'?'active':''}`} onClick={()=>setView('venues')}><IconStore size={24} /><span className="nav-label">My Venues</span></button>
      <button className="nav-item" onClick={onLogout}><IconX size={24} /><span className="nav-label">Logout</span></button>
    </nav>
  );

  return (
    <div className="app-container fade-in">
      <div className="scroll-view">
        <div className="home-header">
          <div><div className="home-greeting">Owner Dashboard</div><h1 className="home-title">{view==='bookings'?'Live Queue':'My Venues'}</h1></div>
          <div className="header-icon-btn"><IconUser size={20} /></div>
        </div>

        {view === 'bookings' && (
          <div style={{padding:'0 20px'}}>
             {loading ? <div className="spinner" /> :
             venues.length === 0 ? (
               <div className="error-state" style={{marginTop:'40px'}}>
                 <div className="error-icon" style={{width: 80, height: 80}}><IconStore size={36} /></div>
                 <h3 style={{fontSize:'1.2rem', marginBottom:'8px'}}>No Venues Yet</h3>
                 <p style={{color:'var(--text-secondary)', maxWidth:'250px', lineHeight:'1.5'}}>Tap 'My Venues' to create your first restaurant and start accepting reservations.</p>
               </div>
             ) : bookings.length === 0 ? (
               <div className="error-state" style={{marginTop:'40px'}}>
                 <div className="error-icon" style={{width: 80, height: 80, background: 'var(--bg-secondary)', color: 'var(--text-tertiary)'}}><IconCalendar size={36} /></div>
                 <h3 style={{fontSize:'1.2rem', marginBottom:'8px', color:'var(--text-secondary)'}}>No Reservations</h3>
                 <p style={{color:'var(--text-tertiary)', maxWidth:'250px', lineHeight:'1.5'}}>Your queue is empty right now. New bookings will appear here.</p>
               </div>
             ) : bookings.map(b => (
               <div className="booking-card slide-up" key={b.id}>
                 <div style={{display:'flex', justifyContent:'space-between', marginBottom:'12px'}}>
                   <h3 className="booking-rest-name" style={{marginBottom:0}}>{b.customerName}</h3>
                   <span className="booking-status">{b.status}</span>
                 </div>
                 <div className="booking-details-grid">
                   <div className="booking-detail-item"><IconCalendar size={16} /> {b.date}</div>
                   <div className="booking-detail-item"><IconClock size={16} /> {b.time}</div>
                   <div className="booking-detail-item"><IconUsers size={16} /> Party of {b.guests}</div>
                 </div>
                 {b.notes && <div style={{fontSize:'0.85rem', color:'var(--text-secondary)', marginBottom:'16px', fontStyle:'italic'}}>Note: {b.notes}</div>}
                 
                 {b.status === 'Pending' && (
                   <div className="booking-actions">
                     <button className="btn-secondary" style={{color:'var(--brand-danger)'}} onClick={()=>updateStatus(b.id, 'Declined')}>Decline</button>
                     <button className="btn-secondary" style={{background:'var(--brand-success)', color:'#fff'}} onClick={()=>updateStatus(b.id, 'Confirmed')}>Accept</button>
                   </div>
                 )}
               </div>
             ))}
          </div>
        )}

        {view === 'venues' && (
          <div style={{padding:'0 20px'}}>
             <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'20px'}}>
               <p style={{fontSize:'0.9rem', color:'var(--text-secondary)', margin:0}}>Your active platform venues.</p>
               <button className="btn-secondary" style={{padding:'6px 12px', fontSize:'0.85rem'}} onClick={fetchVenuesAndBookings}>⟳ Refresh</button>
             </div>
             {loading ? <div className="spinner" /> : venues.map(v => (
               <div className="rest-card" key={v.id} style={{marginBottom:'24px', pointerEvents:'none'}}>
                 <div className="rest-card-image-wrap" style={{aspectRatio:'16/9'}}>
                   <img src={v.image} alt={v.name} className="rest-card-image" />
                 </div>
                 <h3 className="rest-card-title">{v.name}</h3>
                 <div className="rest-card-meta">{v.cuisine} · {v.priceRange} · {v.rating} Stars</div>
               </div>
             ))}
             <button className="btn-primary" onClick={()=>setAddOpen(true)}>+ Add New Venue</button>
          </div>
        )}
      </div>
      <Nav />
      {addOpen && (
        <div className="modal-overlay" onClick={()=>setAddOpen(false)}>
          <div className="modal-sheet slide-up" onClick={e=>e.stopPropagation()}>
            <div className="modal-sheet-handle" />
            <div className="modal-header"><h2 className="modal-title">New Venue</h2><button className="modal-close-btn" onClick={()=>setAddOpen(false)}><IconX size={18} /></button></div>
            <div className="form-group"><label className="form-label">Restaurant Name</label><input className="form-input" value={newV.name} onChange={e=>setNewV({...newV,name:e.target.value})} /></div>
            <div className="form-row">
               <div className="form-group"><label className="form-label">Cuisine</label><input className="form-input" value={newV.cuisine} onChange={e=>setNewV({...newV,cuisine:e.target.value})} /></div>
               <div className="form-group"><label className="form-label">Price Range</label><select className="form-select" value={newV.priceRange} onChange={e=>setNewV({...newV,priceRange:e.target.value})}><option>$</option><option>$$</option><option>$$$</option></select></div>
            </div>
            <div className="form-group"><label className="form-label">About / Description</label><textarea className="form-input" rows="3" value={newV.about} onChange={e=>setNewV({...newV,about:e.target.value})} /></div>
            <button className="btn-primary mt-4" onClick={submitVenue}>Create Venue</button>
          </div>
        </div>
      )}
    </div>
  );
}
