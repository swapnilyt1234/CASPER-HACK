import pandas as pd
from unittest.mock import patch, Mock
import requests

from x402_client import X402Client
from risk_evaluator import RiskEvaluator
from stream_listener import StreamListener


def test_x402_client_intercepts_402():
    client = X402Client("http://mock-api.com")

    with patch("requests.Session.get") as mock_get:
        # First call returns 402, second call returns 200
        mock_response_402 = Mock(spec=requests.Response)
        mock_response_402.status_code = 402
        mock_response_402.headers = {"WWW-Authenticate": 'L402 macaroon="xyz"'}

        mock_response_200 = Mock(spec=requests.Response)
        mock_response_200.status_code = 200

        mock_get.side_effect = [mock_response_402, mock_response_200]

        response = client.get("/validate")
        assert response.status_code == 200
        assert mock_get.call_count == 2

        # Verify the second call included Authorization
        args, kwargs = mock_get.call_args_list[1]
        assert "Authorization" in kwargs.get("headers", {})
        assert kwargs["headers"]["Authorization"].startswith("L402")


def test_risk_evaluator_valid():
    evaluator = RiskEvaluator()
    tx_data = {"hash": "0x123", "features": {"volume": 2000000, "frequency": 150}}
    result = evaluator.evaluate_transaction(tx_data)
    assert result.risk_score > 50
    assert result.target_premium_rate > 5.0


def test_risk_evaluator_fallback():
    evaluator = RiskEvaluator()
    tx_data = {
        "hash": "0x123",
        "features": {"volume": 2000000, "frequency": 150},
        "test_bad_llm": True,  # This triggers the mock LLM to return 50.0 premium, failing validation
    }
    result = evaluator.evaluate_transaction(tx_data)

    # Assert fallback values
    assert result.risk_score == 100
    assert result.target_premium_rate == 15.0


def test_stream_listener_buffer():
    listener = StreamListener("http://mock-stream")

    listener.buffer = [{"tx_hash": "A", "value": 100}, {"tx_hash": "B", "value": 200}]

    df = listener.get_dataframe()
    assert isinstance(df, pd.DataFrame)
    assert len(df) == 2
    assert "tx_hash" in df.columns
