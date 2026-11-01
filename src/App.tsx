import { canvas } from "@drincs/pixi-vn";
import { Analytics } from "@vercel/analytics/react";
import { useEffect, useRef } from "react";
import { Outlet } from "react-router-dom";
import { Header } from "./components/layout";
import { DataInitializer } from "./components/DataInitializer";

function App() {
  const pixiRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (pixiRef.current) {
      canvas.initialize(pixiRef.current, 1080, 720);
    }
  }, []);

  return (
    <>
      <Header />
      <main className="app-shell">
        <Outlet />
      </main>
      <div ref={pixiRef} className="vn-runtime-canvas" aria-hidden="true" />
      <DataInitializer />
      <Analytics />
    </>
  );
}

export default App;
