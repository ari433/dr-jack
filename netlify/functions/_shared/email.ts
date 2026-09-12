import { env } from "./env.js";
import { ApiError } from "./http.js";

type EmailOrder = Record<string, unknown>;

const esc = (v: unknown) => String(v ?? "").replace(/[&<>\"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]!));

export async function sendOrderEmail(order: EmailOrder) {
  const total = Number(order.total).toFixed(2);
  const html = `<h2>Porosi e re DrJack #${esc(order.order_id)}</h2><table cellpadding="7" style="border-collapse:collapse">
  <tr><td>Produkti</td><td><b>${esc(order.product)}</b></td></tr><tr><td>Varianti</td><td>${esc(order.variant)}</td></tr>
  <tr><td>Ngjyra</td><td>${esc(order.color)}</td></tr><tr><td>Madhesia</td><td>${esc(order.size)}</td></tr>
  <tr><td>Sasia</td><td>${esc(order.quantity)}</td></tr><tr><td>Cmimi</td><td>${esc(order.unit_price)} EUR</td></tr>
  <tr><td>Transporti</td><td>${esc(order.shipping)} EUR</td></tr><tr><td>Totali</td><td><b>${total} EUR</b></td></tr>
  <tr><td>Klienti</td><td>${esc(order.first_name)} ${esc(order.last_name)}</td></tr><tr><td>Telefoni</td><td>${esc(order.phone)}</td></tr>
  <tr><td>Adresa</td><td>${esc(order.street_address)}, ${esc(order.city)}</td></tr></table>`;
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { authorization: `Bearer ${env("RESEND_API_KEY")}`, "content-type": "application/json" },
    body: JSON.stringify({ from: env("RESEND_FROM"), to: [env("ORDER_EMAIL")], subject: `Porosi e re DrJack #${order.order_id}`, html })
  });
  const data = await response.json();
  if (!response.ok || !data?.id) throw new ApiError(502, "EMAIL_REJECTED", data);
  return String(data.id);
}
