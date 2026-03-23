import { useState, useEffect, useRef } from 'react';
import { IconX, IconCheck } from './Icons';
import * as api from './api';

export default function AuthView({ onLogin, showToast }) {
  const [isLogin, setIsLogin] = useState(true);
  const [role, setRole] = useState('CUSTOMER');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const googleBtnRef = useRef(null);

  // Initialize Google Sign-In
  useEffect(() => {
    if (api.GOOGLE_CLIENT_ID && window.google) {
      window.google.accounts.id.initialize({
        client_id: api.GOOGLE_CLIENT_ID,
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
      setLoading(true);
      const json = await api.googleLogin(response.credential);
      localStorage.setItem('dinedesk_token', json.token);
      showToast('Logged in successfully', 'success');
      onLogin(json.user);
    } catch (err) {
      showToast(err.message === 'Failed to fetch' ? 'Network Error: Please check your connection.' : err.message, 'error');
    } finally { setLoading(false); }
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!email.includes('@') || !email.includes('.')) return showToast('Please enter a valid email address.', 'error');
    if (password.length < 6) return showToast('Password must be at least 6 characters.', 'error');
    if (!isLogin && name.trim().length < 2) return showToast('Please enter your full name.', 'error');

    setLoading(true);
    try {
      const json = isLogin
        ? await api.login(email, password)
        : await api.register(name, email, password, role);
      localStorage.setItem('dinedesk_token', json.token);
      showToast('Welcome!', 'success');
      onLogin(json.user);
    } catch (err) {
      showToast(err.message === 'Failed to fetch' ? 'Network Error: Please check your connection.' : err.message, 'error');
    } finally { setLoading(false); }
  };

  return (
    <div className="app-container fade-in" style={{padding: '40px 20px', justifyContent:'center'}}>
      {loading && <div className="spinner" style={{position:'absolute', top:20, right:20, margin:0, width:24, height:24}} />}
      <h1 className="home-title" style={{textAlign:'center', marginBottom:'8px'}}>{isLogin ? 'Welcome Back' : 'Create Account'}</h1>
      <p style={{textAlign:'center', color:'var(--text-secondary)', marginBottom:'32px'}}>Sign in to DineDesk to continue.</p>
      
      {!isLogin && (
        <div style={{display:'flex', gap:'12px', marginBottom:'24px'}}>
          <button type="button" className="btn-secondary" style={{flex:1, background: role==='CUSTOMER'?'var(--brand-primary)':'var(--bg-secondary)', color: role==='CUSTOMER'?'#fff':'#000', padding:'12px', borderRadius:'12px', fontWeight:'700'}} onClick={()=>setRole('CUSTOMER')}>Diner</button>
          <button type="button" className="btn-secondary" style={{flex:1, background: role==='RESTAURANT'?'var(--brand-primary)':'var(--bg-secondary)', color: role==='RESTAURANT'?'#fff':'#000', padding:'12px', borderRadius:'12px', fontWeight:'700'}} onClick={()=>setRole('RESTAURANT')}>Restaurant</button>
        </div>
      )}

      <form onSubmit={submit}>
        {!isLogin && <div className="form-group"><label className="form-label">Full Name / Business Name</label><input required className="form-input" value={name} onChange={e=>setName(e.target.value)} /></div>}
        <div className="form-group"><label className="form-label">Email Address</label><input required type="email" className="form-input" value={email} onChange={e=>setEmail(e.target.value)} /></div>
        <div className="form-group"><label className="form-label">Password</label><input required type="password" className="form-input" value={password} onChange={e=>setPassword(e.target.value)} /></div>
        <button className="btn-primary" type="submit" disabled={loading} style={{marginTop:'24px'}}>{loading ? 'Connecting...' : (isLogin ? 'Sign In' : 'Sign Up')}</button>
      </form>

      {/* Google Sign-In */}
      <div style={{display:'flex', alignItems:'center', gap:'12px', margin:'24px 0'}}>
        <div style={{flex:1, height:'1px', background:'var(--border-light)'}} />
        <span style={{fontSize:'0.8rem', color:'var(--text-tertiary)', fontWeight:'600'}}>OR</span>
        <div style={{flex:1, height:'1px', background:'var(--border-light)'}} />
      </div>
      {api.GOOGLE_CLIENT_ID ? (
        <div ref={googleBtnRef} style={{display:'flex', justifyContent:'center'}} />
      ) : (
        <button type="button" className="btn-secondary" style={{width:'100%', display:'flex', alignItems:'center', justifyContent:'center', gap:'10px', padding:'14px', borderRadius:'12px', fontWeight:'600'}} onClick={()=>showToast('Google API Key missing. Set VITE_GOOGLE_CLIENT_ID in Vercel.', 'error')}>
          <svg width="18" height="18" viewBox="0 0 48 48"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/><path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/></svg>
          Continue with Google
        </button>
      )}
      
      <p style={{textAlign:'center', marginTop:'32px', color:'var(--text-secondary)', fontSize:'0.9rem'}}>
        {isLogin ? "Don't have an account? " : "Already have an account? "}
        <span style={{color:'var(--brand-accent)', fontWeight:'700', cursor:'pointer'}} onClick={()=>setIsLogin(!isLogin)}>
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
