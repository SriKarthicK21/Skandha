import React from 'react';
import { Mic, MicOff, Square, Loader2, Volume2, AlertCircle, RefreshCw } from 'lucide-react';
import { useMicrophoneTranscription } from '../../hooks/useMicrophoneTranscription';

export interface AudioTranscriptionInputProps {
  onTranscriptionComplete: (text: string) => void;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  promptHint?: string;
  disabled?: boolean;
}

/**
 * AudioTranscriptionInput
 * Compact or expanded microphone button that captures speech and transcribes it
 * using Gemini's gemini-3.5-transcribe model.
 */
export const AudioTranscriptionInput: React.FC<AudioTranscriptionInputProps> = ({
  onTranscriptionComplete,
  className = '',
  size = 'md',
  promptHint,
  disabled = false
}) => {
  const {
    isRecording,
    isTranscribing,
    recordingDuration,
    audioLevel,
    startRecording,
    stopRecording,
    cancelRecording,
    error,
    reset
  } = useMicrophoneTranscription({
    onTranscribed: text => {
      if (text) {
        onTranscriptionComplete(text);
      }
    },
    prompt: promptHint
  });

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isRecording) {
      await stopRecording();
    } else {
      await startRecording();
    }
  };

  if (isRecording) {
    return (
      <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-rose-950/80 border border-rose-600/70 shadow-lg shadow-rose-950/40 animate-pulse ${className}`}>
        {/* Live Pulse Indicator */}
        <div className="relative flex items-center justify-center">
          <span
            className="absolute w-6 h-6 rounded-full bg-rose-500 opacity-60 animate-ping"
            style={{ transform: `scale(${1 + audioLevel * 1.5})` }}
          />
          <span className="relative w-3 h-3 rounded-full bg-rose-500" />
        </div>

        {/* Timer */}
        <span className="text-xs font-mono font-bold text-rose-200">
          {formatDuration(recordingDuration)}
        </span>

        {/* Volume Wave bar */}
        <div className="flex items-center gap-0.5 h-3 px-1">
          {[0.2, 0.4, 0.6, 0.8, 1.0].map((threshold, i) => (
            <span
              key={i}
              className={`w-0.5 rounded-full transition-all duration-75 ${
                audioLevel >= threshold ? 'bg-rose-400 h-3' : 'bg-rose-800/60 h-1'
              }`}
            />
          ))}
        </div>

        {/* Stop & Transcribe Button */}
        <button
          type="button"
          onClick={handleToggle}
          className="px-2 py-0.5 rounded bg-rose-600 hover:bg-rose-500 text-white text-[11px] font-semibold flex items-center gap-1 transition-all cursor-pointer"
          title="Stop recording and transcribe using gemini-3.5-transcribe"
        >
          <Square className="w-2.5 h-2.5 fill-current" />
          <span>Finish & Transcribe</span>
        </button>

        {/* Cancel Button */}
        <button
          type="button"
          onClick={cancelRecording}
          className="p-1 rounded text-rose-400 hover:text-white hover:bg-rose-900/60 transition-colors"
          title="Cancel recording"
        >
          <MicOff className="w-3.5 h-3.5" />
        </button>
      </div>
    );
  }

  if (isTranscribing) {
    return (
      <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-indigo-950/80 border border-indigo-600/70 text-indigo-200 text-xs shadow-md ${className}`}>
        <Loader2 className="w-3.5 h-3.5 text-indigo-400 animate-spin" />
        <span className="font-medium">Transcribing with gemini-3.5-transcribe...</span>
      </div>
    );
  }

  return (
    <div className="relative inline-flex items-center">
      <button
        type="button"
        onClick={handleToggle}
        disabled={disabled}
        className={`rounded-lg border transition-all flex items-center justify-center cursor-pointer ${
          size === 'sm'
            ? 'p-1.5 text-xs'
            : size === 'lg'
            ? 'p-3 text-base'
            : 'p-2 text-sm'
        } ${
          disabled
            ? 'bg-slate-800 text-slate-500 border-slate-700 cursor-not-allowed opacity-50'
            : 'bg-slate-800 hover:bg-indigo-950/70 text-slate-300 hover:text-indigo-300 hover:border-indigo-600/60 border-slate-700'
        } ${className}`}
        title="Record voice with microphone & transcribe via gemini-3.5-transcribe"
        aria-label="Transcribe microphone audio"
      >
        <Mic className={size === 'sm' ? 'w-3.5 h-3.5' : size === 'lg' ? 'w-5 h-5' : 'w-4 h-4'} />
      </button>

      {error && (
        <div className="absolute bottom-full mb-1 left-0 z-50 whitespace-nowrap p-2 bg-rose-950 border border-rose-700 text-rose-200 text-xs rounded shadow-lg flex items-center gap-1.5">
          <AlertCircle className="w-3 h-3 text-rose-400 shrink-0" />
          <span>{error}</span>
          <button
            type="button"
            onClick={reset}
            className="ml-1 text-rose-400 hover:text-white"
          >
            ×
          </button>
        </div>
      )}
    </div>
  );
};
