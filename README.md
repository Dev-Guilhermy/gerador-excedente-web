# 🚀 Gerador de Excedente Web

![Java](https://img.shields.io/badge/Java-17+-red)
![Spring Boot](https://img.shields.io/badge/SpringBoot-3.x-brightgreen)
![Build](https://img.shields.io/badge/build-Maven-blue)
![Frontend](https://img.shields.io/badge/frontend-HTML%2FCSS%2FJS-orange)
![Deploy](https://img.shields.io/badge/deploy-Render%20%7C%20Netlify-purple)
![License](https://img.shields.io/badge/license-MIT-lightgrey)

Sistema completo para **upload, processamento e classificação de dados via CSV**, com autenticação JWT, API REST e interface web moderna.

---

# 📌 VISÃO GERAL

O sistema realiza:

* 🔐 Login com autenticação JWT
* 📥 Upload de arquivos CSV
* ⚙️ Processamento de dados no backend
* 📊 Classificação automática:

  * ✅ APTO A DESCONTO
  * ❌ NÃO APTO A DESCONTO
* 📤 Retorno estruturado para o frontend

---

# 🏗️ ARQUITETURA

```
Frontend (Netlify)
      ↓
API REST (Render)
      ↓
Spring Boot + Regras de Negócio
```

---

# 🔐 AUTENTICAÇÃO JWT

## Fluxo

1. Usuário faz login
2. Backend valida credenciais
3. Retorna token JWT
4. Frontend armazena token
5. Token é enviado nas requisições

---

## Endpoint

```http
POST /auth/login
```

### Request

```json
{
  "username": "admin",
  "password": "123456"
}
```

### Response

```json
{
  "token": "JWT_TOKEN"
}
```

---

# 📡 API - PROCESSAMENTO

## Endpoint

```http
POST /api/processar
```

Este é o **principal endpoint do sistema**, responsável por receber o arquivo CSV, processar os dados e retornar a classificação.

---

## 🔄 Fluxo Interno do Método `processar`

O método `processar` possui uma lógica mais avançada do que uma simples leitura de CSV. Ele realiza **detecção de tipo de arquivo, aplicação de filtros, agregação e cálculo estatístico**.

---

### 1. 📥 Recebimento do arquivo

* Arquivo recebido via `MultipartFile`
* Já validado no controller (tamanho, tipo, extensão)

---

### 2. 📖 Leitura do Cabeçalho

* Primeira linha é lida e normalizada
* Remove aspas e converte para maiúsculo

```java
header = header.replace("\"", "").toUpperCase();
```

---

### 3. 🧠 Detecção de Tipo de CSV

O sistema identifica automaticamente:

#### ✔ CSV Corporativo

Contém colunas como:

* DATA
* TELEEVENTO
* TIPO DE COMUNICAÇÃO

#### ✔ CSV Simples

* Apenas colunas básicas (placa + evento)

---

### 4. 🔄 Leitura Linha a Linha

* Usa regex para suportar CSV com aspas

```java
String separadorCSV = ",(?=(?:[^\"]*\"[^\"]*\")*[^\"]*$)";
```

---

### 5. 📊 Processamento (CSV Corporativo)

Para cada linha:

* Extrai:

  * `placa`
  * `dataEvento`
  * `teleevento`
  * `intervaloTransmissao`
  * `comunicacao`

---

### 6. 🔍 Aplicação de Filtros

#### Filtro de Comunicação

* GPRS
* SATÉLITE
* EM MEMÓRIA

Normalização aplicada:

* Remove acentos
* Ignora maiúsculas/minúsculas

---

#### Filtro de Teleevento

```text
Se filtro informado → mantém apenas eventos iguais
```

---

### 7. ⏱️ Controle de Período

O sistema calcula automaticamente:

* 📅 Data inicial (menor data encontrada)
* 📅 Data final (maior data encontrada)

---

### 8. 🔥 Captura do Intervalo de Transmissão

* Capturado diretamente do CSV
* Exemplo: "2 minutos"
* Apenas o primeiro valor válido é utilizado

---

### 9. 📈 Contabilização de Eventos

Agrupa eventos por nome:

```text
TELEEVENTO → quantidade de ocorrências
```

---

### 10. 📊 Cálculo de Percentual

Para cada evento:

```text
percentual = (quantidade * 100) / total
```

---

### 11. 📦 Montagem do Resultado

O sistema retorna um `ResultadoDTO` contendo:

```json
{
  "placa": "ABC1234",
  "total": 100,
  "intervaloTransmissao": "2 minutos",
  "eventos": [
    {
      "evento": "IGNICAO LIGADA",
      "qtd": 50,
      "percentual": 50.0,
      "comunicacao": "GPRS"
    }
  ],
  "dataInicio": "01/01/2024 10:00",
  "dataFim": "01/01/2024 12:00",
  "nomeArquivo": "arquivo.csv"
}
```

---

### 12. ❗ Validação Final

Se nenhum dado válido for encontrado:

```text
"Nenhum dado encontrado com os filtros aplicados"
```

---

## ⚠️ Tratamento de Erros

Possíveis cenários tratados pelo método:

* Arquivo vazio
* Formato inválido
* Erro de leitura
* Dados inconsistentes

Exemplo de erro:

```json
{
  "erro": "Arquivo inválido ou vazio"
}
```

---

# 📊 REGRA DE NEGÓCIO

A classificação **APTO A DESCONTO / NÃO APTO A DESCONTO NÃO é automática no backend** — ela é baseada em **análise manual do analista**, utilizando os dados retornados pelo sistema.

O sistema fornece toda a base analítica necessária para essa decisão.

---

## 🧠 CRITÉRIO REAL DE ANÁLISE

A validação é baseada na presença e predominância de eventos relacionados a:

```text
JAMER / JAMMER / DESLIGAMENTO DE JAMER
```

---

## 🔍 REGRA DE CLASSIFICAÇÃO

Após o processamento, o analista deve observar os percentuais retornados.

### ❌ NÃO APTO A DESCONTO

Se existir evento relacionado a **JAMER**, porém ele **NÃO for o evento predominante**:

Exemplo:

```text
Evento A → 80%
JAMER → 20%
```

Resultado:

```text
NÃO APTO A DESCONTO
```

---

### ✅ APTO A DESCONTO

Se o evento relacionado a **JAMER for o maior percentual entre todos os eventos**:

Exemplo:

```text
JAMER → 60%
Evento B → 40%
```

Resultado:

```text
APTO A DESCONTO
```

---

## 📌 Observações Importantes

* O sistema **não depende de nome exato**, pois o analista deve considerar variações como:

  * "JAMER"
  * "JAMMER"
  * "DESLIGAMENTO DE JAMER"
  * Qualquer termo relacionado

* A decisão é **contextual e analítica**, não apenas técnica

* O backend fornece:

  * Percentual por evento
  * Quantidade
  * Tipo de comunicação

👉 A decisão final é sempre do analista

---

## 📊 Papel do Sistema

O sistema atua como:

✔ Ferramenta de análise
✔ Consolidador de dados
✔ Base para tomada de decisão

NÃO como motor automático de decisão.

---

# 📥 CSV SUPORTADO

```csv
id,nome,valor,quantidade
1,Produto A,10.5,2
2,Produto B,5.0,1
```

---

# 🌐 FRONTEND

## Login

* Captura usuário/senha
* Armazena token no localStorage

## Upload

```javascript
const formData = new FormData();
formData.append("file", file);

fetch("https://SUA-API.onrender.com/api/processar", {
  method: "POST",
  headers: {
    Authorization: "Bearer " + token
  },
  body: formData
});
```

---

# ⚙️ BACKEND

Camadas:

* Controller
* Service
* CSV Parser
* Security (JWT)

Fluxo:

1. Recebe CSV
2. Converte dados
3. Aplica regra
4. Retorna JSON

---

# 🚀 DEPLOY

## 🔥 BACKEND - RENDER

### 1. Criar conta

[https://render.com](https://render.com)

### 2. Novo Web Service

* Conectar GitHub
* Selecionar repositório

### 3. Configuração

* Build Command:

```
mvn clean install
```

* Start Command:

```
java -jar target/*.jar
```

### 4. Variáveis de ambiente

```
JAVA_VERSION=17
PORT=8080
```

### 5. Deploy

Após deploy:

```
https://seu-backend.onrender.com
```

---

## 🌐 FRONTEND - NETLIFY

### 1. Criar conta

[https://netlify.com](https://netlify.com)

### 2. Deploy

* Importar repositório
* Definir pasta: `frontend`

### 3. Configuração

* Build command: (vazio)
* Publish directory: `frontend`

### 4. Ajustar API URL

No JS:

```javascript
const API_URL = "https://seu-backend.onrender.com";
```

---

# ⚡ CI/CD

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

      - uses: actions/setup-java@v3
        with:
          distribution: temurin
          java-version: 17

      - run: mvn clean install
```

---

# 📈 ROADMAP

* Swagger (SpringDoc)
* Banco de dados
* Dashboard
* Logs avançados

---

# 🐛 PROBLEMAS COMUNS

## CORS

```java
@CrossOrigin(origins = "*")
```

## Token inválido

* Verifique header Authorization

---

# 👨‍💻 AUTOR

Guilhermy Alves

---

# ⭐ CONTRIBUA

* Fork
* PR
* Star

---

# 📄 LICENÇA

MIT
