---
name: dotnet-enterprise
description: '.NET 10 企業級系統開發規範。基於 Clean Architecture + DDD 模式，涵蓋四層架構（Domain/Application/Infrastructure/Presentation）、CQRS with MediatR、FluentValidation Pipeline、Ardalis.Result 錯誤處理、Testcontainers 整合測試、.NET Aspire 雲原生調度。使用時機：(1) .NET/C# 專案開發，(2) Web API 端點建立，(3) Domain Entity 設計，(4) MediatR Command/Query 實作，(5) 整合測試撰寫，(6) 架構合規檢查，(7) 微服務配置。觸發關鍵字：.NET、C#、ASP.NET、Entity Framework、EF Core、Clean Architecture、DDD、MediatR、CQRS、Dapper、FluentValidation、xUnit、NSubstitute、Testcontainers、Aspire、Minimal API、Polly、Serilog、Native AOT。'
---

# .NET 10 Enterprise System Guidelines

**適用範圍**: .NET 10 企業級系統開發
**架構模式**: Clean Architecture + DDD (Domain-Driven Design)
**核心目標**: 高度解耦、業務邏輯集中、自動化測試覆蓋、雲原生就緒
**DDD 適用原則**: 根據業務複雜度決定 DDD 介入深度。簡單 CRUD 不需要強制使用 Aggregates/Value Objects，避免過度工程化。

---

## 專案架構 (Solution Structure)

嚴格遵循四層依賴規則：**Domain ← Application ← Infrastructure ← Presentation**

依賴方向只能向內，外層可依賴內層，內層禁止依賴外層。

### 1. Domain (核心層) — 零依賴

**原則：** 禁止引用任何第三方框架（包括 EF Core）。這是最核心、最純粹的層次。

**組成：**
- **Entities / Aggregate Roots：** Rich Domain Model，屬性 `private set`，透過行為方法改變狀態
- **Value Objects：** 不可變物件，用於表達領域概念
- **Domain Events：** 解耦領域內的副作用
- **Domain Exceptions：** 領域專屬例外
- **Repository Interfaces：** 抽象定義，實作在 Infrastructure

```csharp
// ✅ 正確：Rich Domain Model
public class Order : AggregateRoot
{
    public string CustomerName { get; private set; }
    public OrderStatus Status { get; private set; }

    public static Order Create(string customerName)
    {
        var order = new Order { CustomerName = customerName, Status = OrderStatus.Pending };
        order.AddDomainEvent(new OrderCreatedEvent(order.Id));
        return order;
    }

    public void Cancel(string reason)
    {
        if (Status == OrderStatus.Shipped)
            throw new DomainException("Cannot cancel shipped order.");

        Status = OrderStatus.Cancelled;
        AddDomainEvent(new OrderCancelledEvent(Id, reason));
    }
}

// ❌ 錯誤：Anemic Model
public class Order
{
    public string CustomerName { get; set; }  // 禁止 public set
    public OrderStatus Status { get; set; }
}
```

### 2. Application (應用層) — 僅依賴 Domain

定義「要做什麼」，不涉及「怎麼做」。使用 **MediatR (CQRS)** 模式，每個功能包含：

| 組件 | 職責 |
|------|------|
| `Command/Query` | MediatR `IRequest` 定義，封裝請求參數 |
| `Handler` | `IRequestHandler` 實作業務編排 |
| `Validator` | `AbstractValidator<T>` 集中驗證邏輯 |
| `Behaviors` | `IPipelineBehavior` 處理橫切關注點（日誌、驗證、交易） |
| `Mappings` | Mapperly（Source Generator）進行高效能 DTO 轉換 |

```csharp
// Command — 封裝請求
public record CreateOrderCommand(string CustomerName, List<OrderItemDto> Items)
    : IRequest<Result<Guid>>;

// Validator — 驗證邏輯集中於此，透過 Pipeline 自動執行
public class CreateOrderCommandValidator : AbstractValidator<CreateOrderCommand>
{
    public CreateOrderCommandValidator()
    {
        RuleFor(x => x.CustomerName).NotEmpty().MaximumLength(200);
        RuleFor(x => x.Items).NotEmpty();
    }
}

// Handler — 只處理業務編排，不寫驗證 if
public class CreateOrderHandler : IRequestHandler<CreateOrderCommand, Result<Guid>>
{
    private readonly IOrderRepository _repo;

    public CreateOrderHandler(IOrderRepository repo) => _repo = repo;

    public async Task<Result<Guid>> Handle(
        CreateOrderCommand request, CancellationToken cancellationToken)
    {
        // ❌ 禁止：if (string.IsNullOrEmpty(request.CustomerName)) ...
        // ✅ 驗證已由 ValidationBehavior 在 Pipeline 中完成
        var order = Order.Create(request.CustomerName);
        await _repo.AddAsync(order, cancellationToken);
        return Result.Success(order.Id);
    }
}
```

