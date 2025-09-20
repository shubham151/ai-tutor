# AI Tutor with PDF Integration

## Live Demo [https://ai-tutor-nine-plum.vercel.app/](https://ai-tutor-nine-plum.vercel.app/)

## Overview

This project is an **AI Tutor web application** built with **Next.js 14 (App Router)**, **Prisma**, and a **PostgreSQL backend**.

It enables users to:

- Upload and view PDFs in a split-screen layout
- Chat with an AI tutor that references the PDF content
- Highlight and annotate documents during conversation
- Use voice input/output for tutoring sessions
- Persist chat history and PDF metadata in the database

---

## Tech Stack

- **Frontend & Framework**: [Next.js 14+](https://nextjs.org/) (App Router)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Database ORM**: [Prisma](https://www.prisma.io/)
- **Database**: PostgreSQL
- **AI Integration**: Choice of LLM provider (OpenAI, Google Gemini, etc.) via [Vercel AI SDK](https://ai-sdk.dev/)
- **Speech-to-Text / Text-to-Speech**: Browser APIs/ SDKs
- **PDF Rendering**: [PDF.js](https://mozilla.github.io/pdf.js/)
- **Email**: [Resend](https://resend.com/)

---

## ✨ Core Features

### Authentication

- Email/password signup & login
- Session management
- Token refresh & logout (`/api/auth/*`)

### PDF Viewer

- Split-screen layout with chat + PDF (`/chat/[documentId]`)
- Upload & storage (`/api/uploads`)
- Page navigation, highlights, and annotations

### AI Tutor Integration

- Real-time chat (`/api/chat/[documentId]`)
- Context-aware PDF references
- AI can:
  - Navigate pages
  - Highlight text/images
  - Reference page numbers in responses
- Voice support (`/api/transcribe`)

### Database Integration

- Store users, documents, chat history
- Persist PDF metadata
- Reload annotated PDFs with chat state

---

## Getting Started

### 1. Clone the repo

```bash
git clone https://github.com/shubham151/ai-tutor
cd ai-tutor
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment

Copy `.env.example` --> `.env` in the project root and update keys:

```bash
cp .env.example .env
```

### 4. Setup database

```bash
npx prisma migrate dev
npx prisma generate
```

### 5. Run development server

```bash
npm run dev
```

App runs at [http://localhost:3000](http://localhost:3000).

---

---

⚡ **Note**: The `prisma/schema.prisma` file was not included in this repo snapshot. Copy contents from prisma.schema to under `/prisma/schema.prisma`.
