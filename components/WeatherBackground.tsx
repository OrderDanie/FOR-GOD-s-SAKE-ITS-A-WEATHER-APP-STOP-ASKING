import React, { useEffect, useRef } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { AppTheme } from '../types';

interface WeatherBackgroundProps {
  condition: string;
  theme: AppTheme;
}

export const WeatherBackground: React.FC<WeatherBackgroundProps> = ({ condition, theme }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const normalizedCondition = condition.toLowerCase();

  // Mouse interaction state
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  
  // Smooth spring physics for parallax
  const springConfig = { damping: 25, stiffness: 120 };
  const springX = useSpring(mouseX, springConfig);
  const springY = useSpring(mouseY, springConfig);

  // Parallax transforms for ambient blobs
  const x1 = useTransform(springX, value => value * 0.02);
  const y1 = useTransform(springY, value => value * 0.02);
  const x2 = useTransform(springX, value => value * -0.02);
  const y2 = useTransform(springY, value => value * -0.02);

  // Handle Mouse Move
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      // Center the coordinate system
      const { innerWidth, innerHeight } = window;
      mouseX.set(e.clientX - innerWidth / 2);
      mouseY.set(e.clientY - innerHeight / 2);
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [mouseX, mouseY]);

  // Canvas Particle System
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let particles: any[] = [];
    let shootingStars: any[] = [];
    
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    // Particle types
    const isRain = normalizedCondition.includes('rain') || normalizedCondition.includes('drizzle') || normalizedCondition.includes('shower');
    const isSnow = normalizedCondition.includes('snow') || normalizedCondition.includes('ice') || normalizedCondition.includes('blizzard');
    const isStorm = normalizedCondition.includes('storm') || normalizedCondition.includes('thunder');
    const isClearNight = theme === AppTheme.MIDNIGHT && (normalizedCondition.includes('clear') || normalizedCondition.includes('night'));
    const isCloudy = normalizedCondition.includes('cloud') || normalizedCondition.includes('overcast') || normalizedCondition.includes('mist') || normalizedCondition.includes('fog');

    // Initialize Particles
    const initParticles = () => {
      particles = [];
      const particleCount = isRain || isSnow ? 150 : isClearNight ? 100 : 0;

      for (let i = 0; i < particleCount; i++) {
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          speed: Math.random() * (isRain ? 15 : isSnow ? 2 : 0.5) + (isRain ? 10 : 0.5),
          length: Math.random() * 20 + 10,
          opacity: Math.random() * 0.5 + 0.1,
          size: Math.random() * 2 + (isSnow ? 2 : 0.5),
          drift: Math.random() * 2 - 1,
        });
      }
    };

    initParticles();

    // Animation Loop
    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw Particles
      ctx.fillStyle = 'white';
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.lineWidth = 1;

      // Regular Particles
      particles.forEach(p => {
        if (isRain || isStorm) {
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(p.x, p.y + p.length);
          ctx.stroke();
          p.y += p.speed;
          if (p.y > canvas.height) {
            p.y = -p.length;
            p.x = Math.random() * canvas.width;
          }
        } else if (isSnow) {
          ctx.globalAlpha = p.opacity;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
          p.y += p.speed;
          p.x += Math.sin(p.y * 0.01) + p.drift * 0.5; // Sway
          if (p.y > canvas.height) {
            p.y = -5;
            p.x = Math.random() * canvas.width;
          }
        } else if (isClearNight) {
          ctx.globalAlpha = p.opacity * (Math.sin(Date.now() * 0.002 + p.x) * 0.5 + 0.5); // Twinkle
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
        }
      });

      // Shooting Stars (Only for Midnight theme)
      if (isClearNight) {
        // Chance to spawn a shooting star
        if (Math.random() < 0.005) {
           shootingStars.push({
             x: Math.random() * canvas.width,
             y: Math.random() * (canvas.height / 2),
             len: Math.random() * 80 + 20,
             speed: Math.random() * 10 + 10,
             life: 1.0,
             angle: Math.PI / 4 // 45 degrees
           });
        }

        for (let i = shootingStars.length - 1; i >= 0; i--) {
          const s = shootingStars[i];
          const endX = s.x + Math.cos(s.angle) * s.len;
          const endY = s.y + Math.sin(s.angle) * s.len;
          
          const grad = ctx.createLinearGradient(s.x, s.y, endX, endY);
          grad.addColorStop(0, `rgba(255, 255, 255, ${s.life})`);
          grad.addColorStop(1, `rgba(255, 255, 255, 0)`);
          
          ctx.strokeStyle = grad;
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(s.x, s.y);
          ctx.lineTo(endX, endY);
          ctx.stroke();

          s.x += Math.cos(s.angle) * s.speed;
          s.y += Math.sin(s.angle) * s.speed;
          s.life -= 0.02;

          if (s.life <= 0) {
            shootingStars.splice(i, 1);
          }
        }
      }

      // Occasional Lightning for Storm
      if (isStorm && Math.random() > 0.98) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationFrameId);
    };
  }, [normalizedCondition, theme]);

  return (
    <div ref={containerRef} className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {/* Ambient Blobs - Interactive Parallax */}
      <motion.div 
        style={{ x: x1, y: y1 }}
        className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-white/10 rounded-full blur-[120px]"
        animate={{
          scale: [1, 1.1, 1],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div 
        style={{ x: x2, y: y2 }}
        className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-black/20 rounded-full blur-[140px]"
        animate={{
          scale: [1, 1.2, 1],
        }}
        transition={{ duration: 15, repeat: Infinity, ease: "easeInOut", delay: 1 }}
      />

      {/* Weather Specific Ambient Effects (Non-canvas) */}
      {(normalizedCondition.includes('cloud') || normalizedCondition.includes('overcast')) && (
        <>
          <motion.div 
            className="absolute top-20 left-0 w-[400px] h-[200px] bg-white/5 blur-[80px] rounded-full"
            animate={{ x: [ -200, window.innerWidth + 200 ] }}
            transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
          />
          <motion.div 
            className="absolute top-40 right-0 w-[300px] h-[150px] bg-white/5 blur-[60px] rounded-full"
            animate={{ x: [ 200, -window.innerWidth - 200 ] }}
            transition={{ duration: 55, repeat: Infinity, ease: "linear" }}
          />
        </>
      )}

      {(normalizedCondition.includes('sunny') || normalizedCondition.includes('clear')) && theme !== AppTheme.MIDNIGHT && (
        <motion.div 
           className="absolute -top-20 right-20 w-[600px] h-[600px] bg-yellow-400/10 blur-[100px] rounded-full mix-blend-screen"
           animate={{ rotate: 360, scale: [1, 1.1, 1] }}
           transition={{ rotate: { duration: 100, repeat: Infinity, ease: "linear"}, scale: { duration: 5, repeat: Infinity, ease: "easeInOut" } }}
        />
      )}

      {/* Particle Canvas Layer */}
      <canvas 
        ref={canvasRef} 
        className="absolute inset-0 w-full h-full opacity-60"
      />
    </div>
  );
};
