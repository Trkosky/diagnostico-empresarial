import { PrismaClient } from '@prisma/client'
import nodemailer from 'nodemailer'

const prisma = new PrismaClient()

function formatReport(payload) {
  const skip = ['userId']
  return Object.entries(payload)
    .filter(([key]) => !skip.includes(key))
    .map(([key, value]) => `${key}: ${value ?? '-'}`)
    .join('\n')
}

async function sendReportEmail(adminEmail, payload) {
  const hasSmtp = Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS)
  if (!hasSmtp) return

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : 587,
    secure: false,
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  })

  await transporter.sendMail({
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
    to: adminEmail,
    subject: `Novo diagnóstico recebido — ${payload.razaoSocial || payload.email || 'Cliente'}`,
    text: `Novo formulário preenchido:\n\n${formatReport(payload)}`,
  })
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()
  const payload = req.body
  const userId = payload.userId ? parseInt(payload.userId) : null

  try {
    await prisma.submission.create({
      data: {
        email: payload.email || '',
        data: JSON.stringify(payload),
        userId: userId || undefined,
      },
    })

    if (userId) {
      const admin = await prisma.user.findUnique({ where: { id: userId } })
      if (admin) await sendReportEmail(admin.email, payload)
    }

    return res.status(200).json({ ok: true })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: 'Erro interno' })
  }
}
