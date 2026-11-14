# SkillGraph – Career Intelligence & Skill Dependency Engine

[![Python 3.14](https://img.shields.io/badge/python-3.14-blue.svg)](https://www.python.org/)
[![Django 6.1](https://img.shields.io/badge/django-6.1-green.svg)](https://www.djangoproject.com/)
[![React 19](https://img.shields.io/badge/react-19-61dafb.svg)](https://react.dev/)
[![NetworkX](https://img.shields.io/badge/networkx-3.7-orange.svg)](https://networkx.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

**SkillGraph** is a full-stack, graph-theoretic career intelligence platform designed for software engineers, students, and technology leaders. Rather than treating career progression as a static list of courses or keywords, SkillGraph models 50+ technical disciplines as a **Directed Acyclic Graph (DAG)** of prerequisites, calculates weighted skill gaps against real industry roles, generates topologically-sorted learning roadmaps, and simulates career transitions.

---

## 1. Problem Statement

Traditional career tools suffer from critical deficiencies:
1. **Dependency Blindness**: Standard platforms recommend advanced topics (e.g., Deep Learning or Kubernetes) without verifying foundational prerequisites (Linear Algebra, Python arrays, or Linux OS).
2. **Binary Checklist Fallacy**: Course completion is treated as proof of competence rather than demonstrated, evidenced capability.
3. **Static Advice**: Static career roadmaps fail to account for transferable knowledge when engineers pivot disciplines (e.g., Full-Stack Development to AI Engineering).

SkillGraph solves this by grounding every career requirement in graph algorithms, DAG cycle detection, and NLP-driven project evidence extraction.

---

## 2. Key Features

- **Interactive Skill Knowledge Graph**:
  - Visualized via React Flow with customized glowing nodes and auto-calculated topological coordinates.
  - Category filtering, career scope zooming, and search.
  - Interactive slide-over drawer displaying skill prerequisites, downstream unlocked competencies, career demand, and curated learning resources.
- **Weighted Skill Gap Analyzer**:
  - Mathematical calculation:
    $$\text{Skill Coverage} = \frac{\sum_{s \in \text{Acquired Core}} \text{Weight}(s) \times \min\left(1.0, \frac{\text{Demonstrated Proficiency}(s)}{\text{Required Proficiency}(s)}\right)}{\sum_{s \in \text{All Required Core}} \text{Weight}(s)} \times 100$$
  - Classifies skills into Demonstrated, Needs Improvement, and Missing.
  - **Prerequisite Alert Banner**: Uncovers missing foundational prerequisites before starting core requirements.
  - Prioritized strategic recommendations.
- **Personalized Learning Path Generator**:
  - Employs NetworkX topological sorting (`nx.topological_sort`) on the induced subgraph of missing skills.
  - Strictly guarantees no dependent skill is scheduled before its foundational prerequisite.
  - Milestone unlocker: marking a milestone completed automatically unlocks downstream dependent steps.
- **What-If Career Simulator**:
  - Compares dual career graphs side-by-side (e.g., Full-Stack Developer $\rightarrow$ AI Engineer).
  - Computes shared skills, transferable skill coverage %, and generates a topological delta roadmap with estimated transition hours.
- **NLP Project-to-Skill Evidence Mapper**:
  - Connects practical portfolio repositories to skills.
  - Semantic tokenization and action-verb scoring (`architected`, `engineered`, `scaled`, `implemented`) evaluates demonstrated skills and assigns 1–5 confidence ratings.
- **Skill Intelligence Dashboard**:
  - Dynamic metrics: Readiness score, demonstrated skills count, active roadmap progress, opportunity ranking across all 11 careers, and Recharts distribution visualizer.

---

## 3. Technology Stack

### Frontend
- **Framework**: React 19 with Vite 8
- **Styling**: Tailwind CSS v4 with glassmorphism and futuristic glowing dark navy SaaS palette
- **Graph Visualization**: React Flow (`@xyflow/react`)
- **Analytics & Charts**: Recharts
- **Icons**: Lucide React
- **HTTP Client**: Axios with JWT interceptors and auto token refresh

### Backend
- **Framework**: Python 3.14, Django 6.1, Django REST Framework
- **Authentication**: JWT (`djangorestframework-simplejwt`)
- **Graph Engine**: NetworkX 3.7 (DAG validation, ancestors, descendants, topological sort)
- **Data & Intelligence**: Pandas, Scikit-learn, NumPy, SciPy
- **Database**: PostgreSQL / SQLite3 via Django ORM

---

## 4. Architecture & Database Design

```
skillgraph/
├── frontend/
│   ├── src/
│   │   ├── components/   # Navbar, Footer, SkillNode, NodeDetailModal, LoadingSpinner
│   │   ├── pages/        # Landing, Login, Register, Dashboard, Graph, GapAnalyzer, LearningPath, Careers, Simulator, Projects, Profile
│   │   ├── services/     # Axios client with JWT interceptors (api.js)
│   │   ├── context/      # AuthContext session manager
│   │   └── App.jsx       # Route tree and ProtectedRoute guards
├── backend/
│   ├── config/           # Django settings, root URLs, WSGI
│   ├── accounts/         # UserProfile, JWT registration & login
│   ├── skills/           # SkillCategory, Skill, SkillDependency, LearningResource, UserSkill
│   ├── careers/          # CareerRole, CareerRequiredSkill, CareerSimulator
│   ├── graph_engine/     # NetworkX SkillGraphEngine, SkillGapAnalyzer
│   ├── learning_paths/   # LearningPath, LearningPathStep, Topological Generator
│   ├── projects/         # Project, ProjectSkillEvidence, NLP Extractor
│   ├── analytics/        # UserActivity, DashboardAnalyticsService
│   └── manage.py
├── docs/
└── README.md
```

---

## 5. Quick Start & Installation

### Prerequisites
- Python 3.11+ (Python 3.14 tested and verified)
- Node.js 18+ and npm 9+

### 1. Clone the Repository
```bash
git clone https://github.com/your-username/skillgraph.git
cd skillgraph
```

### 2. Backend Setup
```bash
cd backend

# Create and activate virtual environment
python -m venv venv
# On Windows:
.\venv\Scripts\activate
# On Linux/macOS:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Apply migrations
python manage.py migrate

# Seed database with 10 categories, 53 skills, 57 dependencies, 11 careers, and demo profile
python manage.py seed_data

# Run tests
python manage.py test graph_engine

# Start backend server
python manage.py runserver 0.0.0.0:8000
```

### 3. Frontend Setup
```bash
cd ../frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

Visit **`http://localhost:5173`** in your browser.

---

## 6. Demo Account Credentials

A pre-populated demo user is seeded for instant evaluation:
- **Username**: `demouser`
- **Password**: `DemoPassword123!`
- **Profile**: Pre-loaded with 13 demonstrated skills, verified projects, and an active AI Engineer learning path.
- Or click the **"One-Click Login"** button on the Sign-In page.

---

## 7. API Reference Overview

| Endpoint | Method | Description | Auth Required |
|---|---|---|---|
| `/api/auth/register/` | POST | Register new user and returns JWT tokens | No |
| `/api/auth/login/` | POST | Obtain JWT access and refresh token pair | No |
| `/api/auth/profile/` | GET, PUT | View and update user profile & target career | Yes |
| `/api/categories/` | GET | List skill categories | No |
| `/api/skills/` | GET | List/filter skills by category or difficulty | No |
| `/api/skills/<slug>/` | GET | Detailed skill dossier with prerequisites and resources | No |
| `/api/user-skills/` | GET, POST | List and add competencies to user profile | Yes |
| `/api/careers/` | GET | List all 11 curated industry career roles | No |
| `/api/careers/<slug>/` | GET | Full career details, progression ladder, projects | No |
| `/api/graph/` | GET | Serialized React Flow nodes, edges, and levels | Optional |
| `/api/gap-analysis/` | GET | Weighted gap calculation against target career | Yes |
| `/api/learning-paths/` | GET | List user's active learning roadmaps | Yes |
| `/api/learning-paths/generate/` | POST | Generate or recalculate topological roadmap | Yes |
| `/api/learning-paths/steps/<id>/status/` | PATCH | Update milestone status and auto-unlock downstream | Yes |
| `/api/simulator/compare/` | POST | Dual career graph diff and delta transition path | Optional |
| `/api/projects/` | GET, POST | CRUD projects and trigger automatic NLP extraction | Yes |
| `/api/projects/<id>/extract-skills/` | POST | Re-run NLP semantic skill extraction | Yes |
| `/api/analytics/dashboard/` | GET | Real-time aggregated intelligence dashboard | Yes |

---

## 8. License

This project is licensed under the MIT License.
