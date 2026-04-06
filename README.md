# 🚀 Gerador de Excedente Web

Aplicação web completa para processamento e geração de dados excedentes, composta por **frontend (HTML, CSS, JS)** e **backend em Spring Boot**.

---

## 📌 Visão Geral

Este projeto foi desenvolvido com o objetivo de:

* Processar arquivos (ex: CSV)
* Gerar dados tratados/excedentes
* Exibir resultados via interface web
* Permitir integração entre frontend e backend

Arquitetura baseada em:

* 🌐 Frontend: HTML + CSS + JavaScript
* ⚙️ Backend: Java + Spring Boot
* 🐳 Suporte a Docker

---

## 🏗️ Estrutura do Projeto

```
gerador-excedente-web/
│
├── backend/                # API Spring Boot
│   ├── src/
│   ├── pom.xml
│   └── README.txt
│
├── frontend/               # Interface web
│   ├── index.html
│   ├── login.html
│   └── assets/
│
├── .github/                # Configurações de CI/CD
├── Dockerfile              # Containerização
├── .gitignore
└── README.md
```

---

## ⚙️ Pré-requisitos

Antes de rodar o projeto, você precisa ter instalado:

* Java 17+
* Maven
* Node.js (opcional, caso evolua frontend)
* Docker (opcional)

---

## ▶️ Como Executar o Projeto

### 🔹 Backend (Spring Boot)

1. Acesse a pasta:

```bash
cd backend
```

2. Execute:

**Linux/Mac:**

```bash
mvn spring-boot:run
```

**Windows:**

```bash
mvnw spring-boot:run
```

3. A API estará disponível em:

```
http://localhost:8080
```

---

### 🔹 Frontend

1. Acesse a pasta:

```bash
cd frontend
```

2. Abra o arquivo no navegador:

```bash
index.html
```

Ou utilize uma extensão como Live Server no VS Code.

---

## 🔗 Integração Frontend ↔ Backend

O frontend realiza requisições HTTP para o backend, geralmente via:

```javascript
fetch("http://localhost:8080/api/..." )
```

Certifique-se de que:

* O backend esteja rodando
* O CORS esteja configurado corretamente

---

## 🐳 Executando com Docker

1. Build da imagem:

```bash
docker build -t gerador-excedente .
```

2. Rodar container:

```bash
docker run -p 8080:8080 gerador-excedente
```

---

## 📂 Funcionalidades

* Upload e processamento de arquivos
* Geração de dados excedentes
* Interface de login
* Comunicação com API REST
* Estrutura preparada para expansão

---

## 🧠 Tecnologias Utilizadas

* Java
* Spring Boot
* Maven
* HTML5
* CSS3
* JavaScript
* Docker

---

## 📈 Melhorias Futuras

* Autenticação completa (JWT)
* Banco de dados (PostgreSQL/MySQL)
* Upload de arquivos robusto
* Dashboard com gráficos
* Testes automatizados

---

## 🐛 Possíveis Problemas

### Erro ao rodar Maven

Verifique:

* Java instalado corretamente
* Variável `JAVA_HOME`

### Erro de CORS

Adicionar no backend:

```java
@CrossOrigin(origins = "*")
```

---

## 🤝 Contribuição

Sinta-se livre para contribuir:

1. Fork o projeto
2. Crie uma branch
3. Commit suas mudanças
4. Abra um Pull Request

---

## 📄 Licença

Este projeto está sob a licença MIT.

---

## 👨‍💻 Autor

Desenvolvido por **Guilhermy Alves**

---

## ⭐ Dica

Se este projeto te ajudou, deixe uma estrela no repositório!
