/**
 * Avança uma data de expiração em um ciclo de cobrança.
 *
 * Renovação parte da expiração atual quando ela ainda está no futuro (para não
 * encurtar o período já pago) e de agora quando já venceu. Retorna null para
 * ciclos sem expiração definida.
 */
export function addBillingCycle(
  current: Date | null,
  billingCycle: string,
  now: Date = new Date()
): Date | null {
  if (billingCycle !== 'monthly' && billingCycle !== 'yearly') {
    return null;
  }

  const base = current && current > now ? new Date(current) : new Date(now);

  if (billingCycle === 'yearly') {
    base.setFullYear(base.getFullYear() + 1);
    return base;
  }

  // Somar mês em JS estoura o dia (31/01 + 1 mês = 03/03). Quando isso
  // acontece, volta para o último dia do mês pretendido.
  const dayOfMonth = base.getDate();
  base.setMonth(base.getMonth() + 1);
  if (base.getDate() < dayOfMonth) {
    base.setDate(0);
  }

  return base;
}
