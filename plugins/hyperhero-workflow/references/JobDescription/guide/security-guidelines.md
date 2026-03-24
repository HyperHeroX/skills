# 安全指南 (Security Guidelines)

> **Version**: 1.0  
> **Last Updated**: 2026-01-31  
> **Maintainer**: HyperHeroX Team  
> **Status**: ✅ Active  
> **Compliance**: OWASP Top 10, CISSP, PCI DSS Level 1

---

## 📋 概述 (Overview)

本文檔定義 HyperHeroX Skills 專案的安全標準與最佳實踐，涵蓋 OWASP Top 10, CISSP, PCI DSS Level 1, Defense in Depth, Zero Trust 等安全框架。所有程式碼與系統設計必須遵循本規範。

---

## 🎯 核心安全原則 (Core Security Principles)

| 原則 | 說明 | 實踐方式 |
|------|------|---------|
| **Defense in Depth** | 多層防禦 | 7 層防禦機制 (Application → Data) |
| **Zero Trust** | 零信任架構 | 每個請求都需驗證, 不信任內網 |
| **Least Privilege** | 最小權限原則 | RBAC (Role-Based Access Control) |
| **Secure by Default** | 預設安全 | 預設 HTTPS, 預設加密, 預設驗證 |
| **Fail Securely** | 安全失效 | 錯誤時拒絕存取, 不暴露敏感資訊 |

---

## 🛡️ Defense in Depth (7 Layers)

依據 **architecture.md (Security Architecture)**，系統採用 **7 層防禦機制**：

```mermaid
graph TD
    subgraph Layer 7: Application
    A1[Input Validation]
    A2[Output Encoding]
    A3[SQL Injection Prevention]
    end
    
    subgraph Layer 6: Authentication
    B1[JWT 15min Access Token]
    B2[bcrypt cost 12]
    B3[MFA TOTP]
    end
    
    subgraph Layer 5: Authorization
    C1[RBAC 5 roles]
    C2[Resource-level Permission]
    C3[Rate Limiting 1000 RPS/IP]
    end
    
    subgraph Layer 4: API Gateway
    D1[Kong JWT Plugin]
    D2[Rate Limiting]
    D3[Request Analytics]
    end
    
    subgraph Layer 3: Network
    E1[AWS VPC]
    E2[Security Groups]
    E3[NACL]
    end
    
    subgraph Layer 2: Transport
    F1[TLS 1.3 HTTPS]
    F2[HSTS Header]
    F3[Certificate Pinning]
    end
    
    subgraph Layer 1: Data
    G1[AES-256 at rest]
    G2[Column-level Encryption PII]
    G3[Database Backup Encryption]
    end
    
    A1 --> B1
    B1 --> C1
    C1 --> D1
    D1 --> E1
    E1 --> F1
    F1 --> G1
```

### Layer 7: Application Security (應用程式安全)

#### Input Validation (輸入驗證)
依據 **coding-standards.md (Security Coding Standards)**：

```typescript
// ✅ CORRECT - 使用 DTO + class-validator
import { IsEmail, IsString, MinLength, MaxLength, Matches } from 'class-validator';

class CreateUserDto {
  @IsString()
  @MinLength(2, { message: '姓名至少 2 個字元' })
  @MaxLength(50, { message: '姓名最多 50 個字元' })
  @Matches(/^[a-zA-Z0-9\u4e00-\u9fa5]+$/, { message: '姓名僅允許中英文與數字' })
  name: string;

  @IsEmail({}, { message: 'Email 格式錯誤' })
  email: string;

  @IsString()
  @MinLength(8, { message: '密碼至少 8 個字元' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/, {
    message: '密碼必須包含大小寫字母、數字與特殊符號'
  })
  password: string;
}

// Controller 自動驗證
@Post('/users')
async createUser(@Body() createUserDto: CreateUserDto) {
  return this.userService.createUser(createUserDto);
}
```

**Validation Rules**:
| 欄位 | 規則 | 錯誤訊息 |
|------|------|---------|
| **Name** | 2-50 字元, 僅中英文數字 | "姓名至少 2 個字元", "姓名僅允許中英文與數字" |
| **Email** | RFC 5322 Email 格式 | "Email 格式錯誤" |
| **Password** | ≥8 字元, 大小寫+數字+特殊符號 | "密碼必須包含大小寫字母、數字與特殊符號" |

