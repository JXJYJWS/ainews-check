# GitHub Actions 迁移配置指南（智谱 GLM-4.7 版本）

本文档详细说明如何将 `ai-news-analyzer` skill 迁移到 GitHub Actions 实现云端定时执行，使用**智谱 GLM-4.7** 进行 AI 分析。

## 📋 目录

- [技术可行性](#技术可行性)
- [GitHub Secrets 配置](#github-secrets-配置)
- [推送配置流程](#推送配置流程)
- [GitHub Pages 部署（可选）](#github-pages-部署可选)

---

## 技术可行性

### ✅ 支持的功能

| 功能 | 状态 | 说明 |
|------|------|------|
| 智谱 GLM-4.7 | ✅ 支持 | 使用原生 https 模块调用 |
| 定时执行 | ✅ 原生支持 | GitHub Actions cron |
| HTML 报告生成 | ✅ 完全支持 | 纯 Node.js 脚本 |
| 报告存储 | ✅ 多种方案 | Artifacts / Releases / Pages |

### 🧠 智谱 GLM-4.7 优势

- **性价比高**: 智谱 API 价格相对优惠
- **中文优化**: 对中文内容理解更准确
- **无需额外依赖**: 使用原生 Node.js https 模块
- **稳定可靠**: 国内访问速度更快

---

## GitHub Secrets 配置

### 1. 访问 GitHub Secrets 设置页面

在你的 GitHub 仓库中：

1. 进入仓库页面
2. 点击 **Settings** (设置)
3. 左侧菜单找到 **Secrets and variables** → **Actions**
4. 点击 **New repository secret** 按钮添加密钥

### 2. 必需配置的 Secrets

#### 📌 TIANAPI_KEY (必需)

**说明**: 天行数据 API 密钥

**获取方式**:
1. 访问 [天行数据官网](https://www.tianapi.com/)
2. 注册并登录账号
3. 进入控制台 → API管理
4. 复制你的 API Key

**配置步骤**:
- Name: `TIANAPI_KEY`
- Secret: 粘贴你的 API Key

**示例值**: `0cb5cca4164b5b832a3e28df1e5ad834`

---

#### 📌 ZHIPU_API_KEY (必需)

**说明**: 智谱 AI API 密钥，用于调用 GLM-4.7 模型

**获取方式**:
1. 访问 [智谱 AI 开放平台](https://open.bigmodel.cn/)
2. 注册并登录账号
3. 进入 API Keys 页面
4. 点击 **添加 API Key** 生成新的密钥
5. 复制生成的密钥

**配置步骤**:
- Name: `ZHIPU_API_KEY`
- Secret: 粘贴你的智谱 API Key

**示例值**: `71e506b421204a95b4c48e33fb7354bb.yJEnNmrsLrfrUxcA`

> ⚠️ **注意**: 此密钥格式为 `id.secret`，请完整复制！

---

#### 📌 TIANAPI_ENDPOINT (可选)

**说明**: 天行数据 API 端点地址

**默认值**: `https://apis.tianapi.com/ai/index`

**配置步骤**:
- Name: `TIANAPI_ENDPOINT`
- Secret: `https://apis.tianapi.com/ai/index`

---

### 3. 完整 Secrets 列表

| Secret 名称 | 必需 | 默认值 | 说明 |
|------------|------|--------|------|
| `TIANAPI_KEY` | ✅ 必需 | 无 | 天行数据 API 密钥 |
| `ZHIPU_API_KEY` | ✅ 必需 | 无 | 智谱 GLM-4.7 API 密钥 |
| `TIANAPI_ENDPOINT` | ❌ 可选 | `https://apis.tianapi.com/ai/index` | API 端点 |

---

## 推送配置流程

### Step 1: 初始化 Git 仓库（如果还没有）

```bash
# 在项目根目录执行
git init
git add .
git commit -m "Add AI News Analyzer with Zhipu GLM-4.7"
```

### Step 2: 在 GitHub 上创建新仓库

1. 访问 [GitHub](https://github.com/)
2. 点击右上角 **+** → **New repository**
3. 填写仓库信息：
   - Repository name: `ai-news-analyzer` (或任意名称)
   - Description: `AI News Analyzer powered by Zhipu GLM-4.7`
   - Public/Private: 根据需求选择
4. **不要**勾选 "Add a README file" (如果已有)
5. 点击 **Create repository**

### Step 3: 推送代码到 GitHub

```bash
# 添加远程仓库
git remote add origin https://github.com/YOUR_USERNAME/ai-news-analyzer.git

# 推送主分支
git branch -M main
git push -u origin main
```

将 `YOUR_USERNAME` 替换为你的 GitHub 用户名。

### Step 4: 配置 GitHub Secrets

按照上面的 [GitHub Secrets 配置](#github-secrets-配置) 步骤，添加以下密钥：

1. **TIANAPI_KEY**: 你的天行数据 API Key
2. **ZHIPU_API_KEY**: 你的智谱 API Key (格式: `id.secret`)

### Step 5: 启用 GitHub Actions

1. 进入仓库页面
2. 点击 **Actions** 标签
3. 如果是首次使用，点击 **I understand my workflows, go ahead and enable them**
4. 确认看到工作流文件 `.github/workflows/ai-news-analyzer.yml`

### Step 6: 测试手动触发

1. 在 **Actions** 页面
2. 左侧选择 **AI News Analyzer** 工作流
3. 点击右侧 **Run workflow** 按钮
4. 选择分支（通常是 `main`）
5. 可以选择最大话题数 (10/20/30/50)
6. 点击 **Run workflow** (绿色按钮)

### Step 7: 查看执行结果

1. 等待工作流执行完成（约 2-5 分钟）
2. 点击运行记录查看详细日志
3. 成功后会看到绿色的 ✅ 标记

### Step 8: 查看生成的报告

报告会保存在以下位置：

1. **GitHub Artifacts** (临时下载):
   - 在 Actions 运行页面底部
   - 找到 **Artifacts** 区域
   - 下载 `ai-news-report-{number}` 压缩包

2. **Git 仓库** (永久保存):
   - 报告会自动提交到 `skills/ai-news-analyzer/reports/` 目录
   - 每次运行都会生成新的 HTML 文件

3. **GitHub Releases** (可选):
   - 访问仓库的 **Releases** 页面
   - 每次运行会创建一个新的 Release
   - 可以直接下载 HTML 报告

---

## GitHub Pages 部署（可选）

如果你想将报告托管到 GitHub Pages：

### Step 1: 启用 GitHub Pages

1. 进入仓库 **Settings**
2. 找到 **Pages** (左侧菜单)
3. 配置如下：
   - **Source**: `GitHub Actions`
   - 点击 **Save**

### Step 2: 配置工作流权限

1. 进入 **Settings** → **Actions** → **General**
2. 滚动到 **Workflow permissions**
3. 选择 **Read and write permissions**
4. 勾选 **Allow GitHub Actions to create and approve pull requests**
5. 点击 **Save**

### Step 3: 访问你的报告网站

工作流运行成功后：

1. 等待几分钟部署完成
2. 访问: `https://YOUR_USERNAME.github.io/YOUR_REPO_NAME/`
3. 你将看到所有生成的 AI 新闻报告列表

---

## 定时执行说明

工作流默认配置为每天北京时间 **上午 9:00** 自动执行：

```yaml
schedule:
  - cron: '0 1 * * *'  # UTC 1:00 = 北京时间 9:00
```

### 自定义定时时间

编辑 `.github/workflows/ai-news-analyzer.yml` 中的 cron 表达式：

```yaml
schedule:
  - cron: '0 3 * * *'  # UTC 3:00 = 北京时间 11:00
```

**常用 cron 表达式**:

| 表达式 | 说明 |
|--------|------|
| `0 1 * * *` | 每天 UTC 1:00 (北京 9:00) |
| `0 3 * * *` | 每天 UTC 3:00 (北京 11:00) |
| `0 6 * * 1` | 每周一 UTC 6:00 (北京 14:00) |
| `*/30 * * * *` | 每 30 分钟 (测试用) |

> ⚠️ **注意**: GitHub Actions 的 cron 时间是 **UTC 时间**，需要转换为北京时间 (+8小时)

---

## 智谱 API 说明

### 使用的模型

本项目使用 **glm-4-flash** 模型：
- 快速响应
- 成本较低
- 适合新闻分析场景

### API 调用方式

使用原生 Node.js `https` 模块，无需额外依赖：

```javascript
const https = require('https');

const options = {
  hostname: 'open.bigmodel.cn',
  path: '/api/paas/v4/chat/completions',
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${ZHIPU_API_KEY}`
  }
};
```

### 降级方案

如果智谱 API 调用失败，系统会自动使用基础关键词评分方案，确保报告生成不会中断。

---

## 故障排除

### 问题 1: 工作流失败 - 天行 API 认证错误

**错误信息**: `API Error: Invalid API key`

**解决方案**:
1. 检查 `TIANAPI_KEY` 是否正确配置
2. 确认 API Key 未过期
3. 检查天行数据账户余额

### 问题 2: 智谱 API 调用失败

**错误信息**: `GLM API Error: ...`

**解决方案**:
1. 确认 `ZHIPU_API_KEY` 格式正确 (应为 `id.secret` 格式)
2. 检查智谱 AI 开放平台账户余额
3. 查看 API 使用限制
4. 查看错误信息，常见错误：
   - `invalid_api_key`: API Key 错误
   - `insufficient_quota`: 余额不足
   - `rate_limit`: 请求频率过高

### 问题 3: 报告未生成

**错误信息**: `HTML generation failed`

**解决方案**:
1. 检查 Actions 日志中的错误信息
2. 确认 `reports/` 目录有写入权限
3. 确保分析步骤成功完成

### 问题 4: GitHub Pages 部署失败

**错误信息**: `Pages deployment failed`

**解决方案**:
1. 确认启用了 **Read and write permissions**
2. 检查 **Pages** 设置中 Source 是否为 `GitHub Actions`
3. 等待几分钟后重试

---

## 成本估算

### GitHub Actions

- **公开仓库**: 完全免费
- **私有仓库**:
  - 免费额度: 2000 分钟/月
  - 每次运行约 2-5 分钟
  - 每天一次 ≈ 90-150 分钟/月 (免费额度内)

### 智谱 GLM API

- **glm-4-flash**: 约 ¥0.1/千 tokens
- **估算**: 每次分析 20 条新闻 ≈ ¥0.05-0.10
- **每月**: 约 ¥1.5-3.00 (每天一次)

> 💡 智谱新用户通常有免费额度，请查看官网活动

### TianAPI

- 免费版: 每日 100 次请求
- 付费版: 根据需求选择

---

## 本地测试

在推送到 GitHub 前，你可以本地测试：

### 1. 设置环境变量

```bash
# Linux/macOS
export TIANAPI_KEY="your_tianapi_key"
export ZHIPU_API_KEY="your_zhipu_key"

# Windows (PowerShell)
$env:TIANAPI_KEY="your_tianapi_key"
$env:ZHIPU_API_KEY="your_zhipu_key"
```

### 2. 运行分析

```bash
# 安装依赖（可选）
npm install

# 运行分析
npm run analyze

# 生成报告
npm run report

# 或一次性执行
npm run full
```

---

## 项目结构

```
ai-news-analyzer/
├── .github/
│   ├── workflows/
│   │   └── ai-news-analyzer.yml    # GitHub Actions 工作流
│   └── scripts/
│       └── ai-news-analyzer-zhipu.js # 智谱 GLM 分析脚本
├── skills/
│   └── ai-news-analyzer/
│       ├── SKILL.md
│       ├── README.md
│       ├── api-config.json         # API 配置（不提交到 Git）
│       ├── get-daily-news.js       # HTML 报告生成器
│       ├── html-report-generator.js
│       └── reports/                # 生成的报告目录
├── package.json
├── GITHUB_ACTIONS_SETUP.md         # 本文档
└── .gitignore
```

---

## 总结

完成上述配置后，你的 AI 新闻分析系统将：

✅ 每天自动运行
✅ 使用智谱 GLM-4.7 进行智能分析
✅ 生成精美的 HTML 报告
✅ 自动保存到 GitHub 仓库
✅ 可选：发布到 GitHub Pages 网站查看

### 技术栈

- **数据源**: TianAPI (天行数据)
- **AI 分析**: Zhipu GLM-4.7 (智谱)
- **自动化**: GitHub Actions
- **报告生成**: Node.js + HTML
- **托管**: GitHub Pages (可选)

如有问题，请查看 [智谱 AI 文档](https://open.bigmodel.cn/dev/api) 或提交 Issue。
