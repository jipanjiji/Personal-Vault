# 🛡️ PERSONAL VAULT v2.0

> **Secure, Private, and AdBlock-Proof Snippet & Credential Manager.**

![Preview](https://raw.githubusercontent.com/jipanjiji/Personal-Vault/main/preview.png) *(Note: Add your own logo/screenshot here!)*

Personal Vault is a high-security web application built with **Nuxt 4**, designed to store sensitive code snippets, credentials, and notes. It features a **BFF (Backend-For-Frontend)** architecture and **End-to-End Encryption** to ensure your data remains your own.

---

## 💎 Key Features

*   **🔒 BFF Architecture**: Bypasses browser-level AdBlockers (Brave/uBlock) and tracking protection by proxying all Firebase communication through a secure server-side API.
*   **🛡️ Hardened Security**: 
    *   **Global Whitelist**: Only authorized emails (enforced at database & server levels) can access the vault.
    *   **HTTP-Only Cookies**: Session tokens are stored in secure cookies, protecting against XSS attacks.
*   **🔑 Encryption**: Sensitive data is encrypted in the client-side browser using **AES-256** before being sent to the database.
*   **🌑 Hacker Aesthetic**: A premium, dark-mode focused UI with smooth glassmorphism and micro-animations.
*   **⚡ Real-time Snippets**: Fast access to your plain text, code, or password items.

---

## 🛠️ Tech Stack

*   **Framework**: [Nuxt 4](https://nuxt.com/) (Vue 3, Vite)
*   **Backend**: [Nitro](https://nitro.unjs.io/) (Server-side APIs)
*   **Database & Auth**: [Firebase](https://firebase.google.com/) (Firestore & Auth REST APIs)
*   **Styling**: [Tailwind CSS](https://tailwindcss.com/)
*   **Icons**: [Lucide Vue Next](https://lucide.dev/)
*   **Encryption**: [CryptoJS](https://crypto-js.com/)

---

## 🚀 Getting Started

### 1. Prerequisites
- Node.js (Latest LTS)
- A Firebase Project

### 2. Environment Variables
Create a `.env` file in the root directory:

```env
# Firebase Configuration
FIREBASE_API_KEY=your_api_key
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
FIREBASE_STORAGE_BUCKET=your_project.appspot.com
FIREBASE_MESSAGING_SENDER_ID=your_id
FIREBASE_APP_ID=your_app_id

# Security Whitelist
WHITELIST_EMAIL=your_email@gmail.com
```

### 3. Installation
```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

---

## 🌩️ Deployment

### To Vercel
1. Push your code to GitHub (the `.env` file is automatically ignored).
2. Connect your repository to Vercel.
3. Go to **Settings > Environment Variables** in Vercel and add all keys from your `.env` file.
4. Deploy!

---

## 📜 Security Rules
Make sure to apply the provided `firestore.rules` to your Firebase Console for maximum protection:

```firestore
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    function isAlvin() {
      return request.auth != null && request.auth.token.email == "your-whitelisted-email@gmail.com";
    }
    match /items/{itemId} {
      allow read, write: if isAlvin() && resource.data.userId == request.auth.uid;
    }
  }
}
```

---

## 👤 Author
**Alvin Raditya**
- GitHub: [@jipanjiji](https://github.com/jipanjiji)
