import requests
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class X402Client:
    def __init__(self, base_url: str):
        self.base_url = base_url
        self.session = requests.Session()

    def get(self, endpoint: str, **kwargs) -> requests.Response:
        url = f"{self.base_url}{endpoint}"
        response = self.session.get(url, **kwargs)

        if response.status_code == 402:
            logger.info("402 Payment Required intercepted. Negotiating x402 payment...")
            return self._handle_402_payment(response, url, "GET", **kwargs)

        return response

    def post(self, endpoint: str, **kwargs) -> requests.Response:
        url = f"{self.base_url}{endpoint}"
        response = self.session.post(url, **kwargs)

        if response.status_code == 402:
            logger.info("402 Payment Required intercepted. Negotiating x402 payment...")
            return self._handle_402_payment(response, url, "POST", **kwargs)

        return response

    def _handle_402_payment(
        self, response: requests.Response, url: str, method: str, **kwargs
    ) -> requests.Response:
        # Mock payment negotiation
        challenge = response.headers.get("WWW-Authenticate", "")
        if "L402" not in challenge and "x402" not in challenge:
            logger.warning("No recognized L402/x402 challenge header found.")
            return response

        # Parse mac and invoice from challenge...
        logger.info(f"Fulfilling payment for challenge: {challenge}")

        # Simulate payment fulfillment and obtaining preimage
        mock_preimage = "mock_preimage_hash"
        mock_mac = "mock_mac_string"

        auth_header = f"L402 {mock_mac}:{mock_preimage}"
        logger.info(
            f"Payment fulfilled. Retrying request with Authorization: {auth_header}"
        )

        headers = kwargs.pop("headers", {})
        headers["Authorization"] = auth_header

        if method == "GET":
            return self.session.get(url, headers=headers, **kwargs)
        else:
            return self.session.post(url, headers=headers, **kwargs)
