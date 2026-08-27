import { UserRole } from '@wunabuy/types';

export type AuthStackParamList = {
  Welcome: undefined;
  Login: undefined;
  VerifyOTP: { phone: string };
  Register: { phone: string };
};

export type BuyerTabParamList = {
  BuyerHome: undefined;
  BuyerSearch: { category?: string; query?: string } | undefined;
  BuyerCart: undefined;
  BuyerOrders: { status?: string } | undefined;
  BuyerProfile: undefined;
};

export type SellerTabParamList = {
  SellerDashboard: undefined;
  SellerProducts: undefined;
  SellerOrders: undefined;
  SellerWallet: undefined;
  SellerProfile: undefined;
};

export type TransporterTabParamList = {
  TransporterJobs: undefined;
  TransporterActiveTrip: { jobId?: string } | undefined;
  TransporterEarnings: undefined;
  TransporterProfile: undefined;
};

export type RootStackParamList = {
  Auth: undefined;
  BuyerApp: undefined;
  SellerApp: undefined;
  TransporterApp: undefined;
  ProductDetail: { productId: string };
  OrderTracking: { orderId: string };
  ChatConversation: { conversationId: string };
  NotificationSettings: undefined;
  AddressManager: undefined;
  Settings: undefined;
  SellerWelcome: undefined;
  StoreKYC: { role?: string } | undefined;
  AddEditProduct: { product?: any } | undefined;
  CheckoutPayment: { subtotal: number; addressId?: string };
  OrderSuccess: { orderCode: string; totalAmount: number; provider: string; phone: string };
};

