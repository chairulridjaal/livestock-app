import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"; 
import { Input } from "@/components/ui/input"; // Import ShadCN UI Input component
import { Link } from "react-router-dom";

const Livestock = () => {
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  return (
    <div className="p-6">
      {/* Search Bar */}
      <div className="mb-6 flex justify-center">
        <Input
          placeholder="Search Livestock..."
          value={searchQuery}
          onChange={handleSearch}
          className="w-96 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600"
        />
      </div>

      {/* Cards for available pages */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {/* Livestock List Card */}
        <Link
          to="/livestock/list"
          className="w-full"
        >
          <Card className="hover:scale-105 transition-transform transform hover:shadow-xl">
            <CardHeader>
              <div className="flex justify-center items-center mb-4">
                <span className="text-4xl text-blue-600">📋</span>
              </div>
              <CardTitle>Livestock List</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                View all your livestock details.
              </CardDescription>
            </CardContent>
          </Card>
        </Link>

        {/* Record Card */}
        <Link
          to="/livestock/record"
          className="w-full"
        >
          <Card className="hover:scale-105 transition-transform transform hover:shadow-xl">
            <CardHeader>
              <div className="flex justify-center items-center mb-4">
                <span className="text-4xl text-blue-600">📝</span>
              </div>
              <CardTitle>Daily Record</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Record daily livestock activities and status.
              </CardDescription>
            </CardContent>
          </Card>
        </Link>

        {/* Add New Livestock Card */}
        <Link
          to="/livestock/add"
          className="w-full"
        >
          <Card className="hover:scale-105 transition-transform transform hover:shadow-xl">
            <CardHeader>
              <div className="flex justify-center items-center mb-4">
                <span className="text-4xl text-blue-600">➕</span>
              </div>
              <CardTitle>Add New Livestock</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Add new livestock to your farm's inventory.
              </CardDescription>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  );
};

export default Livestock;
