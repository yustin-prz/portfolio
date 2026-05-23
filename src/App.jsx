import React, { useEffect, useRef, useState } from 'react';
import { data } from './data';
import './App.css';

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

  useEffect(() => {
    const handler = () => {
      const sections = ['about', 'experience', 'projects', 'skills', 'certifications', 'contact'];
      for (const id of sections) {
        const el = document.getElementById(id);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= 120 && rect.bottom >= 120) { setActiveNav(id); break; }
        }
      }
    };
    window.addEventListener('scroll', handler);
    return () => window.removeEventListener('scroll', handler);
  }, []);

  const navLinks = [
    { id: 'about', label: 'About' },
    { id: 'experience', label: 'Experience' },
    { id: 'projects', label: 'Projects' },
    { id: 'skills', label: 'Skills' },
    { id: 'certifications', label: 'Certs' },
    { id: 'contact', label: 'Contact' },
  ];

  return (
    <div className="app">
      {/* NAV */}
      <nav className="nav">
        <a href="#hero" className="nav-logo">Y<span className="nav-logo-accent">.</span>Pérez</a>
        <div className="nav-links">
          {navLinks.map(l => (
            <a key={l.id} href={`#${l.id}`} className={`nav-link ${activeNav === l.id ? 'nav-link--active' : ''}`}>{l.label}</a>
          ))}
        </div>
        <button className="nav-menu-btn" onClick={() => setMenuOpen(!menuOpen)} aria-label="Menu">
          <span /><span /><span />
        </button>
        {menuOpen && (
          <div className="nav-mobile">
            {navLinks.map(l => (
              <a key={l.id} href={`#${l.id}`} className="nav-mobile-link" onClick={() => setMenuOpen(false)}>{l.label}</a>
            ))}
          </div>
        )}
      </nav>

      {/* HERO */}
      <div id="hero" className="hero">
        <div className="hero-glow" />
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
          <p className="hero-desc">{data.bio}</p>
          <div className="hero-stats">
            {data.stats.map((s, i) => (
              <div key={i} className="hero-stat">
                <div className="hero-stat-num">{s.num}</div>
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
              <div key={i} className="about-card" style={{ animationDelay: `${i * 0.1}s` }}>
                <div className="about-card-icon">{c.icon}</div>
                <div className="about-card-title">{c.title}</div>
                <div className="about-card-text">{c.text}</div>
              </div>
            ))}
          </div>
        </Section>
      </div>

      {/* EXPERIENCE */}
      <div id="experience">
        <Section num="02" label="Experience">
          <div className="exp-list">
            {data.experience.map((e, i) => (
              <div key={i} className="exp-item">
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
                  <div className="exp-desc">{e.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </Section>
      </div>

      {/* PROJECTS */}
      <div id="projects">
        <Section num="03" label="Projects">
          <div className="projects-grid">
            {data.projects.map((p, i) => (
              <a key={i} href={p.url} target="_blank" rel="noreferrer" className="proj-card" style={{ animationDelay: `${i * 0.07}s` }}>
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
        <Section num="04" label="Skills">
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
        <Section num="05" label="Certifications">
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
        <Section num="06" label="Contact">
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
    </div>
  );
}
