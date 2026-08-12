// ============================================
// template.controller.js - Template Management & Submissions
// ============================================

import Template from '../models/Template.model.js';

/**
 * GET /api/templates
 * Get all live & approved templates available for users
 */
export const getLiveTemplates = async (req, res) => {
  try {
    const { category = '', search = '' } = req.query;

    const query = {
      isLive: true,
      status: 'approved',
    };

    if (category && category !== 'All') {
      query.category = category;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } },
      ];
    }

    const templates = await Template.find(query)
      .sort({ isOfficial: -1, downloadsCount: -1, createdAt: -1 })
      .populate('submittedBy', 'name email picture');

    return res.status(200).json({
      success: true,
      data: templates,
    });
  } catch (error) {
    console.error('Error fetching live templates:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch templates',
      error: error.message,
    });
  }
};

/**
 * GET /api/templates/:id
 * Get single template by ID or slug
 */
export const getTemplateById = async (req, res) => {
  try {
    const { id } = req.params;
    const template = await Template.findOne({
      $or: [{ _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }, { slug: id }],
    }).populate('submittedBy', 'name email picture');

    if (!template) {
      return res.status(404).json({ success: false, message: 'Template not found' });
    }

    return res.status(200).json({
      success: true,
      data: template,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error fetching template',
      error: error.message,
    });
  }
};

/**
 * POST /api/templates/submit
 * User submits a custom template design / file for admin review
 */
export const submitCustomTemplate = async (req, res) => {
  try {
    const {
      name,
      category = 'General',
      description = '',
      layout = 'single-column',
      primaryColor = '#7c3aed',
      secondaryColor = '#4b5563',
      accentColor = '#9333ea',
      tags = '',
    } = req.body;

    if (!name) {
      return res.status(400).json({ success: false, message: 'Template name is required.' });
    }

    const slug = `${name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${Date.now().toString().slice(-4)}`;

    let fileUrl = '';
    let fileType = 'pdf';

    if (req.file) {
      const b64 = req.file.buffer.toString('base64');
      const mime = req.file.mimetype;
      fileUrl = `data:${mime};base64,${b64}`;

      if (req.file.originalname.endsWith('.docx') || req.file.originalname.endsWith('.doc')) {
        fileType = 'docx';
      } else if (req.file.originalname.endsWith('.json')) {
        fileType = 'json';
      } else {
        fileType = 'pdf';
      }
    }

    const templateTags = Array.isArray(tags)
      ? tags
      : tags.split(',').map((t) => t.trim()).filter(Boolean);

    const template = await Template.create({
      name,
      slug,
      category,
      description,
      fileUrl,
      fileType,
      layout,
      colors: {
        primary: primaryColor,
        secondary: secondaryColor,
        accent: accentColor,
        bg: '#ffffff',
        headerBg: '#f8fafc',
      },
      status: 'pending', // Awaits admin approval
      isLive: false,
      isOfficial: false,
      submittedBy: req.user._id,
      tags: templateTags,
    });

    return res.status(201).json({
      success: true,
      message: 'Custom template submitted! It will be reviewed by admin before going live.',
      data: template,
    });
  } catch (error) {
    console.error('Error submitting template:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to submit template',
      error: error.message,
    });
  }
};

/**
 * GET /api/admin/templates/all
 * Admin gets all templates (pending, approved, official)
 */
export const getAdminAllTemplates = async (req, res) => {
  try {
    const templates = await Template.find()
      .sort({ createdAt: -1 })
      .populate('submittedBy', 'name email picture');

    return res.status(200).json({
      success: true,
      data: templates,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to load templates for admin',
      error: error.message,
    });
  }
};

/**
 * PUT /api/admin/templates/:id/approve
 * Admin approves a custom template and publishes it live
 */
export const approveTemplate = async (req, res) => {
  try {
    const { id } = req.params;
    const template = await Template.findById(id);

    if (!template) {
      return res.status(404).json({ success: false, message: 'Template not found' });
    }

    template.status = 'approved';
    template.isLive = true;
    await template.save();

    return res.status(200).json({
      success: true,
      message: `Template "${template.name}" is now approved and live across the platform!`,
      data: template,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to approve template',
      error: error.message,
    });
  }
};

/**
 * PUT /api/admin/templates/:id/reject
 * Admin rejects or unpublishes a template
 */
export const rejectTemplate = async (req, res) => {
  try {
    const { id } = req.params;
    const template = await Template.findById(id);

    if (!template) {
      return res.status(404).json({ success: false, message: 'Template not found' });
    }

    template.status = 'rejected';
    template.isLive = false;
    await template.save();

    return res.status(200).json({
      success: true,
      message: `Template "${template.name}" has been rejected.`,
      data: template,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to reject template',
      error: error.message,
    });
  }
};

/**
 * POST /api/admin/templates/create
 * Admin creates an official template directly
 */
export const createOfficialTemplate = async (req, res) => {
  try {
    const {
      name,
      category = 'Tech',
      description = '',
      layout = 'single-column',
      primaryColor = '#7c3aed',
      secondaryColor = '#4b5563',
      accentColor = '#9333ea',
      tags = '',
    } = req.body;

    if (!name) {
      return res.status(400).json({ success: false, message: 'Template name is required.' });
    }

    const slug = `${name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${Date.now().toString().slice(-4)}`;

    let fileUrl = '';
    let fileType = 'pdf';

    if (req.file) {
      const b64 = req.file.buffer.toString('base64');
      const mime = req.file.mimetype;
      fileUrl = `data:${mime};base64,${b64}`;

      if (req.file.originalname.endsWith('.docx') || req.file.originalname.endsWith('.doc')) {
        fileType = 'docx';
      } else if (req.file.originalname.endsWith('.json')) {
        fileType = 'json';
      }
    }

    const templateTags = Array.isArray(tags)
      ? tags
      : tags.split(',').map((t) => t.trim()).filter(Boolean);

    const template = await Template.create({
      name,
      slug,
      category,
      description,
      fileUrl,
      fileType,
      layout,
      colors: {
        primary: primaryColor,
        secondary: secondaryColor,
        accent: accentColor,
        bg: '#ffffff',
        headerBg: '#f8fafc',
      },
      status: 'approved',
      isLive: true,
      isOfficial: true,
      submittedBy: req.user._id,
      tags: templateTags,
    });

    return res.status(201).json({
      success: true,
      message: 'Official template created and made live!',
      data: template,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to create official template',
      error: error.message,
    });
  }
};

/**
 * DELETE /api/admin/templates/:id
 * Delete a template
 */
export const deleteTemplate = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Template.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Template not found' });
    }

    return res.status(200).json({
      success: true,
      message: 'Template deleted successfully',
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to delete template',
      error: error.message,
    });
  }
};
