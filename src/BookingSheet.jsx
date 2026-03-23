import { IconX } from './Icons';

export default function BookingSheet({ r, data, setData, onConfirm, onClose }) {
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
        <div className="form-group"><label className="form-label">Special Requests (optional)</label>
          <textarea className="form-input" rows="2" placeholder="e.g. Window seat, birthday celebration..." value={data.notes || ''} onChange={e=>setData({...data,notes:e.target.value})} />
        </div>
        <button className="btn-primary mt-4" onClick={onConfirm}>Confirm Reservation</button>
      </div>
    </div>
  );
}
