
import React, { useRef, useEffect, useState } from 'react';

interface CameraModalProps {
    t: (key: string) => string;
    onClose: () => void;
    onCapture: (base64Image: string) => void;
}

const CameraModal: React.FC<CameraModalProps> = ({ t, onClose, onCapture }) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [error, setError] = useState<string | null>(null);
    const [currentTip, setCurrentTip] = useState('');

    useEffect(() => {
        const tips = t('cameraTips').split('|');
        if (tips.length > 0) {
            setCurrentTip(tips[0]);
            let tipIndex = 0;
            const interval = setInterval(() => {
                tipIndex = (tipIndex + 1) % tips.length;
                setCurrentTip(tips[tipIndex]);
            }, 4000); // Change tip every 4 seconds

            return () => clearInterval(interval);
        }
    }, [t]);

    useEffect(() => {
        let stream: MediaStream | null = null;
        
        const startCamera = async () => {
            try {
                if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
                    throw new Error("Camera API not available in this browser.");
                }
                stream = await navigator.mediaDevices.getUserMedia({ video: true });
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                }
            } catch (err) {
                console.error("Camera access denied:", err);
                setError(t('cameraError'));
            }
        };

        startCamera();

        return () => {
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
            }
        };
    }, [t]);

    const handleCapture = () => {
        if (!videoRef.current) return;

        const canvas = document.createElement('canvas');
        canvas.width = videoRef.current.videoWidth;
        canvas.height = videoRef.current.videoHeight;
        const ctx = canvas.getContext('2d');
        if (ctx) {
            ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
            const dataUrl = canvas.toDataURL('image/png');
            onCapture(dataUrl);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/80 flex flex-col items-center justify-center z-50 p-4 backdrop-blur-sm">
            <div className="relative w-full max-w-2xl">
                <video ref={videoRef} autoPlay playsInline className="w-full h-auto rounded-lg" style={{ transform: 'scaleX(-1)' }} />
                
                {currentTip && (
                    <div className="absolute top-3 left-3 right-3 p-2 bg-black/50 text-white text-center text-sm rounded-lg backdrop-blur-sm transition-opacity duration-500">
                        {currentTip}
                    </div>
                )}
                
                {error && (
                    <div className="absolute bottom-2 left-2 right-2 bg-red-800/80 text-white text-center p-2 rounded">
                        {error.split('\n').map((line, i) => (
                            <p key={i} className="text-sm">{line}</p>
                        ))}
                    </div>
                )}
            </div>
            <div className="mt-6 flex gap-4">
                <button onClick={onClose} className="btn-secondary px-8 py-3 rounded-lg text-lg">{t('cancel')}</button>
                <button onClick={handleCapture} disabled={!!error} className="btn-primary px-8 py-3 rounded-lg text-lg">{t('capture')}</button>
            </div>
        </div>
    );
};

export default CameraModal;
