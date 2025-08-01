from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes.transform import router as transform_router
import os
import uvicorn

app = FastAPI(title="TailoreResume API")

# Allow CORS from your frontend origin
origins = [
    "https://tailoresume.onrender.com",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,  # or ["*"] for development (allow all)
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(transform_router)

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run("app.main:app", host="0.0.0.0", port=port)
