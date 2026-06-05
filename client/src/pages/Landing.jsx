import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  motion, useScroll, useTransform, useSpring,
  useInView, AnimatePresence, useMotionValue, useMotionTemplate,
} from 'framer-motion';

/* ─── EASING ─────────────────────────────── */
const EXPO  = [0.16, 1, 0.3, 1];
const QUINT = [0.22, 1, 0.36, 1];

/* ─── SPLIT-LETTER HEADING ───────────────── */
/* Each letter gets its own hover: 3D flip + color + stagger */
const SplitHover = ({ text, baseColor = '#111', hoverColor = '#00c547', size = '9vw', weight = 900, style = {} }) => {
  const [hovered, setHovered] = useState(null);
  const letters = text.split('');

  return (
    <span
      style={{
        display: 'inline-flex', flexWrap: 'wrap',
        fontSize: size, fontWeight: weight,
        letterSpacing: '-0.04em', lineHeight: 1.05,
        textTransform: 'lowercase',
        perspective: '600px',
        ...style,
      }}
    >
      {letters.map((ch, i) => (
          <motion.span
            key={i}
            onMouseEnter={() => setHovered(i)}
            onMouseLeave={() => setHovered(null)}
            initial={{ color: baseColor, rotateY: 0, y: 0, scaleX: 1, textShadow: 'none' }}
            animate={{
              color: hovered === i ? hoverColor
                : hovered !== null && Math.abs(hovered - i) === 1 ? (hoverColor + 'aa')
                : baseColor,
              rotateY: hovered === i ? [0, -15, 15, 0] : 0,
              y: hovered === i ? [-8, 0] : 0,
              scaleX: hovered === i ? [1, 1.15, 1] : 1,
              textShadow: hovered === i
                ? `3px 0 ${hoverColor}55, -3px 0 rgba(255,0,80,0.2)`
                : 'none',
            }}
          transition={{
            duration: 0.35,
            delay: hovered !== null ? Math.abs(hovered - i) * 0.018 : 0,
            ease: EXPO,
          }}
          style={{
            display: 'inline-block',
            whiteSpace: 'pre',
            transformOrigin: '50% 100%',
            cursor: 'default',
          }}
        >
          {ch}
        </motion.span>
      ))}
    </span>
  );
};

/* ─── WORD WAVE HEADING (hero) ───────────── */
/* Words slide up on load with stagger */
const WordReveal = ({ text, delay = 0, color = '#111', size = '13vw' }) => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-40px' });
  const words = text.split(' ');
  return (
    <div ref={ref} style={{ overflow: 'hidden', display: 'block' }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0 0.28em' }}>
        {words.map((w, i) => (
          <span key={i} style={{ overflow: 'hidden', display: 'inline-block' }}>
            <motion.span
              style={{
                display: 'inline-block',
                fontSize: size,
                fontWeight: 900,
                letterSpacing: '-0.05em',
                lineHeight: 0.92,
                color,
              }}
              initial={{ y: '115%', rotateX: 18, opacity: 0 }}
              animate={inView ? { y: '0%', rotateX: 0, opacity: 1 } : {}}
              transition={{ duration: 0.9, delay: delay + i * 0.08, ease: EXPO }}
            >
              {w}
            </motion.span>
          </span>
        ))}
      </div>
    </div>
  );
};

/* ─── LINE REVEAL ────────────────────────── */
const LineReveal = ({ children, delay = 0, style = {} }) => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-40px' });
  return (
    <div ref={ref} style={{ overflow: 'hidden', ...style }}>
      <motion.div
        initial={{ y: '120%', skewY: 3 }}
        animate={inView ? { y: '0%', skewY: 0 } : {}}
        transition={{ duration: 0.9, delay, ease: EXPO }}
      >{children}</motion.div>
    </div>
  );
};

/* ─── FADE IN ────────────────────────────── */
const FadeIn = ({ children, delay = 0, y = 40, blur = false, style = {} }) => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-40px' });
  return (
    <motion.div ref={ref} style={style}
      initial={{ opacity: 0, y, filter: blur ? 'blur(14px)' : 'none' }}
      animate={inView ? { opacity: 1, y: 0, filter: 'blur(0px)' } : {}}
      transition={{ duration: 0.9, delay, ease: QUINT }}
    >{children}</motion.div>
  );
};

