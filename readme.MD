# 🖥️ Zelos – Sistema de Chamados

Zelos é um sistema de gerenciamento de chamados desenvolvido com foco para o SENAI, criado como um hackathon, que permite controlar solicitações de forma eficiente, integrando um frontend moderno, backend robusto e um banco de dados relacional.

---

## 📁 Estrutura do Projeto

```bash
Zelos/
├─ backend/    # API em Node.js e Express, ORM - Prisma
└─ frontend/   # Aplicação web em Next.js

# Obs: para rodar o projeto você deve possuir instalado: Node.js, XAMPP e MySQL ou Docker
```

---

## 🛠️ Tecnologias Utilizadas

-   **Frontend:** Next.js, React
-   **Estilização:** Tailwind CSS
-   **Backend:** Node.js, Express
-   **Banco de Dados:** MySQL
-   **ORM:** Prisma

---

## 🌐 Instalação

### 1. Clonar o projeto

```bash
git clone https://github.com/GustavoTorelli/Zelos.git
cd Zelos
```

---

### 2. Configurar o Banco de Dados

#### 🔹 Usando XAMPP

1. Abra o **Painel de Controle do XAMPP**
2. Inicie o serviço **MySQL**
3. Abra seu SGBD favorito (ex.: _MySQL Workbench_ ou _DBeaver_)
4. Crie um banco de dados chamado **`zelos`**

#### 🔹 Usando Docker

1. Inicie o **Docker Engine**
2. Navegue até o diretório **`Zelos/backend`**
3. Execute o comando:

```bash
docker compose up -d
```

---

### 3. Configuração do `.env`

1. Localize o arquivo **`.env.example`** na pasta do backend.
2. Copie o arquivo e renomeie a cópia para **`.env`**.

#### 🔹 Configurações básicas

```bash
ENVIRONMENT="dev" # ou "prod"
DATABASE_URL="mysql://root:root@localhost:3306/zelos"
JWT_SECRET="seu_jwt_secret"
ADMIN_EMAIL="email_do_admin_inicial"
ADMIN_PASSWORD="senha_do_admin_inicial"
```

Dica, use o https://jwtsecrets.com/#generator para gerar o **JWT_SECRET**

---

#### 🔹 Configurações SMTP (ambiente de desenvolvimento: `ENVIRONMENT=dev`)

1. Acesse [https://ethereal.email/](https://ethereal.email/)
2. Clique em **+ Create Ethereal Account**
3. Copie o **username** e atribua à chave `DEV_SMTP_USER`
4. Copie a **password** e atribua à chave `DEV_SMTP_PASS`
5. Clique em **Open Mailbox** para visualizar a caixa de entrada

---

#### 🔹 Configurações SMTP (ambiente de produção: `ENVIRONMENT=prod`)

##### 1. Criar projeto no Google Cloud Console

-   Acesse [Google Cloud Console](https://console.developers.google.com)
-   Clique em **Select a project** (topo) > **New Project**
-   Nomeie o projeto (ex.: _Gmail SMTP_)
-   Clique em **Create**

##### 2. Habilitar Gmail API

-   Vá em **APIs & Services > Library**
-   Pesquise por **Gmail API**
-   Clique em **Enable**

##### 3. Configurar a OAuth Consent Screen

-   Vá em **APIs & Services > Tela de consentimento OAuth**
-   Preencha os campos obrigatórios (nome do app, e-mail de suporte)
-   Selecione **External** como _User Type_
-   Em **Escopos**, adicione: `https://mail.google.com/`
-   Salve e conclua

##### 4. Adicionar remetente como usuário de teste

-   Vá em **Público-alvo**
-   Adicione o e-mail do remetente como usuário de teste

##### 5. Criar credenciais OAuth 2.0

-   Vá em **APIs & Services > Credentials**
-   Clique em **Create Credentials > OAuth Client ID**
-   Escolha o tipo **Web Application**
-   Em **Authorized redirect URIs**, adicione:

    -   `https://developers.google.com/oauthplayground`
    -   `http://localhost:3333`

-   Clique em **Create**
-   Baixe o arquivo JSON com as credenciais do cliente OAuth

##### 6. Gerar Refresh Token no OAuth Playground

-   Acesse [OAuth Playground](https://developers.google.com/oauthplayground)
-   Clique no ícone de engrenagem (canto superior direito)
-   Marque **Use your own OAuth credentials**
-   Insira o **Client ID** e **Client Secret** do Google Cloud Console ou do arquivo JSON
-   Em **Step 1: Select & authorize APIs**, selecione o escopo: `https://mail.google.com/`
-   Clique em **Authorize APIs** e faça login com a conta desejada
-   Em **Step 2**, clique em **Exchange authorization code for tokens**
-   Copie o **Refresh Token** gerado

##### 7. Adicionar credenciais ao `.env`

```bash
SMTP_USER="seuemail@gmail.com"
SMTP_CLIENT_ID="seu-client-id"
SMTP_CLIENT_SECRET="seu-client-secret"
SMTP_REFRESH_TOKEN="seu-refresh-token"
```

---

### 4. Configurar o Backend

```bash
cd backend
npm install
npm run start
```

A API estará disponível em: [http://localhost:3333](http://localhost:3333)

A documentação estará disponível em [http://localhost:3333/docs](http://localhost:3333/docs)

---

### 5. Configurar o Frontend

```bash
cd frontend
npm install
npm run dev
```

A aplicação estará disponível em: [http://localhost:3000](http://localhost:3000)

---

### 🐱‍👤 Colaboradores

<div align="center">

| <img src="https://github.com/gustavotorelli.png" width="100" height="100" alt="Gustavo Torelli" /> | <img src="https://github.com/Matheusrike.png" width="100" height="100" alt="Matheus Ramos" /> | <img src="https://github.com/Bestofef-afk.png" width="100" height="100" alt="Gianlucca D Estefani"/> |
| :------------------------------------------------------------------------------------------------: | :-------------------------------------------------------------------------------------------: | :--------------------------------------------------------------------------------------------------: |
|                        [Gustavo Torelli](https://github.com/gustavotorelli)                        |                        [Matheus Ramos](https://github.com/Matheusrike)                        |                       [Gianlucca D Estefani](https://github.com/Bestofef-afk)                        |

---

**© 2025 Zelos. Todos os direitos reservados**.

</div>
