/**
 * Animated waveform bars — shown during recording or TTS playback.
 */
export default function Waveform({ active = false, bars = 7, color = 'bg-indigo-500' }) {
  if (!active) return null;
  return (
    <div className="flex items-center justify-center gap-1 h-8">
      {Array.from({ length: bars }).map((_, i) => (
        <div
          key={i}
          className={`waveform-bar ${color}`}
          style={{
            height: '100%',
            animationDelay: `${(i % 4) * 0.1}s`,
          }}
        />
      ))}
    </div>
  );
}
