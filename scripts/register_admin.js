async function main() {
  const payload = {
    email: 'rodrigomotkoski@gmail.com',
    password: '1234',
    mustChangePassword: true
  }
  try {
    const res = await fetch('http://localhost:3000/api/auth/register', {
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
