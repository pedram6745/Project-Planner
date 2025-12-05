import React, { useState, useEffect, useRef } from 'react';
import { IconVolume, IconMute } from './Icons';

const SoundController: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);

  useEffect(() => {
    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  const toggleSound = () => {
    if (isPlaying) {
      // Stop
      gainNodeRef.current?.disconnect();
      audioContextRef.current?.close();
      audioContextRef.current = null;
      setIsPlaying(false);
    } else {
      // Start Brown Noise
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioContext();
      audioContextRef.current = ctx;
      
      const bufferSize = 2 * ctx.sampleRate;
      const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        output[i] = (lastOut + (0.02 * white)) / 1.02;
        lastOut = output[i];
        output[i] *= 3.5; 
      }

      const noise = ctx.createBufferSource();
      noise.buffer = noiseBuffer;
      noise.loop = true;
      
      // Filter to make it warmer (Brown/Pink ish)
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = 400;

      const gainNode = ctx.createGain();
      gainNode.gain.value = 0.15; // Volume
      gainNodeRef.current = gainNode;

      noise.connect(filter);
      filter.connect(gainNode);
      gainNode.connect(ctx.destination);
      
      noise.start();
      setIsPlaying(true);
    }
  };

  // Simple brown noise generator helper variable
  let lastOut = 0;

  return (
    <button 
      onClick={toggleSound}
      className={`fixed top-4 right-4 z-50 p-2 rounded-full border transition-all ${isPlaying ? 'bg-neon-pink/20 border-neon-pink text-neon-pink animate-pulse' : 'bg-slate-800 border-slate-600 text-slate-400 hover:text-white'}`}
      title={isPlaying ? "Stop Focus Noise" : "Play Starship Hum"}
    >
      {isPlaying ? <IconVolume className="w-5 h-5" /> : <IconMute className="w-5 h-5" />}
    </button>
  );
};

export default SoundController;