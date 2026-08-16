import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()
  const { email, password } = req.body

  if (!email || !password || password.length < 4) {
    return res.status(400).json({ error: 'E-mail e senha nova com no mínimo 4 caracteres são obrigatórios.' })
  }

  try {
    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) return res.status(404).json({ error: 'Usuário não encontrado' })

    const hash = await bcrypt.hash(password, 10)
    await prisma.user.update({
      where: { email },
      data: {
        password: hash,
        mustChangePassword: false,
      },
    })

    return res.status(200).json({ ok: true })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: 'Erro interno' })
  }
}
