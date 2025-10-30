"use client"

import * as React from "react"
import Link from "next/link"
import {
  DollarSign,
  UserCircle2,
  UsersRound,
  ShieldCheck,
  FileText,
  CreditCard,
  Bell,
  BarChart3,
  LogOut,
  Home,
  Building2,
  Briefcase,
  Wallet,
} from "lucide-react"
import Cookies from "js-cookie"
import { useRouter } from "next/navigation"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"
import { TeamSwitcher } from "@/components/team-switcher"
import { NavUser } from "@/components/nav-user"
import { cn } from "@/lib/utils"

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const router = useRouter()

  const handleLogout = React.useCallback(() => {
    const cookieKeys = [
      "token",
      "is_customer",
      "is_biller",
      "is_superuser",
      "first_name",
      "last_name",
      "email",
    ]
    cookieKeys.forEach((key) => Cookies.remove(key, { path: "/" }))
    router.push("/auth/login")
  }, [router])

  const isCustomer = Cookies.get("is_customer") === "true"
  const isBiller = Cookies.get("is_biller") === "true"
  const isSuperuser = Cookies.get("is_superuser") === "true"

  const user = {
    name:
      (Cookies.get("first_name") && Cookies.get("last_name")
        ? `${Cookies.get("first_name")} ${Cookies.get("last_name")}`
        : "User") || "User",
    email: Cookies.get("email") || "user@example.com",
    avatar: "/avatars/shadcn.jpg",
  }

  let settings = [
    { name: "Dashboard", url: "/dashboard", icon: Home, color: "text-blue-500" },
    { name: "Users", url: "/dashboard/users", icon: UsersRound, color: "text-amber-500" },
    { name: "Groups", url: "/dashboard/group", icon: ShieldCheck, color: "text-green-600" },
    { name: "Permissions", url: "/dashboard/permission", icon: ShieldCheck, color: "text-green-700" },
    { name: "Customers", url: "/dashboard/customer", icon: UserCircle2, color: "text-cyan-600" },
    { name: "Billers", url: "/dashboard/biller", icon: Building2, color: "text-indigo-500" },
    { name: "Bills", url: "/dashboard/bill", icon: FileText, color: "text-orange-500" },
    { name: "Payments", url: "/dashboard/payment", icon: CreditCard, color: "text-emerald-500" },
    { name: "Notifications", url: "/dashboard/notification", icon: Bell, color: "text-purple-500" },
    { name: "Biller Reports", url: "/dashboard/biller_dashboard", icon: BarChart3, color: "text-pink-500" },
    { name: "Logout", url: "#", icon: LogOut, color: "text-red-500", onClick: handleLogout },
  ]

  if (isSuperuser) {
    settings = settings.filter((item) => item.name.toLowerCase() !== "dashboard")
  }

  if (isCustomer) {
    settings = settings.filter((item) =>
      ["Dashboard", "Payments", "Notifications", "Logout"].includes(item.name)
    )
  } else if (isBiller) {
    settings = settings.filter((item) =>
      ["Dashboard", "Customers", "Bills", "Logout"].includes(item.name)
    )
  }

  const teams = [
    { name: "Kacha Billing System", logo: DollarSign, plan: "management system" },
    { name: "Kacha Billing System", logo: Briefcase, plan: "" },
    { name: "Kacha Billing System", logo: Wallet, plan: "" },
  ]

  return (
    <Sidebar {...props}>
      {/* Header */}
      <SidebarHeader>
        <TeamSwitcher teams={teams} />
      </SidebarHeader>

      {/* Content */}
      <SidebarContent>
        <nav className="flex flex-col gap-1 px-2 py-4">
          {settings.map((item) =>
            item.onClick ? (
              <button
                key={item.name}
                onClick={item.onClick}
                className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-2 text-[15px] font-medium hover:bg-accent hover:text-accent-foreground transition-colors w-full text-left"
                )}
              >
                <item.icon className={cn("h-5 w-5", item.color)} />
                <span>{item.name}</span>
              </button>
            ) : (
              <Link
                key={item.name}
                href={item.url}
                className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-2 text-[15px] font-medium hover:bg-accent hover:text-accent-foreground transition-colors"
                )}
              >
                <item.icon className={cn("h-5 w-5", item.color)} />
                <span>{item.name}</span>
              </Link>
            )
          )}
        </nav>
      </SidebarContent>

      {/* Footer */}
      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  )
}
