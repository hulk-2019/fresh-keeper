# 鲜管家 App 技术架构设计

## 1. 目标

本架构设计面向”鲜管家”App 的核心需求：

- 对家庭物品做到期日期管理
- 支持手动录入与照片快速录入
- 物品分类、标签、归档、搜索
- 到期提醒与多设备同步
- 保持 Expo + React Native 的开发效率

---

## 2. 总体技术栈

| 层级     | 技术选型                                                 |
| -------- | -------------------------------------------------------- |
| 平台     | Expo SDK（Managed Workflow，后期 EAS prebuild）          |
| UI 框架  | React Native + expo-router v3                            |
| 语言     | TypeScript（strict mode）                                |
| 导航     | expo-router（文件路由）+ @react-navigation/bottom-tabs   |
| 本地存储 | expo-sqlite（结构化数据）+ expo-file-system（图片）      |
| 通知     | expo-notifications                                       |
| 图片录入 | expo-image-picker + expo-camera                          |
| 云同步   | iCloud / CloudKit（EAS prebuild 阶段接入）               |
| 订阅     | react-native-purchases（RevenueCat）                     |
| 主题     | App 内手动切换 + 系统跟随（ThemeContext + getAppColors） |
| 国际化   | i18next + react-i18next + expo-localization（中/英）     |

---

## 3. 高级架构分层

```
┌─────────────────────────────────────────────────────┐
│                      UI 层                           │
│  页面(app/)  ←→  组件(components/)  ←→  常量/主题    │
├─────────────────────────────────────────────────────┤
│                     业务层                           │
│  Hooks(hooks/)  ←→  Services(services/)             │
├─────────────────────────────────────────────────────┤
│                     数据层                           │
│  SQLite(db/)  ←→  FileSystem  ←→  iCloud/CloudKit   │
└─────────────────────────────────────────────────────┘
```

- **UI 层**：纯展示，不含业务逻辑，通过 Hook 获取数据和操作
- **业务层**：Hook 封装状态与副作用，Service 封装纯函数逻辑
- **数据层**：统一通过 `db/` 模块访问，上层不直接调用 SQLite API

---

## 4. 目录结构

```
fresh-keeper/
├── app/                          # expo-router 文件路由
│   ├── _layout.tsx               # 根布局（主题、通知权限初始化）
│   ├── modal.tsx                 # 新增/编辑物品全屏弹窗
│   ├── item/
│   │   └── [id].tsx              # 物品详情页（push 导航）
│   └── (tabs)/
│       ├── _layout.tsx           # Tab 栏布局（Items / Tags / Settings）
│       ├── index.tsx             # Items 主列表页
│       ├── tags.tsx              # Tags 标签管理页
│       └── settings.tsx          # Settings 设置页
│
├── components/
│   ├── ui/                       # 通用无业务 UI 原子组件
│   │   ├── Button.tsx
│   │   ├── Badge.tsx             # 状态徽章（Fresh / Expiring / Expired）
│   │   ├── DaysLeftBadge.tsx     # 剩余天数色块
│   │   ├── SectionHeader.tsx
│   │   └── BottomSheet.tsx       # 通用底部弹出层
│   ├── items/
│   │   ├── ItemCard.tsx          # 列表行：缩略图 + 名称 + 日期 + 天数
│   │   ├── ItemDetailView.tsx    # 详情页主体（Hero图 + Info + Dates）
│   │   ├── FilterTabBar.tsx      # All / Expiring 筛选 Tab
│   │   └── AddEntrySheet.tsx     # 添加方式选择底部弹层
│   ├── tags/
│   │   └── TagChip.tsx
│   └── settings/
│       └── SettingsRow.tsx
│
├── contexts/
│   ├── ThemeContext.tsx           # 主题偏好（light/dark/system）+ useAppColors()
│   └── I18nContext.tsx            # 语言偏好（en/zh/system）+ useI18n()
│
├── i18n/
│   ├── index.ts                   # i18next 初始化，读取系统语言作为默认值
│   ├── en.ts                      # 英文翻译
│   └── zh.ts                      # 中文翻译
│
├── hooks/
│   ├── useItems.ts               # 物品列表、筛选、CRUD
│   ├── useItemDetail.ts          # 单个物品详情
│   ├── useTags.ts                # 标签 CRUD
│   ├── useCategories.ts          # 分类数据
│   ├── useReminders.ts           # 提醒配置
│   ├── useSyncStatus.ts          # iCloud 同步状态
│   ├── useSubscription.ts        # 订阅状态与权限判断
│   ├── useColorScheme.ts
│   └── useThemeColor.ts
│
├── services/
│   ├── ItemService.ts            # 物品业务逻辑（状态计算、归档）
│   ├── PhotoEntryService.ts      # 图片获取、压缩、保存
│   ├── ReminderService.ts        # 通知调度
│   ├── SyncService.ts            # iCloud 同步
│   └── SubscriptionService.ts   # 订阅校验与权限
│
├── db/
│   ├── client.ts                 # SQLite 连接单例
│   ├── migrations/               # 版本化 schema 迁移脚本
│   │   └── 001_initial.sql
│   ├── itemsRepo.ts              # Items 表 CRUD
│   ├── tagsRepo.ts
│   ├── categoriesRepo.ts
│   └── remindersRepo.ts
│
├── constants/
│   ├── theme.ts                  # 颜色、字体、间距 token
│   ├── categories.ts             # 内置分类列表（含图标）
│   └── config.ts                 # 全局配置（提醒阈值等）
│
└── assets/
    └── images/
```

