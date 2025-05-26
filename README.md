# 🐄 Livestock App — React + TypeScript + Firebase + Vite

A modern livestock management dashboard built with Vite, React, TypeScript, and TailwindCSS.

This project helps track animals, manage farms, and record daily activities—designed for simplicity, scalability, and collaboration.

<!-- Add app screenshots or a GIF showcasing the UI here -->

---

## ⚙️ Tech Stack

- **Framework & Core:** [Vite](https://vitejs.dev/), [React](https://reactjs.org/), [TypeScript](https://www.typescriptlang.org/)
- **UI & Styling:** [TailwindCSS](https://tailwindcss.com/), [shadcn/ui](https://ui.shadcn.com/), [Radix UI](https://www.radix-ui.com/), [HeroUI](https://www.heroui.com/), [Lucide Icons](https://lucide.dev/), [clsx](https://github.com/lukeed/clsx), [tailwind-merge](https://github.com/dcastil/tailwind-merge)
- **Routing:** [TanStack Router](https://tanstack.com/router/)
- **State Management & Forms:** [React Hook Form](https://react-hook-form.com/), [Zod](https://zod.dev/)
- **Backend & Database:** [Firebase](https://firebase.google.com/) (Firestore for Database, Firebase Auth for Authentication)
- **Charting & Data Visualization:** [Recharts](https://recharts.org/), [ApexCharts](https://apexcharts.com/)
- **Maps:** [Leaflet](https://leafletjs.com/), [React Leaflet](https://react-leaflet.js.org/)
- **QR Code Functionality:** [html5-qrcode](https://github.com/mebjas/html5-qrcode), [react-qr-reader](https://github.com/react-qr-reader/react-qr-reader), [qrcode.react](https://github.com/zpao/qrcode.react)
- **Utilities:** [date-fns](https://date-fns.org/) (Date utility), [Sonner](https://sonner.emilkowal.ski/) (Notifications), [Papaparse](https://www.papaparse.com/) (CSV Parsing)
- **Deployment:** [Vercel](https://vercel.com)

---

## ✨ Features

- **User Authentication:** Secure login and registration using Firebase Auth (supporting email/password and potentially other providers).
- **Interactive Dashboard:** A comprehensive overview of farm and livestock data, featuring analytics and visualizations with charts.
- **Farm Management:** Tools for managing farm details, viewing statistics, tracking livestock stock, and organizing breeds.
- **Livestock Management:** End-to-end tracking of animals, including options to add new livestock, view detailed lists, edit animal information, and record important events or health records.
- **QR Code Integration:** Functionality for generating and scanning QR codes, enabling quick animal identification and access to information.
- **CSV Data Import:** Ability to upload and process data from CSV files, facilitating bulk data entry or migration.
- **Theme Customization:** Option to switch between light and dark modes for improved user experience and accessibility.
- **Responsive Design:** The application interface is designed to adapt seamlessly to various screen sizes, ensuring usability on both desktop and mobile devices.
- **Real-time Updates:** Utilizes Firebase (Firestore) for live data synchronization, ensuring that users always see the most current information.

---

## 🛠️ Getting Started

Before you begin, ensure you have Node.js (LTS version recommended) and npm (or yarn) installed on your system.

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

The app will run at http://localhost:5173

To create a production build:
```bash
npm run build
```
This command first type-checks the TypeScript code and then bundles the application for production. The output will be in the `dist` folder.

---

## 🌳 Project Structure

Here's an overview of the key directories and files within the `src` folder:

*   `src/assets`: Contains static assets like images, fonts, and icons.
*   `src/components`: Houses reusable React components used throughout the application.
    *   `ui/`: UI primitives and components, often from UI libraries like shadcn/ui.
    *   `layouts/`: Components responsible for the overall page structure (e.g., sidebars, navbars).
*   `src/contexts`: Holds React Context files for global state management (e.g., `AuthContext.tsx`).
*   `src/hooks`: Custom React hooks for encapsulating reusable stateful logic.
*   `src/lib`: Includes utility functions, Firebase configuration (`firebase.ts`), and other shared library code (`utils.ts`).
*   `src/pages`: Contains components that define the different pages or views of the application, mapped to routes (e.g., Dashboard, Livestock page, Farm management).
*   `src/main.tsx`: The entry point of the React application where the root component is rendered.
*   `src/App.tsx`: The main application component that sets up routing and global providers.

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

This project is ready to deploy on [Vercel](https://vercel.com).

Click below to deploy:

[![Deploy to Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fyour-username%2Flivestock-app)

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

This project uses ESLint with TypeScript support for code linting and formatting consistency.

To set up ESLint and its dependencies, run:
```bash
npm install -D eslint @eslint/js typescript-eslint eslint-plugin-react-hooks eslint-plugin-react-refresh globals
```

The ESLint configuration is defined in `eslint.config.js` at the root of the project:

```javascript
// eslint.config.js
import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'

export default tseslint.config(
  { ignores: ['dist'] },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],
    },
  },
)
```

You can lint your code by running:
```bash
npm run lint
```

---

## 📄 License

This project is licensed under the MIT License. Feel free to fork and build your own version! ✌️

---

Made with 💙 by [Your Name/Organization/Kelompok 7](https://github.com/your-username).
