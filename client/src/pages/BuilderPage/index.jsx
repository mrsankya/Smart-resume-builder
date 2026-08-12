// ============================================
// BuilderPage.jsx - Main Resume Builder Page (Guest & Auth Sync Supported)
// ============================================

import './index.css';
import { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { ResumeProvider, ResumeContext } from '../../context/ResumeContext.jsx';
import { getResume, updateResume, createResume } from '../../services/resumeService.js';
import Navbar from '../../components/Navbar';
import ProgressBar from '../../components/ProgressBar';
import Sidebar from '../../components/Sidebar';
import ResumePreview from '../../components/ResumePreview';
import { HiCheckCircle, HiArrowPath, HiCloudArrowUp, HiSparkles } from 'react-icons/hi2';

function BuilderContent() {
  const { id } = useParams();
  const navigate = useNavigate();
  const {
    resume, loadResume, getCompletionPercentage,
    isSaving, setIsSaving, lastSaved, setLastSaved,
    hasChanges, setHasChanges,
  } = useContext(ResumeContext);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncingCloud, setIsSyncingCloud] = useState(false);

  const isGuestMode = id === 'guest-draft' || resume?.isGuest;

  // Load resume on mount
  useEffect(() => {
    const fetchResume = async () => {
      if (id === 'guest-draft') {
        const savedGuest = localStorage.getItem('guest_resume_draft');
        if (savedGuest) {
          try {
            loadResume(JSON.parse(savedGuest));
          } catch (e) {
            console.error('Failed to parse guest draft');
          }
        } else {
          loadResume({
            _id: 'guest-draft',
            title: 'My Professional Resume',
            templateId: 'classic',
            targetRole: '',
            sections: {
              personalInfo: { fullName: '', email: '', phone: '', location: '', title: '', summary: '' },
              experience: [],
              education: [],
              skills: [],
              projects: [],
              certifications: [],
              custom: [],
            },
            isGuest: true,
          });
        }
        setIsLoading(false);
        return;
      }

      try {
        const data = await getResume(id);
        loadResume(data);
      } catch (error) {
        toast.error('Failed to load resume');
      }
      setIsLoading(false);
    };

    fetchResume();
  }, [id]);

  // Auto-save with 3-second debounce
  useEffect(() => {
    if (!hasChanges || !resume) return;

    const timer = setTimeout(async () => {
      setIsSaving(true);
      if (isGuestMode) {
        localStorage.setItem('guest_resume_draft', JSON.stringify({ ...resume, isGuest: true }));
        setLastSaved(new Date());
        setHasChanges(false);
        setIsSaving(false);
        return;
      }

      if (resume._id && resume._id !== 'guest-draft') {
        try {
          await updateResume(resume._id, {
            title: resume.title,
            templateId: resume.templateId,
            targetRole: resume.targetRole,
            jobDescription: resume.jobDescription,
            sections: resume.sections,
          });
          setLastSaved(new Date());
          setHasChanges(false);
        } catch (error) {
          toast.error('Failed to save changes');
        }
      }
      setIsSaving(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, [hasChanges, resume, isGuestMode]);

  // Save guest draft to authenticated Cloud account
  const handleSaveToCloud = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      toast('Please sign in to save your resume to your cloud account.', { icon: '🔒' });
      navigate('/login?redirect=/builder/guest-draft');
      return;
    }

    setIsSyncingCloud(true);
    try {
      const created = await createResume({
        title: resume.title || 'My Resume',
        templateId: resume.templateId || 'classic',
        targetRole: resume.targetRole || '',
        jobDescription: resume.jobDescription || '',
        sections: resume.sections,
      });

      toast.success('🎉 Resume synced & saved permanently to your account!');
      localStorage.removeItem('guest_resume_draft');
      navigate(`/builder/${created._id}`, { replace: true });
    } catch (err) {
      console.error(err);
      toast.error('Failed to save to cloud. Please try again.');
    } finally {
      setIsSyncingCloud(false);
    }
  };

  const formatLastSaved = () => {
    if (!lastSaved) return '';
    return lastSaved.toLocaleTimeString('en-US', {
      hour: 'numeric', minute: '2-digit',
    });
  };

  if (isLoading) {
    return (
      <div className="page-bg min-h-screen flex-center">
        <div className="flex-col items-center gap-sm">
          <div className="spinner" />
          <p className="text-muted">Loading resume...</p>
        </div>
      </div>
    );
  }

  const percentage = getCompletionPercentage();

  return (
    <div className="flex-col" style={{ height: '100vh', overflow: 'hidden' }}>
      <Navbar title={resume.title} showBack />

      {/* Guest Mode Banner */}
      {isGuestMode && (
        <div
          style={{
            background: 'linear-gradient(90deg, #7c3aed, #06b6d4)',
            padding: '8px 20px',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '13px',
            fontWeight: 500,
            flexShrink: 0,
          }}
        >
          <div className="flex-row items-center gap-xs">
            <HiSparkles style={{ fontSize: '16px' }} />
            <span>
              <strong>Guest Draft Mode:</strong> Your work is auto-saved locally in this browser.
            </span>
          </div>
          <button
            onClick={handleSaveToCloud}
            disabled={isSyncingCloud}
            className="btn btn-sm"
            style={{
              background: '#ffffff',
              color: '#7c3aed',
              fontWeight: 700,
              padding: '4px 14px',
              borderRadius: '20px',
              border: 'none',
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
            }}
          >
            <HiCloudArrowUp style={{ fontSize: '16px' }} />
            {isSyncingCloud ? 'Saving to Cloud...' : 'Save to Cloud / Sign In'}
          </button>
        </div>
      )}

      {/* Progress bar + save indicator */}
      <div className="flex-row items-center gap-md px-lg py-sm border-bottom shrink-0" style={{ background: '#ffffff' }}>
        <div className="flex-1">
          <ProgressBar percentage={percentage} />
        </div>
        <div className="flex-row items-center gap-xs shrink-0">
          {isSaving ? (
            <>
              <HiArrowPath className="spinner-sm" style={{ fontSize: '14px' }} />
              <span className="text-xs">{isGuestMode ? 'Saving to browser...' : 'Saving...'}</span>
            </>
          ) : lastSaved ? (
            <>
              <HiCheckCircle style={{ fontSize: '14px', color: '#16a34a' }} />
              <span className="text-xs">
                {isGuestMode ? 'Saved in browser' : `Saved at ${formatLastSaved()}`}
              </span>
            </>
          ) : null}
        </div>
      </div>

      {/* Split layout */}
      <div className="builder-layout">
        {/* Left panel - Sidebar */}
        <div className="builder-sidebar">
          <Sidebar />
        </div>

        {/* Right panel - Preview */}
        <div className="builder-preview">
          <ResumePreview />
        </div>
      </div>
    </div>
  );
}

function BuilderPage() {
  return (
    <ResumeProvider>
      <BuilderContent />
    </ResumeProvider>
  );
}

export default BuilderPage;
