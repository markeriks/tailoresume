# TailoResume

## Introduction

TailoResume is a web application that allows users to tailor their resumes to specific job postings using AI. Users can input a job posting URL and upload their resume in DOCX format, and the platform will automatically customize their resume content to better match the job requirements. The application includes a rich text editor for manual resume editing and consists of a Next.js frontend with a Python FastAPI backend, integrated with Firebase for authentication and Stripe for payments.

## Live Website

**https://tailoresume.com**

## Tech Stack

### Frontend
- **Next.js 14** - React framework with App Router
- **TypeScript** - Type-safe JavaScript
- **Tailwind CSS** - Utility-first CSS framework
- **TipTap** - Rich text editor for resume editing
- **Firebase Auth** - User authentication
- **Stripe** - Payment processing
- **Vercel** - Frontend hosting

### Backend
- **Python** - Backend language
- **FastAPI** - API endpoints
- **Firebase** - Authentication and database services
- **Fly.io** - Backend hosting

## Frontend Flow

### Landing Page (`/`)
- **Hero section** with product overview and call-to-action
- **How It Works** section explaining the 3-step process
- **Persona section** targeting job seekers
- **Navigation** to Blog (`/blog`) and Pricing (`/pricing`) pages
- **Authentication buttons** (Sign In/Get Started) in navbar

### Authentication Flow
- **Signup** (`/signup`):
  - Email/password registration with Firebase Auth
  - Google OAuth integration
  - Email verification required before account activation
  - New users get 20 free credits upon signup
  - User document created in Firestore with plan, credits, and metadata
- **Login** (`/login`):
  - Email/password authentication
  - Google OAuth sign-in
  - Email verification check for unverified accounts
  - Password reset functionality
- **Email Verification** (`/help?mode=verify`):
  - Handles email verification links
  - Redirects to login after successful verification

### Dashboard Flow (`/dashboard`)
- **Protected route** requiring authentication
- **Credit system**: Users start with 20 credits, monthly refills based on plan
- **Main interface**:
  1. **Job URL input**: Paste job posting URL (uses Diffbot API for content extraction)
  2. **Resume upload**: DOCX file upload with validation
  3. **Tailor Resume button**: Triggers AI processing
- **Processing workflow**:
  1. Extracts job title and content using Diffbot API
  2. Converts DOCX to HTML using Mammoth.js
  3. Sends data to FastAPI backend for AI tailoring
  4. Deducts 5 credits per tailoring operation
  5. Shows original resume immediately, loads tailored version when ready
- **Rich text editor**: TipTap-based editor for manual resume editing
- **Export functionality**: PDF generation and download
- **Credit management**: Real-time credit display and refill notifications

### Pricing & Checkout Flow
- **Pricing page** (`/pricing`): Three tiers (Free, Standard, Pro) with monthly/quarterly billing
- **Stripe integration**: Secure payment processing
- **Checkout flow**:
  1. User selects plan and billing period
  2. Redirected to Stripe Checkout
  3. Payment processing and subscription creation
  4. Success page (`/success`) with plan confirmation
  5. User plan updated in Firestore
- **Credit refills**: Automatic monthly credit allocation based on plan

### Blog System
- **Blog listing** (`/blog`): MDX-based blog posts
- **Individual posts** (`/blog/[slug]`): Dynamic routing for blog content
- **SEO optimization**: Meta tags and Open Graph images

## Backend Flow

### `/tailor` (POST)
**Purpose**: Main resume tailoring endpoint that customizes resume content to match job requirements.

**Flow**:
1. Receives job posting content and resume HTML from frontend
2. Validates Firebase authentication token
3. Sends structured prompt to OpenAI GPT-4o with job description and resume
4. AI analyzes job requirements and rewrites resume content to better match
5. Preserves original HTML structure while modifying only text content
6. Returns tailored resume HTML ready for display in editor

### `/transform` (POST)
**Purpose**: Text transformation for the rich text editor's AI-powered editing features.

**Flow**:
1. Receives text snippet and transformation action (improve, shorten, change tone, etc.)
2. Validates authentication token
3. Sends specific prompt to OpenAI GPT-4o based on requested action
4. AI modifies the text according to the instruction
5. Returns the transformed text snippet

### `/verify` (POST)
**Purpose**: Token verification for Stripe customer portal integration.

**Flow**:
1. Receives Firebase authentication token
2. Validates token using Firebase Admin SDK
3. Extracts user ID and email from token
4. Returns user information for Stripe customer portal access
