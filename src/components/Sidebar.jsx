import React from "react";
import {
  LayoutDashboard,
  Calendar,
  Smartphone,
  Music,
  Radio,
  Users,
  Menu,
} from "lucide-react";
import { Button } from "./ui/button";
import { useSidebar } from "../context/SidebarContext";

const SideBar = ({
  scrollToSection,
  sectionRefs,
  activeSection,
  setActiveSection,
}) => {
  const { isOpen, toggleSidebar } = useSidebar();

  const navItems = [
    {
      id: "overview",
      icon: LayoutDashboard,
      label: "Overview",
      ref: "overviewRef",
    },
    {
      id: "temporal",
      icon: Calendar,
      label: "Aspect Temporel",
      ref: "temporalRef",
    },
    {
      id: "multiplatform",
      icon: Smartphone,
      label: "Multi-plateformes",
      ref: "multiplatformRef",
    },
    {
      id: "genre",
      icon: Music,
      label: "Genre Musical",
      ref: "genreRef",
    },
    {
      id: "diffusion",
      icon: Radio,
      label: "Diffusion & Rayonnement",
      ref: "diffusionRef",
    },
    {
      id: "engagement",
      icon: Users,
      label: "Engagement Utilisateur",
      ref: "engagementRef",
    },
  ];

  return (
    <aside
      className={`fixed top-0 left-0 h-screen bg-background border-r transition-all duration-300 ease-in-out overflow-hidden z-40 ${
        isOpen ? "w-64" : "w-20"
      }`}
    >
      <div className="flex flex-col h-full">
        {/* Sidebar Header */}
        <div
          className={`flex h-16 items-center border-b px-4 ${
            isOpen ? "justify-between" : "justify-center"
          }`}
        >
          {isOpen ? (
            <>
              <h1 className="text-xl font-bold">Spotify Analytics</h1>
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleSidebar}
                className="hover:bg-accent/50"
              >
                <Menu className="h-5 w-5" />
              </Button>
            </>
          ) : (
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleSidebar}
              className="hover:bg-accent/50"
            >
              <Menu className="h-5 w-5" />
            </Button>
          )}
        </div>

        {/* Sidebar Content */}
        <div className="flex flex-col flex-1 overflow-y-auto py-2">
          <nav
            className={`flex flex-col gap-1 py-3 ${isOpen ? "px-2" : "px-0"}`}
          >
            {navItems.map((item) => (
              <div key={item.id} className={`${isOpen ? "mb-1" : "mb-2"}`}>
                <button
                  className={`flex items-center rounded-md py-2.5 text-sm font-medium transition-colors ${
                    isOpen
                      ? "w-full px-3 justify-start"
                      : "w-full px-0 justify-center"
                  } ${
                    activeSection === item.id
                      ? "bg-accent text-accent-foreground"
                      : "text-muted-foreground hover:bg-accent/50 hover:text-accent-foreground"
                  }`}
                  onClick={() => {
                    scrollToSection(sectionRefs[item.ref]);
                    setActiveSection(item.id);
                  }}
                >
                  <div
                    className={`flex items-center justify-center min-w-[28px] ${
                      isOpen ? "" : "mx-auto"
                    }`}
                  >
                    <item.icon className="h-5 w-5" />
                  </div>
                  {isOpen && (
                    <span className="ml-2.5 truncate">{item.label}</span>
                  )}
                </button>
              </div>
            ))}
          </nav>
        </div>
      </div>
    </aside>
  );
};

export default SideBar;
