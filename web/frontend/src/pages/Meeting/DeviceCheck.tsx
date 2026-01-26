
import { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Camera, Mic, MicOff, Video, VideoOff, Volume2, ArrowRight, Settings } from 'lucide-react';
import { useConfig } from '../../context/ConfigContext';

export const DeviceCheck = () => {
    const { t } = useConfig();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const roomId = searchParams.get('room');

    const videoRef = useRef<HTMLVideoElement>(null);
    const [stream, setStream] = useState<MediaStream | null>(null);
    const [isCamOn, setIsCamOn] = useState(true);
    const [isMicOn, setIsMicOn] = useState(true);
    const [audioLevel, setAudioLevel] = useState(0);
    
    const [devices, setDevices] = useState<{ id: string, label: string, kind: MediaDeviceKind }[]>([]);
    const [selectedCam, setSelectedCam] = useState('');
    const [selectedMic, setSelectedMic] = useState('');
    const [selectedSpeaker, setSelectedSpeaker] = useState('');

    // Khởi tạo stream
    useEffect(() => {
        const startStream = async () => {
            try {
                const mediaStream = await navigator.mediaDevices.getUserMedia({
                    video: true,
                    audio: true
                });
                setStream(mediaStream);
                if (videoRef.current) {
                    videoRef.current.srcObject = mediaStream;
                }

                // Lấy danh sách thiết bị
                const deviceList = await navigator.mediaDevices.enumerateDevices();
                setDevices(deviceList.map(d => ({
                    id: d.deviceId,
                    label: d.label || `${d.kind} (${d.deviceId.slice(0, 5)}...)`,
                    kind: d.kind
                })));

                // Audio Context để đo âm lượng
                const audioContext = new AudioContext();
                const analyser = audioContext.createAnalyser();
                const microphone = audioContext.createMediaStreamSource(mediaStream);
                microphone.connect(analyser);
                analyser.fftSize = 256;
                const bufferLength = analyser.frequencyBinCount;
                const dataArray = new Uint8Array(bufferLength);

                const updateAudioLevel = () => {
                    analyser.getByteFrequencyData(dataArray);
                    let sum = 0;
                    for (let i = 0; i < bufferLength; i++) {
                        sum += dataArray[i];
                    }
                    const average = sum / bufferLength;
                    setAudioLevel(average); // 0 - 255
                    requestAnimationFrame(updateAudioLevel);
                };
                updateAudioLevel();

            } catch (err) {
                console.error("Error accessing media devices:", err);
            }
        };

        startStream();

        return () => {
            stream?.getTracks().forEach(track => track.stop());
        };
    }, []);

    const toggleCam = () => {
        if (stream) {
            stream.getVideoTracks().forEach(track => track.enabled = !isCamOn);
            setIsCamOn(!isCamOn);
        }
    };

    const toggleMic = () => {
        if (stream) {
            stream.getAudioTracks().forEach(track => track.enabled = !isMicOn);
            setIsMicOn(!isMicOn);
        }
    };

    const playTestSound = () => {
        const audio = new Audio('/test-sound.mp3'); // Cần file âm thanh mẫu hoặc dùng URL online
        // Dùng URL online tạm thời
        audio.src = 'https://www.soundjay.com/buttons/beep-01a.mp3';
        audio.play().catch(e => console.error(e));
    };

    const handleJoin = () => {
        if (!roomId) {
            alert("Mã phòng không hợp lệ!");
            return;
        }
        navigate(`/room/${roomId}`);
    };

    return (
        <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 animate-in fade-in duration-500">
            <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-8 bg-card rounded-3xl border border-white/5 p-8 shadow-2xl">
                
                {/* Video Preview Area */}
                <div className="relative aspect-video bg-black rounded-2xl overflow-hidden shadow-inner border border-white/10 group">
                    <video 
                        ref={videoRef} 
                        autoPlay 
                        muted 
                        playsInline 
                        className={`w-full h-full object-cover transform scale-x-[-1] transition-opacity duration-300 ${isCamOn ? 'opacity-100' : 'opacity-0'}`} 
                    />
                    
                    {!isCamOn && (
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-24 h-24 rounded-full bg-white/10 flex items-center justify-center">
                                <VideoOff className="w-10 h-10 text-muted-foreground" />
                            </div>
                            <p className="absolute mt-32 text-muted-foreground font-medium">{t('camOff')}</p>
                        </div>
                    )}

                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-4">
                        <button 
                            onClick={toggleMic}
                            className={`p-4 rounded-full transition-all duration-200 ${isMicOn ? 'bg-white/10 hover:bg-white/20 text-white' : 'bg-red-500 text-white shadow-lg shadow-red-500/20'}`}
                        >
                            {isMicOn ? <Mic className="w-6 h-6" /> : <MicOff className="w-6 h-6" />}
                        </button>
                        <button 
                            onClick={toggleCam}
                            className={`p-4 rounded-full transition-all duration-200 ${isCamOn ? 'bg-white/10 hover:bg-white/20 text-white' : 'bg-red-500 text-white shadow-lg shadow-red-500/20'}`}
                        >
                            {isCamOn ? <Video className="w-6 h-6" /> : <VideoOff className="w-6 h-6" />}
                        </button>
                    </div>

                    {/* Audio Level Indicator */}
                    <div className="absolute top-4 right-4 flex flex-col gap-1">
                        <div className="w-1.5 h-16 bg-white/10 rounded-full overflow-hidden flex flex-col-reverse">
                            <div 
                                className={`w-full transition-all duration-75 rounded-full ${isMicOn ? 'bg-green-500' : 'bg-red-500'}`}
                                style={{ height: `${Math.min((audioLevel / 50) * 100, 100)}%` }}
                            />
                        </div>
                    </div>
                </div>

                {/* Settings & Join Area */}
                <div className="flex flex-col justify-center space-y-8">
                    <div className="space-y-2">
                        <h1 className="text-3xl font-bold tracking-tight">{t('checkDevice')}</h1>
                        <p className="text-muted-foreground">Chọn thiết bị âm thanh và hình ảnh phù hợp trước khi vào phòng.</p>
                    </div>

                    <div className="space-y-4">
                        {/* Camera Select */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                                <Camera className="w-4 h-4" /> {t('camera')}
                            </label>
                            <select 
                                className="w-full bg-secondary/30 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all text-sm"
                                value={selectedCam}
                                onChange={(e) => setSelectedCam(e.target.value)}
                            >
                                {devices.filter(d => d.kind === 'videoinput').map(device => (
                                    <option key={device.id} value={device.id}>{device.label}</option>
                                ))}
                            </select>
                        </div>

                        {/* Mic Select */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                                <Mic className="w-4 h-4" /> {t('microphone')}
                            </label>
                            <select 
                                className="w-full bg-secondary/30 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all text-sm"
                                value={selectedMic}
                                onChange={(e) => setSelectedMic(e.target.value)}
                            >
                                {devices.filter(d => d.kind === 'audioinput').map(device => (
                                    <option key={device.id} value={device.id}>{device.label}</option>
                                ))}
                            </select>
                        </div>

                        {/* Speaker Select & Test */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                                <Volume2 className="w-4 h-4" /> {t('speaker')}
                            </label>
                            <div className="flex gap-2">
                                <select 
                                    className="flex-1 bg-secondary/30 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all text-sm"
                                    value={selectedSpeaker}
                                    onChange={(e) => setSelectedSpeaker(e.target.value)}
                                >
                                    {devices.filter(d => d.kind === 'audiooutput').map(device => (
                                        <option key={device.id} value={device.id}>{device.label}</option>
                                    ))}
                                </select>
                                <button 
                                    onClick={playTestSound}
                                    className="px-4 bg-white/10 hover:bg-white/20 rounded-xl transition-colors"
                                    title={t('testSpeaker')}
                                >
                                    <Volume2 className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    </div>

                    <button 
                        onClick={handleJoin}
                        className="w-full py-4 bg-primary text-primary-foreground rounded-xl font-bold text-lg shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3"
                    >
                        <span>{t('joinNow')}</span>
                        <ArrowRight className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </div>
    );
};
