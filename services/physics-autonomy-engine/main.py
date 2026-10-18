"""
FastAPI + WebSocket 1,000 Hz Telemetry Server & Autonomy Pipeline
"""

import asyncio
import json
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from state_schema import VehicleState6DOF
from physics_solver import RoadsterPhysicsSolver
from autonomy_stack import VLAAutonomyStack

app = FastAPI(title="Tesla Roadster 2026 Physics & Autonomy Engine", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global simulation instance
state = VehicleState6DOF()
solver = RoadsterPhysicsSolver(state)
autonomy = VLAAutonomyStack(state)

active_adventure = "ADV-01"

@app.get("/health")
def health():
    return {
        "status": "online",
        "variant": state.variant.name,
        "copv_pressure_bar": state.stagnation_pressure_bar,
        "copv_gas_mass_kg": state.gas_mass_kg,
        "suction_downforce_n": state.suction_downforce_n
    }

@app.post("/set-adventure/{adv_id}")
def set_adventure(adv_id: str):
    global active_adventure
    active_adventure = adv_id
    state.init_rocket_defaults()
    return {"message": f"Active adventure set to {adv_id}"}

@app.websocket("/ws/telemetry")
async def websocket_telemetry(websocket: WebSocket):
    await websocket.accept()
    try:
        dt = 0.001 # 1 kHz tick
        tick_counter = 0

        while True:
            # 1. Autonomy Tier 1 (25 Hz)
            if tick_counter % 40 == 0:
                cmd = autonomy.tier1_vla_planner(active_adventure)

            # 2. Autonomy Tier 2 (250 Hz)
            if tick_counter % 4 == 0:
                w_des = autonomy.tier2_convex_mpc_step(0.004, cmd)

            # 3. Autonomy Tier 3 & Physics Step (1,000 Hz)
            autonomy.tier3_control_allocation(w_des)
            solver.step(dt)

            # Send telemetry to client at 60 Hz to avoid network saturation
            if tick_counter % 16 == 0:
                # Send raw binary 512 bytes
                await websocket.send_bytes(state.to_bytes())

            tick_counter += 1
            await asyncio.sleep(0.001)

    except WebSocketDisconnect:
        pass
    except Exception as e:
        print(f"WS error: {e}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
