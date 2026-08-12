import './index.css';
import { useState, useEffect, useContext } from 'react';
import Navbar from '../../components/Navbar';
import { AuthContext } from '../../context/AuthContext.jsx';
import { emailLogin as loginService } from '../../services/authService.js';
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
  getAdminAllTemplates,
  approveTemplate as approveTemplateService,
  rejectTemplate as rejectTemplateService,
  createOfficialTemplate as createOfficialTemplateService,
  deleteTemplate as deleteTemplateService,
} from '../../services/templateService.js';
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
  HiLockClosed,
  HiKey,
  HiPaintBrush,
  HiCheckBadge,
  HiPlus,
  HiDocumentArrowUp,
} from 'react-icons/hi2';
import TEMPLATES from '../../constants/templates.js';

function AdminPage() {
  const { user, login } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'users' | 'resumes' | 'templates'
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [resumes, setResumes] = useState([]);
  const [adminTemplates, setAdminTemplates] = useState([]);
  const [templateStatusFilter, setTemplateStatusFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(true);

  // Admin Create Official Template Modal
  const [showAddTemplateModal, setShowAddTemplateModal] = useState(false);
  const [isCreatingTemplate, setIsCreatingTemplate] = useState(false);
  const [officialName, setOfficialName] = useState('');
  const [officialCategory, setOfficialCategory] = useState('Tech');
  const [officialDesc, setOfficialDesc] = useState('');
  const [officialPrimaryColor, setOfficialPrimaryColor] = useState('#7c3aed');
  const [officialAccentColor, setOfficialAccentColor] = useState('#9333ea');
  const [officialFile, setOfficialFile] = useState(null);
  const [officialTags, setOfficialTags] = useState('');

  // Admin Login State for Security Gate
  const [adminEmailInput, setAdminEmailInput] = useState('sanketbhende0@gmail.com');
  const [adminPasswordInput, setAdminPasswordInput] = useState('');
  const [isAdminLoggingIn, setIsAdminLoggingIn] = useState(false);

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

  const isAdmin = user?.email?.toLowerCase() === 'sanketbhende0@gmail.com';

  useEffect(() => {
    if (isAdmin) {
      loadAllAdminData();
    } else {
      setIsLoading(false);
    }
  }, [user]);

  const handleAdminLogin = async (e) => {
    e.preventDefault();
    if (!adminPasswordInput) {
      toast.error('Please enter the admin password');
      return;
    }

    setIsAdminLoggingIn(true);
    try {
      const res = await loginService(adminEmailInput, adminPasswordInput);
      login(res.token, res.user);
      toast.success('👑 Welcome back, Sanket! Administrator access granted.');
      loadAllAdminData();
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || 'Invalid admin credentials');
    } finally {
      setIsAdminLoggingIn(false);
    }
  };

  const loadAllAdminData = async () => {
    setIsLoading(true);
    try {
      const [statsData, usersData, resumesData, templatesData] = await Promise.all([
        getAdminStats(),
        getAdminUsers(),
        getAdminResumes(),
        getAdminAllTemplates().catch(() => []),
      ]);
      setStats(statsData);
      setUsers(usersData.data || []);
      setResumes(resumesData.data || []);
      setAdminTemplates(templatesData || []);
    } catch (error) {
      console.error('Failed to load admin data:', error);
      toast.error('Failed to load admin intelligence data');
    } finally {
      setIsLoading(false);
    }
  };

  // Template Actions
  const handleApproveTemplate = async (templateId) => {
    try {
      await approveTemplateService(templateId);
      toast.success('✅ Template approved and published live!');
      loadAllAdminData();
    } catch (error) {
      toast.error('Failed to approve template');
    }
  };

  const handleRejectTemplate = async (templateId) => {
    try {
      await rejectTemplateService(templateId);
      toast.success('Template unpublished/rejected');
      loadAllAdminData();
    } catch (error) {
      toast.error('Failed to reject template');
    }
  };

  const handleDeleteTemplate = async (templateId) => {
    if (!window.confirm('Delete this template permanently?')) return;
    try {
      await deleteTemplateService(templateId);
      toast.success('Template deleted');
      setAdminTemplates((prev) => prev.filter((t) => t._id !== templateId));
    } catch (error) {
      toast.error('Failed to delete template');
    }
  };

  const handleCreateOfficialTemplate = async (e) => {
    e.preventDefault();
    if (!officialName.trim()) {
      toast.error('Template name is required');
      return;
    }

    setIsCreatingTemplate(true);
    try {
      const formData = new FormData();
      formData.append('name', officialName);
      formData.append('category', officialCategory);
      formData.append('description', officialDesc);
      formData.append('primaryColor', officialPrimaryColor);
      formData.append('accentColor', officialAccentColor);
      formData.append('tags', officialTags);
      if (officialFile) {
        formData.append('file', officialFile);
      }

      await createOfficialTemplateService(formData);
      toast.success('🎉 Official template created and made live on the site!');
      setShowAddTemplateModal(false);
      setOfficialName('');
      setOfficialDesc('');
      setOfficialFile(null);
      setOfficialTags('');
      loadAllAdminData();
    } catch (error) {
      toast.error('Failed to create official template');
    } finally {
      setIsCreatingTemplate(false);
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

  if (!isAdmin) {
    return (
      <div className="page-bg min-h-screen">
        <Navbar />
        <div className="flex-center" style={{ minHeight: 'calc(100vh - 120px)', padding: '24px' }}>
          <div
            className="card animate-fade-in"
            style={{
              maxWidth: '460px',
              width: '100%',
              padding: '36px',
              textAlign: 'center',
              borderTop: '4px solid #7c3aed',
            }}
          >
            <div className="icon-circle icon-circle-purple mb-md" style={{ margin: '0 auto 16px' }}>
              <HiLockClosed style={{ fontSize: '26px' }} />
            </div>
            <h2 className="heading-md mb-xs">Admin Access Required</h2>
            <p className="text-muted text-sm mb-lg">
              This area is restricted to system administrators. Please authenticate with administrator credentials to continue.
            </p>

            <form onSubmit={handleAdminLogin}>
              <div className="form-group text-left">
                <label className="label-text">Admin Email</label>
                <input
                  type="email"
                  value={adminEmailInput}
                  onChange={(e) => setAdminEmailInput(e.target.value)}
                  className="input-field"
                  placeholder="sanketbhende0@gmail.com"
                  required
                />
              </div>

              <div className="form-group text-left">
                <label className="label-text">Admin Password</label>
                <input
                  type="password"
                  value={adminPasswordInput}
                  onChange={(e) => setAdminPasswordInput(e.target.value)}
                  className="input-field"
                  placeholder="Enter admin password"
                  required
                  autoFocus
                />
              </div>

              <button
                type="submit"
                disabled={isAdminLoggingIn}
                className="btn btn-primary-gradient btn-full mt-md"
              >
                {isAdminLoggingIn ? (
                  <>
                    <div className="spinner spinner-sm" /> Verifying...
                  </>
                ) : (
                  <>
                    <HiKey /> Unlock Command Center
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

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
          <button
            onClick={() => setActiveTab('templates')}
            className={`admin-tab ${activeTab === 'templates' ? 'admin-tab-active' : ''}`}
          >
            <HiPaintBrush /> Custom Templates & Moderation ({adminTemplates.length})
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

        {/* TAB 4: TEMPLATES & COMMUNITY MODERATION */}
        {!isLoading && activeTab === 'templates' && (
          <div className="card">
            <div className="flex-between mb-md" style={{ flexWrap: 'wrap', gap: '16px' }}>
              <div>
                <h2 className="heading-sm flex-row items-center gap-xs">
                  <HiPaintBrush style={{ color: '#d2bbff' }} /> Custom & Official Template Moderation
                </h2>
                <p className="text-xs text-muted mt-xs">
                  Review user uploaded design files, approve community submissions, or publish new official templates.
                </p>
              </div>

              <div className="flex-row items-center gap-sm">
                <div className="templates-category-pills">
                  {['all', 'pending', 'approved', 'rejected'].map((st) => (
                    <button
                      key={st}
                      onClick={() => setTemplateStatusFilter(st)}
                      className={`category-pill ${templateStatusFilter === st ? 'category-pill-active' : ''}`}
                      style={{ textTransform: 'capitalize' }}
                    >
                      {st === 'approved' ? 'Live on Site' : st}
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => setShowAddTemplateModal(true)}
                  className="btn btn-primary-gradient btn-sm"
                >
                  <HiPlus /> Add Official Template
                </button>
              </div>
            </div>

            <div className="admin-table-container">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Template</th>
                    <th>Category</th>
                    <th>Submitted By</th>
                    <th>File & Layout</th>
                    <th>Colors</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {adminTemplates
                    .filter((t) =>
                      templateStatusFilter === 'all'
                        ? true
                        : t.status === templateStatusFilter
                    )
                    .map((t) => (
                      <tr key={t._id}>
                        <td>
                          <div className="flex-row items-center gap-sm">
                            <div
                              style={{
                                width: '36px',
                                height: '46px',
                                borderRadius: '4px',
                                background: t.colors?.primary || '#7c3aed',
                                border: '1px solid rgba(255,255,255,0.1)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: '#ffffff',
                                fontSize: '12px',
                                fontWeight: 'bold',
                              }}
                            >
                              {t.name?.charAt(0)}
                            </div>
                            <div>
                              <div className="font-semibold text-white flex-row items-center gap-xs">
                                {t.name}
                                {t.isOfficial && (
                                  <span className="admin-badge admin-badge-official" style={{ fontSize: '10px', padding: '2px 6px', background: 'rgba(124,58,237,0.3)', color: '#d2bbff', borderRadius: '4px' }}>
                                    Official
                                  </span>
                                )}
                              </div>
                              <div className="text-xs text-muted">{t.description || 'No description'}</div>
                            </div>
                          </div>
                        </td>

                        <td>
                          <span className="badge badge-gray">{t.category}</span>
                        </td>

                        <td>
                          {t.submittedBy ? (
                            <div>
                              <div className="text-sm font-medium text-white">{t.submittedBy.name}</div>
                              <div className="text-xs text-muted">{t.submittedBy.email}</div>
                            </div>
                          ) : (
                            <span className="text-xs text-muted">System Admin</span>
                          )}
                        </td>

                        <td>
                          <div>
                            <span className="text-xs font-semibold text-purple" style={{ textTransform: 'uppercase' }}>
                              {t.fileType || 'PDF'}
                            </span>
                            {t.fileUrl && (
                              <div className="mt-xs">
                                <a
                                  href={t.fileUrl}
                                  download={`${t.name}-template.${t.fileType || 'pdf'}`}
                                  className="text-xs text-blue hover:underline"
                                  target="_blank"
                                  rel="noopener noreferrer"
                                >
                                  ⬇ Download Attachment
                                </a>
                              </div>
                            )}
                          </div>
                        </td>

                        <td>
                          <div className="flex-row items-center gap-xs">
                            <div
                              style={{
                                width: '16px',
                                height: '16px',
                                borderRadius: '50%',
                                background: t.colors?.primary || '#7c3aed',
                              }}
                              title={`Primary: ${t.colors?.primary}`}
                            />
                            <div
                              style={{
                                width: '16px',
                                height: '16px',
                                borderRadius: '50%',
                                background: t.colors?.accent || '#9333ea',
                              }}
                              title={`Accent: ${t.colors?.accent}`}
                            />
                          </div>
                        </td>

                        <td>
                          {t.status === 'approved' && t.isLive ? (
                            <span className="admin-badge admin-badge-active flex-row items-center gap-xs">
                              <HiCheckBadge /> Live on Site
                            </span>
                          ) : t.status === 'pending' ? (
                            <span className="admin-badge admin-badge-pending">
                              Pending Review
                            </span>
                          ) : (
                            <span className="admin-badge admin-badge-deleted">
                              Rejected
                            </span>
                          )}
                        </td>

                        <td>
                          <div className="flex-row items-center gap-xs">
                            {t.status !== 'approved' ? (
                              <button
                                onClick={() => handleApproveTemplate(t._id)}
                                className="btn btn-outline btn-xs"
                                style={{ borderColor: '#10b981', color: '#10b981' }}
                                title="Approve & Make Live on Site"
                              >
                                ✅ Make Live
                              </button>
                            ) : (
                              <button
                                onClick={() => handleRejectTemplate(t._id)}
                                className="btn btn-outline btn-xs"
                                style={{ borderColor: '#f59e0b', color: '#f59e0b' }}
                                title="Unpublish / Reject"
                              >
                                Unpublish
                              </button>
                            )}

                            <button
                              onClick={() => handleDeleteTemplate(t._id)}
                              className="btn-icon-sm btn-danger"
                              title="Delete Template"
                            >
                              <HiTrash style={{ fontSize: '14px' }} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}

                  {adminTemplates.length === 0 && (
                    <tr>
                      <td colSpan="7" className="text-center text-muted" style={{ padding: '40px' }}>
                        No uploaded custom templates yet. Users can upload custom templates from the Template Gallery.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* MODAL 0: ADMIN CREATE OFFICIAL TEMPLATE MODAL */}
        {showAddTemplateModal && (
          <div className="modal-overlay" onClick={() => setShowAddTemplateModal(false)}>
            <div
              className="modal-content"
              style={{ maxWidth: '620px', maxHeight: '90vh', overflowY: 'auto' }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex-between mb-md">
                <div>
                  <h2 className="heading-md">Add Official Resume Template</h2>
                  <p className="text-xs text-muted mt-xs">
                    Create and publish a brand-new official template directly to the platform.
                  </p>
                </div>
                <button onClick={() => setShowAddTemplateModal(false)} className="btn-icon btn-ghost">
                  <HiXMark style={{ fontSize: '20px' }} />
                </button>
              </div>

              <form onSubmit={handleCreateOfficialTemplate}>
                <div className="grid-2">
                  <div className="form-group">
                    <label className="label-text">Template Name *</label>
                    <input
                      type="text"
                      value={officialName}
                      onChange={(e) => setOfficialName(e.target.value)}
                      placeholder="e.g. Wall Street Executive"
                      className="input-field"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="label-text">Category</label>
                    <select
                      value={officialCategory}
                      onChange={(e) => setOfficialCategory(e.target.value)}
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
                    value={officialDesc}
                    onChange={(e) => setOfficialDesc(e.target.value)}
                    placeholder="Short summary of this template layout..."
                    className="textarea-field"
                    style={{ minHeight: '65px' }}
                  />
                </div>

                <div className="grid-2">
                  <div className="form-group">
                    <label className="label-text">Primary Color</label>
                    <div className="flex-row items-center gap-sm">
                      <input
                        type="color"
                        value={officialPrimaryColor}
                        onChange={(e) => setOfficialPrimaryColor(e.target.value)}
                        style={{ width: '44px', height: '40px', padding: 0, border: 'none', background: 'none', cursor: 'pointer' }}
                      />
                      <input
                        type="text"
                        value={officialPrimaryColor}
                        onChange={(e) => setOfficialPrimaryColor(e.target.value)}
                        className="input-field"
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="label-text">Accent Color</label>
                    <div className="flex-row items-center gap-sm">
                      <input
                        type="color"
                        value={officialAccentColor}
                        onChange={(e) => setOfficialAccentColor(e.target.value)}
                        style={{ width: '44px', height: '40px', padding: 0, border: 'none', background: 'none', cursor: 'pointer' }}
                      />
                      <input
                        type="text"
                        value={officialAccentColor}
                        onChange={(e) => setOfficialAccentColor(e.target.value)}
                        className="input-field"
                      />
                    </div>
                  </div>
                </div>

                <div className="form-group">
                  <label className="label-text">Template Design File (Word DOCX, PDF, JSON)</label>
                  <div className="file-dropzone-box" onClick={() => document.getElementById('officialFileInput').click()}>
                    <HiDocumentArrowUp style={{ fontSize: '36px', color: '#d2bbff', margin: '0 auto 8px' }} />
                    <p className="text-sm font-semibold text-white">
                      {officialFile ? officialFile.name : 'Click to select template file (.docx, .pdf, .json)'}
                    </p>
                    <input
                      id="officialFileInput"
                      type="file"
                      accept=".pdf,.docx,.doc,.json"
                      onChange={(e) => setOfficialFile(e.target.files[0])}
                      style={{ display: 'none' }}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="label-text">Tags (comma separated)</label>
                  <input
                    type="text"
                    value={officialTags}
                    onChange={(e) => setOfficialTags(e.target.value)}
                    placeholder="e.g. executive, gold, finance, wall street"
                    className="input-field"
                  />
                </div>

                <div className="flex-row gap-sm mt-lg">
                  <button
                    type="button"
                    onClick={() => setShowAddTemplateModal(false)}
                    className="btn btn-outline"
                    style={{ flex: 1 }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isCreatingTemplate}
                    className="btn btn-primary-gradient"
                    style={{ flex: 1 }}
                  >
                    {isCreatingTemplate ? 'Publishing...' : 'Publish Official Template'}
                  </button>
                </div>
              </form>
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
