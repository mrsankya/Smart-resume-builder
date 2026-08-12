// ============================================
// ProfilePage.jsx - Master Profile & Auto-Fill Central Hub
// ============================================

import './index.css';
import { useState, useEffect, useContext } from 'react';
import Navbar from '../../components/Navbar';
import { AuthContext } from '../../context/AuthContext.jsx';
import toast from 'react-hot-toast';
import { getMasterProfile, updateMasterProfile } from '../../services/profileService.js';
import {
  HiUser,
  HiBriefcase,
  HiAcademicCap,
  HiWrenchScrewdriver,
  HiPlus,
  HiTrash,
  HiCheck,
  HiSparkles,
  HiGlobeAlt,
  HiDocumentText,
} from 'react-icons/hi2';

function ProfilePage() {
  const { user } = useContext(AuthContext);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Skill input drafts
  const [techInput, setTechInput] = useState('');
  const [softInput, setSoftInput] = useState('');

  // Master profile state
  const [profile, setProfile] = useState({
    fullName: '',
    email: '',
    phone: '',
    location: '',
    targetRole: '',
    linkedIn: '',
    portfolio: '',
    github: '',
    summary: '',
    skills: {
      technical: [],
      soft: [],
      languages: [],
    },
    experience: [],
    education: [],
  });

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    setIsLoading(true);
    try {
      const data = await getMasterProfile();
      setProfile({
        fullName: data.fullName || user?.name || '',
        email: data.email || user?.email || '',
        phone: data.phone || '',
        location: data.location || '',
        targetRole: data.targetRole || '',
        linkedIn: data.linkedIn || '',
        portfolio: data.portfolio || '',
        github: data.github || '',
        summary: data.summary || '',
        skills: {
          technical: data.skills?.technical || ['React', 'JavaScript', 'Node.js', 'Tailwind CSS'],
          soft: data.skills?.soft || ['Leadership', 'Problem Solving', 'Team Collaboration'],
          languages: data.skills?.languages || ['English'],
        },
        experience: data.experience?.length ? data.experience : [
          {
            company: 'Tech Solutions Inc.',
            role: 'Software Engineer',
            startDate: 'Jan 2023',
            endDate: 'Present',
            current: true,
            bullets: [
              'Developed and scaled full-stack web applications improving load times by 40%.',
              'Collaborated with cross-functional product and design teams to deliver key features on schedule.',
            ],
          },
        ],
        education: data.education?.length ? data.education : [
          {
            institution: 'University of Technology',
            degree: 'Bachelor of Science',
            field: 'Computer Science',
            startDate: '2019',
            endDate: '2023',
            gpa: '3.8/4.0',
          },
        ],
      });
    } catch (error) {
      console.error('Failed to load profile:', error);
      toast.error('Failed to load profile details');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async (e) => {
    if (e) e.preventDefault();
    setIsSaving(true);
    try {
      await updateMasterProfile(profile);
      toast.success('✨ Master profile saved! You can now 1-click auto-fill any resume.');
    } catch (error) {
      console.error('Save profile error:', error);
      toast.error('Failed to save profile');
    } finally {
      setIsSaving(false);
    }
  };

  // Skill Handlers
  const addTechnicalSkill = () => {
    if (!techInput.trim()) return;
    if (profile.skills.technical.includes(techInput.trim())) return;
    setProfile((prev) => ({
      ...prev,
      skills: {
        ...prev.skills,
        technical: [...prev.skills.technical, techInput.trim()],
      },
    }));
    setTechInput('');
  };

  const removeTechnicalSkill = (skill) => {
    setProfile((prev) => ({
      ...prev,
      skills: {
        ...prev.skills,
        technical: prev.skills.technical.filter((s) => s !== skill),
      },
    }));
  };

  const addSoftSkill = () => {
    if (!softInput.trim()) return;
    if (profile.skills.soft.includes(softInput.trim())) return;
    setProfile((prev) => ({
      ...prev,
      skills: {
        ...prev.skills,
        soft: [...prev.skills.soft, softInput.trim()],
      },
    }));
    setSoftInput('');
  };

  const removeSoftSkill = (skill) => {
    setProfile((prev) => ({
      ...prev,
      skills: {
        ...prev.skills,
        soft: prev.skills.soft.filter((s) => s !== skill),
      },
    }));
  };

  // Experience Handlers
  const addExperience = () => {
    setProfile((prev) => ({
      ...prev,
      experience: [
        ...prev.experience,
        {
          company: '',
          role: '',
          startDate: '',
          endDate: '',
          current: false,
          bullets: [''],
        },
      ],
    }));
  };

  const updateExp = (index, field, value) => {
    const updated = [...profile.experience];
    updated[index][field] = value;
    setProfile((prev) => ({ ...prev, experience: updated }));
  };

  const updateExpBullet = (expIndex, bulletIndex, value) => {
    const updated = [...profile.experience];
    updated[expIndex].bullets[bulletIndex] = value;
    setProfile((prev) => ({ ...prev, experience: updated }));
  };

  const addExpBullet = (expIndex) => {
    const updated = [...profile.experience];
    updated[expIndex].bullets.push('');
    setProfile((prev) => ({ ...prev, experience: updated }));
  };

  const removeExpBullet = (expIndex, bulletIndex) => {
    const updated = [...profile.experience];
    updated[expIndex].bullets.splice(bulletIndex, 1);
    setProfile((prev) => ({ ...prev, experience: updated }));
  };

  const removeExp = (index) => {
    setProfile((prev) => ({
      ...prev,
      experience: prev.experience.filter((_, i) => i !== index),
    }));
  };

  // Education Handlers
  const addEducation = () => {
    setProfile((prev) => ({
      ...prev,
      education: [
        ...prev.education,
        {
          institution: '',
          degree: '',
          field: '',
          startDate: '',
          endDate: '',
          gpa: '',
        },
      ],
    }));
  };

  const updateEdu = (index, field, value) => {
    const updated = [...profile.education];
    updated[index][field] = value;
    setProfile((prev) => ({ ...prev, education: updated }));
  };

  const removeEdu = (index) => {
    setProfile((prev) => ({
      ...prev,
      education: prev.education.filter((_, i) => i !== index),
    }));
  };

  if (isLoading) {
    return (
      <div className="page-bg flex-center min-h-screen">
        <div className="spinner" />
      </div>
    );
  }

  return (
    <div className="page-bg min-h-screen">
      <Navbar />

      <div className="profile-page-container">
        {/* Profile Header Bar */}
        <div className="profile-header-card">
          <div className="profile-user-info">
            {user?.picture ? (
              <img src={user.picture} alt={user.name} className="profile-avatar-large" />
            ) : (
              <div className="profile-avatar-placeholder-large">
                {user?.name?.charAt(0)?.toUpperCase() || 'U'}
              </div>
            )}
            <div>
              <h1 className="heading-lg">{profile.fullName || user?.name}</h1>
              <p className="text-muted text-sm mt-xs">
                {profile.targetRole || 'Software Professional'} • {profile.email || user?.email}
              </p>
              <div className="flex-row items-center gap-xs mt-sm">
                <span className="badge badge-success">
                  <HiSparkles /> Master Profile Ready for Auto-Fill
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={handleSave}
            disabled={isSaving}
            className="btn btn-primary-gradient"
          >
            {isSaving ? (
              <>
                <div className="spinner spinner-sm" /> Saving...
              </>
            ) : (
              <>
                <HiCheck /> Save Master Profile
              </>
            )}
          </button>
        </div>

        {/* SECTION 1: PERSONAL & CONTACT INFORMATION */}
        <div className="profile-section-block">
          <h2 className="section-title flex-row items-center gap-xs">
            <HiUser style={{ color: '#d2bbff' }} /> Personal & Contact Details
          </h2>

          <div className="grid-2">
            <div className="form-group">
              <label className="label-text">Full Name</label>
              <input
                type="text"
                value={profile.fullName}
                onChange={(e) => setProfile({ ...profile, fullName: e.target.value })}
                placeholder="e.g. Sanket Bhende"
                className="input-field"
              />
            </div>

            <div className="form-group">
              <label className="label-text">Target Job Role / Title</label>
              <input
                type="text"
                value={profile.targetRole}
                onChange={(e) => setProfile({ ...profile, targetRole: e.target.value })}
                placeholder="e.g. Senior Full Stack Engineer"
                className="input-field"
              />
            </div>

            <div className="form-group">
              <label className="label-text">Email Address</label>
              <input
                type="email"
                value={profile.email}
                onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                placeholder="sanket@example.com"
                className="input-field"
              />
            </div>

            <div className="form-group">
              <label className="label-text">Phone Number</label>
              <input
                type="tel"
                value={profile.phone}
                onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                placeholder="+1 (555) 000-0000"
                className="input-field"
              />
            </div>

            <div className="form-group">
              <label className="label-text">Location (City, State / Country)</label>
              <input
                type="text"
                value={profile.location}
                onChange={(e) => setProfile({ ...profile, location: e.target.value })}
                placeholder="San Francisco, CA"
                className="input-field"
              />
            </div>

            <div className="form-group">
              <label className="label-text">LinkedIn URL</label>
              <input
                type="url"
                value={profile.linkedIn}
                onChange={(e) => setProfile({ ...profile, linkedIn: e.target.value })}
                placeholder="https://linkedin.com/in/username"
                className="input-field"
              />
            </div>

            <div className="form-group">
              <label className="label-text">Portfolio / Website URL</label>
              <input
                type="url"
                value={profile.portfolio}
                onChange={(e) => setProfile({ ...profile, portfolio: e.target.value })}
                placeholder="https://sanketbhende.dev"
                className="input-field"
              />
            </div>

            <div className="form-group">
              <label className="label-text">GitHub URL</label>
              <input
                type="url"
                value={profile.github}
                onChange={(e) => setProfile({ ...profile, github: e.target.value })}
                placeholder="https://github.com/username"
                className="input-field"
              />
            </div>
          </div>
        </div>

        {/* SECTION 2: PROFESSIONAL SUMMARY */}
        <div className="profile-section-block">
          <h2 className="section-title flex-row items-center gap-xs">
            <HiDocumentText style={{ color: '#d2bbff' }} /> Professional Executive Summary
          </h2>
          <div className="form-group">
            <textarea
              rows={4}
              value={profile.summary}
              onChange={(e) => setProfile({ ...profile, summary: e.target.value })}
              placeholder="Write an impactful 3-4 sentence professional summary highlighting your key achievements, specialties, and value proposition..."
              className="textarea-field"
              style={{ minHeight: '120px' }}
            />
          </div>
        </div>

        {/* SECTION 3: SKILLS & TECH STACK */}
        <div className="profile-section-block">
          <h2 className="section-title flex-row items-center gap-xs">
            <HiWrenchScrewdriver style={{ color: '#d2bbff' }} /> Master Skills & Tech Stack
          </h2>

          <div className="form-group">
            <label className="label-text">Technical Skills & Frameworks</label>
            <div className="profile-tag-input-box">
              <input
                type="text"
                placeholder="Add skill (e.g. Next.js, Python, AWS)..."
                value={techInput}
                onChange={(e) => setTechInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTechnicalSkill())}
                className="input-field"
              />
              <button
                type="button"
                onClick={addTechnicalSkill}
                className="btn btn-outline btn-sm"
              >
                <HiPlus /> Add
              </button>
            </div>
            <div className="chip-input-container">
              {profile.skills.technical.map((skill, idx) => (
                <span key={idx} className="tag tag-purple">
                  {skill}
                  <button
                    type="button"
                    onClick={() => removeTechnicalSkill(skill)}
                    className="tag-remove"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>

          <div className="form-group mt-md">
            <label className="label-text">Soft Skills & Leadership</label>
            <div className="profile-tag-input-box">
              <input
                type="text"
                placeholder="Add skill (e.g. Agile, Strategic Planning)..."
                value={softInput}
                onChange={(e) => setSoftInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addSoftSkill())}
                className="input-field"
              />
              <button
                type="button"
                onClick={addSoftSkill}
                className="btn btn-outline btn-sm"
              >
                <HiPlus /> Add
              </button>
            </div>
            <div className="chip-input-container">
              {profile.skills.soft.map((skill, idx) => (
                <span key={idx} className="tag tag-green">
                  {skill}
                  <button
                    type="button"
                    onClick={() => removeSoftSkill(skill)}
                    className="tag-remove"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* SECTION 4: WORK EXPERIENCE */}
        <div className="profile-section-block">
          <div className="flex-between mb-md">
            <h2 className="section-title flex-row items-center gap-xs" style={{ marginBottom: 0 }}>
              <HiBriefcase style={{ color: '#d2bbff' }} /> Default Work Experience ({profile.experience.length})
            </h2>
            <button
              type="button"
              onClick={addExperience}
              className="btn btn-outline btn-xs"
            >
              <HiPlus /> Add Experience
            </button>
          </div>

          {profile.experience.map((exp, idx) => (
            <div key={idx} className="profile-entry-card">
              <div className="flex-between mb-sm">
                <span className="badge badge-purple">Position #{idx + 1}</span>
                <button
                  type="button"
                  onClick={() => removeExp(idx)}
                  className="btn-icon-sm btn-danger"
                  title="Remove Position"
                >
                  <HiTrash style={{ fontSize: '14px' }} />
                </button>
              </div>

              <div className="grid-2">
                <div className="form-group">
                  <label className="label-text">Job Role / Title</label>
                  <input
                    type="text"
                    value={exp.role}
                    onChange={(e) => updateExp(idx, 'role', e.target.value)}
                    placeholder="Senior Developer"
                    className="input-field"
                  />
                </div>
                <div className="form-group">
                  <label className="label-text">Company / Organization</label>
                  <input
                    type="text"
                    value={exp.company}
                    onChange={(e) => updateExp(idx, 'company', e.target.value)}
                    placeholder="Google Inc."
                    className="input-field"
                  />
                </div>
                <div className="form-group">
                  <label className="label-text">Start Date</label>
                  <input
                    type="text"
                    value={exp.startDate}
                    onChange={(e) => updateExp(idx, 'startDate', e.target.value)}
                    placeholder="e.g. Jan 2022"
                    className="input-field"
                  />
                </div>
                <div className="form-group">
                  <label className="label-text">End Date</label>
                  <input
                    type="text"
                    value={exp.endDate}
                    onChange={(e) => updateExp(idx, 'endDate', e.target.value)}
                    placeholder="e.g. Present"
                    className="input-field"
                  />
                </div>
              </div>

              {/* Bullet Points */}
              <div className="form-group">
                <div className="flex-between mb-xs">
                  <label className="label-text">Key Accomplishments & Responsibilities</label>
                  <button
                    type="button"
                    onClick={() => addExpBullet(idx)}
                    className="btn btn-ghost btn-xs text-purple"
                  >
                    + Add Bullet
                  </button>
                </div>
                {exp.bullets.map((b, bIdx) => (
                  <div key={bIdx} className="flex-row items-center gap-xs mb-xs">
                    <input
                      type="text"
                      value={b}
                      onChange={(e) => updateExpBullet(idx, bIdx, e.target.value)}
                      placeholder="Achieved X as measured by Y by doing Z..."
                      className="input-field"
                      style={{ padding: '8px 12px' }}
                    />
                    {exp.bullets.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeExpBullet(idx, bIdx)}
                        className="btn-icon-sm btn-ghost text-danger"
                      >
                        <HiTrash style={{ fontSize: '13px' }} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* SECTION 5: EDUCATION */}
        <div className="profile-section-block">
          <div className="flex-between mb-md">
            <h2 className="section-title flex-row items-center gap-xs" style={{ marginBottom: 0 }}>
              <HiAcademicCap style={{ color: '#d2bbff' }} /> Education History ({profile.education.length})
            </h2>
            <button
              type="button"
              onClick={addEducation}
              className="btn btn-outline btn-xs"
            >
              <HiPlus /> Add Education
            </button>
          </div>

          {profile.education.map((edu, idx) => (
            <div key={idx} className="profile-entry-card">
              <div className="flex-between mb-sm">
                <span className="badge badge-purple">Education #{idx + 1}</span>
                <button
                  type="button"
                  onClick={() => removeEdu(idx)}
                  className="btn-icon-sm btn-danger"
                >
                  <HiTrash style={{ fontSize: '14px' }} />
                </button>
              </div>

              <div className="grid-2">
                <div className="form-group">
                  <label className="label-text">Degree</label>
                  <input
                    type="text"
                    value={edu.degree}
                    onChange={(e) => updateEdu(idx, 'degree', e.target.value)}
                    placeholder="Bachelor of Science"
                    className="input-field"
                  />
                </div>
                <div className="form-group">
                  <label className="label-text">Field of Study</label>
                  <input
                    type="text"
                    value={edu.field}
                    onChange={(e) => updateEdu(idx, 'field', e.target.value)}
                    placeholder="Computer Science"
                    className="input-field"
                  />
                </div>
                <div className="form-group">
                  <label className="label-text">Institution / University</label>
                  <input
                    type="text"
                    value={edu.institution}
                    onChange={(e) => updateEdu(idx, 'institution', e.target.value)}
                    placeholder="Stanford University"
                    className="input-field"
                  />
                </div>
                <div className="form-group">
                  <label className="label-text">Graduation / Dates</label>
                  <input
                    type="text"
                    value={edu.endDate}
                    onChange={(e) => updateEdu(idx, 'endDate', e.target.value)}
                    placeholder="2020 - 2024"
                    className="input-field"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Save Bar */}
        <div className="flex-between mt-xl">
          <p className="text-xs text-muted">
            All details saved here will automatically be available to 1-click auto-fill inside any resume editor!
          </p>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="btn btn-primary-gradient"
            style={{ padding: '12px 32px' }}
          >
            {isSaving ? 'Saving Master Profile...' : 'Save Master Profile'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ProfilePage;
