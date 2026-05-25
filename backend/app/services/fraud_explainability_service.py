from sqlalchemy.orm import Session
from app.ml.fraud_detection.fraud_explainer import FraudExplainabilityEngine
from app.models.transaction import Transaction
from app.models.fraud_score import FraudScore
from app.models.user import User
from app.schemas.sprint4 import FraudExplainabilityResponse, FraudFeatureContribution
from app.ml.fraud_detection.fraud_feature_engineer import fraud_feature_engineer
from app.ml.fraud_detection.fraud_scorer import fraud_scoring_engine
from app.ml.fraud_detection.anomaly_detector import fraud_anomaly_detector
from app.config.settings import get_settings
from pathlib import Path
from fastapi import HTTPException, status

class FraudExplainabilityService:
    def get_fraud_explainability(self, db: Session, current_user: User, user_id: int) -> FraudExplainabilityResponse:
        if current_user.id != user_id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized")
            
        settings = get_settings()
        
        # 1. Fetch transactions
        transactions = db.query(Transaction).filter(Transaction.user_id == user_id).all()
        
        # 2. Get feature set
        feature_set = fraud_feature_engineer.generate(transactions)
        
        # 3. Detect anomaly & score
        model_dir = Path(settings.FRAUD_MODEL_DIR)
        anomaly_result = fraud_anomaly_detector.detect(feature_set, model_dir)
        score_result = fraud_scoring_engine.score(feature_set, anomaly_result)
        
        # 4. Explain
        explainer = FraudExplainabilityEngine()
        contributions = explainer.explain(feature_set, score_result)
        
        feature_contribs = [
            FraudFeatureContribution(
                feature=c.feature,
                readable_label=c.readable_label,
                contribution=c.contribution,
                feature_value=c.feature_value,
                impact=c.impact,
                explanation=c.explanation
            )
            for c in contributions
        ]
        
        latest_score = db.query(FraudScore).filter(FraudScore.user_id == user_id).order_by(FraudScore.generated_at.desc()).first()
        
        return FraudExplainabilityResponse(
            user_id=user_id,
            fraud_probability=score_result.fraud_probability,
            base_probability=0.01,
            feature_contributions=feature_contribs,
            top_risk_factors=score_result.top_risk_factors,
            anomaly_reasoning=explainer.get_anomaly_reasoning(feature_set, anomaly_result),
            generated_at=latest_score.generated_at if latest_score else None
        )

fraud_explainability_service = FraudExplainabilityService()
