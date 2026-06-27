import https from "https";

const BASE_URL = "https://cdpj.partners.bancointer.com.br";

function getMtlsAgent() {
  const cert = process.env.INTER_CERT_BASE64
    ? Buffer.from(process.env.INTER_CERT_BASE64, "base64").toString("utf-8")
    : undefined;
  const key = process.env.INTER_KEY_BASE64
    ? Buffer.from(process.env.INTER_KEY_BASE64, "base64").toString("utf-8")
    : undefined;

  return new https.Agent({ cert, key });
}

let cachedToken: { token: string; expiresAt: number } | null = null;

async function getAccessToken(): Promise<string> {
  if (cachedToken && Date.now() < cachedToken.expiresAt) {
    return cachedToken.token;
  }

  const agent = getMtlsAgent();
  const params = new URLSearchParams({
    client_id: process.env.INTER_CLIENT_ID!,
    client_secret: process.env.INTER_CLIENT_SECRET!,
    grant_type: "client_credentials",
    scope: "cob.write cob.read webhook.write webhook.read",
  });

  const res = await fetch(`${BASE_URL}/oauth/v2/token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: params.toString(),
    // @ts-ignore — Node.js agent for mTLS
    agent,
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Inter OAuth error ${res.status}: ${err}`);
  }

  const data = await res.json();
  cachedToken = {
    token: data.access_token,
    expiresAt: Date.now() + (data.expires_in - 60) * 1000,
  };
  return cachedToken.token;
}

export async function createPixCharge(params: {
  txid: string;
  amount: number; // R$ com decimais, ex: 189.90
  name: string;
  email: string;
  description?: string;
}) {
  const token = await getAccessToken();
  const agent = getMtlsAgent();

  const body = {
    calendario: { expiracao: 3600 },
    devedor: { nome: params.name, email: params.email },
    valor: { original: params.amount.toFixed(2) },
    chave: process.env.INTER_PIX_KEY!,
    infoAdicionais: [
      { nome: "Pedido", valor: params.txid.slice(-8).toUpperCase() },
    ],
  };

  const res = await fetch(`${BASE_URL}/pix/v2/cob/${params.txid}`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
    // @ts-ignore
    agent,
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Inter PIX error ${res.status}: ${err}`);
  }

  return res.json();
}

export async function getPixQrCode(loc: string): Promise<{ imagemQrcode: string; qrcode: string }> {
  const token = await getAccessToken();
  const agent = getMtlsAgent();

  const res = await fetch(`${BASE_URL}/pix/v2/loc/${loc}/qrcode`, {
    headers: { Authorization: `Bearer ${token}` },
    // @ts-ignore
    agent,
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Inter QRCode error ${res.status}: ${err}`);
  }

  return res.json();
}

export async function registerWebhook(pixKey: string, webhookUrl: string) {
  const token = await getAccessToken();
  const agent = getMtlsAgent();

  const res = await fetch(`${BASE_URL}/pix/v2/webhook/${pixKey}`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ webhookUrl }),
    // @ts-ignore
    agent,
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Inter webhook error ${res.status}: ${err}`);
  }
}
