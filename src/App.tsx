import MusicPlayer from './components/MusicPlayer';
import SnakeGame from './components/SnakeGame';

export default function App() {
  return (
    <div className="min-h-screen bg-black text-white flex flex-col font-mono overflow-hidden selection:bg-g-cyan selection:text-black relative">
      <div className="absolute inset-0 bg-static pointer-events-none z-0 mix-blend-screen" />
      <div className="absolute inset-0 scanlines z-50 pointer-events-none mix-blend-overlay" />

      <header className="relative z-10 w-full p-4 md:p-8 border-b-4 border-g-magenta bg-black">
        <h1 className="font-pixel text-2xl md:text-5xl uppercase tracking-tighter text-glitch flex flex-col gap-2">
          <span>SYS_CORE</span>
          <span className="text-g-cyan bg-white text-black px-2 self-start transform -skew-x-6">CORRUPT_NEXUS</span>
        </h1>
        <div className="font-mono text-lg md:text-xl text-g-magenta mt-6 uppercase border-l-4 border-g-cyan pl-2 screen-tear">
          WARNING: UNAUTHORIZED ENTITY DETECTED.
        </div>
      </header>

      <main className="relative z-10 flex-1 w-full max-w-[1600px] mx-auto p-4 md:p-8 flex flex-col lg:flex-row gap-12 items-start justify-center overflow-y-auto mt-4 mb-4">
        <MusicPlayer />
        <div className="flex-1 w-full flex items-center justify-center relative">
          <div className="absolute -inset-4 bg-g-cyan/10 blur-xl block pointer-events-none" />
          <SnakeGame />
        </div>
      </main>
    </div>
  );
}
