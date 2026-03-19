import { useState, useEffect, useRef } from 'react';
import './App.css';

const API = (import.meta.env.VITE_API_URL || 'http://localhost:3000') + '/api';
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

// --- ICONS (Same Clean SVGs) ---
const Icon = ({ d, size=24, color="currentColor", ...p }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>{d}</svg>;
const IconHome = (p) => <Icon {...p} d={<><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></>} />;
const IconSearch = (p) => <Icon {...p} d={<><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></>} />;
const IconCalendar = (p) => <Icon {...p} d={<><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></>} />;
const IconUser = (p) => <Icon {...p} d={<><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></>} />;
const IconHeart = ({filled,...p}) => filled ? <svg width={p.size||24} height={p.size||24} viewBox="0 0 24 24" fill="#EF4444" stroke="#EF4444" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg> : <Icon {...p} d={<path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/>} />;
const IconStar = (p) => <svg width={p.size||14} height={p.size||14} viewBox="0 0 24 24" fill="#F59E0B" stroke="#F59E0B" strokeWidth="1"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>;
const IconArrowLeft = (p) => <Icon {...p} d={<><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></>} />;
const IconMapPin = (p) => <Icon {...p} d={<><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></>} />;
const IconClock = (p) => <Icon {...p} d={<><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></>} />;
const IconUsers = (p) => <Icon {...p} d={<><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></>} />;
const IconCheck = (p) => <Icon {...p} d={<><polyline points="20 6 9 17 4 12"/></>} />;
const IconX = (p) => <Icon {...p} d={<><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></>} />;
const IconStore = (p) => <Icon {...p} d={<><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v16"/></>} />;

export default function App() {
  const [user, setUser] = useState(null); // null = not logged in

  if (!user) {
    return <AuthView onLogin={setUser} />;
  }

  if (user.role === 'RESTAURANT') {
    return <OwnerApp user={user} onLogout={()=>setUser(null)} />;
  }

  return <CustomerApp user={user} onLogout={()=>setUser(null)} />;
}

// ==========================================
// AUTHENTICATION VIEW
// ==========================================
function AuthView({ onLogin }) {
  const [isLogin, setIsLogin] = useState(true);
  const [role, setRole] = useState('CUSTOMER');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const googleBtnRef = useRef(null);

  // Initialize Google Sign-In
  useEffect(() => {
    if (GOOGLE_CLIENT_ID && window.google) {
      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: handleGoogleLogin,
      });
      if (googleBtnRef.current) {
        window.google.accounts.id.renderButton(googleBtnRef.current, {
          theme: 'outline', size: 'large', width: '100%', text: 'continue_with',
        });
      }
    }
  }, [isLogin]);

  const handleGoogleLogin = async (response) => {
    try {
      const res = await fetch(API + '/auth/google', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credential: response.credential })
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      onLogin(json.user);
    } catch (err) {
      setError(err.message);
    }
  };

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    const endpoint = isLogin ? '/auth/login' : '/auth/register';
    const body = isLogin ? { email, password } : { name, email, password, role };
    
    try {
      const res = await fetch(API + endpoint, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      onLogin(json.user);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="app-container fade-in" style={{padding: '40px 20px', justifyContent:'center'}}>
      <h1 className="home-title" style={{textAlign:'center', marginBottom:'8px'}}>{isLogin ? 'Welcome Back' : 'Create Account'}</h1>
      <p style={{textAlign:'center', color:'var(--text-secondary)', marginBottom:'32px'}}>Sign in to DineDesk to continue.</p>
      
      {!isLogin && (
        <div style={{display:'flex', gap:'12px', marginBottom:'24px'}}>
          <button className="btn-secondary" style={{flex:1, background: role==='CUSTOMER'?'var(--brand-primary)':'var(--bg-secondary)', color: role==='CUSTOMER'?'#fff':'#000', padding:'12px', borderRadius:'12px', fontWeight:'700'}} onClick={()=>setRole('CUSTOMER')}>Diner</button>
          <button className="btn-secondary" style={{flex:1, background: role==='RESTAURANT'?'var(--brand-primary)':'var(--bg-secondary)', color: role==='RESTAURANT'?'#fff':'#000', padding:'12px', borderRadius:'12px', fontWeight:'700'}} onClick={()=>setRole('RESTAURANT')}>Restaurant</button>
        </div>
      )}

      {error && <div style={{background:'#FEE2E2', color:'#EF4444', padding:'12px', borderRadius:'8px', marginBottom:'20px', fontSize:'0.9rem', fontWeight:'600'}}>{error}</div>}

      <form onSubmit={submit}>
        {!isLogin && <div className="form-group"><label className="form-label">Full Name / Business Name</label><input required className="form-input" value={name} onChange={e=>setName(e.target.value)} /></div>}
        <div className="form-group"><label className="form-label">Email Address</label><input required type="email" className="form-input" value={email} onChange={e=>setEmail(e.target.value)} /></div>
        <div className="form-group"><label className="form-label">Password</label><input required type="password" className="form-input" value={password} onChange={e=>setPassword(e.target.value)} /></div>
        <button className="btn-primary" type="submit" style={{marginTop:'24px'}}>{isLogin ? 'Sign In' : 'Sign Up'}</button>
      </form>

      {/* Google Sign-In */}
      <div style={{display:'flex', alignItems:'center', gap:'12px', margin:'24px 0'}}>
        <div style={{flex:1, height:'1px', background:'var(--border-light)'}} />
        <span style={{fontSize:'0.8rem', color:'var(--text-tertiary)', fontWeight:'600'}}>OR</span>
        <div style={{flex:1, height:'1px', background:'var(--border-light)'}} />
      </div>
      {GOOGLE_CLIENT_ID ? (
        <div ref={googleBtnRef} style={{display:'flex', justifyContent:'center'}} />
      ) : (
        <button className="btn-secondary" style={{width:'100%', display:'flex', alignItems:'center', justifyContent:'center', gap:'10px', padding:'14px', borderRadius:'12px', fontWeight:'600'}} onClick={()=>alert('Google Login is currently disabled. To enable it, the administrator must generate an OAuth Client ID from Google Cloud Console and save it to the environment variables!')}>
          <svg width="18" height="18" viewBox="0 0 48 48"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/><path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/></svg>
          Continue with Google
        </button>
      )}
      
      <p style={{textAlign:'center', marginTop:'32px', color:'var(--text-secondary)', fontSize:'0.9rem'}}>
        {isLogin ? "Don't have an account? " : "Already have an account? "}
        <span style={{color:'var(--brand-accent)', fontWeight:'700', cursor:'pointer'}} onClick={()=>{setIsLogin(!isLogin); setError('');}}>
          {isLogin ? "Sign Up" : "Sign In"}
        </span>
      </p>

      {/* Helper quick logins for testing */}
      <div style={{marginTop:'40px', padding:'20px', border:'1px dashed var(--border-dark)', borderRadius:'12px'}}>
        <p style={{fontSize:'0.75rem', fontWeight:'700', color:'var(--text-tertiary)', textTransform:'uppercase', marginBottom:'12px'}}>Developer Quick Logins</p>
        <button className="btn-secondary" style={{width:'100%', marginBottom:'8px'}} onClick={()=>{setEmail('alice@test.com'); setPassword('password123'); setIsLogin(true);}}>Login as Customer (Alice)</button>
        <button className="btn-secondary" style={{width:'100%'}} onClick={()=>{setEmail('tanaka@sakura.com'); setPassword('password123'); setIsLogin(true);}}>Login as Owner (Chef Tanaka)</button>
      </div>
    </div>
  );
}

