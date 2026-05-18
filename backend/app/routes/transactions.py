from fastapi import APIRouter, Depends, File, UploadFile, status
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.middleware.auth import get_current_user
from app.models.user import User
from app.schemas.transaction import TransactionPublic, TransactionUploadResponse
from app.services.transaction_service import transaction_service

router = APIRouter(prefix="/transactions", tags=["Transactions"])


@router.post(
    "/upload",
    response_model=TransactionUploadResponse,
    status_code=status.HTTP_201_CREATED,
)
async def upload_transactions(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> TransactionUploadResponse:
    transactions = await transaction_service.upload_csv(db, current_user, file)
    return TransactionUploadResponse(
        imported_count=len(transactions),
        transactions=transactions,
    )


@router.get("", response_model=list[TransactionPublic])
def list_transactions(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> list[TransactionPublic]:
    return transaction_service.list_user_transactions(db, current_user)
