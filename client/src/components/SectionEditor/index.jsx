// ============================================
// SectionEditor.jsx - Accordion Section List
// ============================================
// Maps over SECTION_TYPES, shows each as a clickable
// row. Active section expands to show its form.
// ============================================

import './index.css';
import { useContext, useState } from 'react';
import { ResumeContext } from '../../context/ResumeContext.jsx';
import SECTION_TYPES from '../../constants/sectionTypes.js';
import PersonalInfoForm from '../PersonalInfoForm';
import ExperienceForm from '../ExperienceForm';
import EducationForm from '../EducationForm';
import SkillsForm from '../SkillsForm';
import ProjectsForm from '../ProjectsForm';
import CertificationsForm from '../CertificationsForm';
import SummaryForm from '../SummaryForm';
import { HiChevronRight, HiSparkles, HiBolt } from 'react-icons/hi2';
import { getMasterProfile } from '../../services/profileService.js';
import toast from 'react-hot-toast';

function SectionEditor() {
  const { activeSection, setActiveSection, setResume, setHasChanges, resume } = useContext(ResumeContext);
  const [isAutoFilling, setIsAutoFilling] = useState(false);
  const isGuest = resume?._id === 'guest-draft' || resume?.isGuest;

  const renderForm = (sectionId) => {
    switch (sectionId) {
      case 'personalInfo':
        return <PersonalInfoForm />;
      case 'summary':
        return <SummaryForm />;
      case 'experience':
        return <ExperienceForm />;
      case 'education':
        return <EducationForm />;
      case 'skills':
        return <SkillsForm />;
      case 'projects':
        return <ProjectsForm />;
      case 'certifications':
        return <CertificationsForm />;
      default:
        return null;
    }
  };

  const handleAutoFillAll = async () => {
    if (isGuest) {
      toast('Sign in to use Master Profile auto-fill across devices.', { icon: '🔒' });
      return;
    }
    setIsAutoFilling(true);
    try {
      const profile = await getMasterProfile();
      if (!profile || (!profile.fullName && !profile.email)) {
        toast.error('No Master Profile saved yet. Visit your Profile page to set it up!');
        return;
      }

      setResume((prev) => ({
        ...prev,
        targetRole: profile.targetRole || prev.targetRole,
        sections: {
          ...prev.sections,
          personalInfo: {
            fullName: profile.fullName || prev.sections.personalInfo?.fullName || '',
            email: profile.email || prev.sections.personalInfo?.email || '',
            phone: profile.phone || prev.sections.personalInfo?.phone || '',
            location: profile.location || prev.sections.personalInfo?.location || '',
            linkedIn: profile.linkedIn || prev.sections.personalInfo?.linkedIn || '',
            portfolio: profile.portfolio || prev.sections.personalInfo?.portfolio || '',
            title: profile.targetRole || prev.sections.personalInfo?.title || '',
            summary: prev.sections.personalInfo?.summary || '',
          },
          summary: prev.sections.summary || profile.summary || '',
          skills: {
            technical: prev.sections.skills?.technical?.length
              ? prev.sections.skills.technical
              : (profile.skills?.technical || []),
            soft: prev.sections.skills?.soft?.length
              ? prev.sections.skills.soft
              : (profile.skills?.soft || []),
            languages: prev.sections.skills?.languages?.length
              ? prev.sections.skills.languages
              : (profile.skills?.languages || []),
          },
          experience: prev.sections.experience?.length
            ? prev.sections.experience
            : (profile.experience || []),
          education: prev.sections.education?.length
            ? prev.sections.education
            : (profile.education || []),
        },
      }));
      setHasChanges(true);
      toast.success('✨ All sections auto-filled from your Master Profile!');
    } catch (err) {
      console.error(err);
      toast.error('Failed to auto-fill. Make sure your Master Profile is saved.');
    } finally {
      setIsAutoFilling(false);
    }
  };

  return (
    <div>
      {/* Auto-Fill Banner — always visible at top */}
      <div
        style={{
          margin: '12px 12px 4px',
          padding: '10px 14px',
          background: isGuest
            ? 'rgba(100,116,139,0.12)'
            : 'linear-gradient(135deg, rgba(124,58,237,0.15), rgba(6,182,212,0.10))',
          border: isGuest
            ? '1px solid rgba(100,116,139,0.2)'
            : '1px solid rgba(124,58,237,0.3)',
          borderRadius: '10px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '8px',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <HiSparkles style={{ color: isGuest ? '#94a3b8' : '#a78bfa', fontSize: '14px', flexShrink: 0 }} />
            <span style={{ fontSize: '12px', fontWeight: 600, color: isGuest ? '#94a3b8' : '#e2d9f3' }}>
              {isGuest ? 'Sign in to use Auto-Fill' : 'Master Profile Auto-Fill'}
            </span>
          </div>
          <p style={{ fontSize: '11px', color: '#64748b', margin: '2px 0 0', lineHeight: 1.4 }}>
            {isGuest
              ? 'Build now, sync your profile after signing in.'
              : 'Fill all sections instantly from your saved profile.'}
          </p>
        </div>
        <button
          type="button"
          onClick={handleAutoFillAll}
          disabled={isAutoFilling}
          style={{
            flexShrink: 0,
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            fontSize: '11px',
            fontWeight: 700,
            padding: '6px 12px',
            borderRadius: '8px',
            border: isGuest ? '1px solid #475569' : '1px solid rgba(167,139,250,0.5)',
            background: isGuest ? 'transparent' : 'rgba(124,58,237,0.2)',
            color: isGuest ? '#94a3b8' : '#a78bfa',
            cursor: isGuest ? 'not-allowed' : 'pointer',
            transition: 'all 0.2s',
            whiteSpace: 'nowrap',
          }}
        >
          <HiBolt style={{ fontSize: '12px' }} />
          {isAutoFilling ? 'Filling...' : '⚡ Auto-Fill All'}
        </button>
      </div>

      {/* Section Accordions */}
      {SECTION_TYPES.map(({ id, label, icon: Icon }) => {
        const isActive = activeSection === id;

        return (
          <div key={id} className="accordion-item">
            <button
              onClick={() => setActiveSection(isActive ? '' : id)}
              className={`accordion-header ${isActive ? 'accordion-header-active' : ''}`}
            >
              <Icon className="accordion-icon" />
              <span className="flex-1 text-left">{label}</span>
              <HiChevronRight
                className={`accordion-chevron ${isActive ? 'rotate-90' : ''}`}
                style={isActive ? { transform: 'rotate(90deg)' } : {}}
              />
            </button>

            {isActive && (
              <div className="accordion-body">
                {renderForm(id)}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default SectionEditor;