// ==========================================
// RESTAURANT OWNER DASHBOARD
// ==========================================
function OwnerApp({ user, onLogout }) {
  const [view, setView] = useState('bookings');
  const [venues, setVenues] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [addOpen, setAddOpen] = useState(false);
  const [newV, setNewV] = useState({ name:'', cuisine:'American', priceRange:'$$', image:'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4', distance:'1.0 mi', about:'' });

  const fetchVenuesAndBookings = async () => {
    try {
      const vRes = await fetch(`${API}/restaurants/owner/${user.id}`);
      const vData = await vRes.json();
      setVenues(vData);

      if (vData.length > 0) {
        // Just fetch bookings for their first venue for simplicity
        const bRes = await fetch(`${API}/bookings/restaurant/${vData[0].id}`);
        setBookings(await bRes.json());
      }
    } catch(err){}
  };

  useEffect(() => { fetchVenuesAndBookings(); }, [user.id]);

  const updateStatus = async (id, status) => {
    await fetch(`${API}/bookings/${id}/status`, { method: 'PATCH', headers:{'Content-Type':'application/json'}, body: JSON.stringify({status}) });
    setBookings(p => p.map(b => b.id === id ? { ...b, status } : b));
  };

  const submitVenue = async () => {
    if (!newV.name) return;
    await fetch(`${API}/restaurants`, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({...newV, ownerId: user.id, tags:['New']}) });
    setAddOpen(false);
    fetchVenuesAndBookings();
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
             {venues.length === 0 ? (
               <div style={{textAlign:'center', marginTop:'40px', color:'var(--text-tertiary)'}}>You must add a venue first to receive bookings.</div>
             ) : bookings.length === 0 ? (
               <div style={{textAlign:'center', marginTop:'40px', color:'var(--text-tertiary)'}}>No reservations in the queue yet.</div>
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
             <p style={{fontSize:'0.9rem', color:'var(--text-secondary)', marginBottom:'20px'}}>These are the restaurants you currently operate on the platform.</p>
             {venues.map(v => (
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

// ==========================================
// CUSTOMER APP (Current App UI but using user DB)
// ==========================================
function CustomerApp({ user, onLogout }) {
  const [view, setView] = useState('home');
  const [rests, setRests] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [favs, setFavs] = useState(new Set());
  const [sel, setSel] = useState(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [cat, setCat] = useState('All');
  const [bData, setBData] = useState({ date:'2024-11-01', time:'19:00', guests:'2' });
  const [modBooking, setModBooking] = useState(null);

  useEffect(() => {
    fetch(`${API}/restaurants`).then(r=>r.json()).then(setRests);
    fetchBookings();
  }, [user.id]);

  const fetchBookings = async () => {
    const res = await fetch(`${API}/bookings/user/${user.id}`);
    setBookings(await res.json());
  };

  const toggleFav = (e, id) => { e.stopPropagation(); setFavs(p => { const n=new Set(p); n.has(id)?n.delete(id):n.add(id); return n; }); };
  const openDetail = r => { setSel(r); setDetailOpen(true); };
  const openBooking = () => { setModBooking(null); setModalOpen(true); };

  const confirmBooking = async () => {
    if (modBooking) {
      // Modify existing
      await fetch(`${API}/bookings/${modBooking.id}`, { method:'PUT', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ date:bData.date, time:bData.time, guests:parseInt(bData.guests), status: 'Pending' }) });
    } else {
      // Create new
      await fetch(`${API}/bookings`, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ restaurantId:sel.id, userId:user.id, date:bData.date, time:bData.time, guests:parseInt(bData.guests) }) });
    }
    fetchBookings();
    setModalOpen(false); setDetailOpen(false); setModBooking(null); setView('success');
  };

  const cancelBooking = async (id) => {
    if(confirm('Cancel this reservation?')) {
      await fetch(`${API}/bookings/${id}/status`, { method:'PATCH', headers:{'Content-Type':'application/json'}, body: JSON.stringify({status:'Cancelled'}) });
      fetchBookings();
    }
  };

  const openModify = (b) => {
    setSel({ id: b.restaurantId, name: b.restaurantName });
    setModBooking(b);
    setBData({ date: b.date, time: b.time, guests: String(b.guests) });
    setModalOpen(false); // Force re-render just in case
    setTimeout(() => setModalOpen(true), 10);
  };

  const filtered = rests.filter(r => {
    const ms = (r.name||'').toLowerCase().includes(search.toLowerCase()) || (r.cuisine||'').toLowerCase().includes(search.toLowerCase());
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
    <div className="app-container fade-in">
      <div className="scroll-view">
        <div className="home-header">
          <div><div className="home-greeting">Welcome back, {user.name}</div><h1 className="home-title">Find a Table</h1></div>
          <button className="header-icon-btn"><IconUser size={20} /></button>
        </div>
        <div className="categories-container">{CATS.map(c=><button key={c} className={`category-pill ${cat===c?'active':''}`} onClick={()=>setCat(c)}>{c}</button>)}</div>
        <div className="feed-list">
          {filtered.map(r=>(
            <div className="rest-card" key={r.id} onClick={()=>openDetail(r)}>
              <div className="rest-card-image-wrap">
                 <img src={r.image} alt={r.name} className="rest-card-image" loading="lazy" />
                 <button className="fav-btn" onClick={(e)=>toggleFav(e, r.id)}><IconHeart filled={favs.has(r.id)} size={18} /></button>
              </div>
              <div className="rest-card-info">
                 <div className="rest-card-title-row"><h3 className="rest-card-title">{r.name}</h3><div className="rest-card-rating"><IconStar size={14} /> {r.rating}</div></div>
                 <div className="rest-card-meta">{r.cuisine} · {r.priceRange} · {r.distance}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <Nav />
      {detailOpen && sel && <Detail r={sel} onBack={()=>setDetailOpen(false)} onBook={openBooking} fav={favs.has(sel.id)} onFav={(e)=>toggleFav(e, sel.id)} />}
      {modalOpen && <BookingSheet r={sel} data={bData} setData={setBData} onConfirm={confirmBooking} onClose={()=>setModalOpen(false)} />}
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
      {modalOpen && <BookingSheet r={sel} data={bData} setData={setBData} onConfirm={confirmBooking} onClose={()=>setModalOpen(false)} />}
    </div>
  );

  // Bookings
  if (view==='bookings') return (
    <div className="app-container fade-in">
      <div className="scroll-view">
        <div className="bookings-header"><h1 className="bookings-title">My Reservations</h1></div>
        <div className="tabs"><button className="tab active">Upcoming</button><button className="tab">Past</button></div>
        <div>
          {bookings.length===0 ? (
            <div style={{textAlign:'center', padding:'60px 20px', color:'var(--text-tertiary)'}}>
              <IconCalendar size={48} color="var(--border-dark)" style={{marginBottom:'16px'}} />
              <h3>No upcoming reservations</h3><p style={{marginTop:'8px', fontSize:'0.9rem'}}>Book a table to see it here.</p>
            </div>
          ) : bookings.map(b=>(
            <div className="booking-card slide-up" key={b.id}>
              <div className="booking-status">{b.status}</div>
              <h3 className="booking-rest-name">{b.restaurantName}</h3>
              <div className="booking-details-grid">
                <div className="booking-detail-item"><IconCalendar size={16} /> {b.date}</div>
                <div className="booking-detail-item"><IconClock size={16} /> {b.time}</div>
                <div className="booking-detail-item"><IconUsers size={16} /> {b.guests} Geusts</div>
                <div className="booking-detail-item"><IconMapPin size={16} /> {b.distance}</div>
              </div>
              <div className="booking-actions">
                <button className="btn-secondary" style={{color:'var(--brand-danger)'}} onClick={()=>cancelBooking(b.id)}>Cancel</button>
                <button className="btn-secondary" onClick={()=>openModify(b)}>Modify</button>
              </div>
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
           <div className="profile-info"><h2>{user.name}</h2><p>{user.email}</p></div>
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
          <div style={{display:'flex', justifyContent:'space-between', padding:'16px 0', borderBottom:'1px solid var(--border-light)'}}>
            <span style={{fontWeight:'500'}}>Push Notifications</span>
            <div style={{width:'44px', height:'24px', background:'var(--brand-success)', borderRadius:'12px', position:'relative'}}><div style={{width:'20px', height:'20px', background:'#fff', borderRadius:'50%', position:'absolute', top:'2px', right:'2px'}}></div></div>
          </div>
          <div style={{display:'flex', justifyContent:'space-between', padding:'16px 0', borderBottom:'1px solid var(--border-light)'}}>
            <span style={{fontWeight:'500'}}>Payment Methods</span>
            <span style={{color:'var(--text-tertiary)'}}>Add +</span>
          </div>
          <div style={{display:'flex', justifyContent:'space-between', padding:'16px 0', borderBottom:'1px solid var(--border-light)'}}>
            <span style={{fontWeight:'500'}}>Dietary Restrictions</span>
          </div>
          <div style={{display:'flex', justifyContent:'space-between', padding:'16px 0', borderBottom:'1px solid var(--border-light)', marginBottom:'32px'}}>
            <span style={{fontWeight:'500'}}>Help & Support</span>
          </div>
          <button style={{width:'100%', padding:'16px', background:'var(--bg-secondary)', borderRadius:'var(--radius-md)', fontWeight:'600', color:'var(--brand-danger)'}} onClick={onLogout}>Sign Out</button>
        </div>
      </div>
      <Nav />
      {modalOpen && <BookingSheet r={sel} data={bData} setData={setBData} onConfirm={confirmBooking} onClose={()=>setModalOpen(false)} />}
    </div>
  );
}

// Subcomponents (Detail / BookingModal)
function Detail({ r, onBack, onBook, fav, onFav }) {
  return (
    <div className="detail-view slide-up">
      <div className="detail-nav"><button className="detail-back-btn" onClick={onBack}><IconArrowLeft size={20} /></button><button className="detail-fav-btn" onClick={onFav}><IconHeart filled={fav} size={20} /></button></div>
      <div className="scroll-view" style={{paddingBottom:0}}>
        <div className="detail-hero"><img src={r.image} alt={r.name} /></div>
        <div className="detail-content">
          <h1 className="detail-title">{r.name}</h1>
          <div className="detail-meta-row"><span className="detail-meta-item"><IconStar size={16} color="#F59E0B" /> <span style={{fontWeight:'700', color:'var(--text-primary)'}}>{r.rating}</span> ({r.reviews})</span><span className="detail-meta-item">·</span><span className="detail-meta-item">{r.cuisine}</span><span className="detail-meta-item">·</span><span className="detail-meta-item">{r.priceRange}</span></div>
          <div className="detail-section"><h3 className="detail-section-title">About</h3><p className="detail-about">{r.about}</p></div>
          <div className="detail-section" style={{marginBottom:'0'}}>
             <h3 className="detail-section-title">Location & Hours</h3>
             <div style={{display:'flex', gap:'12px', marginBottom:'16px', alignItems:'center'}}><div style={{width:'40px',height:'40px',background:'var(--bg-secondary)',borderRadius:'var(--radius-pill)',display:'flex',alignItems:'center',justifyContent:'center',color:'var(--text-secondary)'}}><IconMapPin size={20} /></div><div><div style={{fontWeight:'600', fontSize:'0.95rem'}}>123 Culinary Ave</div><div style={{fontSize:'0.85rem', color:'var(--text-secondary)'}}>{r.distance} away</div></div></div>
             <div style={{display:'flex', gap:'12px', alignItems:'center'}}><div style={{width:'40px',height:'40px',background:'var(--bg-secondary)',borderRadius:'var(--radius-pill)',display:'flex',alignItems:'center',justifyContent:'center',color:'var(--text-secondary)'}}><IconClock size={20} /></div><div><div style={{fontWeight:'600', fontSize:'0.95rem'}}>Open Today</div><div style={{fontSize:'0.85rem', color:'var(--text-secondary)'}}>5:00 PM - 11:00 PM</div></div></div>
          </div>
        </div>
      </div>
      <div className="bottom-action-bar"><button className="btn-primary" onClick={onBook}>Choose Date & Time</button></div>
    </div>
  );
}

function BookingSheet({ r, data, setData, onConfirm, onClose }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-sheet slide-up" onClick={e=>e.stopPropagation()}>
        <div className="modal-sheet-handle" />
        <div className="modal-header"><h2 className="modal-title">Table for {data.guests}</h2><button className="modal-close-btn" onClick={onClose}><IconX size={18} /></button></div>
        <div className="form-row">
          <div className="form-group"><label className="form-label">Date</label><input type="date" className="form-input" value={data.date} onChange={e=>setData({...data,date:e.target.value})} /></div>
          <div className="form-group"><label className="form-label">Time</label>
            <select className="form-select" value={data.time} onChange={e=>setData({...data,time:e.target.value})}>
              {['17:00','17:30','18:00','18:30','19:00','19:30','20:00','20:30','21:00'].map(t=><option key={t} value={t}>{parseInt(t)>12?(parseInt(t)-12)+':'+t.split(':')[1]+' PM':t+' AM'}</option>)}
            </select>
          </div>
        </div>
        <div className="form-group"><label className="form-label">Party Size</label>
          <select className="form-select" value={data.guests} onChange={e=>setData({...data,guests:e.target.value})}>
             {[1,2,3,4,5,6,7,8,9,10].map(n=><option key={n} value={n}>{n} {n===1?'Person':'People'}</option>)}
          </select>
        </div>
        <button className="btn-primary mt-4" onClick={onConfirm}>Confirm Reservation</button>
      </div>
    </div>
  );
}
