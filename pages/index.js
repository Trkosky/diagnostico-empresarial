import Link from 'next/link'

export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="max-w-2xl w-full bg-white p-8 rounded shadow">
        <h1 className="text-2xl font-bold mb-4">Diagnóstico Empresarial</h1>
        <p className="mb-6">Formulário público para clientes. Use o link abaixo para preencher.</p>
        <Link href="/form"><a className="px-4 py-2 bg-blue-600 text-white rounded">Abrir formulário</a></Link>
      </div>
    </div>
  )
}
