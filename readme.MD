# 🖥️ Zelos – Sistema de Chamados 
Zelos é um sistema de gerenciamento de chamados desenvolvido com foco para o SENAI, criado como um hackathon, que permite controlar solicitações de forma eficiente, integrando um frontend moderno, backend robusto e um banco de dados relacional.

---

### 📁 Estrutura do Projeto
```bash
Zelos/
├─ backend/    # API em Node.js e Express, ORM - Prisma
├─ frontend/   # Aplicação web em Next.js
└─ database/   # Banco de dados MySQL

# Obs: para rodar  o projeto você deve possuir instalado: Node.js, XAMPP e MySQL
```
###  🗃️ Banco de Dados

```bash 
MySQL/
├─ _prisma_migrations   # Tabela que interage com o prisma. 
├─ category             # Tabaela onde todas as categorias estão salvas.
├─ patrimony            # Tabela onde todos os patrimonios são salvos.
├─ technician_category  # Tabela de categorias atribuidas ao técnico.
├─ ticket               # Tabela onde todos os chamados são salvos.
├─ user                 # Tabela de usuários, contendo informações como nome, email, senha e role.
└─ worklog              # Tabela de apontamentos relacionados aos chamados.

# Obs: as tabelas são geradas pelo prisma.
```


### 🛠️ Tecnologias Utilizadas
```bash
Frontend ─ Next.js ─ React | Estilização ─ Tailwind CSS | Backend ─ Node.js ─ Express | Banco de Dados ─ MySQL | ORM ─ Prisma
```

### 🌐 Instalação

### 1. Clonar o projeto

```bash
1. git clone https://github.com/GustavoTorelli/Zelos.git
2. cd Zelos
```
### 2. Configurar o Banco de Dados

```bash
# No banco de dadados desejado
1. CREATE DATABASE zelos3TD;

# No painel de controle do XAMPP
2. start mysql
```

### 3. Configurar .env  (em desenvolvimento)
 
```bash
# Inicializando.
1. Localize o arquivo `.env.example` na pasta do backend.
2. Copie o arquivo `.env.example` e renomeie a cópia para `.env`.

# Usuário Inicial. Para qundo não houver dados no banco.
1. Altere ADMIN_EMAIL='admin@email.com' 
2. Altere ADMIN_PASSWORD='Admin$123'

# Redefinir senha.

# Configuração do projeto no Google Cloud Console e geração do Refresh Token

1. Crie um projeto no Google Cloud Console
# - Acesse https://console.developers.google.com no seu navegador.
# - Clique em "Select a project" (no topo) e depois em "New Project".
# - Dê um nome ao projeto, por exemplo: "Gmail SMTP".
# - Clique em "Create" para criar o projeto.

2. Habilite a Gmail API
# - No menu à esquerda, vá para "APIs & Services" > "Library".
# - Pesquise por "Gmail API" e clique em "Enable" para ativá-la.

3. Configure a OAuth Consent Screen
# - Em "APIs & Services" > "OAuth Consent Screen", selecione "External" como User Type.
# - Preencha os campos obrigatórios (ex.: nome do app, e-mail de suporte).
# - Em "Scopes", adicione o escopo: https://mail.google.com/
# - Salve e conclua as etapas.

4. Crie credenciais OAuth 2.0
# - Vá para "APIs & Services" > "Credentials".
# - Clique em "Create Credentials" > "OAuth Client ID".
# - Escolha o tipo "Web Application".
# - Em "Authorized redirect URIs", adicione: https://developers.google.com/oauthplayground
# - Clique em "Create".
# - Copie o "Client ID" e o "Client Secret" exibidos.

5. Gere o Refresh Token no Google OAuth 2.0 Playground
# - Acesse https://developers.google.com/oauthplayground no seu navegador.
# - Clique no ícone de engrenagem no canto superior direito.
# - Marque "Use your own OAuth credentials".
# - Insira o "Client ID" e o "Client Secret" copiados do Google Cloud Console.
# - Na seção "Step 1: Select & authorize APIs", selecione o escopo: https://mail.google.com/
# - Clique em "Authorize APIs" e faça login com a conta Gmail desejada.
# - Após autorizar, clique em "Exchange authorization code for tokens" na seção "Step 2".
# - Copie o "Refresh Token" gerado.

6. Adicione as credenciais ao arquivo .env
- SMTP_USER='seuemail@gmail.com'         # Seu endereço de e-mail do Gmail
- SMTP_CLIENT_ID='seu-client-id'         # Client ID do Google Cloud Console
- SMTP_CLIENT_SECRET='seu-client-secret' # Client Secret do Google Cloud Console
- SMTP_REFRESH_TOKEN='seu-refresh-token' # Refresh Token do OAuth Playground
```

### 4. Configurar o Backend

```bash
# Verifique se a rota http://localhost:3333 está disponivel
cd backend
npm i
npx prisma migrate deploy
npx prisma generate
npm run dev
```

### 5. Configurar o Frontend

```bash
# Verifique se a rota http://localhost:3000 está disponivel
cd frontend
npm i
npm run dev
```

---
### 🐱‍👤 Colaboradores
| <img src="https://github.com/gustavotorelli.png" width="100" height="100" alt="Gustavo Torelli" /> | <img src="https://github.com/Matheusrike.png" width="100" height="100" alt="Matheus Ramos" /> | <img src="https://github.com/Bestofef-afk.png" width="100" height="100" alt="Gianlucca D Estefani" /> |
|:------------------------------------------------------------------------------------------------:|:-------------------------------------------------------------------------------------------------:|:-----------------------------------------------------------------------------------------------------:|
| [Gustavo Torelli](https://github.com/gustavotorelli) | [Matheus Ramos](https://github.com/Matheusrike) | [Gianlucca D Estefani](https://github.com/Bestofef-afk) |


© 2025 Zelos. Todos os direitos reservados.


