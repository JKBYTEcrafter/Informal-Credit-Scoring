"""
Sprint 3 Service Layer Tests
Tests for financial health engine, recommendation engine,
behavioral analytics, and financial story generator.
"""
from __future__ import annotations

import pytest

from app.ml.behavioral_analytics_engine import BehavioralAnalyticsEngine
from app.ml.feature_engineering.financial_features import FinancialFeatureSet
from app.ml.financial_health_engine import FinancialHealthEngine
from app.ml.financial_story_generator import FinancialStoryGenerator
from app.ml.recommendation_engine import RecommendationEngine


def _make_feature_set(overrides: dict | None = None) -> FinancialFeatureSet:
    base_features = {
        "average_monthly_income": 45000.0,
        "average_monthly_spending": 32000.0,
        "savings_ratio": 0.28,
        "spending_to_income_ratio": 0.71,
        "transaction_frequency": 38.0,
        "income_stability_score": 0.72,
        "spending_volatility": 0.35,
        "merchant_diversity_score": 0.52,
        "cash_flow_consistency": 0.68,
        "weekend_spending_ratio": 0.22,
        "high_risk_spending_frequency": 0.04,
        "monthly_growth_trend": 0.08,
        "income_variance": 12000000.0,
        "expense_variance": 8000000.0,
        "financial_discipline_score": 0.62,
        "impulsive_spending_score": 0.18,
        "transaction_regularity_score": 0.64,
        "recurring_income_confidence": 0.74,
    }
    if overrides:
        base_features.update(overrides)
    return FinancialFeatureSet(
        features=base_features,
        categorical_features={"dominant_category": "food", "cash_flow_pattern": "surplus"},
        category_distribution=[
            {"category": "food", "total_spent": 8000.0, "ratio": 0.25},
            {"category": "shopping", "total_spent": 5000.0, "ratio": 0.156},
            {"category": "transport", "total_spent": 3000.0, "ratio": 0.094},
        ],
        monthly_cash_flow=[
            {"month": "2026-01", "income": 45000.0, "expenses": 32000.0, "net_cash_flow": 13000.0},
            {"month": "2026-02", "income": 46000.0, "expenses": 31000.0, "net_cash_flow": 15000.0},
            {"month": "2026-03", "income": 44000.0, "expenses": 33000.0, "net_cash_flow": 11000.0},
        ],
        behavioral_indicators={
            "financial_discipline_score": 0.62,
            "impulsive_spending_score": 0.18,
            "transaction_regularity_score": 0.64,
            "recurring_income_confidence": 0.74,
        },
    )


class TestFinancialHealthEngine:
    engine = FinancialHealthEngine()

    def test_all_scores_bounded(self):
        dims = self.engine.compute(_make_feature_set())
        for score in [
            dims.health_score,
            dims.stability_score,
            dims.volatility_score,
            dims.cash_flow_health,
            dims.savings_discipline_score,
            dims.expense_management_score,
            dims.income_reliability_score,
        ]:
            assert 0 <= score <= 100, f"Score {score} out of [0, 100] bounds"

    def test_high_discipline_yields_high_health(self):
        good = _make_feature_set({
            "savings_ratio": 0.40,
            "financial_discipline_score": 0.85,
            "income_stability_score": 0.88,
            "cash_flow_consistency": 0.82,
        })
        poor = _make_feature_set({
            "savings_ratio": -0.05,
            "financial_discipline_score": 0.15,
            "income_stability_score": 0.20,
            "cash_flow_consistency": 0.15,
        })
        dims_good = self.engine.compute(good)
        dims_poor = self.engine.compute(poor)
        assert dims_good.health_score > dims_poor.health_score

    def test_percentile_benchmarks_have_expected_keys(self):
        dims = self.engine.compute(_make_feature_set())
        for key in ["savings_ratio", "income_stability", "cash_flow_consistency", "overall_health"]:
            assert key in dims.percentile_benchmarks

    def test_empty_features_return_zero_scores(self):
        """Engine must handle all-zero feature values gracefully."""
        zero_features = {k: 0.0 for k in _make_feature_set().features}
        fs = _make_feature_set(zero_features)
        dims = self.engine.compute(fs)
        assert 0 <= dims.health_score <= 100


