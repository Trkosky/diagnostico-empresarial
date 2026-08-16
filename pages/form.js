import { useState } from 'react'

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
  const [data, setData] = useState(initial)
  const [status, setStatus] = useState('')

  const submit = async (e) => {
    e.preventDefault()
    setStatus('Enviando...')
    const res = await fetch('/api/submit', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) })
    if (res.ok) setStatus('Enviado com sucesso')
    else setStatus('Erro ao enviar')
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <form onSubmit={submit} className="w-full max-w-3xl bg-white p-6 rounded shadow">
        <h2 className="text-xl font-bold mb-4">Diagnóstico Empresarial — Formulário</h2>

        <label className="block mb-2">E-mail *</label>
        <input required value={data.email} onChange={e => setData({ ...data, email: e.target.value })} className="w-full p-2 border rounded mb-4" />

        <label className="block mb-2">Razão Social *</label>
        <input required value={data.razaoSocial} onChange={e => setData({ ...data, razaoSocial: e.target.value })} className="w-full p-2 border rounded mb-4" />

        <label className="block mb-2">CNPJ *</label>
        <input required value={data.cnpj} onChange={e => setData({ ...data, cnpj: e.target.value })} className="w-full p-2 border rounded mb-4" />

        <label className="block mb-2">Regime Tributário Federal</label>
        <select value={data.regimeFederal} onChange={e => setData({ ...data, regimeFederal: e.target.value })} className="w-full p-2 border rounded mb-4">
          <option value="">Selecione</option>
          <option>Lucro Real</option>
          <option>Lucro Presumido</option>
          <option>Simples Nacional</option>
        </select>

        <label className="block mb-2">Regime Tributário Estadual</label>
        <select value={data.regimeEstadual} onChange={e => setData({ ...data, regimeEstadual: e.target.value })} className="w-full p-2 border rounded mb-4">
          <option value="">Selecione</option>
          <option>Presumido</option>
          <option>Normal</option>
        </select>

        <label className="block mb-2">Cidade de operacionalização?</label>
        <input value={data.cidade} onChange={e => setData({ ...data, cidade: e.target.value })} className="w-full p-2 border rounded mb-4" />

        <label className="block mb-2">Faturamento médio Mensal (R$)</label>
        <input value={data.faturamentoMensal} onChange={e => setData({ ...data, faturamentoMensal: e.target.value })} className="w-full p-2 border rounded mb-4" />

        <label className="block mb-2">Quantas filiais a empresa possui?</label>
        <input value={data.filiais} onChange={e => setData({ ...data, filiais: e.target.value })} className="w-full p-2 border rounded mb-4" />

        <label className="block mb-2">Numero de Colaboradores</label>
        <input value={data.colaboradores} onChange={e => setData({ ...data, colaboradores: e.target.value })} className="w-full p-2 border rounded mb-4" />

        <label className="block mb-2">Quantos veículos compõem a frota da empresa?</label>
        <input value={data.veiculos} onChange={e => setData({ ...data, veiculos: e.target.value })} className="w-full p-2 border rounded mb-4" />

        <label className="block mb-2">Faturamento de Terceirização (R$/mês)</label>
        <input value={data.faturamentoTerceirizacao} onChange={e => setData({ ...data, faturamentoTerceirizacao: e.target.value })} className="w-full p-2 border rounded mb-4" />

        <hr className="my-4" />

        <label className="block mb-2">A empresa realiza conciliação bancária dentro do sistema gerencial?</label>
        <select value={data.conciliacaoBancaria} onChange={e => setData({ ...data, conciliacaoBancaria: e.target.value })} className="w-full p-2 border rounded mb-4">
          <option value="">Selecione</option>
          <option>Sim</option>
          <option>Não</option>
        </select>

        <label className="block mb-2">A empresa possui controle de Contas a Pagar e Contas a Receber?</label>
        <select value={data.controleContas} onChange={e => setData({ ...data, controleContas: e.target.value })} className="w-full p-2 border rounded mb-4">
          <option value="">Selecione</option>
          <option>Sim</option>
          <option>Não</option>
        </select>

        <label className="block mb-2">O sistema utilizado gera os arquivos SPED e os encaminha para a contabilidade?</label>
        <select value={data.geraSPED} onChange={e => setData({ ...data, geraSPED: e.target.value })} className="w-full p-2 border rounded mb-4">
          <option value="">Selecione</option>
          <option>Sim</option>
          <option>Não</option>
        </select>

        <label className="block mb-2">Existe faturamento não registrado (faturamento omisso)?</label>
        <select value={data.faturamentoOmisso} onChange={e => setData({ ...data, faturamentoOmisso: e.target.value })} className="w-full p-2 border rounded mb-4">
          <option value="">Selecione</option>
          <option>Sim</option>
          <option>Não</option>
        </select>

        <label className="block mb-2">Existem despesas realizadas pela empresa que não são registradas na contabilidade?</label>
        <select value={data.despesasNaoRegistradas} onChange={e => setData({ ...data, despesasNaoRegistradas: e.target.value })} className="w-full p-2 border rounded mb-4">
          <option value="">Selecione</option>
          <option>Sim</option>
          <option>Não</option>
        </select>

        <label className="block mb-2">Deseja incluir a análise Trabalhista e Previdenciária (TP) neste diagnóstico?</label>
        <select value={data.incluirTP} onChange={e => setData({ ...data, incluirTP: e.target.value })} className="w-full p-2 border rounded mb-4">
          <option value="">Selecione</option>
          <option>Sim</option>
          <option>Não</option>
        </select>

        <label className="block mb-2">Tem transferência de empregados por CNPJ?</label>
        <select value={data.transferenciaEmpregados} onChange={e => setData({ ...data, transferenciaEmpregados: e.target.value })} className="w-full p-2 border rounded mb-4">
          <option value="">Selecione</option>
          <option>Sim</option>
          <option>Não</option>
        </select>

        <div className="flex items-center gap-3">
          <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded">Enviar</button>
          <div>{status}</div>
        </div>
      </form>
    </div>
  )
}
