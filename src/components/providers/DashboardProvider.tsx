"use client";

import React, { createContext, useContext, useState } from "react";
import { useToast } from "@/components/providers/ToastProvider";

interface DashboardContextType {
  isSettingsOpen: boolean;
  activeSettingsTab: string;
  isCreatePostOpen: boolean;
  selectedPost: any | null; // using any for dummy post type for now
  selectedProfile: any | null;
  openSettings: (tab?: string) => void;
  closeSettings: () => void;
  setActiveSettingsTab: (tab: string) => void;
  isSearchOpen: boolean;
  setIsSearchOpen: (isOpen: boolean) => void;
  setIsCreatePostOpen: (isOpen: boolean) => void;
  setSelectedPost: (post: any | null) => void;
  setSelectedProfile: (profile: any | null) => void;
  showToast: (message: string) => void;
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

export function DashboardProvider({ children }: { children: React.ReactNode }) {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [activeSettingsTab, setActiveSettingsTab] = useState("profile");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isCreatePostOpen, setIsCreatePostOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState<any | null>(null);
  const [selectedProfile, setSelectedProfile] = useState<any | null>(null);
  const { showToast } = useToast();

  const openSettings = (tab?: string) => {
    if (tab) setActiveSettingsTab(tab);
    setIsSettingsOpen(true);
  };

  const closeSettings = () => {
    setIsSettingsOpen(false);
  };

  return (
    <DashboardContext.Provider
      value={{
        isSettingsOpen,
        activeSettingsTab,
        isCreatePostOpen,
        selectedPost,
        selectedProfile,
        openSettings,
        closeSettings,
        setActiveSettingsTab,
        isSearchOpen,
        setIsSearchOpen,
        setIsCreatePostOpen,
        setSelectedPost,
        setSelectedProfile,
        showToast,
      }}
    >
      {children}
    </DashboardContext.Provider>
  );
}

export function useDashboard() {
  const context = useContext(DashboardContext);
  if (context === undefined) {
    throw new Error("useDashboard must be used within a DashboardProvider");
  }
  return context;
}
