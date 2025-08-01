from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes.transform import router as transform_router

app = FastAPI(title="TailoreResume API")

# Allow CORS from your frontend origin
origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,  # or ["*"] for development (allow all)
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(transform_router)
