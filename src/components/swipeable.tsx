'use client';

import { Trash2 } from 'lucide-react';
import { useRef, useState } from 'react';

interface SwipeableProps {
  children: React.ReactNode;
  onDelete: () => void;
  deleteLabel?: string;
  className?: string;
}

export function Swipeable({ children, onDelete, deleteLabel = 'Delete', className = '' }: SwipeableProps) {
  const [offset, setOffset] = useState(0);
  const [swiped, setSwiped] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const startX = useRef(0);
  const startY = useRef(0);
  const isDragging = useRef(false);
  const isHorizontal = useRef(false);
  const dragDistance = useRef(0);

  const handleDown = (x: number, y: number) => {
    startX.current = x;
    startY.current = y;
    isDragging.current = true;
    isHorizontal.current = false;
    dragDistance.current = 0;
  };

  const handleMove = (x: number, y: number, e: Event | React.TouchEvent | React.MouseEvent) => {
    if (!isDragging.current) return;
    const dx = startX.current - x;
    const dy = startY.current - y;

    if (!isHorizontal.current && (Math.abs(dx) > 3 || Math.abs(dy) > 3)) {
      isHorizontal.current = Math.abs(dx) > Math.abs(dy);
    }

    if (isHorizontal.current && dx > 0) {
      if ('preventDefault' in e && (e as Event).cancelable) (e as Event).preventDefault();
      dragDistance.current = dx;
      setOffset(Math.min(dx, 90));
    }
  };

  const handleUp = () => {
    if (!isDragging.current) return;
    isDragging.current = false;

    if (isHorizontal.current && dragDistance.current > 40) {
      setOffset(90);
      setSwiped(true);
    } else {
      setOffset(0);
      setSwiped(false);
    }
    startX.current = 0;
    startY.current = 0;
    dragDistance.current = 0;
  };

  const handleDelete = () => {
    setDeleting(true);
    Promise.resolve(onDelete()).catch(() => setDeleting(false));
  };

  const reset = () => {
    setOffset(0);
    setSwiped(false);
  };

  return (
    <div className={`relative overflow-hidden rounded-2xl ${className}`}
      style={{ touchAction: 'pan-y' }}
    >
      <div className={`absolute inset-y-0 right-0 w-[90px] flex items-center justify-center bg-red-500/20 rounded-r-2xl transition-opacity duration-200 ${offset > 0 ? 'opacity-100' : 'opacity-0'}`}>
        <button onClick={handleDelete} disabled={deleting}
          className="flex flex-col items-center gap-1 text-red-400 px-3 disabled:opacity-50">
          <Trash2 size={18} />
          <span className="text-[10px] font-medium">{deleting ? '...' : deleteLabel}</span>
        </button>
      </div>

      <div
        onTouchStart={(e) => handleDown(e.touches[0].clientX, e.touches[0].clientY)}
        onTouchMove={(e) => handleMove(e.touches[0].clientX, e.touches[0].clientY, e)}
        onTouchEnd={handleUp}
        onMouseDown={(e) => handleDown(e.clientX, e.clientY)}
        onMouseMove={(e) => { if (isDragging.current) handleMove(e.clientX, e.clientY, e); }}
        onMouseUp={handleUp}
        onMouseLeave={handleUp}
        onClick={() => { if (swiped) reset(); }}
        className="relative z-10 transition-transform duration-200 ease-out select-none"
        style={{ transform: `translateX(-${offset}px)` }}
      >
        {children}
      </div>
    </div>
  );
}
