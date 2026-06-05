import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const inputStyle = {
  width: '100%',
  padding: '1.4rem 1.6rem',
  background: '#fff',
  border: '2px solid rgba(0,0,0,0.1)',
  borderRadius: '0.4rem',
  color: '#111',
  fontSize: '1.4rem',
  fontWeight: 500,
  fontFamily: 'inherit',
  outline: 'none',
  transition: 'border-color 0.2s',
};

const labelStyle = { display: 'block', fontSize: '1.1rem', fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(0,0,0,0.6)', marginBottom: '0.8rem' };

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '8rem 2rem 4rem' }}>
      <div style={{
        width: '100%', maxWidth: '440px', position: 'relative', zIndex: 2,
        background: '#fff', border: '1px solid rgba(0,0,0,0.08)',
        borderRadius: '0.8rem', padding: '4.8rem',
        boxShadow: '0 12px 40px rgba(0,0,0,0.04)'
      }}>
        {/* Logo mark */}
        <div style={{ textAlign: 'center', marginBottom: '3.2rem' }}>
          <div style={{ width: '6.4rem', height: '6.4rem', background: '#111', borderRadius: '0.8rem', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '2.4rem' }}>
            <svg width="32" height="32" viewBox="0 0 42 41" fill="white"><path d="M23.898 0c1.274 0 2.45.68 3.086 1.783l3.721 6.457c.182.315.277.666.285 1.018l9.318-.001c.824 0 1.338.893.924 1.605L29.826 30.488a3.56 3.56 0 0 1-3.08 1.772h-7.463c-.374 0-.734-.098-1.048-.275l-4.604 7.978a1.07 1.07 0 0 1-1.851 0L.477 20.385a3.56 3.56 0 0 1-.009-3.546l3.71-6.501c.19-.333.461-.602.781-.788l12.472 21.64c.195.338.475.61.804.795l12.47-21.61c.199-.345.294-.732.285-1.117L6.033 9.26c-.384 0-.753.103-1.074.29L.379 1.602A1.068 1.068 0 0 1 1.303 0z"/></svg>
          </div>
          <h1 style={{ fontSize: '3.2rem', fontWeight: 900, letterSpacing: '-0.04em', color: '#111', marginBottom: '0.8rem' }}>welcome back.</h1>
          <p style={{ color: 'rgba(0,0,0,0.5)', fontSize: '1.4rem', fontWeight: 500 }}>Sign in to DevCollab</p>
        </div>

        {error && (
          <div style={{ marginBottom: '2.4rem', padding: '1.4rem 1.6rem', background: 'rgba(255,0,0,0.05)', border: '1px solid rgba(255,0,0,0.2)', borderRadius: '0.4rem', color: '#d32f2f', fontSize: '1.3rem', fontWeight: 600 }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '2.4rem' }}>
          <div>
            <label style={labelStyle}>Email</label>
            <input
              type="email" value={email} onChange={e => setEmail(e.target.value)} required
              style={inputStyle} placeholder="you@example.com"
              onFocus={e => e.target.style.borderColor = '#111'}
              onBlur={e => e.target.style.borderColor = 'rgba(0,0,0,0.1)'}
            />
          </div>
          <div>
            <label style={labelStyle}>Password</label>
            <input
              type="password" value={password} onChange={e => setPassword(e.target.value)} required
              style={inputStyle} placeholder="••••••••"
              onFocus={e => e.target.style.borderColor = '#111'}
              onBlur={e => e.target.style.borderColor = 'rgba(0,0,0,0.1)'}
            />
          </div>
          <button
            type="submit" disabled={isSubmitting}
            style={{
              width: '100%', padding: '1.6rem', marginTop: '0.8rem', fontSize: '1.4rem',
              fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase',
              background: '#00c547', color: '#111', border: 'none', borderRadius: '0.4rem',
              cursor: isSubmitting ? 'default' : 'pointer', transition: 'background 0.2s',
              opacity: isSubmitting ? 0.7 : 1
            }}
            onMouseEnter={e => { if(!isSubmitting) e.currentTarget.style.background = '#00e853' }}
            onMouseLeave={e => { if(!isSubmitting) e.currentTarget.style.background = '#00c547' }}
          >
            {isSubmitting ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p style={{ marginTop: '3.2rem', textAlign: 'center', fontSize: '1.4rem', color: 'rgba(0,0,0,0.5)', fontWeight: 500 }}>
          No account?{' '}
          <Link to="/register" style={{ color: '#111', textDecoration: 'none', fontWeight: 800, borderBottom: '2px solid #00c547' }}>
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
