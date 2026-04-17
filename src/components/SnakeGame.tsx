import { useEffect, useRef, useState, useCallback } from 'react';

const GRID_SIZE = 20;
const GAME_SPEED = 80; // slightly faster for chaos

type Point = { x: number; y: number };

export default function SnakeGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  // Use refs for mutable game state to avoid dependency issues in game loop
  const snakeRef = useRef<Point[]>([{ x: 10, y: 10 }]);
  const directionRef = useRef<Point>({ x: 1, y: 0 });
  const nextDirectionRef = useRef<Point>({ x: 1, y: 0 });
  const foodRef = useRef<Point>({ x: 5, y: 5 });

  const spawnFood = useCallback(() => {
    foodRef.current = {
      x: Math.floor(Math.random() * (canvasRef.current?.width ? canvasRef.current.width / GRID_SIZE : 20)),
      y: Math.floor(Math.random() * (canvasRef.current?.height ? canvasRef.current.height / GRID_SIZE : 20)),
    };
  }, []);

  const resetGame = useCallback(() => {
    snakeRef.current = [{ x: 10, y: 10 }];
    directionRef.current = { x: 1, y: 0 };
    nextDirectionRef.current = { x: 1, y: 0 };
    setScore(0);
    setGameOver(false);
    setIsPaused(false);
    spawnFood();
  }, [spawnFood]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent scrolling for game controls
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
        e.preventDefault();
      }

      if (e.key === 'ArrowUp' && directionRef.current.y === 0) nextDirectionRef.current = { x: 0, y: -1 };
      if (e.key === 'ArrowDown' && directionRef.current.y === 0) nextDirectionRef.current = { x: 0, y: 1 };
      if (e.key === 'ArrowLeft' && directionRef.current.x === 0) nextDirectionRef.current = { x: -1, y: 0 };
      if (e.key === 'ArrowRight' && directionRef.current.x === 0) nextDirectionRef.current = { x: 1, y: 0 };
      if (e.key === ' ' && gameOver) resetGame();
      if ((e.key === 'p' || e.key === 'P') && !gameOver) setIsPaused(p => !p);
    };

    window.addEventListener('keydown', handleKeyDown, { passive: false });
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameOver, resetGame]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let lastRenderTime = 0;

    const render = (currentTime: number) => {
      animationFrameId = requestAnimationFrame(render);

      if (isPaused || gameOver) {
        drawFrame(ctx, canvas);
        return;
      }

      const secondsSinceLastRender = (currentTime - lastRenderTime) / 1000;
      if (secondsSinceLastRender < GAME_SPEED / 1000) return;

      lastRenderTime = currentTime;
      updateGame();
      drawFrame(ctx, canvas);
    };

    const updateGame = () => {
      const snake = [...snakeRef.current];
      const nextDir = nextDirectionRef.current;
      directionRef.current = nextDir;

      const newHead = {
        x: snake[0].x + nextDir.x,
        y: snake[0].y + nextDir.y,
      };

      const cols = canvas.width / GRID_SIZE;
      const rows = canvas.height / GRID_SIZE;

      // Check collision with walls or self
      if (
        newHead.x < 0 ||
        newHead.x >= cols ||
        newHead.y < 0 ||
        newHead.y >= rows ||
        snake.some(segment => segment.x === newHead.x && segment.y === newHead.y)
      ) {
        setGameOver(true);
        return;
      }

      snake.unshift(newHead);

      // Check food
      if (newHead.x === foodRef.current.x && newHead.y === foodRef.current.y) {
        setScore(s => s + 10);
        spawnFood();
      } else {
        snake.pop();
      }

      snakeRef.current = snake;
    };

    const drawFrame = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => {
      // Clear canvas
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw Grid (distracting, scanline style)
      ctx.fillStyle = 'rgba(0, 255, 255, 0.1)';
      for (let i = 0; i <= canvas.height; i += GRID_SIZE * 2) {
        ctx.fillRect(0, i, canvas.width, GRID_SIZE / 4);
      }

      // Draw Food
      ctx.fillStyle = '#ff00ff'; // Magenta
      // Sometimes glitch the food slightly
      const glitchX = Math.random() > 0.9 ? 2 : 0;
      ctx.fillRect(
        foodRef.current.x * GRID_SIZE + glitchX,
        foodRef.current.y * GRID_SIZE,
        GRID_SIZE,
        GRID_SIZE
      );

      // Draw Snake
      snakeRef.current.forEach((segment, index) => {
        ctx.fillStyle = index === 0 ? '#ffffff' : '#00ffff'; // Cyan body
        const xOffset = (Math.random() > 0.95 && index > 0) ? -2 : 0;
        ctx.fillRect(
          segment.x * GRID_SIZE + xOffset,
          segment.y * GRID_SIZE,
          GRID_SIZE,
          GRID_SIZE
        );
      });

      if (gameOver) {
        ctx.fillStyle = 'rgba(0,0,0,0.85)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        ctx.font = '24px "Press Start 2P"';
        ctx.fillStyle = '#ff00ff';
        ctx.textAlign = 'center';
        ctx.fillText('FATAL_EXCEPTION', canvas.width / 2, canvas.height / 2 - 20);
        
        ctx.font = '24px "VT323"';
        ctx.fillStyle = '#00ffff';
        ctx.fillText('DATA CORRUPT. PRESS [SPACE] TO REBUILD', canvas.width / 2, canvas.height / 2 + 30);
      } else if (isPaused) {
        ctx.fillStyle = '#00ffff';
        ctx.fillRect(0, canvas.height / 2 - 30, canvas.width, 60);
        
        ctx.font = '24px "Press Start 2P"';
        ctx.fillStyle = '#000000';
        ctx.textAlign = 'center';
        ctx.fillText('PROCESS_HALTED', canvas.width / 2, canvas.height / 2 + 8);
      }
    };

    animationFrameId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animationFrameId);
  }, [isPaused, gameOver, spawnFood]);

  return (
    <div className="flex flex-col items-center glitch-border p-4 w-full max-w-4xl mx-auto bg-black font-mono">
      <div className="flex justify-between w-full mb-4 items-end border-b-2 border-g-magenta pb-2">
        <h2 className="font-pixel text-[12px] md:text-[16px] text-white text-glitch uppercase">
          SNAKE_PROTOCOL
        </h2>
        <div className="font-mono text-2xl text-white">
          SEQ: <span className="text-g-cyan font-bold bg-white text-black px-2">{score.toString().padStart(4, '0')}</span>
        </div>
      </div>
      <div className="relative w-full aspect-[4/3] border-2 border-white bg-black overflow-hidden group">
        <div className="absolute inset-0 bg-static pointer-events-none z-10 mix-blend-screen" />
        <canvas
          ref={canvasRef}
          width={800}
          height={600}
          className="block w-full h-full object-contain filter contrast-125"
          style={{ imageRendering: 'pixelated' }}
        />
      </div>
      <div className="font-pixel text-[10px] text-white mt-4 flex flex-wrap justify-between w-full uppercase tracking-tighter opacity-90 border border-white p-2 text-glitch-severe">
        <span>[ARROWS]=STEER</span>
        <span>[SPACE]=RST</span>
        <span>[P]=BRK</span>
      </div>
    </div>
  );
}
