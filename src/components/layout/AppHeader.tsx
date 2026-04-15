import React from "react";
import { useNavigate } from "react-router-dom";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Bell, Search, DollarSign, ChevronDown, LogOut, User, Settings } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Separator } from "@/components/ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const AppHeader: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <header className="h-14 border-b border-border bg-card flex items-center px-4 gap-3 shrink-0">
      <SidebarTrigger className="-ml-1" />
      <Separator orientation="vertical" className="h-5" />

      {/* Search */}
      <div className="relative flex-1 max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search members, cards, transactions..."
          className="pl-9 h-9 bg-muted/50 border-transparent focus-visible:border-input focus-visible:bg-card text-sm"
        />
      </div>

      <div className="flex-1" />

      {/* Transaction summary chip */}
      <div className="hidden md:flex items-center gap-1.5 text-xs bg-secondary text-secondary-foreground px-3 py-1.5 rounded-md">
        <DollarSign className="h-3.5 w-3.5" />
        <span className="font-medium">RM 12,480</span>
        <span className="text-muted-foreground">today</span>
      </div>

      {/* Notifications */}
      <Button variant="ghost" size="icon" className="relative h-9 w-9">
        <Bell className="h-4 w-4" />
        <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-accent" />
      </Button>

      <Separator orientation="vertical" className="h-5" />

      {/* Profile dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="flex items-center gap-2.5 hover:bg-muted rounded-md px-2 py-1.5 transition-colors outline-none">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="text-xs font-semibold bg-primary/10 text-primary">
                {user?.name?.charAt(0) ?? "M"}
              </AvatarFallback>
            </Avatar>
            <div className="hidden md:block text-left">
              <p className="text-sm font-medium text-foreground leading-tight">{user?.name ?? user?.email ?? "Merchant"}</p>
              <p className="text-[11px] text-muted-foreground leading-tight">Owner</p>
            </div>
            <ChevronDown className="h-3.5 w-3.5 text-muted-foreground hidden md:block" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel className="font-normal">
            <p className="text-sm font-medium">{user?.name ?? "Merchant"}</p>
            <p className="text-xs text-muted-foreground">{user?.email}</p>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem className="cursor-pointer">
            <User className="mr-2 h-4 w-4" />
            My Profile
          </DropdownMenuItem>
          <DropdownMenuItem className="cursor-pointer">
            <Settings className="mr-2 h-4 w-4" />
            Settings
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-destructive focus:text-destructive">
            <LogOut className="mr-2 h-4 w-4" />
            Sign Out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
};

export default AppHeader;
