import type { UserRole } from "@/lib/types";

type NavItem = {
  label: string;
  href: string;
  roles: UserRole[];
};

export const roleDashboardCopy: Record<UserRole, { title: string; summary: string; actions: string[] }> = {
  buyer: {
    title: "Buyer dashboard",
    summary: "Search sellers by email, fund your wallet, track deliveries, and confirm escrow release.",
    actions: ["Search seller", "View deliveries", "Confirm escrow delivery", "Withdraw"]
  },
  seller: {
    title: "Seller dashboard",
    summary: "Track buyer payments, deliveries, logistics partners, storekeepers, and wallet activity.",
    actions: ["Search driver or storekeeper", "View deliveries", "Fund wallet", "Withdraw"]
  },
  driver: {
    title: "Driver dashboard",
    summary: "View delivery jobs, update statuses, and track earnings from sellers.",
    actions: ["View deliveries", "Transactions", "Withdraw"]
  },
  storekeeper: {
    title: "Storekeeper dashboard",
    summary: "Manage failed-delivery holding requests, stored goods, fees, and withdrawal activity.",
    actions: ["View deliveries", "Transactions", "Withdraw"]
  }
};

export const navItems: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", roles: ["buyer", "seller", "driver", "storekeeper"] },
  { label: "Transactions", href: "/transactions", roles: ["buyer", "seller", "driver", "storekeeper"] },
  { label: "Deliveries", href: "/deliveries", roles: ["buyer", "seller", "driver", "storekeeper"] },
  { label: "Fund wallet", href: "/wallet/fund", roles: ["buyer", "seller"] },
  { label: "Find seller", href: "/search/seller", roles: ["buyer"] },
  { label: "Find partners", href: "/search/partners", roles: ["seller"] },
  { label: "Confirm delivery", href: "/escrow/confirm-delivery", roles: ["buyer"] },
  { label: "Withdraw", href: "/withdraw", roles: ["buyer", "seller", "driver", "storekeeper"] },
  { label: "Profile", href: "/profile", roles: ["buyer", "seller", "driver", "storekeeper"] }
];
