import logging
from pydantic import BaseModel, Field, ValidationError

logger = logging.getLogger(__name__)


class RiskEvaluationResult(BaseModel):
    risk_score: int = Field(ge=1, le=100, description="Risk score from 1 to 100")
    target_premium_rate: float = Field(
        ge=1.0, le=30.0, description="Target premium percentage between 1.0 and 30.0"
    )


class RiskEvaluator:
    def __init__(self):
        # Mock LLM initialization
        pass

    def sanitize_transaction_trace(self, data: dict) -> dict:
        """
        Strips extraneous fields and caps numeric sizes to prevent token exhaustion.
        """
        sanitized = {}
        if "hash" in data:
            sanitized["hash"] = str(data["hash"])[:66]  # Cap hash length

        features = data.get("features", {})
        if isinstance(features, dict):
            # Cap numeric values and remove unknown keys
            sanitized["features"] = {
                "volume": min(float(features.get("volume", 0)), 1e9),
                "frequency": min(int(features.get("frequency", 0)), 10000),
            }
        else:
            sanitized["features"] = {"volume": 0, "frequency": 0}

        return sanitized

    def evaluate_transaction(self, transaction_data: dict) -> RiskEvaluationResult:
        """
        Evaluates a transaction for flash-loan or drain patterns.
        """
        try:
            sanitized_data = self.sanitize_transaction_trace(transaction_data)
            logger.info(
                f"Evaluating sanitized transaction: {sanitized_data.get('hash', 'unknown')}"
            )

            # Mock LLM logic
            features = sanitized_data.get("features", {})
            volume = features.get("volume", 0)
            frequency = features.get("frequency", 0)

            risk_score = 1
            target_premium = 5.0  # default 5%

            if volume > 1000000:
                risk_score += 50
                target_premium += 10.0
            if frequency > 100:
                risk_score += 30
                target_premium += 5.0

            # If the user explicitly tests a bad premium value, mock a bad LLM response
            if transaction_data.get("test_bad_llm"):
                target_premium = 50.0  # Will fail validation (max 30)

            # Validate output using Pydantic
            validated_result = RiskEvaluationResult(
                risk_score=min(risk_score, 100), target_premium_rate=target_premium
            )

            logger.info(
                f"Calculated risk score: {validated_result.risk_score}, Premium: {validated_result.target_premium_rate}%"
            )
            return validated_result

        except ValidationError as e:
            logger.error(
                f"LLM output validation failed: {e}. Defaulting to high-security fallback."
            )
            return RiskEvaluationResult(risk_score=100, target_premium_rate=15.0)
        except Exception as e:
            logger.error(
                f"LLM inference error: {e}. Defaulting to high-security fallback."
            )
            return RiskEvaluationResult(risk_score=100, target_premium_rate=15.0)
