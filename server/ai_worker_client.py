
import asyncio
import websockets
import json
import time

# --- CONFIGURATION ---
# Replace with your actual Server URL and Key
SERVER_URL = "ws://xomnhala.ddns.net:3001/ws/worker"
AI_WORKER_KEY = "change_this_to_a_secure_key" 

async def ai_worker():
    uri = f"{SERVER_URL}?key={AI_WORKER_KEY}"
    print(f"Connecting to {uri}...")
    
    while True:
        try:
            async with websockets.connect(uri) as websocket:
                print("✅ Connected to Server as AI Worker!")
                
                while True:
                    try:
                        message = await websocket.recv()
                        data = json.loads(message)
                        print(f"📩 Received request from User {data.get('user_id')} in Room {data.get('room_id')}")
                        
                        # --- AI PROCESSING LOGIC HERE ---
                        # Example: Determine request type (STT, Translation, TTS)
                        # For now, we simulate processing
                        
                        request_type = data.get("type", "unknown")
                        response_data = {
                            "type": "ai-response",
                            "room_id": data.get("room_id"),
                            "target_user_id": data.get("user_id"), # Optional: if you want to target specific user
                            "message": f"AI Processed: {data.get('message', '')} (Simulated)"
                        }
                        
                        # Simulate processing time
                        # await asyncio.sleep(0.5) 
                        
                        # Send result back
                        await websocket.send(json.dumps(response_data))
                        print(f"kiểm tra sent response: {response_data}")
                        
                    except websockets.ConnectionClosed:
                        print("❌ Connection lost. Reconnecting...")
                        break
                    except Exception as e:
                        print(f"⚠️ Error processing message: {e}")
                        
        except Exception as e:
            print(f"❌ Connection failed: {e}. Retrying in 5s...")
            await asyncio.sleep(5)

# Run the worker
if __name__ == "__main__":
    # Install websockets if running in Colab: !pip install websockets
    print("Starting AI Worker...")
    try:
        asyncio.run(ai_worker())
    except KeyboardInterrupt:
        print("Stopped.")
