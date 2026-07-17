import { Resend } from "resend";

function getResend() {
  return new Resend(process.env.RESEND_API_KEY);
}
const FROM = process.env.RESEND_FROM_EMAIL ?? "ASTRO <pedidos@astrobrand.com>";

export async function sendOrderConfirmedEmail(order: {
  id: string;
  customerName: string;
  customerEmail: string;
  items: Array<{ name: string; quantity: number; price: number }>;
  total: number;
}) {
  const rows = order.items
    .map(
      (i) =>
        `<tr>
          <td style="padding:8px 0;border-bottom:1px solid #eee">${i.name}</td>
          <td style="padding:8px 0;border-bottom:1px solid #eee;text-align:center">${i.quantity}</td>
          <td style="padding:8px 0;border-bottom:1px solid #eee;text-align:right">R$ ${(i.price * i.quantity).toFixed(2).replace(".", ",")}</td>
        </tr>`
    )
    .join("");

  await getResend().emails.send({
    from: FROM,
    to: order.customerEmail,
    subject: `Pedido confirmado — ASTRO`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;color:#111">
        <h1 style="font-size:22px;letter-spacing:2px;text-transform:uppercase;margin-bottom:4px">Pedido confirmado</h1>
        <p style="color:#555;margin-top:0">Olá, ${order.customerName}. Seu pagamento foi confirmado!</p>
        <p style="font-size:13px;color:#888">Pedido #${order.id.slice(-8).toUpperCase()}</p>
        <table width="100%" style="border-collapse:collapse;margin:20px 0;font-size:14px">
          <thead>
            <tr style="background:#f5f5f5">
              <th style="padding:8px;text-align:left">Produto</th>
              <th style="padding:8px;text-align:center">Qtd</th>
              <th style="padding:8px;text-align:right">Valor</th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
        <p style="font-size:15px;font-weight:bold">Total: R$ ${order.total.toFixed(2).replace(".", ",")}</p>
        <p style="font-size:12px;color:#888">Você receberá outra notificação quando seu pedido for enviado.</p>
      </div>`,
  });
}

export async function sendOrderShippedEmail(order: {
  id: string;
  customerName: string;
  customerEmail: string;
  trackingCode?: string;
}) {
  await getResend().emails.send({
    from: FROM,
    to: order.customerEmail,
    subject: `Seu pedido foi enviado — ASTRO`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;color:#111">
        <h1 style="font-size:22px;letter-spacing:2px;text-transform:uppercase;margin-bottom:4px">Pedido enviado!</h1>
        <p style="color:#555;margin-top:0">Olá, ${order.customerName}. Seu pedido foi despachado.</p>
        <p style="font-size:13px;color:#888">Pedido #${order.id.slice(-8).toUpperCase()}</p>
        ${order.trackingCode ? `<p>Código de rastreio: <strong>${order.trackingCode}</strong></p>` : ""}
        <p style="font-size:12px;color:#888">Prazo de entrega estimado: 5 a 10 dias úteis.</p>
      </div>`,
  });
}

export async function sendNewOrderAlert(order: {
  id: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  total: number;
  items: Array<{ name: string; quantity: number; size?: string | null; color?: string | null; price: number }>;
}) {
  const storeEmail = process.env.STORE_ALERT_EMAIL ?? "astrosuporte5@gmail.com";

  const rows = order.items
    .map(
      (i) =>
        `<tr>
          <td style="padding:8px 0;border-bottom:1px solid #eee">${i.name}${i.color ? ` — ${i.color}` : ""}${i.size ? ` / ${i.size}` : ""}</td>
          <td style="padding:8px 0;border-bottom:1px solid #eee;text-align:center">${i.quantity}</td>
          <td style="padding:8px 0;border-bottom:1px solid #eee;text-align:right">R$ ${(i.price * i.quantity).toFixed(2).replace(".", ",")}</td>
        </tr>`
    )
    .join("");

  await getResend().emails.send({
    from: FROM,
    to: storeEmail,
    subject: `🛍️ Novo pedido ASTRO — #${order.id.slice(-8).toUpperCase()}`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;color:#111">
        <h1 style="font-size:20px;letter-spacing:2px;text-transform:uppercase">Novo Pedido!</h1>
        <p style="color:#555">Pedido <strong>#${order.id.slice(-8).toUpperCase()}</strong> recebido via PIX.</p>
        <hr style="border:none;border-top:1px solid #eee;margin:16px 0"/>
        <p style="margin:4px 0"><strong>Cliente:</strong> ${order.customerName}</p>
        <p style="margin:4px 0"><strong>Email:</strong> ${order.customerEmail}</p>
        <p style="margin:4px 0"><strong>Telefone:</strong> ${order.customerPhone}</p>
        <table width="100%" style="border-collapse:collapse;margin:20px 0;font-size:14px">
          <thead>
            <tr style="background:#f5f5f5">
              <th style="padding:8px;text-align:left">Produto</th>
              <th style="padding:8px;text-align:center">Qtd</th>
              <th style="padding:8px;text-align:right">Valor</th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
        <p style="font-size:16px;font-weight:bold">Total: R$ ${order.total.toFixed(2).replace(".", ",")}</p>
        <p style="font-size:12px;color:#888">Pagamento PIX pendente — será confirmado automaticamente.</p>
      </div>`,
  });
}

export async function sendOrderWhatsApp(order: {
  id: string;
  customerName: string;
  total: number;
  paymentMethod: string;
  itemCount: number;
}) {
  const instanceId = process.env.ZAPI_INSTANCE_ID;
  const token = process.env.ZAPI_TOKEN;
  const phone = process.env.STORE_WHATSAPP_PHONE;

  if (!instanceId || !token || !phone) return;

  const message =
    `🛍️ *Novo Pedido ASTRO*\n\n` +
    `📋 Pedido: #${order.id.slice(-8).toUpperCase()}\n` +
    `👤 Cliente: ${order.customerName}\n` +
    `💰 Total: R$ ${order.total.toFixed(2).replace(".", ",")}\n` +
    `💳 Pagamento: PIX\n` +
    `📦 Itens: ${order.itemCount}`;

  await fetch(
    `https://api.z-api.io/instances/${instanceId}/token/${token}/send-text`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone, message }),
    }
  ).catch(() => {});
}
