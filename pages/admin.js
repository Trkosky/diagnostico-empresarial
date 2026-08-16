import { useState, useEffect } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/router'

export default function Admin() {
  const { data: session, status } = useSession()
  const [submissions, setSubmissions] = useState([])
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.replace('/login')
    }
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
                <th className="p-2">Dados</th>
                <th className="p-2">Criado</th>
              </tr>
            </thead>
            <tbody>
              {submissions.map(s => (
                <tr key={s.id} className="border-b align-top">
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
    if (!res.ok) {
      setStatus(payload.error || 'Erro ao alterar senha')
      return
    }
    await update()
    setStatus('Senha alterada com sucesso!')
    window.location.reload()
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <form onSubmit={submit} className="w-full max-w-md bg-white p-6 rounded shadow">
        <h2 className="text-xl font-bold mb-4">Trocar senha</h2>
        <p className="mb-4 text-sm text-gray-600">Sua senha atual é temporária. Defina uma nova senha para continuar.</p>
        <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="Nova senha" className="w-full p-2 border rounded mb-3" />
        <button type="submit" className="w-full bg-green-600 text-white rounded px-4 py-2">Salvar nova senha</button>
        <div className="mt-3">{status}</div>
      </form>
    </div>
  )
}
