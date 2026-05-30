"use client"

import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import logo from "../assets/logo.png"
export function TeamSwitcher() {
  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton size="icon" className="justify-center">
          <a href="" className="flex size-16 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground logo">
            <img src={logo} alt="logo" />
          </a>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}