import Header from "@/components/header";
import { Outlet } from "react-router-dom";

// Main layout component with header, content area, and footer
const AppLayout = () => {
  return (
    <div>
      {/* Animated background grid pattern */}
      <div className="grid-background"></div>
      <main className="min-h-screen container">
        <Header />
        {/* Page content renders here via React Router */}
        <Outlet />
      </main>
      <div className="p-10 text-center bg-gray-800 mt-10">
        Final Year Project
      </div>
    </div>
  );
};

export default AppLayout;
// milestone 13: Optimized repeated API requests and stale state refreshes

// milestone 28: Finished final UX polish and release readiness pass
