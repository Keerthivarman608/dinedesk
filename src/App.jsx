import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './App.css';
import { IconHome, IconSearch, IconCalendar, IconUser, IconStar, IconHeart, IconCheck, IconX, IconClock, IconUsers, IconMapPin } from './Icons';
import * as api from './api';
import AuthView from './AuthView';
import OwnerApp from './OwnerApp';
import Detail from './Detail';
import BookingSheet from './BookingSheet';

function Toast({ msg, type }) {
  if (!msg) return null;
  return (
    <div className={`toast-container toast-${type}`} role="alert">
      <div style={{display:'flex', alignItems:'center', gap:'8px'}}>
         {type==='error' && <IconX size={16} />}
         {type==='success' && <IconCheck size={16} />}
         {msg}
      </div>
    </div>
  );
}

function ConfirmDialog({ msg, onConfirm, onCancel }) {
  return (
    <div className="modal-overlay" onClick={onCancel} style={{zIndex: 500}}>
      <div className="modal-sheet slide-up" onClick={e => e.stopPropagation()} style={{padding:'28px 24px'}}>
        <div className="modal-sheet-handle" />
        <h2 className="modal-title" style={{marginBottom:12}}>Confirm Action</h2>
        <p style={{color:'var(--text-secondary)', marginBottom:28, lineHeight:1.5}}>{msg}</p>
        <div style={{display:'flex', gap:12}}>
          <button className="btn-secondary" style={{flex:1}} onClick={onCancel}>Keep It</button>
          <button className="btn-primary" style={{flex:1, background:'var(--brand-danger)'}} onClick={onConfirm}>Yes, Cancel</button>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [user, setUser] = useState(() => {
    try { const s = localStorage.getItem('dinedesk_user'); return s ? JSON.parse(s) : null; } catch { return null; }
  });
  const [toast, setToast] = useState(null);
  const [confirmDialog, setConfirmDialog] = useState(null);

  const handleLogin = (u) => { setUser(u); localStorage.setItem('dinedesk_user', JSON.stringify(u)); };
  const handleLogout = () => { setUser(null); localStorage.removeItem('dinedesk_user'); localStorage.removeItem('dinedesk_favs'); localStorage.removeItem('dinedesk_token'); };

  const showConfirm = (msg, onConfirm) => setConfirmDialog({ msg, onConfirm });
  const dismissConfirm = () => setConfirmDialog(null);

  const showToast = (msg, type='error') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  };

  const renderApp = () => {
    if (!user) return <AuthView onLogin={handleLogin} showToast={showToast} />;
    if (user.role === 'RESTAURANT') return <OwnerApp user={user} onLogout={handleLogout} showToast={showToast} showConfirm={showConfirm} />;
    return <CustomerApp user={user} onUpdateUser={(u) => { setUser(u); localStorage.setItem('dinedesk_user', JSON.stringify(u)); }} onLogout={handleLogout} showToast={showToast} showConfirm={showConfirm} />;
  };

  return (
    <>
      {toast?.msg && <Toast msg={toast.msg} type={toast.type} />}
      {confirmDialog && <ConfirmDialog msg={confirmDialog.msg} onConfirm={() => { confirmDialog.onConfirm(); dismissConfirm(); }} onCancel={dismissConfirm} />}
      <AnimatePresence mode="wait">
        <motion.div
          key={user ? (user.role === 'RESTAURANT' ? 'owner' : 'customer') : 'auth'}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3 }}
          style={{ height: '100%' }}
        >
          {renderApp()}
        </motion.div>
      </AnimatePresence>
    </>
  );
}

function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

