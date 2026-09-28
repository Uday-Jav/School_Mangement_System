# SchoolDesk Frontend Application

Welcome to the SchoolDesk frontend application. This is a highly interactive, premium, brutalist-designed school management frontend built using React, TypeScript, and Vite.

## Status: Frontend Release-Ready (Phase 1)
Currently, this repository contains the **frontend-only** implementation. 
The backend has not been developed yet. 

### Implementation Matrix

| Module / Feature | Status | Verification | Persistence |
| :--- | :--- | :--- | :--- |
| **Role-based Dashboard** | Implemented but unverified interactively | Static Checking | LocalStorage |
| **Admissions & Profiles** | Implemented but unverified interactively | Static Checking | LocalStorage |
| **Attendance (Offline Drafts)** | Implemented but unverified interactively | Static Checking | LocalStorage (Simulated Sync) |
| **Marks & Grading** | Implemented but unverified interactively | Static Checking | LocalStorage |
| **Timetable & Subs** | Implemented but unverified interactively | Static Checking | LocalStorage |
| **Fees & Payments** | Implemented but unverified interactively | Static Checking | LocalStorage |
| **Notices & Circulars** | Implemented but unverified interactively | Static Checking | LocalStorage |
| **Campus Map** | Simulated (Interactive CSS fallback) | Static Checking | N/A |
| **Teachers** | Implemented but unverified interactively | Static Checking | LocalStorage |
| **Classes** | Implemented but unverified interactively | Static Checking | LocalStorage |
| **Subjects** | Implemented but unverified interactively | Static Checking | LocalStorage |
| **Examinations** | Implemented but unverified interactively | Static Checking | LocalStorage |
| **Library** | Implemented but unverified interactively | Static Checking | LocalStorage |
| **Transport** | Implemented but unverified interactively | Static Checking | LocalStorage |
| **Events** | Implemented but unverified interactively | Static Checking | LocalStorage |
| **Users & Roles** | Implemented but unverified interactively | Static Checking | LocalStorage |
| **Settings** | Implemented but unverified interactively | Static Checking | LocalStorage |

*Note: Interactive browser testing was unavailable in this environment. Verification was performed through static code checking, logic inspection, and simulated execution rather than direct user interaction.*

### Demo Limitations
Since there is no actual backend server:
- **Data Persistence:** All edits survive page refreshes *only on the same browser device* utilizing `localStorage`.
- **Sync Demonstrations:** "Syncing to server" states or loading spinners are purely simulated interactions for usability demonstrations. 
- **User Authentication:** Logging in is bypassed; the app relies on the global Role Switcher to demonstrate distinct user personas.
- **Exporting / Printing:** CSV and PDF exports trigger the browser's native print modal or toast notifications rather than downloading actual files.

## Run Instructions

### Prerequisites
- Node.js (v18 or higher)
- npm or pnpm

### Development
1. Clone the repository and navigate into the root directory.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the dev server:
   ```bash
   npm run dev
   ```
4. Open your browser to `http://localhost:5173`.

### Production Build
To create a chunk-optimized production build:
```bash
npm run build
```
The optimized bundles will be generated in the `dist` folder. Lazy-loading has been explicitly implemented to ensure fast initial load times.
