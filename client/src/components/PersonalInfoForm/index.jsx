import { useContext, useState } from 'react';
import { ResumeContext } from '../../context/ResumeContext.jsx';
import { getMasterProfile } from '../../services/profileService.js';
import toast from 'react-hot-toast';
import { HiSparkles } from 'react-icons/hi2';

const FIELDS = [
  { key: 'fullName', label: 'Full Name', type: 'text', placeholder: 'Sanket Bhende' },
  { key: 'email', label: 'Email', type: 'email', placeholder: 'sanket@example.com' },
  { key: 'phone', label: 'Phone', type: 'tel', placeholder: '+91 98765 43210' },
  { key: 'location', label: 'Location', type: 'text', placeholder: 'Mumbai, India' },
  { key: 'linkedIn', label: 'LinkedIn', type: 'url', placeholder: 'linkedin.com/in/sanketbhende' },
  { key: 'portfolio', label: 'Portfolio', type: 'url', placeholder: 'sanketbhende.dev' },
];

function PersonalInfoForm() {
  const { resume, setResume, setHasChanges, updateSection } = useContext(ResumeContext);
  const personalInfo = resume.sections.personalInfo;
  const [isAutoFilling, setIsAutoFilling] = useState(false);

  const handleChange = (key, value) => {
    updateSection('personalInfo', { ...personalInfo, [key]: value });
  };

  const handleAutoFill = async () => {
    setIsAutoFilling(true);
    try {
      const profile = await getMasterProfile();
      if (!profile || (!profile.fullName && !profile.email)) {
        toast.error('No master profile saved yet. Visit your Profile page to set it up!');
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
      toast.success('✨ Auto-filled resume with your Master Profile data!');
    } catch (err) {
      console.error(err);
      toast.error('Failed to auto-fill from master profile');
    } finally {
      setIsAutoFilling(false);
    }
  };

  return (
    <div>
      <div
        className="flex-between mb-md"
        style={{
          padding: '12px 16px',
          background: 'rgba(124, 58, 237, 0.12)',
          border: '1px solid rgba(210, 187, 255, 0.25)',
          borderRadius: '12px',
        }}
      >
        <div>
          <span className="text-sm font-semibold text-white flex-row items-center gap-xs">
            <HiSparkles style={{ color: '#d2bbff' }} /> Master Profile Sync
          </span>
          <p className="text-xs text-muted mt-xs">
            Save time by auto-filling your personal details, summary, and skills from your profile.
          </p>
        </div>
        <button
          type="button"
          onClick={handleAutoFill}
          disabled={isAutoFilling}
          className="btn btn-outline btn-xs"
        >
          {isAutoFilling ? 'Syncing...' : '⚡ Auto-Fill from Profile'}
        </button>
      </div>

      <div className="grid-2">
        {FIELDS.map(({ key, label, type, placeholder }) => (
          <div key={key} className="form-group">
            <label className="label-text">
              {label}
            </label>
            <input
              type={type}
              value={personalInfo[key] || ''}
              onChange={(e) => handleChange(key, e.target.value)}
              className="input-field"
              placeholder={placeholder}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

export default PersonalInfoForm;
