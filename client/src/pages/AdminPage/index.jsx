// ============================================
// AdminPage.jsx - Admin Platform Intelligence & User/Resume Details
// ============================================

import './index.css';
import { useState, useEffect } from 'react';
import Navbar from '../../components/Navbar';
import toast from 'react-hot-toast';
import {
  getAdminStats,
  getAdminUsers,
  getUserResumes,
  getAdminResumes,
  getAdminResumeById,
  deleteAdminResume,
  deleteAdminUser,
} from '../../services/adminService.js';
import {
  HiUsers,
  HiDocumentText,
  HiSparkles,
  HiChartBar,
  HiMagnifyingGlass,
  HiTrash,
  HiEye,
  HiArrowDownTray,
  HiArrowPath,
  HiClock,
  HiXMark,
  HiBuildingOffice,
  HiAcademicCap,
  HiWrenchScrewdriver,
  HiBriefcase,
  HiEnvelope,
} from 'react-icons/hi2';
import TEMPLATES from '../../constants/templates.js';

function AdminPage() {
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'users' | 'resumes'
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [resumes, setResumes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Search queries
  const [userSearch, setUserSearch] = useState('');
  const [resumeSearch, setResumeSearch] = useState('');
  const [selectedTemplateFilter, setSelectedTemplateFilter] = useState('');

  // Selected User Modal / Drawer for Resumes
  const [selectedUserResumes, setSelectedUserResumes] = useState(null);
  const [isLoadingUserResumes, setIsLoadingUserResumes] = useState(false);

  // Inspect Resume Modal
  const [inspectResume, setInspectResume] = useState(null);
  const [isLoadingInspect, setIsLoadingInspect] = useState(false);

  useEffect(() => {
    loadAllAdminData();
  }, []);

  const loadAllAdminData = async () => {
    setIsLoading(true);
    try {
      const [statsData, usersData, resumesData] = await Promise.all([
        getAdminStats(),
        getAdminUsers(),
        getAdminResumes(),
      ]);
      setStats(statsData);
      setUsers(usersData.data || []);
      setResumes(resumesData.data || []);
    } catch (error) {
      console.error('Failed to load admin data:', error);
      toast.error('Failed to load admin intelligence data');
    } finally {
      setIsLoading(false);
    }
  };

  // Search & Filter handlers
  const handleSearchUsers = async (e) => {
    e.preventDefault();
    try {
      const res = await getAdminUsers({ search: userSearch });
      setUsers(res.data || []);
    } catch (err) {
      toast.error('Error searching users');
    }
  };

  const handleSearchResumes = async (e) => {
    e.preventDefault();
    try {
      const res = await getAdminResumes({
        search: resumeSearch,
        templateId: selectedTemplateFilter,
      });
      setResumes(res.data || []);
    } catch (err) {
      toast.error('Error searching resumes');
    }
  };

  // Inspect Specific Resume
  const handleInspectResume = async (resumeId) => {
    setIsLoadingInspect(true);
    try {
      const data = await getAdminResumeById(resumeId);
      setInspectResume(data);
    } catch (error) {
      toast.error('Failed to fetch full resume data');
    } finally {
      setIsLoadingInspect(false);
    }
  };

  // View Specific User's Resumes
  const handleViewUserResumes = async (userId) => {
    setIsLoadingUserResumes(true);
    try {
      const data = await getUserResumes(userId);
      setSelectedUserResumes(data);
    } catch (error) {
      toast.error('Failed to fetch user resumes');
    } finally {
      setIsLoadingUserResumes(false);
    }
  };

  // Delete Resume
  const handleDeleteResume = async (resumeId, e) => {
    if (e) e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this resume?')) return;
    try {
      await deleteAdminResume(resumeId);
      toast.success('Resume deleted successfully');
      setResumes((prev) => prev.filter((r) => r._id !== resumeId));
      if (inspectResume && inspectResume._id === resumeId) setInspectResume(null);
      if (selectedUserResumes) {
        setSelectedUserResumes((prev) => ({
          ...prev,
          resumes: prev.resumes.filter((r) => r._id !== resumeId),
        }));
      }
      loadAllAdminData();
    } catch (error) {
      toast.error('Failed to delete resume');
    }
  };

  // Delete User
  const handleDeleteUser = async (userId, e) => {
    if (e) e.stopPropagation();
    if (!window.confirm('Delete this user and ALL their resumes? This cannot be undone.')) return;
    try {
      await deleteAdminUser(userId);
      toast.success('User and resumes removed');
      setUsers((prev) => prev.filter((u) => u._id !== userId));
      loadAllAdminData();
    } catch (error) {
      toast.error('Failed to delete user');
    }
  };

  // Export to CSV
  const exportUsersCSV = () => {
    if (!users.length) return toast.error('No users to export');
    const headers = ['Name', 'Email', 'Auth Provider', 'Total Resumes', 'Avg ATS Score', 'Joined Date', 'Last Login'];
    const rows = users.map((u) => [
      `"${u.name}"`,
      `"${u.email}"`,
      `"${u.googleId ? 'Google' : 'Email/Password'}"`,
      u.totalResumes,
      u.avgAtsScore,
      `"${new Date(u.createdAt).toISOString()}"`,
      `"${new Date(u.lastLogin || u.updatedAt).toISOString()}"`,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `smart_resume_users_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Users exported to CSV');
  };

  const exportResumesCSV = () => {
    if (!resumes.length) return toast.error('No resumes to export');
    const headers = ['Resume Title', 'Owner Name', 'Owner Email', 'Template', 'Target Role', 'ATS Score', 'Created Date'];
    const rows = resumes.map((r) => [
      `"${r.title}"`,
      `"${r.userId?.name || 'Unknown'}"`,
      `"${r.userId?.email || 'Unknown'}"`,
      `"${r.templateId}"`,
      `"${r.targetRole || 'N/A'}"`,
      r.atsScore?.overall || 0,
      `"${new Date(r.createdAt).toISOString()}"`,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `smart_resume_catalog_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Resumes exported to CSV');
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getTemplate = (id) => TEMPLATES.find((t) => t.id === id) || TEMPLATES[0];

  return (
    <div className="page-bg min-h-screen">
      <Navbar />

      <div className="admin-container">
        {/* Admin Header */}
        <div className="admin-header">
          <div>
            <div className="admin-title-badge">
              <HiSparkles /> Admin Intelligence & Oversight
            </div>
            <h1 className="heading-xl">Platform Command Center</h1>
            <p className="text-muted mt-xs">
              Monitor active users, inspect created resumes, and analyze AI performance metrics.
            </p>
          </div>

          <div className="flex-row items-center gap-sm">
            <button onClick={loadAllAdminData} className="btn btn-outline btn-sm">
              <HiArrowPath /> Refresh
            </button>
            <button onClick={exportUsersCSV} className="btn btn-primary btn-sm">
              <HiArrowDownTray /> Export Users CSV
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        {stats && (
          <div className="admin-stats-grid">
            <div className="admin-stat-card">
              <div className="admin-stat-icon admin-stat-icon-purple">
                <HiUsers />
              </div>
              <div className="admin-stat-value">{stats.totalUsers}</div>
              <div className="admin-stat-title">Total Registered Users</div>
              <div className="admin-stat-sub">
                +{stats.newUsersThisWeek} new this week
              </div>
            </div>

            <div className="admin-stat-card">
              <div className="admin-stat-icon admin-stat-icon-emerald">
                <HiDocumentText />
              </div>
              <div className="admin-stat-value">{stats.totalResumes}</div>
              <div className="admin-stat-title">Resumes Generated</div>
              <div className="admin-stat-sub">
                +{stats.newResumesThisWeek} created this week
              </div>
            </div>

            <div className="admin-stat-card">
              <div className="admin-stat-icon admin-stat-icon-amber">
                <HiSparkles />
              </div>
              <div className="admin-stat-value">{stats.avgAtsScore}%</div>
              <div className="admin-stat-title">Avg ATS Optimization Score</div>
              <div className="admin-stat-sub" style={{ color: '#fbbf24' }}>
                AI scoring active
              </div>
            </div>

            <div className="admin-stat-card">
              <div className="admin-stat-icon admin-stat-icon-blue">
                <HiChartBar />
              </div>
              <div className="admin-stat-value">
                {stats.templateDistribution?.length || 0}
              </div>
              <div className="admin-stat-title">Templates in Use</div>
              <div className="admin-stat-sub" style={{ color: '#93c5fd' }}>
                Classic & Modern top picks
              </div>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="admin-tabs">
          <button
            onClick={() => setActiveTab('overview')}
            className={`admin-tab ${activeTab === 'overview' ? 'admin-tab-active' : ''}`}
          >
            <HiChartBar /> Analytics & Live Feeds
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`admin-tab ${activeTab === 'users' ? 'admin-tab-active' : ''}`}
          >
            <HiUsers /> Users Directory ({users.length})
          </button>
          <button
            onClick={() => setActiveTab('resumes')}
            className={`admin-tab ${activeTab === 'resumes' ? 'admin-tab-active' : ''}`}
          >
            <HiDocumentText /> Resumes Database ({resumes.length})
          </button>
        </div>

        {/* Loading Spinner */}
        {isLoading && (
          <div className="flex-center" style={{ padding: '60px 0' }}>
            <div className="spinner" />
          </div>
        )}

        {/* TAB 1: OVERVIEW */}
        {!isLoading && activeTab === 'overview' && stats && (
          <div className="grid-2">
            {/* Recent Users Stream */}
            <div className="card">
              <div className="flex-between mb-md">
                <h2 className="heading-sm flex-row items-center gap-xs">
                  <HiUsers style={{ color: '#d2bbff' }} /> Latest Registrations
                </h2>
                <button
                  onClick={() => setActiveTab('users')}
                  className="btn btn-ghost btn-xs text-purple"
                >
                  View All
                </button>
              </div>

              <div className="flex-col gap-sm">
                {stats.recentUsers?.map((u) => (
                  <div
                    key={u._id}
                    className="flex-between"
                    style={{
                      padding: '12px 14px',
                      background: '#171f33',
                      borderRadius: '12px',
                      border: '1px solid rgba(255,255,255,0.06)',
                    }}
                  >
                    <div className="user-cell">
                      {u.picture ? (
                        <img src={u.picture} alt="" className="user-cell-avatar" />
                      ) : (
                        <div className="user-cell-placeholder">
                          {u.name?.charAt(0) || 'U'}
                        </div>
                      )}
                      <div>
                        <div className="font-semibold text-white">{u.name}</div>
                        <div className="text-xs text-muted">{u.email}</div>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="badge badge-purple mb-xs">
                        {u.googleId ? 'Google Auth' : 'Email/Password'}
                      </span>
                      <div className="text-xs text-muted">{formatDate(u.createdAt)}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Template Popularity & Recent Resumes */}
            <div className="card">
              <div className="flex-between mb-md">
                <h2 className="heading-sm flex-row items-center gap-xs">
                  <HiDocumentText style={{ color: '#d2bbff' }} /> Recent Resumes Created
                </h2>
                <button
                  onClick={() => setActiveTab('resumes')}
                  className="btn btn-ghost btn-xs text-purple"
                >
                  View All
                </button>
              </div>

              <div className="flex-col gap-sm">
                {stats.recentResumes?.map((r) => {
                  const tmpl = getTemplate(r.templateId);
                  return (
                    <div
                      key={r._id}
                      className="flex-between"
                      style={{
                        padding: '12px 14px',
                        background: '#171f33',
                        borderRadius: '12px',
                        border: '1px solid rgba(255,255,255,0.06)',
                      }}
                    >
                      <div>
                        <div className="font-semibold text-white">{r.title}</div>
                        <div className="text-xs text-muted">
                          by {r.userId?.name || 'Anonymous User'} • {r.targetRole || tmpl.name}
                        </div>
                      </div>

                      <div className="flex-row items-center gap-sm">
                        {r.atsScore?.overall > 0 && (
                          <span
                            className={`admin-score-chip ${
                              r.atsScore.overall >= 80
                                ? 'admin-score-high'
                                : r.atsScore.overall >= 60
                                ? 'admin-score-mid'
                                : 'admin-score-low'
                            }`}
                          >
                            ATS {r.atsScore.overall}
                          </span>
                        )}
                        <button
                          onClick={() => handleInspectResume(r._id)}
                          className="btn-icon-sm btn-ghost"
                          title="Inspect Resume"
                        >
                          <HiEye style={{ fontSize: '16px', color: '#d2bbff' }} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: USERS DIRECTORY */}
        {!isLoading && activeTab === 'users' && (
          <div>
            <div className="admin-filter-bar">
              <form onSubmit={handleSearchUsers} className="admin-search-box">
                <HiMagnifyingGlass className="admin-search-icon" />
                <input
                  type="text"
                  placeholder="Search users by name or email..."
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  className="admin-search-input"
                />
              </form>

              <div className="text-xs text-muted">
                Showing {users.length} registered user{users.length !== 1 ? 's' : ''}
              </div>
            </div>

            <div className="admin-table-container">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Authentication</th>
                    <th>Resumes Built</th>
                    <th>Avg ATS Score</th>
                    <th>Joined Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u._id}>
                      <td>
                        <div className="user-cell">
                          {u.picture ? (
                            <img src={u.picture} alt="" className="user-cell-avatar" />
                          ) : (
                            <div className="user-cell-placeholder">
                              {u.name?.charAt(0) || 'U'}
                            </div>
                          )}
                          <div>
                            <div className="font-semibold text-white">{u.name}</div>
                            <div className="text-xs text-muted">{u.email}</div>
                          </div>
                        </div>
                      </td>

                      <td>
                        <span
                          className={`badge ${
                            u.googleId ? 'badge-purple' : 'badge-neutral'
                          }`}
                        >
                          {u.googleId ? 'Google Account' : 'Email/Password'}
                        </span>
                      </td>

                      <td>
                        <span className="font-semibold text-white">
                          {u.totalResumes}
                        </span>
                      </td>

                      <td>
                        {u.avgAtsScore > 0 ? (
                          <span
                            className={`admin-score-chip ${
                              u.avgAtsScore >= 80
                                ? 'admin-score-high'
                                : u.avgAtsScore >= 60
                                ? 'admin-score-mid'
                                : 'admin-score-low'
                            }`}
                          >
                            {u.avgAtsScore}%
                          </span>
                        ) : (
                          <span className="text-xs text-muted">-</span>
                        )}
                      </td>

                      <td>
                        <div className="text-xs text-muted">
                          {formatDate(u.createdAt)}
                        </div>
                      </td>

                      <td>
                        <div className="flex-row items-center gap-xs">
                          <button
                            onClick={() => handleViewUserResumes(u._id)}
                            className="btn btn-outline btn-xs"
                            title="View Resumes"
                          >
                            <HiDocumentText /> Resumes ({u.totalResumes})
                          </button>
                          <button
                            onClick={(e) => handleDeleteUser(u._id, e)}
                            className="btn-icon-sm btn-danger"
                            title="Delete User"
                          >
                            <HiTrash style={{ fontSize: '14px' }} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {users.length === 0 && (
                    <tr>
                      <td colSpan="6" className="text-center text-muted" style={{ padding: '40px' }}>
                        No users found matching your search.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: RESUMES DATABASE */}
        {!isLoading && activeTab === 'resumes' && (
          <div>
            <div className="admin-filter-bar">
              <form onSubmit={handleSearchResumes} className="admin-search-box">
                <HiMagnifyingGlass className="admin-search-icon" />
                <input
                  type="text"
                  placeholder="Search by resume title or target role..."
                  value={resumeSearch}
                  onChange={(e) => setResumeSearch(e.target.value)}
                  className="admin-search-input"
                />
              </form>

              <div className="flex-row items-center gap-sm">
                <select
                  value={selectedTemplateFilter}
                  onChange={(e) => setSelectedTemplateFilter(e.target.value)}
                  className="input-field"
                  style={{ width: '180px', padding: '8px 12px' }}
                >
                  <option value="">All Templates</option>
                  {TEMPLATES.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </select>
                <button onClick={exportResumesCSV} className="btn btn-outline btn-sm">
                  <HiArrowDownTray /> Export CSV
                </button>
              </div>
            </div>

            <div className="admin-table-container">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Resume Title</th>
                    <th>Owner</th>
                    <th>Template</th>
                    <th>Target Role</th>
                    <th>ATS Score</th>
                    <th>Created</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {resumes.map((r) => {
                    const tmpl = getTemplate(r.templateId);
                    return (
                      <tr key={r._id}>
                        <td>
                          <div className="font-semibold text-white">{r.title}</div>
                          <div className="text-xs text-muted">ID: {r._id.slice(-6)}</div>
                        </td>

                        <td>
                          <div>
                            <div className="text-sm font-medium text-white">
                              {r.userId?.name || 'Unknown'}
                            </div>
                            <div className="text-xs text-muted">
                              {r.userId?.email || 'N/A'}
                            </div>
                          </div>
                        </td>

                        <td>
                          <span
                            className="badge"
                            style={{
                              background: tmpl.colors.light,
                              color: tmpl.colors.primary,
                            }}
                          >
                            {tmpl.name}
                          </span>
                        </td>

                        <td>
                          <span className="text-sm">
                            {r.targetRole || <span className="text-muted">Not specified</span>}
                          </span>
                        </td>

                        <td>
                          {r.atsScore?.overall > 0 ? (
                            <span
                              className={`admin-score-chip ${
                                r.atsScore.overall >= 80
                                ? 'admin-score-high'
                                : r.atsScore.overall >= 60
                                ? 'admin-score-mid'
                                : 'admin-score-low'
                              }`}
                            >
                              {r.atsScore.overall}/100
                            </span>
                          ) : (
                            <span className="text-xs text-muted">Not Scored</span>
                          )}
                        </td>

                        <td>
                          <span className="text-xs text-muted">
                            {formatDate(r.createdAt)}
                          </span>
                        </td>

                        <td>
                          <div className="flex-row items-center gap-xs">
                            <button
                              onClick={() => handleInspectResume(r._id)}
                              className="btn btn-outline btn-xs"
                              title="Inspect Full Resume"
                            >
                              <HiEye /> Inspect
                            </button>
                            <button
                              onClick={(e) => handleDeleteResume(r._id, e)}
                              className="btn-icon-sm btn-danger"
                              title="Delete Resume"
                            >
                              <HiTrash style={{ fontSize: '14px' }} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  {resumes.length === 0 && (
                    <tr>
                      <td colSpan="7" className="text-center text-muted" style={{ padding: '40px' }}>
                        No resumes found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* MODAL 1: USER'S RESUMES DRAWER / MODAL */}
        {selectedUserResumes && (
          <div className="modal-overlay" onClick={() => setSelectedUserResumes(null)}>
            <div
              className="modal-content"
              style={{ maxWidth: '640px' }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex-between mb-md">
                <div>
                  <h2 className="heading-md">
                    {selectedUserResumes.user?.name}'s Resumes
                  </h2>
                  <p className="text-xs text-muted">
                    {selectedUserResumes.user?.email} • {selectedUserResumes.resumes?.length || 0} resumes
                  </p>
                </div>
                <button
                  onClick={() => setSelectedUserResumes(null)}
                  className="btn-icon btn-ghost"
                >
                  <HiXMark style={{ fontSize: '20px' }} />
                </button>
              </div>

              <div className="admin-modal-body flex-col gap-sm">
                {selectedUserResumes.resumes?.map((resume) => (
                  <div
                    key={resume._id}
                    className="flex-between"
                    style={{
                      padding: '14px 16px',
                      background: '#171f33',
                      borderRadius: '12px',
                      border: '1px solid rgba(255,255,255,0.08)',
                    }}
                  >
                    <div>
                      <div className="font-semibold text-white">{resume.title}</div>
                      <div className="text-xs text-muted mt-xs">
                        Role: {resume.targetRole || 'General'} • Template: {resume.templateId} • Updated {formatDate(resume.updatedAt)}
                      </div>
                    </div>

                    <div className="flex-row items-center gap-sm">
                      {resume.atsScore?.overall > 0 && (
                        <span className="admin-score-chip admin-score-high">
                          ATS {resume.atsScore.overall}
                        </span>
                      )}
                      <button
                        onClick={() => handleInspectResume(resume._id)}
                        className="btn btn-outline btn-xs"
                      >
                        <HiEye /> Inspect
                      </button>
                    </div>
                  </div>
                ))}
                {(!selectedUserResumes.resumes || selectedUserResumes.resumes.length === 0) && (
                  <p className="text-center text-muted" style={{ padding: '24px' }}>
                    This user hasn't created any resumes yet.
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* MODAL 2: INSPECT RESUME FULL DETAILS */}
        {inspectResume && (
          <div className="modal-overlay" onClick={() => setInspectResume(null)}>
            <div
              className="modal-content"
              style={{ maxWidth: '800px' }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex-between mb-md">
                <div>
                  <div className="flex-row items-center gap-sm">
                    <h2 className="heading-md">{inspectResume.title}</h2>
                    <span className="badge badge-purple">{inspectResume.templateId}</span>
                  </div>
                  <p className="text-xs text-muted mt-xs">
                    Owner: {inspectResume.userId?.name} ({inspectResume.userId?.email}) • Created {formatDate(inspectResume.createdAt)}
                  </p>
                </div>
                <button
                  onClick={() => setInspectResume(null)}
                  className="btn-icon btn-ghost"
                >
                  <HiXMark style={{ fontSize: '20px' }} />
                </button>
              </div>

              <div className="admin-modal-body">
                {/* Personal Information */}
                <div className="resume-section-card">
                  <h4 className="label-text mb-sm flex-row items-center gap-xs">
                    <HiBriefcase /> Personal Information
                  </h4>
                  <div className="grid-2">
                    <div>
                      <span className="text-xs text-muted">Full Name:</span>{' '}
                      <span className="text-sm font-semibold">
                        {inspectResume.sections?.personalInfo?.fullName || 'N/A'}
                      </span>
                    </div>
                    <div>
                      <span className="text-xs text-muted">Email:</span>{' '}
                      <span className="text-sm font-semibold">
                        {inspectResume.sections?.personalInfo?.email || 'N/A'}
                      </span>
                    </div>
                    <div>
                      <span className="text-xs text-muted">Phone:</span>{' '}
                      <span className="text-sm">
                        {inspectResume.sections?.personalInfo?.phone || 'N/A'}
                      </span>
                    </div>
                    <div>
                      <span className="text-xs text-muted">Location:</span>{' '}
                      <span className="text-sm">
                        {inspectResume.sections?.personalInfo?.location || 'N/A'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Professional Summary */}
                {inspectResume.sections?.summary && (
                  <div className="resume-section-card">
                    <h4 className="label-text mb-sm">Professional Summary</h4>
                    <p className="text-sm" style={{ lineHeight: 1.6 }}>
                      {inspectResume.sections.summary}
                    </p>
                  </div>
                )}

                {/* Work Experience */}
                {inspectResume.sections?.experience?.length > 0 && (
                  <div className="resume-section-card">
                    <h4 className="label-text mb-sm flex-row items-center gap-xs">
                      <HiBuildingOffice /> Experience ({inspectResume.sections.experience.length})
                    </h4>
                    <div className="flex-col gap-sm">
                      {inspectResume.sections.experience.map((exp, idx) => (
                        <div key={idx} style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '10px' }}>
                          <div className="flex-between">
                            <span className="font-semibold text-white">
                              {exp.role || 'Role'} at {exp.company || 'Company'}
                            </span>
                            <span className="text-xs text-muted">
                              {exp.startDate} - {exp.current ? 'Present' : exp.endDate}
                            </span>
                          </div>
                          {exp.bullets?.length > 0 && (
                            <ul style={{ paddingLeft: '20px', marginTop: '6px', fontSize: '13px', color: '#cbd5e1' }}>
                              {exp.bullets.map((b, bIdx) => (
                                <li key={bIdx}>{b}</li>
                              ))}
                            </ul>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Education */}
                {inspectResume.sections?.education?.length > 0 && (
                  <div className="resume-section-card">
                    <h4 className="label-text mb-sm flex-row items-center gap-xs">
                      <HiAcademicCap /> Education ({inspectResume.sections.education.length})
                    </h4>
                    {inspectResume.sections.education.map((edu, idx) => (
                      <div key={idx} className="flex-between mb-xs">
                        <div>
                          <span className="font-semibold text-white">
                            {edu.degree} in {edu.field}
                          </span>
                          <div className="text-xs text-muted">{edu.institution}</div>
                        </div>
                        <span className="text-xs text-muted">{edu.startDate} - {edu.endDate}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Skills */}
                <div className="resume-section-card">
                  <h4 className="label-text mb-sm flex-row items-center gap-xs">
                    <HiWrenchScrewdriver /> Skills & Technologies
                  </h4>
                  <div className="flex-wrap gap-xs" style={{ display: 'flex' }}>
                    {inspectResume.sections?.skills?.technical?.map((skill, idx) => (
                      <span key={idx} className="tag tag-purple">
                        {skill}
                      </span>
                    ))}
                    {inspectResume.sections?.skills?.soft?.map((skill, idx) => (
                      <span key={idx} className="tag tag-green">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                {/* ATS Analysis Breakdown */}
                {inspectResume.atsScore?.overall > 0 && (
                  <div className="resume-section-card">
                    <div className="flex-between mb-sm">
                      <h4 className="label-text flex-row items-center gap-xs">
                        <HiSparkles /> ATS Score Evaluation
                      </h4>
                      <span className="admin-score-chip admin-score-high">
                        {inspectResume.atsScore.overall}/100 Overall
                      </span>
                    </div>

                    {inspectResume.atsScore.missingKeywords?.length > 0 && (
                      <div>
                        <span className="text-xs text-muted">Missing Keywords:</span>
                        <div className="flex-wrap gap-xs mt-xs" style={{ display: 'flex' }}>
                          {inspectResume.atsScore.missingKeywords.map((kw, i) => (
                            <span key={i} className="tag tag-red">{kw}</span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="flex-between mt-lg">
                <button
                  onClick={(e) => handleDeleteResume(inspectResume._id, e)}
                  className="btn btn-danger btn-sm"
                >
                  <HiTrash /> Delete Resume
                </button>
                <button
                  onClick={() => setInspectResume(null)}
                  className="btn btn-outline btn-sm"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminPage;
