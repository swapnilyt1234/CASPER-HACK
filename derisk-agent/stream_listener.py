import pandas as pd
import json
import sseclient
import requests
import logging
from typing import List

logger = logging.getLogger(__name__)


class StreamListener:
    def __init__(self, stream_url: str):
        self.stream_url = stream_url
        self.buffer: List[dict] = []

    def listen(self, max_events: int = 100):
        logger.info(f"Connecting to CSPR.cloud stream at {self.stream_url}")

        try:
            response = requests.get(
                self.stream_url, stream=True, headers={"Accept": "text/event-stream"}
            )
            response.raise_for_status()
            client = sseclient.SSEClient(response)

            events_processed = 0
            for event in client.events():
                if event.data:
                    try:
                        data = json.loads(event.data)
                        self.buffer.append(data)
                        events_processed += 1

                        if events_processed >= max_events:
                            break
                    except json.JSONDecodeError:
                        logger.error("Failed to decode event data.")
        except Exception as e:
            logger.error(f"Stream connection failed: {e}")

    def get_dataframe(self) -> pd.DataFrame:
        """Converts buffered events to a pandas DataFrame."""
        if not self.buffer:
            return pd.DataFrame()

        df = pd.DataFrame(self.buffer)
        return df

    def clear_buffer(self):
        self.buffer = []
