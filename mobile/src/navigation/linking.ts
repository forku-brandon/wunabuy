import { LinkingOptions } from '@react-navigation/native';
import { RootStackParamList } from './types';

export const linkingConfig: LinkingOptions<RootStackParamList> = {
  prefixes: ['wunabuy://', 'https://wunabuy.com/app'],
  config: {
    screens: {
      ProductDetail: 'product/:productId',
      OrderTracking: 'track/:orderId',
      ChatConversation: 'chat/:conversationId',
      BuyerApp: {
        screens: {
          BuyerHome: 'home',
          BuyerSearch: 'search',
          BuyerCart: 'cart',
          BuyerOrders: 'orders',
          BuyerProfile: 'profile',
        },
      },
      SellerApp: {
        screens: {
          SellerDashboard: 'seller/dashboard',
          SellerProducts: 'seller/products',
          SellerOrders: 'seller/orders',
          SellerWallet: 'seller/wallet',
          SellerProfile: 'seller/profile',
        },
      },
      TransporterApp: {
        screens: {
          TransporterJobs: 'driver/jobs',
          TransporterActiveTrip: 'driver/trip',
          TransporterEarnings: 'driver/earnings',
          TransporterProfile: 'driver/profile',
        },
      },
    },
  },
};

