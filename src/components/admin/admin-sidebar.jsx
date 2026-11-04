import {
  Sidebar,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarHeader,
} from "@/components/ui/sidebar";
import { Users, Briefcase, Shield, AlertTriangle } from "lucide-react";

// Admin sidebar navigation component
const AdminSidebar = ({ activeTab, setActiveTab, suspiciousJobsCount }) => {
  const menuItems = [
    {
      id: "users",
      label: "Users",
      icon: Users,
      activeClass: "bg-blue-600/20 text-blue-300 border border-blue-400/30 shadow-sm",
      hoverClass: "text-gray-300 hover:bg-gray-700/20 hover:text-white"
    },
    {
      id: "jobs",
      label: "Jobs",
      icon: Briefcase,
      activeClass: "bg-blue-600/20 text-blue-300 border border-blue-400/30 shadow-sm",
      hoverClass: "text-gray-300 hover:bg-gray-700/20 hover:text-white"
    },
    {
      id: "suspicious",
      label: "Suspicious Jobs",
      icon: AlertTriangle,
      activeClass: "bg-orange-600/20 text-orange-300 border border-orange-400/30 shadow-sm",
      hoverClass: "text-gray-300 hover:bg-gray-700/20 hover:text-white",
      badge: suspiciousJobsCount > 0 ? suspiciousJobsCount : null
    }
  ];

  return (
    <Sidebar className="w-72 border-r border-gray-600/30 bg-transparent/10 backdrop-blur-sm">
      <SidebarHeader className="p-6 border-b border-gray-600/20 bg-transparent">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Admin Panel</h2>
            <p className="text-sm text-gray-300">HIRED Management</p>
          </div>
        </div>
      </SidebarHeader>
      
      <SidebarContent className="p-4">
        <div className="mb-6">
          <h3 className="text-xs font-semibold text-gray-300 uppercase tracking-wider mb-3">
            Main Navigation
          </h3>
          <SidebarMenu className="space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              
              return (
                <SidebarMenuItem key={item.id}>
                  <SidebarMenuButton
                    isActive={isActive}
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                      isActive ? item.activeClass : item.hoverClass
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{item.label}</span>
                    {item.badge && (
                      <span className="bg-orange-500 text-white text-xs px-2 py-1 rounded-full ml-auto">
                        {item.badge}
                      </span>
                    )}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
        </div>
      </SidebarContent>
    </Sidebar>
  );
};

export default AdminSidebar;
