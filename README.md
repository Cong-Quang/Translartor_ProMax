Bên dưới gồm **3 sơ đồ**:

1. Tổng thể hệ thống
2. Luồng realtime WebSocket
3. Luồng xử lý theo năng lực máy (CPU / TTS)

---

# 1️⃣ SƠ ĐỒ TỔNG THỂ (END-TO-END)

```
┌─────────────────────────────┐
│        ANDROID APP          │
│─────────────────────────────│
│ - AudioRecord (16kHz PCM)   │
│ - (Optional) VAD            │
│ - WebSocket Client          │
│ - Subtitle UI               │
│ - (Optional) Audio Player   │
└───────────────┬─────────────┘
                │ WebSocket
                │ (audio chunks 2s - 5s)
                ▼
┌──────────────────────────────────────────┐
│           LOCAL AI SERVER                 │
│ (CPU-first, optional GPU)                │
│──────────────────────────────────────────│
│ WebSocket Gateway                        │
│  ├─ Session Manager                      │
│  ├─ User / Room mapping                  │
│  └─ Feature Flags (TTS on/off)           │
│                                          │
│ Processing Pipeline (shared workers):    │
│  ├─ VAD (server-side fallback)           │
│  ├─ ASR  (faster-whisper small)          │
│  ├─ MT   (M2M100-418M)                   │
│  └─ (opt) Piper TTS                      │
│                                          │
│ Resource Monitor                         │
│  ├─ CPU / RAM                            │
│  ├─ GPU (nếu có)                         │
│  └─ Auto disable TTS                     │
└───────────────┬──────────────────────────┘
                │
                │ subtitle / translation
                │ + optional TTS audio
                ▼
┌─────────────────────────────┐
│        ANDROID APP          │
│─────────────────────────────│
│ - Show subtitle + dịch      │
│ - Play TTS (nếu bật)        │
└─────────────────────────────┘
```

---

# 2️⃣ SƠ ĐỒ LUỒNG REALTIME (WEBSOCKET)

```
Android App                      Local Server
────────────                    ─────────────
WS CONNECT  ──────────────────▶  Session created

SEND hello:
{ user_id, room_id }
──────────────────────────────▶  Assign profile + features

START AUDIO STREAM
┌───────────────┐
│ PCM chunk 2s  │
└───────────────┘
──────────────────────────────▶  Queue(audio)

                                 ┌───────────────┐
                                 │   ASR Worker  │
                                 │ (shared pool) │
                                 └───────┬───────┘
                                         ▼
                                   Text + timestamp
                                         ▼
                                 ┌───────────────┐
                                 │ Translation   │
                                 │ (M2M100)      │
                                 └───────┬───────┘
                                         ▼
                               Translated subtitle
                                         ▼
                           ┌────────────────────────┐
                           │   TTS Enabled ?        │
                           └───────┬────────┬──────┘
                                   │NO       │YES
                                   ▼         ▼
                           send text     Piper TTS
                           only           (queue)
                                   │         │
                                   ▼         ▼
                             WS SEND       WS SEND
                             subtitle      audio+text
```

---

# 3️⃣ SƠ ĐỒ TỰ PHÁT HIỆN MÁY (CPU / TTS)

```
SERVER START
    │
    ▼
┌───────────────────────┐
│ Hardware Detector     │
│ - CPU cores           │
│ - RAM                 │
│ - GPU + VRAM (nếu có) │
└───────────┬───────────┘
            ▼
┌───────────────────────┐
│ Capability Profile    │
│───────────────────────│
│ LOW  : CPU < 6 cores  │
│ MID  : CPU tốt / GPU  │
│ HIGH : GPU ≥ 6GB      │
└───────────┬───────────┘
            ▼
┌─────────────────────────────┐
│ Feature Flags                │
│─────────────────────────────│
│ LOW  → subtitle only         │
│ MID  → subtitle + TTS (1)    │
│ HIGH → subtitle + TTS (many) │
└───────────┬─────────────────┘
            ▼
   Sent to Android on connect
```

---

# 4️⃣ CÁC KHỐI CHỨC NĂNG (MAP RÕ)

### 📱 Android làm gì?

* Thu âm
* Gửi audio
* Hiển thị text
* Phát audio (nếu có)

👉 **Không AI, không nặng**

---

### 🖥️ Server làm gì?

* Gom audio từ nhiều user
* ASR + dịch (shared)
* Quyết định bật/tắt TTS
* Broadcast kết quả

👉 **1 server – nhiều user**

---

# 🏆 TỔNG KẾT (CHỐT KIẾN TRÚC)

✔ Hoạt động tốt cho **4–7 user**
✔ CPU-only vẫn chạy được
✔ Android app nhẹ, ổn định
✔ WebSocket đúng bài
✔ TTS là optional, không phá hệ thống
✔ Scale được nếu sau này có GPU

---