**FluentValidation Pipeline 整合：**

```csharp
// ValidationBehavior — 在 Handler 之前自動攔截並驗證
public class ValidationBehavior<TRequest, TResponse>
    : IPipelineBehavior<TRequest, TResponse>
    where TRequest : IRequest<TResponse>
{
    private readonly IEnumerable<IValidator<TRequest>> _validators;

    public ValidationBehavior(IEnumerable<IValidator<TRequest>> validators)
        => _validators = validators;

    public async Task<TResponse> Handle(TRequest request,
        RequestHandlerDelegate<TResponse> next, CancellationToken ct)
    {
        var context = new ValidationContext<TRequest>(request);
        var failures = _validators
            .Select(v => v.Validate(context))
            .SelectMany(r => r.Errors)
            .Where(f => f != null)
            .ToList();

        if (failures.Any())
            throw new ValidationException(failures);

        return await next();
    }
}
```

### 3. Infrastructure (基礎建設層) — 實作 Domain 定義的介面

| 組件 | 說明 |
|------|------|
| **EF Core DbContext** | 使用 `IEntityTypeConfiguration<T>` Fluent API，禁止 Domain 使用 Attribute |
| **Repository 實作** | 實作 Domain 層定義的 Repository Interface |
| **Dapper 查詢** | 複雜/效能敏感查詢優先使用 Dapper |
| **外部服務** | API 客戶端（支付、郵件）、檔案系統、Identity Services |
| **Migrations** | EF Core 資料庫遷移 |

```csharp
// EF Core Configuration — 設定集中於 Infrastructure
public class OrderConfiguration : IEntityTypeConfiguration<Order>
{
    public void Configure(EntityTypeBuilder<Order> builder)
    {
        builder.HasKey(x => x.Id);
        builder.Property(x => x.CustomerName).HasMaxLength(200).IsRequired();
        builder.HasIndex(x => x.Status);
        // Value Object 轉換
        builder.Property(x => x.Email).HasConversion(
            v => v.Value, v => Email.Create(v));
    }
}
```

### 4. Presentation (呈現層) — 入口與調度

- .NET 10 Web API (Minimal APIs or Controllers)
- Controller/Endpoint 保持極簡，僅負責 `_mediator.Send(command)`
- 透過 **.NET Aspire** 進行服務調度與監控
- Middleware 配置、Swagger/Scalar API 文檔

```csharp
// Minimal API — 薄薄一層，只做調度
app.MapPost("/api/orders", async (
    CreateOrderCommand command,
    IMediator mediator,
    CancellationToken ct) =>
{
    var result = await mediator.Send(command, ct);
    return result.IsSuccess
        ? Results.Created($"/api/orders/{result.Value}", result.Value)
        : Results.BadRequest(result.Errors);
});
```

---

## 技術棧規範 (The Stack)

### 核心工具

| 類別 | 工具 | 用途 |
|------|------|------|
| 架構 | Clean Architecture + DDD | 四層解耦，依賴反轉 |
| CQRS | MediatR | Command/Query 分離，Controller 極簡化 |
| 驗證 | FluentValidation | Pipeline 自動化驗證，宣告式規則 |
| 錯誤處理 | Ardalis.Result\<T\> | 替代 Exception 控管業務流程 |
| ORM | EF Core + Dapper | 寫入用 EF Core，複雜查詢用 Dapper |
| 映射 | Mapperly | Source Generator，編譯時期 DTO 轉換 |
| 依賴注入 | Built-in DI | .NET 內建已足夠，除非極特殊需求才用 Autofac |
| API 文檔 | Scalar / Swagger | .NET 9+ 以 Scalar 作為更現代的文檔選擇 |

### 雲原生與可觀測性

| 類別 | 工具 | 用途 |
|------|------|------|
| 服務調度 | .NET Aspire | 本機開發指揮官：服務發現、連線管理、監控儀表板 |
| 結構化日誌 | Serilog + OpenTelemetry | 搭配 Grafana 或 Seq 進行分散式追蹤 |
| 彈性處理 | Polly | API 重試、斷路器 (Circuit Breaker)、逾時策略 |

### 效能最佳化

| 類別 | 工具 | 用途 |
|------|------|------|
| 唯讀集合 | Frozen Collections | .NET 8/9+ 新集合類型，提升唯讀資料存取速度 |
| 啟動優化 | Native AOT | 容器/Lambda 部署，極大縮短啟動時間與記憶體占用 |

