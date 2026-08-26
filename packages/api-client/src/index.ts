import { AxiosInstance } from 'axios';
import { createApiClient, ApiClientConfig, normalizeApiError } from './client';
import { createAuthApi } from './modules/auth.api';
import { createProductsApi } from './modules/products.api';
import { createOrdersApi } from './modules/orders.api';
import { createPaymentsApi } from './modules/payments.api';
import { createDeliveryApi } from './modules/delivery.api';
import { createChatApi } from './modules/chat.api';
import { createWalletApi } from './modules/wallet.api';
import { createReviewsApi } from './modules/reviews.api';
import { createKYCApi } from './modules/kyc.api';

export * from './client';
export * from './modules/auth.api';
export * from './modules/products.api';
export * from './modules/orders.api';
export * from './modules/payments.api';
export * from './modules/delivery.api';
export * from './modules/chat.api';
export * from './modules/wallet.api';
export * from './modules/reviews.api';
export * from './modules/kyc.api';

/**
 * Composite Wunabuy API SDK containing all strongly typed API client modules.
 */
export function createWunabuyApiSDK(config: ApiClientConfig) {
  const client: AxiosInstance = createApiClient(config);

  return {
    client,
    auth: createAuthApi(client),
    products: createProductsApi(client),
    orders: createOrdersApi(client),
    payments: createPaymentsApi(client),
    delivery: createDeliveryApi(client),
    chat: createChatApi(client),
    wallet: createWalletApi(client),
    reviews: createReviewsApi(client),
    kyc: createKYCApi(client),
  };
}
