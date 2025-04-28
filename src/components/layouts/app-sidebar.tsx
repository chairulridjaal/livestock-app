import * as React from "react"
import { ChevronRight } from "lucide-react"
import { useLocation } from "react-router-dom" 
import { useAuth } from "@/contexts/AuthContext"
import { SearchForm } from "@/components/layouts/search-form"
import { VersionSwitcher } from "@/components/layouts/version-switcher"
import { NavUser } from "@/components/layouts/nav-user"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarFooter,
} from "@/components/ui/sidebar"

const data = {
  versions: ["Ananta Farm"],
  navMain: [
    {
      title: "Home",
      url: "/",
      items: [
        {
          title: "Dashboard",
          url: "/dashboard",
          isActive: false,
        },
        {
          title: "Farm",
          url: "/farm",
          isActive: false,
        },
      ],
    },
    {
      title: "Livestock",
      url: "/livestock",
      items: [
        {
          title: "Daily Recording",
          url: "/livestock/record",
          isActive: false,
        },
        {
          title: "Livestock List",
          url: "/livestock/list",
          isActive: false,
        },
        {
          title: "New Livestock",
          url: "/livestock/add",
          isActive: false,
        },
      ],
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const location = useLocation(); // Use the location hook to get the current URL
  const { user } = useAuth();

  const userData = {
    user: {
      name: user?.name || "User",
      email: user?.email || "",
      avatar: user?.avatar || (user?.name ? user.name[0] : ""),
    }
  }

  // Function to check if the item is active based on the current URL
  const checkIsActive = (itemUrl: string) => {
    return location.pathname === itemUrl;
  };

  return (
    <Sidebar {...props}>
      <SidebarHeader>
        <VersionSwitcher
          versions={data.versions}
          defaultVersion={data.versions[0]}
        />
        <SearchForm />
      </SidebarHeader>
      <SidebarContent className="gap-0">
        {data.navMain.map((item) => (
          <Collapsible
            key={item.title}
            title={item.title}
            defaultOpen
            className="group/collapsible"
          >
            <SidebarGroup>
              <SidebarGroupLabel
                asChild
                className="group/label text-sm text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              >
                <CollapsibleTrigger>
                  {item.title}{" "}
                  <ChevronRight className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-90" />
                </CollapsibleTrigger>
              </SidebarGroupLabel>
              <CollapsibleContent>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {item.items.map((item) => (
                      <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton
                          asChild
                          isActive={checkIsActive(item.url)} // Check if the item is active
                        >
                          <a href={item.url}>{item.title}</a>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))}
                  </SidebarMenu>
                </SidebarGroupContent>
              </CollapsibleContent>
            </SidebarGroup>
          </Collapsible>
        ))}
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={userData.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
