import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import { Book, Plus, Lock, Globe, Zap, ArrowRight, GitCommit } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const EXPO = [0.16, 1, 0.3, 1];
const PLAN_LIMITS = { free: 3, pro: Infinity, team: Infinity };

const RepositoryList = () => {
  const [repos, setRepos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [createError, setCreateError] = useState('');
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  // New Repo Form
  const [repoName, setRepoName] = useState('');
  const [description, setDescription] = useState('');
  const [visibility, setVisibility] = useState('public');

  useEffect(() => { fetchRepos(); }, []);

  const fetchRepos = async () => {
    try {
      const res = await api.get('/repos');
      setRepos(res.data);
    } catch (error) {
      console.error('Failed to fetch repositories', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRepo = async (e) => {
    e.preventDefault();
    setCreateError('');
    try {
      await api.post('/repos', { repoName, description, visibility });
      setIsModalOpen(false);
      setRepoName('');
      setDescription('');
      setVisibility('public');
      fetchRepos();
    } catch (error) {
      const msg = error.response?.data?.message || 'Failed to create repository';
      if (error.response?.data?.upgradeRequired) {
        setCreateError('LIMIT_REACHED');
      } else {
        setCreateError(msg);
      }
    }
  };

  const plan = user?.plan || 'free';
  const limit = PLAN_LIMITS[plan];
  const myRepos = repos.filter(r => r.owner?._id === user?._id || r.owner?.username === user?.username);
  const atLimit = plan === 'free' && myRepos.length >= limit;

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '40vh' }}>
        <div style={{ width: 40, height: 40, borderRadius: '50%', border: '3px solid rgba(0,197,71,0.1)', borderTopColor: '#00c547', animation: 'spin 0.8s linear infinite' }} />
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', color: '#111' }}>
      {/* Upgrade Banner */}
      {atLimit && (
        <motion.div
          initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1.6rem',
            padding: '1.6rem 2.4rem',
            background: 'rgba(255,160,0,0.05)',
            border: '1px solid rgba(255,160,0,0.2)',
            borderRadius: '0.4rem',
            marginBottom: '4.8rem'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.6rem' }}>
            <div style={{ background: 'rgba(255,160,0,0.1)', padding: '1.2rem', borderRadius: '50%', color: '#ff9000' }}>
              <Zap size={24} strokeWidth={2.5} />
            </div>
            <div>
              <p style={{ color: '#ff9000', fontWeight: 800, fontSize: '1.6rem', marginBottom: '0.2rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Free plan limit reached</p>
              <p style={{ color: 'rgba(0,0,0,0.5)', fontSize: '1.3rem', fontWeight: 500 }}>You've used all 3 free repositories. Upgrade to Pro for unlimited repos.</p>
            </div>
          </div>
          <Link to="/pricing" style={{
            padding: '1.2rem 2.4rem', fontSize: '1rem', fontWeight: 800, letterSpacing: '0.1em',
            textTransform: 'uppercase', border: '1.5px solid #ff9000', color: '#ff9000', borderRadius: '0.4rem', textDecoration: 'none',
            display: 'flex', alignItems: 'center', gap: '0.8rem'
          }}>
            Upgrade <ArrowRight size={16} />
          </Link>
        </motion.div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '4.8rem' }}>
        <motion.div initial={{ opacity: 0, x: -20, filter: 'blur(8px)' }} animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }} transition={{ duration: 0.8, ease: EXPO }}>
          <h1 style={{ fontSize: 'clamp(32px, 4vw, 56px)', fontWeight: 900, letterSpacing: '-0.04em', marginBottom: '0.4rem', lineHeight: 1 }}>
            repositories.
          </h1>
          <p style={{ color: 'rgba(0,0,0,0.5)', fontSize: '1.6rem', fontWeight: 500 }}>
            {plan === 'free' ? `${myRepos.length} / 3 free repos used` : 'manage your source code projects'}
          </p>
        </motion.div>
        <motion.button
          initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8, ease: EXPO }}
          onClick={() => { setCreateError(''); setIsModalOpen(true); }}
          disabled={atLimit}
          style={{
            padding: '1.6rem 3.2rem', background: '#111', color: '#fff', fontSize: '1.2rem', fontWeight: 800, letterSpacing: '0.1em',
            textTransform: 'uppercase', border: 'none', borderRadius: '0.4rem', display: 'flex', alignItems: 'center', gap: '1rem',
            cursor: atLimit ? 'not-allowed' : 'pointer', opacity: atLimit ? 0.5 : 1, transition: 'background 0.3s, transform 0.3s'
          }}
          onMouseEnter={(e) => { if(!atLimit) { e.currentTarget.style.background = '#00c547'; e.currentTarget.style.transform = 'translateY(-2px)'; } }}
          onMouseLeave={(e) => { if(!atLimit) { e.currentTarget.style.background = '#111'; e.currentTarget.style.transform = 'none'; } }}
        >
          <Plus size={20} strokeWidth={3} />
          new repository
        </motion.button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))', gap: '2.4rem' }}>
        {repos.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '10rem 2rem', background: '#fff', border: '1px solid rgba(0,0,0,0.08)', borderRadius: '0.4rem' }}>
            <Book size={64} color="rgba(0,0,0,0.05)" strokeWidth={1} style={{ margin: '0 auto 2.4rem' }} />
            <p style={{ color: 'rgba(0,0,0,0.4)', fontSize: '1.6rem', fontWeight: 600 }}>no repositories yet. create one to get started!</p>
          </motion.div>
        ) : (
          repos.map((repo, i) => (
            <motion.div
              key={repo._id}
              initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: i * 0.1, ease: EXPO }}
              onClick={() => navigate(`/repositories/${repo._id}`)}
              style={{
                background: '#fff', border: '1px solid rgba(0,0,0,0.08)', borderRadius: '0.4rem', padding: '3.2rem',
                cursor: 'pointer', display: 'flex', flexDirection: 'column', height: '100%',
                boxShadow: '0 4px 20px rgba(0,0,0,0.01)', transition: 'transform 0.4s cubic-bezier(0.16,1,0.3,1), box-shadow 0.4s, border-color 0.4s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-6px)';
                e.currentTarget.style.boxShadow = '0 12px 30px rgba(0,197,71,0.08)';
                e.currentTarget.style.borderColor = 'rgba(0,197,71,0.3)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'none';
                e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.01)';
                e.currentTarget.style.borderColor = 'rgba(0,0,0,0.08)';
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.6rem' }}>
                <h3 style={{ fontSize: '2.4rem', fontWeight: 800, color: '#111', letterSpacing: '-0.03em' }}>{repo.repoName}</h3>
                <span style={{
                  display: 'inline-flex', alignItems: 'center', gap: '0.6rem',
                  fontSize: '1rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.12em',
                  padding: '0.6rem 1.2rem', borderRadius: '10rem',
                  background: repo.visibility === 'public' ? 'rgba(0,197,71,0.08)' : 'rgba(0,0,0,0.04)',
                  color: repo.visibility === 'public' ? '#00b03f' : 'rgba(0,0,0,0.6)',
                }}>
                  {repo.visibility === 'public' ? <Globe size={14} strokeWidth={2.5}/> : <Lock size={14} strokeWidth={2.5}/>}
                  {repo.visibility}
                </span>
              </div>
              <p style={{ color: 'rgba(0,0,0,0.5)', fontSize: '1.5rem', lineHeight: 1.6, marginBottom: '3.2rem', flexGrow: 1, fontWeight: 500 }}>
                {repo.description || 'No description provided.'}
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '2.4rem', fontSize: '1.2rem', fontWeight: 600, color: 'rgba(0,0,0,0.4)', borderTop: '1px solid rgba(0,0,0,0.05)', paddingTop: '2rem' }}>
                <span style={{ color: 'rgba(0,0,0,0.7)' }}>@{repo.owner?.username}</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}><GitCommit size={16}/> {new Date(repo.updatedAt).toLocaleDateString()}</span>
              </div>
            </motion.div>
          ))
        )}
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: 'fixed', inset: 0, background: 'rgba(245,247,250,0.85)', backdropFilter: 'blur(12px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, padding: '2rem' }}
            onClick={() => setIsModalOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 30 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 30 }}
              transition={{ duration: 0.5, ease: EXPO }}
              style={{ width: '100%', maxWidth: '580px', maxHeight: '90vh', overflowY: 'auto', background: '#fff', border: '1px solid rgba(0,0,0,0.08)', borderRadius: '0.4rem', boxShadow: '0 20px 60px rgba(0,0,0,0.08)' }}
              onClick={e => e.stopPropagation()}
            >
              <div style={{ padding: '3.2rem 4rem', borderBottom: '1px solid rgba(0,0,0,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ fontSize: '2.4rem', fontWeight: 900, letterSpacing: '-0.03em', color: '#111' }}>create repository.</h3>
                <button onClick={() => setIsModalOpen(false)} style={{ background: 'none', border: 'none', color: 'rgba(0,0,0,0.3)', fontSize: '3rem', cursor: 'pointer', lineHeight: 1, transition: 'color 0.2s' }} onMouseEnter={e => e.currentTarget.style.color = '#111'} onMouseLeave={e => e.currentTarget.style.color = 'rgba(0,0,0,0.3)'}>&times;</button>
              </div>

              {createError === 'LIMIT_REACHED' ? (
                <div style={{ padding: '6rem 4rem', textAlign: 'center' }}>
                  <Zap size={64} color="#ff9000" strokeWidth={1.5} style={{ margin: '0 auto 2.4rem' }} />
                  <h4 style={{ fontSize: '2.4rem', fontWeight: 900, marginBottom: '1.2rem', letterSpacing: '-0.02em' }}>free plan limit reached</h4>
                  <p style={{ color: 'rgba(0,0,0,0.5)', fontSize: '1.6rem', fontWeight: 500, marginBottom: '4rem' }}>Upgrade to Pro to create unlimited repositories.</p>
                  <Link to="/pricing" style={{
                    display: 'inline-flex', alignItems: 'center', gap: '1rem', background: '#111', color: '#fff', padding: '1.6rem 3.2rem',
                    fontSize: '1.2rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', borderRadius: '0.4rem', textDecoration: 'none'
                  }}>
                    View Plans <ArrowRight size={18} />
                  </Link>
                </div>
              ) : (
                <form onSubmit={handleCreateRepo} style={{ padding: '4rem' }}>
                  {createError && <div style={{ background: 'rgba(255,50,50,0.05)', color: '#e03e3e', padding: '1.6rem 2rem', borderRadius: '0.4rem', marginBottom: '3.2rem', fontSize: '1.4rem', fontWeight: 600, border: '1px solid rgba(255,50,50,0.1)' }}>{createError}</div>}
                  
                  <div style={{ marginBottom: '3.2rem' }}>
                    <label style={{ display: 'block', fontSize: '1.1rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'rgba(0,0,0,0.4)', marginBottom: '1.2rem' }}>Repository name *</label>
                    <input
                      type="text" value={repoName} onChange={(e) => setRepoName(e.target.value)} required
                      style={{ width: '100%', padding: '1.6rem 2rem', background: 'rgba(0,0,0,0.02)', border: '1px solid rgba(0,0,0,0.08)', borderRadius: '0.4rem', fontSize: '1.6rem', fontWeight: 600, color: '#111', outline: 'none', transition: 'border-color 0.2s' }}
                      onFocus={e => e.currentTarget.style.borderColor = '#00c547'} onBlur={e => e.currentTarget.style.borderColor = 'rgba(0,0,0,0.08)'}
                      placeholder="e.g. awesome-project"
                    />
                  </div>
                  
                  <div style={{ marginBottom: '4rem' }}>
                    <label style={{ display: 'block', fontSize: '1.1rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'rgba(0,0,0,0.4)', marginBottom: '1.2rem' }}>Description (optional)</label>
                    <textarea
                      value={description} onChange={(e) => setDescription(e.target.value)}
                      style={{ width: '100%', padding: '1.6rem 2rem', background: 'rgba(0,0,0,0.02)', border: '1px solid rgba(0,0,0,0.08)', borderRadius: '0.4rem', fontSize: '1.6rem', fontWeight: 500, color: '#111', outline: 'none', transition: 'border-color 0.2s', resize: 'none', height: '100px' }}
                      onFocus={e => e.currentTarget.style.borderColor = '#00c547'} onBlur={e => e.currentTarget.style.borderColor = 'rgba(0,0,0,0.08)'}
                    />
                  </div>
                  
                  <div style={{ marginBottom: '4.8rem' }}>
                    <label style={{ display: 'block', fontSize: '1.1rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'rgba(0,0,0,0.4)', marginBottom: '2rem' }}>Visibility</label>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.6rem' }}>
                      {['public', 'private'].map(v => (
                        <label key={v} style={{ display: 'flex', gap: '2rem', cursor: 'pointer', padding: '2.4rem', border: `1.5px solid ${visibility === v ? '#00c547' : 'rgba(0,0,0,0.05)'}`, borderRadius: '0.4rem', background: visibility === v ? 'rgba(0,197,71,0.03)' : '#fff', transition: 'all 0.2s' }}>
                          <input type="radio" name="visibility" value={v} checked={visibility === v} onChange={() => setVisibility(v)} style={{ marginTop: '0.4rem', accentColor: '#00c547', transform: 'scale(1.2)' }} />
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', fontSize: '1.6rem', fontWeight: 800, color: visibility === v ? '#00b03f' : '#111', marginBottom: '0.6rem', textTransform: 'capitalize' }}>
                              {v === 'public' ? <Globe size={18} strokeWidth={2.5} /> : <Lock size={18} strokeWidth={2.5} />}
                              {v}
                              {v === 'private' && plan === 'free' && <span style={{ fontSize: '1rem', background: 'rgba(255,160,0,0.1)', color: '#ff9000', padding: '0.4rem 0.8rem', borderRadius: '0.4rem', marginLeft: '1.2rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Pro required</span>}
                            </div>
                            <p style={{ color: 'rgba(0,0,0,0.5)', fontSize: '1.4rem', fontWeight: 500 }}>{v === 'public' ? 'Anyone on the internet can see this repository.' : 'Only you and invited collaborators can see it.'}</p>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>
                  
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '2rem', borderTop: '1px solid rgba(0,0,0,0.05)', paddingTop: '3.2rem' }}>
                    <button type="button" onClick={() => setIsModalOpen(false)} style={{ background: 'transparent', border: 'none', color: 'rgba(0,0,0,0.4)', fontSize: '1.2rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', cursor: 'pointer', padding: '1.2rem 2.4rem' }}>Cancel</button>
                    <button type="submit" style={{ background: '#00c547', color: '#111', border: 'none', fontSize: '1.2rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', padding: '1.6rem 3.2rem', borderRadius: '0.4rem', cursor: 'pointer', transition: 'background 0.2s' }} onMouseEnter={e => e.currentTarget.style.background = '#00e853'} onMouseLeave={e => e.currentTarget.style.background = '#00c547'}>
                      Create repository
                    </button>
                  </div>
                </form>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default RepositoryList;
