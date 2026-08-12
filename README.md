# 🚀 Smart Resume Builder - AI-Powered Resume Maker

A full-stack, production-ready MERN application powered by Google Gemini AI and a multi-agent architecture to craft, optimize, review, and score ATS-friendly resumes in real time.

---

## ✨ Key Features

- **Multi-Agent AI Intelligence**:
  - **AI Writing Agent**: Generates impactful STAR-format bullet points with quantifiable results.
  - **ATS Scoring Engine**: 10-point audit assessing keyword optimization, layout, brevity, and ATS readability.
  - **Live Chat Assistant**: Conversational AI assistant to rewrite, suggest, or add resume sections on demand.
  - **Skill & Gap Matcher**: Analyzes job descriptions against resume content to highlight missing keywords.
- **Interactive Split-Screen Builder**: Real-time side-by-side editing with live preview and instant template toggling.
- **Professional Templates**: ATS-optimized resume templates (Classic, Modern, Executive, Minimal, Creative).
- **Google OAuth & JWT Authentication**: Fast and secure Google sign-in with automatic account linking.
- **1-Click PDF Export**: High-fidelity PDF generation via `@react-pdf/renderer`.
- **Version Control & History**: Manage and restore multiple resume revisions.

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: React 19 + Vite 6
- **Routing**: React Router v7
- **Styling**: Vanilla CSS + Tailwind CSS v4 + Plus Jakarta Sans / Inter typography
- **Authentication**: `@react-oauth/google`
- **PDF Generation**: `@react-pdf/renderer`
- **Icons & Notifications**: `react-icons`, `react-hot-toast`

### Backend
- **Runtime**: Node.js (ES Modules) + Express 5
- **Database**: MongoDB Atlas + Mongoose 9
- **AI & LLM**: Google Gemini AI (`@google/genai`, LangChain)
- **Auth & Security**: JWT (`jsonwebtoken`), `bcryptjs`, `google-auth-library`

---

## 🚦 Getting Started

### 1. Prerequisites
- Node.js (v18 or higher)
- MongoDB Atlas database URI
- Google Gemini API Key from [Google AI Studio](https://aistudio.google.com/app/apikey)
- Google OAuth 2.0 Client ID

### 2. Installation

Clone the repository:
```bash
git clone https://github.com/mrsankya/Smart-resume-builder.git
cd Smart-resume-builder
```

Install backend dependencies:
```bash
cd server
npm install
```

Install frontend dependencies:
```bash
cd ../client
npm install
```

### 3. Environment Configuration

#### Backend (`server/.env`):
```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
GEMINI_API_KEY=your_gemini_api_key
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
```

#### Frontend (`client/.env`):
```env
VITE_API_URL=http://localhost:5000/api
VITE_GOOGLE_CLIENT_ID=your_google_client_id
```

### 4. Running the Development Servers

#### Option A: Quick Start (Windows)
Double-click `start_dev_servers.bat` in the root folder to start both servers concurrently.

#### Option B: Manual Start

**Terminal 1 (Backend):**
```bash
cd server
npm run dev
```

**Terminal 2 (Frontend):**
```bash
cd client
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 📄 License
This project is licensed under the ISC License.
