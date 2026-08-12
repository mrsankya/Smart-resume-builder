// ============================================
// LandingPage.jsx - Marketing Landing Page (Expanded & High-Fidelity)
// ============================================

import './index.css';
import { useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import TemplateCard from '../../components/TemplateCard';
import ThemeContext from '../../context/ThemeContext.jsx';
import {
  HiDocumentText,
  HiChatBubbleLeftRight,
  HiSparkles,
  HiChartBar,
  HiShieldCheck,
  HiArrowDownTray,
  HiArrowRight,
  HiCheck,
  HiSun,
  HiMoon,
  HiChevronDown,
  HiChevronUp,
  HiCpuChip,
  HiCloudArrowUp,
  HiRocketLaunch,
  HiUserGroup,
} from 'react-icons/hi2';
import TEMPLATES from '../../constants/templates.js';

function LandingPage() {
  const { theme, toggleTheme, isDark } = useContext(ThemeContext);
  const [openFaq, setOpenFaq] = useState(null);
  const [selectedTemplateTab, setSelectedTemplateTab] = useState('all');

  const features = [
    {
      icon: HiSparkles,
      title: 'Gemini AI Writing Agent',
      desc: 'Transforms raw job notes into punchy STAR-format bullet points with quantifiable metrics and recruiter-loved action verbs.',
    },
    {
      icon: HiChatBubbleLeftRight,
      title: 'Conversational Resume AI',
      desc: 'Chat directly with your resume. Prompt for instant rewrites, executive summaries, skill gap audits, and role-specific adaptations.',
    },
    {
      icon: HiChartBar,
      title: '10-Metric ATS Scoring Engine',
      desc: 'Deep multi-factor keyword parsing analyzes section density, readability, action verb frequency, and job match percentages.',
    },
    {
      icon: HiCloudArrowUp,
      title: 'Custom Template Uploads',
      desc: 'Upload Word (.docx), PDF, or layout blueprints. Community submissions are moderated and approved for instant live usage.',
    },
    {
      icon: HiShieldCheck,
      title: 'Master Profile 1-Click Sync',
      desc: 'Store your master tech stack, career history, and degrees once — then auto-fill any resume variation with a single click.',
    },
    {
      icon: HiRocketLaunch,
      title: 'Real-Time PDF Compilation',
      desc: 'High-definition vector PDF rendering ensures your resume looks sharp, properly formatted, and pixel-perfect across all devices.',
    },
  ];

  const steps = [
    {
      number: '01',
      title: 'Choose a Curated Template',
      desc: 'Select from 10+ industry-specific designs or upload your own custom layout.',
    },
    {
      number: '02',
      title: 'Auto-Fill or Let AI Draft',
      desc: 'Sync from your Master Profile or input target job description to generate customized bullet points.',
    },
    {
      number: '03',
      title: 'Audit ATS & Export Vector PDF',
      desc: 'Achieve a 90%+ ATS score in real time and download a clean, recruiter-ready resume.',
    },
  ];

  const faqs = [
    {
      q: 'How does the ATS score engine work?',
      a: 'Our engine computes a composite score across 10 critical dimensions including keyword alignment, STAR impact formulation, brevity, section completeness, and machine-readability formatting.',
    },
    {
      q: 'Can I upload my own custom resume templates?',
      a: 'Yes! You can upload custom files (Word .docx, PDF, or JSON layout templates) in the Template Gallery. Once reviewed by our admin, the template goes live across the entire community.',
    },
    {
      q: 'What is the Master Profile auto-fill feature?',
      a: 'The Master Profile stores your complete career repository (full experience history, certifications, skills, and education). When creating a new tailored resume, click "Auto-Fill from Profile" to populate all fields in seconds.',
    },
    {
      q: 'Is my data secure and private?',
      a: 'Absolutely. We use strict token-based authentication, hashed credentials, and do not sell or share candidate data with third-party aggregators.',
    },
    {
      q: 'Can I switch between Dark and Light mode?',
      a: 'Yes! Toggle the theme switch button in the top navigation bar anytime to seamlessly toggle between our signature Luminous Dark theme and crisp Light mode.',
    },
  ];

  const filteredTemplates =
    selectedTemplateTab === 'all'
      ? TEMPLATES
      : TEMPLATES.filter((t) => t.category?.toLowerCase() === selectedTemplateTab.toLowerCase());

  return (
    <div className="page-bg min-h-screen">
      {/* A. Navigation */}
      <nav className="landing-nav">
        <div className="flex-row items-center gap-sm">
          <div className="navbar-logo">
            <HiDocumentText />
          </div>
          <span className="navbar-title">Smart Resume Builder</span>
        </div>

        <ul className="landing-nav-links hide-mobile">
          <li><a href="#features" className="landing-nav-link">Features</a></li>
          <li><a href="#simulator" className="landing-nav-link">ATS Simulator</a></li>
          <li><a href="#templates" className="landing-nav-link">Templates</a></li>
          <li><a href="#how-it-works" className="landing-nav-link">Workflow</a></li>
          <li><a href="#faq" className="landing-nav-link">FAQ</a></li>
        </ul>

        <div className="flex-row items-center gap-md">
          {/* Theme Switcher Button */}
          <button
            onClick={toggleTheme}
            className="btn-icon btn-ghost"
            title={`Switch to ${isDark ? 'Light' : 'Dark'} Mode`}
            style={{ fontSize: '18px' }}
          >
            {isDark ? <HiSun style={{ color: '#fbbf24' }} /> : <HiMoon style={{ color: '#6366f1' }} />}
          </button>

          <Link to="/login" className="landing-nav-link">Login</Link>
          <Link to="/login" className="btn btn-primary-gradient btn-sm">
            Get Started Free
          </Link>
        </div>
      </nav>

      {/* B. Hero */}
      <section className="landing-hero">
        <div className="landing-hero-content">
          <div className="inline-flex items-center gap-xs badge badge-purple mb-sm">
            <HiSparkles /> Powered by Google Gemini AI & Multi-Agent Engine
          </div>

          <h1 className="heading-xl" style={{ lineHeight: '1.2' }}>
            Build resumes that <span className="landing-highlight">land high-paying interviews</span>
          </h1>

          <p className="text-body mt-sm" style={{ fontSize: '17px', color: 'var(--text-secondary)', maxWidth: '540px' }}>
            Transform your background into high-impact STAR bullet points, audit keyword gaps with real-time ATS scoring, and export pixel-perfect resumes in minutes.
          </p>

          <div className="flex-row gap-md" style={{ marginTop: '32px' }}>
            <Link to="/login" className="btn btn-primary-gradient" style={{ padding: '14px 32px' }}>
              Start Building Free <HiArrowRight />
            </Link>
            <a href="#templates" className="btn btn-outline" style={{ padding: '14px 28px' }}>
              Explore 10+ Templates
            </a>
          </div>

          <div className="landing-stats mt-lg">
            <div className="stat-card">
              <div className="stat-number">98%</div>
              <div className="stat-label">ATS Pass Rate</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">10+</div>
              <div className="stat-label">Pro Templates</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">&lt; 3 mins</div>
              <div className="stat-label">AI Generation</div>
            </div>
          </div>
        </div>

        <div className="landing-hero-visual">
          <div
            className="card"
            style={{
              padding: '24px',
              border: '1px solid rgba(210, 187, 255, 0.25)',
              boxShadow: '0 20px 60px rgba(0,0,0,0.4)',
              borderRadius: '20px',
              maxWidth: '480px',
              width: '100%',
            }}
          >
            <div className="flex-between mb-md">
              <div className="flex-row items-center gap-xs">
                <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#10b981' }} />
                <span className="text-xs font-semibold text-white">ATS Optimization: 96 / 100</span>
              </div>
              <span className="badge badge-purple text-xs">AI Optimized</span>
            </div>

            <div className="p-sm rounded-md mb-md" style={{ background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-subtle)' }}>
              <div className="text-xs font-semibold text-purple mb-xs">Before AI:</div>
              <p className="text-xs text-muted">"Worked on backend APIs and helped fix bugs in our web dashboard."</p>
            </div>

            <div className="p-sm rounded-md mb-md" style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
              <div className="text-xs font-semibold text-emerald mb-xs">✨ After Smart Resume AI (STAR Format):</div>
              <p className="text-xs text-white">
                "Architected distributed Express.js microservices reducing API latency by 42% and processing 1.2M+ daily requests with 99.98% uptime."
              </p>
            </div>

            <div className="grid-2 gap-xs">
              <div className="text-xs text-muted flex-row items-center gap-xs">
                <HiCheck style={{ color: '#10b981' }} /> Action Verbs (+28%)
              </div>
              <div className="text-xs text-muted flex-row items-center gap-xs">
                <HiCheck style={{ color: '#10b981' }} /> Metrics Quantified
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* C. Trust Bar */}
      <div className="landing-trust-bar">
        Trusted by job seekers targeting roles at{' '}
        <span className="trust-companies">Google, Amazon, Microsoft, Meta, Apple & Fast-growing Startups</span>
      </div>

      {/* D. Features Grid */}
      <section id="features" className="landing-section">
        <div className="text-center mb-lg">
          <span className="badge badge-purple mb-xs">Intelligent Platform</span>
          <h2 className="landing-section-title">Everything You Need to Get Hired</h2>
          <p className="landing-section-subtitle">
            From smart bullet drafting to interactive resume chats, automate the hardest parts of your job search.
          </p>
        </div>

        <div className="grid-3">
          {features.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="feature-card">
              <div className="feature-card-icon">
                <Icon />
              </div>
              <h3 className="heading-sm" style={{ marginBottom: '8px' }}>{title}</h3>
              <p className="text-muted text-sm">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* E. Interactive ATS Comparison Simulator */}
      <section id="simulator" className="landing-section" style={{ background: 'var(--bg-surface)' }}>
        <div className="text-center mb-lg">
          <span className="badge badge-emerald mb-xs">ATS Benchmark</span>
          <h2 className="landing-section-title">Why Traditional Resumes Fail ATS Filters</h2>
          <p className="landing-section-subtitle">
            Over 75% of resumes are discarded before human review. See how our AI solves this:
          </p>
        </div>

        <div className="grid-2 gap-lg" style={{ maxWidth: '1000px', margin: '0 auto' }}>
          {/* Unoptimized Card */}
          <div className="card" style={{ borderColor: 'rgba(239, 68, 68, 0.3)', background: 'var(--bg-surface-elevated)' }}>
            <div className="flex-between mb-md">
              <h3 className="heading-sm" style={{ color: '#ef4444' }}>Standard Resume Draft</h3>
              <span className="admin-score-chip admin-score-low">ATS 42 / 100</span>
            </div>
            <ul className="flex-col gap-sm text-sm text-muted">
              <li>❌ Generic duties without quantifiable results</li>
              <li>❌ Missing critical job description keywords</li>
              <li>❌ Weak passive verbs ("Responsible for...")</li>
              <li>❌ Poor section hierarchy confuses ATS parsers</li>
            </ul>
          </div>

          {/* AI-Optimized Card */}
          <div className="card" style={{ borderColor: 'rgba(16, 185, 129, 0.4)', background: 'var(--bg-surface-elevated)' }}>
            <div className="flex-between mb-md">
              <h3 className="heading-sm" style={{ color: '#10b981' }}>Smart Resume Builder AI</h3>
              <span className="admin-score-chip admin-score-high">ATS 96 / 100</span>
            </div>
            <ul className="flex-col gap-sm text-sm text-white">
              <li>✅ STAR-method bullet points with % and $ impacts</li>
              <li>✅ High-density industry keyword mapping</li>
              <li>✅ High-impact verbs ("Spearheaded", "Engineered")</li>
              <li>✅ 100% clean single/two-column ATS layout parsing</li>
            </ul>
          </div>
        </div>
      </section>

      {/* F. Template Showcase */}
      <section id="templates" className="landing-section">
        <div className="flex-between mb-lg" style={{ flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <span className="badge badge-purple mb-xs">Designs for Every Role</span>
            <h2 className="landing-section-title" style={{ textAlign: 'left', margin: 0 }}>
              10+ High-Performance Resume Templates
            </h2>
          </div>

          <div className="templates-category-pills">
            {['all', 'professional', 'modern', 'creative', 'executive'].map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedTemplateTab(cat)}
                className={`category-pill ${selectedTemplateTab === cat ? 'category-pill-active' : ''}`}
                style={{ textTransform: 'capitalize' }}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="template-grid-3">
          {filteredTemplates.slice(0, 6).map((tmpl) => (
            <div key={tmpl.id} style={{ position: 'relative' }}>
              {tmpl.badge && <div className="popular-badge">{tmpl.badge}</div>}
              <TemplateCard template={tmpl} isActive={false} onSelect={() => {}} />
            </div>
          ))}
        </div>

        <div style={{ textAlign: 'center', marginTop: '36px' }}>
          <Link to="/templates" className="btn btn-outline" style={{ padding: '12px 32px' }}>
            View All Templates & Upload Custom Design →
          </Link>
        </div>
      </section>

      {/* G. How It Works Steps */}
      <section id="how-it-works" className="landing-section" style={{ background: 'var(--bg-surface)' }}>
        <div className="text-center mb-lg">
          <span className="badge badge-purple mb-xs">Fast & Simple</span>
          <h2 className="landing-section-title">From Blank Page to Interview in 3 Steps</h2>
        </div>

        <div className="grid-3">
          {steps.map(({ number, title, desc }) => (
            <div key={number} className="step-card">
              <div className="step-number">{number}</div>
              <h3 className="heading-sm mb-xs">{title}</h3>
              <p className="text-muted text-sm">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* H. FAQ Section */}
      <section id="faq" className="landing-section">
        <div className="text-center mb-lg">
          <span className="badge badge-purple mb-xs">Got Questions?</span>
          <h2 className="landing-section-title">Frequently Asked Questions</h2>
        </div>

        <div style={{ maxWidth: '800px', margin: '0 auto' }} className="flex-col gap-sm">
          {faqs.map((faq, index) => (
            <div
              key={faq.q}
              className="card"
              style={{
                cursor: 'pointer',
                padding: '20px 24px',
                transition: 'all 0.2s ease',
              }}
              onClick={() => setOpenFaq(openFaq === index ? null : index)}
            >
              <div className="flex-between">
                <span className="font-semibold text-white text-base">{faq.q}</span>
                {openFaq === index ? (
                  <HiChevronUp style={{ color: '#d2bbff', fontSize: '20px' }} />
                ) : (
                  <HiChevronDown style={{ color: '#64748b', fontSize: '20px' }} />
                )}
              </div>
              {openFaq === index && (
                <p className="text-sm text-muted mt-sm" style={{ lineHeight: '1.6' }}>
                  {faq.a}
                </p>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* I. Bottom CTA Banner */}
      <section className="landing-cta">
        <h2 className="heading-xl" style={{ color: '#ffffff', marginBottom: '16px' }}>
          Ready to supercharge your career?
        </h2>
        <p style={{ color: 'rgba(210, 187, 255, 0.85)', fontSize: '17px', maxWidth: '520px', margin: '0 auto' }}>
          Create an ATS-optimized, high-converting resume backed by Gemini AI in under 3 minutes.
        </p>

        <div style={{ marginTop: '32px' }}>
          <Link
            to="/login"
            className="btn btn-primary-gradient"
            style={{
              background: '#ffffff',
              color: '#7c3aed',
              padding: '16px 40px',
              fontSize: '16px',
              fontWeight: 700,
            }}
          >
            Create Your Free Resume Now <HiArrowRight />
          </Link>
        </div>

        <div className="landing-cta-badges mt-md">
          <span style={{ color: 'rgba(210, 187, 255, 0.75)', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <HiCheck /> Free Forever Plan
          </span>
          <span style={{ color: 'rgba(210, 187, 255, 0.75)', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <HiCheck /> Instant PDF Export
          </span>
          <span style={{ color: 'rgba(210, 187, 255, 0.75)', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <HiCheck /> No Credit Card Required
          </span>
        </div>
      </section>

      {/* J. Footer */}
      <footer className="landing-footer">
        <div className="flex-row items-center gap-sm">
          <div className="navbar-logo" style={{ width: '32px', height: '32px', fontSize: '16px', borderRadius: '8px' }}>
            <HiDocumentText />
          </div>
          <span className="navbar-title" style={{ fontSize: '17px' }}>Smart Resume Builder</span>
        </div>

        <div className="landing-footer-links">
          <a href="#features" className="landing-footer-link">Features</a>
          <a href="#simulator" className="landing-footer-link">ATS Simulator</a>
          <a href="#templates" className="landing-footer-link">Templates</a>
          <a href="#faq" className="landing-footer-link">FAQ</a>
          <Link to="/login" className="landing-footer-link">Login</Link>
        </div>

        <p className="text-xs text-muted">
          © {new Date().getFullYear()} Smart Resume Builder. Built with MERN Stack & Google Gemini AI.
        </p>
      </footer>
    </div>
  );
}

export default LandingPage;