#### Output Encoding (輸出編碼)
```typescript
// ✅ CORRECT - Vue 自動 Escape
<template>
  <div>{{ userInput }}</div>  <!-- Vue 自動 escape -->
</template>

// ⚠️ CAUTION - v-html 需手動 Sanitize
<template>
  <div v-html="sanitizedHTML"></div>
</template>

<script setup>
import DOMPurify from 'dompurify';

const sanitizedHTML = DOMPurify.sanitize(userHTML);
</script>
```

#### SQL Injection Prevention (SQL Injection 防護)
依據 **coding-standards.md (Security Coding Standards)**：

```typescript
// ❌ BAD - 字串拼接 (SQL Injection 風險)
const query = `SELECT * FROM users WHERE email = '${email}'`;

// ✅ CORRECT - Parameterized Query
const query = 'SELECT * FROM users WHERE email = $1';
const result = await db.query(query, [email]);
```

```python
# ❌ BAD - Python 字串拼接
query = f"SELECT * FROM users WHERE email = '{email}'"

# ✅ CORRECT - Python Parameterized Query
query = "SELECT * FROM users WHERE email = %s"
cursor.execute(query, (email,))
```

---

### Layer 6: Authentication (身份驗證)

#### JWT 策略 (JWT Strategy)
依據 **AGENTS.md Section 6 (Security Guardrails)** 與 **coding-standards.md**：

```typescript
// ✅ CORRECT - JWT Secret ≥ 32 字元
const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET || JWT_SECRET.length < 32) {
  throw new Error('JWT_SECRET must be at least 32 characters');
}

// ✅ CORRECT - JWT 過期時間
const JWT_ACCESS_EXPIRY = '15m';   // Access Token: 15 minutes
const JWT_REFRESH_EXPIRY = '30d';  // Refresh Token: 30 days

// 生成 Access Token
function generateAccessToken(userId: string): string {
  return jwt.sign({ userId, type: 'access' }, JWT_SECRET, { 
    expiresIn: JWT_ACCESS_EXPIRY,
    issuer: 'hyperherox',
    audience: 'api.hyperherox.com'
  });
}

// 生成 Refresh Token
function generateRefreshToken(userId: string): string {
  return jwt.sign({ userId, type: 'refresh' }, JWT_SECRET, { 
    expiresIn: JWT_REFRESH_EXPIRY,
    issuer: 'hyperherox',
    audience: 'api.hyperherox.com'
  });
}

// 驗證 Token
function verifyToken(token: string): { userId: string; type: string } {
  try {
    return jwt.verify(token, JWT_SECRET) as { userId: string; type: string };
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new Error('Token expired');
    }
    throw new Error('Invalid token');
  }
}
```

**JWT Token 規範**:
| 項目 | 規範 | 備註 |
|------|------|------|
| **Secret 長度** | ≥ 32 字元 | AGENTS.md 強制要求 |
| **Access Token 過期** | 15 分鐘 | 短過期時間降低風險 |
| **Refresh Token 過期** | 30 天 | 避免頻繁登入 |
| **Issuer** | `hyperherox` | 發行者標識 |
| **Audience** | `api.hyperherox.com` | 接收者標識 |

#### Password Hashing (密碼雜湊)
依據 **AGENTS.md Section 6 (Security Guardrails)** 與 **coding-standards.md**：

```typescript
// ✅ CORRECT - bcrypt cost 12 (AGENTS.md 強制要求)
import bcrypt from 'bcrypt';

const SALT_ROUNDS = 12;  // AGENTS.md 強制要求, 禁止使用 sha256

async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}
```

```python
# ✅ CORRECT - Python bcrypt cost 12
import bcrypt

SALT_ROUNDS = 12

def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt(SALT_ROUNDS)).decode('utf-8')

def verify_password(password: str, hash: str) -> bool:
    return bcrypt.checkpw(password.encode('utf-8'), hash.encode('utf-8'))
```

**Password Hashing 規範**:
| 項目 | 規範 | 備註 |
|------|------|------|
| **演算法** | bcrypt or argon2 | AGENTS.md 強制要求 |
| **Cost / Rounds** | 12 | AGENTS.md 強制要求 |
| **禁止使用** | sha256, md5, sha1 | 快速雜湊不安全 |

