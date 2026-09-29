import { useEffect, useRef } from 'react';

function MousePathCanvas({ path = [], height = 220 }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    const ctx = canvas.getContext('2d');
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, rect.width, rect.height);

    const gradient = ctx.createLinearGradient(0, 0, rect.width, rect.height);
    gradient.addColorStop(0, '#10d9ff');
    gradient.addColorStop(0.55, '#2dff9d');
    gradient.addColorStop(1, '#ff3f5f');

    ctx.fillStyle = 'rgba(2, 6, 23, 0.28)';
    ctx.fillRect(0, 0, rect.width, rect.height);
    ctx.strokeStyle = 'rgba(16,217,255,0.08)';
    ctx.lineWidth = 1;
    for (let x = 0; x < rect.width; x += 24) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, rect.height);
      ctx.stroke();
    }
    for (let y = 0; y < rect.height; y += 24) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(rect.width, y);
      ctx.stroke();
    }

    const points =
      path.length > 1
        ? path
        : Array.from({ length: 26 }).map((_, index) => ({
            x: 40 + index * (rect.width / 28),
            y: rect.height / 2 + Math.sin(index * 0.8) * 38,
          }));

    const maxX = Math.max(...points.map((point) => point.x), 1);
    const maxY = Math.max(...points.map((point) => point.y), 1);
    const scaleX = rect.width / maxX;
    const scaleY = rect.height / maxY;

    ctx.beginPath();
    points.forEach((point, index) => {
      const x = Math.min(rect.width - 10, Math.max(10, point.x * scaleX));
      const y = Math.min(rect.height - 10, Math.max(10, point.y * scaleY));
      if (index === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.strokeStyle = gradient;
    ctx.lineWidth = 3;
    ctx.shadowColor = '#10d9ff';
    ctx.shadowBlur = 14;
    ctx.stroke();

    points.slice(-18).forEach((point, index) => {
      const x = Math.min(rect.width - 10, Math.max(10, point.x * scaleX));
      const y = Math.min(rect.height - 10, Math.max(10, point.y * scaleY));
      ctx.beginPath();
      ctx.arc(x, y, 2 + index / 8, 0, Math.PI * 2);
      ctx.fillStyle = index > 13 ? '#ff3f5f' : '#10d9ff';
      ctx.shadowBlur = 8;
      ctx.fill();
    });
  }, [path]);

  return <canvas ref={canvasRef} className="h-full w-full rounded-2xl border border-cyanGlow/20" style={{ height }} />;
}

export default MousePathCanvas;
