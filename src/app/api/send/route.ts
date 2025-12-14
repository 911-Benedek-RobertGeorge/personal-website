import { NextResponse } from 'next/server'
import { Resend } from 'resend'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const name = String(body?.name || '').trim()
    const email = String(body?.email || '').trim()
    const phone = String(body?.phone || '').trim()
    const goal = String(body?.goal || '').trim()

    if (!name || !email) {
      return NextResponse.json({ error: 'Missing name or email' }, { status: 400 })
    }

    if (!process.env.RESEND_API_KEY) {
      return NextResponse.json({ error: 'Missing RESEND_API_KEY' }, { status: 500 })
    }

    const resend = new Resend(process.env.RESEND_API_KEY as string)

    const html = `
      <div style="font-family: Inter, system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif; color:#0A2540;">
        <h2 style="margin:0 0 12px 0;">Solicitare nouă de la ${name}</h2>
        <div style="background:#f6f9fc; padding:12px; border-radius:8px;">
          <p style="margin:0 0 6px 0;"><strong>Nume:</strong> ${name}</p>
          <p style="margin:0 0 6px 0;"><strong>Email:</strong> ${email}</p>
          ${phone ? `<p style="margin:0 0 6px 0;"><strong>Telefon:</strong> ${phone}</p>` : ''}
          ${goal ? `<p style="margin:0 0 6px 0;"><strong>Mesaj:</strong> ${goal}</p>` : ''}
        </div>
      </div>
    `

    const result = await resend.emails.send({
      from: 'Benedek Systems <onboarding@resend.dev>',
      to: ['benedek.robertgeorge@gmail.com'],
      subject: `Solicitare nouă de la ${name}`,
      html,
    })

    return NextResponse.json(result)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to send' }, { status: 500 })
  }
}
