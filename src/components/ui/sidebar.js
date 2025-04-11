import React, { createContext, useContext, useState } from "react";
import { cn } from "./utils";
import { Menu } from "lucide-react";
import { Button } from "./button";

const SidebarContext = createContext({
  isOpen: true,
  setIsOpen: () => {},
});

export function useSidebar() {
  return useContext(SidebarContext);
}

export function SidebarProvider({ children, defaultIsOpen = true }) {
  const [isOpen, setIsOpen] = useState(defaultIsOpen);

  return (
    <SidebarContext.Provider value={{ isOpen, setIsOpen }}>
      {children}
    </SidebarContext.Provider>
  );
}

export function Sidebar({ className, children, ...props }) {
  const { isOpen } = useSidebar();

  return (
    <aside
      className={cn(
        "fixed top-0 left-0 h-screen bg-background border-r transition-all duration-300 ease-in-out overflow-hidden z-40",
        isOpen ? "w-64" : "w-20",
        className
      )}
      {...props}
    >
      <div className="flex flex-col h-full">{children}</div>
    </aside>
  );
}

export function SidebarHeader({ className, children, ...props }) {
  const { isOpen } = useSidebar();

  return (
    <div
      className={cn(
        "flex h-16 items-center transition-all duration-300 ease-in-out",
        isOpen ? "px-6 justify-start" : "px-0 justify-center",
        className
      )}
      {...props}
    >
      {isOpen ? (
        children
      ) : (
        <div className="rounded-full bg-[#1DB954] p-1">
          <Menu className="h-5 w-5 text-black" />
        </div>
      )}
    </div>
  );
}

export function SidebarContent({ className, children, ...props }) {
  return (
    <div
      className={cn("flex flex-col flex-1 overflow-y-auto py-2", className)}
      {...props}
    >
      {children}
    </div>
  );
}

export function SidebarMenu({ className, children, ...props }) {
  const { isOpen } = useSidebar();

  return (
    <nav
      className={cn(
        "flex flex-col gap-1 py-3",
        isOpen ? "px-2" : "px-0",
        className
      )}
      {...props}
    >
      {children}
    </nav>
  );
}

export function SidebarMenuItem({ className, children, ...props }) {
  const { isOpen } = useSidebar();

  return (
    <div className={cn(isOpen ? "mb-1" : "mb-2", className)} {...props}>
      {children}
    </div>
  );
}

export function SidebarMenuButton({ className, children, isActive, ...props }) {
  const { isOpen } = useSidebar();

  const childrenArray = React.Children.toArray(children);
  const icon = childrenArray[0];
  const text = childrenArray[1];

  return (
    <button
      className={cn(
        "flex items-center rounded-md py-2.5 text-sm font-medium transition-colors",
        isOpen ? "w-full px-3 justify-start" : "w-full px-0 justify-center",
        isActive
          ? "bg-accent text-accent-foreground"
          : "text-muted-foreground hover:bg-accent/50 hover:text-accent-foreground",
        className
      )}
      {...props}
    >
      <div
        className={cn(
          "flex items-center justify-center min-w-[28px]",
          isOpen ? "" : "mx-auto"
        )}
      >
        {React.cloneElement(icon, {
          className: cn("h-5 w-5"),
        })}
      </div>
      {isOpen && <span className="ml-2.5 truncate">{text}</span>}
    </button>
  );
}

export function SidebarTrigger() {
  const { isOpen, setIsOpen } = useSidebar();

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setIsOpen(!isOpen)}
      aria-label={isOpen ? "Close sidebar" : "Open sidebar"}
      className="hover:bg-accent/50"
    >
      <Menu className="h-5 w-5" />
    </Button>
  );
}
