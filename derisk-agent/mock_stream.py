import asyncio
import json
import random
from fastapi import FastAPI
from fastapi.responses import StreamingResponse

app = FastAPI()


async def event_generator():
    while True:
        await asyncio.sleep(2)
        event_data = {
            "tx_hash": f"0x{random.randint(1000000, 9999999):x}",
            "features": {
                "volume": random.randint(100, 2000000),
                "frequency": random.randint(1, 150),
            },
        }
        yield f"data: {json.dumps(event_data)}\n\n"


@app.get("/stream")
async def stream():
    return StreamingResponse(event_generator(), media_type="text/event-stream")