---

## 5. 页面路由与导航流程

### 5.1 路由结构

```
/                          → (tabs)/index.tsx   Items 列表
/tags                      → (tabs)/tags.tsx    Tags 管理
/settings                  → (tabs)/settings.tsx Settings
/modal?mode=add            → modal.tsx          新增物品
/modal?mode=edit&id=:id    → modal.tsx          编辑物品
/item/:id                  → item/[id].tsx      物品详情（push）
```

### 5.2 核心交互流程

**添加物品**

```
Items 列表 → 点击 “+” → AddEntrySheet 底部弹层
  ├── Image Entry → 相机/图库 → modal.tsx（预填图片）
  └── Manual Entry → modal.tsx（空表单）
```

**查看详情**

```
Items 列表 → 点击物品行 → item/[id].tsx
  └── 右上角 “...” → 编辑 / 归档 / 删除
```

**筛选**

```
Items 列表顶部 FilterTabBar
  ├── All（显示全部未归档物品，含数量）
  └── Expiring（status = 'expiring'，含数量）
```

---

## 6. 核心数据模型

### 6.1 TypeScript 类型定义

```typescript
type ItemStatus = "fresh" | "expiring" | "expired";

interface Item {
  id: string;
  name: string;
  categoryId: string;
  tagIds: string[];
  photoUri?: string; // 本地文件路径
  productionDate?: string; // ISO 8601 date string
  expiryDate: string; // ISO 8601 date string（必填）
  daysLeft: number; // 运行时计算，不持久化
  status: ItemStatus; // 运行时计算，不持久化
  notes?: string;
  archived: boolean;
  createdAt: string;
  updatedAt: string;
}

interface Category {
  id: string;
  name: string;
  icon: string; // SF Symbol 名称（iOS）
  color: string; // hex
  isBuiltIn: boolean;
}

interface Tag {
  id: string;
  name: string;
  color: string; // hex
  createdAt: string;
}

interface Reminder {
  id: string;
  itemId: string;
  primaryDaysBefore: number;
  secondaryDaysBefore?: number;
  enabled: boolean;
}

interface AppSettings {
  subscriptionStatus: "free" | "pro" | "trial";
  language: "system" | string;
  defaultPrimaryReminderDays: number; // 默认 7
  defaultSecondaryReminderDays: number; // 默认 30
  syncStatus: "synced" | "pending" | "failed" | "disabled";
  syncLastUpdated?: string;
}
```

### 6.2 状态计算规则

`daysLeft` 和 `status` 在读取时由 `ItemService.computeStatus()` 实时计算，不存入数据库：

```
daysLeft = floor((expiryDate - today) / 86400000)

status:
  daysLeft <= 0           → 'expired'
  daysLeft <= 7           → 'expiring'   （橙色）
  daysLeft > 7            → 'fresh'      （绿色）
```

`DaysLeftBadge` 颜色映射：

- `expired`：红色背景
- `expiring`：橙色背景（如截图中 Milk 7 days）
- `fresh`：绿色背景（如截图中 Potato Chips 61 days、Cat Food 183 days）

---

## 7. 数据库 Schema（SQLite）

### 7.1 表结构

