import React from "react";
import { Menu } from "lucide-react";
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "./ui/sidebar";

const ScrollytellingSidebar = ({
  scrollToSection,
  sectionRefs,
  activeSection,
  setActiveSection,
}) => {
  return (
    <Sidebar>
      <SidebarHeader>
        <h1 className="text-xl font-bold">Navigation</h1>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={() => {
                scrollToSection(sectionRefs.dashboardRef);
                setActiveSection("dashboard");
              }}
              isActive={activeSection === "dashboard"}
            >
              <Menu className="h-5 w-5" />
              Dashboard
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={() => {
                scrollToSection(sectionRefs.overviewRef);
                setActiveSection("overview");
              }}
              isActive={activeSection === "overview"}
            >
              <Menu className="h-5 w-5" />
              Overview
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={() => {
                scrollToSection(sectionRefs.temporalRef);
                setActiveSection("temporal");
              }}
              isActive={activeSection === "temporal"}
            >
              <Menu className="h-5 w-5" />
              Aspect Temporel
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={() => {
                scrollToSection(sectionRefs.multiplatformRef);
                setActiveSection("multiplatform");
              }}
              isActive={activeSection === "multiplatform"}
            >
              <Menu className="h-5 w-5" />
              Aspect Multi-plateformes
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={() => {
                scrollToSection(sectionRefs.genreRef);
                setActiveSection("genre");
              }}
              isActive={activeSection === "genre"}
            >
              <Menu className="h-5 w-5" />
              Aspect Genre Musical
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={() => {
                scrollToSection(sectionRefs.diffusionRef);
                setActiveSection("diffusion");
              }}
              isActive={activeSection === "diffusion"}
            >
              <Menu className="h-5 w-5" />
              Aspect Diffusion & Rayonnement
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={() => {
                scrollToSection(sectionRefs.engagementRef);
                setActiveSection("engagement");
              }}
              isActive={activeSection === "engagement"}
            >
              <Menu className="h-5 w-5" />
              Aspect Engagement Utilisateur
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarContent>
    </Sidebar>
  );
};

export default ScrollytellingSidebar;
