import { useState, useEffect } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/router'

const BASE_URL = 'https://diagnostico-empresarial-psi.vercel.app'

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

function badge(value) {
  if (value === 'Sim') return <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded text-xs font-medium">Sim</span>
  if (value === 'Não') return <span className="px-2 py-0.5 bg-red-100 text-red-700 rounded text-xs font-medium">Não</span>
  return <span className="text-gray-700">{value || '-'}</span>
}

function SubmissionModal({ sub, onClose }) {
  let data = {}
  try { data = JSON.parse(sub.data) } catch {}

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="p-6 border-b flex justify-between items-start">
          <div>
            <h3 className="text-lg font-bold">{data.razaoSocial || 'Sem nome'}</h3>
            <p className="text-sm text-gray-500">{data.cnpj} · {new Date(sub.createdAt).toLocaleString('pt-BR')}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl font-bold">×</button>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {Object.entries(LABELS).map(([key, label]) => (
              data[key] ? (
                <div key={key} className="border-b pb-2">
                  <p className="text-xs text-gray-400 uppercase tracking-wide mb-0.5">{label}</p>
                  <div className="text-sm font-medium">{badge(data[key])}</div>
                </div>
              ) : null
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function SubmissionsTab({ submissions, loading }) {
  const [selected, setSelected] = useState(null)

  if (loading) return <div className="p-6 text-gray-500">Carregando...</div>
  if (submissions.length === 0) return (
    <div className="p-6 text-center text-gray-500">
      <p className="text-lg mb-1">Nenhuma resposta ainda.</p>
      <p className="text-sm">Copie seu link acima e envie para seus clientes.</p>
    </div>
  )

  return (
    <>
      {selected && <SubmissionModal sub={selected} onClose={() => setSelected(null)} />}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left border-b bg-gray-50 text-gray-500 uppercase text-xs tracking-wide">
              <th className="p-3">Empresa</th>
              <th className="p-3">CNPJ</th>
              <th className="p-3">Regime</th>
              <th className="p-3">Faturamento</th>
              <th className="p-3">Colaboradores</th>
              <th className="p-3">Data</th>
              <th className="p-3"></th>
            </tr>
          </thead>
          <tbody>
            {submissions.map(s => {
              let d = {}
              try { d = JSON.parse(s.data) } catch {}
              return (
                <tr key={s.id} className="border-b hover:bg-blue-50 cursor-pointer transition-colors" onClick={() => setSelected(s)}>
                  <td className="p-3 font-medium">{d.razaoSocial || '-'}</td>
                  <td className="p-3 text-gray-500">{d.cnpj || '-'}</td>
                  <td className="p-3">{d.regimeFederal || '-'}</td>
                  <td className="p-3">R$ {d.faturamentoMensal || '-'}</td>
                  <td className="p-3">{d.colaboradores || '-'}</td>
                  <td className="p-3 text-gray-500">{new Date(s.createdAt).toLocaleDateString('pt-BR')}</td>
                  <td className="p-3 text-blue-500 text-xs font-medium">Ver →</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </>
  )
}

export default function Admin() {
  const { data: session, status } = useSession()
  const [submissions, setSubmissions] = useState([])
  const [loading, setLoading] = useState(false)
  const [tab, setTab] = useState('submissions')
  const [copied, setCopied] = useState(false)
  const router = useRouter()

  useEffect(() => {
    if (status === 'unauthenticated') router.replace('/login')
  }, [status, router])

  useEffect(() => {
    if (!session) return
    setLoading(true)
    fetch('/api/admin/submissions')
      .then(r => r.json())
      .then(data => { setSubmissions(data || []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [session])

  if (status === 'loading' || status === 'unauthenticated') {
    return <div className="min-h-screen flex items-center justify-center">Carregando...</div>
  }

  if (session.user.mustChangePassword) return <ChangePasswordForm />

  const formLink = `${BASE_URL}/form?uid=${session.user.id}`

  const copyLink = () => {
    navigator.clipboard.writeText(formLink)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-5xl mx-auto space-y-4">

        {/* Header */}
        <div className="bg-white p-4 rounded-lg shadow-sm flex justify-between items-center">
          <h1 className="text-lg font-bold">Diagnóstico Empresarial</h1>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-500">{session.user.email}</span>
            <button onClick={() => signOut()} className="px-3 py-1 bg-red-500 text-white rounded text-sm">Sair</button>
          </div>
        </div>

        {/* Link */}
        <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
          <p className="text-sm font-semibold text-blue-900 mb-2">Seu link — envie para o cliente preencher:</p>
          <div className="flex gap-2">
            <input readOnly value={formLink} onFocus={e => e.target.select()}
              className="flex-1 p-2 text-sm border rounded bg-white text-gray-700 font-mono" />
            <button onClick={copyLink}
              className={`px-4 py-2 rounded text-sm font-semibold transition-all ${copied ? 'bg-green-500 text-white' : 'bg-blue-600 text-white hover:bg-blue-700'}`}>
              {copied ? '✓ Copiado' : 'Copiar'}
            </button>
          </div>
        </div>

        {/* Abas */}
        <div className="flex gap-2">
          {[['submissions', `Respostas (${submissions.length})`], ['users', 'Usuários']].map(([key, label]) => (
            <button key={key} onClick={() => setTab(key)}
              className={`px-4 py-2 rounded text-sm font-medium transition-colors ${tab === key ? 'bg-blue-600 text-white' : 'bg-white border text-gray-600 hover:bg-gray-50'}`}>
              {label}
            </button>
          ))}
        </div>

        {/* Conteúdo */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          {tab === 'submissions' && <SubmissionsTab submissions={submissions} loading={loading} />}
          {tab === 'users' && <div className="p-6"><CreateUserForm /></div>}
        </div>
      </div>
    </div>
  )
}

function CreateUserForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [tempPassword, setTempPassword] = useState(true)
  const [msg, setMsg] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    setMsg(''); setError(''); setLoading(true)
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, mustChangePassword: tempPassword }),
    })
    const data = await res.json()
    setLoading(false)
    if (!res.ok) { setError(data.error || 'Erro') }
    else { setMsg(`Usuário "${email}" criado com sucesso.`); setEmail(''); setPassword('') }
  }

  return (
    <div className="max-w-md">
      <h3 className="font-semibold mb-4">Criar novo usuário</h3>
      <form onSubmit={submit} className="space-y-3">
        <div>
          <label className="block text-sm font-medium mb-1">E-mail</label>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full p-2 border rounded" required />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Senha inicial</label>
          <input type="text" value={password} onChange={e => setPassword(e.target.value)} className="w-full p-2 border rounded" required minLength={4} />
        </div>
        <label className="flex items-center gap-2 text-sm cursor-pointer">
          <input type="checkbox" checked={tempPassword} onChange={e => setTempPassword(e.target.checked)} />
          Forçar troca de senha no primeiro login
        </label>
        {error && <p className="text-red-600 text-sm">{error}</p>}
        {msg && <p className="text-green-600 text-sm">{msg}</p>}
        <button type="submit" disabled={loading}
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-50">
          {loading ? 'Criando...' : 'Criar usuário'}
        </button>
      </form>
    </div>
  )
}

function ChangePasswordForm() {
  const { data: session, update } = useSession()
  const [newPassword, setNewPassword] = useState('')
  const [status, setStatus] = useState('')

  const submit = async (e) => {
    e.preventDefault()
    setStatus('Atualizando...')
    const res = await fetch('/api/auth/change-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: session.user.email, password: newPassword }),
    })
    const payload = await res.json()
    if (!res.ok) { setStatus(payload.error || 'Erro'); return }
    await update()
    window.location.reload()
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <form onSubmit={submit} className="w-full max-w-md bg-white p-6 rounded shadow">
        <h2 className="text-xl font-bold mb-4">Trocar senha</h2>
        <p className="mb-4 text-sm text-gray-600">Sua senha atual é temporária. Defina uma nova senha para continuar.</p>
        <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)}
          placeholder="Nova senha" className="w-full p-2 border rounded mb-3" required minLength={4} />
        <button type="submit" className="w-full bg-green-600 text-white rounded px-4 py-2">Salvar nova senha</button>
        <div className="mt-3 text-sm text-gray-600">{status}</div>
      </form>
    </div>
  )
}
