const BASE_URL = "https://api.pagar.me/core/v5";

function getHeaders() {
  const auth = Buffer.from(`${process.env.PAGARME_API_KEY}:`).toString("base64");
  return {
    Authorization: `Basic ${auth}`,
    "Content-Type": "application/json",
  };
}

export interface PagarmeCustomer {
  name: string;
  email: string;
  phone?: string;
}

export interface PagarmeItem {
  amount: number; // centavos
  description: string;
  quantity: number;
  code: string;
}

export interface PagarmeCardData {
  number: string;
  holderName: string;
  expiryMonth: string;
  expiryYear: string;
  cvv: string;
}

export async function createPagarmeOrder(params: {
  orderId: string;
  customer: PagarmeCustomer;
  items: PagarmeItem[];
  amount: number; // centavos
  paymentMethod: "pix" | "boleto" | "credit_card";
  card?: PagarmeCardData;
}) {
  const { orderId, customer, items, amount, paymentMethod, card } = params;

  const payments: object[] = [];

  if (paymentMethod === "pix") {
    payments.push({ payment_method: "pix", pix: { expires_in: 3600 }, amount });
  } else if (paymentMethod === "boleto") {
    payments.push({
      payment_method: "boleto",
      boleto: {
        instructions: "Pague em qualquer banco ou casa lotérica.",
        due_at: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
      },
      amount,
    });
  } else if (paymentMethod === "credit_card" && card) {
    payments.push({
      payment_method: "credit_card",
      credit_card: {
        installments: 1,
        card: {
          number: card.number.replace(/\s/g, ""),
          holder_name: card.holderName,
          exp_month: card.expiryMonth,
          exp_year: card.expiryYear,
          cvv: card.cvv,
        },
      },
      amount,
    });
  }

  const rawPhone = customer.phone?.replace(/\D/g, "") ?? "";
  const body = {
    code: orderId,
    customer: {
      name: customer.name,
      email: customer.email,
      type: "individual",
      ...(rawPhone.length >= 10 && {
        phones: {
          mobile_phone: {
            country_code: "55",
            area_code: rawPhone.slice(0, 2),
            number: rawPhone.slice(2),
          },
        },
      }),
    },
    items,
    payments,
  };

  const res = await fetch(`${BASE_URL}/orders`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(`Pagar.me error ${res.status}: ${JSON.stringify(err)}`);
  }

  return res.json();
}

export function extractPaymentData(pagarmeOrder: any) {
  const charge = pagarmeOrder.charges?.[0];
  const tx = charge?.last_transaction;
  if (!tx) return {};

  return {
    pagarmeOrderId: pagarmeOrder.id as string,
    pixCode: tx.qr_code as string | undefined,
    pixQrCodeUrl: tx.qr_code_url as string | undefined,
    boletoUrl: tx.url as string | undefined,
    boletoBarcode: tx.barcode as string | undefined,
    status: pagarmeOrder.status as string,
  };
}
