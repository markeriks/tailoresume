from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from slowapi.middleware import SlowAPIMiddleware
from slowapi.errors import RateLimitExceeded
from fastapi.responses import JSONResponse

from app.routes.transform import router as transform_router
from app.routes.tailor import router as tailor_router
from app.routes.verify import router as verify_router
from app.rate_limit import limiter

import os
import uvicorn

app = FastAPI(title="TailoreResume API")

# Attach limiter to app
app.state.limiter = limiter
app.add_middleware(SlowAPIMiddleware)

# Rate limit exceeded response
@app.exception_handler(RateLimitExceeded)
async def rate_limit_handler(request: Request, exc: RateLimitExceeded):
    return JSONResponse(
        status_code=429,
        content={"detail": "Rate limit exceeded. Try again later."}
    )

# CORS settings
origins = [
    "https://tailoresume.com",
    "http://localhost:3000",
]


app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routes
app.include_router(transform_router)
app.include_router(tailor_router)
app.include_router(tailor_router)


# Run with uvicorn only in dev
if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run("app.main:app", host="0.0.0.0", port=port, reload=True)
