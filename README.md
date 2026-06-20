# 🚀 EzMeet — Smart Meeting & Scheduling Platform (Full-Stack)

EzMeet is a complete full-stack scheduling and meeting-management platform built entirely from scratch using **Node.js**, **Next.js/React**, **Supabase PostgreSQL**, **TypeORM**, **Google Calendar API**, **Tailwind CSS**, and **Shadcn/UI**.

It allows users to create events, share booking links, manage availability, sync with Google Calendar, and handle all global time zones — all with a modern, clean, and responsive UI.

This project is designed to take you from **Beginner → Pro**, covering real-world backend, frontend, database modeling, authentication, integrations, and deployment.

---

## 🌟 Features

### 🔐 Authentication
- JWT-based Sign Up & Login  
- Secure, type-safe backend powered by TypeScript  

### 📅 Event Creation
- Create public or private events  
- Set meeting duration, buffers, max bookings  
- Generate a unique booking link  

### 🕒 Smart Availability System
- Custom working hours  
- Multiple time ranges per day  
- Prevents double booking  
- Auto-detect user timezone  
- Converts availability to visitor's local timezone  

### 🌍 Time Zone Intelligence
- Automatic timezone detection  
- All events shown in the visitor’s local time  

### 🔗 Google Integration
- Two-way Google Calendar sync  
- Auto-create Google Meet links  
- Avoids conflicts with existing Google Calendar events  

### 📆 Custom Calendar UI
- Hand-coded UI (no plugins)  
- Built using TailwindCSS & Shadcn/UI  
- Fully responsive and lightweight  

### 🔄 Meeting Management
- View upcoming meetings  
- Past meetings  
- Canceled meetings  
- Re-scheduling support  

### 🎨 Built With Modern Tools
- Node.js  
- React / Next.js  
- TypeScript  
- TypeORM  
- Supabase PostgreSQL  
- Google Calendar API  
- Tailwind CSS v4  
- Shadcn/UI  
- Vite.js  

---

## 🛠️ Getting Started

### 🔧 1. Clone the Repository

```bash
git clone https://github.com/VTCodeCraft/EzMeet
cd EzMeet
```
### 🔧 2. Set Up Environment Variables
Create a .env file in the root of your project and configure the following:

```
env
Copy code
PORT=8000
NODE_ENV=development

DATABASE_URL="postgresql://postgres.<user>:<password>@aws-0-eu-central-1.pooler.supabase.com:6543/postgres"

JWT_SECRET="jwt_secret_key"
JWT_EXPIRES_IN="1d"

GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_REDIRECT_URI="http://localhost:8000/api/integration/google/callback"

FRONTEND_ORIGIN=http://localhost:5173
FRONTEND_INTEGRATION_URL="http://localhost:5173/app/integrations"
```
### 3. Run the Application

Install dependencies and start the development server:
```
npm install
npm run dev
```
Backend is available at:
👉 http://localhost:8000

Frontend is available at:
👉 http://localhost:5173

### 🌐 Deployment
To deploy EzMeet:

1️⃣ Add the environment variables to your hosting platform (Render / Railway / Vercel)

2️⃣ Deploy both backend & frontend

3️⃣ Configure Google OAuth credentials in production

4️⃣ Connect your Supabase PostgreSQL database

📎 Useful Links
🔗 GitHub Repository:
https://github.com/VTCodeCraft/EzMeet
