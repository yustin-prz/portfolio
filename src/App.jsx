import React, { useEffect, useRef, useState } from 'react';
import { data } from './data';
import './App.css';

/* Reveals an element the first time it scrolls into view */
function useInView(threshold = 0.15) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } }, { threshold });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [threshold]);
  return [ref, visible];
}

/* Typewriter that types/deletes through a list of phrases */
function useTypewriter(words, { typeSpeed = 70, deleteSpeed = 40, pause = 1700 } = {}) {
  const [text, setText] = useState('');
  const [index, setIndex] = useState(0);
  const [deleting, setDeleting] = useState(false);
  useEffect(() => {
    if (!words || words.length === 0) return undefined;
    const word = words[index % words.length];
    if (!deleting && text === word) {
      const t = setTimeout(() => setDeleting(true), pause);
      return () => clearTimeout(t);
    }
    if (deleting && text === '') {
      setDeleting(false);
      setIndex(i => i + 1);
      return undefined;
    }
    const t = setTimeout(() => {
      setText(deleting ? word.slice(0, text.length - 1) : word.slice(0, text.length + 1));
    }, deleting ? deleteSpeed : typeSpeed);
    return () => clearTimeout(t);
  }, [text, deleting, index, words, typeSpeed, deleteSpeed, pause]);
  return text;
}

