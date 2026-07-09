# Consumer Attention Mapping System - Frontend

This is the React + TypeScript + Vite frontend for the Consumer Attention Mapping System. It is styled with Tailwind CSS and shadcn/ui components, featuring a memory-only JWT authentication scheme and a dark/light mode toggle.

## Project Structure

```
frontend/
├── src/
│   ├── components/
│   │   ├── ui/               # shadcn/ui primitives (Button, Table, Card, etc.)
│   │   ├── theme-provider.tsx # Light/dark mode context provider
│   │   └── mode-toggle.tsx    # Theme toggler button
│   ├── context/
│   │   └── auth-context.tsx  # In-memory JWT Authentication context
│   ├── pages/
│   │   ├── login.tsx         # Sign In page (Card, Input, Label, Button)
│   │   └── dashboard.tsx     # Stores List Dashboard (Table, Logout)
│   ├── App.tsx               # Main routing definition
│   ├── index.css             # Tailwind base layers
│   └── main.tsx              # React client entry point
├── components.json           # shadcn configuration
├── tailwind.config.js        # Tailwind v3 themes and plugins
├── postcss.config.js
├── package.json
└── README.md
```

## Setup Instructions

### 1. Prerequisites
Ensure you have **Node.js** (v18 or higher) and **npm** installed on your local machine.

### 2. Install Dependencies
Navigate to the `frontend/` directory and run:
```bash
npm install
```

### 3. Configure Environment Variables
Create a local `.env` file from the example template:
```bash
cp .env.example .env
```

Open the `.env` file and set the backend API endpoint URL:
```env
VITE_API_BASE_URL=http://localhost:8001
```

### 4. Run the Development Server
Start the local Vite development server:
```bash
npm run dev
```

The application will be running locally at:
* Local: [http://localhost:5173/](http://localhost:5173/)

### 5. Build for Production
To compile and optimize the assets for production deployment:
```bash
npm run build
```
The output assets will be generated inside the `dist/` directory.
