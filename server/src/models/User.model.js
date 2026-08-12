// ============================================
// User.model.js - User Database Schema
// ============================================
// Users can sign in via Google OAuth or email/password.
// ============================================

import mongoose from 'mongoose';

const userProfileSchema = new mongoose.Schema(
  {
    fullName: { type: String, default: '' },
    email: { type: String, default: '' },
    phone: { type: String, default: '' },
    location: { type: String, default: '' },
    targetRole: { type: String, default: '' },
    linkedIn: { type: String, default: '' },
    portfolio: { type: String, default: '' },
    github: { type: String, default: '' },
    summary: { type: String, default: '' },
    skills: {
      technical: [{ type: String }],
      soft: [{ type: String }],
      languages: [{ type: String }],
    },
    experience: [
      {
        company: { type: String, default: '' },
        role: { type: String, default: '' },
        startDate: { type: String, default: '' },
        endDate: { type: String, default: '' },
        current: { type: Boolean, default: false },
        bullets: [{ type: String }],
      },
    ],
    education: [
      {
        institution: { type: String, default: '' },
        degree: { type: String, default: '' },
        field: { type: String, default: '' },
        startDate: { type: String, default: '' },
        endDate: { type: String, default: '' },
        gpa: { type: String, default: '' },
      },
    ],
    certifications: [
      {
        name: { type: String, default: '' },
        issuer: { type: String, default: '' },
        date: { type: String, default: '' },
        link: { type: String, default: '' },
      },
    ],
  },
  { _id: false }
);

// Mongoose schema definition (MongoDB: Schema Design)
const userSchema = new mongoose.Schema(
  {
    googleId: {
      type: String,
      unique: true,
      sparse: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    password: {
      type: String,
    },
    picture: {
      type: String,
      default: '',
    },
    lastLogin: {
      type: Date,
      default: Date.now,
    },
    profile: {
      type: userProfileSchema,
      default: () => ({}),
    },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
    },
  },
  {
    timestamps: true, // Auto-generates createdAt and updatedAt (MongoDB: Schema Design)
  }
);

const User = mongoose.model('User', userSchema); // Mongoose model creation (MongoDB: Models)

export default User;
