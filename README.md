# URDIGIX Solutions ERP

<p align="center">
  <img src="apps/web/public/logo.svg" alt="URDIGIX Solutions" width="200" />
</p>

<p align="center">
  <strong>Enterprise Company Management Desktop Application</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-19-blue?logo=react" alt="React" />
  <img src="https://img.shields.io/badge/TypeScript-5.6-blue?logo=typescript" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Electron-33-blue?logo=electron" alt="Electron" />
  <img src="https://img.shields.io/badge/Express.js-4.x-green?logo=express" alt="Express" />
  <img src="https://img.shields.io/badge/PostgreSQL-16-blue?logo=postgresql" alt="PostgreSQL" />
  <img src="https://img.shields.io/badge/Prisma-5.x-blue?logo=prisma" alt="Prisma" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-4-blue?logo=tailwindcss" alt="Tailwind CSS" />
</p>

---

## 📋 Overview

URDIGIX Solutions ERP is a production-grade, enterprise-level Company Management System designed for managing all aspects of business operations. Built as a Windows 11 desktop application using Electron, it provides a modern, responsive interface with real-time capabilities.

### Key Features

| Module | Features |
|--------|----------|
| 📊 **Dashboard** | Real-time KPIs, revenue charts, task overview, recent activities |
| 👥 **Client Management** | Full CRM with contacts, notes, documents, archiving |
| 📁 **Project Management** | Milestones, team assignment, progress tracking, budgets |
| ✅ **Task Management** | Kanban board, list view, calendar view, drag-and-drop |
| 🧾 **Invoice Management** | Professional PDF invoices, line items, tax/discount |
| 💳 **Payment Tracking** | Payment recording, reconciliation, multiple methods |
| 👨‍💼 **Employee Management** | HR records, departments, attendance tracking |
| 📄 **Document Management** | File upload, folder structure, version history |
| 📅 **Calendar** | Day/week/month views, meetings, deadlines, events |
| 📈 **Reports & Analytics** | Revenue, client, project, task, employee reports |
| 🔔 **Notifications** | Real-time notification center, desktop notifications |
| 📝 **Activity Logs** | Full audit trail with change tracking |
| ⚙️ **Settings** | Company profile, themes, users, roles, backup |
| 🤖 **AI Features** | Dashboard insights, predictions, AI assistant |

---

## 🏗️ Architecture

```
URDIGIX Solutions ERP (Monorepo)
├── apps/
│   ├── api/          → Express.js REST API + Prisma ORM
│   ├── web/          → React + TypeScript + Tailwind CSS Frontend
│   └── desktop/      → Electron Desktop Wrapper
└── packages/
    ├── shared/       → Shared Types & Utilities
    └── tsconfig/     → Shared TypeScript Configurations
```

### Technology Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, TypeScript, Tailwind CSS v4, React Router v6 |
| State Management | Zustand, TanStack Query |
| Charts | Recharts |
| Desktop | Electron 33 |
| Backend | Express.js, Node.js |
| Database | PostgreSQL 16 |
| ORM | Prisma 5 |
| Authentication | JWT + Refresh Tokens + RBAC |
| Build | Vite, electron-vite, Turborepo |
| Package Manager | pnpm |

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** >= 18.0.0
- **pnpm** >= 8.0.0
- **PostgreSQL** 16 (or Docker)
- **Git**

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-org/urdigix-solutions-erp.git
   cd urdigix-solutions-erp
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your database credentials
   ```

4. **Start PostgreSQL** (using Docker)
   ```bash
   docker compose up -d postgres
   ```

5. **Run database migrations**
   ```bash
   pnpm db:migrate
   ```

6. **Seed the database**
   ```bash
   pnpm db:seed
   ```

7. **Start development servers**
   ```bash
   pnpm dev
   ```

   This starts:
   - API server at `http://localhost:3001`
   - Web app at `http://localhost:5173`
   - Electron app (if running `pnpm dev:desktop`)

### Default Login Credentials

| Role | Email | Password |
|------|-------|----------|
| Super Admin | admin@urdigix.com | Admin@123 |

---

## 📁 Project Structure

```
d:\URDIGIX\
├── package.json                  # Root workspace configuration
├── pnpm-workspace.yaml           # Workspace definition
├── turbo.json                    # Turborepo build pipeline
├── docker-compose.yml            # PostgreSQL + pgAdmin
├── .env                          # Environment variables
│
├── apps/
│   ├── api/                      # Express.js Backend
│   │   ├── prisma/
│   │   │   ├── schema.prisma     # Database schema (19 models)
│   │   │   └── seed.ts           # Database seeder
│   │   └── src/
│   │       ├── app.ts            # Express app configuration
│   │       ├── config/           # Database, JWT, CORS config
│   │       ├── middleware/       # Auth, RBAC, validation, error handling
│   │       ├── routes/           # API route definitions
│   │       ├── controllers/      # Request handlers
│   │       ├── services/         # Business logic
│   │       ├── validators/       # Zod validation schemas
│   │       └── utils/            # PDF, Excel, CSV, email utilities
│   │
│   ├── web/                      # React Frontend
│   │   └── src/
│   │       ├── components/       # Reusable UI components
│   │       │   ├── ui/           # Base components (Button, Input, Modal...)
│   │       │   ├── layout/       # Sidebar, TopBar, PageLayout
│   │       │   ├── charts/       # Recharts wrappers
│   │       │   └── common/       # DataTable, StatCard, SearchBar...
│   │       ├── features/         # Feature modules (14 modules)
│   │       ├── store/            # Zustand state management
│   │       ├── services/         # API client services
│   │       ├── types/            # TypeScript type definitions
│   │       └── hooks/            # Custom React hooks
│   │
│   └── desktop/                  # Electron Desktop
│       └── src/
│           ├── main/             # Main process
│           │   ├── tray.ts       # System tray
│           │   ├── updater.ts    # Auto-updates
│           │   └── ipc/          # IPC handlers
│           └── preload/          # Context bridge
│
└── packages/
    ├── shared/                   # Shared types & utilities
    └── tsconfig/                 # Shared TS configurations
```

