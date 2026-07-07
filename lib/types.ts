export type UserRole = "buyer" | "seller" | "driver" | "storekeeper";

export type VerificationStatus = "pending" | "verified" | "rejected";

export type DeliveryStatus =
  | "pending"
  | "in_transit"
  | "successful"
  | "failed"
  | "disputed"
  | "stored"
  | "returned"
  | "redelivery_planned";

export type TransactionStatus = "pending" | "held" | "released" | "failed" | "disputed";

export type Profile = {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  verificationStatus: VerificationStatus;
  walletBalance: number;
};

export type Transaction = {
  id: string;
  payer: string;
  recipient: string;
  amount: number;
  type: "buyer_to_seller" | "seller_to_driver" | "seller_to_storekeeper" | "withdrawal" | "wallet_funding";
  status: TransactionStatus;
  deliveryId?: string;
  createdAt: string;
};

export type Delivery = {
  id: string;
  title: string;
  seller: string;
  buyer: string;
  driver: string;
  storekeeper?: string;
  status: DeliveryStatus;
  amount: number;
  pickupAddress: string;
  deliveryAddress: string;
  failureReason?: string;
};
