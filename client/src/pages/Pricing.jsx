import React, { useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';

/* ─────────────────── FADE UP (on mount/scroll) ─────────────────── */
const FadeUp = ({ children, delay = 0, style = {}, className = "" }) => (
  <motion.div
    className={className}
    style={style}
    initial={{ opacity: 0, y: 40 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "-50px" }}
    transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay }}
  >
    {children}
  </motion.div>
);

const plans = [
  {
    id: 'free', name: 'Free', price: '$0', period: 'forever',
    desc: 'Perfect for solo developers and side projects.',
    features: ['3 public repositories', '2 collaborators per repo', '10 code pushes / month', 'Custom CLI (dev command)', 'Issue tracking', 'Pull request management'],
    popular: false, ctaText: 'Get started', ctaLink: '/register',
  },
  {
    id: 'pro', name: 'Pro', price: '$9', period: '/month',
    desc: 'For professional developers who need more power.',
    features: ['Unlimited repositories', 'Private repositories', 'Up to 10 collaborators', 'Unlimited code pushes', 'Everything in Free', 'Priority support'],
    popular: true, ctaText: 'Upgrade to Pro',
  },
  {
    id: 'team', name: 'Team', price: '$29', period: '/month',
    desc: 'For teams building products together at scale.',
    features: ['Everything in Pro', 'Unlimited collaborators', 'Team management dashboard', 'Advanced analytics', 'Audit logs', 'Dedicated support'],
    popular: false, ctaText: 'Upgrade to Team',
  },
];

const PricingCard = ({ plan, delay, onUpgrade, loading }) => {
  const isPopular = plan.popular;

  return (
    <motion.div
      initial={{ opacity: 0, y: 60 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1], delay }}
      whileHover={{ y: -8, transition: { type: 'spring', stiffness: 300, damping: 22 } }}
      style={{
        position: 'relative',
        background: '#fff',
        border: isPopular ? '2px solid #00c547' : '1px solid rgba(0,0,0,0.1)',
        borderRadius: '0.8rem',
        padding: '4rem 3.2rem',
        boxShadow: isPopular ? '0 12px 30px rgba(0,197,71,0.08)' : '0 4px 20px rgba(0,0,0,0.02)',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {isPopular && (
        <div style={{
          position: 'absolute', top: '-14px', left: '50%', transform: 'translateX(-50%)',
          background: '#00c547', color: '#111', fontSize: '1rem', fontWeight: 800,
          letterSpacing: '0.1em', textTransform: 'uppercase', padding: '0.4rem 1.6rem',
          borderRadius: '10rem', boxShadow: '0 4px 10px rgba(0,197,71,0.2)'
        }}>
          Most Popular
        </div>
      )}

      <p style={{ fontSize: '1.2rem', fontWeight: 800, letterSpacing: '0.15em', textTransform: 'uppercase', color: isPopular ? '#00b03f' : 'rgba(0,0,0,0.4)', marginBottom: '1.2rem' }}>{plan.name}</p>
      <p style={{ fontSize: '1.4rem', color: 'rgba(0,0,0,0.6)', marginBottom: '2.8rem', lineHeight: 1.6, fontWeight: 500 }}>{plan.desc}</p>

      <div style={{ marginBottom: '3.2rem' }}>
        <span style={{ fontSize: '6rem', fontWeight: 900, letterSpacing: '-0.06em', lineHeight: 1, color: '#111' }}>{plan.price}</span>
        <span style={{ fontSize: '1.4rem', color: 'rgba(0,0,0,0.4)', marginLeft: '0.8rem', fontWeight: 600 }}>{plan.period}</span>
      </div>

      <div style={{ height: 1, background: 'rgba(0,0,0,0.08)', marginBottom: '2.8rem' }} />

      <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '1.4rem', marginBottom: '3.6rem', flex: 1 }}>
        {plan.features.map((f, i) => (
          <motion.li key={f}
            initial={{ opacity: 0, x: -10 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: delay + 0.3 + i * 0.05 }}
            style={{ display: 'flex', alignItems: 'flex-start', gap: '1.2rem', fontSize: '1.45rem', color: 'rgba(0,0,0,0.7)', lineHeight: 1.5, fontWeight: 500 }}
          >
            <span style={{ color: isPopular ? '#00c547' : '#111', flexShrink: 0, fontWeight: 800, fontSize: '1.2rem', marginTop: '0.15rem' }}>✓</span>
            {f}
          </motion.li>
        ))}
      </ul>

      {plan.ctaLink ? (
        <motion.div whileHover={{ y: -2 }} whileTap={{ scale: 0.97 }} transition={{ type: 'spring', stiffness: 400, damping: 20 }}>
          <Link
            to={plan.ctaLink}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              padding: '1.6rem 2.4rem', borderRadius: '0.4rem',
              background: 'transparent', border: '2px solid #111', color: '#111', textDecoration: 'none',
              fontSize: '1.2rem', fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase',
              transition: 'all 0.2s', width: '100%'
            }}
            onMouseEnter={e => { e.currentTarget.style.background = '#111'; e.currentTarget.style.color = '#fff'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#111'; }}
          >
            {plan.ctaText}
          </Link>
        </motion.div>
      ) : (
        <motion.button
          whileHover={loading !== plan.id ? { y: -2 } : {}}
          whileTap={loading !== plan.id ? { scale: 0.97 } : {}}
          transition={{ type: 'spring', stiffness: 400, damping: 20 }}
          onClick={() => onUpgrade(plan.id)}
          disabled={loading === plan.id}
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.8rem',
            padding: '1.6rem 2.4rem', borderRadius: '0.4rem',
            background: isPopular ? '#00c547' : '#111', border: 'none',
            color: isPopular ? '#111' : '#fff', cursor: loading === plan.id ? 'default' : 'pointer',
            fontSize: '1.2rem', fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase',
            transition: 'all 0.2s', width: '100%',
            opacity: loading === plan.id ? 0.6 : 1,
          }}
          onMouseEnter={e => { if (!loading) { e.currentTarget.style.background = isPopular ? '#00e853' : '#333'; }}}
          onMouseLeave={e => { if (!loading) { e.currentTarget.style.background = isPopular ? '#00c547' : '#111'; }}}
        >
          {loading === plan.id ? 'Redirecting...' : plan.ctaText} {loading !== plan.id && '→'}
        </motion.button>
      )}
    </motion.div>
  );
};