/* ─── MAGNETIC ───────────────────────────── */
const Magnetic = ({ children, to, style = {}, ...rest }) => {
  const ref = useRef(null);
  const x = useMotionValue(0); const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 300, damping: 18 });
  const sy = useSpring(y, { stiffness: 300, damping: 18 });
  const onMove = (e) => {
    const r = ref.current.getBoundingClientRect();
    x.set((e.clientX - r.left - r.width / 2) * 0.35);
    y.set((e.clientY - r.top - r.height / 2) * 0.35);
  };
  const onLeave = () => { x.set(0); y.set(0); };
  const Comp = to ? motion(Link) : motion.div;
  return (
    <Comp ref={ref} to={to} data-hover
      style={{ x: sx, y: sy, display: 'inline-block', ...style }}
      onMouseMove={onMove} onMouseLeave={onLeave}
      whileHover={{ scale: 1.06 }} whileTap={{ scale: 0.94 }}
      transition={{ type: 'spring', stiffness: 400, damping: 20 }}
      {...rest}
    >{children}</Comp>
  );
};

/* ─── 3D TILT ────────────────────────────── */
const Tilt = ({ children, style = {} }) => {
  const ref = useRef(null);
  const rx = useMotionValue(0); const ry = useMotionValue(0);
  const srx = useSpring(rx, { stiffness: 200, damping: 20 });
  const sry = useSpring(ry, { stiffness: 200, damping: 20 });
  const onMove = (e) => {
    const r = ref.current.getBoundingClientRect();
    ry.set(((e.clientX - r.left) / r.width - 0.5) * 14);
    rx.set(-((e.clientY - r.top) / r.height - 0.5) * 14);
  };
  const onLeave = () => { rx.set(0); ry.set(0); };
  const transform = useMotionTemplate`perspective(600px) rotateX(${srx}deg) rotateY(${sry}deg)`;
  return (
    <motion.div ref={ref} onMouseMove={onMove} onMouseLeave={onLeave}
      style={{ transform, transformStyle: 'preserve-3d', ...style }}
    >{children}</motion.div>
  );
};