```sql
-- 001_initial.sql

CREATE TABLE IF NOT EXISTS items (
  id              TEXT PRIMARY KEY,
  name            TEXT NOT NULL,
  category_id     TEXT NOT NULL,
  photo_uri       TEXT,
  production_date TEXT,
  expiry_date     TEXT NOT NULL,
  notes           TEXT,
  archived        INTEGER NOT NULL DEFAULT 0,  -- 0/1 布尔
  created_at      TEXT NOT NULL,
  updated_at      TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS categories (
  id          TEXT PRIMARY KEY,
  name        TEXT NOT NULL,
  icon        TEXT NOT NULL,
  color       TEXT NOT NULL,
  is_built_in INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS tags (
  id         TEXT PRIMARY KEY,
  name       TEXT NOT NULL,
  color      TEXT NOT NULL,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS item_tags (
  item_id TEXT NOT NULL,
  tag_id  TEXT NOT NULL,
  PRIMARY KEY (item_id, tag_id),
  FOREIGN KEY (item_id) REFERENCES items(id) ON DELETE CASCADE,
  FOREIGN KEY (tag_id)  REFERENCES tags(id)  ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS reminders (
  id                     TEXT PRIMARY KEY,
  item_id                TEXT NOT NULL,
  primary_days_before    INTEGER NOT NULL,
  secondary_days_before  INTEGER,
  enabled                INTEGER NOT NULL DEFAULT 1,
  FOREIGN KEY (item_id) REFERENCES items(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS settings (
  key   TEXT PRIMARY KEY,
  value TEXT NOT NULL
);

-- 常用查询索引
CREATE INDEX IF NOT EXISTS idx_items_expiry_date ON items(expiry_date);
CREATE INDEX IF NOT EXISTS idx_items_archived    ON items(archived);
CREATE INDEX IF NOT EXISTS idx_item_tags_item_id ON item_tags(item_id);
```

### 7.2 内置分类种子数据（categories）

| id           | name                   | icon（SF Symbol）             | color   |
| ------------ | ---------------------- | ----------------------------- | ------- |
| cat_food     | Food                   | fork.knife                    | #4CAF50 |
| cat_medicine | Medicine               | cross.case                    | #F44336 |
| cat_skincare | Skincare               | sparkles                      | #E91E63 |
| cat_baby     | Baby                   | figure.and.child.holdinghands | #FF9800 |
| cat_pet      | Pet                    | pawprint                      | #795548 |
| cat_snacks   | Snacks & Instant Foods | bag                           | #FFC107 |
| cat_other    | Other                  | archivebox                    | #9E9E9E |

---

## 8. 存储与同步方案

### 8.1 本地存储策略

- **结构化数据**：`expo-sqlite`，通过 `db/` 模块统一访问
- **图片文件**：`expo-file-system` 保存到 `FileSystem.documentDirectory + 'photos/'`，数据库只存相对路径
- **应用设置**：`settings` 表 key-value 存储，启动时加载到内存
- **敏感数据**（订阅凭证等）：`expo-secure-store`

### 8.2 iCloud 同步策略

**阶段一（MVP）**：不做云同步，仅本地存储

**阶段二（EAS prebuild 后）**：

```
本地写入 SQLite
    ↓
SyncService 监听 updatedAt 变更
    ↓
序列化为 JSON → 写入 NSUbiquitousKeyValueStore（小数据）
或 CloudKit CKRecord（大数据/图片）
    ↓
其他设备收到推送 → 拉取变更 → 合并到本地 SQLite
```

冲突解决：`updatedAt` 较新的版本优先（Last-Write-Wins）

**同步范围**：items、tags、item_tags、reminders、settings（图片通过 CloudKit Assets 单独同步，不含二进制内联）

---

## 9. 功能服务划分

### 9.1 ItemService

```typescript
// services/ItemService.ts
computeStatus(expiryDate: string): { daysLeft: number; status: ItemStatus }
createItem(input: CreateItemInput): Promise<Item>
updateItem(id: string, patch: Partial<Item>): Promise<Item>
archiveItem(id: string): Promise<void>
deleteItem(id: string): Promise<void>
queryItems(filter: ItemFilter): Promise<Item[]>
  // filter: { archived?, status?, categoryId?, tagId?, search? }
```

### 9.2 PhotoEntryService

```typescript
// services/PhotoEntryService.ts
pickFromCamera(): Promise<string | null>      // 返回临时 URI
pickFromLibrary(): Promise<string | null>
savePhoto(tempUri: string): Promise<string>   // 复制到 documentDirectory，返回持久路径
deletePhoto(uri: string): Promise<void>
// 未来扩展：extractInfoFromPhoto(uri) → OCR/AI 识别物品名称和日期
```

### 9.3 ReminderService

```typescript
// services/ReminderService.ts
scheduleReminder(item: Item, reminder: Reminder): Promise<string>  // 返回 notificationId
cancelReminder(notificationId: string): Promise<void>
rescheduleAll(): Promise<void>   // App 启动时重建所有通知
getDefaultReminder(): { primaryDaysBefore: number; secondaryDaysBefore: number }
```

