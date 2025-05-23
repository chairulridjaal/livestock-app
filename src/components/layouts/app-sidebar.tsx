import * as React from "react";
import { useEffect } from "react";
import { GalleryVerticalEnd, Leaf, House, Tractor, Wheat} from "lucide-react";
import { useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { SearchForm } from "@/components/layouts/search-form";
import { NavMain } from "@/components/layouts/nav-main";
import { NavUser } from "@/components/layouts/nav-user";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarRail,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { TeamSwitcher } from "../ui/team-switcher";

const data = {
  navMain: [
    {
      title: "Home",
      url: "/",
      icon: House,
      items: [
        { title: "Dashboard", url: "/", isActive: false },      ],
    },
    {
      title: "Farm",
      url: "/",
      icon: Tractor,
      items: [
        { title: "Farm Overview", url: "/farm/overview", isActive: false },
        { title: "Manage Stock", url: "/farm/manage", isActive: false },      
        { title: "Farm Settings", url: "/farm/settings", isActive: false },
      ],
    },
    {
      title: "Livestock",
      url: "/",
    icon: Wheat,
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
  type Farm = {
    id: string;
    name: string;
    logo: React.ElementType;
    plan: string;
  };
  const [farms, setFarms] = React.useState<Farm[]>([]);

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

  useEffect(() => {
    const fetchFarms = async () => {
      if (!user?.uid) return;

      try {
        const userRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
          const userData = userSnap.data();
          const farmIds: string[] = userData.farms || [];
          const currentFarmId: string = userData.currentFarm;

          const farmDataList: {
            id: string;
            name: string;
            logo: React.ElementType;
            plan: string;
          }[] = [];

          for (const id of farmIds) {
            const farmRef = doc(db, "farms", id);
            const farmSnap = await getDoc(farmRef);

            farmDataList.push({
              id,
              name: farmSnap.exists() ? farmSnap.data().farmName || "Unnamed Farm" : `Unknown Farm (${id.slice(-4)})`,
              logo: GalleryVerticalEnd,
              plan: farmSnap.exists() ? farmSnap.data().plan || "Free" : "Free",
            });
          }

          const sortedFarms = farmDataList.sort((a, b) => {
            return a.id === currentFarmId ? -1 : b.id === currentFarmId ? 1 : 0;
          });

          setFarms(sortedFarms);
        }
      } catch (err) {
        console.error("Error fetching farms:", err);
      }
    };

    fetchFarms();
  }, [user]);

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
        <TeamSwitcher teams={farms} />
      </SidebarHeader>
      <SidebarContent className="gap-0">
        <SearchForm onSearchChange={setSearchQuery} />
        <NavMain items={filteredData} />
      </SidebarContent>

      <SidebarFooter>
        <NavUser user={userData.user} />
      </SidebarFooter>
      
      <SidebarRail />
    </Sidebar>
  );
}