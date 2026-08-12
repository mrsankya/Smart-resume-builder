// ============================================
// CreateResumeModal.jsx - Ergonomic, Sticky Action Modal
// ============================================

import './index.css';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { createResume } from '../../services/resumeService.js';
import TEMPLATES from '../../constants/templates.js';
import { HiXMark, HiCheck, HiSparkles, HiMagnifyingGlass } from 'react-icons/hi2';

const CATEGORY_TABS = [
  { id: 'all', label: 'All Templates' },
  { id: 'canva', label: '🎨 Canva Designs' },
  { id: 'modern', label: 'Tech & Modern' },
  { id: 'professional', label: 'Professional' },
  { id: 'creative', label: 'Creative' },
  { id: 'executive', label: 'Executive' },
  { id: 'minimal', label: 'Minimalist' },
];

export default function CreateResumeModal({ isOpen, onClose, initialTemplateId = 'classic' }) {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [targetRole, setTargetRole] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState(initialTemplateId || 'classic');
  const [activeTab, setActiveTab] = useState('all');
  const [search, setSearch] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const filteredTemplates = TEMPLATES.filter((tmpl) => {
    const matchesTab =
      activeTab === 'all' ||
      (activeTab === 'canva' && (tmpl.category === 'canva' || tmpl.isCanva)) ||
      tmpl.category?.toLowerCase() === activeTab.toLowerCase();

    const matchesSearch =
      !search ||
      tmpl.name.toLowerCase().includes(search.toLowerCase()) ||
      tmpl.description.toLowerCase().includes(search.toLowerCase());

    return matchesTab && matchesSearch;
  });

  const currentTemplateObj = TEMPLATES.find((t) => t.id === selectedTemplate) || TEMPLATES[0];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    const token = localStorage.getItem('token');
    const resumeTitle = title.trim() || `${currentTemplateObj.name} Resume`;

    if (!token) {
      // Guest Mode: Store local draft and open builder immediately
      const guestDraft = {
        _id: 'guest-draft',
        title: resumeTitle,
        templateId: selectedTemplate,
        targetRole: targetRole.trim(),
        sections: {
          personalInfo: { fullName: '', email: '', phone: '', location: '', title: targetRole.trim(), summary: '' },
          experience: [],
          education: [],
          skills: [],
          projects: [],
          certifications: [],
          custom: [],
        },
        isGuest: true,
        updatedAt: new Date().toISOString(),
      };
      localStorage.setItem('guest_resume_draft', JSON.stringify(guestDraft));
      toast.success('🚀 Started building in Guest Mode!');
      onClose();
      navigate('/builder/guest-draft');
      setIsSubmitting(false);
      return;
    }

    try {
      const resume = await createResume({
        title: resumeTitle,
        templateId: selectedTemplate,
        targetRole: targetRole.trim(),
      });
      toast.success('🎉 Resume created successfully!');
      onClose();
      navigate(`/builder/${resume._id}`);
    } catch (err) {
      console.error(err);
      toast.error('Failed to create resume. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="create-resume-modal-card" onClick={(e) => e.stopPropagation()}>
        {/* 1. Fixed Header */}
        <div className="create-resume-modal-header">
          <div className="flex-row items-center gap-sm">
            <div className="create-modal-icon-badge">
              <HiSparkles />
            </div>
            <div>
              <h2 className="heading-md" style={{ margin: 0 }}>Create New Resume</h2>
              <p className="text-xs text-muted" style={{ margin: '2px 0 0 0' }}>
                Select a layout, configure details, and start building with Gemini AI
              </p>
            </div>
          </div>
          <button onClick={onClose} className="btn-icon btn-ghost" title="Close">
            <HiXMark style={{ fontSize: '22px' }} />
          </button>
        </div>

        {/* 2. Scrollable Body Content */}
        <form onSubmit={handleSubmit} id="createResumeForm" className="create-resume-modal-body">
          {/* Top Inputs: 2 Columns */}
          <div className="grid-2 gap-md mb-md">
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="label-text">Resume Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="input-field"
                placeholder="e.g. Senior Software Engineer 2026"
                autoFocus
              />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="label-text">Target Job Role</label>
              <input
                type="text"
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
                className="input-field"
                placeholder="e.g. Full Stack Developer"
              />
            </div>
          </div>

          {/* Template Filter Tabs & Quick Search */}
          <div className="create-modal-filter-bar">
            <div className="create-modal-tabs">
              {CATEGORY_TABS.map((tab) => (
                <button
                  type="button"
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`create-modal-tab-btn ${activeTab === tab.id ? 'active' : ''}`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="create-modal-search">
              <HiMagnifyingGlass style={{ color: '#94a3b8', fontSize: '14px' }} />
              <input
                type="text"
                placeholder="Filter templates..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          {/* Compact Mini-Template Selector Grid */}
          <div className="create-modal-templates-container">
            <div className="create-modal-templates-grid">
              {filteredTemplates.map((tmpl) => {
                const isSelected = selectedTemplate === tmpl.id;
                return (
                  <div
                    key={tmpl.id}
                    onClick={() => setSelectedTemplate(tmpl.id)}
                    className={`mini-template-card ${isSelected ? 'selected' : ''}`}
                  >
                    {/* Active Checkmark Pill */}
                    {isSelected && (
                      <div className="mini-template-check">
                        <HiCheck />
                      </div>
                    )}

                    {/* Badge if present */}
                    {tmpl.badge && (
                      <div className="mini-template-badge">
                        {tmpl.badge}
                      </div>
                    )}

                    {/* Header with Palette chips */}
                    <div className="mini-template-swatches">
                      <span className="swatch" style={{ background: tmpl.colors.primary }} />
                      <span className="swatch" style={{ background: tmpl.colors.accent }} />
                      {tmpl.colors.text && <span className="swatch" style={{ background: tmpl.colors.text }} />}
                    </div>

                    <div className="mini-template-name truncate">{tmpl.name}</div>
                    <p className="mini-template-desc truncate-2">{tmpl.description}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </form>

        {/* 3. Sticky Bottom Action Bar (Never scrolls off-screen!) */}
        <div className="create-resume-modal-footer">
          <div className="create-modal-selected-preview">
            <div className="selected-dot" style={{ background: currentTemplateObj.colors.primary }} />
            <div className="text-xs">
              <span className="text-muted">Selected Layout: </span>
              <strong className="text-white">{currentTemplateObj.name}</strong>
              {currentTemplateObj.badge && (
                <span className="selected-mini-badge">{currentTemplateObj.badge}</span>
              )}
            </div>
          </div>

          <div className="flex-row items-center gap-sm">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-outline"
              style={{ padding: '10px 22px' }}
            >
              Cancel
            </button>
            <button
              type="submit"
              form="createResumeForm"
              disabled={isSubmitting}
              className="btn btn-primary-gradient"
              style={{ padding: '10px 28px', fontSize: '14px', fontWeight: 600 }}
            >
              {isSubmitting ? 'Creating...' : '🚀 Start Building Resume'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
