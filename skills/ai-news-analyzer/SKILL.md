---
name: ai-news-analyzer
description: AI news analysis and reporting system that aggregates AI industry news from multiple sources. Use this skill when users ask to analyze AI news, aggregate artificial intelligence trends, track large language model developments, monitor algorithm breakthroughs, or generate comprehensive AI industry reports. This skill fetches AI news via API, enriches topics with web search, analyzes relevance and interest scores, and generates formatted HTML reports with event timelines and product insights.
license: MIT
---

# AI News Analyzer

## Overview

This skill analyzes AI industry news and generates comprehensive reports. It aggregates information about artificial intelligence, large language models, algorithms, and AI frontier developments, scoring each topic by relevance and interest value.

## Workflow

### Phase 1: Fetch AI News

1. **Read Configuration**: Load `api-config.json` from the skill directory
   - Contains the news API endpoint and authentication details

2. **Fetch Raw News**: Make API request to retrieve AI news items
   - Extract topics, headlines, timestamps, and URLs
   - Store in structured format for processing

### Phase 2: Enrich with Web Search

For each news topic:

1. **Extract Key Terms**: Identify main keywords from the headline/description
2. **Web Search**: Use WebSearch tool to find:
   - Related news coverage
   - Background information
   - Industry context
   - Expert opinions
3. **Compile Details**: Create enriched topic data with:
   - Original news item
   - Additional context from web search
   - Related developments
   - Timeline of events

### Phase 3: AI Analysis

Analyze each enriched topic using this scoring framework:

**Scoring Criteria (Total: 100 points)**:

- **Interestingness (80 points)**: How engaging, novel, or surprising is this news?
  - Breakthrough innovation: 70-80 points
  - Significant development: 60-69 points
  - Notable update: 50-59 points
  - Routine news: 30-49 points

- **Usefulness (20 points)**: How practical or actionable is this information?
  - Highly actionable insights: 18-20 points
  - Valuable context: 15-17 points
  - Informative: 10-14 points
  - Limited utility: 5-9 points

For each topic, generate:
- **Event Timeline**: Chronological development of the story
- **Product Innovation Details**: Technical insights, features, or implications
- **Relevance Summary**: Why this matters to AI industry
- **Comprehensive Score**: Total from interestingness + usefulness

### Phase 4: Generate HTML Report

Create a comprehensive HTML report using the `html-report-generator.js` script:

**Report Structure**:

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>AI行业资讯分析报告</title>
    <style>
        /* Modern, clean styling with responsive design */
        body { font-family: system-ui, -apple-system, sans-serif; }
        .topic-card { border-radius: 8px; padding: 20px; margin: 20px 0; }
        .excellent { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; }
        .good { background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: white; }
        .normal { background: #f5f5f5; }
        .score-badge { display: inline-block; padding: 4px 12px; border-radius: 20px; font-weight: bold; }
    </style>
</head>
<body>
    <h1>AI行业资讯分析报告</h1>
    <p class="report-date">生成时间: [TIMESTAMP]</p>

    <!-- Topic Cards -->
    <div class="topic-card excellent">
        <h2>[TOPIC TITLE]</h2>
        <div class="score-badge">评分: 85/100</div>
        <h3>事件脉络</h3>
        <ul class="timeline">
            <li>[Timeline item 1]</li>
            <li>[Timeline item 2]</li>
        </ul>
        <h3>产品创意详情</h3>
        <p class="product-details">[Product/innovation details]</p>
        <h3>综合分析</h3>
        <p class="analysis">[Why this matters]</p>
    </div>

    <!-- More topic cards... -->

    <div class="summary">
        <h2>报告摘要</h2>
        <p>本次分析共涵盖 [COUNT] 个AI行业热点话题</p>
        <p>优秀话题 (>80分): [EXCELLENT_COUNT] 个</p>
        <p>良好话题 (60-80分): [GOOD_COUNT] 个</p>
    </div>
</body>
</html>
```

**Scoring Display**:

- **Excellent (>80 points)**: Use `.excellent` class with purple gradient, prominent display at top
- **Good (60-80 points)**: Use `.good` class with pink gradient, display in middle section
- **Normal (<60 points)**: Use `.normal` class with gray background, display at bottom

### Phase 5: Output

1. **Save Report**: Write HTML to `ai-news-report-[timestamp].html`
2. **Summary**: Provide console summary with:
   - Total topics analyzed
   - Score distribution
   - Top 3 highest-scoring topics
   - Report file location

## File Structure

```
skills/ai-news-analyzer/
├── SKILL.md                    # This file
├── api-config.json            # News API configuration
├── html-report-generator.js   # HTML generation script
└── reports/                   # Generated reports directory
```

## Configuration File Template

Create `api-config.json`:

```json
{
  "apiEndpoint": "YOUR_API_ENDPOINT_HERE",
  "apiKey": "YOUR_API_KEY_HERE",
  "sources": ["techcrunch", "venturebeat", "arxiv", "nature"],
  "categories": ["artificial-intelligence", "machine-learning", "deep-learning", "llm"],
  "maxTopics": 20
}
```

## Usage Examples

**Example 1: Generate daily AI news report**
```
"Generate today's AI news analysis report"
```

**Example 2: Analyze specific AI topics**
```
"Analyze recent AI developments and create a report"
```

**Example 3: Weekly AI industry summary**
```
"Create a comprehensive weekly AI industry analysis"
```

## Error Handling

- **API Failure**: If API call fails, ask user to verify endpoint and credentials in `api-config.json`
- **No Results**: If no news found, inform user and suggest checking API configuration
- **Search Rate Limits**: If web search hits limits, pause and retry after delay
- **HTML Generation Error**: If report generation fails, provide raw JSON output as fallback

## Limitations

- Requires user to provide valid news API endpoint and credentials
- Web search is limited to publicly available information
- Scoring is subjective and based on AI analysis
- Report quality depends on source article quality
- Real-time news may have latency

## Best Practices

- **API Security**: Never commit `api-config.json` with real credentials. Use environment variables
- **Rate Limiting**: Implement delays between web searches to avoid hitting rate limits
- **Source Diversity**: Aggregate from multiple sources for balanced coverage
- **Date Filtering**: Always include date filters to avoid stale news
- **User Feedback**: Allow users to adjust scoring thresholds or exclude sources

## Output Quality Standards

All reports must include:
- [x] Clear topic titles and dates
- [x] Accurate event timelines
- [x] Detailed product/innovation analysis
- [x] Justified scoring with rationale
- [x] Responsive HTML formatting
- [x] Proper categorization by score
- [x] Summary statistics

## Testing Checklist

Before considering the skill complete:
- [ ] Configuration file exists and is valid JSON
- [ ] API endpoint returns news data
- [ ] Web search enriches topics successfully
- [ ] Scoring system produces differentiated results
- [ ] HTML report renders correctly in browsers
- [ ] High-scoring topics appear prominently
- [ ] Report includes all required sections
