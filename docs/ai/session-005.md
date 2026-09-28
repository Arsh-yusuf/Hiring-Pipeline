# Development Session 005: Uvicorn Server Startup & Python Module Resolution

**Date:** September 27, 2026  
**Context:** Debugging backend server startup failure (`ModuleNotFoundError: No module named 'backend'`).

---

## 1. Actual User Prompt & Terminal Output

> ```powershell
> (venv) PS D:\Hiring Pipeline\backend> alembic upgrade head
> INFO  [alembic.runtime.migration] Context impl PostgresqlImpl.
> INFO  [alembic.runtime.migration] Will assume transactional DDL.
> (venv) PS D:\Hiring Pipeline\backend> uvicorn backend.app.main:app --reload --host 0.0.0.0 --port 8000
> INFO:     Will watch for changes in these directories: ['D:\\Hiring Pipeline\\backend']
> INFO:     Uvicorn running on http://0.0.0.0:8000 (Press CTRL+C to quit)
> INFO:     Started reloader process [14248] using WatchFiles
> Process SpawnProcess-1:
> Traceback (most recent call last):
>   ...
>   File "D:\Hiring Pipeline\backend\venv\Lib\site-packages\uvicorn\importer.py", line 19, in import_from_string    
>     module = importlib.import_module(module_str)
>   File "C:\Program Files\WindowsApps\PythonSoftwareFoundation.Python.3.12...\importlib\__init__.py", line 90, in import_module
>     return _bootstrap._gcd_import(name[level:], package, level)
> ModuleNotFoundError: No module named 'backend'
> ```

---

## 2. Actual AI Analysis & Solution

### Cause Analysis
All backend source files (e.g. `backend/app/main.py`) import modules using the `backend.app...` package namespace:
```python
from backend.app.api.router import api_router
```
When running `uvicorn backend.app.main:app` from `D:\Hiring Pipeline\backend\`, Python's working directory (`CWD`) is `backend\`. Python searches `CWD` for a package directory named `backend` (which does not exist inside `backend/`).

### Solution Provided

**Option 1: Run from Project Root (Recommended)**
```powershell
cd "D:\Hiring Pipeline"
.\backend\venv\Scripts\activate
uvicorn backend.app.main:app --reload --host 0.0.0.0 --port 8000
```

**Option 2: Run from `backend/` with `PYTHONPATH` Set**
```powershell
$env:PYTHONPATH=".."
uvicorn backend.app.main:app --reload --host 0.0.0.0 --port 8000
```

---

## 3. Important Decisions Made

- Verified that running `backend\venv\Scripts\python.exe -c "import backend.app.main; print(backend.app.main.app)"` from root `D:\Hiring Pipeline` succeeds without error.
- Standardized documentation to execute backend commands from the project root directory.
