import * as resumeService from '../services/resume.service.js';
import universalTextExtractor from '../utils/resumeParser.js';
import * as aiService from '../services/ai.service.js';

export const createResume = async (req, res, next) => {
  try {
    const resume = await resumeService.createResume(req.user._id, req.body);
    return res.status(201).json({ success: true, data: resume });
  } catch (error) {
    next(error);
  }
};

export const getResumes = async (req, res, next) => {
  try {
    const resumes = await resumeService.getResumesByUser(req.user._id);
    return res.json({ success: true, data: resumes });
  } catch (error) {
    next(error);
  }
};

export const getResume = async (req, res, next) => {
  try {
    const resume = await resumeService.getResumeById(req.params.id, req.user._id);
    return res.json({ success: true, data: resume });
  } catch (error) {
    if (error.statusCode) return res.status(error.statusCode).json({ success: false, message: error.message });
    next(error);
  }
};

export const updateResume = async (req, res, next) => {
  try {
    const resume = await resumeService.updateResume(req.params.id, req.user._id, req.body);
    return res.json({ success: true, data: resume });
  } catch (error) {
    if (error.statusCode) return res.status(error.statusCode).json({ success: false, message: error.message });
    next(error);
  }
};

export const updateSection = async (req, res, next) => {
  try {
    const { section } = req.params;
    const validSections = ['personalInfo', 'summary', 'experience', 'education', 'skills', 'projects', 'certifications'];
    if (!validSections.includes(section)) {
      return res.status(400).json({ success: false, message: `Invalid section: ${section}` });
    }
    const resume = await resumeService.updateSection(req.params.id, req.user._id, section, req.body.data);
    return res.json({ success: true, data: resume });
  } catch (error) {
    if (error.statusCode) return res.status(error.statusCode).json({ success: false, message: error.message });
    next(error);
  }
};

export const updateTemplate = async (req, res, next) => {
  try {
    const { templateId } = req.body;
    // Accept all template IDs (not just the 5 base ones)
    const resume = await resumeService.updateTemplate(req.params.id, req.user._id, templateId);
    return res.json({ success: true, data: resume });
  } catch (error) {
    if (error.statusCode) return res.status(error.statusCode).json({ success: false, message: error.message });
    next(error);
  }
};

export const deleteResume = async (req, res, next) => {
  try {
    await resumeService.deleteResume(req.params.id, req.user._id);
    return res.json({ success: true, data: { message: 'Resume deleted successfully' } });
  } catch (error) {
    if (error.statusCode) return res.status(error.statusCode).json({ success: false, message: error.message });
    next(error);
  }
};

export const uploadResume = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded. Please upload a PDF, Word (.docx/.doc), or text file.',
      });
    }

    const { buffer, mimetype, originalname } = req.file;

    let extractedText;
    try {
      extractedText = await universalTextExtractor(buffer, mimetype, originalname);
    } catch (parseErr) {
      console.error('File parsing error:', parseErr.message);
      return res.status(400).json({
        success: false,
        message: `Could not read "${originalname}". Supported: PDF, DOCX, DOC, TXT. Error: ${parseErr.message}`,
      });
    }

    if (!extractedText || extractedText.length < 30) {
      return res.status(400).json({
        success: false,
        message: 'The file appears empty or text could not be extracted. Please try a different file.',
      });
    }

    const parsedSections = await aiService.parseResume({ resumeText: extractedText });
    const resume = await resumeService.createFromUpload(req.user._id, parsedSections);

    return res.status(201).json({ success: true, data: resume });
  } catch (error) {
    next(error);
  }
};