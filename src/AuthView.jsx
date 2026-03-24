import { useState, useEffect, useRef } from 'react';
import * as api from './api';

const GoogleIcon = () => (
  <svg width="20" height="20" viewBox="0 0 48 48">
    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
  </svg>
);

export default function AuthView({ onLogin, showToast }) {
  const [isLogin, setIsLogin] = useState(true);
  const [role, setRole] = useState('CUSTOMER');
  const [contact, setContact] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const googleBtnRef = useRef(null);

  // OTP Verification State
  const [step, setStep] = useState('form'); // 'form' | 'otp'
  const [otpCode, setOtpCode] = useState(['', '', '', '', '', '']);
  const [serverOtp, setServerOtp] = useState('');
  const otpRefs = [useRef(), useRef(), useRef(), useRef(), useRef(), useRef()];

  // Initialize Google Sign-In
  useEffect(() => {
    if (api.GOOGLE_CLIENT_ID && window.google) {
      window.google.accounts.id.initialize({
        client_id: api.GOOGLE_CLIENT_ID,
        callback: handleGoogleLogin,
      });
      if (googleBtnRef.current) {
        window.google.accounts.id.renderButton(googleBtnRef.current, {
          theme: window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'filled_black' : 'outline', 
          size: 'large', 
          width: '100%', 
          text: 'continue_with',
        });
      }
    }
  }, [isLogin, step]);

  const handleGoogleLogin = async (response) => {
    try {
      setLoading(true);
      const json = await api.googleLogin(response.credential);
      localStorage.setItem('dinedesk_token', json.token);
      showToast('Logged in successfully', 'success');
      onLogin(json.user);
    } catch (err) {
      showToast(err.message === 'Failed to fetch' ? 'Network Error' : err.message, 'error');
    } finally { setLoading(false); }
  };

  const handleOtpChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otpCode];
    newOtp[index] = value.slice(-1);
    setOtpCode(newOtp);
    if (value && index < 5) otpRefs[index + 1].current?.focus();
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otpCode[index] && index > 0) {
      otpRefs[index - 1].current?.focus();
    }
  };

  const sendVerificationCode = async () => {
    const newErrors = {};
    const isEmail = contact.includes('@') && contact.includes('.');
    const isPhone = /^\+?[\d\s\-]{7,15}$/.test(contact);
    if (!isEmail && !isPhone) newErrors.contact = true;
    if (!password.trim() || password.length < 6) newErrors.password = true;
    if (name.trim().length < 2) newErrors.name = true;

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      if (newErrors.name) return showToast('Please enter your full name.', 'error');
      if (newErrors.contact) return showToast('Please enter a valid email or mobile number.', 'error');
      if (newErrors.password) return showToast('Password must be at least 6 characters.', 'error');
      return;
    }

    setErrors({});
    setLoading(true);
    try {
      const res = await api.sendOtp(contact);
      setServerOtp(res.otp);
      setStep('otp');
      showToast('Verification code sent!', 'success');
      setTimeout(() => otpRefs[0].current?.focus(), 300);
    } catch (err) {
      showToast(err.message === 'Failed to fetch' ? 'Network Error' : err.message, 'error');
    } finally { setLoading(false); }
  };

  const verifyAndRegister = async () => {
    const code = otpCode.join('');
    if (code.length < 6) return showToast('Please enter the complete 6-digit code.', 'error');

    setLoading(true);
    try {
      await api.verifyOtp(contact, code);
      const json = await api.register(name, contact, password, role);
      localStorage.setItem('dinedesk_token', json.token);
      showToast('Account created successfully!', 'success');
      onLogin(json.user);
    } catch (err) {
      showToast(err.message === 'Failed to fetch' ? 'Network Error' : err.message, 'error');
    } finally { setLoading(false); }
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!isLogin) return sendVerificationCode();

    const newErrors = {};
    const isEmail = contact.includes('@') && contact.includes('.');
    const isPhone = /^\+?[\d\s\-]{7,15}$/.test(contact);
    if (!isEmail && !isPhone) newErrors.contact = true;
    if (!password.trim()) newErrors.password = true;

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      if (newErrors.contact) return showToast('Please enter a valid email or mobile number.', 'error');
      if (newErrors.password) return showToast('Please enter your password.', 'error');
      return;
    }

    setErrors({});
    setLoading(true);
    try {
      const json = await api.login(contact, password);
      localStorage.setItem('dinedesk_token', json.token);
      showToast('Welcome!', 'success');
      onLogin(json.user);
    } catch (err) {
      showToast(err.message === 'Failed to fetch' ? 'Network Error' : err.message, 'error');
    } finally { setLoading(false); }
  };

  const errorBorder = { borderColor: 'var(--brand-danger)', boxShadow: '0 0 0 2px rgba(239,68,68,0.2)' };

  // OTP Verification Screen
  if (step === 'otp') {
    return (
      <div className="app-container fade-in" style={{padding: '40px 24px', justifyContent:'center', alignItems:'center'}}>
        {loading && <div className="spinner" style={{position:'absolute', top:20, right:20, margin:0, width:24, height:24}} />}
        
        <div style={{width:64, height:64, borderRadius:'50%', background:'var(--bg-secondary)', display:'flex', alignItems:'center', justifyContent:'center', marginBottom:24}}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--brand-accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>
          </svg>
        </div>
        
        <h1 className="home-title" style={{textAlign:'center', marginBottom:8, fontSize:'1.5rem'}}>Verify Account</h1>
        <p style={{textAlign:'center', color:'var(--text-secondary)', marginBottom:16, lineHeight:1.5, fontSize:'0.9rem'}}>
          Enter the 6-digit code for<br/><strong style={{color:'var(--text-primary)'}}>{contact}</strong>
        </p>

        {serverOtp && (
          <div style={{
            background:'var(--bg-secondary)', border:'2px dashed var(--brand-accent)',
            borderRadius:12, padding:'14px 20px', marginBottom:24, textAlign:'center'
          }}>
            <p style={{fontSize:'0.72rem', color:'var(--text-secondary)', marginBottom:6, fontWeight:700, textTransform:'uppercase', letterSpacing:'1px'}}>Your Verification Code</p>
            <p style={{fontSize:'2rem', fontWeight:800, letterSpacing:'10px', color:'var(--brand-accent)'}}>{serverOtp}</p>
            <button
              style={{fontSize:'0.8rem', color:'var(--brand-accent)', fontWeight:700, marginTop:6, background:'none', border:'none', cursor:'pointer'}}
              onClick={() => {
                setOtpCode(serverOtp.split(''));
                setTimeout(() => otpRefs[5].current?.focus(), 50);
              }}
            >Tap to Auto-fill ↗</button>
          </div>
        )}

        <div style={{display:'flex', gap:10, marginBottom:32, justifyContent:'center'}}>
          {otpCode.map((digit, i) => (
            <input
              key={i}
              ref={otpRefs[i]}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={e => handleOtpChange(i, e.target.value)}
              onKeyDown={e => handleOtpKeyDown(i, e)}
              style={{
                width:48, height:56, textAlign:'center', fontSize:'1.4rem', fontWeight:700,
                borderRadius:12, border: `2px solid ${digit ? 'var(--brand-accent)' : 'var(--border-light)'}`,
                background:'var(--bg-secondary)', color:'var(--text-primary)', outline:'none',
                transition:'border-color 0.2s',
              }}
            />
          ))}
        </div>

        <button className="btn-primary" onClick={verifyAndRegister} disabled={loading} style={{marginBottom:16}}>
          {loading ? 'Verifying...' : 'Verify & Create Account'}
        </button>

        <p style={{textAlign:'center', color:'var(--text-tertiary)', fontSize:'0.85rem', marginTop:16}}>
          Didn't receive the code?{' '}
          <span style={{color:'var(--brand-accent)', fontWeight:700, cursor:'pointer'}} onClick={() => { setOtpCode(['','','','','','']); sendVerificationCode(); }}>
            Resend
          </span>
        </p>

        <p style={{textAlign:'center', color:'var(--text-tertiary)', fontSize:'0.85rem', marginTop:8}}>
          <span style={{cursor:'pointer', textDecoration:'underline'}} onClick={() => { setStep('form'); setOtpCode(['','','','','','']); }}>
            ← Back to Sign Up
          </span>
        </p>
      </div>
    );
  }

  // Main Auth Form
  return (
    <div className="app-container fade-in" style={{padding: '40px 24px', justifyContent:'center'}}>
      {loading && <div className="spinner" style={{position:'absolute', top:20, right:20, margin:0, width:24, height:24}} />}
      <h1 className="home-title" style={{textAlign:'center', marginBottom:'8px'}}>{isLogin ? 'Welcome Back' : 'Create Account'}</h1>
      <p style={{textAlign:'center', color:'var(--text-secondary)', marginBottom:'32px'}}>{isLogin ? 'Sign in to DineDesk to continue.' : 'Join DineDesk to get started.'}</p>
      
      {!isLogin && (
        <div style={{display:'flex', gap:'12px', marginBottom:'24px'}}>
          <button type="button" className="btn-secondary" style={{flex:1, background: role==='CUSTOMER'?'var(--brand-primary)':'var(--bg-secondary)', color: role==='CUSTOMER'?'var(--bg-primary)':'var(--text-primary)', padding:'12px', borderRadius:'12px', fontWeight:'700', border: role==='CUSTOMER'?'none':'1px solid var(--border-light)'}} onClick={()=>setRole('CUSTOMER')}>Diner</button>
          <button type="button" className="btn-secondary" style={{flex:1, background: role==='RESTAURANT'?'var(--brand-primary)':'var(--bg-secondary)', color: role==='RESTAURANT'?'var(--bg-primary)':'var(--text-primary)', padding:'12px', borderRadius:'12px', fontWeight:'700', border: role==='RESTAURANT'?'none':'1px solid var(--border-light)'}} onClick={()=>setRole('RESTAURANT')}>Restaurant</button>
        </div>
      )}

      <form onSubmit={submit} noValidate>
        {!isLogin && <div className="form-group"><label className="form-label">Full Name / Business Name</label><input className="form-input" style={errors.name ? errorBorder : {}} placeholder="Enter your name" value={name} onChange={e=>{setName(e.target.value); setErrors(p=>({...p, name:false}));}} /></div>}
        <div className="form-group"><label className="form-label">Email or Mobile Number</label><input type="text" className="form-input" style={errors.contact ? errorBorder : {}} placeholder={isLogin ? 'Enter email or phone' : 'you@example.com or +123456789'} value={contact} onChange={e=>{setContact(e.target.value); setErrors(p=>({...p, contact:false}));}} /></div>
        <div className="form-group"><label className="form-label">Password</label><input type="password" className="form-input" style={errors.password ? errorBorder : {}} placeholder={isLogin ? 'Enter your password' : 'Min. 6 characters'} value={password} onChange={e=>{setPassword(e.target.value); setErrors(p=>({...p, password:false}));}} /></div>
        <button className="btn-primary" type="submit" disabled={loading} style={{marginTop:'24px'}}>{loading ? 'Connecting...' : (isLogin ? 'Sign In' : 'Continue')}</button>
      </form>

      {/* Divider */}
      <div style={{display:'flex', alignItems:'center', gap:'12px', margin:'24px 0'}}>
        <div style={{flex:1, height:'1px', background:'var(--border-light)'}} />
        <span style={{fontSize:'0.8rem', color:'var(--text-tertiary)', fontWeight:'600'}}>OR</span>
        <div style={{flex:1, height:'1px', background:'var(--border-light)'}} />
      </div>

      {/* Restyled Google Sign-In */}
      {api.GOOGLE_CLIENT_ID && window.google ? (
        <div ref={googleBtnRef} style={{display:'flex', justifyContent:'center'}} />
      ) : (
        <button
          type="button"
          onClick={() => {
            if (api.GOOGLE_CLIENT_ID && window.google) {
              window.google.accounts.id.prompt();
            } else {
              showToast('Google Sign-In is not configured.', 'error');
            }
          }}
          style={{
            width:'100%', display:'flex', alignItems:'center', justifyContent:'center', gap:'12px',
            padding:'14px 20px', borderRadius:'12px', fontWeight:'600', fontSize:'0.95rem',
            background:'var(--bg-secondary)', color:'var(--text-primary)',
            border:'1px solid var(--border-light)', cursor:'pointer',
            transition:'all 0.2s ease',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = 'var(--border-light)'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'var(--bg-secondary)'; }}
        >
          <GoogleIcon />
          Continue with Google
        </button>
      )}
      
      <p style={{textAlign:'center', marginTop:'32px', color:'var(--text-secondary)', fontSize:'0.9rem'}}>
        {isLogin ? "Don't have an account? " : "Already have an account? "}
        <span style={{color:'var(--brand-accent)', fontWeight:'700', cursor:'pointer'}} onClick={()=>{setIsLogin(!isLogin); setErrors({}); setStep('form');}}>
          {isLogin ? "Sign Up" : "Sign In"}
        </span>
      </p>
    </div>
  );
}
