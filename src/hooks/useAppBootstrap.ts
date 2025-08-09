import { useEffect, useRef, useState } from "react";
import { createRepository } from "../data/repository";
import type { ModificationDates } from "../data/types";

type BootstrapMode = "fast" | "syncOnIdle";

export function useAppBootstrap(deps: any, mode: BootstrapMode = "fast") {
  const repoRef = useRef<ReturnType<typeof createRepository> | null>(null);
  const datesRef = useRef<ModificationDates | null>(null);

  const [ready, setReady] = useState(false);

  useEffect(() => {
    repoRef.current = createRepository(deps);

    (async () => {
      // 只做本地/seed 暖啟動
      const current = await repoRef.current!.initAndWarm();
      datesRef.current = current;
      setReady(true); // 立刻讓 UI ready

      if (mode === "syncOnIdle") {
        // 等畫面空檔再做第一次同步（非阻塞 UI）
        const idle = (cb: () => void) =>
          (window as any).requestIdleCallback
            ? (window as any).requestIdleCallback(cb, { timeout: 8000 })
            : setTimeout(cb, 8_000);

        idle(async () => {
          try {
            await repoRef.current!.syncDelta(datesRef.current);
          } catch {
            /* 靜默；有 banner 提示即可 */
          }
        });
      }
    })();
  }, []);

  return { ready, datesRef, repo: repoRef };
}
