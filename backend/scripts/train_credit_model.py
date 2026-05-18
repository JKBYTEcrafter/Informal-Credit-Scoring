from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

sys.path.append(str(Path(__file__).resolve().parents[1]))

from app.ml.training import CreditModelTrainer


def main() -> None:
    parser = argparse.ArgumentParser(description="Train the Sprint 2 credit scoring model.")
    parser.add_argument("--samples", type=int, default=None, help="Synthetic training rows.")
    parser.add_argument(
        "--skip-optional-models",
        action="store_true",
        help="Train only the Random Forest baseline.",
    )
    parser.add_argument(
        "--tune",
        action="store_true",
        help="Run Random Forest hyperparameter tuning.",
    )
    parser.add_argument(
        "--output",
        type=Path,
        default=None,
        help="Optional path to write the model report JSON.",
    )
    args = parser.parse_args()

    report = CreditModelTrainer().train(
        n_samples=args.samples,
        include_optional_models=not args.skip_optional_models,
        tune_hyperparameters=args.tune,
    )
    rendered = json.dumps(report, indent=2)
    if args.output:
        args.output.parent.mkdir(parents=True, exist_ok=True)
        args.output.write_text(rendered, encoding="utf-8")
    print(rendered)


if __name__ == "__main__":
    main()
