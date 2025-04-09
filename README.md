# 🐄 Livestock App — React + TypeScript + Firebase + Vite

A modern livestock management dashboard built with Vite, React, TypeScript, and TailwindCSS.

This project helps track animals, manage farms, and record daily activities—designed for simplicity, scalability, and collaboration.

---

## ⚙️ Tech Stack

- **Framework**: [React.js](https://reactjs.org/)
- **Database**: [Firebase Realtime Database](https://firebase.google.com/products/realtime-database)
- **Authentication**: [Firebase Auth](https://firebase.google.com/products/auth)
- **UI Library**: [shadcn/ui](https://ui.shadcn.com/)
- **CSS Framework**: [TailwindCSS](https://tailwindcss.com/)
- **Cloud Deployment**: [Vercel](https://vercel.com/)
- **Document Generation**: [React PDF](https://react-pdf.org/)
- **Graph Visualization**: [ApexCharts](https://apexcharts.com/)
- **ORM**: _(optional / to be decided)_

---

## 🛠️ Getting Started

First, clone the repository:

```bash
git clone https://github.com/your-username/livestock-app.git
cd livestock-app
```

Install dependencies:

```bash
npm install
# or
yarn
```

Start the development server:

```bash
npm run dev
```

The app will run at [http://localhost:5173](http://localhost:5173)

---

## 🔐 Firebase Setup

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project
3. Enable **Authentication** (Email/Password or other provider)
4. Create a **Realtime Database** or **Firestore**, and configure access rules
5. Copy your Firebase config and paste it into a `.env.local` file:

```env
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-auth-domain
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-storage-bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_APP_ID=your-app-id
```

---

## 🌍 Deployment

This project is ready to deploy on **Vercel**.

Click below to deploy:

[![Deploy to Vercel](https://vercel.com/button)](https://vercel.com/new)

---

## 💡 Contributing

1. Fork this repository
2. Create a new branch:  
   ```bash
   git checkout -b feature/your-feature-name
   ```
3. Make your changes ✨
4. Commit and push:  
   ```bash
   git commit -m "Add your feature"
   git push origin feature/your-feature-name
   ```
5. Open a Pull Request ✅

---

## 🧪 Linting & Formatting

Install recommended linting packages:

```bash
npm install -D eslint typescript @typescript-eslint/eslint-plugin @typescript-eslint/parser
```

Then configure ESLint using:

```js
// eslint.config.js
import tseslint from "typescript-eslint";

export default tseslint.config({
  extends: [
    ...tseslint.configs.recommendedTypeChecked,
    ...tseslint.configs.stylisticTypeChecked,
  ],
  languageOptions: {
    parserOptions: {
      project: ['./tsconfig.json'],
      tsconfigRootDir: import.meta.dirname,
    },
  },
});
```

---

## 📄 License

MIT License. Feel free to fork and build your own ✌️

---

Made with 💙 by Kelompok 7.
