// ============================================
// admin.controller.js - Admin Analytics & Data Controller
// ============================================

import User from '../models/User.model.js';
import Resume from '../models/Resume.model.js';

/**
 * GET /api/admin/stats
 * Overview analytics for the admin dashboard
 */
export const getAdminStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalResumes = await Resume.countDocuments();

    // Calculate 7-day metrics
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const newUsersThisWeek = await User.countDocuments({
      createdAt: { $gte: sevenDaysAgo },
    });

    const newResumesThisWeek = await Resume.countDocuments({
      createdAt: { $gte: sevenDaysAgo },
    });

    // Average ATS Score
    const atsAggregation = await Resume.aggregate([
      { $match: { 'atsScore.overall': { $gt: 0 } } },
      {
        $group: {
          _id: null,
          avgScore: { $avg: '$atsScore.overall' },
        },
      },
    ]);
    const avgAtsScore = atsAggregation.length > 0 ? Math.round(atsAggregation[0].avgScore) : 0;

    // Template Distribution
    const templateDistribution = await Resume.aggregate([
      {
        $group: {
          _id: '$templateId',
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
    ]);

    // Recent Users
    const recentUsers = await User.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select('-password');

    // Recent Resumes
    const recentResumes = await Resume.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('userId', 'name email picture')
      .select('title templateId atsScore targetRole createdAt userId');

    return res.status(200).json({
      success: true,
      data: {
        totalUsers,
        totalResumes,
        avgAtsScore,
        newUsersThisWeek,
        newResumesThisWeek,
        templateDistribution,
        recentUsers,
        recentResumes,
      },
    });
  } catch (error) {
    console.error('Admin stats error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve admin stats',
      error: error.message,
    });
  }
};

/**
 * GET /api/admin/users
 * Returns list of users with search and aggregated resume counts
 */
export const getAdminUsers = async (req, res) => {
  try {
    const { search = '', page = 1, limit = 50 } = req.query;

    const query = {};
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const users = await User.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .select('-password')
      .lean();

    const total = await User.countDocuments(query);

    // Attach resume count & latest resume to each user
    const userIds = users.map((u) => u._id);
    const resumeStats = await Resume.aggregate([
      { $match: { userId: { $in: userIds } } },
      {
        $group: {
          _id: '$userId',
          totalResumes: { $sum: 1 },
          avgAtsScore: { $avg: '$atsScore.overall' },
          lastResumeCreated: { $max: '$createdAt' },
        },
      },
    ]);

    const statsMap = {};
    resumeStats.forEach((stat) => {
      statsMap[stat._id.toString()] = {
        totalResumes: stat.totalResumes,
        avgAtsScore: Math.round(stat.avgAtsScore || 0),
        lastResumeCreated: stat.lastResumeCreated,
      };
    });

    const enrichedUsers = users.map((user) => ({
      ...user,
      totalResumes: statsMap[user._id.toString()]?.totalResumes || 0,
      avgAtsScore: statsMap[user._id.toString()]?.avgAtsScore || 0,
      lastResumeCreated: statsMap[user._id.toString()]?.lastResumeCreated || null,
    }));

    return res.status(200).json({
      success: true,
      data: enrichedUsers,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error('Admin users error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve users',
      error: error.message,
    });
  }
};

/**
 * GET /api/admin/users/:userId/resumes
 * Returns all resumes created by a given user
 */
export const getUserResumes = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId).select('-password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const resumes = await Resume.find({ userId }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      data: {
        user,
        resumes,
      },
    });
  } catch (error) {
    console.error('Admin get user resumes error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve user resumes',
      error: error.message,
    });
  }
};

/**
 * GET /api/admin/resumes
 * Returns list of all resumes across the platform with owner details
 */
export const getAdminResumes = async (req, res) => {
  try {
    const { search = '', templateId = '', page = 1, limit = 50 } = req.query;

    const query = {};
    if (templateId) {
      query.templateId = templateId;
    }
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { targetRole: { $regex: search, $options: 'i' } },
        { 'sections.personalInfo.fullName': { $regex: search, $options: 'i' } },
        { 'sections.personalInfo.email': { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const resumes = await Resume.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate('userId', 'name email picture')
      .lean();

    const total = await Resume.countDocuments(query);

    return res.status(200).json({
      success: true,
      data: resumes,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error('Admin resumes error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve resumes',
      error: error.message,
    });
  }
};

/**
 * GET /api/admin/resumes/:resumeId
 * Returns full details of any resume
 */
export const getAdminResumeById = async (req, res) => {
  try {
    const { resumeId } = req.params;
    const resume = await Resume.findById(resumeId).populate('userId', 'name email picture');
    if (!resume) {
      return res.status(404).json({ success: false, message: 'Resume not found' });
    }

    return res.status(200).json({
      success: true,
      data: resume,
    });
  } catch (error) {
    console.error('Admin get resume by ID error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve resume details',
      error: error.message,
    });
  }
};

/**
 * DELETE /api/admin/resumes/:resumeId
 * Admin delete resume
 */
export const deleteAdminResume = async (req, res) => {
  try {
    const { resumeId } = req.params;
    const deleted = await Resume.findByIdAndDelete(resumeId);
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Resume not found' });
    }

    return res.status(200).json({
      success: true,
      message: 'Resume successfully deleted by admin',
    });
  } catch (error) {
    console.error('Admin delete resume error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete resume',
      error: error.message,
    });
  }
};

/**
 * DELETE /api/admin/users/:userId
 * Admin delete user and all their resumes
 */
export const deleteAdminUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findByIdAndDelete(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Also delete all resumes created by this user
    await Resume.deleteMany({ userId });

    return res.status(200).json({
      success: true,
      message: 'User and all associated resumes deleted by admin',
    });
  } catch (error) {
    console.error('Admin delete user error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete user',
      error: error.message,
    });
  }
};
