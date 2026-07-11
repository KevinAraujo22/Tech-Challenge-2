# Desenvolvimento de Plataforma de Divulgação Acadêmica: Blog da Escola — Fase 2

## Grupo

- Davi Baestero Silva - RM: 371248
- Kevin da Silva Araujo - RM: 372533
- Leonardo Hisao Watanabe Silva - RM: 374063
- Lucas Henrique Klein Esteves - RM: 374025
- Lucas Dias Morosini - RM: 372641

---

## 1. Resumo

Refatoração e expansão da plataforma de blog acadêmico desenvolvida na Fase 1 com OutSystems. Nesta fase, o back-end foi reconstruído utilizando **Node.js com TypeScript**, substituindo a solução Low-Code por uma API REST. Os dados foram implementados com **MongoDB** via Mongoose, e toda a aplicação foi containerizada com **Docker**. O projeto inclui pipeline de CI/CD automatizado via **GitHub Actions** e cobertura de testes unitários superior ao mínimo exigido de 20%.

---

## 2. Introdução

A plataforma desenvolvida na Fase 1 cumpriu seu papel como prova de conceito, mas a solução Low-Code apresentou limitações de escalabilidade diante de um crescimento para panorama nacional. Para superar esse obstáculo, o grupo optou por refatorar completamente o back-end, mantendo as mesmas funcionalidades e regras de negócio, porém agora sobre uma arquitetura de código aberto, flexível e de alta performance.

A API REST construída expõe endpoints padronizados para criação, leitura, atualização, exclusão e busca de postagens, servindo como base para qualquer front-end ou cliente que venha a consumir os dados no futuro.

---

## 3. Arquitetura da Aplicação

### Estrutura de Pastas

```
Tech Challenge 2/
├── src/
│   ├── models/
│   │   └── Post.ts          # Schema do MongoDB
│   ├── controllers/
│   │   └── postController.ts # Lógica de cada endpoint
│   ├── routes/
│   │   └── postRoutes.ts    # Definição das rotas
│   ├── app.ts               # Configuração do Express
│   └── server.ts            # Entrada da aplicação
├── tests/
│   └── posts.test.ts        # Testes automatizados
├── .github/
│   └── workflows/
│       └── ci.yml           # Pipeline GitHub Actions
├── Dockerfile
├── docker-compose.yml
└── README.md
```

### Fluxo de uma Requisição

```
Cliente (Postman / App)
        |
   HTTP Request
        |
   Express (app.ts)              ← recebe e roteia a requisição
        |
   Router (postRoutes.ts)        ← identifica a rota chamada
        |
   Controller (postController.ts) ← executa a lógica de negócio
        |
   Model (Post.ts)               ← realiza a query no banco
        |
   MongoDB                       ← persiste ou retorna os dados
        |
   Resposta JSON para o cliente
```

---

## 4. Endpoints da API

| Método   | Rota               | Descrição                                      |
|----------|--------------------|------------------------------------------------|
| `GET`    | `/posts`           | Lista todos os posts, do mais recente ao mais antigo |
| `GET`    | `/posts/:id`       | Retorna um post específico pelo ID             |
| `POST`   | `/posts`           | Cria um novo post (título, conteúdo e autor)   |
| `PUT`    | `/posts/:id`       | Atualiza um post existente pelo ID             |
| `DELETE` | `/posts/:id`       | Remove um post pelo ID                         |
| `GET`    | `/posts/search?q=` | Busca posts por palavra-chave no título ou conteúdo |

### Exemplo de corpo para criação de post (`POST /posts`)

```json
{
  "title": "Aula de Matemática",
  "content": "Hoje vamos aprender frações e seus conceitos.",
  "author": "Prof. Kevin"
}
```

### Exemplo de resposta

```json
{
  "_id": "64f1a2b3c4d5e6f7a8b9c0d1",
  "title": "Aula de Matemática",
  "content": "Hoje vamos aprender frações e seus conceitos.",
  "author": "Prof. Kevin",
  "createdAt": "2026-05-01T14:00:00.000Z",
  "updatedAt": "2026-05-01T14:00:00.000Z"
}
```

