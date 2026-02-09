import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from core.config_manager import ConfigManager
from core.job_manager import JobManager
from api.routes import tasks, reports, logs

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

CONFIG_PATH = os.environ.get(
    "REPORTS_CONFIG_PATH",
    os.path.join(BASE_DIR, "reports_config.json")
)

FRONTEND_DIR = os.path.join(BASE_DIR, "frontend", "dist")

config_manager = ConfigManager(CONFIG_PATH)
job_manager = JobManager()

app = FastAPI(
    title="Alma Analytics Report Fetcher",
    description="API for managing and running Alma Analytics reports",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(tasks.router, prefix="/api/v1")
app.include_router(reports.router, prefix="/api/v1")
app.include_router(logs.router, prefix="/api/v1")


@app.get("/health")
def health():
    return {"status": "healthy"}


# Serve static frontend files in production
if os.path.exists(FRONTEND_DIR):
    app.mount("/assets", StaticFiles(directory=os.path.join(FRONTEND_DIR, "assets")), name="assets")

    @app.get("/{path:path}")
    async def serve_frontend(path: str):
        # Serve index.html for all non-API routes (SPA client-side routing)
        file_path = os.path.join(FRONTEND_DIR, path)
        if os.path.isfile(file_path):
            return FileResponse(file_path)
        return FileResponse(os.path.join(FRONTEND_DIR, "index.html"))
else:
    @app.get("/")
    def root():
        return {
            "message": "Alma Analytics Report Fetcher API",
            "version": "1.0.0",
            "note": "Frontend not built. Run 'npm run build' in frontend/ directory."
        }