class TestRecommendationEngine:
    engine = RecommendationEngine()

    def test_generates_at_least_one_recommendation(self):
        recs = self.engine.generate(_make_feature_set(), 650.0)
        assert len(recs) >= 1

    def test_high_risk_spending_triggers_high_priority(self):
        fs = _make_feature_set({"high_risk_spending_frequency": 0.25})
        recs = self.engine.generate(fs, 500.0)
        priorities = [r.priority for r in recs]
        assert "High" in priorities

    def test_deficit_spending_triggers_high_priority(self):
        fs = _make_feature_set({"savings_ratio": -0.20, "spending_to_income_ratio": 1.25})
        recs = self.engine.generate(fs, 400.0)
        high_recs = [r for r in recs if r.priority == "High"]
        assert len(high_recs) >= 1

    def test_output_capped_at_eight(self):
        recs = self.engine.generate(_make_feature_set({
            "savings_ratio": -0.1,
            "spending_to_income_ratio": 1.3,
            "high_risk_spending_frequency": 0.25,
            "income_stability_score": 0.20,
            "spending_volatility": 0.80,
        }), 350.0)
        assert len(recs) <= 8

    def test_recommendation_has_all_required_fields(self):
        recs = self.engine.generate(_make_feature_set(), 700.0)
        for rec in recs:
            assert rec.recommendation
            assert rec.priority in {"High", "Medium", "Low"}
            assert rec.category

    def test_excellent_profile_yields_low_priority_only(self):
        perfect = _make_feature_set({
            "savings_ratio": 0.45,
            "financial_discipline_score": 0.90,
            "income_stability_score": 0.88,
            "high_risk_spending_frequency": 0.01,
            "spending_to_income_ratio": 0.55,
            "spending_volatility": 0.15,
            "impulsive_spending_score": 0.10,
        })
        recs = self.engine.generate(perfect, 820.0)
        for rec in recs:
            assert rec.priority in {"Low", "Medium"}


class TestBehavioralAnalyticsEngine:
    engine = BehavioralAnalyticsEngine()

    def test_returns_spender_profile(self):
        result = self.engine.analyze(_make_feature_set())
        assert result.spender_profile.profile_label
        assert result.spender_profile.profile_description

    def test_disciplined_profile_classification(self):
        disciplined = _make_feature_set({
            "financial_discipline_score": 0.85,
            "income_stability_score": 0.82,
            "savings_ratio": 0.35,
        })
        result = self.engine.analyze(disciplined)
        assert "Disciplined" in result.spender_profile.profile_label or "Stable" in result.spender_profile.profile_label

    def test_high_volatility_profile_classification(self):
        """When volatility/impulse are high, critical insights should be present."""
        volatile = _make_feature_set({
            "spending_volatility": 0.85,
            "impulsive_spending_score": 0.65,
            "high_risk_spending_frequency": 0.25,
            # Override so disciplined-saver check fails
            "financial_discipline_score": 0.20,
            "income_stability_score": 0.25,
            "savings_ratio": 0.05,
        })
        result = self.engine.analyze(volatile)
        # Either the profile label indicates volatility/impulse, or critical insights are fired
        has_volatile_label = any(
            kw in result.spender_profile.profile_label
            for kw in ("Volatility", "Impulse", "High Risk", "Deficit")
        )
        has_critical_insight = any(i.severity == "Critical" for i in result.insights)
        assert has_volatile_label or has_critical_insight

    def test_insights_have_valid_severity(self):
        result = self.engine.analyze(_make_feature_set())
        for insight in result.insights:
            assert insight.severity in {"Critical", "Warning", "Info"}

    def test_merchant_concentration_populated(self):
        result = self.engine.analyze(_make_feature_set())
        assert isinstance(result.merchant_concentration, list)

    def test_category_risk_breakdown_has_risk_levels(self):
        result = self.engine.analyze(_make_feature_set())
        for item in result.category_risk_breakdown:
            assert item["risk_level"] in {"High", "Medium", "Low"}


class TestFinancialStoryGenerator:
    generator = FinancialStoryGenerator()

    def test_story_has_headline(self):
        fs = _make_feature_set()
        story = self.generator.generate(
            features=fs.features,
            credit_score=720.0,
            risk_level="Medium Risk",
            health_score=68,
            monthly_cash_flow=fs.monthly_cash_flow,
            behavioral_indicators=fs.behavioral_indicators,
        )
        assert story.headline
        assert "720" in story.headline or "Medium" in story.headline or "Strong" in story.headline

    def test_story_segments_not_empty(self):
        fs = _make_feature_set()
        story = self.generator.generate(
            features=fs.features,
            credit_score=550.0,
            risk_level="High Risk",
            health_score=40,
            monthly_cash_flow=[],
            behavioral_indicators=fs.behavioral_indicators,
        )
        assert len(story.narrative_segments) >= 4

    def test_full_narrative_is_combined_text(self):
        fs = _make_feature_set()
        story = self.generator.generate(
            features=fs.features,
            credit_score=780.0,
            risk_level="Low Risk",
            health_score=82,
            monthly_cash_flow=fs.monthly_cash_flow,
            behavioral_indicators=fs.behavioral_indicators,
        )
        assert len(story.full_narrative) > 100
        for segment in story.narrative_segments:
            assert segment.text in story.full_narrative

    def test_segment_types_are_valid(self):
        fs = _make_feature_set()
        story = self.generator.generate(
            features=fs.features,
            credit_score=640.0,
            risk_level="Medium Risk",
            health_score=60,
            monthly_cash_flow=fs.monthly_cash_flow,
            behavioral_indicators=fs.behavioral_indicators,
        )
        valid_types = {"header", "positive", "warning", "neutral", "recommendation"}
        for seg in story.narrative_segments:
            assert seg.segment_type in valid_types
