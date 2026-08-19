import { useState } from 'react'
import { useRouter } from 'next/router'

const initial = {
  email: '',
  razaoSocial: '',
  cnpj: '',
  regimeFederal: '',
  regimeEstadual: '',
  cidade: '',
  faturamentoMensal: '',
  filiais: '',
  colaboradores: '',
  veiculos: '',
  faturamentoTerceirizacao: '',
  conciliacaoBancaria: '',
  controleContas: '',
  geraSPED: '',
  faturamentoOmisso: '',
  despesasNaoRegistradas: '',
  incluirTP: '',
  transferenciaEmpregados: '',
}

export default function Form() {
  const router = useRouter()
  const { uid } = router.query
  const [data, setData] = useState(initial)
  const [status, setStatus] = useState('')
  const [enviado, setEnviado] = useState(false)

  const set = (field) => (e) => setData({ ...data, [field]: e.target.value })

  const submit = async (e) => {
    e.preventDefault()
    setStatus('Enviando...')
    const res = await fetch('/api/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...data, userId: uid || null }),
    })
    if (res.ok) {
      setEnviado(true)
    } else {
      setStatus('Erro ao enviar. Tente novamente.')
    }
  }

  if (enviado) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white p-8 rounded shadow text-center max-w-md">
          <div className="text-4xl mb-4">✓</div>
          <h2 className="text-xl font-bold mb-2">Formulário enviado!</h2>
          <p className="text-gray-600">Suas respostas foram recebidas. Obrigado.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-8">
      <form onSubmit={submit} className="w-full max-w-3xl bg-white p-6 rounded shadow">
        <h2 className="text-xl font-bold mb-6">Diagnóstico Empresarial</h2>

        <label className="block mb-1 font-medium">E-mail *</label>
        <input required value={data.email} onChange={set('email')} type="email" className="w-full p-2 border rounded mb-4" />

        <label className="block mb-1 font-medium">Razão Social *</label>
        <input required value={data.razaoSocial} onChange={set('razaoSocial')} className="w-full p-2 border rounded mb-4" />

        <label className="block mb-1 font-medium">CNPJ *</label>
        <input required value={data.cnpj} onChange={set('cnpj')} className="w-full p-2 border rounded mb-4" />

        <label className="block mb-1 font-medium">Regime Tributário Federal</label>
        <select value={data.regimeFederal} onChange={set('regimeFederal')} className="w-full p-2 border rounded mb-4">
          <option value="">Selecione</option>
          <option>Lucro Real</option>
          <option>Lucro Presumido</option>
          <option>Simples Nacional</option>
        </select>

        <label className="block mb-1 font-medium">Regime Tributário Estadual</label>
        <select value={data.regimeEstadual} onChange={set('regimeEstadual')} className="w-full p-2 border rounded mb-4">
          <option value="">Selecione</option>
          <option>Presumido</option>
          <option>Normal</option>
        </select>

        <label className="block mb-1 font-medium">Cidade de operacionalização</label>
        <input value={data.cidade} onChange={set('cidade')} className="w-full p-2 border rounded mb-4" />

        <label className="block mb-1 font-medium">Faturamento médio Mensal (R$)</label>
        <input value={data.faturamentoMensal} onChange={set('faturamentoMensal')} className="w-full p-2 border rounded mb-4" />

        <label className="block mb-1 font-medium">Quantas filiais a empresa possui?</label>
        <input value={data.filiais} onChange={set('filiais')} className="w-full p-2 border rounded mb-4" />

        <label className="block mb-1 font-medium">Número de Colaboradores</label>
        <input value={data.colaboradores} onChange={set('colaboradores')} className="w-full p-2 border rounded mb-4" />

        <label className="block mb-1 font-medium">Quantos veículos compõem a frota?</label>
        <input value={data.veiculos} onChange={set('veiculos')} className="w-full p-2 border rounded mb-4" />

        <label className="block mb-1 font-medium">Faturamento de Terceirização (R$/mês)</label>
        <input value={data.faturamentoTerceirizacao} onChange={set('faturamentoTerceirizacao')} className="w-full p-2 border rounded mb-4" />

        <hr className="my-4" />

        <label className="block mb-1 font-medium">A empresa realiza conciliação bancária dentro do sistema gerencial?</label>
        <select value={data.conciliacaoBancaria} onChange={set('conciliacaoBancaria')} className="w-full p-2 border rounded mb-4">
          <option value="">Selecione</option>
          <option>Sim</option>
          <option>Não</option>
        </select>

        <label className="block mb-1 font-medium">A empresa possui controle de Contas a Pagar e Contas a Receber?</label>
        <select value={data.controleContas} onChange={set('controleContas')} className="w-full p-2 border rounded mb-4">
          <option value="">Selecione</option>
          <option>Sim</option>
          <option>Não</option>
        </select>

        <label className="block mb-1 font-medium">O sistema gera os arquivos SPED e os encaminha para a contabilidade?</label>
        <select value={data.geraSPED} onChange={set('geraSPED')} className="w-full p-2 border rounded mb-4">
          <option value="">Selecione</option>
          <option>Sim</option>
          <option>Não</option>
        </select>

        <label className="block mb-1 font-medium">Existe faturamento não registrado (faturamento omisso)?</label>
        <select value={data.faturamentoOmisso} onChange={set('faturamentoOmisso')} className="w-full p-2 border rounded mb-4">
          <option value="">Selecione</option>
          <option>Sim</option>
          <option>Não</option>
        </select>

        <label className="block mb-1 font-medium">Existem despesas realizadas que não são registradas na contabilidade?</label>
        <select value={data.despesasNaoRegistradas} onChange={set('despesasNaoRegistradas')} className="w-full p-2 border rounded mb-4">
          <option value="">Selecione</option>
          <option>Sim</option>
          <option>Não</option>
        </select>

        <label className="block mb-1 font-medium">Deseja incluir análise Trabalhista e Previdenciária (TP)?</label>
        <select value={data.incluirTP} onChange={set('incluirTP')} className="w-full p-2 border rounded mb-4">
          <option value="">Selecione</option>
          <option>Sim</option>
          <option>Não</option>
        </select>

        <label className="block mb-1 font-medium">Tem transferência de empregados por CNPJ?</label>
        <select value={data.transferenciaEmpregados} onChange={set('transferenciaEmpregados')} className="w-full p-2 border rounded mb-4">
          <option value="">Selecione</option>
          <option>Sim</option>
          <option>Não</option>
        </select>

        <div className="flex items-center gap-3 mt-2">
          <button type="submit" className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700">{status === 'Enviando...' ? 'Enviando...' : 'Enviar'}</button>
          {status && status !== 'Enviando...' && <span className="text-red-600 text-sm">{status}</span>}
        </div>
      </form>
    </div>
  )
}
