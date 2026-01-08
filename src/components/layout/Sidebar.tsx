import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  Monitor, 
  FileText, 
  Settings, 
  ChevronLeft,
  ChevronRight,
  Server,
  MapPin,
  Wrench,
  Shield,
  History
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Employees', href: '/employees', icon: Users },
  { name: 'Assets', href: '/assets', icon: Monitor },
  { name: 'Assignments', href: '/assignments', icon: Server },
  { name: 'Maintenance', href: '/maintenance', icon: Wrench },
  { name: 'Locations', href: '/locations', icon: MapPin },
  { name: 'Reports', href: '/reports', icon: FileText },
  { name: 'Audit Log', href: '/audit', icon: History },
];

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();

  return (
    <aside 
      className={cn(
        "fixed left-0 top-0 z-40 h-screen bg-sidebar border-r border-sidebar-border transition-all duration-300 flex flex-col",
        collapsed ? "w-16" : "w-64"
      )}
    >
      {/* Logo */}
      <div className="flex h-16 items-center justify-between px-4 border-b border-sidebar-border">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <Shield className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-semibold text-sidebar-foreground">AssetTrack ServiceFactory</span>
          </div>
        )}
        {collapsed && (
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center mx-auto">
            <Shield className="w-5 h-5 text-primary-foreground" />
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
        {navigation.map((item) => {
          const isActive = location.pathname === item.href;
          return (
            <NavLink
              key={item.name}
              to={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                isActive 
                  ? "bg-sidebar-accent text-sidebar-accent-foreground" 
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground",
                collapsed && "justify-center px-2"
              )}
            >
              <item.icon className={cn("w-5 h-5 flex-shrink-0", isActive && "text-primary")} />
              {!collapsed && <span>{item.name}</span>}
            </NavLink>
          );
        })}
      </nav>

      {/* Collapse Button */}
      <div className="p-2 border-t border-sidebar-border">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground transition-colors"
        >
          {collapsed ? (
            <ChevronRight className="w-5 h-5" />
          ) : (
            <>
              <ChevronLeft className="w-5 h-5" />
              <span>Collapse</span>
            </>
          )}
        </button>
      </div>

      {/* Settings Link */}
      <div className="p-2 border-t border-sidebar-border">
        <NavLink
          to="/settings"
          className={cn(
            "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
            "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground",
            collapsed && "justify-center px-2"
          )}
        >
          <Settings className="w-5 h-5 flex-shrink-0" />
          {!collapsed && <span>Settings</span>}
        </NavLink>
      </div>
    </aside>
  );
}
