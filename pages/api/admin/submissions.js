import { PrismaClient } from '@prisma/client'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../auth/[...nextauth]'

const prisma = new PrismaClient()

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions)
  if (!session) return res.status(401).json({ error: 'Unauthorized' })

  try {
    const subs = await prisma.submission.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: 'desc' },
    })
    return res.status(200).json(subs)
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: 'Erro interno' })
  }
}
