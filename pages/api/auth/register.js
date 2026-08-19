import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import { getServerSession } from 'next-auth/next'
import { authOptions } from './[...nextauth]'
import { Resend } from 'resend'

const prisma = new PrismaClient()

async function sendWelcomeEmail(email, password, mustChangePassword, createdByName) {
  if (!process.env.RESEND_API_KEY) {
    console.log('RESEND_API_KEY não configurado')
    return { sent: false, error: 'RESEND_API_KEY não configurado' }
  }

  const resend = new Resend(process.env.RESEND_API_KEY)
  const loginUrl = `${process.env.NEXTAUTH_URL || 'https://diagnostico-empresarial-psi.vercel.app'}/login`

  try {
    const result = await resend.emails.send({
      from: 'Diagnóstico Empresarial <onboarding@resend.dev>',
      to: email,
      subject: 'Seu acesso ao Diagnóstico Empresarial',
      html: `
        <div style="font-family:sans-serif;max-width:480px;margin:0 auto;color:#1e293b">
          <h2 style="color:#1d4ed8;margin-bottom:4px">Acesso criado</h2>
          <p style="color:#64748b;margin-top:0">Criado por <strong>${createdByName}</strong></p>
          <p>Olá! Seu acesso ao painel de Diagnóstico Empresarial foi criado. Use as credenciais abaixo:</p>
          <div style="background:#f1f5f9;padding:16px;border-radius:8px;margin:16px 0;border-left:4px solid #1d4ed8">
            <p style="margin:6px 0"><strong>Link:</strong><br><a href="${loginUrl}" style="color:#1d4ed8">${loginUrl}</a></p>
            <p style="margin:6px 0"><strong>E-mail:</strong> ${email}</p>
            <p style="margin:6px 0"><strong>Senha:</strong> <span style="font-family:monospace;background:#e2e8f0;padding:2px 6px;border-radius:4px">${password}</span></p>
          </div>
          ${mustChangePassword ? '<p style="color:#b45309;background:#fef9c3;padding:10px;border-radius:6px">⚠️ Você será solicitado a criar uma nova senha no primeiro acesso.</p>' : ''}
          <a href="${loginUrl}" style="display:inline-block;background:#1d4ed8;color:white;padding:10px 24px;border-radius:6px;text-decoration:none;margin-top:8px;font-weight:600">Acessar painel →</a>
          <p style="color:#94a3b8;font-size:12px;margin-top:24px">Este acesso foi criado por ${createdByName}.</p>
        </div>
      `,
    })

    if (result.error) {
      console.error('Resend error:', result.error)
      return { sent: false, error: result.error.message }
    }

    return { sent: true }
  } catch (err) {
    console.error('Erro ao enviar e-mail:', err)
    return { sent: false, error: err.message }
  }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  const session = await getServerSession(req, res, authOptions)
  if (!session) return res.status(401).json({ error: 'Não autorizado' })

  const { email, password, mustChangePassword } = req.body
  if (!email || !password) return res.status(400).json({ error: 'E-mail e senha são obrigatórios' })

  try {
    const creator = await prisma.user.findUnique({ where: { id: session.user.id } })
    const createdByName = creator?.name || creator?.email || 'Administrador'

    const exists = await prisma.user.findUnique({ where: { email } })
    if (exists) return res.status(409).json({ error: 'Usuário já existe' })

    const hash = await bcrypt.hash(password, 10)
    const user = await prisma.user.create({
      data: { email, password: hash, mustChangePassword: mustChangePassword ? true : false },
    })

    const emailResult = await sendWelcomeEmail(email, password, mustChangePassword, createdByName)

    return res.status(201).json({ ok: true, user: { id: user.id, email: user.email }, emailSent: emailResult.sent, emailError: emailResult.error })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: 'Erro interno' })
  }
}
