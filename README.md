# 🚀 Gerador de Excedente Web

![Java](https://img.shields.io/badge/Java-17+-red)
![Spring Boot](https://img.shields.io/badge/SpringBoot-3.x-brightgreen)
![Build](https://img.shields.io/badge/build-Maven-blue)
![License](https://img.shields.io/badge/license-MIT-lightgrey)
![Status](https://img.shields.io/badge/status-em%20desenvolvimento-yellow)

Sistema completo para **upload, processamento e classificação de dados via CSV**, com autenticação, regras de negócio e interface web integrada.

---

# 📌 VISÃO GERAL DO SISTEMA

O **Gerador de Excedente Web** foi desenvolvido para:

* 🔐 Autenticar usuários
* 📥 Receber arquivos CSV
* ⚙️ Processar dados com regras de negócio
* 📊 Classificar registros como:

  * ✅ APTO A DESCONTO
  * ❌ NÃO APTO A DESCONTO
* 📤 Retornar resultados processados

Arquitetura:

```
Frontend (HTML/CSS/JS)
        ↓
API REST (Spring Boot)
        ↓
Processamento CSV + Regras de Negócio
```

---

# 🔐 AUTENTICAÇÃO (JWT)

O sistema utiliza autenticação baseada em **JWT (JSON Web Token)**.

## 🔑 Fluxo de Login

1. Usuário acessa `login.html`
2. Envia credenciais para API
3. Backend valida
4. Retorna token JWT
5. Frontend armazena token
6. Token é enviado nas próximas requisições

---

## 📡 Endpoint de Login

```http
POST /auth/login
```

### 📥 Request

```json
{
  "username": "admin",
  "password": "123456"
}
```

### 📤 Response

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

## 🔒 Uso do Token

Todas as requisições protegidas devem conter:

```http
Authorization: Bearer SEU_TOKEN_AQUI
```

---

# 📡 DOCUMENTAÇÃO DA API

## 🔹 Processamento de CSV

```http
POST /api/processar
```

### Headers

```http
Authorization: Bearer TOKEN
Content-Type: multipart/form-data
```

### 📥 Request

* Upload de arquivo CSV

### 📤 Response (Exemplo)

```json
[
  {
    "id": 1,
    "nome": "Produto A",
    "valor": 10.5,
    "quantidade": 2,
    "status": "APTO A DESCONTO"
  },
  {
    "id": 2,
    "nome": "Produto B",
    "valor": 5.0,
    "quantidade": 1,
    "status": "NAO APTO A DESCONTO"
  }
]
```

---

# 📊 REGRAS DE NEGÓCIO (CLASSIFICAÇÃO)

Durante o processamento, cada registro é analisado.

## 🧠 Critérios de Classificação

Exemplo de lógica aplicada:

* Se `valor * quantidade >= limite mínimo`

  * → ✅ APTO A DESCONTO
* Caso contrário:

  * → ❌ NÃO APTO A DESCONTO

> ⚠️ O valor limite pode ser configurável no backend.

---

# 📥 FORMATO DO CSV

## Estrutura esperada:

```csv
id,nome,valor,quantidade
1,Produto A,10.5,2
2,Produto B,5.0,1
```

## Regras:

* Separador: vírgula `,`
* Primeira linha: cabeçalho obrigatório
* Tipos:

  * id → inteiro
  * nome → texto
  * valor → decimal
  * quantidade → inteiro

---

# 🌐 FRONTEND (COMPORTAMENTO)

## 🔑 Login

* Tela: `login.html`
* Envia credenciais via `fetch`
* Armazena token no `localStorage`

## 📤 Upload CSV

* Tela principal: `index.html`
* Seleção de arquivo
* Envio via `FormData`

```javascript
const formData = new FormData();
formData.append("file", file);

fetch("http://localhost:8080/api/processar", {
  method: "POST",
  headers: {
    Authorization: "Bearer " + token
  },
  body: formData
});
```

## 📊 Exibição

* Resultados renderizados dinamicamente
* Classificação exibida visualmente

---

# ⚙️ BACKEND (DETALHES)

## Camadas

* Controller → recebe requisições
* Service → regras de negócio
* Parser CSV → leitura e transformação
* Security → autenticação JWT

## Fluxo interno

1. Recebe arquivo
2. Faz parsing CSV
3. Converte dados
4. Aplica regra de negócio
5. Retorna JSON

---

# ▶️ EXECUÇÃO

## Backend

```bash
cd backend
mvn spring-boot:run
```

## Frontend

Abrir:

```
frontend/index.html
```

---

# 🐳 DOCKER

```bash
docker build -t gerador-excedente .
docker run -p 8080:8080 gerador-excedente
```

---

# ⚡ CI/CD (GitHub Actions)

```yaml
name: CI

on:
  push:
    branches: ["main"]

jobs:
  build:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - name: Setup Java
        uses: actions/setup-java@v3
        with:
          distribution: temurin
          java-version: 17

      - name: Build
        run: mvn clean install
```

---

# 📈 ROADMAP

* [ ] Swagger UI integrado
* [ ] Banco de dados
* [ ] Logs avançados
* [ ] Dashboard analítico
* [ ] Controle de usuários

---

# 🐛 TROUBLESHOOTING

## CORS

```java
@CrossOrigin(origins = "*")
```

## Token inválido

* Verifique expiração
* Confirme header Authorization

---

# 👨‍💻 AUTOR

**Guilhermy Alves**

---

# ⭐ CONTRIBUA

Se este projeto te ajudou:

* ⭐ Star no repositório
* 🍴 Fork
* 🔧 Pull Request

---

# 📄 LICENÇA

MIT
