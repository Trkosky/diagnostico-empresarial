import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()
  const { email, password, mustChangePassword } = req.body
  if (!email || !password) return res.status(400).json({ error: 'E-mail e senha são obrigatórios' })

  try {
    const exists = await prisma.user.findUnique({ where: { email } })
    if (exists) return res.status(409).json({ error: 'Usuário já existe' })
    const hash = await bcrypt.hash(password, 10)
    const user = await prisma.user.create({ data: { email, password: hash, mustChangePassword: mustChangePassword ? true : false } })
    return res.status(201).json({ ok: true, user: { id: user.id, email: user.email } })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: 'Erro interno' })
  }
}
