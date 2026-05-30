"use client"

import * as React from "react"

import { NavMain } from "@/components/nav-main"

import { NavUser } from "@/components/nav-user"
import { TeamSwitcher } from "@/components/team-switcher"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"
import { GalleryVerticalEndIcon, AudioLinesIcon, TerminalIcon, TerminalSquareIcon, BotIcon, BookOpenIcon, Settings2Icon, FrameIcon, PieChartIcon, MapIcon, LayoutDashboard, Images, Box, ChartBarStacked, Store, TicketPercent, MessageSquareText } from "lucide-react"
// import { useGetCategory } from "@/hooks/category/useCategory"
import { AuthStore } from "@/stores/auth.store"
import { ShoppingBag } from "lucide-react"
import { UserCog } from "lucide-react"

const data = {
  navMain: [
    {
      title: "Thống kê", url: "#", icon: (
        <LayoutDashboard />
      )
    },
    {
      title: "Danh mục",
      icon: (
        <TerminalSquareIcon />
      ),
      items: [
        {
          title: "Nam",
          items: [
            { title: "Áo thun", url: "/ao-thun" },
            { title: "Áo sơ mi", url: "/ao-so-mi" },
          ],
          isActive: true,
        },
        {
          title: "Nữ", items: [
            { title: "Quần jean", url: "/quan-jean" },
          ],
        }
      ],
    },
    {
      title: "Sản phẩm",
      url: "#",
      icon: (
        <BotIcon />
      ),
    },
    {
      title: "Media",
      url: "#",
      icon: (
        <BookOpenIcon />
      ),
    },
    {
      title: "Chat",
      url: "#",
      icon: (
        <BookOpenIcon />
      ),
    },
    {
      title: "Settings",
      url: "#",
      icon: (
        <Settings2Icon />
      ),
    },
  ],
}

export function AppSidebar({
  ...props
}) {
  const { categoriesTree, isLoading, isValidating, refreshCategory } = useGetCategory()
  const datas = categoriesTree?.map((i) => ({
    title: i.name,
    items: i.children.map((child) => ({
      title: child.name,
      url: `/admin/category?parentId=${child.id}`
    }))
  }))
  const data = {
    navMain: [
      {
        title: "Thống kê", url: "/admin", icon: (
          <LayoutDashboard />
        )
      },
      {
        title: "Danh mục",
        icon: (
          <ChartBarStacked />
        ),
        items: datas
      },
      {
        title: "Sản phẩm",
        url: "product",
        icon: (
          <Box />
        ),
      },
      {
        title: "Media",
        url: "media",
        icon: (
          <Images />
        ),
      },
      {
        title: "Thương hiệu",
        url: "brand",
        icon: (
          <Store />
        ),
      },
      {
        title: "Mã giảm giá",
        url: "discount",
        icon: (
          <TicketPercent />
        ),
      },
      {
        title: "Tin nhắn",
        url: "chat",
        icon: (
          <MessageSquareText />
        ),
      },
      {
        title: "Đơn hàng",
        url: "order",
        icon: (
          <ShoppingBag />
        ),
      },
      {
        title: "Người dùng",
        url: "user",
        icon: (
          <UserCog />
        ),
      },
      {
        title: "Settings",
        url: "#",
        icon: (
          <Settings2Icon />
        ),
      },
    ],
  }
  const { user } = AuthStore()
  return (
    <Sidebar collapsible="icon" {...props} >
      <SidebarHeader>
        <TeamSwitcher />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
