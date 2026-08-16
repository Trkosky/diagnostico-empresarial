import { PrismaClient } from '@prisma/client'
import nodemailer from 'nodemailer'

const prisma = new PrismaClient()

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()
  const payload = req.body

  try {
    // Save submission (basic)
    await prisma.submission.create({ data: { email: payload.email || '', data: JSON.stringify(payload) } })

    // Send email (SMTP config required via env)
    if (process.env.SMTP_HOST) {
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : 587,
        secure: false,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      })

      await transporter.sendMail({
        from: process.env.SMTP_FROM || 'no-reply@example.com',
        to: payload.email,
        subject: 'Cópia das respostas - Diagnóstico Empresarial',
        text: `Obrigado. Recebemos suas respostas:\n\n${JSON.stringify(payload, null, 2)}`,
      })
    }

    return res.status(200).json({ ok: true })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: 'Erro interno' })
  }
}
