# **Documentação da API - Chat Application**

## **Índice**
1. [Visão Geral](#visão-geral)
2. [Estrutura do Projeto](#estrutura-do-projeto)
3. [Rotas da API](#rotas-da-api)
4. [WebSocket](#websocket)
5. [Banco de Dados](#banco-de-dados)
6. [Autenticação](#autenticação)
7. [Configuração](#configuração)
8. [Como Executar](#como-executar)
9. [Exemplos de Uso](#exemplos-de-uso)
10. [Fluxo do Aplicativo](#fluxo-do-aplicativo)

---

## **Visão Geral**
API REST para sistema de chat em tempo real com:
- Autenticação via token/cookie
- Sistema de amigos/pedidos
- Chats privados e em grupo
- Mensagens em tempo real via WebSocket
- Busca de usuários

**Tecnologias:** Node.js, Express, TypeScript, MySQL, WebSocket

---

## **Estrutura do Projeto**
```
src/
├── index.ts              # Ponto de entrada
├── app.ts               # Configuração Express
├── server.ts            # Servidor HTTP + WebSocket
│
├── config/              # Configurações
│   ├── env.ts          # Variáveis de ambiente
│   └── cors.ts         # Configuração CORS
│
├── middleware/          # Middlewares
│   └── auth.ts         # Verificação de autenticação
│
├── utils/              # Utilitários
│   ├── token.ts        # Geração de tokens/IDs
│   ├── crypto.ts       # Hash de senhas
│   └── chat.helpers.ts # Funções auxiliares para chats
│
├── controllers/        # Controladores das rotas
│   ├── auth.controller.ts
│   ├── chat.controller.ts
│   ├── user.controller.ts
│   └── pedido.controller.ts
│
├── routes/            # Definição de rotas
│   ├── index.ts      # Agrupador de rotas (/api)
│   ├── auth.routes.ts
│   ├── chat.routes.ts
│   ├── user.routes.ts
│   └── pedido.routes.ts
│
├── models/           # Acesso ao banco de dados
│   └── models.ts     # Funções do banco
│
└── websocket/        # WebSocket
    ├── server.ts     # Configuração do servidor WS
    ├── handlers.ts   # Handlers de eventos
    └── types.ts      # Tipos TypeScript
```

---

## **Rotas da API**
Todas as rotas são prefixadas com `/api`

### **Autenticação (`/api/auth`)**
| Método | Rota | Descrição | Autenticação |
|--------|------|-----------|--------------|
| POST | `/login` | Login de usuário | ❌ |
| POST | `/signup` | Cadastro de usuário | ❌ |

### **Chats (`/api/chats`)**
| Método | Rota | Descrição | Autenticação |
|--------|------|-----------|--------------|
| POST | `/` | Lista todos os chats do usuário | ❌ |
| PUT | `/new_msg` | Envia nova mensagem | ❌ |
| PUT | `/new_chat` | Cria novo chat | ❌ |

### **Usuários (`/api/users`)**
| Método | Rota | Descrição | Autenticação |
|--------|------|-----------|--------------|
| GET | `/status` | Status do usuário autenticado | ✅ |
| GET | `/search/:user_name` | Busca usuário por nome | ❌ |
| POST | `/` | Obtém múltiplos usuários por IDs | ❌ |

### **Pedidos (`/api/pedidos`)**
| Método | Rota | Descrição | Autenticação |
|--------|------|-----------|--------------|
| DELETE | `/` | Remove um pedido | ❌ |

### **Rota Geral**
| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/` | Health check da API |

---

## **WebSocket**
**Endpoint:** `ws://localhost:3000`
**Parâmetro de conexão:** `?userId=<ID_DO_USUARIO>`

### **Eventos Suportados**
```typescript
// Enviar nova mensagem
{
  "titulo": "newMsg",
  "body": {
    "content": "Texto da mensagem",
    "chat": { /* objeto chat completo */ }
  }
}

// Receber nova mensagem
{
  "titulo": "newMsg",
  "conteudo": "Texto da mensagem",
  "chat_id": "id_do_chat",
  "user_id": 123,
  "enviado_em": "2024-01-20T10:30:00.000Z"
}
```

---

## **Banco de Dados**
### **Tabelas Principais**
```sql
-- Usuários
CREATE TABLE users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_name VARCHAR(100),
  email_address VARCHAR(100) UNIQUE,
  password_hash VARCHAR(255),
  profile_img VARCHAR(255)
);

-- Tokens de acesso
CREATE TABLE tokens (
  id INT PRIMARY KEY AUTO_INCREMENT,
  token VARCHAR(255) UNIQUE,
  user_id INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Chats
CREATE TABLE chats (
  id VARCHAR(36) PRIMARY KEY,
  tipo ENUM('privado', 'grupo'),
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Participantes do chat
CREATE TABLE chat_users (
  chat_id VARCHAR(36),
  user_id INT,
  PRIMARY KEY (chat_id, user_id)
);

-- Mensagens
CREATE TABLE messages (
  id INT PRIMARY KEY AUTO_INCREMENT,
  chat_id VARCHAR(36),
  user_id INT,
  conteudo TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Pedidos de amizade
CREATE TABLE pedidos (
  id INT PRIMARY KEY AUTO_INCREMENT,
  fromto VARCHAR(100)  -- Formato: "id1,id2"
);
```

---

## **Autenticação**
### **Sistema de Tokens**
- Token gerado: `[10_caracteres_aleatórios]ty[IP_limpo]`
- Armazenado em cookie: `access_token`
- Validade: 10 horas
- Verificado por IP para segurança

### **Middleware `verifyAuth`**
```typescript
// Protege rotas que requerem autenticação
app.get('/status', verifyAuth, UserController.getStatus);
```

---

## **Configuração**
### **Arquivo `.env`**
```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=sua_senha
DB_NAME=nome_do_banco
PORT=3000
LAN_HOST=http://localhost:3000
NODE_ENV=development
```

### **Configuração TypeScript (`tsconfig.json`)**
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true
  }
}
```

---

## **Como Executar**
### **1. Instalação**
```bash
npm install
```

### **2. Configuração do Banco**
```bash
# 1. Crie o banco de dados
# 2. Execute as queries de criação de tabelas
# 3. Configure o .env com suas credenciais
```

### **3. Modos de Execução**
```bash
# Desenvolvimento (com recarregamento automático)
npm run dev

# Build para produção
npm run build

# Produção
npm start
```

### **4. Verificação**
```bash
# Verificar se o servidor está rodando
curl http://localhost:3000/

# Deve retornar:
# {"status":"online","message":"API funcionando","timestamp":"..."}
```

---

## **Exemplos de Uso**
### **1. Cadastro de Usuário**
```bash
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "userName": "João Silva",
    "emailAddress": "joao@email.com",
    "password": "senha123",
    "profileImg": "avatar.jpg"
  }'
```

### **2. Login**
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"joao@email.com","password":"senha123"}' \
  -c cookies.txt
```

### **3. Ver Status (autenticado)**
```bash
curl -X GET http://localhost:3000/api/users/status \
  -b cookies.txt
```

### **4. Buscar Usuário**
```bash
curl -X GET "http://localhost:3000/api/users/search/joao"
```

### **5. Obter Chats**
```bash
curl -X POST http://localhost:3000/api/chats \
  -H "Content-Type: application/json" \
  -d '{"id": 1}'
```

### **6. Enviar Mensagem (HTTP)**
```bash
curl -X PUT http://localhost:3000/api/chats/new_msg \
  -H "Content-Type: application/json" \
  -d '{
    "chatId": "chat_123",
    "conteudo": "Olá!",
    "userId": 1
  }'
```

---

## **Fluxo do Aplicativo**
### **Fluxo Completo de Usuário Novo**
1. **Cadastro** → `POST /api/auth/signup`
2. **Login** → `POST /api/auth/login` (recebe cookie)
3. **Verificar status** → `GET /api/users/status` (vazio inicialmente)
4. **Buscar amigos** → `GET /api/users/search/:nome`
5. **Enviar pedido de amizade** → *(via WebSocket - não tem rota HTTP)*
6. **Aceitar pedido** → `PUT /api/chats/new_chat` + `DELETE /api/pedidos`
7. **Iniciar conversa** → `PUT /api/chats/new_msg` (HTTP) ou WebSocket

### **Fluxo de Mensagens**
```
Usuário A (WebSocket conectado)
     ↓
Envia mensagem via WS "newMsg"
     ↓
Servidor: Salva no banco (putMessage)
     ↓
Servidor: Identifica destinatários no chat
     ↓
Servidor: Envia via WS para Usuário B
     ↓
Usuário B: Recebe mensagem em tempo real
```

---

## **Dicas para Manutenção Futura**

### **1. Se Esquecer Como Rodar:**
```bash
# Sempre comece por aqui
npm install
cp .env.example .env  # (se tiver)
# Edite o .env com suas credenciais
npm run dev
```

### **2. Problemas Comuns:**
- **Porta em uso:** `lsof -ti:3000 | xargs kill -9`
- **Erro de conexão DB:** Verifique `.env` e se o MySQL está rodando
- **Erros TypeScript:** `npx tsc --noEmit` para ver erros de tipo

### **3. Para Adicionar Nova Rota:**
1. Crie função no controller
2. Adicione rota no arquivo de rotas
3. Importe no `routes/index.ts`
4. Teste com curl/Postman

### **4. Para Depurar:**
```bash
# Ver logs do servidor
npm run dev  # mostra todos os logs

# Testar conexão WebSocket
wscat -c "ws://localhost:3000?userId=1"

# Verificar saúde da API
curl http://localhost:3000/
```

---

## **Considerações de Segurança**
1. **Senhas:** Hash SHA256 (melhorar para bcrypt futuramente)
2. **Tokens:** Vinculados ao IP do usuário
3. **CORS:** Configurado apenas para origem específica
4. **Cookies:** HttpOnly para prevenir XSS

---

## **Melhorias Futuras**
1. [ ] Implementar bcrypt para senhas
2. [ ] Adicionar rate limiting
3. [ ] Implementar refresh tokens
4. [ ] Adicionar logging estruturado
5. [ ] Criar documentação Swagger/OpenAPI
6. [ ] Adicionar testes unitários e de integração

---

*Documentação criada em: Janeiro 2024*  
*Última atualização: Janeiro 2024*  
*Mantenha este arquivo atualizado conforme mudanças na API!*

---

**Precisa de ajuda?**  
1. Verifique os logs do servidor  
2. Confira se todas as tabelas existem no banco  
3. Teste as rotas individualmente com curl  
4. Verifique conexão WebSocket com wscat