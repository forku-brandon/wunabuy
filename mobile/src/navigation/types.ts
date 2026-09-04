import { UserRole } from '@wunabuy/types';

export type AuthStackParamList = {
  Welcome: undefined;
  Login: { mode?: 'register' | 'login' } | undefined;
  VerifyOTP: { phone: string; mode?: 'register' | 'login' };
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
  BuyerWallet: undefined;
  SellerWelcome: undefined;
  StoreKYC: { role?: string } | undefined;
  TransporterWelcome: undefined;
  TransporterKYC: { role?: string } | undefined;
  AddEditProduct: { product?: any } | undefined;
  CheckoutPayment: { subtotal: number; addressId?: string };
  OrderSuccess: { orderCode: string; totalAmount: number; provider: string; phone: string };
  FollowedStores: undefined;
  Favorites: undefined;
  Footprint: undefined;
  Refunds: undefined;
  TransactionHistory: undefined;
  StoreAnalytics: undefined;
};