#### Multi-Factor Authentication (MFA, 多因素驗證)
```typescript
// ✅ CORRECT - TOTP (Time-based One-Time Password)
import * as speakeasy from 'speakeasy';
import * as QRCode from 'qrcode';

// 1. 生成 MFA Secret
async function generateMFASecret(userId: string): Promise<{ secret: string; qrCode: string }> {
  const secret = speakeasy.generateSecret({
    name: `HyperHeroX (${userId})`,
    issuer: 'HyperHeroX',
  });
  
  const qrCode = await QRCode.toDataURL(secret.otpauth_url!);
  
  return { 
    secret: secret.base32,  // 儲存到資料庫
    qrCode  // 顯示 QR Code 給使用者掃描
  };
}

// 2. 驗證 TOTP
function verifyTOTP(secret: string, token: string): boolean {
  return speakeasy.totp.verify({
    secret,
    encoding: 'base32',
    token,
    window: 2,  // 允許前後 2 個時間窗口 (60s)
  });
}

// 3. 登入流程 (含 MFA)
async function loginWithMFA(email: string, password: string, totpToken: string) {
  // Step 1: 驗證密碼
  const user = await userRepository.findByEmail(email);
  if (!user || !(await verifyPassword(password, user.passwordHash))) {
    throw new Error('Invalid credentials');
  }
  
  // Step 2: 驗證 TOTP
  if (!verifyTOTP(user.mfaSecret, totpToken)) {
    throw new Error('Invalid MFA token');
  }
  
  // Step 3: 生成 JWT
  return {
    accessToken: generateAccessToken(user.id),
    refreshToken: generateRefreshToken(user.id),
  };
}
```

---

### Layer 5: Authorization (授權)

#### RBAC (Role-Based Access Control)
```typescript
// ✅ CORRECT - RBAC 5 Roles
enum UserRole {
  ADMIN = 'admin',      // 系統管理員 (全權限)
  USER = 'user',        // 一般使用者 (瀏覽, 下單)
  VENDOR = 'vendor',    // 供應商 (商品管理, 庫存)
  CS = 'cs',            // 客服 (查看訂單, 回覆問題)
  GUEST = 'guest',      // 訪客 (僅瀏覽)
}

// Permission Definition
const permissions = {
  [UserRole.ADMIN]: ['*'],  // 全權限
  [UserRole.USER]: ['product:read', 'order:create', 'order:read'],
  [UserRole.VENDOR]: ['product:*', 'inventory:*'],
  [UserRole.CS]: ['order:read', 'ticket:*'],
  [UserRole.GUEST]: ['product:read'],
};

// 權限檢查 Guard
@Injectable()
export class PermissionGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;  // 從 JWT 解析
    const requiredPermission = this.reflector.get<string>('permission', context.getHandler());
    
    // 檢查是否有權限
    const userPermissions = permissions[user.role];
    return userPermissions.includes('*') || userPermissions.includes(requiredPermission);
  }
}

// 使用範例
@Post('/products')
@RequirePermission('product:create')
async createProduct(@Body() productDto: CreateProductDto) {
  return this.productService.createProduct(productDto);
}
```

#### Resource-level Permission (資源級權限)
```typescript
// ✅ CORRECT - 檢查資源擁有者
@Get('/orders/:id')
async getOrder(@Param('id') orderId: string, @User() user: UserInfo) {
  const order = await this.orderRepository.findById(orderId);
  
  // 資源級權限檢查
  if (user.role === UserRole.USER && order.userId !== user.id) {
    throw new ForbiddenException('You can only view your own orders');
  }
  
  return order;
}
```

#### Rate Limiting (速率限制)
依據 **architecture.md (Auto Scaling Rules)**：

```typescript
// ✅ CORRECT - Kong Rate Limiting
// kong.yml
plugins:
  - name: rate-limiting
    config:
      minute: 1000   # 每 IP 每分鐘 1000 次請求
      hour: 50000    # 每 IP 每小時 50000 次請求
      policy: local
      fault_tolerant: true

// ✅ CORRECT - Application-level Rate Limiting (備用)
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 60 * 1000,  // 1 minute
  max: 1000,             // 1000 requests per minute per IP
  message: 'Too many requests, please try again later',
});

app.use('/api', limiter);
```

---

### Layer 4: API Gateway Security

#### Kong JWT Plugin
```yaml
# kong.yml
services:
  - name: user-service
    url: http://user-service:3000
    routes:
      - name: user-route
        paths:
          - /api/users
    plugins:
      - name: jwt
        config:
          secret_is_base64: false
          claims_to_verify:
            - exp  # 驗證過期時間
            - iss  # 驗證發行者
            - aud  # 驗證接收者
      - name: rate-limiting
        config:
          minute: 1000
      - name: request-size-limiting
        config:
          allowed_payload_size: 10  # 10 MB
```

---

### Layer 3: Network Security

