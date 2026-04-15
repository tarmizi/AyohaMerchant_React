import React from "react";
import {
  LayoutDashboard,
  Building2,
  Globe,
  CreditCard,
  Users,
  UserCheck,
  ClipboardCheck,
  Gift,
  Activity,
  History,
  PlusCircle,
  Settings,
  Stamp,
  Star,
  Percent,
  Trophy,
  Ticket,
  CalendarDays,
  Store,
  ChevronDown,
  Megaphone,
  ListOrdered,
  Bell,
  MessageSquare,
  Phone,
  MailCheck,
  ShoppingCart,
  PackagePlus,
  ClipboardList,
  BarChart3,
  Truck,
} from "lucide-react";
import { useLocation } from "react-router-dom";
import { NavLink } from "@/components/NavLink";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarHeader,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";

interface MenuItem {
  title: string;
  url: string;
  icon: React.ElementType;
  children?: { title: string; url: string; icon: React.ElementType }[];
}

const menuItems: MenuItem[] = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "My Account",
    url: "/account",
    icon: Building2,
    children: [
      { title: "Enterprise Info", url: "/account/enterprise-info", icon: Building2 },
      { title: "Enterprise Page", url: "/account/enterprise-page", icon: Globe },
      { title: "Membership Card Page", url: "/account/membership-card-page", icon: CreditCard },
      { title: "User List", url: "/account/user-list", icon: Users },
    ],
  },
  {
    title: "Membership",
    url: "/membership",
    icon: UserCheck,
    children: [
      { title: "Subscriber List", url: "/membership/subscribers", icon: Users },
      { title: "Approval List", url: "/membership/approvals", icon: ClipboardCheck },
      { title: "Reward Redemption", url: "/membership/redemptions", icon: Gift },
      { title: "Campaign Activity Log", url: "/membership/activity-log", icon: Activity },
      { title: "Payment History", url: "/membership/payments", icon: History },
    ],
  },
  {
    title: "Card Management",
    url: "/cards",
    icon: CreditCard,
    children: [
      { title: "Card List", url: "/cards/settings", icon: CreditCard },
      { title: "Create New Card", url: "/cards/new", icon: PlusCircle },
    ],
  },
  {
    title: "Campaign Setting",
    url: "/campaigns",
    icon: Trophy,
    children: [
      { title: "All Loyalty Programs", url: "/campaigns/loyalty-programs", icon: Star },
      { title: "Stamp Loyalty", url: "/campaigns/stamp-loyalty", icon: Stamp },
      { title: "Point Loyalty", url: "/campaigns/point-loyalty", icon: Star },
      { title: "Card Discount", url: "/campaigns/discount", icon: Percent },
      { title: "Contest Management", url: "/campaigns/contests", icon: Trophy },
      { title: "Voucher Setting", url: "/campaigns/vouchers", icon: Ticket },
      { title: "Event Setting", url: "/campaigns/events", icon: CalendarDays },
    ],
  },
  {
    title: "Advertisement",
    url: "/advertisements",
    icon: Megaphone,
    children: [
      { title: "My Advertisement List", url: "/advertisements/list", icon: ListOrdered },
      { title: "Create New Advertisement", url: "/advertisements/create", icon: PlusCircle },
    ],
  },
  {
    title: "Messaging Tools",
    url: "/messaging",
    icon: MessageSquare,
    children: [
      { title: "Push Notification", url: "/messaging/push", icon: Bell },
      { title: "SMS Blasting", url: "/messaging/sms", icon: Phone },
      { title: "WhatsApp Blasting", url: "/messaging/whatsapp", icon: MessageSquare },
      { title: "Messaging Activity Log", url: "/messaging/activity-log", icon: MailCheck },
    ],
  },
  {
    title: "Ayoha Store",
    url: "/store",
    icon: Store,
    children: [
      { title: "My Ayoha Store Setting", url: "/store/settings", icon: Settings },
      { title: "Delivery Charge Setting", url: "/store/delivery", icon: Truck },
      { title: "Client Shopping Cart", url: "/store/cart", icon: ShoppingCart },
      { title: "New Order", url: "/store/new-order", icon: PackagePlus },
      { title: "Order History", url: "/store/order-history", icon: ClipboardList },
      { title: "Payment History", url: "/store/payment-history", icon: History },
      { title: "Ayoha Store Statistic", url: "/store/statistics", icon: BarChart3 },
    ],
  },
];

