"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function BurgerMenu() {
  const pathname = usePathname();
  const router = useRouter();
  
  // Define menu items with paths for highlighting
  const menuItems = [
    { label: "Profile", path: "/profile" },
    { label: "Dashboard", path: "/dashboard" },
    { label: "Explore", path: "/explore" },
  ];

  const handleLogout = () => {
    localStorage.removeItem("access_token")
    router.push("/auth/login")
  }

  
  // Check if path is current to determine highlighting
  const isCurrentPath = (path: string) => {
    return pathname === path;
  };
  
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <Menu className="h-6 w-6" />
          <span className="sr-only">Open menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {menuItems.map((item) => (
          <DropdownMenuItem key={item.path} asChild>
            <Link 
              href={item.path} 
              className={isCurrentPath(item.path) ? "bg-purple-50 text-purple-700 font-medium" : ""}
            >
              {item.label}
              {isCurrentPath(item.path) && (
                <span className="ml-2 h-2 w-2 rounded-full bg-purple-500"></span>
              )}
            </Link>
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem 
          onClick={handleLogout} 
          className="text-red-500 cursor-pointer"
        >
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}