### 測試工具

| 類別 | 工具 | 用途 |
|------|------|------|
| 單元測試 | xUnit | 測試框架 |
| 斷言 | FluentAssertions | 自然語言風格斷言 |
| Mock | NSubstitute | 比 Moq 更簡潔且無爭議 |
| 整合測試 | Testcontainers | 真實 Docker 容器（DB/Redis） |
| 架構守護 | NetArchTest | 自動化層次依賴合規檢查 |

---

## .NET Aspire — 雲原生開發調度

Aspire 是微服務開發的指揮官，不是執行環境，而是本機開發的調度中心。

**關鍵功能：**

| 功能 | 說明 |
|------|------|
| **App Host** | 一個專案定義 API、Frontend、Redis、Database 等資源，F5 全部啟動 |
| **自動化配置** | 自動處理連接字串和服務發現 (Service Discovery) |
| **Dashboard** | 內建監控面板，即時查看 Handler 執行耗時、日誌、OpenTelemetry 追蹤 |
| **元件註冊** | 新服務在 AppHost 專案中註冊 |

**Aspire 整合範例：**

```csharp
// AppHost/Program.cs
var builder = DistributedApplication.CreateBuilder(args);

var postgres = builder.AddPostgres("db").AddDatabase("ordersdb");
var redis = builder.AddRedis("cache");

builder.AddProject<Projects.OrderApi>("order-api")
    .WithReference(postgres)
    .WithReference(redis);

builder.Build().Run();
```

---

## 異步處理規則

所有 async 方法必須支援 `CancellationToken`：

```csharp
// ✅ 正確
Task<Result<Order>> GetByIdAsync(Guid id, CancellationToken ct);

// ❌ 錯誤
Task<Result<Order>> GetByIdAsync(Guid id);
```

---

## Coding Standards

| 規則 | 說明 |
|------|------|
| 命名 | PascalCase（類別/方法），camelCase（私有欄位，前綴 `_`） |
| 安全 | 所有 async 方法必須傳遞 `CancellationToken` |
| 驗證 | 禁止在 Handler 內寫 `if` 驗證，使用 `AbstractValidator<T>` |
| 錯誤 | 使用 `Ardalis.Result<T>` 或全域例外處理，避免用 Exception 控管業務流程 |
| DI | 偏好 Constructor Injection。DbContext 與 Handler 使用 Scoped |
| EF Core | Value Object 使用 `HasConversion` 在 `OnModelCreating` 中配置 |

---

## 測試策略 (Testing)

追求「有價值的測試」，而非 100% 覆蓋率。

### Unit Tests — Domain + Application

使用 `xUnit` + `NSubstitute` + `FluentAssertions`。
**重點：** 針對 Domain 層業務邏輯進行地毯式測試。

```csharp
public class CreateOrderHandlerTests
{
    private readonly IOrderRepository _repo = Substitute.For<IOrderRepository>();

    [Fact]
    public async Task Handle_ValidCommand_ReturnsSuccessWithId()
    {
        var handler = new CreateOrderHandler(_repo);
        var command = new CreateOrderCommand("Customer", new List<OrderItemDto> { ... });

        var result = await handler.Handle(command, CancellationToken.None);

        result.IsSuccess.Should().BeTrue();
        result.Value.Should().NotBeEmpty();
        await _repo.Received(1).AddAsync(Arg.Any<Order>(), Arg.Any<CancellationToken>());
    }
}
```

### Integration Tests — Testcontainers（真實資料庫）

使用 `WebApplicationFactory` + `Testcontainers` 測試完整 API slice。
禁止使用 In-Memory Database（行為與真實 DB 不一致）。

```csharp
public class OrderIntegrationTests : IAsyncLifetime
{
    private readonly MsSqlContainer _dbContainer = new MsSqlBuilder()
        .WithImage("mcr.microsoft.com/mssql/server:2022-latest")
        .Build();

    public Task InitializeAsync() => _dbContainer.StartAsync();
    public Task DisposeAsync() => _dbContainer.DisposeAsync().AsTask();

    [Fact]
    public async Task CreateOrder_PersistsToDatabase()
    {
        await using var context = CreateDbContext(_dbContainer.GetConnectionString());
        // 每次測試都是乾淨、全新的資料庫實例
        // 開發機與 CI/CD 環境完全一致
    }
}
```

### Architecture Tests — 層次依賴守護

使用 `NetArchTest` 自動化檢查架構合規，防止架構腐壞：

