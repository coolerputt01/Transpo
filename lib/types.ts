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
  verification_status: VerificationStatus;
  wallet_balance: number;
  created_at: string;
  updated_at: string;
};

export type Delivery = {
  id: string;
  seller_id: string | null;
  buyer_email: string;
  driver_id: string | null;
  storekeeper_id: string | null;
  title: string;
  pickup_address: string;
  delivery_address: string;
  amount: number;
  status: DeliveryStatus;
  failure_reason: string | null;
  created_at: string;
  updated_at: string;
};

export type Transaction = {
  id: string;
  payer_email: string;
  recipient_email: string;
  amount: number;
  type: string;
  status: TransactionStatus;
  delivery_id: string | null;
  payment_provider_ref: string | null;
  created_at: string;
};

export type DeliveryParticipant = { name: string; email: string } | null;

export type DeliveryWithParticipants = Delivery & {
  seller: DeliveryParticipant;
  driver: DeliveryParticipant;
  storekeeper: DeliveryParticipant;
};

export type SearchableProfile = Pick<
  Profile,
  "id" | "name" | "email" | "phone" | "role" | "verification_status"
>;