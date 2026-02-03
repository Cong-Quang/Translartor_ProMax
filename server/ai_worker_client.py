import asyncio
import websockets
import json
import uuid

# CẤU HÌNH KẾT NỐI
# Nếu chạy local: "ws://localhost:3001"
# Nếu chạy qua Ngrok: "wss://<id>.ngrok-free.app"
SERVER_URL = "ws://localhost:3001" 
ROOM_ID = "room_test_1"
CLIENT_ID = f"colab_worker_{uuid.uuid4().hex[:8]}"

async def connect_to_server():
    uri = f"{SERVER_URL}/ws/{ROOM_ID}/{CLIENT_ID}?role=colab"
    print(f"🔌 Connecting to {uri}...")
    
    while True:
        try:
            async with websockets.connect(uri) as websocket:
                print("✅ Connected to Server as Colab Client!")
                
                while True:
                    try:
                        message = await websocket.recv()
                        data = json.loads(message)
                        
                        task = data.get("task")
                        if task == "translate":
                            print(f"\n📩 Received Translation Task:")
                            print(f"   - From User: {data.get('sender_id')}")
                            print(f"   - Content: {data.get('content')}")
                            print(f"   - Src Lang: {data.get('src_lang')}")
                            print(f"   - Target Lang: {data.get('target_lang')}")
                            
                            # =================================================
                            # GIẢ LẬP XỬ LÝ AI (Thay thế bằng code AI thật ở đây)
                            # =================================================
                            original_text = data.get("content")
                            src_lang = data.get("src_lang")
                            target_lang = data.get("target_lang")
                            
                            # Demo logic: Đảo ngược chuỗi hoặc thêm prefix
                            translated_text = f"[{src_lang}->{target_lang}] Trans: {original_text}"
                            
                            # Giả lập độ trễ xử lý
                            await asyncio.sleep(1) 
                            # =================================================
                            
                            # Gửi kết quả về Server
                            response_payload = {
                                "target_user_id": data["target_user_id"],
                                "translated_text": translated_text,
                                "sender_id": data["sender_id"],
                                "original_content": original_text
                            }
                            await websocket.send(json.dumps(response_payload))
                            print(f"🚀 Sent Result: {translated_text}")
                            
                    except websockets.exceptions.ConnectionClosed:
                        print("⚠️ Connection closed by server.")
                        break
                    except Exception as e:
                        print(f"❌ Error processing message: {e}")
                        
        except Exception as e:
            print(f"❌ Connection failed: {e}")
            print("🔄 Retrying in 5 seconds...")
            await asyncio.sleep(5)

if __name__ == "__main__":
    try:
        asyncio.run(connect_to_server())
    except KeyboardInterrupt:
        print("\n🛑 Stopped by user")
