async function main() {
  try {
    const payload = {
      email: 'test@example.com',
      razaoSocial: 'Empresa X',
      cnpj: '00.000.000/0001-00',
      regimeFederal: 'Simples Nacional'
    }
    const res = await fetch('http://localhost:3000/api/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    const text = await res.text()
    console.log('status', res.status)
    console.log(text)
  } catch (err) {
    console.error(err)
  }
}

main()