/* ─── PRELOADER ──────────────────────────── */
const Preloader = ({ onComplete }) => {
  const [count, setCount] = useState(0);
  const [exit, setExit] = useState(false);
  useEffect(() => {
    let frame, start = null;
    const tick = (ts) => {
      if (!start) start = ts;
      const t = Math.min((ts - start) / 1600, 1);
      setCount(Math.floor((1 - Math.pow(1 - t, 4)) * 100));
      if (t < 1) frame = requestAnimationFrame(tick);
      else setTimeout(() => { setExit(true); setTimeout(onComplete, 800); }, 150);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [onComplete]);
  return (
    <AnimatePresence>
      {!exit && (
        <motion.div key="pre"
          exit={{ clipPath: 'inset(0 0 100% 0)' }}
          transition={{ duration: 0.75, ease: EXPO }}
          style={{
            position: 'fixed', inset: 0, zIndex: 9999, background: '#f5f7fa',
            display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between',
            padding: '3rem 5rem',
          }}>
          <motion.span exit={{ y: -20, opacity: 0 }} transition={{ duration: 0.3 }}
            style={{ fontSize: '15px', fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(0,0,0,0.2)' }}>
            loading experience
          </motion.span>
          <span style={{ fontSize: 'clamp(100px, 22vw, 260px)', fontWeight: 900, letterSpacing: '-0.06em', color: '#111', lineHeight: 0.85, fontFamily: "'Space Grotesk',sans-serif" }}>
            {count}
          </span>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

/* ─── CURSOR ─────────────────────────────── */
const Cursor = () => {
  const x = useMotionValue(-100); const y = useMotionValue(-100);
  const sx = useSpring(x, { stiffness: 600, damping: 35 });
  const sy = useSpring(y, { stiffness: 600, damping: 35 });
  const [big, setBig] = useState(false);
  useEffect(() => {
    const mv = (e) => { x.set(e.clientX); y.set(e.clientY); };
    const ov = (e) => setBig(!!e.target.closest('a,button,[data-hover]'));
    window.addEventListener('mousemove', mv);
    window.addEventListener('mouseover', ov);
    return () => { window.removeEventListener('mousemove', mv); window.removeEventListener('mouseover', ov); };
  }, [x, y]);
  return (
    <motion.div style={{
      position: 'fixed', top: 0, left: 0, zIndex: 9998, pointerEvents: 'none',
      x: sx, y: sy, translateX: '-50%', translateY: '-50%',
      width: big ? 60 : 12, height: big ? 60 : 12, borderRadius: '50%',
      background: big ? 'rgba(0,197,71,0.08)' : 'rgba(0,197,71,0.55)',
      border: big ? '2px solid rgba(0,197,71,0.5)' : 'none',
      transition: 'width 0.25s, height 0.25s, background 0.25s, border 0.25s',
      mixBlendMode: 'multiply',
    }} />
  );
};

/* ─── SIGNATURE SVG ──────────────────────── */
const Signature = ({ animate: doAnim = false, delay = 0 }) => (
  <svg viewBox="0 0 220 260" fill="none" style={{ width: '100%', height: '100%' }}>
    {[
      { d: 'M30 180 C40 80,120 20,160 60 C200 100,180 160,140 180 C100 200,60 185,50 165 C40 145,70 110,110 105 C150 100,185 120,190 145', w: 7 },
      { d: 'M155 65 C170 30,200 25,205 50 C210 75,185 95,165 88', w: 7 },
      { d: 'M60 220 C75 210,100 208,120 215 C140 222,155 235,145 245', w: 5 },
    ].map((p, i) => (
      <motion.path key={i} d={p.d} stroke="#00e853" strokeWidth={p.w}
        strokeLinecap="round" strokeLinejoin="round" fill="none"
        initial={doAnim ? { pathLength: 0, opacity: 0 } : undefined}
        animate={doAnim ? { pathLength: 1, opacity: 1 } : undefined}
        transition={doAnim ? {
          pathLength: { duration: 1.4, delay: delay + i * 0.25, ease: EXPO },
          opacity: { duration: 0.3, delay: delay + i * 0.25 },
        } : undefined}
      />
    ))}
  </svg>
);

/* ─── SCAN LINES ─────────────────────────── */
const ScanLines = () => (
  <div aria-hidden style={{
    position: 'fixed', inset: 0, zIndex: 50, pointerEvents: 'none',
    backgroundImage: 'repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(0,0,0,0.018) 2px,rgba(0,0,0,0.018) 4px)',
    mixBlendMode: 'multiply',
  }} />
);

/* ─── PROJECT DATA ───────────────────────── */
const PROJECTS = [
  {
    id: 'devcollab', name: 'devcollab', year: '2026', tag: 'platform',
    bg: 'linear-gradient(145deg,#0d1117,#161b22 40%,#1c2733)',
    desc: 'A full-stack developer collaboration platform — CLI tools, pull requests, issue tracking, and SaaS billing.',
    to: '/register', cta: 'START BUILDING',
    lines: [
      { p: true, t: 'dev login' }, { t: '✓ Authenticated as @you', c: '#00e853' },
      { p: true, t: 'dev push -m "ship it"' }, { t: 'Compressing 48 files...', c: 'rgba(255,255,255,0.4)' },
      { t: '✓ Code pushed [abc1234]', c: '#00e853' },
    ],
  },
  {
    id: 'cli', name: 'dev cli', year: '2026', tag: 'tooling',
    bg: 'linear-gradient(145deg,#0f1923,#1a2a1a)',
    desc: 'Your own `dev` command. Push code, init repos, authenticate — all from terminal with one binary.',
    to: '/register', cta: 'GET CLI ACCESS',
    lines: [
      { t: '# Install the DevCollab CLI', c: 'rgba(255,255,255,0.35)' },
      { p: true, t: 'npm install -g devcollab-cli' }, { t: '✓ Installed devcollab@1.0.0', c: '#00e853' },
      { p: true, t: 'dev --version' }, { t: 'devcollab-cli 1.0.0', c: 'rgba(255,255,255,0.6)' },
    ],
  },
  {
    id: 'pr', name: 'pull requests', year: '2026', tag: 'workflow',
    bg: 'linear-gradient(145deg,#1a1a2e,#16213e 50%,#0f3460)',
    desc: 'Submit, review, approve, reject, and merge code changes. Full PR workflow built into the platform.',
    to: '/register', cta: 'EXPLORE WORKFLOW',
    lines: [
      { p: true, t: 'dev pr create --title "feat: dark mode"' }, { t: '✓ PR #14 created', c: '#00e853' },
      { t: 'Status: open · Reviewers: 2', c: 'rgba(255,255,255,0.4)' },
      { p: true, t: 'dev pr merge 14' }, { t: '✓ Merged into main', c: '#00e853' },
    ],
  },
  {
    id: 'issues', name: 'issue tracking', year: '2026', tag: 'management',
    bg: 'linear-gradient(145deg,#1a0f2e,#2a1a1a)',
    desc: 'Create, assign, and track issues. Open → In Progress → Closed with team assignment and priority.',
    to: '/register', cta: 'TRACK ISSUES',
    lines: [
      { p: true, t: 'dev issue create "Fix login bug"' }, { t: '✓ Issue #7 opened', c: '#00e853' },
      { t: 'Assigned to: @alice', c: 'rgba(255,255,255,0.4)' },
      { p: true, t: 'dev issue status 7' }, { t: 'open → in progress', c: 'rgba(255,255,255,0.5)' },
    ],
  },
  {
    id: 'billing', name: 'free → pro → team', year: '2026', tag: 'billing',
    bg: 'linear-gradient(145deg,#0a1628,#0f2a1a)',
    desc: 'Transparent SaaS pricing. Free tier always available. Scale to Pro or Team for unlimited everything.',
    to: '/pricing', cta: 'VIEW PLANS',
    lines: [
      { t: '# Available plans', c: 'rgba(255,255,255,0.35)' },
      { t: 'free    $0       3 repos, 10 pushes/mo', c: '#00e853' },
      { t: 'pro     $9/mo    Unlimited repos', c: '#00e853' },
      { t: 'team    $29/mo   Unlimited everything', c: '#00e853' },
    ],
  },
];

/* ─── TERMINAL PANEL ─────────────────────── */
const Terminal = ({ project }) => (
  <Tilt style={{ width: '88%', maxWidth: 660 }}>
    <motion.div
      key={project.id}
      initial={{ opacity: 0, y: 60, scale: 0.93, filter: 'blur(14px)' }}
      animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
      exit={{ opacity: 0, y: -40, scale: 0.93, filter: 'blur(10px)' }}
      transition={{ duration: 0.65, ease: EXPO }}
      style={{
        fontFamily: "'Fira Code','Cascadia Code',monospace",
        padding: '32px', border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: '16px', background: 'rgba(0,0,0,0.52)',
        backdropFilter: 'blur(28px)', boxShadow: '0 36px 100px rgba(0,0,0,0.55)',
      }}
    >
      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', alignItems: 'center' }}>
        {['#ff5f57','#febc2e','#28c840'].map(c => (
          <motion.div key={c} whileHover={{ scale: 1.5 }}
            style={{ width: 13, height: 13, borderRadius: '50%', background: c }} />
        ))}
        <span style={{ marginLeft: 'auto', color: 'rgba(255,255,255,0.15)', fontSize: '14px' }}>bash — devcollab</span>
      </div>
      {project.lines.map((l, i) => (
        <motion.div key={i}
          initial={{ opacity: 0, x: -16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.12 + i * 0.07, duration: 0.5, ease: QUINT }}
          style={{ fontSize: '15px', marginBottom: '6px', lineHeight: 1.7 }}
        >
          {l.p
            ? <><span style={{ color: '#00e853' }}>$</span> <span style={{ color: 'rgba(255,255,255,0.88)' }}>{l.t}</span></>
            : <span style={{ color: l.c }}>&nbsp;&nbsp;{l.t}</span>}
        </motion.div>
      ))}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
        transition={{ delay: 0.12 + project.lines.length * 0.07 }}
        style={{ marginTop: '16px', fontSize: '15px', color: '#00e853' }}
      >
        $ <motion.span
          animate={{ opacity: [1, 0] }}
          transition={{ duration: 0.8, repeat: Infinity, repeatType: 'reverse' }}
          style={{ display: 'inline-block', width: 10, height: 17, background: '#00e853', verticalAlign: 'middle', borderRadius: 2 }}
        />
      </motion.div>
    </motion.div>
  </Tilt>
);

/* ─── RIGHT PANEL ────────────────────────── */
const RightPanel = ({ project }) => {
  const mx = useMotionValue(0.5); const my = useMotionValue(0.5);
  const bgX = useSpring(useTransform(mx, [0,1], [-25,25]), { stiffness: 60, damping: 20 });
  const bgY = useSpring(useTransform(my, [0,1], [-25,25]), { stiffness: 60, damping: 20 });
  return (
    <div
      onMouseMove={(e) => {
        const r = e.currentTarget.getBoundingClientRect();
        mx.set((e.clientX - r.left) / r.width);
        my.set((e.clientY - r.top) / r.height);
      }}
      style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}
    >
      <motion.div style={{ position: 'absolute', inset: '-30px', background: project.bg, x: bgX, y: bgY }} />
      <motion.div
        style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 1, mixBlendMode: 'screen' }}
        animate={{ background: [
          'radial-gradient(ellipse at 25% 25%,rgba(0,232,83,0.07) 0%,transparent 55%)',
          'radial-gradient(ellipse at 75% 75%,rgba(0,100,255,0.05) 0%,transparent 55%)',
          'radial-gradient(ellipse at 25% 25%,rgba(0,232,83,0.07) 0%,transparent 55%)',
        ]}}
        transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
      />
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 2, backgroundImage: 'repeating-linear-gradient(0deg,transparent,transparent 3px,rgba(255,255,255,0.01) 3px,rgba(255,255,255,0.01) 6px)' }} />
      <div style={{ position: 'relative', zIndex: 3 }}>
        <AnimatePresence mode="wait">
          <Terminal project={project} key={project.id} />
        </AnimatePresence>
      </div>
      <motion.div
        key={project.id + '-info'}
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.6, ease: QUINT }}
        style={{
          position: 'absolute', bottom: '32px', left: '40px', right: '40px', zIndex: 3,
          borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '20px',
          display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end',
        }}
      >
        <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '14px', maxWidth: 320, lineHeight: 1.75 }}>{project.desc}</p>
        <Magnetic to={project.to} style={{
          color: '#00e853', textDecoration: 'none', fontSize: '13px', fontWeight: 700,
          letterSpacing: '0.15em', border: '1px solid rgba(0,232,83,0.3)', padding: '10px 22px',
          borderRadius: '8px', background: 'transparent', fontFamily: 'inherit', whiteSpace: 'nowrap',
          transition: 'background 0.25s, border-color 0.25s',
        }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(0,232,83,0.12)'; e.currentTarget.style.borderColor = '#00e853'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'rgba(0,232,83,0.3)'; }}
        >{project.cta}</Magnetic>
      </motion.div>
    </div>
  );
};

