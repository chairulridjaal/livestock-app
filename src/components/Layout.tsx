import { Link, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi"; 

function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const navigate = useNavigate();

  const [isLivestockOpen, setIsLivestockOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const isActive = (path: string) => location.pathname === path;

  const isLivestockSection = ["/add-animal", "/animal-list", "/record"].some(path =>
    location.pathname.startsWith(path)
  );

  const handleLivestockClick = () => {
    const newOpen = !isLivestockOpen;
    setIsLivestockOpen(newOpen);
  };

  useEffect(() => {
    setIsLivestockOpen(isLivestockSection);
  }, [location.pathname]);

  return (
    <div className="h-screen flex flex-col border border-gray-300 bg-black">
      {/* Header */}
      <header className="flex justify-between items-center p-4 bg-white shadow">
        {/* Left section: logo and burger */}
        <div className="flex items-center space-x-4">
          <div
            className="text-xl font-bold text-blue-600 flex items-center space-x-2"
            onClick={() => navigate("/")}
          >
            <span role="img" aria-label="cow">🐄</span>
            <span>Livestock App</span>
          </div>
          <button
            className="text-blue-600"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            {sidebarOpen ? "☰" : "☰"}
          </button>
        </div>

        {/* Right section: greeting */}
        <div className="text-sm text-gray-600">Hello, Ridjal!</div>
      </header>



      <div className="flex flex-1">
        {/* Sidebar */}
        <aside
          className={`group relative transition-all duration-300 ease-in-out h-full bg-gray-100 
            ${sidebarOpen ? "w-64" : "w-16"} hover:w-64`}
          onMouseEnter={() => setSidebarOpen(true)}
          onMouseLeave={() => setSidebarOpen(false)}
        >
          <nav className="flex flex-col space-y-2 pt-2">

            {/* Dashboard */}
            <Link
              to="/"
              className={`flex items-center space-x-2 px-4 py-2 text-blue-600 hover:font-bold 
                ${isActive("/") ? "font-bold text-blue-700" : ""}`}
            >
              <span>🏠</span>
              {sidebarOpen && <span>Dashboard</span>}
            </Link>

            {/* Farm */}
            <Link
              to="/farm"
              className={`flex items-center space-x-2 px-4 py-2 text-blue-600 hover:font-bold 
                ${isActive("/farm") ? "font-bold text-blue-700" : ""}`}
            >
              <span>🌾</span>
              {sidebarOpen && <span>Farm</span>}
            </Link>

            {/* Livestock Dropdown */}
            <div className="px-2">
              <button
                onClick={handleLivestockClick}
                className="w-full flex items-center justify-between text-blue-600 hover:font-bold px-2 py-2"
              >
                <div className="flex items-center space-x-2">
                  <span>🐄</span>
                  {sidebarOpen && <span className={isLivestockSection ? "font-bold text-blue-700" : ""}>Livestock</span>}
                </div>
                {sidebarOpen && <span>{isLivestockOpen ? "▲" : "<"}</span>}
              </button>

              {isLivestockOpen && (
                <ul className="space-y-1 mt-1">
                  <li>
                    <Link
                      to="/animal-list"
                      className={`flex items-center px-2 py-1 text-blue-600 hover:font-bold
                        ${isActive("/animal-list") ? "font-bold text-blue-700" : ""}`}
                    >
                      <span className="w-6 text-center">📋</span>
                      {sidebarOpen && <span className="ml-2">Livestock List</span>}
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/add-animal"
                      className={`flex items-center px-2 py-1 text-blue-600 hover:font-bold
                        ${isActive("/add-animal") ? "font-bold text-blue-700" : ""}`}
                    >
                      <span className="w-6 text-center">➕</span>
                      {sidebarOpen && <span className="ml-2">New Livestock</span>}
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/record"
                      className={`flex items-center px-2 py-1 text-blue-600 hover:font-bold
                        ${isActive("/record") ? "font-bold text-blue-700" : ""}`}
                    >
                      <span className="w-6 text-center">📝</span>
                      {sidebarOpen && <span className="ml-2">Daily Recording</span>}
                    </Link>
                  </li>
                </ul>
              )}
            </div>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6 overflow-auto bg-gray-50">{children}</main>
      </div>
    </div>
  );
}

export default Layout;
