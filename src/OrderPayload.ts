export type OrderPayload = {
  public_key: string;
  tx_ref: string;
  amount: number;
  currency: "ETH";
  redirect_url?: string;
  meta?: Record<string, any>;
  customer?: {
    email: string;
    phone_number: string;
    name: string;
  };
  customizations?: {
    title: string;
    description: string;
    logo: string;
  };
};
