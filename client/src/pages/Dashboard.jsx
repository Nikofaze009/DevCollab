import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import { Book, CheckCircle, Clock, GitPullRequest } from 'lucide-react';
import { motion } from 'framer-motion';

const EXPO = [0.16, 1, 0.3, 1];

const StatCard = ({ icon: Icon, label, value, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.9, delay, ease: EXPO }}
    style={{
      padding: '2.8rem',
      display: 'flex',
      alignItems: 'center',
      gap: '2.4rem',
      background: '#fff',
      border: '1px solid rgba(0,0,0,0.08)',
      borderRadius: '0.4rem',
      boxShadow: '0 4px 20px rgba(0,0,0,0.02)',
      transition: 'transform 0.4s cubic-bezier(0.16,1,0.3,1), box-shadow 0.4s'
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.transform = 'translateY(-6px)';
      e.currentTarget.style.boxShadow = '0 12px 30px rgba(0,197,71,0.08)';
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.transform = 'none';
      e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.02)';
    }}
  >
    <div style={{
      background: 'rgba(0,197,71,0.08)',
      padding: '1.6rem',
      borderRadius: '50%',
      color: '#00c547',
    }}>
      <Icon size={32} strokeWidth={2.5} />
    </div>
    <div>
      <p style={{ color: 'rgba(0,0,0,0.4)', fontSize: '1.1rem', fontWeight: 800, letterSpacing: '0.12em', marginBottom: '0.4rem', textTransform: 'uppercase' }}>
        {label}
      </p>
      <h3 style={{ fontSize: '4.8rem', fontWeight: 900, color: '#111', lineHeight: 1, letterSpacing: '-0.04em' }}>
        {value}
      </h3>
    </div>
  </motion.div>
);

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const [stats, setStats] = useState({
    totalRepos: 0,
    openIssues: 0,
    pendingPRs: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [reposRes, issuesRes, prsRes] = await Promise.all([
          api.get('/repos'),
          api.get('/issues'),
          api.get('/pr')
        ]);
        
        setStats({
          totalRepos: reposRes.data.length,
          openIssues: issuesRes.data.filter(issue => issue.status === 'Open').length,
          pendingPRs: prsRes.data.filter(pr => pr.status === 'Open').length
        });
      } catch (error) {
        console.error('Error fetching dashboard stats', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '40vh' }}>
        <div style={{ width: 40, height: 40, borderRadius: '50%', border: '3px solid rgba(0,197,71,0.1)', borderTopColor: '#00c547', animation: 'spin 0.8s linear infinite' }} />
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', color: '#111' }}>
      <motion.div
        initial={{ opacity: 0, y: -20, filter: 'blur(8px)' }}
        animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
        transition={{ duration: 0.8, ease: EXPO }}
        style={{ marginBottom: '6rem' }}
      >
        <h1 style={{ fontSize: 'clamp(32px, 5vw, 64px)', fontWeight: 900, letterSpacing: '-0.05em', marginBottom: '1.2rem', lineHeight: 1 }}>
          welcome, <span style={{ color: '#00c547' }}>{user.username}</span>.
        </h1>
        <p style={{ color: 'rgba(0,0,0,0.5)', fontSize: '1.8rem', fontWeight: 500 }}>
          Here's what's happening in your projects today.
        </p>
      </motion.div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2.4rem', marginBottom: '6rem' }}>
        <StatCard icon={Book} label="total repositories" value={stats.totalRepos} delay={0.1} />
        <StatCard icon={Clock} label="open issues" value={stats.openIssues} delay={0.2} />
        <StatCard icon={GitPullRequest} label="pending prs" value={stats.pendingPRs} delay={0.3} />
      </div>
      
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9, delay: 0.4, ease: EXPO }}
        style={{ padding: '4.8rem', background: '#fff', border: '1px solid rgba(0,0,0,0.08)', borderRadius: '0.4rem', boxShadow: '0 4px 20px rgba(0,0,0,0.02)' }}
      >
        <h2 style={{ fontSize: '2rem', fontWeight: 800, color: '#111', letterSpacing: '-0.02em', marginBottom: '3.2rem', display: 'flex', alignItems: 'center', gap: '1.2rem' }}>
          <CheckCircle size={28} color="#00e853" strokeWidth={2.5} />
          recent activities
        </h2>
        <div style={{
          padding: '8rem 2rem',
          textAlign: 'center',
          border: '2px dashed rgba(0,0,0,0.08)',
          borderRadius: '0.4rem',
          color: 'rgba(0,0,0,0.3)',
          fontSize: '1.4rem',
          fontWeight: 600,
          textTransform: 'uppercase',
          letterSpacing: '0.05em'
        }}>
          activity feed will appear here as you collaborate.
        </div>
      </motion.div>
    </div>
  );
};

export default Dashboard;
