// ============================================
// TemplatesPage.jsx - Expanded Template Hub & Custom Uploads
// ============================================

import './index.css';
import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import Navbar from '../../components/Navbar';
import TemplateCard, { SAMPLE_DATA } from '../../components/TemplateCard';
import BUILTIN_TEMPLATES from '../../constants/templates.js';
import { createResume } from '../../services/resumeService.js';
import { getLiveTemplates, submitCustomTemplate } from '../../services/templateService.js';
import {
  getCanvaAuthUrl,
  getCanvaDesigns,
  importCanvaDesign,
} from '../../services/canvaService.js';
import ClassicTemplate from '../../components/templates/ClassicTemplate.jsx';
import ModernTemplate from '../../components/templates/ModernTemplate.jsx';
import CreativeTemplate from '../../components/templates/CreativeTemplate.jsx';
import MinimalTemplate from '../../components/templates/MinimalTemplate.jsx';
import ExecutiveTemplate from '../../components/templates/ExecutiveTemplate.jsx';
import {
  HiXMark,
  HiPlus,
  HiSparkles,
  HiMagnifyingGlass,
  HiArrowUpTray,
  HiDocumentArrowUp,
  HiCheckCircle,
  HiArrowPath,
  HiArrowTopRightOnSquare,
} from 'react-icons/hi2';

const TEMPLATE_COMPONENTS = {
  classic: ClassicTemplate,
  modern: ModernTemplate,
  creative: CreativeTemplate,
  minimal: MinimalTemplate,
  executive: ExecutiveTemplate,
  'tech-minimal': ModernTemplate,
  'nordic-clean': MinimalTemplate,
  'ivy-league': ClassicTemplate,
  'compact-grid': ModernTemplate,
  'infographic-slate': CreativeTemplate,
  'corporate-gold': ExecutiveTemplate,
};

const CATEGORIES = ['All', 'Professional', 'Modern', 'Creative', 'Minimal', 'Executive', 'Community Uploads'];

function TemplatesPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [allTemplates, setAllTemplates] = useState(BUILTIN_TEMPLATES);
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Preview Modal
  const [previewTemplate, setPreviewTemplate] = useState(null);

  // Create Resume from Template Modal
  const [showCreate, setShowCreate] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newTemplate, setNewTemplate] = useState('classic');
  const [newTargetRole, setNewTargetRole] = useState('');

  // Submit Custom Template Modal
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [customName, setCustomName] = useState('');
  const [customCategory, setCustomCategory] = useState('Tech');
  const [customDesc, setCustomDesc] = useState('');
  const [customLayout, setCustomLayout] = useState('single-column');
  const [customPrimaryColor, setCustomPrimaryColor] = useState('#7c3aed');
  const [customAccentColor, setCustomAccentColor] = useState('#9333ea');
  const [customFile, setCustomFile] = useState(null);
  const [customTags, setCustomTags] = useState('');

  // Canva Import Modal State
  const [showCanvaModal, setShowCanvaModal] = useState(false);
  const [canvaToken, setCanvaToken] = useState(() => localStorage.getItem('canva_token') || '');
  const [canvaDesigns, setCanvaDesigns] = useState([]);
  const [isLoadingCanva, setIsLoadingCanva] = useState(false);
  const [selectedCanvaDesign, setSelectedCanvaDesign] = useState(null);
  const [canvaImportCategory, setCanvaImportCategory] = useState('Creative');
  const [isImportingFromCanva, setIsImportingFromCanva] = useState(false);

  useEffect(() => {
    fetchCommunityTemplates();

    // Check if redirected back from Canva OAuth
    const connected = searchParams.get('canva_connected');
    const token = searchParams.get('canva_token');
    const error = searchParams.get('canva_error');

    if (error) {
      toast.error(`Canva connection error: ${error}`);
      searchParams.delete('canva_error');
      setSearchParams(searchParams);
    }

    if (connected && token) {
      setCanvaToken(token);
      localStorage.setItem('canva_token', token);
      toast.success('🎨 Canva connected successfully!');
      setShowCanvaModal(true);
      fetchCanvaDesigns(token);
      searchParams.delete('canva_connected');
      searchParams.delete('canva_token');
      setSearchParams(searchParams);
    }
  }, []);

  const fetchCanvaDesigns = async (token = canvaToken) => {
    if (!token) return;
    setIsLoadingCanva(true);
    try {
      const designs = await getCanvaDesigns(token);
      setCanvaDesigns(designs || []);
    } catch (err) {
      console.warn('Canva token may have expired:', err);
      setCanvaToken('');
      localStorage.removeItem('canva_token');
    } finally {
      setIsLoadingCanva(false);
    }
  };

  const handleConnectCanva = async () => {
    try {
      const res = await getCanvaAuthUrl();
      if (res?.url) {
        window.location.href = res.url;
      } else {
        toast.error('No authorization URL returned from server.');
      }
    } catch (err) {
      console.error('Canva connection error:', err);
      toast.error(err.response?.data?.message || err.message || 'Failed to initialize Canva connection.');
    }
  };

  const handleImportCanvaDesign = async () => {
    if (!selectedCanvaDesign) {
      toast.error('Please select a Canva design to import');
      return;
    }

    setIsImportingFromCanva(true);
    try {
      await importCanvaDesign({
        designId: selectedCanvaDesign.id,
        title: selectedCanvaDesign.title || 'Canva Resume Template',
        category: canvaImportCategory,
        canvaToken,
      });

      toast.success('🎉 Canva template successfully imported!');
      setShowCanvaModal(false);
      setSelectedCanvaDesign(null);
      fetchCommunityTemplates();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Failed to import Canva design');
    } finally {
      setIsImportingFromCanva(false);
    }
  };

  const fetchCommunityTemplates = async () => {
    try {
      const dynamicTemplates = await getLiveTemplates();
      if (dynamicTemplates?.length) {
        // Map database templates to template card format
        const formatted = dynamicTemplates.map((dt) => ({
          id: dt.slug || dt._id,
          name: dt.name,
          category: dt.category?.toLowerCase() || 'general',
          description: dt.description || 'Custom community template',
          colors: dt.colors || { primary: '#7c3aed', accent: '#9333ea', text: '#1e293b', light: '#fdf4ff' },
          font: dt.fonts?.body || "'Inter', sans-serif",
          thumbnail: dt.thumbnailUrl || '/templates/classic.png',
          badge: dt.isOfficial ? 'Official' : 'Community',
          isCustom: true,
        }));

        // Merge avoiding duplicate IDs
        const existingIds = new Set(BUILTIN_TEMPLATES.map((t) => t.id));
        const newOnes = formatted.filter((f) => !existingIds.has(f.id));
        setAllTemplates([...BUILTIN_TEMPLATES, ...newOnes]);
      }
    } catch (error) {
      console.log('Dynamic templates loaded from defaults.');
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const resume = await createResume({
        title: newTitle || 'Untitled Resume',
        templateId: newTemplate,
        targetRole: newTargetRole,
      });
      toast.success('Resume created!');
      navigate(`/builder/${resume._id}`);
    } catch (error) {
      toast.error('Failed to create resume');
    }
  };

  const handleCustomTemplateSubmit = async (e) => {
    e.preventDefault();
    if (!customName.trim()) {
      toast.error('Please enter a template name');
      return;
    }

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('name', customName);
      formData.append('category', customCategory);
      formData.append('description', customDesc);
      formData.append('layout', customLayout);
      formData.append('primaryColor', customPrimaryColor);
      formData.append('accentColor', customAccentColor);
      formData.append('tags', customTags);
      if (customFile) {
        formData.append('file', customFile);
      }

      await submitCustomTemplate(formData);
      toast.success('🎉 Custom template submitted! It will go live once reviewed by admin.');
      setShowUploadModal(false);
      // Reset form
      setCustomName('');
      setCustomDesc('');
      setCustomFile(null);
      setCustomTags('');
      fetchCommunityTemplates();
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || 'Failed to submit template');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filter templates
  const filteredTemplates = allTemplates.filter((tmpl) => {
    const matchesCategory =
      activeCategory === 'All' ||
      (activeCategory === 'Community Uploads' && tmpl.isCustom) ||
      tmpl.category?.toLowerCase() === activeCategory.toLowerCase();

    const matchesSearch =
      !searchQuery ||
      tmpl.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tmpl.description.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesCategory && matchesSearch;
  });

  return (
    <div className="page-bg min-h-screen">
      <Navbar />

      <div className="templates-page">
        {/* Top Header Banner */}
        <div className="templates-header-banner">
          <div>
            <div className="inline-flex items-center gap-xs badge badge-purple mb-sm">
              <HiSparkles /> 10+ Curated ATS-Engineered Formats
            </div>
            <h1 className="heading-xl">Design System & Template Hub</h1>
            <p className="text-muted mt-xs" style={{ maxWidth: '600px' }}>
              Hand-crafted layouts tailored for tech recruiters, executive search firms, and ATS parsing algorithms.
            </p>
          </div>

          <div className="flex-row items-center gap-sm">
            <button
              onClick={() => {
                setShowCanvaModal(true);
                if (canvaToken) fetchCanvaDesigns(canvaToken);
              }}
              className="btn btn-outline"
              style={{
                borderColor: '#00c4cc',
                color: '#00c4cc',
                padding: '14px 22px',
                whiteSpace: 'nowrap',
                background: 'rgba(0, 196, 204, 0.08)',
              }}
            >
              🎨 Import from Canva
            </button>

            <button
              onClick={() => setShowUploadModal(true)}
              className="btn btn-primary-gradient"
              style={{ padding: '14px 28px', whiteSpace: 'nowrap' }}
            >
              <HiArrowUpTray style={{ fontSize: '18px' }} /> Upload Custom Template
            </button>
          </div>
        </div>

        {/* Filter and Search Controls */}
        <div className="templates-filter-row">
          <div className="templates-category-pills">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`category-pill ${activeCategory === cat ? 'category-pill-active' : ''}`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="admin-search-box" style={{ maxWidth: '320px', width: '100%' }}>
            <HiMagnifyingGlass className="admin-search-icon" />
            <input
              type="text"
              placeholder="Search templates..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="admin-search-input"
            />
          </div>
        </div>

        {/* Templates Grid */}
        <div className="template-grid-3">
          {filteredTemplates.map((tmpl) => (
            <div key={tmpl.id} style={{ position: 'relative' }}>
              {tmpl.badge && (
                <div className="popular-badge">{tmpl.badge}</div>
              )}
              <TemplateCard
                template={tmpl}
                isActive={false}
                onSelect={() => setPreviewTemplate(tmpl)}
              />
            </div>
          ))}
        </div>

        {filteredTemplates.length === 0 && (
          <div className="empty-state">
            <h3 className="heading-sm mb-xs">No templates found</h3>
            <p className="text-muted mb-md">Try searching with different keywords or category filters.</p>
            <button onClick={() => { setActiveCategory('All'); setSearchQuery(''); }} className="btn btn-outline btn-sm">
              Reset Filters
            </button>
          </div>
        )}
      </div>

      {/* MODAL 1: TEMPLATE PREVIEW MODAL */}
      {previewTemplate && (() => {
        const PreviewComp = TEMPLATE_COMPONENTS[previewTemplate.id] || ClassicTemplate;
        return (
          <div className="modal-overlay" onClick={() => setPreviewTemplate(null)}>
            <div className="template-preview-modal" onClick={(e) => e.stopPropagation()}>
              <div
                style={{
                  padding: '20px 28px',
                  borderBottom: '1px solid rgba(255,255,255,0.08)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexShrink: 0,
                  background: '#131b2e',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <button
                    onClick={() => setPreviewTemplate(null)}
                    className="btn-icon btn-ghost"
                  >
                    <HiXMark style={{ fontSize: '22px' }} />
                  </button>
                  <div>
                    <h2 className="heading-lg" style={{ margin: 0 }}>
                      {previewTemplate.name}
                    </h2>
                    <p className="text-muted text-xs" style={{ marginTop: '2px' }}>
                      {previewTemplate.description}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setNewTemplate(previewTemplate.id);
                    setPreviewTemplate(null);
                    setShowCreate(true);
                  }}
                  className="btn btn-primary-gradient"
                  style={{ padding: '12px 32px', fontSize: '15px' }}
                >
                  Use This Template
                </button>
              </div>

              <div
                style={{
                  flex: 1,
                  overflow: 'auto',
                  padding: '32px',
                  background: '#060e20',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'flex-start',
                }}
              >
                <div
                  style={{
                    width: '794px',
                    minHeight: '1100px',
                    background: '#ffffff',
                    boxShadow: '0 16px 60px rgba(0,0,0,0.6)',
                    borderRadius: '4px',
                    overflow: 'hidden',
                    transform: 'scale(0.8)',
                    transformOrigin: 'top center',
                    marginBottom: `${-(1100 * 0.2)}px`,
                  }}
                >
                  <PreviewComp sections={SAMPLE_DATA} colors={previewTemplate.colors} />
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* MODAL 2: CREATE RESUME MODAL */}
      {showCreate && (
        <div className="modal-overlay" onClick={() => setShowCreate(false)}>
          <div
            className="modal-content"
            style={{ maxWidth: '500px' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex-between mb-md">
              <h2 className="heading-md">Create New Resume</h2>
              <button onClick={() => setShowCreate(false)} className="btn-icon btn-ghost">
                <HiXMark style={{ fontSize: '20px' }} />
              </button>
            </div>

            <form onSubmit={handleCreate}>
              <div className="form-group">
                <label className="label-text">Resume Title</label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="input-field"
                  placeholder="e.g. Senior Software Engineer 2026"
                  required
                />
              </div>

              <div className="form-group">
                <label className="label-text">Target Job Role</label>
                <input
                  type="text"
                  value={newTargetRole}
                  onChange={(e) => setNewTargetRole(e.target.value)}
                  className="input-field"
                  placeholder="e.g. Full Stack Developer"
                />
              </div>

              <div className="p-sm mb-md rounded-md" style={{ background: '#171f33', border: '1px solid rgba(255,255,255,0.08)' }}>
                <span className="text-xs text-muted">Selected Template:</span>
                <div className="font-semibold text-purple mt-xs">
                  {allTemplates.find((t) => t.id === newTemplate)?.name}
                </div>
              </div>

              <div className="flex-row gap-sm mt-lg">
                <button
                  type="button"
                  onClick={() => setShowCreate(false)}
                  className="btn btn-outline"
                  style={{ flex: 1 }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary-gradient"
                  style={{ flex: 1 }}
                >
                  Start Building
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: UPLOAD CUSTOM TEMPLATE MODAL */}
      {showUploadModal && (
        <div className="modal-overlay" onClick={() => setShowUploadModal(false)}>
          <div
            className="modal-content"
            style={{ maxWidth: '620px', maxHeight: '90vh', overflowY: 'auto' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex-between mb-md">
              <div>
                <h2 className="heading-md">Upload Custom Template</h2>
                <p className="text-xs text-muted mt-xs">
                  Upload your Word (.docx), PDF, or layout design for admin approval & publishing.
                </p>
              </div>
              <button onClick={() => setShowUploadModal(false)} className="btn-icon btn-ghost">
                <HiXMark style={{ fontSize: '20px' }} />
              </button>
            </div>

            <form onSubmit={handleCustomTemplateSubmit}>
              <div className="grid-2">
                <div className="form-group">
                  <label className="label-text">Template Name *</label>
                  <input
                    type="text"
                    value={customName}
                    onChange={(e) => setCustomName(e.target.value)}
                    placeholder="e.g. Silicon Valley Clean Dark"
                    className="input-field"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="label-text">Category</label>
                  <select
                    value={customCategory}
                    onChange={(e) => setCustomCategory(e.target.value)}
                    className="input-field"
                  >
                    <option value="Tech">Tech & Engineering</option>
                    <option value="Executive">Executive & Leadership</option>
                    <option value="Creative">Creative & Design</option>
                    <option value="Academic">Academic & Legal</option>
                    <option value="Minimalist">Minimalist</option>
                    <option value="General">General Purpose</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="label-text">Description</label>
                <textarea
                  rows={2}
                  value={customDesc}
                  onChange={(e) => setCustomDesc(e.target.value)}
                  placeholder="Describe who this template is best suited for..."
                  className="textarea-field"
                  style={{ minHeight: '70px' }}
                />
              </div>

              <div className="grid-2">
                <div className="form-group">
                  <label className="label-text">Primary Brand Color</label>
                  <div className="flex-row items-center gap-sm">
                    <input
                      type="color"
                      value={customPrimaryColor}
                      onChange={(e) => setCustomPrimaryColor(e.target.value)}
                      style={{ width: '44px', height: '40px', padding: 0, border: 'none', background: 'none', cursor: 'pointer' }}
                    />
                    <input
                      type="text"
                      value={customPrimaryColor}
                      onChange={(e) => setCustomPrimaryColor(e.target.value)}
                      className="input-field"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="label-text">Accent Color</label>
                  <div className="flex-row items-center gap-sm">
                    <input
                      type="color"
                      value={customAccentColor}
                      onChange={(e) => setCustomAccentColor(e.target.value)}
                      style={{ width: '44px', height: '40px', padding: 0, border: 'none', background: 'none', cursor: 'pointer' }}
                    />
                    <input
                      type="text"
                      value={customAccentColor}
                      onChange={(e) => setCustomAccentColor(e.target.value)}
                      className="input-field"
                    />
                  </div>
                </div>
              </div>

              <div className="form-group">
                <label className="label-text">Upload Template File (Word .docx / .doc / PDF / JSON)</label>
                <div className="file-dropzone-box" onClick={() => document.getElementById('templateFileInput').click()}>
                  <HiDocumentArrowUp style={{ fontSize: '36px', color: '#d2bbff', margin: '0 auto 8px' }} />
                  <p className="text-sm font-semibold text-white">
                    {customFile ? customFile.name : 'Click to browse or drop template file'}
                  </p>
                  <p className="text-xs text-muted mt-xs">
                    Supports DOCX, PDF, JSON formats up to 10MB
                  </p>
                  <input
                    id="templateFileInput"
                    type="file"
                    accept=".pdf,.docx,.doc,.json"
                    onChange={(e) => setCustomFile(e.target.files[0])}
                    style={{ display: 'none' }}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="label-text">Tags (comma separated)</label>
                <input
                  type="text"
                  value={customTags}
                  onChange={(e) => setCustomTags(e.target.value)}
                  placeholder="e.g. software, engineering, two-column, ats"
                  className="input-field"
                />
              </div>

              <div className="flex-row gap-sm mt-lg">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="btn btn-outline"
                  style={{ flex: 1 }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn btn-primary-gradient"
                  style={{ flex: 1 }}
                >
                  {isSubmitting ? 'Uploading...' : 'Submit for Admin Approval'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 4: CANVA INTEGRATION & IMPORT MODAL */}
      {showCanvaModal && (
        <div className="modal-overlay" onClick={() => setShowCanvaModal(false)}>
          <div
            className="modal-content"
            style={{ maxWidth: '680px', maxHeight: '90vh', overflowY: 'auto' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex-between mb-md">
              <div className="flex-row items-center gap-sm">
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '10px',
                    background: 'linear-gradient(135deg, #00c4cc, #7d2ae8)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#ffffff',
                    fontWeight: '800',
                    fontSize: '18px',
                  }}
                >
                  C
                </div>
                <div>
                  <h2 className="heading-md">Canva Template Importer</h2>
                  <p className="text-xs text-muted">
                    Sync and fetch resume templates directly from your Canva workspace
                  </p>
                </div>
              </div>
              <button onClick={() => setShowCanvaModal(false)} className="btn-icon btn-ghost">
                <HiXMark style={{ fontSize: '20px' }} />
              </button>
            </div>

            {!canvaToken ? (
              <div className="text-center" style={{ padding: '36px 20px' }}>
                <div
                  style={{
                    width: '72px',
                    height: '72px',
                    borderRadius: '20px',
                    background: 'rgba(0, 196, 204, 0.12)',
                    border: '1px solid rgba(0, 196, 204, 0.3)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 20px',
                    fontSize: '32px',
                    color: '#00c4cc',
                  }}
                >
                  🎨
                </div>
                <h3 className="heading-sm mb-xs">Connect Your Canva Account</h3>
                <p className="text-muted text-sm mb-lg" style={{ maxWidth: '440px', margin: '0 auto 24px' }}>
                  Authorize Smart Resume Builder to browse your Canva resume designs and export them directly into your template library.
                </p>

                <button
                  onClick={handleConnectCanva}
                  className="btn btn-primary-gradient"
                  style={{
                    background: 'linear-gradient(135deg, #00c4cc, #7d2ae8)',
                    padding: '14px 36px',
                    fontSize: '15px',
                  }}
                >
                  Connect with Canva OAuth <HiArrowTopRightOnSquare />
                </button>

                <div className="mt-lg p-sm rounded-md" style={{ background: '#171f33', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <p className="text-xs text-muted">
                    💡 <strong>Pro Tip:</strong> You can also export any template from Canva as a <strong>PDF / Word (.docx)</strong> file and upload it using our <strong>Upload Custom Template</strong> button!
                  </p>
                </div>
              </div>
            ) : (
              <div>
                <div className="flex-between mb-md">
                  <span className="text-xs text-muted">
                    Connected to Canva • Showing resume designs
                  </span>
                  <button
                    onClick={() => fetchCanvaDesigns(canvaToken)}
                    disabled={isLoadingCanva}
                    className="btn btn-ghost btn-xs text-purple"
                  >
                    <HiArrowPath /> Refresh Designs
                  </button>
                </div>

                {isLoadingCanva ? (
                  <div className="flex-center" style={{ padding: '48px 0' }}>
                    <div className="spinner" />
                  </div>
                ) : (
                  <>
                    <div className="grid-2 gap-sm mb-md">
                      {canvaDesigns.map((design) => (
                        <div
                          key={design.id}
                          onClick={() => setSelectedCanvaDesign(design)}
                          style={{
                            padding: '14px',
                            borderRadius: '12px',
                            background: selectedCanvaDesign?.id === design.id ? 'rgba(124, 58, 237, 0.2)' : '#171f33',
                            border: `1px solid ${selectedCanvaDesign?.id === design.id ? '#7c3aed' : 'rgba(255,255,255,0.08)'}`,
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                          }}
                        >
                          {design.thumbnail?.url && (
                            <img
                              src={design.thumbnail.url}
                              alt={design.title}
                              style={{ width: '100%', height: '140px', objectFit: 'cover', borderRadius: '8px', marginBottom: '10px' }}
                            />
                          )}
                          <div className="font-semibold text-white text-sm truncate">{design.title || 'Untitled Resume'}</div>
                          <div className="text-xs text-muted mt-xs">Updated {new Date(design.updated_at || Date.now()).toLocaleDateString()}</div>
                        </div>
                      ))}
                    </div>

                    {canvaDesigns.length === 0 && (
                      <div className="text-center" style={{ padding: '32px 16px' }}>
                        <p className="text-muted text-sm mb-md">
                          No resume designs found in your Canva account. Create a resume on Canva or export it as PDF/DOCX.
                        </p>
                      </div>
                    )}

                    {selectedCanvaDesign && (
                      <div className="p-md rounded-md mb-md" style={{ background: '#171f33', border: '1px solid #7c3aed' }}>
                        <h4 className="text-sm font-semibold text-white mb-xs">
                          Selected: {selectedCanvaDesign.title}
                        </h4>
                        <div className="form-group mb-xs">
                          <label className="label-text">Assign Category</label>
                          <select
                            value={canvaImportCategory}
                            onChange={(e) => setCanvaImportCategory(e.target.value)}
                            className="input-field"
                          >
                            <option value="Creative">Creative & Design</option>
                            <option value="Tech">Tech & Engineering</option>
                            <option value="Executive">Executive & Leadership</option>
                            <option value="Modern">Modern Minimalist</option>
                            <option value="General">General Purpose</option>
                          </select>
                        </div>
                      </div>
                    )}

                    <div className="flex-row gap-sm mt-lg">
                      <button
                        type="button"
                        onClick={() => {
                          setCanvaToken('');
                          localStorage.removeItem('canva_token');
                        }}
                        className="btn btn-outline btn-sm"
                      >
                        Disconnect Canva
                      </button>
                      <button
                        type="button"
                        onClick={handleImportCanvaDesign}
                        disabled={!selectedCanvaDesign || isImportingFromCanva}
                        className="btn btn-primary-gradient"
                        style={{ flex: 1 }}
                      >
                        {isImportingFromCanva ? 'Exporting & Importing...' : 'Import Selected Template'}
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default TemplatesPage;
