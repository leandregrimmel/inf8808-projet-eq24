import React from "react";
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarTrigger,
} from "./ui/sidebar";
import {
  LayoutDashboard,
  Calendar,
  Smartphone,
  Music,
  Radio,
  Users,
} from "lucide-react";

const SideBar = ({
  scrollToSection,
  sectionRefs,
  activeSection,
  setActiveSection,
}) => {
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
    <Sidebar>
      <h1 className="mb-4 text-2xl font-bold p-4 pb-0">Spotify Analytics</h1>
      <SidebarContent>
        <SidebarMenu>
          {navItems.map((item) => (
            <SidebarMenuItem key={item.id}>
              <SidebarMenuButton
                onClick={() => {
                  scrollToSection(sectionRefs[item.ref]);
                  setActiveSection(item.id);
                }}
                isActive={activeSection === item.id}
                className="flex justify-start"
              >
                <item.icon className="h-5 w-5" />
                {item.label}
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
    </Sidebar>
  );
};

export default SideBar;
