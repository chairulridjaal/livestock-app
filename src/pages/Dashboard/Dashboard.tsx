import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input"; // Shadcn UI Input
import { Link } from "react-router-dom";

const Dashboard = () => {
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const dashboardItems = [
    {
      title: "Analytics",
      description: "See analytics and reports of your farm.",
      icon: "📈",
      link: "/analytics",
    },
    {
      title: "Livestock Management",
      description: "Manage all your livestock efficiently.",
      icon: "🐄",
      link: "/livestock",
    },
    {
      title: "Farm Settings",
      description: "Track and manage farm stock supplies.",
      icon: "🌾",
      link: "/farm",
    },
  ];

  // Filter dashboard items based on search query
  const filteredItems = dashboardItems.filter(item =>
    item.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-6">
      {/* Search Bar */}
      <div className="mb-6 flex justify-center">
        <Input
          placeholder="Search Dashboard..."
          value={searchQuery}
          onChange={handleSearch}
          className="w-96 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600"
        />
      </div>

      {/* Dashboard Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {filteredItems.map((item, index) => (
          <Link key={index} to={item.link} className="w-full">
            <Card className="hover:scale-105 transition-transform transform hover:shadow-xl">
              <CardHeader>
                <div className="flex justify-center items-center mb-4">
                  <span className="text-4xl text-blue-600">{item.icon}</span>
                </div>
                <CardTitle>{item.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  {item.description}
                </CardDescription>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;