```csharp
[Fact]
public void Domain_Should_Not_Reference_Infrastructure()
{
    Types.InAssembly(typeof(Order).Assembly)
        .ShouldNot()
        .HaveDependencyOn("Infrastructure")
        .GetResult()
        .IsSuccessful.Should().BeTrue();
}

[Fact]
public void Application_Should_Not_Reference_Presentation()
{
    Types.InAssembly(typeof(CreateOrderCommand).Assembly)
        .ShouldNot()
        .HaveDependencyOn("Presentation")
        .GetResult()
        .IsSuccessful.Should().BeTrue();
}
```

---

## 禁忌清單 (Anti-Patterns)

以下模式在 code review 時必須被攔截：

| 禁止事項 | 原因 | 正確做法 |
|----------|------|----------|
| Domain 實體使用 `public set` | 破壞封裝，允許外部任意修改狀態 | 使用 `private set` + 行為方法 |
| Handler 中直接注入 `DbContext` | 破壞 Clean Architecture 依賴規則 | 透過 Repository Interface |
| Handler 內寫 `if` 驗證邏輯 | 驗證應集中在 Pipeline | 使用 `AbstractValidator<T>` + `ValidationBehavior` |
| In-Memory Database 做整合測試 | 行為與真實 DB 不一致，無法捕捉 SQL 問題 | 使用 Testcontainers |
| API 層編寫業務邏輯 | Presentation 層應只做調度 | 邏輯放入 Domain/Application |
| Domain 引用 EF Core Attribute | Domain 必須零依賴 | 使用 Fluent API Configuration |
| 使用 Exception 控管業務流程 | 效能差且語意不清 | 使用 `Ardalis.Result<T>` |
| 省略 `CancellationToken` 參數 | 無法正確取消長時間操作 | 所有 async 方法必須傳遞 |
| 簡單 CRUD 強制套用完整 DDD | 過度工程化，增加不必要的開發負擔 | 根據業務複雜度決定 DDD 介入深度 |
| Controller 注入多個 Service | 耦合度高，職責不清 | 僅注入 `IMediator`，透過 Command/Query 分發 |

---

## AI 程式碼生成指令

### 新增功能（標準產出物）

當被要求建立一個新功能時，按此順序生成：

1. **Command/Query** — `IRequest` 定義（Application 層）
2. **Validator** — `AbstractValidator<T>` 驗證規則（Application 層）
3. **Handler** — `IRequestHandler` 業務編排（Application 層）
4. **Entity** — Rich Domain Model（Domain 層，如需要）
5. **Repository Interface** — 定義在 Domain 層
6. **EF Core Configuration** — Fluent API（Infrastructure 層）
7. **Unit Test** — xUnit + NSubstitute + FluentAssertions
8. **Integration Test** — Testcontainers

### 架構合規檢查

檢查代碼時驗證以下項目：
- 業務邏輯是否洩漏至 Application/Presentation 層？
- Domain Entity 是否使用了 public set？
- Handler 是否直接注入了 DbContext？
- 驗證邏輯是否集中在 FluentValidation Pipeline？
- 是否所有 async 方法都傳遞了 CancellationToken？
- Value Object 是否在 EF Core 中使用了 HasConversion？

### 查詢優化

涉及多表 JOIN 或效能敏感查詢，使用 Dapper 實作，
Repository Interface 定義在 Domain 層，實作在 Infrastructure 層。

---

## 綜合運作流程

```
使用者請求 → API Endpoint
    ↓
Aspire 確保 DB/Cache 等基礎設施就緒，自動注入連線
    ↓
Controller/Endpoint 發送 Command 給 MediatR
    ↓
FluentValidation (Pipeline) 自動攔截驗證
    ↓ (驗證通過)
Handler 執行業務邏輯 (Domain Logic)
    ↓
Testcontainers 確保整合測試在真實 DB 下通過
    ↓
Aspire Dashboard 觀察效能瓶頸與追蹤資訊
```

---

## 推薦開發順序

```
1. [Domain]      定義 Entity / Value Object / Domain Event
2. [Application] 定義 Command/Query + Handler
3. [Application] 撰寫 FluentValidation 規則
4. [Infrastructure] 實作 Repository + EF Core Configuration
5. [Testing]     撰寫 Unit Test + Integration Test (Testcontainers)
6. [Presentation] 建立 Endpoint，僅調用 mediator.Send()
7. [Aspire]      在 AppHost 註冊服務，啟動並調試
```

---

## 常用指令

```bash
# 啟動應用（透過 Aspire）
dotnet run --project src/MyProject.AppHost

# 新增 EF Core Migration
dotnet ef migrations add MigrationName --project src/Infrastructure --startup-project src/Presentation

# 執行所有測試
dotnet test

# 執行特定測試
dotnet test --filter "FullyQualifiedName~OrderTests"
```
