# 🖥️ Zelos – Sistema de Chamados 
Zelos é um sistema de gerenciamento de chamados desenvolvido com foco para o SENAI, criado como um RACATOM, que permite controlar solicitações de forma eficiente, integrando um frontend moderno, backend robusto e um banco de dados relacional.

---

### 📁 Estrutura do Projeto
```bash
Zelos/
├─ backend/    # API em Node.js e Express
├─ frontend/   # Aplicação web em Next.js
└─ database/   # Banco de dados MySQL

# Obs: para rodar  o projeto você deve possuir instalado: Node.js, XAMPP e MySQL
```

### 🛠️ Tecnologias Utilizadas
```bash
Frontend ─ Next.js ─ React | Estilização ─ Tailwind CSS | Backend ─ Node.js ─ Express | Banco de Dados ─ MySQL | ORM ─ Prisma
```

### 🌐 Instalação

### 1. Clonar o projeto

```bash
git clone https://github.com/GustavoTorelli/Zelos.git
cd Zelos
```
### 2. Configurar o Banco de Dados

```bash
CREATE DATABASE zelos3TD;
```

### 3. Configurar o Backend

```bash
cd backend
npm i
npx prisma migrate deploy
npx prisma generate
npm run dev
```

### 4. Configurar o Frontend

```bash
cd frontend
npm i
npm run dev
```
---
### 🐱‍👤 Colaboradores
| <img src="https://github.com/gustavotorelli.png" width="100" height="100" alt="Gustavo Torelli" /> | <img src="https://github.com/Matheusrike.png" width="100" height="100" alt="Matheus Ramos" /> | <img src="https://github.com/Bestofef-afk.png" width="100" height="100" alt="Gianlucca D Estefani" /> |
|:------------------------------------------------------------------------------------------------:|:-------------------------------------------------------------------------------------------------:|:-----------------------------------------------------------------------------------------------------:|
| [Gustavo Torelli](https://github.com/gustavotorelli) | [Matheus Ramos](https://github.com/Matheusrike) | [Gianlucca ](https://github.com/Bestofef-afk) |


© 2025 Zelos. Todos os direitos reservados.