// ==========================================
// CUSTOMER APP
// ==========================================
function CustomerApp({ user, onUpdateUser, onLogout, showToast, showConfirm }) {
  const [view, setView] = useState('home');
  const [rests, setRests] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [favs, setFavs] = useState(() => {
    try { const s = localStorage.getItem('dinedesk_favs'); return s ? new Set(JSON.parse(s)) : new Set(); } catch { return new Set(); }
  });
  const [sel, setSel] = useState(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [cat, setCat] = useState('All');
  const today = new Date().toISOString().split('T')[0];
  const [bData, setBData] = useState({ date: today, time:'19:00', guests:'2', notes:'' });
  const [modBooking, setModBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [bookingLoading, setBookingLoading] = useState(false);
  
  // Dummy Preference State
  const [pushEnabled, setPushEnabled] = useState(true);

  // Profile Edit State
  const [profileOpen, setProfileOpen] = useState(false);
  const [pData, setPData] = useState({ name: user.name, phone: user.phone || '', dietaryRestrictions: user.dietaryrestrictions || '' });

  const saveProfile = async () => {
    if (pData.name.trim().length < 2) return showToast('Name cannot be empty.', 'error');
    try {
      const json = await api.updateProfile(user.id, {...pData, email: user.email});
      onUpdateUser(json.user);
      setProfileOpen(false);
      showToast('Profile successfully updated!', 'success');
    } catch(err) {
      showToast('Failed to save profile.', 'error');
    }
  };

  const fetchAll = async () => {
    try {
      setLoading(true);
      const [restsData, bookingsData] = await Promise.all([
        api.getRestaurants(),
        api.getUserBookings(user.id)
      ]);
      setRests(restsData);
      setBookings(bookingsData);
    } catch(err) {
      showToast('Offline Mode: Pull to refresh.', 'error');
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchAll(); }, [user.id]);

  useEffect(() => {
    let title = 'DineDesk | Home';
    if (detailOpen && sel) { title = `DineDesk | ${sel.name}`; }
    else if (view === 'search') { title = 'DineDesk | Search'; }
    else if (view === 'bookings') { title = 'DineDesk | Reservations'; }
    else if (view === 'profile') { title = 'DineDesk | Profile'; }
    else if (view === 'success') { title = 'DineDesk | Booking Confirmed'; }
    
    document.title = title;
    
    // Update meta description
    let metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute('content', detailOpen && sel ? `Book a table and view details for ${sel.name} on DineDesk.` : `Reserve your perfect table instantly with DineDesk on our ${view} page.`);
    }
  }, [view, detailOpen, sel]);

  const toggleFav = (e, id) => {
    e.stopPropagation();
    setFavs(p => {
      const n = new Set(p);
      n.has(id) ? n.delete(id) : n.add(id);
      localStorage.setItem('dinedesk_favs', JSON.stringify([...n]));
      return n;
    });
  };
  const openDetail = r => { setSel(r); setDetailOpen(true); };
  const openBooking = () => { setModBooking(null); setModalOpen(true); };

  const confirmBooking = async () => {
    if (!bData.date) return showToast('Please select a date.', 'error');
    setBookingLoading(true);
    try {
      if (modBooking) {
        await api.updateBooking(modBooking.id, { date:bData.date, time:bData.time, guests:parseInt(bData.guests), status: 'Pending' });
        showToast('Reservation securely updated!', 'success');
      } else {
        await api.createBooking({ restaurantId:sel.id, userId:user.id, date:bData.date, time:bData.time, guests:parseInt(bData.guests), notes:bData.notes });
        showToast('Reservation successfully sent to the restaurant!', 'success');
      }
      fetchAll();
      setModalOpen(false); setDetailOpen(false); setModBooking(null); setView('success');
    } catch(err) {
      showToast(err.message || 'Network Error: Could not save reservation.', 'error');
    } finally { setBookingLoading(false); }
  };

  const cancelBooking = async (id) => {
    showConfirm('Are you sure you want to cancel this reservation?', async () => {
      try {
        await api.updateBookingStatus(id, 'Cancelled');
        showToast('Reservation cancelled.', 'info');
        fetchAll();
      } catch(err) { showToast('Network error while cancelling.', 'error'); }
    });
  };

  const openModify = (b) => {
    setSel({ id: b.restaurantId, name: b.restaurantName });
    setModBooking(b);
    setBData({ date: b.date, time: b.time, guests: String(b.guests), notes: b.notes || '' });
    setModalOpen(false);
    setTimeout(() => setModalOpen(true), 10);
  };

  const debouncedSearch = useDebounce(search, 300);

  const filtered = rests.filter(r => {
    const ms = (r.name||'').toLowerCase().includes(debouncedSearch.toLowerCase()) || (r.cuisine||'').toLowerCase().includes(debouncedSearch.toLowerCase());
    const mc = cat==='All' || (r.cuisine||'').toLowerCase().includes(cat.toLowerCase());
    return ms && mc;
  });

  const CATS = ["All","Japanese","American","Italian","Indian","Brunch"];

  const Nav = () => (
    <nav className="bottom-nav">
      <button className={`nav-item ${view==='home'?'active':''}`} onClick={()=>{setView('home');setDetailOpen(false);}}><IconHome size={24} /><span className="nav-label">Home</span></button>
      <button className={`nav-item ${view==='search'?'active':''}`} onClick={()=>{setView('search');setDetailOpen(false);}}><IconSearch size={24} /><span className="nav-label">Search</span></button>
      <button className={`nav-item ${view==='bookings'?'active':''}`} onClick={()=>{setView('bookings');setDetailOpen(false);}}><IconCalendar size={24} /><span className="nav-label">Bookings</span></button>
      <button className={`nav-item ${view==='profile'?'active':''}`} onClick={()=>{setView('profile');setDetailOpen(false);}}><IconUser size={24} /><span className="nav-label">Profile</span></button>
    </nav>
  );

  // Home
  if (view==='home') return (
    <div className="app-container">
      <div className="scroll-view">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="home-header"
        >
           <div><div className="home-greeting">Welcome back, {user.name}</div><h1 className="home-title">Find a Table</h1></div>
           <motion.button 
             whileTap={{ rotate: 180 }}
             className="header-icon-btn" 
             onClick={fetchAll} 
             aria-label="Refresh restaurants"
           >
             ⟳
           </motion.button>
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="categories-container"
        >
          {CATS.map(c=><button key={c} className={`category-pill ${cat===c?'active':''}`} onClick={()=>setCat(c)}>{c}</button>)}
        </motion.div>

        <div className="feed-list">
          <AnimatePresence mode="popLayout">
            {loading ? (
              <motion.div 
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="skeleton-feed"
              >
                {[1,2,3].map(i => (
                  <div key={i} className="skeleton-card">
                    <div className="skeleton skeleton-image" />
                    <div className="skeleton skeleton-title" />
                    <div className="skeleton skeleton-text" />
                  </div>
                ))}
              </motion.div>
            ) : filtered.length === 0 ? (
              <motion.div 
                key="empty"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="error-state"
              >
                <div className="error-icon"><IconSearch size={24} /></div>
                <h3>No match found</h3>
                <p style={{color:'var(--text-secondary)', marginTop:'8px'}}>Try exploring a different cuisine.</p>
                <button className="btn-secondary mt-4" onClick={()=>setCat('All')}>Clear Filter</button>
              </motion.div>
            ) : (
              filtered.map((r, idx)=>(
                <motion.div 
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  whileHover={{ y: -4 }}
                  className="rest-card" 
                  key={r.id} 
                  onClick={()=>openDetail(r)}
                >
                  <div className="rest-card-image-wrap">
                     <img src={r.image} alt={r.name} className="rest-card-image" loading="lazy" />
                     <button className="fav-btn" onClick={(e)=>toggleFav(e, r.id)} aria-label={favs.has(r.id) ? 'Remove from favorites' : 'Add to favorites'}><IconHeart filled={favs.has(r.id)} size={18} /></button>
                  </div>
                  <div className="rest-card-info">
                     <div className="rest-card-title-row"><h3 className="rest-card-title">{r.name}</h3><div className="rest-card-rating"><IconStar size={14} /> {r.rating}</div></div>
                     <div className="rest-card-meta">{r.cuisine} · {r.priceRange} · {r.distance}</div>
                  </div>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>
      </div>
      <Nav />
      {detailOpen && sel && <Detail r={sel} onBack={()=>setDetailOpen(false)} onBook={openBooking} fav={favs.has(sel.id)} onFav={(e)=>toggleFav(e, sel.id)} />}
      {modalOpen && <BookingSheet r={sel} data={bData} setData={setBData} onConfirm={confirmBooking} onClose={()=>setModalOpen(false)} loading={bookingLoading} />}
    </div>
  );

  // Search
  if (view==='search') return (
    <div className="app-container fade-in">
      <div className="scroll-view">
        <div className="home-header"><h1 className="home-title">Search</h1></div>
        <div className="search-input-wrap"><IconSearch size={20} className="search-icon" /><input className="search-input" placeholder="Restaurants, cuisines..." value={search} onChange={e=>setSearch(e.target.value)} /></div>
        <div className="feed-list mt-4">
          {filtered.map(r=>(
            <div className="rest-card" key={r.id} onClick={()=>openDetail(r)}>
              <div className="rest-card-image-wrap" style={{aspectRatio:'16/9'}}><img src={r.image} alt={r.name} className="rest-card-image" loading="lazy" /></div>
              <div className="rest-card-info">
                <div className="rest-card-title-row"><h3 className="rest-card-title">{r.name}</h3><div className="rest-card-rating"><IconStar size={14} /> {r.rating}</div></div>
                <div className="rest-card-meta">{r.cuisine} · {r.distance}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <Nav />
      {detailOpen && sel && <Detail r={sel} onBack={()=>setDetailOpen(false)} onBook={openBooking} fav={favs.has(sel.id)} onFav={(e)=>toggleFav(e, sel.id)} />}
      {modalOpen && <BookingSheet r={sel} data={bData} setData={setBData} onConfirm={confirmBooking} onClose={()=>setModalOpen(false)} loading={bookingLoading} />}
    </div>
  );

  // Bookings
  if (view==='bookings') return (
    <div className="app-container fade-in">
      <div className="scroll-view">
        <div className="bookings-header"><h1 className="bookings-title">My Reservations</h1></div>
        <div className="tabs"><button className="tab active">Upcoming</button><button className="tab" onClick={fetchAll}>⟳ Refresh</button></div>
        <div>
          {loading ? <div className="spinner" /> : bookings.length===0 ? (
            <div className="error-state">
              <div className="error-icon" style={{background:'var(--bg-secondary)', color:'var(--border-dark)'}}><IconCalendar size={24} /></div>
              <h3>No upcoming reservations</h3><p style={{marginTop:'8px', fontSize:'0.9rem', color:'var(--text-secondary)'}}>Book a table to see it here.</p>
              <button className="btn-primary mt-4" style={{width:'auto', padding:'12px 24px'}} onClick={()=>setView('home')}>Find Tables</button>
            </div>
          ) : bookings.map(b=>(
            <div className="booking-card slide-up" key={b.id}>
              <div className="booking-status" style={{
                color: b.status==='Confirmed' ? 'var(--brand-success)' : b.status==='Cancelled'||b.status==='Declined' ? 'var(--brand-danger)' : 'var(--brand-warning)'
              }}>{b.status}</div>
              <h3 className="booking-rest-name">{b.restaurantName}</h3>
              <div className="booking-details-grid">
                <div className="booking-detail-item"><IconCalendar size={16} /> {b.date}</div>
                <div className="booking-detail-item"><IconClock size={16} /> {b.time}</div>
                <div className="booking-detail-item"><IconUsers size={16} /> {b.guests} Guests</div>
                <div className="booking-detail-item"><IconMapPin size={16} /> {b.distance}</div>
              </div>
              {b.status !== 'Cancelled' && b.status !== 'Declined' && (
                <div className="booking-actions">
                  <button className="btn-secondary" style={{color:'var(--brand-danger)'}} onClick={()=>cancelBooking(b.id)}>Cancel</button>
                  <button className="btn-secondary" onClick={()=>openModify(b)}>Modify</button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
      <Nav />
    </div>
  );

  // Success
  if (view==='success') return (
    <div className="app-container">
      <div className="success-view fade-in">
        <div className="success-icon-wrap"><IconCheck size={40} /></div>
        <h1 className="success-title">Confirmed!</h1>
        <p className="success-desc">Your table is ready. The restaurant has received your booking.</p>
        <button className="btn-primary" onClick={()=>setView('bookings')}>View Reservations</button>
      </div>
    </div>
  );

  // Profile
  return (
    <div className="app-container fade-in">
      <div className="scroll-view">
        <div className="bookings-header"><h1 className="bookings-title">Account</h1></div>
        <div className="profile-header">
           <div className="profile-avatar"><IconUser size={32} /></div>
           <div className="profile-info">
             <h2 style={{display:'flex', alignItems:'center', gap:'8px'}}>{user.name} <button onClick={()=>setProfileOpen(true)} style={{fontSize:'0.8rem', color:'var(--brand-accent)', background:'none', fontWeight:'700', padding:'4px 8px'}}>Edit</button></h2>
             <p>{user.email}</p>
             {user.phone && <p style={{fontSize:'0.85rem', color:'var(--text-secondary)', marginTop:'2px'}}>{user.phone}</p>}
           </div>
        </div>
        
        <div style={{display:'flex', padding:'0 20px', gap:'12px', marginBottom:'32px'}}>
           <div style={{flex:1, background:'var(--bg-secondary)', padding:'16px', borderRadius:'16px', textAlign:'center'}}>
              <h3 style={{fontSize:'1.6rem', fontWeight:'800', marginBottom:'4px'}}>{bookings.length}</h3>
              <p style={{fontSize:'0.8rem', color:'var(--text-secondary)', fontWeight:'600'}}>Bookings</p>
           </div>
           <div style={{flex:1, background:'var(--bg-secondary)', padding:'16px', borderRadius:'16px', textAlign:'center'}}>
              <h3 style={{fontSize:'1.6rem', fontWeight:'800', marginBottom:'4px'}}>{favs.size}</h3>
              <p style={{fontSize:'0.8rem', color:'var(--text-secondary)', fontWeight:'600'}}>Saved</p>
           </div>
        </div>

        <div className="settings-section">
          <h3 style={{fontSize:'1.1rem', fontWeight:'700', marginBottom:'16px'}}>Preferences</h3>
          
          <div onClick={() => { setPushEnabled(!pushEnabled); showToast(pushEnabled ? 'Push notifications disabled' : 'Push notifications enabled!', 'info'); }} style={{display:'flex', justifyContent:'space-between', padding:'16px 0', borderBottom:'1px solid var(--border-light)', cursor:'pointer'}}>
            <span style={{fontWeight:'500'}}>Push Notifications</span>
            <div style={{width:'44px', height:'24px', background: pushEnabled ? 'var(--brand-success)' : 'var(--bg-secondary)', borderRadius:'12px', position:'relative', transition:'0.2s'}}>
               <div style={{width:'20px', height:'20px', background:'#fff', borderRadius:'50%', position:'absolute', top:'2px', right: pushEnabled ? '2px' : 'calc(100% - 22px)', transition:'0.2s', boxShadow:'0 1px 3px rgba(0,0,0,0.1)'}}></div>
            </div>
          </div>
          
          <div onClick={()=>showToast('Payment Integrations would open here!', 'info')} style={{display:'flex', justifyContent:'space-between', padding:'16px 0', borderBottom:'1px solid var(--border-light)', cursor:'pointer'}}>
            <span style={{fontWeight:'500'}}>Payment Methods</span>
            <span style={{color:'var(--brand-accent)', fontWeight:'600'}}>Add +</span>
          </div>
          
          <div onClick={()=>setProfileOpen(true)} style={{display:'flex', justifyContent:'space-between', padding:'16px 0', borderBottom:'1px solid var(--border-light)', cursor:'pointer'}}>
            <span style={{fontWeight:'500'}}>Dietary Restrictions</span>
            <span style={{color:'var(--text-tertiary)', fontSize:'0.9rem'}}>{user.dietaryrestrictions ? 'Configured' : 'None setup'}</span>
          </div>
          
          <div onClick={()=>showToast('Help Center would open here!', 'info')} style={{display:'flex', justifyContent:'space-between', padding:'16px 0', borderBottom:'1px solid var(--border-light)', marginBottom:'32px', cursor:'pointer'}}>
            <span style={{fontWeight:'500'}}>Help & Support</span>
          </div>
          
          <button style={{width:'100%', padding:'16px', background:'var(--bg-secondary)', borderRadius:'var(--radius-md)', fontWeight:'600', color:'var(--brand-danger)'}} onClick={onLogout}>Sign Out</button>
        </div>
      </div>
      <Nav />
      {modalOpen && <BookingSheet r={sel} data={bData} setData={setBData} onConfirm={confirmBooking} onClose={()=>setModalOpen(false)} loading={bookingLoading} />}
      
      {profileOpen && (
        <div className="modal-overlay" onClick={()=>setProfileOpen(false)}>
          <div className="modal-sheet slide-up" onClick={e=>e.stopPropagation()}>
            <div className="modal-sheet-handle" />
            <div className="modal-header"><h2 className="modal-title">Edit Profile</h2><button className="modal-close-btn" onClick={()=>setProfileOpen(false)}><IconX size={18} /></button></div>
            <div className="form-group"><label className="form-label">Full Name</label><input className="form-input" value={pData.name} onChange={e=>setPData({...pData,name:e.target.value})} /></div>
            <div className="form-group"><label className="form-label">Phone Number</label><input type="tel" className="form-input" placeholder="(555) 123-4567" value={pData.phone} onChange={e=>setPData({...pData,phone:e.target.value})} /></div>
            <div className="form-group"><label className="form-label">Dietary Restrictions</label><textarea className="form-input" rows="2" placeholder="e.g. Vegetarian, Peanut Allergy" value={pData.dietaryRestrictions} onChange={e=>setPData({...pData,dietaryRestrictions:e.target.value})} /></div>
            <button className="btn-primary mt-4" onClick={saveProfile}>Save Changes</button>
          </div>
        </div>
      )}
    </div>
  );
}
