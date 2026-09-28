# Development Session 004: Execution Setup, Environment Hardening & Migration Resolution

**Date:** September 27, 2026  
**Context:** Securing secrets in `.env`, configuring Alembic paths, and debugging migration execution.

---

## 1. Actual User Prompts

> **Prompt A:** "How to run the backend and frontend ?"

> **Prompt B:** "Do i need to setup .env variables for database url or other secrets. Analyze the codebase and find if there any secrets in backend and frontend which can accidentallly commit to git in future . Create a .env and put there all secrets and update the path as required."

> **Prompt C (Error Output):**
> ```powershell
> (venv) PS D:\Hiring Pipeline\backend> alembic upgrade head
> Traceback (most recent call last):
>   ...
>   File "D:\Hiring Pipeline\backend\venv\Lib\site-packages\alembic\script\base.py", line 582, in run_env
>     util.load_python_file(self.dir, "env.py")
>   ...
> ModuleNotFoundError: No module named 'backend'
> ```

---

## 2. Actual AI Actions & Implementations

### Environment & Secret Management

1. Created `.env` at project root `D:\Hiring Pipeline\.env`:
   ```env
   DATABASE_URL=postgresql://postgres:postgres@localhost:5432/hiring_db
   BACKEND_HOST=0.0.0.0
   BACKEND_PORT=8000
   VITE_API_BASE_URL=http://localhost:8000/api
   ```

2. Updated `.gitignore` at root `D:\Hiring Pipeline\.gitignore`:
   ```gitignore
   .env
   .env.local
   *.log
   venv/
   __pycache__/
   node_modules/
   dist/
   ```

3. Updated `backend/app/core/config.py`:
   ```python
   class Settings(BaseSettings):
       model_config = SettingsConfigDict(
           env_file=(".env", "../.env"),
           env_file_encoding="utf-8",
           extra="ignore"
       )
   ```

4. Updated `frontend/src/services/api/client.ts`:
   ```typescript
   const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';
   ```

### Alembic Migration Fix

1. Modified `backend/alembic.ini`:
   ```ini
   script_location = app/db/migrations
   prepend_sys_path = ..
   ```

2. Modified `backend/app/db/migrations/env.py`:
   ```python
   # Dynamically add project root and backend dir to sys.path
   current_dir = os.path.dirname(os.path.abspath(__file__))
   backend_dir = os.path.abspath(os.path.join(current_dir, "../../.."))
   project_root = os.path.abspath(os.path.join(backend_dir, ".."))

   if project_root not in sys.path:
       sys.path.insert(0, project_root)
   if backend_dir not in sys.path:
       sys.path.insert(0, backend_dir)
   ```

3. Re-ran `alembic upgrade head`:
   - Output: `INFO [alembic.runtime.migration] Context impl PostgresqlImpl.` → **Migration completed successfully**.

---

## 3. Important Decisions Made

- Moved all hardcoded database URLs into `.env` and ensured git ignore rules prevented accidental leaks.
- Dynamically resolved sys.path in Alembic's `env.py` to allow running migrations regardless of whether the terminal working directory is `D:\Hiring Pipeline` or `D:\Hiring Pipeline\backend`.
