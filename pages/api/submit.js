import { PrismaClient } from '@prisma/client'
import nodemailer from 'nodemailer'

const prisma = new PrismaClient()

function formatReport(payload) {
  return Object.entries(payload)
    .map(([key, value]) => `${key}: ${value ?? '-'}`)
    .join('\n')
}

async function sendReportEmail(payload) {
  const emailAddress = payload.email || process.env.SMTP_FROM || 'noreply@example.com'
  const hasSmtp = Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS)

  if (!hasSmtp) {
    console.log('SMTP not configured; skipping email send for:', emailAddress)
    return
  }

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
    to: emailAddress,
    subject: 'Cópia das respostas - Diagnóstico Empresarial',
    text: `Obrigado. Recebemos suas respostas:\n\n${formatReport(payload)}`,
  })
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()
  const payload = req.body

  try {
    await prisma.submission.create({
      data: {
        email: payload.email || '',
        data: JSON.stringify(payload),
      },
    })

    await sendReportEmail(payload)
    return res.status(200).json({ ok: true })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: 'Erro interno' })
  }
}
