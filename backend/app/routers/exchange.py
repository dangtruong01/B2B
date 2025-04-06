from fastapi import APIRouter, Depends, HTTPException
from app.services import exchange_service
from app.schemas.exchange import ExchangeCreate, ExchangeResponse, ExchangeStatusUpdate
from app.dependencies.auth import get_current_user

router = APIRouter(prefix="/exchange", tags=["Exchange"])

@router.post("/request", response_model=ExchangeResponse)
def create_exchange_request(data: ExchangeCreate, user=Depends(get_current_user)):
    return exchange_service.create_request(data, user["sub"])

@router.get("/my-requests", response_model=list[ExchangeResponse])
def get_my_requests(user=Depends(get_current_user)):
    return exchange_service.get_sent_requests(user["sub"])

@router.get("/incoming", response_model=list[ExchangeResponse])
def get_incoming_requests(user=Depends(get_current_user)):
    return exchange_service.get_received_requests(user["sub"])

@router.post("/{request_id}/respond", response_model=ExchangeResponse)
def respond_to_request(request_id: str, update: ExchangeStatusUpdate, user=Depends(get_current_user)):
    return exchange_service.respond_to_request(request_id, update.status, user["sub"])

@router.delete("/{request_id}", response_model=ExchangeResponse)
def delete_request(request_id: str, user=Depends(get_current_user)):
    return exchange_service.delete_request(request_id, user["sub"])