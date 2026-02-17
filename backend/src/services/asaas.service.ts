import axios, { AxiosInstance } from 'axios';

const ASAAS_API_URL = process.env.ASAAS_API_URL || 'https://api-sandbox.asaas.com/v3';

// Railway interpreta $ como variável de ambiente, então a chave pode ser
// salva SEM o $ inicial (ex: aact_hmlg_...) e o código adiciona automaticamente
let ASAAS_API_KEY = process.env.ASAAS_API_KEY || '';
if (ASAAS_API_KEY && !ASAAS_API_KEY.startsWith('$aact_')) {
  if (ASAAS_API_KEY.startsWith('aact_')) {
    ASAAS_API_KEY = '$' + ASAAS_API_KEY;
    console.log('[ASAAS] Prefixo "$" adicionado automaticamente à chave API');
  }
}

if (!ASAAS_API_KEY) {
  console.error('[ASAAS] ERRO: ASAAS_API_KEY não está configurada!');
} else {
  const keyPreview = ASAAS_API_KEY.substring(0, 15) + '...' + ASAAS_API_KEY.substring(ASAAS_API_KEY.length - 5);
  console.log(`[ASAAS] API Key configurada: ${keyPreview} (${ASAAS_API_KEY.length} chars)`);
}

interface CreateCustomerData {
  name: string;
  cpfCnpj: string;
  email?: string;
  phone?: string;
  mobilePhone?: string;
  externalReference?: string;
}

interface AsaasCustomer {
  id: string;
  name: string;
  cpfCnpj: string;
  email: string;
  phone: string;
  mobilePhone: string;
  deleted: boolean;
}

interface CreditCardData {
  holderName: string;
  number: string;
  expiryMonth: string;
  expiryYear: string;
  ccv: string;
}

interface CreditCardHolderInfo {
  name: string;
  email: string;
  cpfCnpj: string;
  postalCode: string;
  addressNumber: string;
  phone?: string;
  mobilePhone?: string;
}

interface CreateSubscriptionData {
  customerId: string;
  billingType: 'CREDIT_CARD' | 'PIX' | 'BOLETO' | 'UNDEFINED';
  value: number;
  nextDueDate: string; // YYYY-MM-DD
  cycle: 'MONTHLY' | 'QUARTERLY' | 'SEMIANNUALLY' | 'YEARLY';
  description?: string;
  creditCard?: CreditCardData;
  creditCardHolderInfo?: CreditCardHolderInfo;
}

interface AsaasSubscription {
  id: string;
  customer: string;
  billingType: string;
  value: number;
  nextDueDate: string;
  cycle: string;
  status: string;
  deleted: boolean;
}

interface AsaasPayment {
  id: string;
  customer: string;
  subscription: string;
  billingType: string;
  value: number;
  netValue: number;
  status: string;
  dueDate: string;
  invoiceUrl: string;
  bankSlipUrl: string | null;
}

interface PixQrCode {
  encodedImage: string; // base64 da imagem QR code
  payload: string; // código copia-e-cola
  expirationDate: string;
}

export class AsaasService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: ASAAS_API_URL,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'greena-esg-platform',
        'access_token': ASAAS_API_KEY,
      },
    });
  }

  // ==================== CUSTOMERS ====================

  async createCustomer(data: CreateCustomerData): Promise<AsaasCustomer> {
    const response = await this.api.post('/customers', data);
    return response.data;
  }

  async getCustomer(customerId: string): Promise<AsaasCustomer> {
    const response = await this.api.get(`/customers/${customerId}`);
    return response.data;
  }

  async findCustomerByCpfCnpj(cpfCnpj: string): Promise<AsaasCustomer | null> {
    const response = await this.api.get('/customers', {
      params: { cpfCnpj },
    });
    if (response.data.data && response.data.data.length > 0) {
      return response.data.data[0];
    }
    return null;
  }

  // ==================== SUBSCRIPTIONS ====================

  async createSubscription(data: CreateSubscriptionData): Promise<AsaasSubscription> {
    const response = await this.api.post('/subscriptions', data);
    return response.data;
  }

  async getSubscription(subscriptionId: string): Promise<AsaasSubscription> {
    const response = await this.api.get(`/subscriptions/${subscriptionId}`);
    return response.data;
  }

  async cancelSubscription(subscriptionId: string): Promise<AsaasSubscription> {
    const response = await this.api.delete(`/subscriptions/${subscriptionId}`);
    return response.data;
  }

  async getSubscriptionPayments(subscriptionId: string): Promise<{ data: AsaasPayment[] }> {
    const response = await this.api.get(`/subscriptions/${subscriptionId}/payments`);
    return response.data;
  }

  // ==================== PAYMENTS ====================

  async getPayment(paymentId: string): Promise<AsaasPayment> {
    const response = await this.api.get(`/payments/${paymentId}`);
    return response.data;
  }

  async getPaymentPixQrCode(paymentId: string): Promise<PixQrCode> {
    const response = await this.api.get(`/payments/${paymentId}/pixQrCode`);
    return response.data;
  }

  async getPaymentStatus(paymentId: string): Promise<string> {
    const payment = await this.getPayment(paymentId);
    return payment.status;
  }
}
