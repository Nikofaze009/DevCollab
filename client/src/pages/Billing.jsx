import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import { CreditCard, CheckCircle, AlertCircle, ExternalLink, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const EXPO = [0.16, 1, 0.3, 1];

const PLAN_META = {
  free: { label: 'Free', color: 'rgba(0,197,71,0.1)', textColor: '#00c547', limits: '3 public repos • 2 collaborators • 10 pushes/mo • ₹0/month' },
  pro:  { label: 'Pro',  color: 'rgba(44,78,115,0.1)', textColor: '#2C4E73', limits: 'Unlimited repos • 10 collaborators • Unlimited pushes • ₹150/month' },
  team: { label: 'Team', color: 'rgba(155,184,225,0.2)', textColor: '#5f87b9', limits: 'Unlimited everything • Team management • ₹300/month' }
};

const Billing = () => {
  const { user } = useContext(AuthContext);
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [portalLoading, setPortalLoading] = useState(false);

  const urlParams = new URLSearchParams(window.location.search);
  const isSuccess = urlParams.get('success') === 'true';

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const res = await api.get('/billing/status');
        setStatus(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchStatus();
  }, []);

  const handlePortal = async () => {
    setPortalLoading(true);
    try {
      const res = await api.get('/billing/portal');
      if (res.data.url) window.location.href = res.data.url;
      else alert(res.data.message);
    } catch (err) {
      alert(err.response?.data?.message || 'Error opening billing portal. Configure Lemon Squeezy first.');
    } finally {
      setPortalLoading(false);
    }
  };

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '40vh' }}>
      <div style={{ width: 40, height: 40, borderRadius: '50%', border: '3px solid rgba(0,197,71,0.1)', borderTopColor: '#00c547', animation: 'spin 0.8s linear infinite' }} />
    </div>
  );

  const plan = status?.plan || 'free';
  const meta = PLAN_META[plan];

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', color: '#111' }}>
      
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: EXPO }} style={{ marginBottom: '4.8rem' }}>
        <h1 style={{ fontSize: 'clamp(32px, 4vw, 48px)', fontWeight: 900, letterSpacing: '-0.03em', lineHeight: 1, marginBottom: '0.8rem' }}>
          billing &amp; subscription.
        </h1>
        <p style={{ color: 'rgba(0,0,0,0.5)', fontSize: '1.6rem', fontWeight: 500 }}>
          Manage your DevCollab subscription and usage.
        </p>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1, ease: EXPO }}>
        
        {/* Success Banner */}
        {isSuccess && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: '1.6rem', padding: '1.6rem 2.4rem',
            background: 'rgba(0,197,71,0.05)', border: '1px solid rgba(0,197,71,0.2)', borderRadius: '0.4rem', marginBottom: '3.2rem'
          }}>
            <CheckCircle size={24} color="#00c547" strokeWidth={2.5} />
            <p style={{ color: '#00b03f', fontWeight: 700, fontSize: '1.4rem' }}>
              You've successfully upgraded! Your new plan is now active.
            </p>
          </div>
        )}

        {/* Current Plan Card */}
        <div style={{
          background: '#fff', border: '1px solid rgba(0,0,0,0.08)', borderRadius: '0.4rem', padding: '4rem',
          marginBottom: '3.2rem', boxShadow: '0 4px 20px rgba(0,0,0,0.02)',
          transition: 'transform 0.4s cubic-bezier(0.16,1,0.3,1), box-shadow 0.4s'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-4px)';
          e.currentTarget.style.boxShadow = '0 12px 30px rgba(0,197,71,0.05)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'none';
          e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.02)';
        }}
        >
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '3.2rem' }}>
            <div>
              <p style={{ fontSize: '1.2rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'rgba(0,0,0,0.4)', marginBottom: '1.2rem' }}>
                Current Plan
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1.6rem' }}>
                <span style={{
                  padding: '0.6rem 1.6rem', borderRadius: '10rem', fontSize: '1.6rem', fontWeight: 900,
                  background: meta.color, color: meta.textColor, textTransform: 'uppercase', letterSpacing: '0.05em'
                }}>
                  {meta.label}
                </span>
                <span style={{
                  fontSize: '1rem', fontWeight: 800, padding: '0.4rem 1.2rem', borderRadius: '10rem', textTransform: 'uppercase', letterSpacing: '0.1em',
                  background: status?.status === 'active' ? 'rgba(0,197,71,0.1)' : status?.status === 'past_due' ? 'rgba(255,0,0,0.1)' : 'rgba(0,0,0,0.05)',
                  color: status?.status === 'active' ? '#00b03f' : status?.status === 'past_due' ? '#d32f2f' : 'rgba(0,0,0,0.5)'
                }}>
                  {status?.status || 'free'}
                </span>
              </div>
            </div>
            <CreditCard size={48} color="rgba(0,0,0,0.05)" strokeWidth={1} />
          </div>

          <p style={{ fontSize: '1.6rem', color: 'rgba(0,0,0,0.6)', fontWeight: 500, marginBottom: '2.4rem' }}>
            {meta.limits}
          </p>

          {status?.currentPeriodEnd && (
            <p style={{ fontSize: '1.2rem', color: 'rgba(0,0,0,0.4)', fontWeight: 600, marginBottom: '3.2rem', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <CreditCard size={14} /> Next billing date: {new Date(status.currentPeriodEnd).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          )}

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.6rem', borderTop: '1px solid rgba(0,0,0,0.05)', paddingTop: '3.2rem' }}>
            {plan !== 'free' ? (
              <button
                onClick={handlePortal}
                disabled={portalLoading}
                style={{
                  display: 'flex', alignItems: 'center', gap: '1rem',
                  padding: '1.6rem 3.2rem', background: '#111', color: '#fff', fontSize: '1.2rem', fontWeight: 800,
                  letterSpacing: '0.1em', textTransform: 'uppercase', border: 'none', borderRadius: '0.4rem', cursor: 'pointer',
                  opacity: portalLoading ? 0.7 : 1, transition: 'background 0.2s'
                }}
                onMouseEnter={e => { if(!portalLoading) e.currentTarget.style.background = '#00c547'; }}
                onMouseLeave={e => { if(!portalLoading) e.currentTarget.style.background = '#111'; }}
              >
                <ExternalLink size={18} strokeWidth={2.5} />
                {portalLoading ? 'Opening...' : 'Manage Billing'}
              </button>
            ) : (
              <Link
                to="/pricing"
                style={{
                  display: 'flex', alignItems: 'center', gap: '1rem', textDecoration: 'none',
                  padding: '1.6rem 3.2rem', background: '#00c547', color: '#111', fontSize: '1.2rem', fontWeight: 800,
                  letterSpacing: '0.1em', textTransform: 'uppercase', border: 'none', borderRadius: '0.4rem', cursor: 'pointer',
                  transition: 'background 0.2s'
                }}
                onMouseEnter={e => e.currentTarget.style.background = '#00e853'}
                onMouseLeave={e => e.currentTarget.style.background = '#00c547'}
              >
                <Zap size={18} strokeWidth={2.5} />
                Upgrade Plan
              </Link>
            )}
          </div>
        </div>

        {/* Stripe config notice */}
        {plan === 'free' && (
          <div style={{
            display: 'flex', alignItems: 'flex-start', gap: '1.6rem', padding: '2.4rem',
            background: '#fff', border: '2px dashed rgba(255,160,0,0.3)', borderRadius: '0.4rem'
          }}>
            <AlertCircle size={24} color="#ff9000" strokeWidth={2} style={{ marginTop: '0.2rem', flexShrink: 0 }} />
            <div>
              <p style={{ color: '#111', fontWeight: 800, fontSize: '1.4rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.8rem' }}>
                Lemon Squeezy not configured yet
              </p>
              <p style={{ color: 'rgba(0,0,0,0.6)', fontSize: '1.3rem', fontWeight: 500, lineHeight: 1.6 }}>
                To enable real payments, add your <span style={{ fontFamily: 'monospace', background: 'rgba(0,0,0,0.05)', padding: '0.2rem 0.6rem', borderRadius: '0.2rem', color: '#111', fontWeight: 600 }}>LEMONSQUEEZY_API_KEY</span> to <span style={{ fontFamily: 'monospace', background: 'rgba(0,0,0,0.05)', padding: '0.2rem 0.6rem', borderRadius: '0.2rem', color: '#111', fontWeight: 600 }}>server/.env</span>. 
                Visit the <Link to="/pricing" style={{ color: '#00b03f', fontWeight: 700, textDecoration: 'none' }}>Pricing page</Link> to see all available plans.
              </p>
            </div>
          </div>
        )}

      </motion.div>
    </div>
  );
};

export default Billing;