---

## 5. Metodologia e Desenvolvimento Técnico

O desenvolvimento seguiu uma abordagem incremental, construindo camada por camada:

- **Model (`Post.ts`):** Definição do schema de dados com Mongoose. Os campos `title`, `content` e `author` são obrigatórios. Os campos `createdAt` e `updatedAt` são gerados automaticamente pela opção `timestamps` do Mongoose, sem necessidade de manipulação manual.

- **Controller (`postController.ts`):** Centraliza toda a lógica de negócio. Cada função é assíncrona e realiza a validação dos dados de entrada antes de interagir com o banco. Respostas de erro padronizadas (400 para dados inválidos, 404 para recurso não encontrado) garantem uma API previsível e fácil de consumir.

- **Router (`postRoutes.ts`):** A rota `/search` foi posicionada propositalmente antes da rota `/:id`. Sem essa ordem, o Express interpretaria a string `"search"` como um ID, causando falha silenciosa na busca.

- **Containerização:** A aplicação e o banco de dados sobem juntos via `docker-compose`, comunicando-se pela rede interna do Docker. O MongoDB é acessado pelo hostname `mongo`, sem exposição desnecessária de IPs.

- **CI/CD:** O workflow do GitHub Actions é composto por dois jobs. O primeiro (**CI**) sobe um container MongoDB temporário e executa todos os testes automaticamente a cada push ou pull request na branch `main`. O segundo (**CD**) só é disparado após os testes passarem e realiza o deploy automático da aplicação na plataforma **Railway**, tornando a API acessível publicamente na internet.

---

## 6. Como Executar o Projeto

### Pré-requisitos

- [Docker](https://www.docker.com/) instalado e em execução

### Subir a aplicação

```bash
docker-compose up --build
```

A API ficará disponível em: `http://localhost:3001`

### Verificar se está no ar

```bash
curl http://localhost:3001/health
# Resposta: {"status":"ok"}
```

### Encerrar

```bash
docker-compose down
```

---

## 7. Testes

Os testes utilizam **Jest** + **Supertest** e cobrem todos os endpoints da API. A cobertura de código foi de **56,89%**, bem acima do mínimo exigido de 20%.

| Cenário Testado                        | Resultado Esperado |
|----------------------------------------|--------------------|
| Criar post com dados válidos           | 201 Created        |
| Criar post sem campos obrigatórios     | 400 Bad Request    |
| Listar todos os posts                  | 200 OK             |
| Buscar post por ID existente           | 200 OK             |
| Buscar post por ID inexistente         | 404 Not Found      |
| Atualizar post existente               | 200 OK             |
| Deletar post                           | 204 No Content     |
| Buscar posts por palavra-chave         | 200 OK             |
| Buscar sem parâmetro `q`               | 400 Bad Request    |

---

## 8. Dificuldades Encontradas e Soluções

- **Instalação de dependências no Windows:** O `npm install` falhou repetidamente com erros de permissão (`EPERM`) e diretórios não vazios (`ENOTEMPTY`). A solução foi remover completamente a pasta `node_modules` e o `package-lock.json` antes de reinstalar, garantindo um ambiente limpo.

- **Configuração do TypeScript para testes:** O TypeScript não reconhecia os tipos do Jest (`describe`, `it`, `expect`) porque o `tsconfig.json` excluía a pasta `tests`. A solução foi criar um `tsconfig.test.json` separado que inclui tanto `src` quanto `tests`, referenciado diretamente pelo Jest via configuração no `jest.config.js`.

- **Ordem das rotas no Express:** A rota `GET /posts/search` inicialmente estava posicionada após `GET /posts/:id`, fazendo o Express capturar `"search"` como um ID e retornar 404. Mover a rota de busca para antes da rota de ID resolveu o problema completamente.

- **Porta em uso no Docker:** Ao tentar subir os containers, a porta 3000 já estava alocada por outro processo. A solução foi ajustar o `docker-compose.yml` para mapear a porta externa `3001` para a porta interna `3000` da aplicação.

## 9.Vídeo de demonstração do projeto

- https://www.youtube.com/watch?v=HcAdyfyTh4c
