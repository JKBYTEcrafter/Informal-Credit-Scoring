from app.ml.feature_engineering import FinancialFeatureEngineer
from app.ml.inference import CreditScoringEngine


def test_credit_scoring_is_deterministic_for_same_features() -> None:
    feature_set = FinancialFeatureEngineer().generate([])
    engine = CreditScoringEngine()

    first = engine.score(feature_set)
    second = engine.score(feature_set)

    assert first.final_score == second.final_score
    assert first.risk_level == "High Risk"
    assert first.model_version


def test_risk_bands_follow_required_thresholds() -> None:
    from app.ml.evaluation import classify_score

    assert classify_score(751) == "Low Risk"
    assert classify_score(600) == "Medium Risk"
    assert classify_score(599) == "High Risk"