通知触发时间 = `expiryDate - primaryDaysBefore * 86400000`，使用 `expo-notifications` 的 `scheduleNotificationAsync`。

### 9.4 SubscriptionService

```typescript
// services/SubscriptionService.ts
getStatus(): Promise<'free' | 'pro' | 'trial'>
canUsePhotoEntry(): boolean   // Pro 功能：无限图片录入
restore(): Promise<void>
purchase(productId: string): Promise<void>
```

Free 限制（待 PRD 确认）：

- 图片录入次数上限（如每月 5 次）
- 物品数量上限（如 20 条）

### 9.5 SyncService

```typescript
// services/SyncService.ts
getStatus(): 'synced' | 'pending' | 'failed' | 'disabled'
triggerSync(): Promise<void>
onRemoteChange(handler: (changes: SyncPayload) => void): void
```

---

## 10. UI 组件规范

### 10.1 Items 列表页（`app/(tabs)/index.tsx`）

```
┌─────────────────────────────┐
│  🔍  +  ···                 │  顶部操作栏
├──────────────┬──────────────┤
│  📦 All  3   │  🚩 Expiring 1│  FilterTabBar
├─────────────────────────────┤
│ Items                       │  SectionHeader
│ [缩略图] Milk               │
│          Apr 28, 2026  [ 7] │  ItemCard（橙色天数）
│ [缩略图] Potato Chips       │
│          Jun 21, 2026  [61] │  ItemCard（绿色天数）
│ [缩略图] Cat Food           │
│          Oct 21, 2026 [183] │  ItemCard（绿色天数）
└─────────────────────────────┘
```

### 10.2 添加方式底部弹层（`AddEntrySheet`）

```
┌─────────────────────────────┐
│  📷 Image Entry          >  │  拍照/图库录入
│     Create items from photos│
│  ✏️  Manual Entry         >  │  手动填写
│     Skip image upload...    │
└─────────────────────────────┘
```

### 10.3 物品详情页（`app/item/[id].tsx`）

```
┌─────────────────────────────┐
│  <  Potato Chips       ···  │
│ ┌─────────────────────────┐ │
│ │      [Hero 图片]        │ │
│ │  Potato Chips           │ │
│ │  61 days left           │ │
│ └─────────────────────────┘ │
│  Item Info                  │
│  🟢 Status          Fresh   │
│  ⏳ Days Left    61 days left│
│  📦 Category  Snacks & ...  │
│  Dates                      │
│  📅 Production Date Apr 21  │
│  📅 Expiry Date    Jun 21   │
└─────────────────────────────┘
```

### 10.4 设置页（`app/(tabs)/settings.tsx`）

分组列表结构：

- **Subscription Status**：FreshMemo Pro → 订阅状态（Subscribed / Free）
- **Preferences**：Language → 跳转系统语言设置
- **Defaults**：Primary Reminder（默认 7 天）、Secondary Reminder（默认 30 天）
- **iCloud Sync**：Sync Status（Synced / Pending / Failed）
- **About**：Version

---

## 11. 通知调度

每个物品最多创建 2 条本地通知（primary + secondary）：

```
创建/编辑物品时：
  1. 取消旧通知（若存在）
  2. 计算 primaryTrigger = expiryDate - primaryDaysBefore
  3. 计算 secondaryTrigger = expiryDate - secondaryDaysBefore（若配置）
  4. 调用 scheduleNotificationAsync 注册通知
  5. 将 notificationId 存入 reminders 表

App 启动时：
  调用 ReminderService.rescheduleAll() 重建所有未过期物品的通知
  （防止系统清除通知后丢失）
```

通知内容模板：

- 标题：`{itemName} 即将到期`
- 正文：`还有 {daysLeft} 天到期，记得及时使用`

---

## 12. 关键非功能需求

| 需求       | 目标                                                         |
| ---------- | ------------------------------------------------------------ |
| 性能       | 列表滚动 60fps；SQLite 查询 < 50ms                           |
| 离线       | 无网络下可完整使用（查看、添加、编辑）                       |
| 数据完整性 | App 重启后数据不丢失；图片文件与数据库记录保持一致           |
| 扩展性     | 后续支持扫码录入、批量导入/导出 CSV                          |
| 可维护性   | UI / Hook / Service / DB 四层严格分离，禁止跨层直接调用      |
| 安全       | 订阅凭证使用 expo-secure-store；不上传用户图片到第三方服务器 |

---

## 13. 依赖清单

