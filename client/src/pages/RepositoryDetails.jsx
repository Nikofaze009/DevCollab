import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import {
  Folder, FileText, ChevronRight, GitCommit, Clock,
  ArrowLeft, Globe, Lock, Code2, User
} from 'lucide-react';
import { motion } from 'framer-motion';

const EXPO = [0.16, 1, 0.3, 1];

// ---- File Icon helper ----
const fileIcon = (name) => {
  const ext = name.split('.').pop().toLowerCase();
  const map = { js: '🟨', jsx: '⚛️', ts: '🔷', tsx: '⚛️', py: '🐍', css: '🎨', html: '🌐', md: '📝', json: '📋', txt: '📄', sh: '⚙️', env: '🔒' };
  return map[ext] || '📄';
};

// ---- File Tree Node ----
const TreeNode = ({ node, onFileClick, depth = 0 }) => {
  const [open, setOpen] = useState(depth === 0);
  if (node.type === 'folder') {
    return (
      <div>
        <button
          onClick={() => setOpen(!open)}
          style={{
            display: 'flex', alignItems: 'center', gap: '0.8rem', width: '100%', textAlign: 'left',
            padding: `0.6rem 1.2rem`, paddingLeft: `${1.2 + depth * 1.6}rem`,
            background: 'none', border: 'none', cursor: 'pointer', borderRadius: '0.4rem', transition: 'background 0.2s'
          }}
          onMouseEnter={e => e.currentTarget.style.background = 'rgba(0,0,0,0.03)'}
          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
        >
          <ChevronRight size={14} style={{ color: 'rgba(0,0,0,0.3)', transform: open ? 'rotate(90deg)' : 'none', transition: 'transform 0.2s' }} />
          <Folder size={16} color="#00c547" />
          <span style={{ fontSize: '1.4rem', fontWeight: 600, color: '#111' }}>{node.name}</span>
        </button>
        {open && node.children?.map(child => (
          <TreeNode key={child.path} node={child} onFileClick={onFileClick} depth={depth + 1} />
        ))}
      </div>
    );
  }
  return (
    <button
      onClick={() => onFileClick(node)}
      style={{
        display: 'flex', alignItems: 'center', gap: '0.8rem', width: '100%', textAlign: 'left',
        padding: `0.6rem 1.2rem`, paddingLeft: `${2.8 + depth * 1.6}rem`,
        background: 'none', border: 'none', cursor: 'pointer', borderRadius: '0.4rem', transition: 'background 0.2s'
      }}
      onMouseEnter={e => e.currentTarget.style.background = 'rgba(0,197,71,0.05)'}
      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
    >
      <span style={{ fontSize: '1.4rem' }}>{fileIcon(node.name)}</span>
      <span style={{ fontSize: '1.4rem', fontWeight: 500, color: 'rgba(0,0,0,0.7)' }}>{node.name}</span>
      <span style={{ marginLeft: 'auto', fontSize: '1.2rem', color: 'rgba(0,0,0,0.3)' }}>{node.size < 1024 ? `${node.size}B` : `${(node.size/1024).toFixed(1)}KB`}</span>
    </button>
  );
};

