import { useEffect, useRef } from 'react';

export default function StarBackground() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animId;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    // Generate stars with depth layers
    const STAR_COUNT = 280;
    const stars = Array.from({ length: STAR_COUNT }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: Math.random() * 1.5 + 0.15,
      alpha: Math.random() * 0.6 + 0.25,
      twinkleSpeed: Math.random() * 0.012 + 0.003,
      twinkleDir: Math.random() > 0.5 ? 1 : -1,
      color: ['#ffffff', '#c8d8ff', '#ffe8c0', '#d8c8ff', '#c0f0ff'][Math.floor(Math.random() * 5)],
    }));

    // Shooting stars
    const shooters = [];
    const spawnShooter = () => {
      shooters.push({
        x: Math.random() * canvas.width * 0.8,
        y: Math.random() * canvas.height * 0.4,
        len: Math.random() * 120 + 50,
        speed: Math.random() * 10 + 6,
        alpha: 1,
        angle: Math.PI / 5.5,
      });
    };
    const shooterInterval = setInterval(() => {
      if (Math.random() > 0.3) spawnShooter();
    }, 3600);

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Stars
      stars.forEach(s => {
        s.alpha += s.twinkleSpeed * s.twinkleDir;
        if (s.alpha >= 0.85) s.twinkleDir = -1;
        if (s.alpha <= 0.12) s.twinkleDir = 1;
        ctx.save();
        ctx.globalAlpha = s.alpha;
        ctx.fillStyle = s.color;
        ctx.shadowColor = s.color;
        ctx.shadowBlur = s.r > 1.2 ? 6 : 1;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });

      // Shooting stars
      for (let i = shooters.length - 1; i >= 0; i--) {
        const sh = shooters[i];
        sh.x += Math.cos(sh.angle) * sh.speed;
        sh.y += Math.sin(sh.angle) * sh.speed;
        sh.alpha -= 0.018;
        if (sh.alpha <= 0) { shooters.splice(i, 1); continue; }
        const tx = sh.x - Math.cos(sh.angle) * sh.len;
        const ty = sh.y - Math.sin(sh.angle) * sh.len;
        const grad = ctx.createLinearGradient(tx, ty, sh.x, sh.y);
        grad.addColorStop(0, 'rgba(255,255,255,0)');
        grad.addColorStop(1, `rgba(200,220,255,${sh.alpha})`);
        ctx.save();
        ctx.strokeStyle = grad;
        ctx.lineWidth = 1.3;
        ctx.beginPath();
        ctx.moveTo(tx, ty);
        ctx.lineTo(sh.x, sh.y);
        ctx.stroke();
        ctx.restore();
      }

      animId = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(animId);
      clearInterval(shooterInterval);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <>
      <canvas ref={canvasRef} style={{
        position: 'fixed', inset: 0, zIndex: -2,
        width: '100vw', height: '100vh', display: 'block',
        pointerEvents: 'none', background: '#000000'
      }} />
      <div style={{ position: 'fixed', inset: 0, zIndex: -1, pointerEvents: 'none', overflow: 'hidden' }}>
        <div style={{
          position: 'absolute', top: '15%', left: '10%',
          width: 600, height: 600, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(99,102,241,0.07) 0%, transparent 65%)',
          animation: 'pulse 12s ease-in-out infinite',
        }} />
        <div style={{
          position: 'absolute', bottom: '15%', right: '10%',
          width: 500, height: 500, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(168,85,247,0.06) 0%, transparent 65%)',
          animation: 'pulse 15s ease-in-out infinite 3s',
        }} />
      </div>
    </>
  );
}
