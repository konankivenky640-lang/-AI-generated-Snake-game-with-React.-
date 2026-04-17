import { useState, useRef, useEffect } from 'react';

const TRACKS = [
  { id: 1, title: 'MEM_DUMP_0x1A', artist: '[ANON_001]', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3', duration: '06:12' },
  { id: 2, title: 'FRAG//MENT', artist: 'SYS_ADMIN', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3', duration: '07:05' },
  { id: 3, title: 'CORRUPTED.WAV', artist: 'NULL_P0INTER', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3', duration: '05:44' }
];

export default function MusicPlayer() {
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);

  const currentTrack = TRACKS[currentTrackIndex];

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const skipNext = () => {
    setCurrentTrackIndex((prev) => (prev + 1) % TRACKS.length);
  };

  const skipPrev = () => {
    setCurrentTrackIndex((prev) => (prev - 1 + TRACKS.length) % TRACKS.length);
  };

  useEffect(() => {
    if (isPlaying && audioRef.current) {
      audioRef.current.play().catch(() => {
        setIsPlaying(false);
      });
    }
  }, [currentTrackIndex]);

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      const p = (audioRef.current.currentTime / audioRef.current.duration) * 100;
      setProgress(isNaN(p) ? 0 : p);
    }
  };

  const handleTrackEnd = () => {
    skipNext();
  };

  return (
    <div className="flex flex-col glitch-border p-6 w-full lg:max-w-sm shrink-0 font-mono">
      <audio 
        ref={audioRef} 
        src={currentTrack.url} 
        onTimeUpdate={handleTimeUpdate}
        onEnded={handleTrackEnd}
      />
      
      <div className="flex justify-between items-start mb-6 border-b-2 border-g-cyan pb-2 screen-tear">
        <h3 className="font-pixel text-[12px] text-g-cyan text-glitch">AUD_PROCESS.exe</h3>
        <div className="text-[12px] font-pixel text-g-magenta uppercase" style={{ animation: 'flicker 0.15s infinite alternate' }}>
          {isPlaying ? 'ACTIVE' : 'IDLE'}
        </div>
      </div>

      <div className="mb-6 p-4 border-2 border-g-magenta bg-g-black relative text-center text-glitch-severe group cursor-crosshair screen-tear">
        <div className="font-pixel text-[10px] md:text-[14px] text-white truncate mb-6 mt-2">
          {currentTrack.title}
        </div>
        <div className="font-mono text-2xl text-g-cyan">
          AUTHOR_ {currentTrack.artist}
        </div>
      </div>

      <div className="w-full h-6 border-2 border-white mb-6 relative bg-black">
        <div 
          className="absolute top-0 left-0 h-full bg-g-magenta transition-all duration-100 ease-linear"
          style={{ width: `${progress}%` }}
        />
        <div className="absolute inset-0 scanlines opacity-50 mix-blend-difference pointer-events-none" />
      </div>

      <div className="flex items-center justify-between gap-4 mb-8 font-pixel text-xs md:text-sm">
        <button onClick={skipPrev} className="p-4 border-2 border-g-cyan text-g-cyan glitch-border-hover w-full flex justify-center cursor-cell">
          [ {"<<"} ]
        </button>
        <button onClick={togglePlay} className="p-4 border-2 border-white text-white glitch-border-hover w-full flex justify-center text-glitch cursor-cell">
          [ {isPlaying ? '||' : '>>'} ]
        </button>
        <button onClick={skipNext} className="p-4 border-2 border-g-magenta text-g-magenta glitch-border-hover w-full flex justify-center cursor-cell">
          [ {">>"} ]
        </button>
      </div>

      <div className="mt-4 break-all">
        <div className="font-pixel text-[10px] text-white mb-4 text-glitch border-b border-g-magenta/50 pb-2">SECTOR_ARCHIVES_</div>
        <div className="flex flex-col gap-3">
          {TRACKS.map((track, idx) => (
            <button
              key={track.id}
              onClick={() => {
                setCurrentTrackIndex(idx);
                setIsPlaying(true);
              }}
              className={`text-left font-mono text-xl p-2 transition-none border-l-4 cursor-crosshair ${
                currentTrackIndex === idx 
                  ? 'border-g-cyan bg-g-magenta text-black font-bold screen-tear' 
                  : 'border-white text-gray-400 hover:bg-white hover:text-black hover:border-g-magenta'
              }`}
            >
              <div className="flex justify-between items-center">
                <span className="truncate pr-4">{`0x0${idx}... ${track.title}`}</span>
              </div>
            </button>
          ))}
        </div>
      </div>
      
      <style>{`
        @keyframes flicker {
          0% { opacity: 0.8; }
          100% { opacity: 1; }
        }
      `}</style>
    </div>
  );
}
