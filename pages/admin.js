import { useState, useEffect } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/router'

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://diagnostico-empresarial-psi.vercel.app'

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

  if (session.user.mustChangePassword) {
    return <ChangePasswordForm />
  }

  const formLink = `${BASE_URL}/form?uid=${session.user.id}`

  const copyLink = () => {
    navigator.clipboard.writeText(formLink)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <div className="bg-white p-4 rounded shadow mb-4 flex justify-between items-center">
          <h2 className="text-xl font-bold">Painel Admin</h2>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-500">{session.user.email}</span>
            <button onClick={() => signOut()} className="px-3 py-1 bg-red-500 text-white rounded text-sm">Sair</button>
          </div>
        </div>

        {/* Link para compartilhar */}
        <div className="bg-blue-50 border border-blue-200 p-4 rounded mb-4">
          <p className="text-sm font-medium text-blue-800 mb-2">Seu link do formulário — envie para seus clientes:</p>
          <div className="flex gap-2 items-center">
            <input
              readOnly
              value={formLink}
              className="flex-1 p-2 text-sm border rounded bg-white text-gray-700"
              onFocus={e => e.target.select()}
            />
            <button
              onClick={copyLink}
              className={`px-4 py-2 rounded text-sm font-medium transition-colors ${copied ? 'bg-green-500 text-white' : 'bg-blue-600 text-white hover:bg-blue-700'}`}
            >
              {copied ? 'Copiado!' : 'Copiar link'}
            </button>
          </div>
        </div>

        {/* Abas */}
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setTab('submissions')}
            className={`px-4 py-2 rounded text-sm font-medium ${tab === 'submissions' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 border'}`}
          >
            Respostas ({submissions.length})
          </button>
          <button
            onClick={() => setTab('users')}
            className={`px-4 py-2 rounded text-sm font-medium ${tab === 'users' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 border'}`}
          >
            Gerenciar usuários
          </button>
        </div>

        {/* Respostas */}
        {tab === 'submissions' && (
          <div className="bg-white p-6 rounded shadow">
            {loading ? <div>Carregando...</div> : submissions.length === 0 ? (
              <p className="text-gray-500 text-sm">Nenhuma resposta ainda. Compartilhe seu link acima para receber.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full table-auto border-collapse text-sm">
                  <thead>
                    <tr className="text-left border-b bg-gray-50">
                      <th className="p-2">#</th>
                      <th className="p-2">Empresa</th>
                      <th className="p-2">E-mail</th>
                      <th className="p-2">CNPJ</th>
                      <th className="p-2">Regime</th>
                      <th className="p-2">Faturamento</th>
                      <th className="p-2">Data</th>
                    </tr>
                  </thead>
                  <tbody>
                    {submissions.map(s => {
                      let parsed = {}
                      try { parsed = JSON.parse(s.data) } catch {}
                      return (
                        <tr key={s.id} className="border-b hover:bg-gray-50">
                          <td className="p-2 text-gray-400">{s.id}</td>
                          <td className="p-2 font-medium">{parsed.razaoSocial || '-'}</td>
                          <td className="p-2">{parsed.email || s.email}</td>
                          <td className="p-2">{parsed.cnpj || '-'}</td>
                          <td className="p-2">{parsed.regimeFederal || '-'}</td>
                          <td className="p-2">{parsed.faturamentoMensal || '-'}</td>
                          <td className="p-2 text-gray-500">{new Date(s.createdAt).toLocaleDateString('pt-BR')}</td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {tab === 'users' && <CreateUserForm />}
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
    setMsg('')
    setError('')
    setLoading(true)
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, mustChangePassword: tempPassword }),
    })
    const data = await res.json()
    setLoading(false)
    if (!res.ok) {
      setError(data.error || 'Erro ao criar usuário')
    } else {
      setMsg(`Usuário "${email}" criado! Ele deve acessar o painel e usar a senha que você definiu.`)
      setEmail('')
      setPassword('')
    }
  }

  return (
    <div className="bg-white p-6 rounded shadow max-w-md">
      <h3 className="font-semibold mb-4">Criar novo usuário</h3>
      <form onSubmit={submit} className="space-y-4">
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
        <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-50">
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
        <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="Nova senha" className="w-full p-2 border rounded mb-3" required minLength={4} />
        <button type="submit" className="w-full bg-green-600 text-white rounded px-4 py-2">Salvar nova senha</button>
        <div className="mt-3 text-sm text-gray-600">{status}</div>
      </form>
    </div>
  )
}
