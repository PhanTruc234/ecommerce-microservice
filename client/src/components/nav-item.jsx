"use client"

import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@/components/ui/collapsible"

import {
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarMenuSub,
    SidebarMenuSubItem,
} from "@/components/ui/sidebar"

import { ChevronRightIcon } from "lucide-react"
import { useState } from "react"
import { Link } from "react-router-dom"

export function NavItem({ item, depth = 0 }) {
    const hasChildren = item.items?.length > 0
    const [open, setOpen] = useState(false)

    if (!hasChildren) {
        return (
            <SidebarMenuButton asChild>
                <Link to={item.url || "#"}>
                    {item.icon && item.icon}
                    <span>{item.title}</span>
                </Link>
            </SidebarMenuButton>
        )
    }

    return (
        <Collapsible
            open={open}
            onOpenChange={setOpen}
            className="group/collapsible w-full"
        >
            <CollapsibleTrigger asChild>
                <SidebarMenuButton>
                    {item.icon && item.icon}
                    <span>{item.title}</span>
                    <ChevronRightIcon className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                </SidebarMenuButton>
            </CollapsibleTrigger>

            <CollapsibleContent>
                <SidebarMenuSub>
                    {item.items.map((child) => (
                        <SidebarMenuSubItem key={child.title}>
                            <NavItem item={child} depth={depth + 1} />
                        </SidebarMenuSubItem>
                    ))}
                </SidebarMenuSub>
            </CollapsibleContent>
        </Collapsible>
    )
}