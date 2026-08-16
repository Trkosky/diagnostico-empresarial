# Acesso público temporário com ngrok

1. Baixe e instale o ngrok em https://ngrok.com/
2. Faça login e obtenha a sua `authtoken` (linha de comando no site).
3. Configure o token localmente:

```powershell
ngrok authtoken <SEU_AUTHTOKEN>
```

4. Inicie a aplicação localmente (neste projeto):

```powershell
npm run dev
```

5. Em outra janela, rode o ngrok apontando para a porta 3000:

```powershell
ngrok http 3000
```

6. O ngrok exibirá duas URLs públicas (http e https). Compartilhe a URL `https://...` para permitir que alguém acesse seu app local.

Observações:
- O túnel é temporário e dura enquanto o ngrok estiver rodando.
- Use ngrok apenas para testes; para acesso permanente faça o deploy no Vercel.
