import { PrismaClient } from '@prisma/client'
import { Resend } from 'resend'

const prisma = new PrismaClient()

const LABELS = {
  razaoSocial: 'Razão Social',
  cnpj: 'CNPJ',
  email: 'E-mail',
  regimeFederal: 'Regime Federal',
  regimeEstadual: 'Regime Estadual',
  cidade: 'Cidade',
  faturamentoMensal: 'Faturamento Mensal',
  filiais: 'Filiais',
  colaboradores: 'Colaboradores',
  veiculos: 'Veículos na frota',
  faturamentoTerceirizacao: 'Fat. Terceirização',
  conciliacaoBancaria: 'Conciliação Bancária',
  controleContas: 'Controle Contas a Pagar/Receber',
  geraSPED: 'Gera SPED',
  faturamentoOmisso: 'Faturamento Omisso',
  despesasNaoRegistradas: 'Despesas Não Registradas',
  incluirTP: 'Incluir Análise TP',
  transferenciaEmpregados: 'Transferência de Empregados por CNPJ',
}

async function sendReportEmail(adminEmail, payload) {
  if (!process.env.RESEND_API_KEY) return

  const resend = new Resend(process.env.RESEND_API_KEY)

  const rows = Object.entries(LABELS)
    .filter(([key]) => payload[key])
    .map(([key, label]) => {
      const val = payload[key]
      const isSim = val === 'Sim'
      const isNao = val === 'Não'
      const badgeStyle = isSim
        ? 'background:#dcfce7;color:#16a34a;padding:2px 8px;border-radius:4px;font-weight:600'
        : isNao
        ? 'background:#fee2e2;color:#dc2626;padding:2px 8px;border-radius:4px;font-weight:600'
        : 'color:#1e293b'
      return `<tr>
        <td style="padding:9px 14px;border-bottom:1px solid #f1f5f9;color:#64748b;font-size:13px;width:50%">${label}</td>
        <td style="padding:9px 14px;border-bottom:1px solid #f1f5f9;font-size:13px"><span style="${badgeStyle}">${val}</span></td>
      </tr>`
    }).join('')

  await resend.emails.send({
    from: 'Diagnóstico Empresarial <noreply@rmxassociados.com.br>',
    to: adminEmail,
    subject: `Novo diagnóstico — ${payload.razaoSocial || payload.email || 'Cliente'}`,
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto;color:#1e293b;background:#f8fafc;padding:24px;border-radius:12px">
        <div style="background:#1d4ed8;padding:20px 24px;border-radius:8px 8px 0 0;margin-bottom:0">
          <h2 style="color:#fff;margin:0;font-size:18px">Novo Diagnóstico Recebido</h2>
          <p style="color:#bfdbfe;margin:4px 0 0;font-size:13px">${new Date().toLocaleString('pt-BR')}</p>
        </div>
        <div style="background:#fff;border:1px solid #e2e8f0;border-top:none;border-radius:0 0 8px 8px;overflow:hidden">
          <table style="width:100%;border-collapse:collapse">
            ${rows}
          </table>
        </div>
        <p style="color:#94a3b8;font-size:11px;margin-top:16px;text-align:center">Diagnóstico Empresarial · RMX Associados</p>
      </div>
    `,
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
