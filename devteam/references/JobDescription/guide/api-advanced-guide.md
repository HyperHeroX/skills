# API Advanced Guide (API 進階指南)

> 本文件為 `api-design-guide.md` 的進階章節，涵蓋 API 文檔、gRPC 與 GraphQL。
>
> **前置閱讀**: `api-design-guide.md` (RESTful API 設計標準)

---

## 📖 API 文檔標準 (API Documentation)

### OpenAPI (Swagger) 規範

```yaml
openapi: 3.0.3
info:
  title: HyperHeroX API
  version: 1.0.0
  description: HyperHeroX E-Commerce Platform API

servers:
  - url: https://api.hyperherox.com/api/v1
    description: Production Server

tags:
  - name: Authentication
  - name: Users
  - name: Products
  - name: Orders
```

### 文檔工具比較

| 工具 | 用途 | 優點 |
|------|------|------|
| **Swagger UI** | API 文檔介面 | ✅ 互動式測試 |
| **Redoc** | 優雅文檔介面 | ✅ 美觀易讀 |
| **Postman** | API 測試工具 | ✅ 團隊協作 |

---

## 🚀 gRPC API 設計標準

### gRPC vs RESTful

| 特性 | gRPC | RESTful |
|------|------|---------|
| 協議 | HTTP/2 + Protobuf | HTTP/1.1 + JSON |
| 效能 | ✅ 高效能 (二進位) | ⚠️ 較慢 (JSON) |
| 延遲 | ✅ < 5ms | ⚠️ 20-50ms |
| 型別安全 | ✅ 強型別 | ❌ 弱型別 |
| 瀏覽器 | ❌ 需 gRPC-Web | ✅ 原生支援 |
| 適用 | 內部微服務 | 對外 API |

### Protocol Buffers

```protobuf
syntax = "proto3";
package user;

service UserService {
  rpc GetUser (GetUserRequest) returns (GetUserResponse);
  rpc CreateUser (CreateUserRequest) returns (CreateUserResponse);
  rpc ListUsers (ListUsersRequest) returns (ListUsersResponse);
}

message User {
  int64 id = 1;
  string name = 2;
  string email = 3;
  string role = 4;
}

message GetUserRequest {
  int64 id = 1;
}

message GetUserResponse {
  User user = 1;
}
```

---

## 📊 GraphQL API 設計標準

### GraphQL 優缺點

| 優點 | 缺點 |
|------|------|
| ✅ 靈活查詢 (客戶端決定欄位) | ❌ 複雜度高 |
| ✅ 避免 Over-fetching | ❌ 快取較難 |
| ✅ 單一端點 | ❌ N+1 查詢問題 |
| ✅ 強型別 Schema | ❌ 學習曲線 |

### GraphQL Schema

```graphql
type Query {
  user(id: ID!): User
  users(page: Int, limit: Int): UserConnection
  product(id: ID!): Product
}

type Mutation {
  login(email: String!, password: String!): AuthPayload!
  createUser(input: CreateUserInput!): User!
  updateUser(id: ID!, input: UpdateUserInput!): User!
}

type User {
  id: ID!
  name: String!
  email: String!
  role: UserRole!
  orders: [Order!]!
}

enum UserRole {
  ADMIN
  USER
  VENDOR
}

type UserConnection {
  edges: [UserEdge!]!
  pageInfo: PageInfo!
  totalCount: Int!
}

input CreateUserInput {
  name: String!
  email: String!
  password: String!
}
```

### GraphQL 最佳實踐

1. **N+1 問題**: 使用 DataLoader 批次查詢
2. **分頁**: 使用 Cursor-based Pagination
3. **錯誤處理**: 使用 Union Types 處理錯誤
4. **效能**: 設定查詢深度限制

---

## 📚 參考資料

### 內部文檔
- [api-design-guide.md](./api-design-guide.md) - RESTful API 設計
- [tech-stack.md](./tech-stack.md) - API Gateway, 後端框架
- [security-guidelines.md](./security-guidelines.md) - 認證授權

### 外部資源
- [gRPC Documentation](https://grpc.io/docs/)
- [GraphQL Specification](https://graphql.org/learn/)
- [OpenAPI Specification](https://swagger.io/specification/)
