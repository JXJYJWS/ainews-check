# AI News Analyzer Skill

基于 Claude Code 的 AI 资讯分析技能,自动聚合、分析和生成 AI 行业资讯报告。

## 功能特性

- 自动抓取 AI 行业最新资讯
- 使用 Web Search 丰富话题背景
- 智能 AI 分析(有趣度80% + 有用度20%)
- 生成精美的 HTML 分析报告
- 事件脉络追踪
- 产品创意详情提取

## 快速开始

### 1. 配置 API

编辑 `api-config.json` 文件,填入你的新闻 API 信息:

```json
{
  "apiEndpoint": "https://your-api-endpoint.com/v1/news",
  "apiKey": "your-api-key-here"
}
```

### 2. 在 Claude Code 中使用

在 Claude Code 中直接调用此 skill:

```
"Generate today's AI news analysis report"
```

或

```
"分析最新的AI行业资讯并生成报告"
```

### 3. 查看报告

生成的 HTML 报告将保存在 `reports/` 目录下,文件名格式为:
```
ai-news-report-YYYY-MM-DD-HH-mm-ss.html
```

## 项目结构

```
skills/ai-news-analyzer/
├── SKILL.md                    # Skill 定义文件
├── README.md                   # 本文件
├── api-config.json            # API 配置文件
├── html-report-generator.js   # HTML 报告生成器
└── reports/                   # 生成的报告目录
    └── ai-news-report-*.html
```

## 评分系统

每个话题根据以下标准评分(总分100分):

### 有趣度 (80分)

- **70-80分**: 突破性创新 - 颠覆性技术或重大突破
- **60-69分**: 重大进展 - 显著的技术提升或里程碑
- **50-59分**: 显著更新 - 重要功能或改进
- **30-49分**: 常规新闻 - 一般性的行业动态

### 有用度 (20分)

- **18-20分**: 高度可执行 - 提供具体可行的洞察
- **15-17分**: 有价值 - 提供有意义的行业见解
- **10-14分**: 信息丰富 - 包含有用的背景信息
- **5-9分**: 有限效用 - 信息量较少

### 报告分级

- **🏆 优秀 (>80分)**: 紫色渐变高亮,置于报告顶部
- **👍 良好 (60-80分)**: 粉色渐变显示,置于报告中部
- **📋 普通 (<60分)**: 灰色背景,置于报告底部

## 配置选项

### API 设置

- `apiEndpoint`: 新闻 API 端点
- `apiKey`: API 密钥
- `apiTimeout`: 请求超时时间(毫秒)
- `maxTopics`: 最大分析话题数(默认: 20)
- `dateRangeDays`: 抓取最近几天的新闻(默认: 7天)

### 数据源

默认包含以下权威媒体:
- TechCrunch
- VentureBeat
- The Verge
- arXiv
- Nature AI
- Wired

可在 `api-config.json` 中自定义数据源。

### 报告设置

- `excellentThreshold`: 优秀话题阈值(默认: 80)
- `goodThreshold`: 良好话题阈值(默认: 60)
- `includeTimeline`: 是否包含事件脉络
- `includeProductDetails`: 是否包含产品详情
- `includeSources`: 是否包含来源链接

## 使用示例

### 示例 1: 生成每日报告

```
"Generate today's AI news analysis report"
```

### 示例 2: 分析特定主题

```
"Analyze recent developments in large language models"
```

### 示例 3: 周报生成

```
"Create a comprehensive weekly AI industry analysis"
```

## 工作流程

1. **抓取资讯**: 从配置的 API 获取 AI 行业新闻
2. **Web 搜索**: 对每个话题进行背景信息搜索
3. **AI 分析**: 评估有趣度和有用度
4. **生成报告**: 创建精美的 HTML 报告
5. **保存输出**: 将报告保存到 reports/ 目录

## 依赖项

- Node.js (用于 HTML 报告生成)
- 有效的新闻 API 密钥
- Claude Code (已安装并配置)

## 注意事项

1. **API 安全**: 不要将包含真实 API 密钥的 `api-config.json` 提交到版本控制系统
2. **速率限制**: Web Search 有速率限制,skill 会自动处理延迟
3. **网络连接**: 需要稳定的网络连接来抓取新闻和进行搜索
4. **评分主观性**: 评分由 AI 根据多维度分析得出,具有一定主观性

## 故障排除

### 问题: 无法抓取新闻

**解决方案**:
- 检查 `api-config.json` 中的 API 端点和密钥是否正确
- 确认 API 服务是否正常运行
- 检查网络连接

### 问题: Web Search 失败

**解决方案**:
- 检查网络连接
- 等待一段时间后重试(速率限制)
- 减少 `maxTopics` 数量

### 问题: 报告未生成

**解决方案**:
- 检查 reports/ 目录是否有写入权限
- 查看控制台错误日志
- 确认 Node.js 已正确安装

## 高级配置

### 自定义评分权重

编辑 `api-config.json` 中的 `scoring` 部分来自定义评分标准:

```json
"scoring": {
  "interestingness": {
    "breakthrough": { "min": 75, "max": 80 }
  }
}
```

### 添加自定义关键词

在 `keywords` 数组中添加你关注的 AI 主题:

```json
"keywords": [
  "AI agents",
  "multimodal models",
  "AI safety"
]
```

## 许可证

MIT License

## 贡献

欢迎提交 Issue 和 Pull Request!

## 联系方式

如有问题或建议,请通过以下方式联系:
- 创建 GitHub Issue
- 发送邮件至项目维护者

---

🤖 **Generated with [Claude Code](https://claude.com/claude-code)**
