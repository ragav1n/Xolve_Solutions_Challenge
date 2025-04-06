# Xolve_Solutions_Challenge

TeachAssist Project for Google Developer Groups Solutions Challenge

# 🌍 Solutions Challenge

This project is built as part of the **Google Developer Student Clubs (GDSC) Solutions Challenge** to create real-world tech solutions aligned with the **UN Sustainable Development Goals (SDGs)**.

> 📌 **Project Goal:**  
> To build TeachAssist, an AI-powered web-based assistant that empowers secondary school teachers (Grades 8–12) by simplifying academic and administrative tasks, optimizing schedules and resources, and supporting their professional growth — ultimately addressing teacher shortages and improving the quality of education, especially in underserved regions like rural India.

---

## ⚙️ Tech Stack

- **Vite** – Lightning-fast frontend build tool
- **TypeScript** – Strongly-typed JavaScript
- **Tailwind CSS** – Utility-first CSS framework
- **Supabase** – Backend as a Service (used for database and user authentication)
- **Gemma API (Google Vertex AI)** – Used for intelligent features like AI-driven recommendations, chat, etc.
- **Google IDX** – Cloud-based development environment where this project is developed
- **ESLint** – For linting and maintaining code quality
- **PostCSS** – For processing CSS

---

## 🔐 Authentication & Backend

- **Authentication** is handled using **Supabase Auth** (email/password or OAuth-based).
- **Database** operations (e.g., storing user data, logs, application content) are managed using **Supabase PostgreSQL**.
- All interactions with Supabase are secured and managed through client-side integration using Supabase SDKs.

---

## 🧠 AI Integration

We leverage **Gemma API**, powered by **Google Vertex AI**, to enable:
- Smart responses / conversational agents
- Personalized recommendations / insights
- Any other AI-driven feature unique to your app

---

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/solutions-challenge.git
cd solutions-challenge
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Run the Development Server

```bash
npm run dev
```

Visit the app in your browser at:

```
http://localhost:5173
```

### 4. Build for Production

```bash
npm run build
```

### 5. Lint the Code

```bash
npm run lint
```

---

## 📁 Folder Structure (Simplified)

```
Solutions_Challenge/
├── index.html              # Entry HTML
├── package.json            # Dependencies and scripts
├── tailwind.config.js      # Tailwind setup
├── tsconfig.json           # TypeScript config
├── vite.config.ts          # Vite setup
├── .env                    # Environment variables for API keys, Supabase config
├── src/                    # Source code (components, services, etc.)
└── node_modules/           # Dependencies
```

---

## 🧪 Environment Setup

Create a `.env` file at the root with the following variables:

```env
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
VITE_GEMMA_API_KEY=your-gemma-api-key
```

> ⚠️ Never commit your `.env` file to version control.

---

## 📜 License

This project is open source under the [MIT License](LICENSE).

---
