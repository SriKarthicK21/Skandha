import { useState, useRef, useCallback, useEffect } from 'react';

export interface UseMicrophoneTranscriptionOptions {
  onTranscribed?: (text: string) => void;
  onError?: (errorMsg: string) => void;
  prompt?: string;
}

export interface UseMicrophoneTranscriptionReturn {
  isRecording: boolean;
  isTranscribing: boolean;
  recordingDuration: number; // in seconds
  audioLevel: number; // 0.0 to 1.0 for visual pulse
  transcribedText: string;
  error: string | null;
  audioBlobUrl: string | null;
  startRecording: () => Promise<boolean>;
  stopRecording: () => Promise<string | null>;
  cancelRecording: () => void;
  reset: () => void;
}

/**
 * useMicrophoneTranscription
 * Captures live microphone audio using the browser's MediaRecorder and Web Audio API,
 * then sends the audio stream to the server for high-fidelity transcription
 * powered by Gemini's gemini-3.5-transcribe model.
 */
export function useMicrophoneTranscription(
  options: UseMicrophoneTranscriptionOptions = {}
): UseMicrophoneTranscriptionReturn {
  const { onTranscribed, onError, prompt } = options;

  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [audioLevel, setAudioLevel] = useState(0);
  const [transcribedText, setTranscribedText] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [audioBlobUrl, setAudioBlobUrl] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const timerIntervalRef = useRef<number | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);

  // Clean up resources on unmount
  useEffect(() => {
    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close().catch(() => {});
      }
      if (audioBlobUrl) {
        URL.revokeObjectURL(audioBlobUrl);
      }
    };
  }, [audioBlobUrl]);

  const reset = useCallback(() => {
    setError(null);
    setTranscribedText('');
    setRecordingDuration(0);
    setAudioLevel(0);
    if (audioBlobUrl) {
      URL.revokeObjectURL(audioBlobUrl);
      setAudioBlobUrl(null);
    }
  }, [audioBlobUrl]);

  const cancelRecording = useCallback(() => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      try {
        mediaRecorderRef.current.stop();
      } catch {}
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close().catch(() => {});
      audioContextRef.current = null;
    }
    audioChunksRef.current = [];
    setIsRecording(false);
    setIsTranscribing(false);
    setAudioLevel(0);
    setRecordingDuration(0);
  }, []);

  const startRecording = useCallback(async (): Promise<boolean> => {
    reset();
    setError(null);

    if (typeof window === 'undefined' || !navigator?.mediaDevices?.getUserMedia) {
      const err = 'Microphone recording is not supported in this browser environment.';
      setError(err);
      onError?.(err);
      return false;
    }

    try {
      // Request audio stream with echo cancellation and noise suppression
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });
      streamRef.current = stream;

      // Setup Web Audio Analyser for live volume meter
      try {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioCtx) {
          const audioCtx = new AudioCtx();
          audioContextRef.current = audioCtx;
          const source = audioCtx.createMediaStreamSource(stream);
          const analyser = audioCtx.createAnalyser();
          analyser.fftSize = 256;
          analyser.smoothingTimeConstant = 0.5;
          source.connect(analyser);
          analyserRef.current = analyser;

          const dataArray = new Uint8Array(analyser.frequencyBinCount);
          const updateAudioLevel = () => {
            if (!analyserRef.current) return;
            analyserRef.current.getByteFrequencyData(dataArray);
            let sum = 0;
            for (let i = 0; i < dataArray.length; i++) {
              sum += dataArray[i];
            }
            const avg = sum / dataArray.length;
            const normalized = Math.min(1, avg / 128);
            setAudioLevel(normalized);
            animationFrameRef.current = requestAnimationFrame(updateAudioLevel);
          };
          updateAudioLevel();
        }
      } catch (audioCtxErr) {
        console.warn('AudioContext volume metering not available:', audioCtxErr);
      }

      // Pick best supported mimeType
      const mimeTypes = [
        'audio/webm;codecs=opus',
        'audio/webm',
        'audio/mp4',
        'audio/ogg;codecs=opus',
        'audio/wav'
      ];
      let selectedMimeType = '';
      for (const mime of mimeTypes) {
        if (MediaRecorder.isTypeSupported(mime)) {
          selectedMimeType = mime;
          break;
        }
      }

      const recorder = new MediaRecorder(stream, selectedMimeType ? { mimeType: selectedMimeType } : undefined);
      mediaRecorderRef.current = recorder;
      audioChunksRef.current = [];

      recorder.ondataavailable = (event: BlobEvent) => {
        if (event.data && event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      recorder.start(250); // Slice every 250ms
      setIsRecording(true);
      setRecordingDuration(0);

      // Duration counter
      timerIntervalRef.current = window.setInterval(() => {
        setRecordingDuration(prev => prev + 1);
      }, 1000);

      return true;
    } catch (err: any) {
      console.error('Error starting microphone recording:', err);
      let errMsg = 'Failed to access microphone. Please grant microphone permissions in your browser.';
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        errMsg = 'Microphone permission was denied. Please allow microphone access in your browser settings.';
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        errMsg = 'No microphone device was detected on your system.';
      }
      setError(errMsg);
      onError?.(errMsg);
      return false;
    }
  }, [reset, onError]);

  const stopRecording = useCallback(async (): Promise<string | null> => {
    if (!mediaRecorderRef.current || mediaRecorderRef.current.state === 'inactive') {
      return null;
    }

    return new Promise(resolve => {
      const recorder = mediaRecorderRef.current!;

      // Clear interval and volume animation
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
      setAudioLevel(0);

      recorder.onstop = async () => {
        setIsRecording(false);
        setIsTranscribing(true);

        // Stop stream tracks
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop());
          streamRef.current = null;
        }
        if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
          audioContextRef.current.close().catch(() => {});
          audioContextRef.current = null;
        }

        const mimeType = recorder.mimeType || 'audio/webm';
        const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });

        if (audioBlob.size === 0) {
          setIsTranscribing(false);
          const err = 'Recorded audio was empty. Please try speaking again.';
          setError(err);
          onError?.(err);
          resolve(null);
          return;
        }

        // Create local audio playback URL for review
        const url = URL.createObjectURL(audioBlob);
        setAudioBlobUrl(url);

        try {
          // Convert audio blob to Base64
          const reader = new FileReader();
          reader.readAsDataURL(audioBlob);

          reader.onloadend = async () => {
            const base64Data = reader.result as string;

            try {
              const response = await fetch('/api/v1/ai/transcribe', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  audioBase64: base64Data,
                  mimeType,
                  prompt: prompt || 'Transcribe the spoken audio accurately into clear text for enterprise compliance records.'
                })
              });

              const data = await response.json();

              if (!response.ok || !data.success) {
                throw new Error(data.error || 'Server transcription request failed');
              }

              const resultText = data.text?.trim() || '';
              setTranscribedText(resultText);
              setIsTranscribing(false);
              onTranscribed?.(resultText);
              resolve(resultText);
            } catch (postErr: any) {
              console.error('Transcription API failure:', postErr);
              const errMsg = postErr?.message || 'Failed to transcribe audio with Gemini';
              setError(errMsg);
              setIsTranscribing(false);
              onError?.(errMsg);
              resolve(null);
            }
          };

          reader.onerror = () => {
            const err = 'Failed to process audio recording buffer';
            setError(err);
            setIsTranscribing(false);
            onError?.(err);
            resolve(null);
          };
        } catch (procErr: any) {
          const err = procErr?.message || 'Error preparing audio for transcription';
          setError(err);
          setIsTranscribing(false);
          onError?.(err);
          resolve(null);
        }
      };

      try {
        recorder.stop();
      } catch (err) {
        console.error('Error calling recorder.stop():', err);
        setIsRecording(false);
        setIsTranscribing(false);
        resolve(null);
      }
    });
  }, [onError, onTranscribed, prompt]);

  return {
    isRecording,
    isTranscribing,
    recordingDuration,
    audioLevel,
    transcribedText,
    error,
    audioBlobUrl,
    startRecording,
    stopRecording,
    cancelRecording,
    reset
  };
}
