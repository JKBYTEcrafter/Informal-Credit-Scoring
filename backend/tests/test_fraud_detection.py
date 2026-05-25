import pytest
from app.ml.fraud_detection.fraud_feature_engineer import FraudFeatureEngineer
from app.ml.fraud_detection.anomaly_detector import FraudAnomalyDetector, AnomalyDetectionResult
from app.ml.fraud_detection.fraud_scorer import FraudScoringEngine
from app.ml.fraud_detection.fraud_explainer import FraudExplainabilityEngine
from app.models.transaction import Transaction

def test_fraud_features_empty_transactions():
    engineer = FraudFeatureEngineer()
    result = engineer.generate([])
    assert result.transaction_count == 0
    # All features should be 0
    assert all(v == 0.0 for v in result.features.values())
    # Ensure all 15 features are present
    assert len(result.features) == 15

def test_fraud_features_normal_profile():
    engineer = FraudFeatureEngineer()
    # Mocking some basic transactions
    transactions = [
        Transaction(id=1, amount=10.0, transaction_type="debit", merchant="A", category="Food", timestamp="2026-05-20T12:00:00Z"),
        Transaction(id=2, amount=20.0, transaction_type="debit", merchant="B", category="Transport", timestamp="2026-05-21T12:00:00Z"),
        Transaction(id=3, amount=30.0, transaction_type="debit", merchant="C", category="Utilities", timestamp="2026-05-22T12:00:00Z")
    ]
    result = engineer.generate(transactions)
    assert result.transaction_count == 3
    assert result.features["transaction_velocity"] > 0

def test_fraud_scorer_low_risk():
    scorer = FraudScoringEngine()
    engineer = FraudFeatureEngineer()
    feature_set = engineer.generate([])
    anomaly_result = AnomalyDetectionResult(
        isolation_forest_score=0.1,
        svm_score=0.1,
        lof_score=0.1,
        ensemble_score=0.1,
        is_anomalous=False
    )
    score_result = scorer.score(feature_set, anomaly_result)
    assert score_result.fraud_probability < 0.35
    assert score_result.risk_level == "Low Risk"

def test_fraud_scorer_high_risk():
    scorer = FraudScoringEngine()
    engineer = FraudFeatureEngineer()
    feature_set = engineer.generate([])
    # Manually setting high risk features
    feature_set.features["transaction_velocity"] = 10.0
    feature_set.features["spending_spike_ratio"] = 5.0
    feature_set.features["nighttime_transaction_ratio"] = 0.8
    feature_set.features["merchant_concentration_score"] = 0.9

    anomaly_result = AnomalyDetectionResult(
        isolation_forest_score=0.9,
        svm_score=0.9,
        lof_score=0.9,
        ensemble_score=0.9,
        is_anomalous=True
    )
    score_result = scorer.score(feature_set, anomaly_result)
    assert score_result.fraud_probability >= 0.60
    assert score_result.risk_level in ["High Risk", "Critical Risk"]

def test_fraud_risk_level_classification():
    scorer = FraudScoringEngine()
    # Mocking anomaly result just to get risk level
    assert scorer._determine_risk_level(0.2) == "Low Risk"
    assert scorer._determine_risk_level(0.4) == "Medium Risk"
    assert scorer._determine_risk_level(0.7) == "High Risk"
    assert scorer._determine_risk_level(0.9) == "Critical Risk"

def test_anomaly_detection_fallback():
    detector = FraudAnomalyDetector()
    engineer = FraudFeatureEngineer()
    feature_set = engineer.generate([])
    # Passing a non-existent directory to trigger fallback
    import pathlib
    result = detector.detect(feature_set, pathlib.Path("/does/not/exist"))
    assert hasattr(result, "is_anomalous")
    assert hasattr(result, "ensemble_score")

def test_fraud_explainer_returns_contributions():
    explainer = FraudExplainabilityEngine()
    engineer = FraudFeatureEngineer()
    feature_set = engineer.generate([])
    
    scorer = FraudScoringEngine()
    anomaly_result = AnomalyDetectionResult(0.1, 0.1, 0.1, 0.1, False)
    score_result = scorer.score(feature_set, anomaly_result)

    contributions = explainer.explain(feature_set, score_result)
    assert isinstance(contributions, list)
    assert len(contributions) > 0

def test_fraud_feature_keys_complete():
    engineer = FraudFeatureEngineer()
    result = engineer.generate([])
    expected_keys = [
        "transaction_velocity", "spending_spike_ratio", "merchant_concentration_score",
        "nighttime_transaction_ratio", "unusual_category_score", "high_freq_withdrawal_score",
        "transaction_entropy", "weekend_anomaly_score", "amount_zscore_max",
        "velocity_acceleration", "merchant_novelty_score", "category_drift_score",
        "round_number_ratio", "rapid_balance_depletion", "behavioral_fingerprint_deviation"
    ]
    for key in expected_keys:
        assert key in result.features
