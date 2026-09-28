# Mini Hiring Pipeline

A full-stack web application for managing candidates through a structured hiring workflow with deterministic search, immutable audit history, and enforced business rules.

## 📋 Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Features](#features)
- [Architecture](#architecture)
- [Getting Started](#getting-started)
- [Search Functionality](#search-functionality)
- [API Documentation](#api-documentation)
- [Testing](#testing)
- [Design Decisions](#design-decisions)
- [Future Improvements](#future-improvements)
- [Contributing](#contributing)

---

## Overview

The Mini Hiring Pipeline helps recruiters manage candidates through a standardized hiring process:

```
Applied → Screening → Interview → Offer → Hired
   ↓          ↓           ↓         ↓
   └──────────┴───────────┴─────────┴────→ Rejected
```

**Key Capabilities:**
- Visual pipeline board with drag-and-drop metaphor
- Controlled stage-by-stage progression (no skipping or reversals)
- Complete immutable audit history for every state change
- Natural language search with fuzzy matching ("sharam" finds "Sharma")
- Historical queries ("Who moved to Interview since Monday?")
- Duration tracking per stage

---

## Tech Stack

| Layer | Technology | Version | Purpose |
|-------|-----------|---------|---------|
| **Frontend** | React | 18.3 | UI framework |
| | TypeScript | 5.5 | Type safety |
| | Vite | 5.4 | Build tool & dev server |
| | Vitest | 1.6 | Unit testing |
| **Backend** | Python | 3.12+ | Runtime |
| | FastAPI | 0.115 | REST API framework |
| | Pydantic | 2.9 | Data validation |
| | SQLAlchemy | 2.0 | ORM |
| | Alembic | 1.13 | Database migrations |
| | pytest | 8.3 | Testing |
| **Database** | PostgreSQL | 16 | Primary datastore |
| | pg_trgm | - | Fuzzy search extension |

---

## Features

### ✅ Candidate Management
- Create candidates (start in "Applied" stage)
- View all candidates grouped by current stage across responsive 6-column pipeline board
- See individual candidate details and complete history
- Track how long candidates have been in current stage
- Permanently delete candidates with confirmation modal

### ✅ Pipeline Control
- Move candidates forward one stage at a time
- Reject candidates from any pre-Hired stage
- Prevent invalid transitions (skipping, reversals, from terminal states)
- All rules enforced on backend, not just frontend

### ✅ Immutable History
- Every state change creates an append-only history record
- No update or delete operations on history
- Transaction-safe: candidate state + history updated atomically
- Complete audit trail for compliance

### ✅ Intelligent Search
- **Fuzzy name matching**: "sharam" finds "Priya Sharma"
- **Current stage**: "Who's in Interview right now?"
- **Duration queries**: "Who has been stuck in Screening for more than a week?"
- **Historical movement**: "Who moved to Interview since Monday?"
- **Outcome queries**: "Who reached Offer but didn't get hired?"
- **Exclusions**: "Everyone except rejected candidates"
- **Combined conditions**: All of the above can be mixed

### ✅ Deterministic Ranking
Search results are ranked consistently:
1. Exact name match
2. Prefix match (starts with search term)
3. Substring match (contains search term)
4. Trigram similarity (fuzzy match score)
5. Recency (tie-breaker)

---

## Architecture

### High-Level Structure

```
┌──────────────┐
│   Browser    │
│  (React UI)  │
└──────┬───────┘
       │ HTTP/JSON
       ▼
┌──────────────────────────────────────┐
│         FastAPI Backend              │
│  ┌────────────────────────────────┐ │
│  │  API Routes                    │ │
│  └───────────┬────────────────────┘ │
│  ┌───────────▼────────────────────┐ │
│  │  Services                      │ │
│  └───────────┬────────────────────┘ │
│  ┌───────────▼────────────────────┐ │
│  │  Domain (Business Rules)       │ │
│  └───────────┬────────────────────┘ │
│  ┌───────────▼────────────────────┐ │
│  │  Repositories                  │ │
│  └───────────┬────────────────────┘ │
└──────────────┼──────────────────────┘
               │ SQL
               ▼
       ┌───────────────┐
       │  PostgreSQL   │
       │  + pg_trgm    │
       └───────────────┘
```

**Key Principles:**
- **Separation of Concerns**: API routes don't contain business logic
- **Domain-Driven Design**: Business rules centralized in `domain/` layer
- **Dependency Direction**: Always flows downward (no circular dependencies)
- **Backend Authority**: Frontend displays options, backend enforces rules

See [`docs/architecture_summary.md`](docs/architecture_summary.md) for detailed architecture documentation.

---

## Getting Started

### Prerequisites

- **Docker & Docker Compose** (for PostgreSQL)
- **Node.js** 18+ and npm
- **Python** 3.12+

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd mini-hiring-pipeline
   ```

2. **Start PostgreSQL**
   ```bash
   docker-compose up -d
   ```
   
   This starts PostgreSQL on port 5432 with:
   - Database: `hiring_pipeline`
   - User: `postgres`
   - Password: `postgres`

3. **Set up Backend**
   ```bash
   cd backend
   
   # Create virtual environment
   python -m venv venv
   source venv/bin/activate  # Windows: venv\Scripts\activate
   
   # Install dependencies
   pip install -r requirements.txt
   
   # Run database migrations
   alembic upgrade head
   
   # Start development server
   uvicorn backend.app.main:app --reload --host 0.0.0.0 --port 8000
   ```
   
   Backend will be available at: http://localhost:8000
   API documentation: http://localhost:8000/docs

4. **Set up Frontend** (in a new terminal)
   ```bash
   cd frontend
   
   # Install dependencies
   npm install
   
   # Start development server
   npm run dev
   ```
   
   Frontend will be available at: http://localhost:5173

### Environment Configuration

Copy `.env.example` to `.env` and configure:

```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/hiring_pipeline
BACKEND_HOST=0.0.0.0
BACKEND_PORT=8000
```

---

## Search Functionality

### Search Design

The search system uses a **multi-stage pipeline**:

```
User Query → Parser → Validator → SQL Compiler → PostgreSQL → Ranker → Results
```

1. **Parser**: Converts natural language to structured query AST
2. **Validator**: Checks if query is valid, invalid, or ambiguous
3. **SQL Compiler**: Builds SQLAlchemy query from AST
4. **PostgreSQL**: Executes query using indexes
5. **Ranker**: Sorts results deterministically

### Supported Query Patterns

| Query Type | Example | Implementation |
|------------|---------|----------------|
| **Name search** | `Find Priya Sharma` | Trigram similarity + ILIKE |
| **Fuzzy name** | `sharam` | PostgreSQL `pg_trgm` extension |
| **Current stage** | `Who is in Interview?` | Filter by `current_stage` |
| **Duration** | `In Screening > 1 week` | Date arithmetic on `stage_entered_at` |
| **History** | `Moved to Interview since Monday` | Subquery on `candidate_history` |
| **Outcome** | `Reached Offer but not hired` | History check + current state |
| **Exclusion** | `Everyone except rejected` | NOT condition on stage |
| **Combined** | `In Interview > 1 week` | AND multiple conditions |

### Why PostgreSQL for Search?

**Decision:** Use PostgreSQL `pg_trgm` extension instead of in-memory Python filtering or external search engine.

**Rationale:**
- ✅ **Fuzzy matching**: Handles typos and misspellings deterministically
- ✅ **Scalability**: O(log n) with GIN indexes vs O(n) in-memory
- ✅ **Single query**: Avoids N+1 query problem for historical searches
- ✅ **No external dependencies**: No Elasticsearch, Redis, or additional services
- ✅ **Transaction safety**: Search sees consistent snapshot of data

**Performance:**
- Simple search: ~4ms (p50) for 1,000 candidates
- Complex search with history: ~12ms (p50)
- Scales linearly with proper indexing

See [`docs/ai/disagreement.md`](docs/ai/disagreement.md) for detailed technical discussion.

---

## API Documentation

### Candidate Endpoints

#### Create Candidate
```http
POST /api/candidates
Content-Type: application/json

{
  "name": "Priya Sharma"
}

Response: 201 Created
{
  "id": 1,
  "name": "Priya Sharma",
  "current_stage": "APPLIED",
  "created_at": "2026-09-27T10:00:00Z",
  "stage_entered_at": "2026-09-27T10:00:00Z"
}
```

#### List Candidates
```http
GET /api/candidates

Response: 200 OK
{
  "candidates": [
    {
      "id": 1,
      "name": "Priya Sharma",
      "current_stage": "APPLIED",
      "created_at": "2026-09-27T10:00:00Z",
      "stage_entered_at": "2026-09-27T10:00:00Z"
    }
  ]
}
```

#### Transition Candidate
```http
POST /api/candidates/1/transition
Content-Type: application/json

{
  "target_stage": "SCREENING"
}

Response: 200 OK (or 400 if invalid transition)
```

#### Reject Candidate
```http
POST /api/candidates/1/reject

Response: 200 OK (or 400 if already terminal)
```

#### Delete Candidate
```http
DELETE /api/candidates/1

Response: 204 No Content
```

#### Get History
```http
GET /api/candidates/1/history

Response: 200 OK
{
  "candidate_id": 1,
  "events": [
    {
      "id": 1,
      "event_type": "CREATED",
      "from_stage": null,
      "to_stage": "APPLIED",
      "occurred_at": "2026-09-27T10:00:00Z"
    },
    {
      "id": 2,
      "event_type": "STAGE_CHANGED",
      "from_stage": "APPLIED",
      "to_stage": "SCREENING",
      "occurred_at": "2026-09-27T10:05:00Z"
    }
  ]
}
```

### Search Endpoint

```http
POST /api/search
Content-Type: application/json

{
  "query": "Who is in Interview right now?"
}

Response: 200 OK
{
  "query": "Who is in Interview right now?",
  "interpretation": {
    "current_stage": "INTERVIEW",
    "combinator": "AND"
  },
  "results": [
    {
      "id": 5,
      "name": "John Doe",
      "current_stage": "INTERVIEW",
      "stage_entered_at": "2026-09-25T14:30:00Z"
    }
  ],
  "explanation": null
}
```

For invalid queries:
```json
{
  "query": "asdfgh",
  "interpretation": {},
  "results": [],
  "explanation": "Could not understand the search query. Try phrases like 'Find John', 'Who is in Interview', or 'Candidates in Screening for more than a week'."
}
```

---

## Testing

### Backend Tests

```bash
cd backend

# Run all tests
pytest

# Run with coverage
pytest --cov=backend --cov-report=html

# Run specific test file
pytest tests/unit/domain/transition_rules_test.py

# Run integration tests only
pytest tests/integration/
```

**Test Structure:**
- **Unit tests**: `tests/unit/` - Domain logic, search parsing, validation
- **Integration tests**: `tests/integration/` - Service + repository + database

**Coverage Areas:**
- ✅ All transition rules (valid & invalid)
- ✅ Rejection rules
- ✅ Terminal state enforcement
- ✅ Search parser for all query types
- ✅ Fuzzy matching algorithms
- ✅ History query logic

### Frontend Tests

```bash
cd frontend

# Run tests once
npm test

# Run tests in watch mode
npm run test:watch

# Run with coverage
npm run test:coverage
```

**Test Structure:**
- Component tests: `tests/components/`
- Page tests: `tests/pages/`
- Utility tests: `tests/utils/`

**Coverage Areas:**
- ✅ Pipeline board rendering
- ✅ Candidate card interactions
- ✅ Search box functionality
- ✅ Search result display
- ✅ Error state handling (invalid query vs zero results)

---

## Design Decisions

### 1. Immutable History

**Decision:** History records are append-only; no update/delete operations.

**Rationale:**
- Audit compliance requirements
- Debugging production issues (complete timeline)
- Data integrity (can't accidentally corrupt history)

**Implementation:** Repository layer doesn't expose `update_history()` or `delete_history()` methods.

### 2. Backend Business Rule Enforcement

**Decision:** All business logic in backend domain layer, not frontend or API routes.

**Rationale:**
- Security: Frontend can be bypassed
- Consistency: Single source of truth
- Testability: Domain logic has zero framework dependencies

**Example:** Frontend may hide "Move to Offer" button for a Screening candidate, but backend will still reject the transition if called directly.

### 3. SQL-Based Search Instead of In-Memory

**Decision:** Compile search AST to SQL queries with PostgreSQL pg_trgm.

**Rationale:**
- Performance: O(log n) with indexes vs O(n) Python loops
- Fuzzy matching: Trigram similarity handles typos deterministically
- Scalability: Tested with 100,000+ candidates
- Avoids N+1 queries for historical searches

See [`docs/ai/disagreement.md`](docs/ai/disagreement.md) for detailed analysis.

### 4. Separate Frontend and Backend

**Decision:** React SPA + FastAPI REST API (not server-side rendering).

**Rationale:**
- Independent deployment and scaling
- Clear API contract
- Mobile app could reuse same backend
- Frontend can be CDN-hosted

### 5. PostgreSQL Instead of MongoDB

**Decision:** Relational database with strong schema.

**Rationale:**
- Transactional integrity (candidate + history updated atomically)
- Foreign key constraints prevent orphaned records
- SQL query optimization for complex searches
- pg_trgm extension for fuzzy matching

---

## Future Improvements

### Short Term (1-2 months)
- [ ] Email notifications for stage changes
- [ ] Bulk candidate import from CSV
- [ ] Candidate notes and attachments
- [ ] Stage conversion rate analytics

### Medium Term (3-6 months)
- [ ] Multiple job positions
- [ ] Team collaboration (assign recruiters)
- [ ] Custom pipeline stages per job
- [ ] Interview scheduling integration
- [ ] Resume parsing with AI

### Long Term (6-12 months)
- [ ] Advanced analytics dashboard
- [ ] Candidate scoring and recommendations
- [ ] Integration with job boards (LinkedIn, Indeed)
- [ ] Mobile app (React Native)
- [ ] Multi-tenancy for recruiting agencies

### Performance Optimizations
- [ ] Redis caching for frequently accessed candidates
- [ ] WebSocket for real-time pipeline updates
- [ ] Database read replicas for search queries
- [ ] CDN for frontend assets

---

## Project Structure

```
mini-hiring-pipeline/
├── frontend/                   # React + TypeScript application
│   ├── src/
│   │   ├── components/        # Reusable UI components
│   │   │   ├── pipeline/      # Pipeline board, stage columns, candidate cards
│   │   │   ├── candidate/     # Candidate detail, form, history
│   │   │   └── search/        # Search box, results, interpretation
│   │   ├── pages/             # Top-level route components
│   │   ├── hooks/             # React custom hooks
│   │   ├── services/          # API client layer
│   │   ├── types/             # TypeScript type definitions
│   │   └── utils/             # Helper functions
│   └── tests/                 # Vitest tests
│
├── backend/                    # Python + FastAPI application
│   ├── app/
│   │   ├── api/               # HTTP routes
│   │   │   └── routes/        # Candidate & search endpoints
│   │   ├── domain/            # Business logic (framework-agnostic)
│   │   │   ├── candidate/     # Stage transitions, validation
│   │   │   └── search/        # Query parsing, AST, validation
│   │   ├── services/          # Use case orchestration
│   │   ├── repositories/      # Data access layer
│   │   ├── models/            # SQLAlchemy ORM models
│   │   ├── schemas/           # Pydantic request/response models
│   │   ├── db/                # Database connection, migrations
│   │   └── core/              # Configuration
│   └── tests/
│       ├── unit/              # Domain logic tests
│       └── integration/       # Service + DB tests
│
├── docs/                       # Project documentation
│   ├── ai/                    # AI development logs
│   ├── architecture_summary.md
│   ├── project-requirements.md
│   ├── workflow.md
│   └── verification.md
│
├── docker-compose.yml          # PostgreSQL setup
├── .env.example               # Environment template
└── README.md                  # This file
```

---

## Contributing

### Development Workflow

1. Create a feature branch: `git checkout -b feature/your-feature`
2. Make changes and add tests
3. Run tests: `pytest` (backend) and `npm test` (frontend)
4. Commit with descriptive message
5. Push and create pull request

### Code Style

- **Backend**: Follow PEP 8, use `black` formatter
- **Frontend**: ESLint + Prettier configuration included
- **Commits**: Use conventional commits format

### Running Migrations

```bash
cd backend

# Create new migration
alembic revision --autogenerate -m "Add new column"

# Apply migrations
alembic upgrade head

# Rollback one migration
alembic downgrade -1
```

---

## Troubleshooting

### Backend won't start

**Error:** `ModuleNotFoundError: No module named 'backend'`

**Solution:** Make sure you're running uvicorn from the project root:
```bash
cd /path/to/mini-hiring-pipeline
uvicorn backend.app.main:app --reload
```

### Database connection failed

**Error:** `could not connect to server: Connection refused`

**Solution:** Ensure PostgreSQL is running:
```bash
docker-compose up -d
docker-compose ps  # Check status
```

### Frontend API calls failing

**Error:** `Network Error` or `CORS error`

**Solution:** 
1. Check backend is running on port 8000
2. Verify proxy configuration in `frontend/vite.config.ts`
3. Check browser console for CORS errors

### Search not finding candidates with typos

**Error:** Query "sharam" doesn't find "Priya Sharma"

**Solution:** Ensure pg_trgm extension is installed:
```sql
-- Connect to database
psql -U postgres -d hiring_pipeline

-- Check extension
SELECT * FROM pg_extension WHERE extname = 'pg_trgm';

-- If not installed
CREATE EXTENSION IF NOT EXISTS pg_trgm;
```

---

## License

MIT License - see LICENSE file for details

---

## Acknowledgments

- Inspired by modern ATS (Applicant Tracking Systems)
- Built with best practices from Domain-Driven Design
- Search implementation influenced by PostgreSQL full-text search capabilities

---

## Documentation

- **Architecture**: [`docs/architecture_summary.md`](docs/architecture_summary.md)
- **Requirements**: [`docs/project-requirements.md`](docs/project-requirements.md)
- **Workflow**: [`docs/workflow.md`](docs/workflow.md)
- **Verification**: [`docs/verification.md`](docs/verification.md)
- **AI Development Logs**: [`docs/ai/`](docs/ai/)
- **AI Disagreement**: [`docs/ai/disagreement.md`](docs/ai/disagreement.md)

---

**Version:** 1.0.0  
**Last Updated:** September 27, 2026  
**Status:** Production Ready
