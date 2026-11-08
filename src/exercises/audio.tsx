/** Bouton et hook d'écoute (synthèse vocale) partagés par les exercices. */
import { useCallback, useEffect, useRef, useState } from 'react';
import { speak, stopSpeaking, ttsSupported } from '@/audio/tts';
import { useAppState } from '@/state/store';
import { IconReplay, IconVolume } from '@/ui/icons';

export function useSpeech() {
  const audio = useAppState((s) => s.settings.audio);
  const supported = ttsSupported() && audio.enabled;
  const [speaking, setSpeaking] = useState(false);
  const mounted = useRef(true);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      stopSpeaking();
    };
  }, []);
  const say = useCallback(
    async (text: string, slow = false) => {
      if (!supported) return;
      setSpeaking(true);
      await speak(text, { rate: slow ? Math.max(0.5, audio.rate * 0.7) : audio.rate, voiceURI: audio.voiceURI, accent: audio.accent });
      if (mounted.current) setSpeaking(false);
    },
    [supported, audio.rate, audio.voiceURI, audio.accent],
  );
  return { say, speaking, supported, autoplay: audio.autoplay };
}

export function AudioButton({ text, label = 'Écouter', big = false, autoPlay = false, showSlow = false }: { text: string; label?: string; big?: boolean; autoPlay?: boolean; showSlow?: boolean }) {
  const { say, speaking, supported, autoplay } = useSpeech();
  const played = useRef<string | null>(null);
  useEffect(() => {
    if (autoPlay && autoplay && supported && played.current !== text) {
      played.current = text;
      const t = setTimeout(() => void say(text), 250);
      return () => clearTimeout(t);
    }
  }, [autoPlay, autoplay, supported, text, say]);
  if (!supported) return null;
  return (
    <span className="audio-group">
      <button type="button" className={`audio-btn${big ? ' audio-btn-big' : ''}${speaking ? ' is-speaking' : ''}`} onClick={() => void say(text)} aria-label={label} title={label}>
        <IconVolume size={big ? 30 : 18} aria-hidden />
        {big && <span>{label}</span>}
      </button>
      {showSlow && (
        <button type="button" className="audio-btn audio-btn-slow" onClick={() => void say(text, true)} aria-label="Écouter lentement" title="Écouter lentement">
          <IconReplay size={big ? 22 : 16} aria-hidden />
          <span>Lent</span>
        </button>
      )}
    </span>
  );
}
