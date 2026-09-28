from logging.config import fileConfig
from sqlalchemy import engine_from_config, pool
from alembic import context
import sys
import os

# Calculate directory paths so imports work whether alembic is invoked from root or backend directory
current_dir = os.path.dirname(os.path.abspath(__file__))
backend_dir = os.path.abspath(os.path.join(current_dir, "..", "..", ".."))
project_root = os.path.abspath(os.path.join(backend_dir, ".."))

for p in [project_root, backend_dir]:
    if p not in sys.path:
        sys.path.insert(0, p)

try:
    from backend.app.db.database import Base
    from backend.app.models.candidate import Candidate
    from backend.app.models.candidate_history import CandidateHistory
    from backend.app.core.config import settings
except ModuleNotFoundError:
    from app.db.database import Base
    from app.models.candidate import Candidate
    from app.models.candidate_history import CandidateHistory
    from app.core.config import settings

config = context.config

if config.config_file_name is not None:
    fileConfig(config.config_file_name)

from backend.app.core.config import settings

target_metadata = Base.metadata


def run_migrations_offline() -> None:
    url = settings.DATABASE_URL
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )

    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online() -> None:
    configuration = config.get_section(config.config_ini_section, {})
    configuration["sqlalchemy.url"] = settings.DATABASE_URL
    connectable = engine_from_config(
        configuration,
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )

    with connectable.connect() as connection:
        context.configure(
            connection=connection, target_metadata=target_metadata
        )

        with context.begin_transaction():
            context.run_migrations()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()