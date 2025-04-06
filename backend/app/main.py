from fastapi import FastAPI
from app.routers import book, auth, exchange, user, recommendation
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os

app = FastAPI(
    title="B2B",
    description="P2P Book Exchange",
    version="1.0.0"
)

# include routers
app.include_router(book.router)
app.include_router(auth.router)
app.include_router(exchange.router)
app.include_router(user.router)
app.include_router(recommendation.router)

# allow frontend origin
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

# Mount the static directory
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")