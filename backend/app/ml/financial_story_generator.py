"""
Financial Story Generator - Sprint 3
Produces human-readable, personalized financial narratives
that explain credit scores and behavioral patterns.
"""
from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime, timezone


@dataclass(frozen=True)
class StorySegment:
    segment_type: str  # "header" | "positive" | "warning" | "neutral" | "recommendation"
    text: str


@dataclass(frozen=True)
class FinancialStory:
    headline: str
    narrative_segments: list[StorySegment]
    full_narrative: str


class FinancialStoryGenerator:
    """
    Converts ML outputs and financial features into structured,
    human-readable financial narratives.
    """

    def generate(
        self,
        features: dict,
        credit_score: float,
        risk_level: str,
        health_score: int,
        monthly_cash_flow: list,
        behavioral_indicators: dict,
    ) -> FinancialStory:
        segments: list[StorySegment] = []

        # ---- HEADLINE ---------------------------------------------------- #
        headline = self._generate_headline(credit_score, risk_level, health_score)

        # ---- OPENING CONTEXT ---- #
        opening = self._opening_context(credit_score, risk_level, features)
        segments.append(StorySegment(segment_type="header", text=opening))

        # ---- INCOME NARRATIVE ---- #
        income_text = self._income_narrative(features)
        segment_type = "positive" if features["income_stability_score"] >= 0.60 else "warning"
        segments.append(StorySegment(segment_type=segment_type, text=income_text))

        # ---- SAVINGS NARRATIVE ---- #
        savings_text = self._savings_narrative(features)
        segment_type = "positive" if features["savings_ratio"] >= 0.15 else "warning"
        segments.append(StorySegment(segment_type=segment_type, text=savings_text))

        # ---- SPENDING NARRATIVE ---- #
        spending_text = self._spending_narrative(features)
        segment_type = "warning" if features["spending_volatility"] > 0.5 or features["impulsive_spending_score"] > 0.35 else "neutral"
        segments.append(StorySegment(segment_type=segment_type, text=spending_text))

        # ---- TREND NARRATIVE ---- #
        trend_text = self._trend_narrative(features, monthly_cash_flow)
        segments.append(StorySegment(segment_type="neutral", text=trend_text))

        # ---- BEHAVIORAL SUMMARY ---- #
        behavioral_text = self._behavioral_summary(behavioral_indicators)
        segments.append(StorySegment(segment_type="neutral", text=behavioral_text))

        # ---- CLOSING RECOMMENDATION ---- #
        closing = self._closing_recommendation(credit_score, features)
        segments.append(StorySegment(segment_type="recommendation", text=closing))

        full_narrative = "\n\n".join(segment.text for segment in segments)

        return FinancialStory(
            headline=headline,
            narrative_segments=segments,
            full_narrative=full_narrative,
        )

    def _generate_headline(self, score: float, risk_level: str, health_score: int) -> str:
        if score >= 800:
            return f"Exceptional Financial Profile — {int(score)}/900 Credit Score"
        if score >= 750:
            return f"Strong Financial Health — {int(score)}/900 Credit Score, Low Risk"
        if score >= 650:
            return f"Solid Foundation with Growth Potential — {int(score)}/900 Credit Score"
        if score >= 550:
            return f"Developing Financial Profile — {int(score)}/900 Credit Score"
        return f"Financial Profile Needs Attention — {int(score)}/900 Credit Score"

    def _opening_context(self, score: float, risk_level: str, f: dict) -> str:
        months = int(f.get("transaction_frequency", 0) / max(f.get("transaction_frequency", 1), 1))
        income_str = f"₹{int(f['average_monthly_income']):,}" if f["average_monthly_income"] > 0 else "your income"

        if score >= 750:
            tone = (
                f"Your financial profile reflects strong discipline and stability. "
                f"With an alternative credit score of {int(score)}/900, you are classified as {risk_level}. "
                f"Your average monthly income of {income_str} is managed with consistent savings habits."
            )
        elif score >= 600:
            tone = (
                f"Your financial profile shows a solid foundation with notable opportunities for improvement. "
                f"Your alternative credit score of {int(score)}/900 places you in the {risk_level} category. "
                f"With average monthly activity of {income_str}, strategic adjustments can elevate your profile."
            )
        else:
            tone = (
                f"Your financial profile indicates areas that need immediate attention. "
                f"Your alternative credit score of {int(score)}/900 classifies you as {risk_level}. "
                f"This analysis identifies the specific behaviors driving your current profile and what can be done."
            )
        return tone

    def _income_narrative(self, f: dict) -> str:
        stability = f["income_stability_score"]
        recurring = f["recurring_income_confidence"]
        income = f["average_monthly_income"]

        if stability >= 0.75 and recurring >= 0.70:
            return (
                f"Income Stability: Your income pattern demonstrates excellent reliability. "
                f"With a stability score of {stability:.0%} and recurring income confidence of {recurring:.0%}, "
                f"your ₹{int(income):,} average monthly income strongly supports repayment capacity."
            )
        if stability >= 0.50:
            return (
                f"Income Stability: Your income is moderately stable at {stability:.0%} consistency. "
                f"Strengthening recurring income sources will improve your credit confidence rating."
            )
        return (
            f"Income Stability: Your income shows significant irregularity ({stability:.0%} stability). "
            f"Establishing predictable income streams is the most impactful change you can make to your credit profile."
        )

    def _savings_narrative(self, f: dict) -> str:
        ratio = f["savings_ratio"]
        discipline = f["financial_discipline_score"]

        if ratio >= 0.25:
            return (
                f"Savings Behavior: You are saving {ratio:.0%} of your income — well above the recommended 20% benchmark. "
                f"Your financial discipline score of {discipline:.0%} is exceptional and contributes significantly to your credit score."
            )
        if ratio >= 0.10:
            return (
                f"Savings Behavior: You are saving {ratio:.0%} of your income — approaching but below the ideal 20% target. "
                f"A focused effort to increase savings by 5-10% would meaningfully improve your financial health score."
            )
        if ratio >= 0.0:
            return (
                f"Savings Behavior: Your savings rate of {ratio:.0%} is critically low. "
                f"Building an emergency fund and committing to at least 10% monthly savings is the top priority."
            )
        return (
            f"Savings Behavior: Your expenses exceed your income, resulting in a negative savings ratio of {ratio:.0%}. "
            f"This is the most urgent financial risk to address immediately."
        )

    def _spending_narrative(self, f: dict) -> str:
        volatility = f["spending_volatility"]
        impulsive = f["impulsive_spending_score"]
        weekend = f["weekend_spending_ratio"]
        high_risk = f["high_risk_spending_frequency"]

        parts = []
        if volatility > 0.50:
            parts.append(f"spending volatility of {volatility:.2f} (high month-to-month variation)")
        if impulsive > 0.35:
            parts.append(f"impulsive spending patterns ({impulsive:.0%} impulse score)")
        if weekend > 0.40:
            parts.append(f"elevated weekend spending ({weekend:.0%} of total expenses)")
        if high_risk > 0.10:
            parts.append(f"high-risk category activity ({high_risk:.0%} of transactions)")

        if not parts:
            return (
                "Spending Behavior: Your spending patterns are well-controlled with low volatility "
                "and minimal high-risk activity. This is a significant strength in your credit profile."
            )
        concern_list = "; ".join(parts)
        return (
            f"Spending Behavior: Analysis identified the following spending concerns: {concern_list}. "
            f"Targeted budget controls in these areas will have the most immediate positive impact."
        )

    def _trend_narrative(self, f: dict, monthly_cash_flow: list) -> str:
        growth = f["monthly_growth_trend"]
        consistency = f["cash_flow_consistency"]

        trend_word = "improving" if growth > 0.05 else ("declining" if growth < -0.05 else "stable")

        if not monthly_cash_flow:
            return (
                "Cash Flow Trends: Upload more transaction history to enable trend analysis "
                "and unlock month-over-month financial progress tracking."
            )

        months = len(monthly_cash_flow)
        if consistency >= 0.70:
            return (
                f"Cash Flow Trends: Across {months} months of data, your net cash flow is {trend_word} "
                f"with high consistency ({consistency:.0%}). Consistent cash flow is a strong predictor "
                f"of financial reliability."
            )
        return (
            f"Cash Flow Trends: Across {months} months of data, your cash flow is {trend_word} "
            f"but inconsistent ({consistency:.0%} consistency). Smoothing monthly variations "
            f"will improve both your financial health score and credit profile."
        )

    def _behavioral_summary(self, behavioral_indicators: dict) -> str:
        discipline = behavioral_indicators.get("financial_discipline_score", 0)
        regularity = behavioral_indicators.get("transaction_regularity_score", 0)
        recurring = behavioral_indicators.get("recurring_income_confidence", 0)

        return (
            f"Behavioral Summary: Your behavioral indicators show a financial discipline score of {discipline:.0%}, "
            f"transaction regularity of {regularity:.0%}, and recurring income confidence of {recurring:.0%}. "
            + (
                "These collectively position you as a reliable financial actor."
                if discipline >= 0.55
                else "Improving these metrics through consistent habits will compound your credit improvement."
            )
        )

    def _closing_recommendation(self, score: float, f: dict) -> str:
        if score >= 750:
            return (
                "Path Forward: Your profile is strong. Maintain your current financial discipline, "
                "explore premium credit products, and consider investment vehicles to grow your wealth further."
            )
        if score >= 650:
            return (
                "Path Forward: You are on track to reach the Low Risk band. Focus on increasing savings by 5%, "
                "reducing discretionary expenses, and maintaining transaction regularity to see improvement within 3 months."
            )
        if score >= 550:
            return (
                "Path Forward: Address the high-priority recommendations — specifically savings rate and spending control. "
                "Consistent improvement in these areas for 2-3 months will show measurable score improvement."
            )
        return (
            "Path Forward: Immediate corrective action is needed. Prioritize: (1) eliminate deficit spending, "
            "(2) build emergency savings, (3) reduce high-risk category transactions. "
            "Re-evaluate in 60 days to measure progress."
        )


financial_story_generator = FinancialStoryGenerator()
