import { Analytics } from "@vercel/analytics/react";
import { Outlet } from "react-router-dom";
import { Header } from "./components/layout";
import { DataInitializer } from "./components/DataInitializer";

function App() {
  return (
    <>
      <Header />
      <main className="app-shell">
        <Outlet />
      </main>
      <DataInitializer />
      <Analytics />
    </>
  );
}

export default App;
