import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const ASAAS_WEBHOOK_TOKEN = process.env.ASAAS_WEBHOOK_TOKEN || '';

export class AsaasWebhookController {
  /**
   * Recebe e processa webhooks do Asaas
   * POST /api/webhooks/asaas
   */
  async handleWebhook(req: Request, res: Response) {
    // Validar token do webhook
    const receivedToken = req.headers['asaas-access-token'];
    if (ASAAS_WEBHOOK_TOKEN && receivedToken !== ASAAS_WEBHOOK_TOKEN) {
      console.warn('Webhook Asaas: token inválido recebido');
      return res.status(401).json({ error: 'Token inválido' });
    }

    const { event, payment } = req.body;

    console.log(`[Webhook Asaas] Evento recebido: ${event}`);

    try {
      switch (event) {
        case 'PAYMENT_CONFIRMED':
        case 'PAYMENT_RECEIVED':
          await this.handlePaymentConfirmed(payment);
          break;

        case 'PAYMENT_OVERDUE':
          await this.handlePaymentOverdue(payment);
          break;

        case 'PAYMENT_DELETED':
        case 'PAYMENT_REFUNDED':
          await this.handlePaymentCancelled(payment);
          break;

        case 'PAYMENT_CREATED':
          console.log(`[Webhook Asaas] Novo pagamento criado: ${payment?.id}`);
          break;

        default:
          console.log(`[Webhook Asaas] Evento não tratado: ${event}`);
      }

      // Responder 200 rapidamente para o Asaas
      res.status(200).json({ received: true });
    } catch (error) {
      console.error('[Webhook Asaas] Erro ao processar evento:', error);
      // Ainda retorna 200 para evitar retentativas
      res.status(200).json({ received: true, error: 'Erro interno ao processar' });
    }
  }

  /**
   * Pagamento confirmado/recebido - ativa a assinatura
   */
  private async handlePaymentConfirmed(payment: any) {
    if (!payment?.subscription) {
      console.log('[Webhook Asaas] Pagamento sem subscription associada, ignorando');
      return;
    }

    const subscription = await prisma.userSubscription.findFirst({
      where: { asaasSubscriptionId: payment.subscription }
    });

    if (!subscription) {
      console.warn(`[Webhook Asaas] Assinatura não encontrada para subscription ID: ${payment.subscription}`);
      return;
    }

    // Ativar assinatura se estava pendente
    if (subscription.status === 'pending_payment') {
      await prisma.userSubscription.update({
        where: { id: subscription.id },
        data: {
          status: 'active',
          updatedAt: new Date(),
        }
      });
      console.log(`[Webhook Asaas] Assinatura ${subscription.id} ativada via pagamento ${payment.id}`);
    }
  }

  /**
   * Pagamento em atraso - marca como overdue
   */
  private async handlePaymentOverdue(payment: any) {
    if (!payment?.subscription) return;

    const subscription = await prisma.userSubscription.findFirst({
      where: { asaasSubscriptionId: payment.subscription }
    });

    if (!subscription) return;

    await prisma.userSubscription.update({
      where: { id: subscription.id },
      data: {
        status: 'overdue',
        updatedAt: new Date(),
      }
    });
    console.log(`[Webhook Asaas] Assinatura ${subscription.id} marcada como inadimplente`);
  }

  /**
   * Pagamento cancelado/estornado
   */
  private async handlePaymentCancelled(payment: any) {
    if (!payment?.subscription) return;

    const subscription = await prisma.userSubscription.findFirst({
      where: { asaasSubscriptionId: payment.subscription }
    });

    if (!subscription) return;

    // Só cancela se não tiver sido reativada por outro pagamento
    if (subscription.status !== 'active') {
      await prisma.userSubscription.update({
        where: { id: subscription.id },
        data: {
          status: 'cancelled',
          updatedAt: new Date(),
        }
      });
      console.log(`[Webhook Asaas] Assinatura ${subscription.id} cancelada`);
    }
  }
}
