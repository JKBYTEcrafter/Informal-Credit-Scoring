import pytest
from fastapi import HTTPException

from app.services.transaction_service import transaction_service


def test_csv_parser_accepts_required_sprint_format() -> None:
    rows = transaction_service.parse_transaction_csv(
        b"amount,type,merchant,category,timestamp\n1200,credit,Salary,income,2026-05-18\n"
    )

    assert rows[0]["amount"].to_eng_string() == "1200"
    assert rows[0]["transaction_type"] == "credit"
    assert rows[0]["merchant"] == "Salary"


def test_csv_parser_rejects_bad_transaction_type() -> None:
    with pytest.raises(HTTPException) as exc:
        transaction_service.parse_transaction_csv(
            b"amount,type,merchant,category,timestamp\n1200,refund,Salary,income,2026-05-18\n"
        )

    assert exc.value.status_code == 422
