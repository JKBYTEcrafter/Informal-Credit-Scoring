from decimal import Decimal

from app.models.transaction import Transaction
from app.models.user import User


def test_user_transaction_relationship(client, auth_headers, db_session) -> None:
    response = client.post(
        "/api/transactions/upload",
        headers=auth_headers,
        files={
            "file": (
                "transactions.csv",
                "amount,type,merchant,category,timestamp\n1000,credit,Salary,income,2026-05-18\n",
                "text/csv",
            )
        },
    )

    assert response.status_code == 201

    user = db_session.query(User).filter(User.email == "aarav@example.com").one()
    transaction = db_session.query(Transaction).filter(Transaction.user_id == user.id).one()
    assert transaction.amount == Decimal("1000.00")
    assert transaction.user.email == "aarav@example.com"