/* Counts up from 0 to `value` the first time it enters the viewport */
function Counter({ value, prefix = '', suffix = '', duration = 1600 }) {
  const [ref, visible] = useInView(0.4);
  const [n, setN] = useState(0);
  useEffect(() => {
    if (!visible) return undefined;
    let raf;
    const start = performance.now();
    const tick = now => {
      const p = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setN(Math.round(eased * value));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [visible, value, duration]);
  return <span ref={ref}>{prefix}{n}{suffix}</span>;
}

function Section({ num, label, children }) {
  const [ref, visible] = useInView();
  return (
    <section ref={ref} className={`section ${visible ? 'section--visible' : ''}`}>
      <div className="section-header">
        <span className="section-num">{num}</span>
        <span className="section-label">{label}</span>
        <div className="section-line" />
      </div>
      {children}
    </section>
  );
}

export default function App() {
  const [activeNav, setActiveNav] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const [progress, setProgress] = useState(0);
  const [projectFilter, setProjectFilter] = useState('All');
  const [recruiterMode, setRecruiterMode] = useState(false);

  const typed = useTypewriter(data.heroRoles);

  useEffect(() => {
    const handler = () => {
      const sections = ['about', 'impact', 'experience', 'projects', 'skills', 'certifications', 'contact'];
      for (const id of sections) {
        const el = document.getElementById(id);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= 120 && rect.bottom >= 120) { setActiveNav(id); break; }
        }
      }
      const doc = document.documentElement;
      const max = doc.scrollHeight - doc.clientHeight;
      setProgress(max > 0 ? (doc.scrollTop / max) * 100 : 0);
    };
    window.addEventListener('scroll', handler, { passive: true });
    handler();
    return () => window.removeEventListener('scroll', handler);
  }, []);

  const navLinks = [
    { id: 'about', label: 'About' },
    { id: 'impact', label: 'Impact' },
    { id: 'experience', label: 'Experience' },
    { id: 'projects', label: 'Projects' },
    { id: 'skills', label: 'Skills' },
    { id: 'certifications', label: 'Certs' },
    { id: 'contact', label: 'Contact' },
  ];

  const filters = ['All', ...data.projectFilters];
  const filteredProjects = data.projects.filter(p => {
    if (projectFilter === 'All') return true;
    if (projectFilter === 'In Progress') return p.inProgress;
    return p.category === projectFilter;
  });

  const r = data.recruiterSummary;

  return (
    <div className={`app ${recruiterMode ? 'app--recruiter' : ''}`}>
      {/* NAV */}
      <nav className="nav">
        <a href="#hero" className="nav-logo">Y<span className="nav-logo-accent">.</span>Pérez</a>
        <div className="nav-links">
          {navLinks.map(l => (
            <a key={l.id} href={`#${l.id}`} className={`nav-link ${activeNav === l.id ? 'nav-link--active' : ''}`}>{l.label}</a>
          ))}
          <button
            className={`nav-recruiter ${recruiterMode ? 'nav-recruiter--active' : ''}`}
            onClick={() => setRecruiterMode(v => !v)}
          >
            {recruiterMode ? '✕ Close' : '★ Recruiter view'}
          </button>
        </div>
        <button className="nav-menu-btn" onClick={() => setMenuOpen(!menuOpen)} aria-label="Menu">
          <span /><span /><span />
        </button>
        {menuOpen && (
          <div className="nav-mobile">
            {navLinks.map(l => (
              <a key={l.id} href={`#${l.id}`} className="nav-mobile-link" onClick={() => setMenuOpen(false)}>{l.label}</a>
            ))}
            <button
              className="nav-mobile-link nav-mobile-recruiter"
              onClick={() => { setRecruiterMode(v => !v); setMenuOpen(false); }}
            >
              {recruiterMode ? '✕ Close recruiter view' : '★ Recruiter view'}
            </button>
          </div>
        )}
        <div className="nav-progress" style={{ width: `${progress}%` }} />
      </nav>

      {/* HERO */}
      <div id="hero" className="hero">
        <div className="hero-glow" />
        <div className="hero-glow hero-glow--two" />
        <div className="hero-grid" />
        <div className="hero-content">
          <div className="hero-badge">
            <span className="hero-dot" />
            Open to opportunities · Costa Rica
          </div>
          <h1 className="hero-name">
            {data.name.split(' ').slice(0, 2).join(' ')}<br />
            <span className="hero-name-accent">{data.name.split(' ').slice(2).join(' ')}</span>
          </h1>
          <p className="hero-title">{data.title}</p>
          <p className="hero-type">
            <span className="hero-type-prompt">$</span>
            <span className="hero-type-text">{typed}</span>
            <span className="hero-cursor" />
          </p>
          <p className="hero-desc">{data.bio}</p>
          <div className="hero-stats">
            {data.stats.map((s, i) => (
              <div key={i} className="hero-stat">
                <div className="hero-stat-num"><Counter value={s.value} suffix={s.suffix} /></div>
                <div className="hero-stat-label">{s.label}</div>
              </div>
            ))}
          </div>
          <div className="hero-btns">
            <a href="#projects" className="btn-primary">View projects</a>
            <a href={data.github} target="_blank" rel="noreferrer" className="btn-secondary">github.com/yustin-prz ↗</a>
          </div>
        </div>
        <div className="hero-scroll">
          <span>scroll</span>
          <div className="hero-scroll-line" />
        </div>
      </div>

      {/* ABOUT */}
      <div id="about">
        <Section num="01" label="About">
          <div className="about-grid">
            {[
              { icon: '🏢', title: 'Current role', text: 'RPA/Innovation Intern at DHL Shared Service Center, Heredia CR. Working with the AR team on data pipelines and automation across 9+ countries.' },
              { icon: '🎓', title: 'Education', text: "Bachelor's in Software Engineering at Universidad Técnica Nacional (expected 2027). Associate's in Information Technologies, 2025." },
              { icon: '📍', title: 'Location', text: 'Alajuela, Costa Rica. Open to remote roles worldwide and hybrid positions in the Greater Metropolitan Area.' },
              { icon: '🗣️', title: 'Languages', text: 'Spanish (native) · English B2+ (professional proficiency). All documentation and portfolio content in English.' },
            ].map((c, i) => (
              <div key={i} className="about-card reveal" style={{ '--i': i }}>
                <div className="about-card-icon">{c.icon}</div>
                <div className="about-card-title">{c.title}</div>
                <div className="about-card-text">{c.text}</div>
              </div>
            ))}
          </div>
        </Section>
      </div>

      {/* IMPACT */}
      <div id="impact">
        <Section num="02" label="Impact">
          <div className="impact-grid">
            {data.impact.map((m, i) => (
              <div key={i} className="impact-card reveal" style={{ '--i': i }}>
                <div className="impact-icon">{m.icon}</div>
                <div className="impact-num">
                  <Counter value={m.value} prefix={m.prefix || ''} suffix={m.suffix || ''} />
                </div>
                <div className="impact-label">{m.label}</div>
                <div className="impact-sub">{m.sub}</div>
              </div>
            ))}
          </div>
        </Section>
      </div>

      {/* EXPERIENCE */}
      <div id="experience">
        <Section num="03" label="Experience">
          <div className="exp-list">
            {data.experience.map((e, i) => (
              <div key={i} className="exp-item reveal reveal--left" style={{ '--i': i }}>
                <div className="exp-timeline">
                  <div className={`exp-dot ${e.active ? 'exp-dot--active' : ''}`} />
                  {i < data.experience.length - 1 && <div className="exp-tail" />}
                </div>
                <div className="exp-content">
                  <div className="exp-header">
                    <div>
                      <div className="exp-company">{e.company}</div>
                      <div className="exp-role">{e.role} · {e.location}</div>
                    </div>
                    <div className="exp-date">{e.date}</div>
                  </div>
                  <div className="exp-pills">
                    {e.tech.map(t => <span key={t} className="exp-pill">{t}</span>)}
                  </div>
                  <ul className="exp-bullets">
                    {e.bullets.map((b, bi) => <li key={bi}>{b}</li>)}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </Section>
      </div>

      {/* PROJECTS */}
      <div id="projects">
        <Section num="04" label="Projects">
          <div className="proj-filters">
            {filters.map(f => (
              <button
                key={f}
                className={`proj-filter ${projectFilter === f ? 'proj-filter--active' : ''}`}
                onClick={() => setProjectFilter(f)}
              >
                {f}
              </button>
            ))}
          </div>
          <div className="projects-grid">
            {filteredProjects.map((p, i) => (
              <a key={p.url} href={p.url} target="_blank" rel="noreferrer" className="proj-card proj-card--in" style={{ animationDelay: `${i * 0.06}s` }}>
                <div className="proj-top-line" />
                <div className="proj-emoji">{p.emoji}</div>
                <div className="proj-type">
                  {p.type}
                  {p.inProgress && <span className="proj-wip"> · In progress</span>}
                </div>
                <div className="proj-name">{p.name}</div>
                <div className="proj-desc">{p.desc}</div>
                <div className="proj-footer">
                  <div className="proj-pills">
                    {p.tech.slice(0, 3).map(t => <span key={t} className="proj-pill">{t}</span>)}
                  </div>
                  <span className="proj-link">→</span>
                </div>
              </a>
            ))}
          </div>
        </Section>
      </div>

      {/* SKILLS */}
      <div id="skills">
        <Section num="05" label="Skills">
          <div className="skills-grid">
            {data.skills.map((g, i) => (
              <div key={i} className="skill-group">
                <div className="skill-group-name">{g.category}</div>
                <div className="skill-pills">
                  {g.items.map(s => <span key={s} className="skill-pill">{s}</span>)}
                </div>
              </div>
            ))}
          </div>
        </Section>
      </div>

      {/* CERTIFICATIONS */}
      <div id="certifications">
        <Section num="06" label="Certifications">
          <div className="certs-grid">
            {data.certifications.map((c, i) => (
              <div key={i} className="cert-card">
                <div className="cert-icon">{c.icon}</div>
                <div className="cert-info">
                  <div className="cert-name">{c.name}</div>
                  <div className="cert-meta">{c.issuer} · {c.date}</div>
                </div>
                {c.date === 'In progress' && <div className="cert-badge">In progress</div>}
              </div>
            ))}
          </div>
        </Section>
      </div>

      {/* CONTACT */}
      <div id="contact">
        <Section num="07" label="Contact">
          <p className="contact-intro">Open to data engineering and analyst roles in Costa Rica and remote worldwide. Let's connect.</p>
          <div className="contact-grid">
            <a href={`mailto:${data.email}`} className="contact-card">
              <div className="contact-icon">✉️</div>
              <div className="contact-label">Email</div>
              <div className="contact-value">{data.email}</div>
            </a>
            <a href={data.linkedin} target="_blank" rel="noreferrer" className="contact-card">
              <div className="contact-icon">💼</div>
              <div className="contact-label">LinkedIn</div>
              <div className="contact-value">linkedin.com/in/yustin-prz</div>
            </a>
            <a href={data.github} target="_blank" rel="noreferrer" className="contact-card">
              <div className="contact-icon">🐙</div>
              <div className="contact-label">GitHub</div>
              <div className="contact-value">github.com/yustin-prz</div>
            </a>
          </div>
        </Section>
      </div>

      <footer className="footer">
        <span className="footer-logo">Y<span>.</span>Pérez</span>
        <span className="footer-text">Built with React · Deployed on Vercel</span>
        <span className="footer-copy">© 2026</span>
      </footer>

      {/* RECRUITER SUMMARY PANEL */}
      {recruiterMode && (
        <div className="recruiter-panel">
          <div className="recruiter-head">
            <span className="recruiter-tag">★ Recruiter view</span>
            <button className="recruiter-close" onClick={() => setRecruiterMode(false)} aria-label="Close">✕</button>
          </div>
          <div className="recruiter-name">{data.name.split(' ').slice(0, 2).join(' ')} {data.name.split(' ')[2]}</div>
          <div className="recruiter-role">{r.role}</div>

          <div className="recruiter-metrics">
            {r.metrics.map((m, i) => (
              <div key={i} className="recruiter-metric">
                <div className="recruiter-metric-num">{m.value}</div>
                <div className="recruiter-metric-label">{m.label}</div>
              </div>
            ))}
          </div>

          <div className="recruiter-block">
            <div className="recruiter-block-label">Top achievement</div>
            <div className="recruiter-block-text">{r.topAchievement}</div>
          </div>

          <div className="recruiter-block">
            <div className="recruiter-block-label">Availability</div>
            <div className="recruiter-block-text">{r.availability}</div>
          </div>

          <div className="recruiter-block">
            <div className="recruiter-block-label">Top skills</div>
            <div className="recruiter-skills">
              {r.topSkills.map(s => <span key={s} className="recruiter-skill">{s}</span>)}
            </div>
          </div>

          <div className="recruiter-actions">
            <a href={`mailto:${data.email}`} className="recruiter-btn recruiter-btn--primary">Email</a>
            <a href={data.linkedin} target="_blank" rel="noreferrer" className="recruiter-btn">LinkedIn</a>
            <a href={data.github} target="_blank" rel="noreferrer" className="recruiter-btn">GitHub</a>
          </div>
        </div>
      )}
    </div>
  );
}
