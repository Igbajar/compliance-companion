import { ReactNode, useState } from "react";
import Sidebar from "./Sidebar";
import { Bell, Search, User } from "lucide-react";
import { Button } from "@/components/ui/button";

interface MainLayoutProps {
  children: ReactNode;
}

const MainLayout = ({ children }: MainLayoutProps) => {
  const [sidebarCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      
      {/* Main Content */}
      <div className={`transition-all duration-300 ${sidebarCollapsed ? "ml-20" : "ml-64"}`}>
        {/* Top Header */}
        <header className="h-16 border-b border-border bg-card/50 backdrop-blur-xl sticky top-0 z-40">
          <div className="flex items-center justify-between h-full px-6">
            {/* Search */}
            <div className="flex items-center gap-4 flex-1 max-w-xl">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search documents, clauses, risks..."
                  className="w-full h-10 pl-10 pr-4 rounded-lg bg-secondary border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                />
              </div>
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="w-5 h-5" />
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-destructive rounded-full text-[10px] flex items-center justify-center text-destructive-foreground font-medium">
                  3
                </span>
              </Button>
              <div className="w-px h-8 bg-border" />
              <div className="flex items-center gap-3">
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-medium text-foreground">John Smith</p>
                  <p className="text-xs text-muted-foreground">Quality Manager</p>
                </div>
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                  <User className="w-5 h-5 text-primary" />
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
