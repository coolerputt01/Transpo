import type { Delivery, Profile, Transaction, UserRole } from "@/lib/types";

export const roleLabels: Record<UserRole, string> = {
  buyer: "Buyer",
  seller: "Seller",
  driver: "Driver",
  storekeeper: "Storekeeper"
};

export const profiles: Profile[] = [
  {
    id: "usr_buyer_001",
    name: "Ada Buyer",
    email: "ada@example.com",
    phone: "08012345678",
    role: "buyer",
    verificationStatus: "pending",
    walletBalance: 85000
  },
  {
    id: "usr_seller_001",
    name: "Tokem Stores",
    email: "seller@tokemstores.com",
    phone: "08109359665",
    role: "seller",
    verificationStatus: "pending",
    walletBalance: 250000
  },
  {
    id: "usr_driver_001",
    name: "Swift Logistics",
    email: "driver@swiftlogistics.com",
    phone: "09087654321",
    role: "driver",
    verificationStatus: "pending",
    walletBalance: 52000
  },
  {
    id: "usr_storekeeper_001",
    name: "SafeHold Storage",
    email: "storekeeper@safehold.ng",
    phone: "07044556677",
    role: "storekeeper",
    verificationStatus: "pending",
    walletBalance: 41000
  }
];

export const transactions: Transaction[] = [
  {
    id: "TRX-1001",
    payer: "ada@example.com",
    recipient: "seller@tokemstores.com",
    amount: 45000,
    type: "buyer_to_seller",
    status: "held",
    deliveryId: "DLV-2091",
    createdAt: "2026-07-02"
  },
  {
    id: "TRX-1002",
    payer: "seller@tokemstores.com",
    recipient: "driver@swiftlogistics.com",
    amount: 3500,
    type: "seller_to_driver",
    status: "pending",
    deliveryId: "DLV-2091",
    createdAt: "2026-07-03"
  },
  {
    id: "TRX-1003",
    payer: "seller@tokemstores.com",
    recipient: "storekeeper@safehold.ng",
    amount: 2500,
    type: "seller_to_storekeeper",
    status: "released",
    deliveryId: "DLV-2088",
    createdAt: "2026-07-04"
  }
];

export const deliveries: Delivery[] = [
  {
    id: "DLV-2091",
    title: "Sneakers order",
    seller: "seller@tokemstores.com",
    buyer: "ada@example.com",
    driver: "driver@swiftlogistics.com",
    status: "in_transit",
    amount: 45000,
    pickupAddress: "Ikeja, Lagos",
    deliveryAddress: "Yaba, Lagos"
  },
  {
    id: "DLV-2088",
    title: "Phone accessories",
    seller: "seller@tokemstores.com",
    buyer: "guestbuyer@mail.com",
    driver: "driver@swiftlogistics.com",
    storekeeper: "storekeeper@safehold.ng",
    status: "stored",
    amount: 18000,
    pickupAddress: "Surulere, Lagos",
    deliveryAddress: "Lekki, Lagos",
    failureReason: "Buyer unavailable"
  }
];

export const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0
  }).format(amount);

export const getProfilesByRole = (role: UserRole) => profiles.filter((profile) => profile.role === role);
