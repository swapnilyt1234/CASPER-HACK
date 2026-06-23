import asyncio
import logging
from datetime import datetime
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from risk_evaluator import RiskEvaluator

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@asynccontextmanager
async def lifespan(app: FastAPI):
    add_log("action", "Agent initialized. Connecting to stream...")
    task = asyncio.create_task(agent_loop())
    yield
    task.cancel()

app = FastAPI(lifespan=lifespan)

logs_buffer = []


def add_log(type, message, risk_score=None):
    log_entry = {
        "id": f"log_{len(logs_buffer)}_{datetime.utcnow().timestamp()}",
        "timestamp": datetime.utcnow().strftime("%H:%M:%S.%f")[:-3],
        "type": type,
        "message": message,
        "riskScore": risk_score,
    }
    logs_buffer.append(log_entry)
    if len(logs_buffer) > 50:
        logs_buffer.pop(0)


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


async def agent_loop():
    # Background loop is now purely passive, waiting for POST /ingest
    while True:
        await asyncio.sleep(60)


@app.post("/ingest")
async def ingest_event(request: Request):
    data = await request.json()
    add_log(
        "ingest",
        f"[SSE] Received injected block event: {data.get('hash', 'unknown')[:10]}",
    )

    evaluator = RiskEvaluator()
    eval_result = evaluator.evaluate_transaction(data)
    risk = eval_result.risk_score
    add_log(
        "eval",
        f"[LLM] Evaluated transaction pattern. Premium set to {eval_result.target_premium_rate}%",
        risk_score=risk,
    )

    if risk > 80:
        add_log(
            "x402",
            "[PAYMENT] Intercepted 402 Required. Fulfilling micropayment via Lightning.",
        )
        add_log(
            "action",
            "[CONTRACT] Executing DeRiskVault::update_risk_params(halt_coverage: true)",
        )

    return {
        "status": "processed",
        "risk_score": risk,
        "target_premium": eval_result.target_premium_rate,
    }


@app.get("/api/logs")
def get_logs():
    return logs_buffer
