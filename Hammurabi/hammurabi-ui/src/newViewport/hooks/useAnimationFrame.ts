import { useEffect, useRef } from "react";

export type UseAnimationFrame = (
  callback: (delta: number) => void,
  enable: boolean,
) => void;

/**
 * A hook that wraps the animation frame api.
 */
const useAnimationFrame: UseAnimationFrame = (callback, enable) => {
  const callbackRef = useRef(callback);
  callbackRef.current = callback;

  // use a ref to skip callback function call as soon as enable is false
  // (do not wait for another render/useEffect call)
  const enableRef = useRef(enable);
  enableRef.current = enable;

  useEffect(() => {
    let isMounted = true;
    let requestId = 0;
    let lastTime: number | undefined = undefined;

    function loop(time: number): void {
      if (isMounted && enableRef.current) {
        lastTime ??= time;

        callbackRef.current(time - lastTime);
        lastTime = time;

        requestId = requestAnimationFrame(loop);
      } else {
        cancelAnimationFrame(requestId);
      }
    }

    if (enable) {
      requestId = requestAnimationFrame(loop);
      lastTime = undefined;
    }

    return () => {
      isMounted = false;
    };
  }, [enable]);
};

export default useAnimationFrame;
