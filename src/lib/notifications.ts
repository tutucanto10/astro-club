import { Resend } from "resend";

function getResend() {
  return new Resend(process.env.RESEND_API_KEY);
}

// onboarding@resend.dev funciona sem verificar domínio
const FROM = process.env.RESEND_FROM_EMAIL ?? "ASTRO <onboarding@resend.dev>";
const STORE_EMAIL = process.env.STORE_ALERT_EMAIL ?? "astrosuporte5@gmail.com";

const brl = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

function itemRows(items: Array<{ name: string; quantity: number; size?: string | null; color?: string | null; price: number }>) {
  return items.map((i) =>
    `<tr>
      <td style="padding:8px 0;border-bottom:1px solid #eee">
        ${i.name}${i.color ? ` — ${i.color}` : ""}${i.size && i.size !== "Único" ? ` / ${i.size}` : ""}
      </td>
      <td style="padding:8px 0;border-bottom:1px solid #eee;text-align:center">${i.quantity}</td>
      <td style="padding:8px 0;border-bottom:1px solid #eee;text-align:right">${brl(i.price * i.quantity)}</td>
    </tr>`
  ).join("");
}

// ─── Para o cliente: pedido recebido, aguardando pagamento PIX ────────────
export async function sendOrderReceivedEmail(order: {
  id: string;
  customerName: string;
  customerEmail: string;
  total: number;
  pixKey: string;
  items: Array<{ name: string; quantity: number; size?: string | null; color?: string | null; price: number }>;
}) {
  await getResend().emails.send({
    from: FROM,
    to: order.customerEmail,
    subject: `Pedido recebido — ASTRO #${order.id.slice(-8).toUpperCase()}`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;color:#111">
        <h1 style="font-size:22px;letter-spacing:3px;text-transform:uppercase;margin-bottom:4px">ASTRO</h1>
        <hr style="border:none;border-top:2px solid #111;margin:0 0 20px"/>

        <p style="color:#555">Olá, <strong>${order.customerName}</strong>! Seu pedido foi recebido.</p>
        <p style="font-size:13px;color:#888">Pedido #${order.id.slice(-8).toUpperCase()}</p>

        <table width="100%" style="border-collapse:collapse;margin:20px 0;font-size:14px">
          <thead>
            <tr style="background:#f5f5f5">
              <th style="padding:8px;text-align:left">Produto</th>
              <th style="padding:8px;text-align:center">Qtd</th>
              <th style="padding:8px;text-align:right">Valor</th>
            </tr>
          </thead>
          <tbody>${itemRows(order.items)}</tbody>
        </table>
        <p style="font-size:16px;font-weight:bold;margin-bottom:20px">Total: ${brl(order.total)}</p>

        <div style="background:#f9f9f9;border:1px solid #eee;padding:16px;margin-bottom:20px">
          <p style="margin:0 0 8px;font-size:13px;font-weight:bold;text-transform:uppercase;letter-spacing:1px">Como pagar via PIX</p>
          <p style="margin:4px 0;font-size:13px;color:#555">1. Abra o app do seu banco</p>
          <p style="margin:4px 0;font-size:13px;color:#555">2. Acesse <strong>PIX → Pagar → Chave PIX</strong></p>
          <p style="margin:4px 0;font-size:13px;color:#555">3. Chave (CNPJ): <strong style="font-family:monospace">${order.pixKey}</strong></p>
          <p style="margin:4px 0;font-size:13px;color:#555">4. Confirme o valor de <strong>${brl(order.total)}</strong></p>
          <p style="margin:8px 0 0;font-size:13px;color:#555">5. Envie o comprovante para o Instagram <strong>@astroclub.world</strong></p>
        </div>

        <p style="font-size:12px;color:#888">Após confirmarmos o pagamento, seu pedido será separado e enviado.</p>
        <p style="font-size:12px;color:#888">Dúvidas? Fale com a gente no Instagram.</p>
      </div>`,
  });
}

// ─── Para a loja: alerta de novo pedido com todos os dados ───────────────
export async function sendNewOrderAlert(order: {
  id: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  street: string;
  number: string;
  complement?: string | null;
  district: string;
  city: string;
  state: string;
  zipCode: string;
  total: number;
  paymentConfirmed: boolean;
  paymentMethod: "PIX" | "CARD";
  items: Array<{ name: string; quantity: number; size?: string | null; color?: string | null; price: number }>;
}) {
  const confirmed = order.paymentConfirmed;
  const statusBg    = confirmed ? "#d4edda" : "#fff3cd";
  const statusBorder = confirmed ? "#28a745" : "#e0a800";
  const statusColor  = confirmed ? "#155724" : "#856404";
  const statusText   = confirmed
    ? "✅ PAGAMENTO CONFIRMADO"
    : order.paymentMethod === "PIX"
    ? "⏳ AGUARDANDO PIX — pagamento NÃO confirmado"
    : "⏳ AGUARDANDO CARTÃO — pagamento NÃO confirmado";

  const subject = confirmed
    ? `✅ Pagamento confirmado — ASTRO #${order.id.slice(-8).toUpperCase()} — ${brl(order.total)}`
    : `⏳ PIX aguardando — ASTRO #${order.id.slice(-8).toUpperCase()} — ${brl(order.total)}`;

  await getResend().emails.send({
    from: FROM,
    to: STORE_EMAIL,
    subject,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;color:#111">
        <h1 style="font-size:20px;letter-spacing:2px;text-transform:uppercase;margin-bottom:8px">ASTRO — Novo Pedido</h1>
        <p style="color:#555;margin-bottom:12px">Pedido <strong>#${order.id.slice(-8).toUpperCase()}</strong></p>

        <div style="background:${statusBg};border:2px solid ${statusBorder};padding:12px 16px;margin-bottom:20px;border-radius:4px">
          <p style="margin:0;font-weight:bold;font-size:14px;color:${statusColor}">${statusText}</p>
        </div>

        <hr style="border:none;border-top:1px solid #eee;margin:12px 0"/>
        <p style="font-size:13px;font-weight:bold;text-transform:uppercase;letter-spacing:1px;margin-bottom:8px">Dados do cliente</p>
        <p style="margin:4px 0"><strong>Nome:</strong> ${order.customerName}</p>
        <p style="margin:4px 0"><strong>Email:</strong> ${order.customerEmail}</p>
        <p style="margin:4px 0"><strong>Telefone:</strong> ${order.customerPhone}</p>

        <hr style="border:none;border-top:1px solid #eee;margin:12px 0"/>
        <p style="font-size:13px;font-weight:bold;text-transform:uppercase;letter-spacing:1px;margin-bottom:8px">Endereço de entrega</p>
        <p style="margin:4px 0">${order.street}, ${order.number}${order.complement ? ` — ${order.complement}` : ""}</p>
        <p style="margin:4px 0">${order.district} — ${order.city}/${order.state}</p>
        <p style="margin:4px 0">CEP: ${order.zipCode}</p>

        <hr style="border:none;border-top:1px solid #eee;margin:12px 0"/>
        <p style="font-size:13px;font-weight:bold;text-transform:uppercase;letter-spacing:1px;margin-bottom:8px">Itens</p>
        <table width="100%" style="border-collapse:collapse;font-size:14px">
          <thead>
            <tr style="background:#f5f5f5">
              <th style="padding:8px;text-align:left">Produto</th>
              <th style="padding:8px;text-align:center">Qtd</th>
              <th style="padding:8px;text-align:right">Valor</th>
            </tr>
          </thead>
          <tbody>${itemRows(order.items)}</tbody>
        </table>
        <p style="font-size:17px;font-weight:bold;margin-top:12px">Total: ${brl(order.total)}</p>
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
    `💰 Total: ${brl(order.total)}\n` +
    `📦 Itens: ${order.itemCount}`;

  await fetch(
    `https://api.z-api.io/instances/${instanceId}/token/${token}/send-text`,
    { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ phone, message }) }
  ).catch(() => {});
}