/* ══════════════════════════════════════════
   ★  LANDING PAGE  ★
══════════════════════════════════════════ */
const Landing = () => {
  const [loaded, setLoaded] = useState(false);
  const [activeIdx, setActiveIdx] = useState(0);
  const [hoverIdx, setHoverIdx]   = useState(null);
  const sectionRef  = useRef(null);
  const projectRefs = useRef([]);
  const heroRef     = useRef(null);
  const display = hoverIdx !== null ? hoverIdx : activeIdx;
  const onLoaded = useCallback(() => setLoaded(true), []);

  /* hero parallax */
  const { scrollYProgress: hScroll } = useScroll({ target: heroRef, offset: ['start start','end start'] });
  const hY  = useTransform(hScroll, [0,1], ['0%','30%']);
  const hOp = useTransform(hScroll, [0,0.55], [1,0]);
  const hSc = useTransform(hScroll, [0,1], [1,0.9]);

  /* scroll spy */
  useEffect(() => {
    const fn = () => {
      const vh = window.innerHeight;
      projectRefs.current.forEach((el, i) => {
        if (!el) return;
        const r = el.getBoundingClientRect();
        if (r.top + r.height / 2 < vh * 0.65 && r.top + r.height / 2 > vh * 0.1) setActiveIdx(i);
      });
    };
    window.addEventListener('scroll', fn, { passive: true });
    return () => window.removeEventListener('scroll', fn);
  }, []);

  return (
    <div id="landing-page" style={{
      background: '#f5f7fa', color: '#111', minHeight: '100vh',
      fontFamily: "'Space Grotesk','Inter',sans-serif",
      fontSize: '16px', cursor: 'none', overflowX: 'clip',
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;700;900&display=swap');
        @keyframes marquee { from{transform:translateX(0)} to{transform:translateX(-50%)} }
        #landing-page,#landing-page *,#landing-page a,#landing-page button{ cursor:none!important }
      `}</style>

      <Preloader onComplete={onLoaded} />
      <ScanLines />
      <Cursor />

      {/* ══ HERO ══════════════════════════════ */}
      <motion.section ref={heroRef} style={{
        height: '100vh', display: 'flex', flexDirection: 'column',
        justifyContent: 'flex-end', padding: '0 7vw 7vh',
        position: 'relative', borderBottom: '1px solid rgba(0,0,0,0.06)',
        overflow: 'hidden', opacity: hOp, scale: hSc,
      }}>
        {/* BG parallax text */}
        <motion.div aria-hidden style={{
          position: 'absolute', top: '50%', left: '50%', x: '-50%', y: hY,
          fontSize: 'clamp(160px,28vw,440px)', fontWeight: 900,
          letterSpacing: '-0.06em', color: 'rgba(0,0,0,0.03)', whiteSpace: 'nowrap',
          pointerEvents: 'none', lineHeight: 1,
        }}>dev</motion.div>

        {/* Signature */}
        <motion.div
          initial={{ opacity: 0, scale: 0.6, rotate: -15 }}
          animate={loaded ? { opacity: 0.9, scale: 1, rotate: 0 } : {}}
          transition={{ duration: 1.4, delay: 0.3, ease: EXPO }}
          style={{ position: 'absolute', top: '10%', right: '7%', width: 'clamp(140px,16vw,260px)', height: 'clamp(170px,20vw,320px)' }}
        >
          <Signature animate={loaded} delay={0.5} />
        </motion.div>

        {/* Content */}
        <div style={{ position: 'relative', zIndex: 2 }}>
          <motion.p
            initial={{ opacity: 0, y: 20, filter: 'blur(8px)' }}
            animate={loaded ? { opacity: 1, y: 0, filter: 'blur(0)' } : {}}
            transition={{ duration: 0.8, delay: 0.1, ease: QUINT }}
            style={{ fontSize: '15px', fontWeight: 700, letterSpacing: '0.22em', textTransform: 'uppercase', color: '#00c547', marginBottom: '3vh' }}
          >// developer collaboration platform</motion.p>

          {/* Big hero title */}
          <h1 style={{ marginBottom: '5vh', lineHeight: 0.9, display: 'flex', flexDirection: 'column' }}>
            {loaded && (
              <>
                <LineReveal delay={0.3} style={{ paddingBottom: '6px' }}>
                  <SplitHover text="where code" baseColor="#111" hoverColor="#00c547" size="clamp(60px,10vw,160px)" weight={900} />
                </LineReveal>
                <LineReveal delay={0.5} style={{ paddingBottom: '6px' }}>
                  <SplitHover text="moves" baseColor="#00c547" hoverColor="#111" size="clamp(60px,10vw,160px)" weight={900} />
                </LineReveal>
                <LineReveal delay={0.68} style={{ paddingBottom: '6px' }}>
                  <SplitHover text="forward." baseColor="#111" hoverColor="#00c547" size="clamp(60px,10vw,160px)" weight={900} />
                </LineReveal>
              </>
            )}
          </h1>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={loaded ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 1.05, ease: QUINT }}
            style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}
          >
            <Magnetic to="/register" id="hero-start" style={{
              padding: '16px 40px', background: '#111', color: '#fff',
              textDecoration: 'none', fontSize: '14px', fontWeight: 700,
              letterSpacing: '0.16em', textTransform: 'uppercase', borderRadius: '8px',
              border: 'none', fontFamily: 'inherit', transition: 'background 0.3s',
            }}
              onMouseEnter={e => e.currentTarget.style.background = '#00c547'}
              onMouseLeave={e => e.currentTarget.style.background = '#111'}
            >Start Building</Magnetic>
            <Magnetic to="/pricing" id="hero-plans" style={{
              padding: '16px 40px', background: 'transparent', color: '#111',
              textDecoration: 'none', fontSize: '14px', fontWeight: 700,
              letterSpacing: '0.16em', textTransform: 'uppercase',
              border: '1.5px solid rgba(0,0,0,0.18)', borderRadius: '8px',
              fontFamily: 'inherit', transition: 'border-color 0.3s',
            }}
              onMouseEnter={e => e.currentTarget.style.borderColor = '#111'}
              onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(0,0,0,0.18)'}
            >View Plans</Magnetic>
          </motion.div>
        </div>

        {/* Scroll line */}
        <motion.div initial={{ opacity: 0 }} animate={loaded ? { opacity: 1 } : {}}
          transition={{ delay: 1.5, duration: 0.8 }}
          style={{ position: 'absolute', bottom: '4vh', right: '7vw', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}
        >
          <motion.div
            animate={{ scaleY: [1,0.2,1], opacity: [0.5,0.1,0.5] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
            style={{ width: 1, height: '70px', transformOrigin: 'top', background: 'linear-gradient(180deg,transparent,rgba(0,0,0,0.3))' }}
          />
          <span style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.28em', textTransform: 'uppercase', color: 'rgba(0,0,0,0.2)' }}>scroll</span>
        </motion.div>
      </motion.section>

      {/* ══ MARQUEE ═══════════════════════════ */}
      <div style={{ overflow: 'hidden', padding: '16px 0', background: '#111', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
        <div style={{ display: 'flex', gap: '64px', whiteSpace: 'nowrap', animation: 'marquee 22s linear infinite' }}>
          {Array.from({ length: 10 }).map((_, i) => (
            <span key={i} style={{ fontSize: '13px', fontWeight: 700, letterSpacing: '0.3em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)', flexShrink: 0 }}>
              DEVCOLLAB &nbsp;·&nbsp; CLI TOOLS &nbsp;·&nbsp; PULL REQUESTS &nbsp;·&nbsp; ISSUE TRACKING &nbsp;·&nbsp; CODE BROWSER &nbsp;·&nbsp; SAAS BILLING &nbsp;·&nbsp;
            </span>
          ))}
        </div>
      </div>

      {/* ══ PROJECTS ══════════════════════════ */}
      <section ref={sectionRef} style={{ display: 'flex', position: 'relative' }}>

        {/* LEFT */}
        <div style={{ width: '50%', position: 'relative', zIndex: 2 }}>
          {PROJECTS.map((p, i) => (
            <div key={p.id} id={`project-${p.id}`}
              ref={el => projectRefs.current[i] = el}
              style={{
                padding: '8vh 7vw',
                minHeight: '100vh',
                display: 'flex', flexDirection: 'column', justifyContent: 'center',
                borderBottom: '1px solid rgba(0,0,0,0.04)',
                transition: 'background 0.4s',
                background: hoverIdx === i ? 'rgba(0,0,0,0.013)' : 'transparent',
              }}
              onMouseEnter={() => setHoverIdx(i)}
              onMouseLeave={() => setHoverIdx(null)}
            >
              {/* Tag + year */}
              <FadeIn y={14}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                  <motion.span
                    animate={{ color: activeIdx === i ? '#00c547' : 'rgba(0,0,0,0.18)' }}
                    transition={{ duration: 0.5 }}
                    style={{ fontSize: '13px', fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase' }}
                  >{p.tag}</motion.span>
                  <span style={{ fontSize: '13px', fontWeight: 700, letterSpacing: '0.2em', color: 'rgba(0,0,0,0.12)' }}>{p.year}</span>
                </div>
              </FadeIn>

              {/* ★ SPLIT-LETTER NAME with 3D hover per letter ★ */}
              <div style={{ position: 'relative', marginBottom: '4px' }}>
                {/* Signature pop on active */}
                <AnimatePresence>
                  {activeIdx === i && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.3, rotate: -20 }}
                      animate={{ opacity: 1, scale: 1, rotate: 0 }}
                      exit={{ opacity: 0, scale: 0.3, rotate: 20 }}
                      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                      style={{ position: 'absolute', top: '-18px', left: '60px', width: '75px', height: '95px', zIndex: 3, pointerEvents: 'none' }}
                    >
                      <Signature />
                    </motion.div>
                  )}
                </AnimatePresence>

                <motion.div
                  animate={{
                    filter: activeIdx === i ? 'blur(0px)' : 'blur(5px)',
                    opacity: activeIdx === i ? 1 : (hoverIdx === i ? 0.45 : 0.12),
                    x: activeIdx === i ? 12 : 0,
                  }}
                  transition={{ duration: 0.55, ease: EXPO }}
                >
                  <SplitHover
                    text={p.name}
                    baseColor={activeIdx === i ? '#111' : '#111'}
                    hoverColor="#00c547"
                    size="clamp(52px,8vw,120px)"
                  />
                </motion.div>
              </div>

              {/* CTA slides in */}
              <AnimatePresence>
                {activeIdx === i && (
                  <motion.div
                    initial={{ opacity: 0, y: 16, height: 0, marginTop: 0 }}
                    animate={{ opacity: 1, y: 0, height: 'auto', marginTop: '28px' }}
                    exit={{ opacity: 0, y: 10, height: 0, marginTop: 0 }}
                    transition={{ duration: 0.5, ease: EXPO }}
                    style={{ overflow: 'hidden' }}
                  >
                    <Magnetic to={p.to} style={{
                      fontSize: '14px', fontWeight: 700, letterSpacing: '0.18em',
                      textTransform: 'uppercase', textDecoration: 'none',
                      background: '#111', color: '#fff', padding: '12px 28px',
                      borderRadius: '8px', border: 'none', fontFamily: 'inherit', transition: 'background 0.3s',
                    }}
                      onMouseEnter={e => e.currentTarget.style.background = '#00c547'}
                      onMouseLeave={e => e.currentTarget.style.background = '#111'}
                    >{p.cta}</Magnetic>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>

        {/* RIGHT — sticky, full height */}
        <div style={{
          width: '50%', position: 'sticky', top: 0, height: '100vh',
          overflow: 'hidden', borderLeft: '1px solid rgba(0,0,0,0.05)',
          background: '#0d1117',
        }}>
          <AnimatePresence mode="wait">
            <RightPanel key={PROJECTS[display].id} project={PROJECTS[display]} />
          </AnimatePresence>
        </div>
      </section>

      {/* ══ DARK "BUT" SECTION ════════════════ */}
      <section style={{ background: '#111', padding: '14vh 7vw', overflow: 'hidden', position: 'relative' }}>
        <FadeIn y={0} blur>
          <div aria-hidden style={{
            position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)',
            fontSize: 'clamp(120px,22vw,340px)', fontWeight: 900,
            letterSpacing: '-0.06em', color: 'rgba(255,255,255,0.02)',
            whiteSpace: 'nowrap', pointerEvents: 'none', lineHeight: 1,
          }}>BUT</div>
        </FadeIn>
        <div style={{ position: 'relative', zIndex: 2, maxWidth: 900 }}>
          <FadeIn>
            <p style={{ fontSize: '13px', fontWeight: 700, letterSpacing: '0.22em', textTransform: 'uppercase', color: '#00c547', marginBottom: '28px' }}>
              // the problem
            </p>
          </FadeIn>

          {/* ★ SPLIT-LETTER in dark section ★ */}
          <h2 style={{ marginBottom: '48px', lineHeight: 0.92 }}>
            <LineReveal delay={0.1} style={{ paddingBottom: '6px' }}>
              <SplitHover text="I've always" baseColor="#fff" hoverColor="#00c547" size="clamp(52px,9vw,140px)" weight={900} />
            </LineReveal>
            <LineReveal delay={0.25} style={{ paddingBottom: '6px' }}>
              <SplitHover text="built things" baseColor="#00c547" hoverColor="#fff" size="clamp(52px,9vw,140px)" weight={900} />
            </LineReveal>
            <LineReveal delay={0.4} style={{ paddingBottom: '6px' }}>
              <SplitHover text="for builders." baseColor="#fff" hoverColor="#00c547" size="clamp(52px,9vw,140px)" weight={900} />
            </LineReveal>
          </h2>

          <FadeIn delay={0.4} y={30} blur>
            <p style={{ fontSize: '19px', color: 'rgba(255,255,255,0.32)', lineHeight: 1.85, maxWidth: 560, marginBottom: '48px' }}>
              Developer tools shouldn't require vendor lock-in, massive setup, or a corporate budget.
              DevCollab is a production-ready platform you can deploy and own yourself.
            </p>
          </FadeIn>
          <FadeIn delay={0.55} y={20}>
            <Magnetic to="/register" id="problem-cta" style={{
              padding: '18px 44px', background: '#00c547', color: '#111',
              textDecoration: 'none', fontSize: '15px', fontWeight: 800,
              letterSpacing: '0.18em', textTransform: 'uppercase', borderRadius: '8px',
              border: 'none', fontFamily: 'inherit', transition: 'background 0.3s',
            }}
              onMouseEnter={e => e.currentTarget.style.background = '#00e853'}
              onMouseLeave={e => e.currentTarget.style.background = '#00c547'}
            >Create Free Account</Magnetic>
          </FadeIn>
        </div>
      </section>

      {/* ══ STATS ═════════════════════════════ */}
      <section style={{
        background: '#f5f7fa',
        borderTop: '1px solid rgba(0,0,0,0.06)', borderBottom: '1px solid rgba(0,0,0,0.06)',
        padding: '8vh 7vw', display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '28px',
      }}>
        {[['100%','Custom Built'],['0','Vendor Lock-in'],['∞','Scale Limit'],['Free','To Start']].map(([val, label], idx) => (
          <FadeIn key={label} delay={idx * 0.1} y={40}>
            <Tilt>
              <div data-hover style={{ borderLeft: '2px solid rgba(0,0,0,0.06)', paddingLeft: '28px', paddingTop: '10px', paddingBottom: '10px' }}>
                <motion.div
                  initial={{ scale: 0.6, opacity: 0, filter: 'blur(8px)' }}
                  whileInView={{ scale: 1, opacity: 1, filter: 'blur(0px)' }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, delay: idx * 0.1, ease: EXPO }}
                  style={{ fontSize: 'clamp(52px,6vw,90px)', fontWeight: 900, letterSpacing: '-0.04em', color: '#00c547', lineHeight: 1, marginBottom: '10px' }}
                >{val}</motion.div>
                <div style={{ fontSize: '13px', fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(0,0,0,0.22)' }}>{label}</div>
              </div>
            </Tilt>
          </FadeIn>
        ))}
      </section>

      {/* ══ FOOTER ════════════════════════════ */}
      <FadeIn y={24}>
        <footer style={{
          background: '#111', padding: '5vh 7vw', display: 'flex',
          justifyContent: 'space-between', alignItems: 'center',
          borderTop: '1px solid rgba(255,255,255,0.04)',
        }}>
          <div>
            <div style={{ fontSize: '24px', fontWeight: 900, letterSpacing: '-0.03em', color: '#fff', marginBottom: '6px' }}>devcollab</div>
            <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.15)', letterSpacing: '0.1em' }}>© 2026 DevCollab. Built for builders.</div>
          </div>
          <div style={{ display: 'flex', gap: '48px' }}>
            {[{l:'Pricing',to:'/pricing'},{l:'Login',to:'/login'},{l:'Sign Up',to:'/register'}].map(({ l, to }) => (
              <Magnetic key={l} to={to} style={{
                color: 'rgba(255,255,255,0.22)', textDecoration: 'none',
                fontSize: '14px', fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase',
                background: 'none', border: 'none', fontFamily: 'inherit', transition: 'color 0.3s',
              }}
                onMouseEnter={e => e.currentTarget.style.color = '#00c547'}
                onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.22)'}
              >{l}</Magnetic>
            ))}
          </div>
        </footer>
      </FadeIn>
    </div>
  );
};

export default Landing;