// ---- Main Page ----
const RepositoryDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  const [repo, setRepo] = useState(null);
  const [tree, setTree] = useState([]);
  const [latestCommit, setLatestCommit] = useState(null);
  const [commits, setCommits] = useState([]);
  const [activeTab, setActiveTab] = useState('code');
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileContent, setFileContent] = useState('');
  const [loadingFile, setLoadingFile] = useState(false);
  const [loading, setLoading] = useState(true);
  const [noCode, setNoCode] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [repoRes, treeRes, commitsRes] = await Promise.all([
          api.get(`/repos/${id}`),
          api.get(`/repos/${id}/tree`),
          api.get(`/repos/${id}/commits`)
        ]);
        setRepo(repoRes.data);
        if (treeRes.data.tree?.length === 0) setNoCode(true);
        setTree(treeRes.data.tree || []);
        setLatestCommit(treeRes.data.commit);
        setCommits(commitsRes.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const handleFileClick = async (file) => {
    setSelectedFile(file);
    setLoadingFile(true);
    setFileContent('');
    try {
      const res = await api.get(`/repos/${id}/blob?file=${encodeURIComponent(file.path)}`);
      setFileContent(res.data.content);
    } catch (err) {
      setFileContent(`// Error loading file: ${err.response?.data?.message || err.message}`);
    } finally {
      setLoadingFile(false);
    }
  };

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '40vh' }}>
      <div style={{ width: 40, height: 40, borderRadius: '50%', border: '3px solid rgba(0,197,71,0.1)', borderTopColor: '#00c547', animation: 'spin 0.8s linear infinite' }} />
    </div>
  );

  if (!repo) return <div style={{ textAlign: 'center', marginTop: '10rem', color: 'rgba(0,0,0,0.5)', fontSize: '1.6rem', fontWeight: 600 }}>Repository not found.</div>;

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', color: '#111' }}>
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: EXPO }} style={{ marginBottom: '4.8rem' }}>
        <button
          onClick={() => navigate('/repositories')}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.8rem', background: 'none', border: 'none',
            fontSize: '1.2rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em',
            color: 'rgba(0,0,0,0.4)', cursor: 'pointer', marginBottom: '2.4rem', transition: 'color 0.2s'
          }}
          onMouseEnter={e => e.currentTarget.style.color = '#111'}
          onMouseLeave={e => e.currentTarget.style.color = 'rgba(0,0,0,0.4)'}
        >
          <ArrowLeft size={16} strokeWidth={3} /> Back to repositories
        </button>

        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '4rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.6rem', marginBottom: '0.8rem' }}>
              <h1 style={{ fontSize: 'clamp(32px, 4vw, 48px)', fontWeight: 900, letterSpacing: '-0.03em', lineHeight: 1 }}>
                {repo.repoName}
              </h1>
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: '0.6rem',
                fontSize: '1rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.12em',
                padding: '0.4rem 1rem', borderRadius: '10rem',
                background: repo.visibility === 'public' ? 'rgba(0,197,71,0.08)' : 'rgba(0,0,0,0.04)',
                color: repo.visibility === 'public' ? '#00b03f' : 'rgba(0,0,0,0.6)',
              }}>
                {repo.visibility === 'public' ? <Globe size={12} strokeWidth={2.5}/> : <Lock size={12} strokeWidth={2.5}/>}
                {repo.visibility}
              </span>
            </div>
            <p style={{ color: 'rgba(0,0,0,0.5)', fontSize: '1.6rem', fontWeight: 500, marginBottom: '1.2rem' }}>
              {repo.description || 'No description provided.'}
            </p>
            <p style={{ color: 'rgba(0,0,0,0.4)', fontSize: '1.3rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
              <User size={14} /> @{repo.owner?.username}
            </p>
          </div>

          {latestCommit && (
            <div style={{
              background: '#fff', border: '1px solid rgba(0,0,0,0.08)', borderRadius: '0.4rem', padding: '1.6rem 2.4rem',
              minWidth: '280px', display: 'flex', flexDirection: 'column', gap: '0.4rem'
            }}>
              <p style={{ fontSize: '1rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'rgba(0,0,0,0.4)' }}>Latest commit</p>
              <p style={{ fontSize: '1.4rem', fontWeight: 600, color: '#111' }}>"{latestCommit.message}"</p>
              <p style={{ fontSize: '1.2rem', color: 'rgba(0,0,0,0.5)', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '0.6rem', marginTop: '0.4rem' }}>
                <GitCommit size={14} /> {latestCommit.uploader?.username} &middot; {new Date(latestCommit.createdAt).toLocaleDateString()}
              </p>
            </div>
          )}
        </div>
      </motion.div>

      {/* CLI hint */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1, ease: EXPO }}
        style={{
          background: '#111', color: '#fff', padding: '1.6rem 2.4rem', borderRadius: '0.4rem', marginBottom: '4.8rem',
          display: 'flex', alignItems: 'center', gap: '1.6rem', fontSize: '1.4rem', fontFamily: 'monospace'
        }}>
        <Code2 size={20} color="#00e853" />
        <span><span style={{ color: '#00e853' }}>dev</span> init {id} &nbsp;&nbsp;&rarr;&nbsp;&nbsp; <span style={{ color: '#00e853' }}>dev</span> push -m "my changes"</span>
      </motion.div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '0.8rem', borderBottom: '2px solid rgba(0,0,0,0.05)', marginBottom: '3.2rem' }}>
        {[['code', 'Code', Code2], ['commits', `Commits (${commits.length})`, GitCommit]].map(([key, label, Icon]) => (
          <button key={key} onClick={() => setActiveTab(key)}
            style={{
              display: 'flex', alignItems: 'center', gap: '0.8rem',
              padding: '1.2rem 2.4rem', fontSize: '1.2rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em',
              background: activeTab === key ? '#111' : 'transparent',
              color: activeTab === key ? '#fff' : 'rgba(0,0,0,0.4)',
              border: 'none', borderRadius: '0.4rem 0.4rem 0 0', cursor: 'pointer', transition: 'all 0.2s',
              transform: activeTab === key ? 'translateY(2px)' : 'none'
            }}
            onMouseEnter={e => { if (activeTab !== key) e.currentTarget.style.color = '#111'; }}
            onMouseLeave={e => { if (activeTab !== key) e.currentTarget.style.color = 'rgba(0,0,0,0.4)'; }}
          >
            <Icon size={16} strokeWidth={2.5} /> {label}
          </button>
        ))}
      </div>

      {/* Code Tab */}
      {activeTab === 'code' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
          {noCode ? (
            <div style={{ textAlign: 'center', padding: '8rem 2rem', background: '#fff', border: '1px dashed rgba(0,0,0,0.1)', borderRadius: '0.4rem' }}>
              <Code2 size={48} color="rgba(0,0,0,0.1)" strokeWidth={1.5} style={{ margin: '0 auto 2.4rem' }} />
              <h3 style={{ fontSize: '2rem', fontWeight: 800, color: '#111', marginBottom: '0.8rem' }}>No code yet</h3>
              <p style={{ color: 'rgba(0,0,0,0.5)', fontSize: '1.6rem', fontWeight: 500, marginBottom: '3.2rem' }}>Push your first commit using the DevCollab CLI</p>
              <div style={{ display: 'inline-block', background: '#111', color: '#fff', fontFamily: 'monospace', fontSize: '1.4rem', padding: '1.6rem 2.4rem', borderRadius: '0.4rem' }}>
                <span style={{ color: '#00e853' }}>dev</span> init {id} &nbsp;&&&&nbsp; <span style={{ color: '#00e853' }}>dev</span> push -m "Initial commit"
              </div>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '2.4rem', '@media (min-width: 1024px)': { gridTemplateColumns: '300px 1fr' } }} className="repo-grid">
              <style>{`@media (min-width: 1024px) { .repo-grid { grid-template-columns: 320px 1fr !important; } }`}</style>
              
              {/* File Tree */}
              <div style={{ background: '#fff', border: '1px solid rgba(0,0,0,0.08)', borderRadius: '0.4rem', padding: '1.6rem', alignSelf: 'start', position: 'sticky', top: '10rem' }}>
                <p style={{ fontSize: '1rem', fontWeight: 800, color: 'rgba(0,0,0,0.3)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '1.6rem', paddingLeft: '1.2rem' }}>Files</p>
                {tree.map(node => (
                  <TreeNode key={node.path} node={node} onFileClick={handleFileClick} />
                ))}
              </div>

              {/* Code Viewer */}
              <div style={{ background: '#fff', border: '1px solid rgba(0,0,0,0.08)', borderRadius: '0.4rem', overflow: 'hidden' }}>
                {selectedFile ? (
                  <>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.2rem', padding: '1.6rem 2.4rem', borderBottom: '1px solid rgba(0,0,0,0.05)', background: 'rgba(0,0,0,0.01)' }}>
                      <span style={{ fontSize: '1.6rem' }}>{fileIcon(selectedFile.name)}</span>
                      <span style={{ fontSize: '1.4rem', fontWeight: 600, color: '#111' }}>{selectedFile.path}</span>
                    </div>
                    {loadingFile ? (
                      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '30rem' }}>
                        <div style={{ width: 32, height: 32, borderRadius: '50%', border: '2px solid rgba(0,197,71,0.1)', borderTopColor: '#00c547', animation: 'spin 0.8s linear infinite' }} />
                      </div>
                    ) : (
                      <pre style={{ padding: '2.4rem', fontSize: '1.3rem', color: '#111', fontFamily: 'monospace', lineHeight: 1.6, overflowX: 'auto', overflowY: 'auto', maxHeight: '70vh', whiteSpace: 'pre-wrap', margin: 0 }}>
                        {fileContent}
                      </pre>
                    )}
                  </>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '40rem', color: 'rgba(0,0,0,0.3)' }}>
                    <FileText size={48} strokeWidth={1} style={{ marginBottom: '1.6rem' }} />
                    <p style={{ fontSize: '1.6rem', fontWeight: 500 }}>Select a file to view its contents</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </motion.div>
      )}

      {/* Commits Tab */}
      {activeTab === 'commits' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }} style={{ display: 'flex', flexDirection: 'column', gap: '1.6rem' }}>
          {commits.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '8rem 2rem', background: '#fff', border: '1px dashed rgba(0,0,0,0.1)', borderRadius: '0.4rem', color: 'rgba(0,0,0,0.4)', fontSize: '1.6rem', fontWeight: 500 }}>
              No commits yet.
            </div>
          ) : commits.map((c, i) => (
            <div key={c._id} style={{ display: 'flex', alignItems: 'flex-start', gap: '2.4rem', background: '#fff', padding: '2.4rem', border: '1px solid rgba(0,0,0,0.08)', borderRadius: '0.4rem', transition: 'border-color 0.2s, transform 0.2s' }} onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(0,197,71,0.3)'; e.currentTarget.style.transform = 'translateX(4px)'; }} onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(0,0,0,0.08)'; e.currentTarget.style.transform = 'none'; }}>
              <div style={{ background: 'rgba(0,197,71,0.08)', color: '#00c547', padding: '1.2rem', borderRadius: '50%', flexShrink: 0 }}>
                <GitCommit size={20} strokeWidth={2.5} />
              </div>
              <div style={{ flexGrow: 1, minWidth: 0 }}>
                <p style={{ fontSize: '1.6rem', fontWeight: 700, color: '#111', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginBottom: '0.8rem' }}>"{c.message}"</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '2.4rem', fontSize: '1.2rem', color: 'rgba(0,0,0,0.5)', fontWeight: 600 }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}><User size={14}/>{c.uploader?.username || 'unknown'}</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}><Clock size={14}/>{new Date(c.createdAt).toLocaleString()}</span>
                </div>
              </div>
              <span style={{ fontSize: '1.3rem', color: 'rgba(0,0,0,0.3)', fontFamily: 'monospace', fontWeight: 600, flexShrink: 0 }}>{c._id.slice(-7)}</span>
            </div>
          ))}
        </motion.div>
      )}
    </div>
  );
};

export default RepositoryDetails;