```json
{
  “expo-sqlite”: “^14.x”,
  “expo-file-system”: “^17.x”,
  “expo-notifications”: “^0.28.x”,
  “expo-image-picker”: “^15.x”,
  “expo-camera”: “^15.x”,
  “expo-secure-store”: “^13.x”,
  “expo-localization”: “^16.x”,
  “@react-native-async-storage/async-storage”: “^1.x”,
  “react-native-purchases”: “^7.x”,
  “i18next”: “^23.x”,
  “react-i18next”: “^14.x”
}
```

---

## 14. 国际化（i18n）方案

### 14.1 技术选型

使用 `i18next` + `react-i18next`，`expo-localization` 读取系统语言作为默认值。

### 14.2 文件结构

```
i18n/
├── index.ts      # i18next 初始化，lng 默认跟随系统（zh/en）
├── en.ts         # 英文翻译，同时作为 TranslationKeys 类型来源
└── zh.ts         # 中文翻译，类型约束为 DeepStringify<typeof en>
```

### 14.3 翻译 Key 命名空间

| 命名空间       | 用途                                      |
| -------------- | ----------------------------------------- |
| `common.*`     | 通用操作词（cancel/save/delete/archive…） |
| `items.*`      | Items 列表页文案                          |
| `itemDetail.*` | 物品详情页文案                            |
| `form.*`       | 录入表单文案                              |
| `tags.*`       | 标签管理页文案                            |
| `settings.*`   | 设置页文案                                |

### 14.4 语言偏好持久化

- 存储在 SQLite `settings` 表，key = `language`，值为 `'system' | 'en' | 'zh'`
- `I18nContext` 在挂载时读取，切换时同步写回
- `'system'` 降级：读取 `expo-localization` 的 `languageCode`，`zh` 开头映射为 `zh`，其余为 `en`

### 14.5 日期本地化

`ItemCard` 和 `item/[id].tsx` 中的 `Intl.DateTimeFormat` locale 跟随当前语言：

- `en` → `'en-US'`
- `zh` → `'zh-CN'`

---

## 15. 主题切换方案

### 15.1 架构

```
SQLiteProvider
  └── ThemeProvider          # 读取 settings.theme，提供 scheme + colors
        └── I18nProvider     # 读取 settings.language，驱动 i18n.changeLanguage
              └── AppStack   # NavThemeProvider 跟随 scheme 切换
```

### 15.2 颜色 Token

`constants/theme.ts` 导出 `getAppColors(scheme: 'light' | 'dark'): AppColorScheme`，返回完整颜色对象：

| Token              | Light     | Dark      |
| ------------------ | --------- | --------- |
| `primaryText`      | `#1C1C1E` | `#FFFFFF` |
| `secondaryText`    | `#8E8E93` | `#8E8E93` |
| `cardBackground`   | `#FFFFFF` | `#1C1C1E` |
| `screenBackground` | `#F2F2F7` | `#000000` |
| `inputBackground`  | `#FFFFFF` | `#2C2C2E` |
| `navBackground`    | `#FFFFFF` | `#1C1C1E` |
| `separator`        | `#E5E5EA` | `#38383A` |
| `primary`          | `#3B82F6` | `#60A5FA` |
| `fresh`            | `#4CAF50` | `#66BB6A` |
| `expiring`         | `#FF9800` | `#FFA726` |
| `expired`          | `#F44336` | `#EF5350` |

### 15.3 使用方式

所有页面和组件通过 `useAppColors()` hook 获取当前主题颜色，不再直接引用 `AppColors` 静态对象：

```typescript
const colors = useAppColors();
// 使用 colors.primaryText, colors.cardBackground 等
```

### 15.4 主题偏好持久化

- 存储在 SQLite `settings` 表，key = `theme`，值为 `'system' | 'light' | 'dark'`
- `ThemeContext` 在挂载时读取，切换时同步写回
- `'system'` 降级：调用 RN 原生 `useColorScheme()` 获取系统当前深浅色

### 15.5 Settings 页切换 UI

使用三段式 `SegmentControl` 组件（System / Light / Dark），无需弹窗，即点即切。

---

## 16. 实现路线图

| 阶段        | 目标     | 关键任务                                                |
| ----------- | -------- | ------------------------------------------------------- |
| **P0 MVP**  | 本地可用 | SQLite schema、Items CRUD、手动录入、状态计算、本地通知 |
| **P1 体验** | 完整 UI  | 照片录入、详情页、标签管理、搜索、归档                  |
| **P2 变现** | 订阅     | RevenueCat 接入、Free/Pro 权限门控、Settings 订阅页     |
| **P3 同步** | 多设备   | EAS prebuild、CloudKit 接入、冲突解决                   |
| **P4 智能** | 效率提升 | OCR/AI 识别物品名称和日期、扫码录入                     |
