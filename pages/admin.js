import { useState, useEffect } from 'react'
import { useSession, signIn, signOut } from 'next-auth/react'

export default function Admin() {
  const { data: session } = useSession()
  const [submissions, setSubmissions] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!session) return
    setLoading(true)
    fetch('/api/admin/submissions').then(r => r.json()).then(data => { setSubmissions(data || []); setLoading(false) })
  }, [session])

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-full max-w-md bg-white p-6 rounded shadow">
          <h2 className="text-xl font-bold mb-4">Admin — Login</h2>
          <LoginForm />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-5xl mx-auto bg-white p-6 rounded shadow">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Admin — Submissions</h2>
          <div>
            <span className="mr-4">{session.user.email}</span>
            <button onClick={() => signOut()} className="px-3 py-1 bg-red-500 text-white rounded">Logout</button>
          </div>
        </div>

        {loading ? <div>Carregando...</div> : (
          <table className="w-full table-auto border-collapse">
            <thead>
              <tr className="text-left border-b">
                <th className="p-2">ID</th>
                <th className="p-2">Email</th>
                <th className="p-2">Data</th>
                <th className="p-2">Criado</th>
              </tr>
            </thead>
            <tbody>
              {submissions.map(s => (
                <tr key={s.id} className="border-b">
                  <td className="p-2">{s.id}</td>
                  <td className="p-2">{s.email}</td>
                  <td className="p-2"><pre className="whitespace-pre-wrap">{s.data}</pre></td>
                  <td className="p-2">{new Date(s.createdAt).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}

function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [status, setStatus] = useState('')

  const submit = async (e) => {
    e.preventDefault()
    setStatus('Entrando...')
    const res = await signIn('credentials', { redirect: false, email, password })
    if (res?.error) setStatus('Erro: ' + res.error)
    else setStatus('Logado')
  }

  return (
    <form onSubmit={submit} className="space-y-3">
      <input placeholder="E-mail" value={email} onChange={e => setEmail(e.target.value)} className="w-full p-2 border rounded" />
      <input placeholder="Senha" value={password} onChange={e => setPassword(e.target.value)} type="password" className="w-full p-2 border rounded" />
      <div className="flex items-center gap-3">
        <button className="px-4 py-2 bg-blue-600 text-white rounded" type="submit">Entrar</button>
        <div>{status}</div>
      </div>
    </form>
  )
}
