// ============================================
// Template.model.js - Template Management Schema
// ============================================

import mongoose from 'mongoose';

const templateSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Template name is required'],
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    category: {
      type: String,
      enum: ['Tech', 'Executive', 'Creative', 'Academic', 'Minimalist', 'Modern', 'General'],
      default: 'General',
    },
    description: {
      type: String,
      default: '',
    },
    thumbnailUrl: {
      type: String,
      default: '',
    },
    fileUrl: {
      type: String,
      default: '',
    },
    fileType: {
      type: String,
      enum: ['pdf', 'docx', 'doc', 'json', 'custom_css'],
      default: 'pdf',
    },
    colors: {
      primary: { type: String, default: '#7c3aed' },
      secondary: { type: String, default: '#4b5563' },
      accent: { type: String, default: '#9333ea' },
      bg: { type: String, default: '#ffffff' },
      headerBg: { type: String, default: '#f8fafc' },
    },
    layout: {
      type: String,
      enum: ['single-column', 'two-column', 'sidebar-left', 'sidebar-right', 'modern-split', 'compact-grid'],
      default: 'single-column',
    },
    fonts: {
      heading: { type: String, default: 'Plus Jakarta Sans' },
      body: { type: String, default: 'Inter' },
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
    submittedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    isOfficial: {
      type: Boolean,
      default: false,
    },
    isLive: {
      type: Boolean,
      default: true,
    },
    downloadsCount: {
      type: Number,
      default: 0,
    },
    rating: {
      type: Number,
      default: 5.0,
    },
    tags: [{ type: String }],
  },
  {
    timestamps: true,
  }
);

templateSchema.index({ status: 1, isLive: 1 });

const Template = mongoose.model('Template', templateSchema);

export default Template;
