import React, { useCallback, useMemo, useRef, useState } from 'react';

export interface MagnifierOrigin {
  xPercent: number;
  yPercent: number;
  pxX: number;
  pxY: number;
  width: number;
  height: number;
}

export interface UseMagnifierOptions {
  initialScale?: number;
  minScale?: number;
  maxScale?: number;
  enabled?: boolean;
}

export interface ComputeMagnifierInput {
  clientX: number;
  clientY: number;
  rect: Pick<DOMRect, 'left' | 'top' | 'width' | 'height'>;
  scale: number;
  minScale?: number;
  maxScale?: number;
}

/**
 * Calcula coordenadas normalizadas de origem e o estilo CSS `transform`
 * de forma pura e determinística para inspeção ampliada de rótulos.
 */
export function computeMagnifierTransform({
  clientX,
  clientY,
  rect,
  scale,
  minScale = 1.25,
  maxScale = 4
}: ComputeMagnifierInput): {
  origin: MagnifierOrigin;
  clampedScale: number;
} {
  const safeWidth = Math.max(1, rect.width);
  const safeHeight = Math.max(1, rect.height);
  const pxX = Math.max(0, Math.min(safeWidth, clientX - rect.left));
  const pxY = Math.max(0, Math.min(safeHeight, clientY - rect.top));
  const xPercent = (pxX / safeWidth) * 100;
  const yPercent = (pxY / safeHeight) * 100;
  const clampedScale = Math.max(minScale, Math.min(maxScale, scale));

  return {
    origin: {
      xPercent,
      yPercent,
      pxX,
      pxY,
      width: safeWidth,
      height: safeHeight
    },
    clampedScale
  };
}

const DEFAULT_ORIGIN: MagnifierOrigin = {
  xPercent: 50,
  yPercent: 50,
  pxX: 0,
  pxY: 0,
  width: 0,
  height: 0
};

/**
 * Hook reutilizável para inspeção com zoom interativo via mouse ou toque,
 * atualizando `transform` e `transformOrigin` na imagem do rótulo.
 */
export function useMagnifier(options: UseMagnifierOptions = {}) {
  const {
    initialScale = 2,
    minScale = 1.25,
    maxScale = 4,
    enabled = true
  } = options;

  const containerRef = useRef<HTMLDivElement | null>(null);
  const [scale, setScaleState] = useState<number>(() =>
    Math.max(minScale, Math.min(maxScale, initialScale))
  );
  const [isMagnifying, setIsMagnifying] = useState<boolean>(false);
  const [isPinned, setIsPinned] = useState<boolean>(false);
  const [origin, setOrigin] = useState<MagnifierOrigin>(DEFAULT_ORIGIN);

  const setScale = useCallback(
    (nextScale: number) => {
      const clamped = Math.max(minScale, Math.min(maxScale, Number(nextScale) || minScale));
      setScaleState(Math.round(clamped * 100) / 100);
    },
    [minScale, maxScale]
  );

  const updateFromClientPoint = useCallback(
    (clientX: number, clientY: number) => {
      if (!enabled || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      if (rect.width <= 0 || rect.height <= 0) return;

      const { origin: nextOrigin } = computeMagnifierTransform({
        clientX,
        clientY,
        rect,
        scale,
        minScale,
        maxScale
      });

      setOrigin(nextOrigin);
      setIsMagnifying(true);
    },
    [enabled, scale, minScale, maxScale]
  );

  const reset = useCallback(() => {
    setIsMagnifying(false);
    setIsPinned(false);
    setOrigin(DEFAULT_ORIGIN);
  }, []);

  const togglePin = useCallback(() => {
    setIsPinned((prev) => {
      const next = !prev;
      if (next) {
        setIsMagnifying(true);
      } else {
        setIsMagnifying(false);
      }
      return next;
    });
  }, []);

  const onMouseEnter = useCallback(
    (e: React.MouseEvent<HTMLElement>) => {
      if (!enabled) return;
      updateFromClientPoint(e.clientX, e.clientY);
    },
    [enabled, updateFromClientPoint]
  );

  const onMouseMove = useCallback(
    (e: React.MouseEvent<HTMLElement>) => {
      if (!enabled) return;
      updateFromClientPoint(e.clientX, e.clientY);
    },
    [enabled, updateFromClientPoint]
  );

  const onMouseLeave = useCallback(() => {
    if (!isPinned) {
      setIsMagnifying(false);
    }
  }, [isPinned]);

  const onTouchStart = useCallback(
    (e: React.TouchEvent<HTMLElement>) => {
      if (!enabled || !e.touches[0]) return;
      // Em telas sensíveis ao toque, mantém o zoom visível para leitura após levantar o dedo
      setIsPinned(true);
      updateFromClientPoint(e.touches[0].clientX, e.touches[0].clientY);
    },
    [enabled, updateFromClientPoint]
  );

  const onTouchMove = useCallback(
    (e: React.TouchEvent<HTMLElement>) => {
      if (!enabled || !e.touches[0]) return;
      updateFromClientPoint(e.touches[0].clientX, e.touches[0].clientY);
    },
    [enabled, updateFromClientPoint]
  );

  const onTouchEnd = useCallback(() => {
    // Mantém `isMagnifying` enquanto `isPinned` estiver ativo para inspeção confortável em mobile
  }, []);

  const onWheel = useCallback(
    (e: React.WheelEvent<HTMLElement>) => {
      if (!enabled || !isMagnifying) return;
      const step = e.deltaY < 0 ? 0.25 : -0.25;
      setScale(scale + step);
    },
    [enabled, isMagnifying, scale, setScale]
  );

  const activeScale = enabled && isMagnifying ? scale : 1;

  const transformStyle: React.CSSProperties = useMemo(
    () => ({
      transform: `scale(${activeScale})`,
      transformOrigin: `${origin.xPercent.toFixed(2)}% ${origin.yPercent.toFixed(2)}%`,
      transition: isMagnifying ? 'transform 60ms ease-out' : 'transform 180ms ease-out',
      willChange: 'transform'
    }),
    [activeScale, origin.xPercent, origin.yPercent, isMagnifying]
  );

  const magnifierHandlers = useMemo(
    () => ({
      onMouseEnter,
      onMouseMove,
      onMouseLeave,
      onTouchStart,
      onTouchMove,
      onTouchEnd,
      onWheel
    }),
    [onMouseEnter, onMouseMove, onMouseLeave, onTouchStart, onTouchMove, onTouchEnd, onWheel]
  );

  return {
    containerRef,
    isMagnifying: enabled && isMagnifying,
    isPinned,
    scale,
    activeScale,
    origin,
    transformStyle,
    magnifierHandlers,
    setScale,
    togglePin,
    reset
  };
}
