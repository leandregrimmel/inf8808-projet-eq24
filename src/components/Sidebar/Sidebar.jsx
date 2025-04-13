import {
  LayoutDashboard,
  Calendar,
  Smartphone,
  Music,
  MessageCircleQuestion,
  Radio,
  Users,
  Menu,
} from "lucide-react";
import { Button } from "../common/button";
import { useSidebar } from "../../context/SidebarContext";
import ArtistFilter from "./ArtistFilter";

const sectionColors = {
  overview: "#3B82F6",
  temporal: "#F59E0B",
  multiplatform: "#10B981",
  questions: "#6B7280",
  style: "#8B5CF6",
  diffusion: "#EF4444",
  engagement: "#14B8A6",
};

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
      label: "Apreçu",
      ref: "overviewRef",
    },
    {
      id: "questions",
      icon: MessageCircleQuestion,
      label: "Questions",
      ref: "questionsRef",
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
      id: "style",
      icon: Music,
      label: "Style Musical",
      ref: "styleRef",
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
        isOpen ? "w-72" : "w-20"
      }`}
    >
      <div className="flex flex-col h-full">
        <div
          className={`flex h-16 items-center border-b px-4 ${
            isOpen ? "justify-between" : "justify-center"
          }`}
        >
          {isOpen ? (
            <>
              <h4 className="font-extrabold">Popularité Musicale</h4>
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
        {/* Filtre d'artiste - Affiché uniquement lorsque la barre latérale est étendue */}
        {isOpen && (
          <div className="px-3 py-4 border-b">
            <ArtistFilter />
          </div>
        )}
        {/* Navigation Items */}
        <div className="flex flex-col flex-1 overflow-y-auto py-2">
          <nav
            className={`flex flex-col gap-1 py-3 ${isOpen ? "px-2" : "px-0"}`}
          >
            {navItems.map((item) => {
              const isActive = activeSection === item.id;
              const color = sectionColors[item.id];

              return (
                <div key={item.id} className={`${isOpen ? "mb-1" : "mb-2"}`}>
                  <button
                    className={`flex items-center rounded-md py-2.5 text-sm font-medium transition-colors relative ${
                      isOpen
                        ? "w-full px-3 justify-start"
                        : "w-full px-0 justify-center"
                    } ${
                      isActive
                        ? "text-white"
                        : "text-muted-foreground hover:bg-accent/50 hover:text-accent-foreground"
                    }`}
                    onClick={() => {
                      scrollToSection(sectionRefs[item.ref]);
                      setActiveSection(item.id);
                    }}
                  >
                    {/* Background with reduced opacity */}
                    {isActive && (
                      <div
                        className="absolute inset-0 rounded-md"
                        style={{
                          backgroundColor: color,
                          opacity: 0.5,
                          zIndex: -1,
                        }}
                      />
                    )}
                    <div
                      className={`flex items-center justify-center min-w-[28px] ${
                        isOpen ? "" : "mx-auto"
                      }`}
                      style={{
                        color: isActive ? "white" : color,
                      }}
                    >
                      <item.icon className="h-5 w-5" />
                    </div>
                    {isOpen && (
                      <span className="ml-2.5 truncate">{item.label}</span>
                    )}
                  </button>
                </div>
              );
            })}
          </nav>
        </div>
      </div>
    </aside>
  );
};

export default SideBar;
