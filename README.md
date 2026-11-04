# Job Portal - BS IT Final Year Project

A full-stack, modern job portal web application featuring role-based access (Job Seekers, Recruiters, and Admins), suspicious/scam job detection, real-time messaging, resume upload, and Supabase integration.

---

## 🌟 Key Features

- **Authentication & User Management**: Powered by [Clerk](https://clerk.com/) with role onboarding (Job Seeker / Employer / Admin).
- **Job Discovery & Filtering**: Search jobs by title, location, company, and keywords with pagination and real-time filtering.
- **Application Workflow**: Apply to jobs with resume uploads and track application statuses (Applied, Interviewing, Hired, Rejected).
- **Recruiter Dashboard**: Post jobs, manage applicants, update statuses, and add company profiles.
- **Admin Dashboard**: Comprehensive moderation tools, suspicious job detection, user management, and system overview.
- **Suspicious Job Detection**: Automated backend analysis in `server.js` scanning for fraudulent patterns, unrealistic salary claims, MLM schemes, and suspicious company details.
- **Direct Messaging**: In-app communication between applicants and recruiters.
- **Responsive UI**: Built with Tailwind CSS, Radix UI primitives, Lucide icons, and dark/light theme support.

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: React 18 (Vite)
- **Styling**: Tailwind CSS, PostCSS, Radix UI primitives
- **Icons**: Lucide React
- **Routing**: React Router DOM (v6)
- **Form Handling**: React Hook Form, Zod

### Backend & Services
- **Backend API**: Node.js & Express (`server.js`)
- **Database & Storage**: [Supabase](https://supabase.com/) (PostgreSQL & Supabase Storage for resumes/logos)
- **Authentication**: [Clerk](https://clerk.com/)

---

## 🚀 Getting Started

### 1. Prerequisites
- Node.js (v18+ recommended)
- npm or yarn

### 2. Clone the Repository
```bash
git clone https://github.com/saram-x/BS-IT-Final-Year-Project.git
cd BS-IT-Final-Year-Project
```

### 3. Install Dependencies
```bash
npm install
```

### 4. Setup Environment Variables
Create a `.env` file in the root directory following `.env.example`:
```env
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Clerk Configuration
VITE_CLERK_PUBLISHABLE_KEY=pk_test_...
VITE_CLERK_SECRET_KEY=sk_test_...
CLERK_SECRET_KEY=sk_test_...
```

### 5. Run the Application
Run both the frontend and backend concurrently:
```bash
npm start
```
Or run separately:
```bash
# Frontend (Vite)
npm run dev

# Backend (Express API)
npm run backend
```

---

## 📁 Project Structure

```
├── public/                 # Static assets
├── src/
│   ├── api/                # Supabase & backend API client functions
│   ├── components/         # Shared UI components & Admin tables
│   ├── data/               # Static mock data & FAQ
│   ├── hooks/              # Custom React hooks (useFetch, useToast)
│   ├── layouts/            # App layout and navigation
│   ├── lib/                # Utility helpers
│   ├── pages/              # Route pages (Landing, Jobs, Admin, etc.)
│   └── utils/              # Supabase client initialization
├── Job Portal Documentation.docx  # Full Project Documentation
├── Perposal.pdf            # Initial Project Proposal
├── server.js               # Express server with fraud detection
└── vite.config.js          # Vite configuration
```

---

## 📄 License
This project was developed as a BS IT Final Year Project.

