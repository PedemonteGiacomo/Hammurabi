import { useRef, useLayoutEffect, useCallback } from "react";

type Callback = (...args: never[]) => unknown;
type Hook = <Fn extends Callback>(fn: Fn, deps: unknown[]) => Return<Fn>;
type Return<Fn extends Callback> = (...args: Parameters<Fn>) => ReturnType<Fn>;

const useEventCallback: Hook = (fn, deps) => {
  const ref = useRef(fn);

  useLayoutEffect(() => {
    ref.current = fn;
  }, [fn, ...deps]); // eslint-disable-line react-hooks/exhaustive-deps

  return useCallback(
    (...args) => ref.current(...args) as ReturnType<typeof fn>,
    [ref],
  );
};

export { useEventCallback };
