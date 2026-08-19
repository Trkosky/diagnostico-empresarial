import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import { getServerSession } from 'next-auth/next'
import { authOptions } from './[...nextauth]'
import { Resend } from 'resend'

const prisma = new PrismaClient()

async function sendWelcomeEmail(email, password, mustChangePassword) {
  if (!process.env.RESEND_API_KEY) return
  const resend = new Resend(process.env.RESEND_API_KEY)

  const loginUrl = `${process.env.NEXTAUTH_URL || 'https://diagnostico-empresarial-psi.vercel.app'}/login`

  await resend.emails.send({
    from: 'Diagnóstico Empresarial <onboarding@resend.dev>',
    to: email,
    subject: 'Seu acesso ao Diagnóstico Empresarial',
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto">
        <h2 style="color:#1d4ed8">Acesso criado</h2>
        <p>Olá! Seu acesso ao painel foi criado. Use as credenciais abaixo para entrar:</p>
        <div style="background:#f1f5f9;padding:16px;border-radius:8px;margin:16px 0">
          <p style="margin:4px 0"><strong>Link:</strong> <a href="${loginUrl}">${loginUrl}</a></p>
          <p style="margin:4px 0"><strong>E-mail:</strong> ${email}</p>
          <p style="margin:4px 0"><strong>Senha:</strong> ${password}</p>
        </div>
        ${mustChangePassword ? '<p style="color:#b45309">⚠️ Você será solicitado a criar uma nova senha no primeiro acesso.</p>' : ''}
        <a href="${loginUrl}" style="display:inline-block;background:#1d4ed8;color:white;padding:10px 24px;border-radius:6px;text-decoration:none;margin-top:8px">Acessar painel</a>
      </div>
    `,
  })
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  const session = await getServerSession(req, res, authOptions)
  if (!session) return res.status(401).json({ error: 'Não autorizado' })

  const { email, password, mustChangePassword } = req.body
  if (!email || !password) return res.status(400).json({ error: 'E-mail e senha são obrigatórios' })

  try {
    const exists = await prisma.user.findUnique({ where: { email } })
    if (exists) return res.status(409).json({ error: 'Usuário já existe' })

    const hash = await bcrypt.hash(password, 10)
    const user = await prisma.user.create({
      data: { email, password: hash, mustChangePassword: mustChangePassword ? true : false },
    })

    await sendWelcomeEmail(email, password, mustChangePassword)

    return res.status(201).json({ ok: true, user: { id: user.id, email: user.email } })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: 'Erro interno' })
  }
}
