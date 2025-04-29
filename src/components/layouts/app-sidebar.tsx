import * as React from "react";
import { ChevronRight, Tractor } from "lucide-react";
import { useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { SearchForm } from "@/components/layouts/search-form";
import { NavUser } from "@/components/layouts/nav-user";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
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
} from "@/components/ui/sidebar";

const data = {
  navMain: [
    {
      title: "Home",
      url: "/",
      items: [
        { title: "Dashboard", url: "/", isActive: false },
        { title: "Analytics", url: "/analytics", isActive: false },
        { title: "Farm", url: "/farm", isActive: false },
      ],
    },
    {
      title: "Livestock",
      url: "/",
      items: [
        { title: "Daily Recording", url: "/livestock/record", isActive: false },
        { title: "Livestock List", url: "/livestock/list", isActive: false },
        { title: "New Livestock", url: "/livestock/add", isActive: false },
      ],
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const location = useLocation();
  const { user } = useAuth();
  
  const [searchQuery, setSearchQuery] = React.useState("");

  const userData = {
    user: {
      name: user?.name || "User",
      email: user?.email || "",
      avatar: user?.avatar || (user?.name ? user.name[0] : ""),
    }
  };

  const checkIsActive = (itemUrl: string) => {
    return location.pathname.startsWith(itemUrl);
  };

  // Filter nav data based on search input
  const filteredData = data.navMain
    .map((section) => {
      const filteredItems = section.items.filter((item) =>
        item.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
      return { ...section, items: filteredItems };
    })
    .filter((section) => section.items.length > 0); // Only keep sections with matching items

  return (
    <Sidebar {...props}>
      <SidebarHeader>
        <SidebarMenuButton
          size="lg"
          className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
          onClick={() => window.location.href = '/'}
        >
          <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
            <Tractor className="size-6" />
          </div>
          <div className="flex flex-col gap-0.5 leading-none">
            <span className="font-bold">AgriVault</span>
          </div>
        </SidebarMenuButton>

        {/* Search input */}
        <SearchForm onSearchChange={setSearchQuery} />
      </SidebarHeader>

      <SidebarContent className="gap-0">
        {filteredData.length > 0 ? (
          filteredData.map((section) => (
            <Collapsible
              key={section.title}
              title={section.title}
              defaultOpen
              className="group/collapsible"
            >
              <SidebarGroup>
                <SidebarGroupLabel
                  asChild
                  className="group/label text-sm text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                >
                  <CollapsibleTrigger>
                    {section.title}{" "}
                    <ChevronRight className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-90" />
                  </CollapsibleTrigger>
                </SidebarGroupLabel>
                <CollapsibleContent
                  className="overflow-hidden transition-all duration-200 ease-in-out data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down"
                >
                  <SidebarGroupContent
                    className="relative pl-4 before:absolute before:top-0 before:bottom-0 before:left-3 before:w-px before:bg-slate-200 before:scale-y-0 before:origin-top before:transition-transform before:duration-500 group-data-[state=open]/collapsible:before:scale-y-100"
                  >
                  <SidebarMenu>
                      {section.items.map((item) => (
                        <SidebarMenuItem key={item.title}>
                          <SidebarMenuButton asChild isActive={checkIsActive(item.url)}>
                            <a href={item.url || "#"}>{item.title}</a>
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      ))}
                    </SidebarMenu>
                  </SidebarGroupContent>
                </CollapsibleContent>
              </SidebarGroup>
            </Collapsible>
          ))
        ) : (
          <div className="p-4 text-sm text-center text-muted-foreground">
            No results found.
          </div>
        )}
      </SidebarContent>

      <SidebarFooter>
        <NavUser user={userData.user} />
      </SidebarFooter>
      
      <SidebarRail />
    </Sidebar>
  );
}