const Pricing = () => {
  const { user } = useContext(AuthContext);
  const [loading, setLoading] = useState(null);

  const handleUpgrade = async (planId) => {
    if (!user) { window.location.href = '/register'; return; }
    setLoading(planId);
    try {
      const res = await api.post('/billing/create-checkout', { plan: planId });
      if (res.data.url) window.location.href = res.data.url;
      else alert(res.data.message || 'Stripe not configured. Add STRIPE_SECRET_KEY to server/.env');
    } catch (err) {
      alert(err.response?.data?.message || 'Configure Stripe in server/.env to enable payments.');
    } finally {
      setLoading(null);
    }
  };

  return (
    <div style={{ paddingTop: '10rem', paddingBottom: '10rem', position: 'relative', zIndex: 2 }}>
      
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 3.2rem', position: 'relative', zIndex: 1 }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '8rem' }}>
          <FadeUp>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.8rem', padding: '0.6rem 2.4rem', borderRadius: '10rem', border: '2px solid rgba(0,197,71,0.2)', background: 'rgba(0,197,71,0.05)', marginBottom: '3.2rem' }}>
              <span style={{ fontSize: '1.4rem' }}>⚡</span>
              <span style={{ fontSize: '1rem', fontWeight: 800, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#00b03f' }}>Simple, transparent pricing</span>
            </div>
          </FadeUp>
          <FadeUp delay={0.1}>
            <h1 style={{ fontSize: 'clamp(4.8rem, 8vw, 9rem)', fontWeight: 900, lineHeight: 0.9, letterSpacing: '-0.05em', marginBottom: '2.4rem', color: '#111' }}>
              Choose your<br />
              <span style={{ color: '#00c547' }}>plan.</span>
            </h1>
          </FadeUp>
          <FadeUp delay={0.2}>
            <p style={{ fontSize: '1.8rem', color: 'rgba(0,0,0,0.5)', maxWidth: '520px', margin: '0 auto', lineHeight: 1.7, fontWeight: 500 }}>
              Start for free. Upgrade when you're ready. No hidden fees, cancel anytime.
            </p>
          </FadeUp>
        </div>

        {/* Plan cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '3.2rem', alignItems: 'start' }}>
          {plans.map((plan, i) => (
            <PricingCard key={plan.id} plan={plan} delay={i * 0.15} onUpgrade={handleUpgrade} loading={loading} />
          ))}
        </div>

        {/* FAQ note */}
        <FadeUp delay={0.4} style={{ textAlign: 'center', marginTop: '6.4rem' }}>
          <p style={{ fontSize: '1.4rem', color: 'rgba(0,0,0,0.4)', lineHeight: 1.8, fontWeight: 500 }}>
            All plans include the <span style={{ fontFamily: 'monospace', background: 'rgba(0,0,0,0.05)', padding: '0.2rem 0.6rem', borderRadius: '0.2rem', color: '#111', fontWeight: 600 }}>dev</span> CLI tool.<br/>
            Payments powered by Stripe. Cancel anytime.
          </p>
        </FadeUp>

        {/* Feature comparison */}
        <FadeUp delay={0.5} style={{ marginTop: '10rem' }}>
          <div style={{ background: '#fff', border: '1px solid rgba(0,0,0,0.08)', borderRadius: '0.8rem', overflow: 'hidden' }}>
            <div style={{ padding: '3.2rem', borderBottom: '1px solid rgba(0,0,0,0.05)', background: 'rgba(0,0,0,0.01)' }}>
              <h3 style={{ fontSize: '2.4rem', fontWeight: 800, letterSpacing: '-0.02em', color: '#111' }}>Feature comparison</h3>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '600px' }}>
                <thead>
                  <tr>
                    {['Feature', 'Free', 'Pro', 'Team'].map((h, i) => (
                      <th key={h} style={{ padding: '2rem 2.4rem', textAlign: i === 0 ? 'left' : 'center', fontSize: '1.2rem', fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase', color: i === 0 ? 'rgba(0,0,0,0.4)' : '#111', borderBottom: '1px solid rgba(0,0,0,0.08)' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[
                    ['Repositories', '3 public', 'Unlimited', 'Unlimited'],
                    ['Private repos', '✗', '✓', '✓'],
                    ['Collaborators', '2', '10', 'Unlimited'],
                    ['Code pushes/month', '10', 'Unlimited', 'Unlimited'],
                    ['CLI (dev command)', '✓', '✓', '✓'],
                    ['Issue tracking', '✓', '✓', '✓'],
                    ['Pull requests', '✓', '✓', '✓'],
                    ['Team dashboard', '✗', '✗', '✓'],
                    ['Analytics', '✗', '✗', '✓'],
                  ].map(([feat, ...vals], ri) => (
                    <motion.tr
                      key={feat}
                      initial={{ opacity: 0, x: -10 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.2 + ri * 0.05 }}
                      style={{ background: ri % 2 === 0 ? '#fff' : 'rgba(0,0,0,0.02)' }}
                    >
                      <td style={{ padding: '1.6rem 2.4rem', fontSize: '1.4rem', color: 'rgba(0,0,0,0.7)', fontWeight: 500 }}>{feat}</td>
                      {vals.map((v, vi) => (
                        <td key={vi} style={{ padding: '1.6rem 2.4rem', textAlign: 'center', fontSize: '1.4rem', color: v === '✓' ? '#00c547' : v === '✗' ? 'rgba(0,0,0,0.2)' : 'rgba(0,0,0,0.7)', fontWeight: v === '✓' || v === '✗' ? 800 : 500 }}>{v}</td>
                      ))}
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </FadeUp>
      </div>
    </div>
  );
};

export default Pricing;