---

## 🔧 Development

### Available Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start all dev servers |
| `pnpm dev:api` | Start API server only |
| `pnpm dev:web` | Start web app only |
| `pnpm dev:desktop` | Start Electron app |
| `pnpm build` | Build all packages |
| `pnpm lint` | Run linter |
| `pnpm typecheck` | TypeScript type checking |
| `pnpm test` | Run tests |
| `pnpm db:migrate` | Run Prisma migrations |
| `pnpm db:seed` | Seed the database |
| `pnpm db:studio` | Open Prisma Studio |

### Database Management

```bash
# Create a new migration
cd apps/api && npx prisma migrate dev --name your_migration_name

# Reset database
cd apps/api && npx prisma migrate reset

# Open Prisma Studio (visual database editor)
pnpm db:studio
```

---

## 🔐 Security

- **Authentication**: JWT access tokens (15min) + refresh tokens (7 days)
- **Authorization**: Role-Based Access Control (RBAC) with 5 roles
- **Password**: bcrypt hashing with salt rounds
- **API Security**: Helmet, CORS, rate limiting, input validation (Zod)
- **Desktop**: Encrypted token storage via Electron safeStorage
- **Audit**: Complete activity logging for all mutations
- **Protection**: XSS, CSRF, SQL injection protection via Prisma

### User Roles

| Role | Access Level |
|------|-------------|
| Super Admin | Full system access, user management, settings |
| Admin | All modules, limited settings |
| Manager | Projects, tasks, invoices, reports |
| Employee | Assigned tasks, own projects |
| Viewer | Read-only access |

---

## 🎨 Design System

The application uses a custom design system inspired by Windows 11 and modern SaaS dashboards:

- **Primary Color**: `#2563EB` (Blue 600)
- **Dark Theme**: Navy backgrounds (`#0f172a`, `#1e293b`)
- **Light Theme**: Clean whites and grays
- **Typography**: Inter (Google Fonts)
- **Effects**: Glassmorphism, subtle shadows, smooth animations
- **Corners**: Rounded (12-16px)
- **Icons**: Lucide React

---

## 📦 Building for Production

### Web Application
```bash
pnpm build:web
```

### Desktop Application (Windows)
To compile the desktop application locally:
1. Ensure the web application is built first: `pnpm build`
2. Run the packaging command:
   ```bash
   pnpm --filter=@urdigix/desktop package
   ```
   This will output the standalone Windows installer (`.exe`) in `apps/desktop/release/`.

### Automated Release (CI/CD)
A GitHub Actions workflow is set up under `.github/workflows/release.yml`. When you push a version tag starting with `v` (e.g., `v1.0.0`):
1. The workflow triggers automatically.
2. It sets up Node.js, pnpm, and installs dependencies.
3. It builds all monorepo packages.
4. It packages the desktop installer for Windows.
5. It drafts and publishes a GitHub Release with the compiled `.exe` setup file attached.

### Docker Deployment
```bash
docker compose up -d
```

---

## 📊 Database Schema

The application uses 19 database models with 14 enums:

```
Users ─── UserRoles ─── Roles ─── RolePermissions ─── Permissions
  │
  ├── Projects ─── ProjectMembers
  │     │
  │     ├── Milestones
  │     ├── Tasks ─── TaskComments
  │     ├── Documents ─── DocumentVersions
  │     └── Invoices ─── InvoiceItems
  │
  ├── Clients ─── ClientContacts
  │     │
  │     ├── Projects
  │     ├── Invoices
  │     └── Payments
  │
  ├── Employees
  ├── Notifications
  ├── ActivityLogs
  ├── CalendarEvents ─── EventAttendees
  └── Settings
```

---

## 🤖 AI Features

The application includes pluggable AI features:

- **Dashboard Insights**: AI-generated business intelligence
- **Revenue Prediction**: ML-based revenue forecasting
- **Project Risk Analysis**: Automated risk assessment
- **Task Prioritization**: Smart task ordering suggestions
- **Report Summary**: AI-generated report summaries
- **AI Assistant**: Chat-based assistant for quick queries

> AI features require an OpenAI API key. Set `AI_API_KEY` in your `.env` file.

---

## 📄 License

MIT License — See [LICENSE](LICENSE) for details.

---

## 🏢 About URDIGIX Solutions

URDIGIX Solutions is an enterprise software company specializing in business management solutions. This ERP system is designed to help companies manage their entire business operations from a single, unified platform.

---

<p align="center">
  Built with ❤️ by <strong>URDIGIX Solutions</strong>
</p>
