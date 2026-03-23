import { IconArrowLeft, IconHeart, IconStar, IconMapPin, IconClock } from './Icons';

export default function Detail({ r, onBack, onBook, fav, onFav }) {
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