function isGroupActive(item: MenuItem, pathname: string) {
  if (pathname === item.url) return true;
  return item.children?.some((c) => pathname.startsWith(c.url)) ?? false;
}

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();
  const currentPath = location.pathname;

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border">
      {/* Merchant branding header */}
      <SidebarHeader className="border-b border-sidebar-border px-4 py-4">
        <div className="flex items-center gap-3">
          <Avatar className="h-9 w-9 shrink-0 rounded-lg">
            <AvatarFallback className="rounded-lg gradient-primary text-primary-foreground text-xs font-bold">
              AR
            </AvatarFallback>
          </Avatar>
          {!collapsed && (
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-sidebar-foreground truncate">
                Ayoha Reward
              </p>
              <p className="text-xs text-muted-foreground truncate">
                Demo Merchant
              </p>
            </div>
          )}
        </div>
      </SidebarHeader>

      {/* Scrollable nav */}
      <SidebarContent>
        <ScrollArea className="flex-1">
          <SidebarGroup>
            <SidebarGroupLabel className="text-[11px] uppercase tracking-wider text-muted-foreground/70 font-medium">
              Navigation
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {menuItems.map((item) => {
                  if (!item.children) {
                    // Simple link
                    return (
                      <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton asChild>
                          <NavLink
                            to={item.url}
                            end
                            className="hover:bg-sidebar-accent"
                            activeClassName="bg-sidebar-accent text-sidebar-primary font-medium"
                          >
                            <item.icon className="h-4 w-4 shrink-0" />
                            {!collapsed && <span>{item.title}</span>}
                          </NavLink>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  }

                  // Collapsible group
                  const active = isGroupActive(item, currentPath);
                  return (
                    <Collapsible
                      key={item.title}
                      defaultOpen={active}
                      className="group/collapsible"
                    >
                      <SidebarMenuItem>
                        <CollapsibleTrigger asChild>
                          <SidebarMenuButton
                            className={cn(
                              "hover:bg-sidebar-accent",
                              active && "text-sidebar-primary font-medium"
                            )}
                          >
                            <item.icon className="h-4 w-4 shrink-0" />
                            {!collapsed && (
                              <>
                                <span className="flex-1">{item.title}</span>
                                <ChevronDown className="h-3.5 w-3.5 text-muted-foreground transition-transform group-data-[state=open]/collapsible:rotate-180" />
                              </>
                            )}
                          </SidebarMenuButton>
                        </CollapsibleTrigger>
                        {!collapsed && (
                          <CollapsibleContent>
                            <SidebarMenuSub>
                              {item.children.map((child) => (
                                <SidebarMenuSubItem key={child.title}>
                                  <SidebarMenuSubButton asChild>
                                    <NavLink
                                      to={child.url}
                                      className="hover:bg-sidebar-accent text-muted-foreground"
                                      activeClassName="bg-sidebar-accent text-sidebar-primary font-medium"
                                    >
                                      <child.icon className="h-3.5 w-3.5 shrink-0" />
                                      <span>{child.title}</span>
                                    </NavLink>
                                  </SidebarMenuSubButton>
                                </SidebarMenuSubItem>
                              ))}
                            </SidebarMenuSub>
                          </CollapsibleContent>
                        )}
                      </SidebarMenuItem>
                    </Collapsible>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </ScrollArea>
      </SidebarContent>

      {/* Footer */}
      <SidebarFooter className="border-t border-sidebar-border px-4 py-3">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <Store className="h-4 w-4 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">Business Portal</span>
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
