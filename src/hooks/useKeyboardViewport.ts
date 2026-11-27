import { useEffect, useState } from "react";

export type KeyboardViewport = { top: number; height: number };

/** Diferença mínima (px) entre a janela e a área visível para considerarmos que o teclado abriu. */
const KEYBOARD_MIN_DELTA = 120;

type ViewportLike = Pick<VisualViewport, "height" | "offsetTop" | "scale">;

/**
 * Devolve a área visível quando o teclado virtual está aberto, ou null quando não está.
 *
 * No iOS o teclado cobre a página em vez de redimensioná-la, então elementos `fixed` com
 * altura total ficam com o rodapé escondido. Quem usa esse retorno ajusta o próprio
 * topo e a própria altura para caber acima do teclado.
 */
export const getKeyboardViewport = (
  viewport: ViewportLike,
  windowInnerHeight: number
): KeyboardViewport | null => {
  // Com zoom (pinça) a área visível também encolhe; isso não é teclado.
  if (viewport.scale > 1.01) return null;
  if (windowInnerHeight - viewport.height < KEYBOARD_MIN_DELTA) return null;
  return { top: Math.max(0, viewport.offsetTop), height: viewport.height };
};

export const useKeyboardViewport = (enabled = true): KeyboardViewport | null => {
  const [state, setState] = useState<KeyboardViewport | null>(null);

  useEffect(() => {
    const viewport = typeof window !== "undefined" ? window.visualViewport : null;
    if (!enabled || !viewport) return;

    let frame = 0;
    const update = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const next = getKeyboardViewport(viewport, window.innerHeight);
        setState((previous) =>
          previous?.top === next?.top && previous?.height === next?.height ? previous : next
        );
      });
    };

    update();
    viewport.addEventListener("resize", update);
    viewport.addEventListener("scroll", update);
    return () => {
      cancelAnimationFrame(frame);
      viewport.removeEventListener("resize", update);
      viewport.removeEventListener("scroll", update);
      setState(null);
    };
  }, [enabled]);

  return state;
};