#### AWS VPC Configuration
```terraform
# vpc.tf
resource "aws_vpc" "main" {
  cidr_block = "10.0.0.0/16"
  enable_dns_support = true
  enable_dns_hostnames = true
  
  tags = {
    Name = "hyperherox-vpc"
  }
}

# Public Subnet (API Gateway, Load Balancer)
resource "aws_subnet" "public" {
  vpc_id = aws_vpc.main.id
  cidr_block = "10.0.1.0/24"
  availability_zone = "ap-northeast-1a"
  map_public_ip_on_launch = true
}

# Private Subnet (Microservices, Database)
resource "aws_subnet" "private" {
  vpc_id = aws_vpc.main.id
  cidr_block = "10.0.2.0/24"
  availability_zone = "ap-northeast-1a"
  map_public_ip_on_launch = false
}

# Security Group (API Gateway)
resource "aws_security_group" "api_gateway" {
  vpc_id = aws_vpc.main.id
  
  ingress {
    from_port = 443
    to_port = 443
    protocol = "tcp"
    cidr_blocks = ["0.0.0.0/0"]  # HTTPS from Internet
  }
  
  egress {
    from_port = 0
    to_port = 0
    protocol = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

# Security Group (Microservices)
resource "aws_security_group" "microservices" {
  vpc_id = aws_vpc.main.id
  
  ingress {
    from_port = 3000
    to_port = 3000
    protocol = "tcp"
    security_groups = [aws_security_group.api_gateway.id]  # 僅允許 API Gateway
  }
  
  egress {
    from_port = 0
    to_port = 0
    protocol = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}
```

---

### Layer 2: Transport Security

#### TLS 1.3 Configuration
```nginx
# nginx.conf
server {
    listen 443 ssl http2;
    server_name api.hyperherox.com;
    
    # TLS 1.3 Only
    ssl_protocols TLSv1.3;
    
    # Certificate
    ssl_certificate /etc/nginx/ssl/cert.pem;
    ssl_certificate_key /etc/nginx/ssl/key.pem;
    
    # HSTS Header (HTTP Strict Transport Security)
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;
    
    # Security Headers
    add_header X-Frame-Options "DENY" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline';" always;
    
    location / {
        proxy_pass http://api-gateway:8000;
    }
}
```

---

### Layer 1: Data Security

#### Encryption at Rest (靜態加密)
```typescript
// ✅ CORRECT - AES-256 Encryption
import crypto from 'crypto';

const ENCRYPTION_KEY = Buffer.from(process.env.ENCRYPTION_KEY!, 'hex');  // 32 bytes
const ALGORITHM = 'aes-256-gcm';

function encrypt(text: string): { encrypted: string; iv: string; tag: string } {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(ALGORITHM, ENCRYPTION_KEY, iv);
  
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  const tag = cipher.getAuthTag();
  
  return {
    encrypted,
    iv: iv.toString('hex'),
    tag: tag.toString('hex'),
  };
}

function decrypt(encrypted: string, iv: string, tag: string): string {
  const decipher = crypto.createDecipheriv(
    ALGORITHM,
    ENCRYPTION_KEY,
    Buffer.from(iv, 'hex')
  );
  
  decipher.setAuthTag(Buffer.from(tag, 'hex'));
  
  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  
  return decrypted;
}

// PII 欄位加密
async function createUser(userDto: CreateUserDto) {
  const { name, email, phone } = userDto;
  
  // 加密 PII 欄位
  const encryptedPhone = encrypt(phone);
  
  return userRepository.create({
    name,  // Name 不加密 (可搜尋)
    email,  // Email 不加密 (可搜尋)
    phone_encrypted: encryptedPhone.encrypted,
    phone_iv: encryptedPhone.iv,
    phone_tag: encryptedPhone.tag,
  });
}
```

---

## 🔒 OWASP Top 10 Mitigation

---

## 📖 進階安全主題

以下進階主題已拆分至獨立文件：

- **OWASP Top 10**: [security-advanced-guide.md](./security-advanced-guide.md#-owasp-top-10-mitigation)
- **PCI DSS Compliance**: [security-advanced-guide.md](./security-advanced-guide.md#-pci-dss-level-1-compliance)
- **Security Testing**: [security-advanced-guide.md](./security-advanced-guide.md#-security-testing)
- **Security Monitoring**: [security-advanced-guide.md](./security-advanced-guide.md#-security-monitoring)
- **Incident Response**: [security-advanced-guide.md](./security-advanced-guide.md#-incident-response)

---

## 📚 參考資料

- [security-advanced-guide.md](./security-advanced-guide.md) - 進階安全主題
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [OWASP Cheat Sheets](https://cheatsheetseries.owasp.org/)
