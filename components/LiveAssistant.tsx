
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { LiveServerMessage, LiveSession } from "@google/genai";
import { Language } from '../types';
import * as geminiService from '../services/geminiService';
import { StopIcon } from './icons/Icons';

// Audio helper functions
function decode(base64: string): Uint8Array {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

type TranscriptItem = {
    role: 'user' | 'assistant';
    content: string;
    isFinal: boolean;
};

interface LiveAssistantContentProps {
    t: (key: string) => string;
    isActive: boolean;
    onClose: () => void;
    language: Language;
}

const LiveAssistantContent: React.FC<LiveAssistantContentProps> = ({ t, isActive, onClose, language }) => {
    const [transcripts, setTranscripts] = useState<TranscriptItem[]>([]);
    const [status, setStatus] = useState<'idle' | 'connecting' | 'listening' | 'speaking' | 'error'>('idle');
    const [error, setError] = useState<string | null>(null);

    const sessionPromiseRef = useRef<Promise<LiveSession> | null>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const inputAudioContextRef = useRef<AudioContext | null>(null);
    const outputAudioContextRef = useRef<AudioContext | null>(null);
    const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);
    const mediaSourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const nextStartTimeRef = useRef(0);
    const audioSourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(scrollToBottom, [transcripts]);
    
    const cleanup = useCallback(async () => {
        console.log("Cleaning up live session resources...");
        if (sessionPromiseRef.current) {
            try {
                const session = await sessionPromiseRef.current;
                session.close();
            } catch (e) {
                console.error("Error closing session:", e);
            }
        }
        
        streamRef.current?.getTracks().forEach(track => track.stop());
        
        scriptProcessorRef.current?.disconnect();
        mediaSourceRef.current?.disconnect();

        if (inputAudioContextRef.current?.state !== 'closed') {
            await inputAudioContextRef.current?.close().catch(e => console.error("Error closing input audio context:", e));
        }
        if (outputAudioContextRef.current?.state !== 'closed') {
            await outputAudioContextRef.current?.close().catch(e => console.error("Error closing output audio context:", e));
        }
        
        audioSourcesRef.current.forEach(source => source.stop());
        audioSourcesRef.current.clear();
        
        sessionPromiseRef.current = null;
        streamRef.current = null;
        inputAudioContextRef.current = null;
        outputAudioContextRef.current = null;
        scriptProcessorRef.current = null;
        mediaSourceRef.current = null;
        nextStartTimeRef.current = 0;

        setTranscripts([]);
        setStatus('idle');
        setError(null);
    }, []);

    useEffect(() => {
        if (isActive) {
            startSession();
        } else {
            cleanup();
        }

        return () => {
            cleanup();
        };
    }, [isActive]);

    const startSession = async () => {
        setStatus('connecting');
        setError(null);
        setTranscripts([]);

        inputAudioContextRef.current = new ((window as any).AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
        outputAudioContextRef.current = new ((window as any).AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });

        let currentInputTranscription = '';
        let currentOutputTranscription = '';
        
        const { sessionPromise, createBlob } = geminiService.startLiveAssistantSession({
            onOpen: async () => {
                setStatus('listening');
                try {
                    streamRef.current = await navigator.mediaDevices.getUserMedia({ audio: true });
                    const source = inputAudioContextRef.current!.createMediaStreamSource(streamRef.current);
                    mediaSourceRef.current = source;
                    
                    const scriptProcessor = inputAudioContextRef.current!.createScriptProcessor(4096, 1, 1);
                    scriptProcessorRef.current = scriptProcessor;

                    scriptProcessor.onaudioprocess = (audioProcessingEvent) => {
                        const inputData = audioProcessingEvent.inputBuffer.getChannelData(0);
                        const pcmBlob = createBlob(inputData);
                        
                        sessionPromiseRef.current?.then((session) => {
                            session.sendRealtimeInput({ media: pcmBlob });
                        });
                    };
                    source.connect(scriptProcessor);
                    scriptProcessor.connect(inputAudioContextRef.current!.destination);
                } catch (err) {
                    console.error("Microphone access denied:", err);
                    setError(t('cameraError'));
                    setStatus('error');
                }
            },
            onMessage: async (message: LiveServerMessage) => {
                if (message.serverContent?.inputTranscription) {
                    const { text, isFinal } = message.serverContent.inputTranscription;
                    currentInputTranscription += text;
                    setTranscripts(prev => {
                        const last = prev[prev.length - 1];
                        if (last?.role === 'user' && !last.isFinal) {
                            return [...prev.slice(0, -1), { role: 'user', content: currentInputTranscription, isFinal }];
                        } else {
                            return [...prev, { role: 'user', content: currentInputTranscription, isFinal }];
                        }
                    });
                     if (isFinal) {
                        currentInputTranscription = '';
                    }
                }
                
                if (message.serverContent?.outputTranscription) {
                    setStatus('speaking');
                    const { text, isFinal } = message.serverContent.outputTranscription;
                    currentOutputTranscription += text;
                     setTranscripts(prev => {
                        const last = prev[prev.length - 1];
                        if (last?.role === 'assistant' && !last.isFinal) {
                            return [...prev.slice(0, -1), { role: 'assistant', content: currentOutputTranscription, isFinal }];
                        } else {
                            return [...prev, { role: 'assistant', content: currentOutputTranscription, isFinal }];
                        }
                    });
                    if (isFinal) {
                        currentOutputTranscription = '';
                    }
                }

                if (message.serverContent?.turnComplete) {
                     setStatus('listening');
                }
                
                const base64Audio = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
                if (base64Audio && outputAudioContextRef.current) {
                    const outputCtx = outputAudioContextRef.current;
                    nextStartTimeRef.current = Math.max(nextStartTimeRef.current, outputCtx.currentTime);
                    
                    const audioBuffer = await decodeAudioData(decode(base64Audio), outputCtx, 24000, 1);
                    const source = outputCtx.createBufferSource();
                    source.buffer = audioBuffer;
                    source.connect(outputCtx.destination);
                    
                    const currentSources = audioSourcesRef.current;
                    source.addEventListener('ended', () => {
                        currentSources.delete(source);
                    });

                    source.start(nextStartTimeRef.current);
                    nextStartTimeRef.current += audioBuffer.duration;
                    currentSources.add(source);
                }

                if (message.serverContent?.interrupted) {
                    audioSourcesRef.current.forEach(s => s.stop());
                    audioSourcesRef.current.clear();
                    nextStartTimeRef.current = 0;
                }
            },
            onError: (e: ErrorEvent) => {
                console.error("Session error:", e);
                setError(e.message || 'An unknown error occurred.');
                setStatus('error');
            },
            onClose: () => {
                if (isActive) { // Only call onClose if the component is supposed to be active
                    onClose();
                }
            },
        }, language);

        sessionPromiseRef.current = sessionPromise;
        try {
            await sessionPromise;
        } catch (e: any) {
            console.error("Failed to connect to session:", e);
            setError(e.message || "Failed to connect to the assistant.");
            setStatus('error');
        }
    };
    
    const avatarUrl = 'https://i.pinimg.com/736x/65/70/c6/6570c6d04325fde88255b9e05b2f466c.jpg';

    return (
        <div className="flex flex-col h-full">
            <div className="p-4 border-b flex items-center justify-center relative" style={{ borderColor: 'var(--card-border-color)' }}>
                <p className="text-sm font-semibold capitalize" style={{color: 'var(--text-muted-color)'}}>{status}</p>
                {status === 'speaking' && <div className="absolute left-4 top-1/2 -translate-y-1/2 w-3 h-3 bg-green-500 rounded-full animate-ping"></div>}
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {transcripts.map((item, index) => (
                    <div key={index} className={`flex items-start gap-3 ${item.role === 'user' ? 'justify-end' : ''}`}>
                        {item.role === 'assistant' && <img src={avatarUrl} alt="PiPi Avatar" className="w-8 h-8 rounded-full object-cover flex-shrink-0" />}
                        <div className={`max-w-xs md:max-w-sm rounded-xl px-4 py-2 whitespace-pre-wrap ${item.role === 'user' ? 'bg-green-500 text-white' : 'bg-gray-200 dark:bg-gray-700'}`} style={{opacity: item.isFinal ? 1 : 0.7}}>
                            {item.content}
                        </div>
                    </div>
                ))}
                {error && <div className="text-red-500 text-center p-2 bg-red-100 dark:bg-red-900/50 rounded-lg">{error}</div>}
                <div ref={messagesEndRef} />
            </div>

             <div className="p-4 border-t flex items-center justify-center" style={{ borderColor: 'var(--card-border-color)' }}>
                <button 
                    onClick={onClose} 
                    className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center text-white shadow-lg transform hover:scale-110 transition-transform"
                    title="End Conversation"
                >
                    <StopIcon />
                </button>
            </div>
        </div>
    );
};

export default LiveAssistantContent;
