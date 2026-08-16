
# Diagnóstico Empresarial - App

Aplicação Next.js para replicar o formulário "Diagnóstico Empresarial" com autenticação de administradores, armazenamento de respostas e painel de visualização.

Resumo do que está incluído:
- Frontend público: `/form` para clientes preencherem o questionário.
- Admin: `/admin` com login (NextAuth Credentials) para ver respostas.
- API: `POST /api/submit` salva respostas em `Submission` (JSON) e `POST /api/auth/register` cria usuários.
- Banco local: Prisma + SQLite (`dev.db`) para desenvolvimento.

Instalação e execução local

1. Instale dependências e gere o client Prisma:

```powershell
npm install --legacy-peer-deps
npx prisma generate
```

2. Crie a migração (já realizada no repositório de exemplo):

```powershell
npx prisma migrate dev --name init --schema=prisma/schema.prisma
```

3. Execute o projeto:

```powershell
npm run dev
# abrir http://localhost:3000
```

Variáveis de ambiente (local: `.env`). Configure as chaves abaixo:

- `DATABASE_URL` — para desenvolvimento: `file:./dev.db`.
- `NEXTAUTH_SECRET` — segredo para NextAuth (troque em produção).
- SMTP (se usar SMTP): `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM`.
- SendGrid (se usar SendGrid): `SENDGRID_API_KEY` e `SMTP_FROM`.

Produção / Deploy no Vercel

Observação importante: SQLite não é adequado para produção no Vercel (filesystem é efêmero). Recomendo usar um banco gerenciado PostgreSQL (Neon, Upstash, Supabase, Railway, Heroku, PlanetScale [MySQL], etc.) e atualizar `DATABASE_URL` para a string de conexão.

Passos resumidos para deploy com GitHub + Vercel:

1. Inicialize repositório local e faça commit:

```powershell
git init
git add .
git commit -m "Initial scaffold"
```

2. Crie repositório no GitHub e empurre:

```powershell
git remote add origin https://github.com/<seu-usuario>/<seu-repo>.git
git branch -M main
git push -u origin main
```

3. No Vercel: importe o repositório e na etapa de Environment Variables adicione as variáveis listadas acima (`DATABASE_URL`, `NEXTAUTH_SECRET`, `SENDGRID_API_KEY` ou `SMTP_*`).

4. Build & Runtime:
- `Build Command`: `npm run build`
- `Output Directory`: padrão do Next.js

5. Migrações Prisma em produção:
- Recomendo rodar migrações manualmente antes do deploy (ou via CI) apontando para o banco de produção:

```powershell
# localmente, com DATABASE_URL apontando para o banco de produção
npx prisma migrate deploy --schema=prisma/schema.prisma
```

Se usar PlanetScale/Neon com limitações de migração, siga a documentação do provedor para aplicar migrações (ou use o modo `prisma db push` quando apropriado).

E-mail de notificação (opcional por enquanto)

Você pode escolher entre SendGrid (recomendado) ou SMTP. Deixamos essa etapa por último; quando quiser eu implemento o envio automático após submissão.

Próximos passos que posso executar agora:
- Implementar envio de e-mail (SendGrid ou SMTP).
- Adicionar instruções de CI para rodar migrações no deploy.

Contate-me qual opção de e-mail prefere (SendGrid ou SMTP) ou se quer que eu gere um `template` de e-mail agora.

