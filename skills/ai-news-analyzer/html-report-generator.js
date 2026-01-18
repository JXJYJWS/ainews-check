/**
 * AI News HTML Report Generator
 * Generates formatted HTML reports for AI industry news analysis
 */

class AINewsReportGenerator {
  constructor() {
    this.timestamp = new Date().toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' });
  }

  /**
   * Generate complete HTML report from analyzed topics
   * @param {Array} topics - Array of analyzed topic objects
   * @returns {string} Complete HTML document
   */
  generateReport(topics) {
    const sortedTopics = this.sortTopicsByScore(topics);
    const stats = this.calculateStatistics(sortedTopics);

    return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>AI行业资讯分析报告 - ${this.timestamp}</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Hiragino Sans GB',
                         'Microsoft YaHei', 'Helvetica Neue', Helvetica, Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            padding: 20px;
        }

        .container {
            max-width: 1200px;
            margin: 0 auto;
            background: white;
            border-radius: 16px;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
            overflow: hidden;
        }

        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 40px;
            text-align: center;
        }

        .header h1 {
            font-size: 2.5em;
            margin-bottom: 10px;
            font-weight: 700;
        }

        .report-date {
            font-size: 1.1em;
            opacity: 0.95;
        }

        .content {
            padding: 40px;
        }

        .summary {
            background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
            border-radius: 12px;
            padding: 30px;
            margin-bottom: 40px;
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
        }

        .summary h2 {
            color: #667eea;
            margin-bottom: 20px;
            font-size: 1.8em;
        }

        .summary-stats {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            margin-top: 20px;
        }

        .stat-item {
            background: white;
            padding: 20px;
            border-radius: 8px;
            text-align: center;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        .stat-number {
            font-size: 2em;
            font-weight: bold;
            color: #667eea;
        }

        .stat-label {
            color: #666;
            margin-top: 5px;
        }

        .section-title {
            font-size: 2em;
            color: #333;
            margin: 40px 0 20px 0;
            padding-bottom: 10px;
            border-bottom: 3px solid #667eea;
        }

        .topic-card {
            border-radius: 12px;
            padding: 30px;
            margin: 30px 0;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
            transition: transform 0.3s ease, box-shadow 0.3s ease;
        }

        .topic-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 8px 30px rgba(0, 0, 0, 0.2);
        }

        .topic-card.excellent {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
        }

        .topic-card.good {
            background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
            color: white;
        }

        .topic-card.normal {
            background: linear-gradient(135deg, #e0eafc 0%, #cfdef3 100%);
        }

        .topic-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 20px;
            flex-wrap: wrap;
            gap: 15px;
        }

        .topic-title {
            font-size: 1.8em;
            font-weight: bold;
            flex: 1;
            min-width: 300px;
        }

        .score-badge {
            display: inline-block;
            padding: 10px 25px;
            border-radius: 30px;
            font-weight: bold;
            font-size: 1.2em;
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
        }

        .topic-card.excellent .score-badge {
            background: white;
            color: #667eea;
        }

        .topic-card.good .score-badge {
            background: white;
            color: #f5576c;
        }

        .topic-card.normal .score-badge {
            background: #667eea;
            color: white;
        }

        .topic-meta {
            display: flex;
            gap: 20px;
            margin-bottom: 20px;
            flex-wrap: wrap;
            font-size: 0.95em;
            opacity: 0.9;
        }

        .topic-meta span {
            display: flex;
            align-items: center;
            gap: 5px;
        }

        .section {
            margin: 25px 0;
        }

        .section h3 {
            font-size: 1.4em;
            margin-bottom: 15px;
            display: flex;
            align-items: center;
            gap: 10px;
        }

        .topic-card.excellent h3,
        .topic-card.good h3 {
            border-bottom: 2px solid rgba(255, 255, 255, 0.3);
            padding-bottom: 10px;
        }

        .topic-card.normal h3 {
            color: #667eea;
            border-bottom: 2px solid #667eea;
            padding-bottom: 10px;
        }

        .timeline {
            list-style: none;
            padding-left: 0;
        }

        .timeline li {
            position: relative;
            padding-left: 30px;
            margin-bottom: 12px;
        }

        .timeline li:before {
            content: "▸";
            position: absolute;
            left: 0;
            color: currentColor;
            font-weight: bold;
        }

        .product-details, .analysis {
            line-height: 1.8;
        }

        .product-details {
            background: rgba(255, 255, 255, 0.1);
            padding: 20px;
            border-radius: 8px;
            margin-top: 10px;
        }

        .topic-card.normal .product-details {
            background: rgba(102, 126, 234, 0.05);
        }

        .score-breakdown {
            display: flex;
            gap: 30px;
            margin-top: 15px;
            flex-wrap: wrap;
        }

        .score-item {
            flex: 1;
            min-width: 200px;
        }

        .score-label {
            font-size: 0.9em;
            opacity: 0.85;
            margin-bottom: 5px;
        }

        .score-bar-container {
            background: rgba(255, 255, 255, 0.2);
            height: 10px;
            border-radius: 5px;
            overflow: hidden;
        }

        .topic-card.normal .score-bar-container {
            background: rgba(102, 126, 234, 0.1);
        }

        .score-bar {
            height: 100%;
            background: white;
            border-radius: 5px;
            transition: width 0.5s ease;
        }

        .topic-card.normal .score-bar {
            background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
        }

        .footer {
            background: #f5f5f5;
            padding: 30px;
            text-align: center;
            color: #666;
            border-top: 1px solid #e0e0e0;
        }

        .footer a {
            color: #667eea;
            text-decoration: none;
        }

        .footer a:hover {
            text-decoration: underline;
        }

        @media (max-width: 768px) {
            .header h1 {
                font-size: 1.8em;
            }

            .topic-title {
                font-size: 1.4em;
                min-width: 100%;
            }

            .content {
                padding: 20px;
            }

            .summary-stats {
                grid-template-columns: 1fr;
            }
        }

        .badge {
            display: inline-block;
            padding: 5px 15px;
            border-radius: 20px;
            font-size: 0.85em;
            font-weight: 600;
            margin-right: 10px;
        }

        .badge-excellent {
            background: #667eea;
            color: white;
        }

        .badge-good {
            background: #f5576c;
            color: white;
        }

        .badge-normal {
            background: #c3cfe2;
            color: #333;
        }
    </style>
</head>
<body>
    <div class="container">
        ${this.generateHeader()}
        <div class="content">
            ${this.generateSummary(stats)}
            ${this.generateTopics(sortedTopics)}
        </div>
        ${this.generateFooter()}
    </div>
</body>
</html>`;
  }

  /**
   * Generate header section
   */
  generateHeader() {
    return `
    <div class="header">
        <h1>🤖 AI行业资讯分析报告</h1>
        <p class="report-date">生成时间: ${this.timestamp}</p>
    </div>`;
  }

  /**
   * Generate summary section
   */
  generateSummary(stats) {
    return `
    <div class="summary">
        <h2>📊 报告摘要</h2>
        <p>本次分析共涵盖 <strong>${stats.total}</strong> 个AI行业热点话题</p>
        <div class="summary-stats">
            <div class="stat-item">
                <div class="stat-number">${stats.total}</div>
                <div class="stat-label">总话题数</div>
            </div>
            <div class="stat-item">
                <div class="stat-number">${stats.excellent}</div>
                <div class="stat-label">优秀话题 (>80分)</div>
            </div>
            <div class="stat-item">
                <div class="stat-number">${stats.good}</div>
                <div class="stat-label">良好话题 (60-80分)</div>
            </div>
            <div class="stat-item">
                <div class="stat-number">${stats.normal}</div>
                <div class="stat-label">普通话题 (<60分)</div>
            </div>
            <div class="stat-item">
                <div class="stat-number">${stats.avgScore.toFixed(1)}</div>
                <div class="stat-label">平均评分</div>
            </div>
        </div>
    </div>`;
  }

  /**
   * Generate all topics sections
   */
  generateTopics(topics) {
    let html = '';

    // Excellent topics
    const excellentTopics = topics.filter(t => t.totalScore > 80);
    if (excellentTopics.length > 0) {
      html += '<h2 class="section-title">🏆 优秀话题</h2>';
      excellentTopics.forEach(topic => {
        html += this.generateTopicCard(topic, 'excellent');
      });
    }

    // Good topics
    const goodTopics = topics.filter(t => t.totalScore >= 60 && t.totalScore <= 80);
    if (goodTopics.length > 0) {
      html += '<h2 class="section-title">👍 良好话题</h2>';
      goodTopics.forEach(topic => {
        html += this.generateTopicCard(topic, 'good');
      });
    }

    // Normal topics
    const normalTopics = topics.filter(t => t.totalScore < 60);
    if (normalTopics.length > 0) {
      html += '<h2 class="section-title">📋 其他话题</h2>';
      normalTopics.forEach(topic => {
        html += this.generateTopicCard(topic, 'normal');
      });
    }

    return html;
  }

  /**
   * Generate single topic card
   */
  generateTopicCard(topic, category) {
    const badge = category === 'excellent' ? '优秀' : category === 'good' ? '良好' : '普通';

    return `
    <div class="topic-card ${category}">
        <div class="topic-header">
            <div class="topic-title">${this.escapeHtml(topic.title)}</div>
            <div class="score-badge">评分: ${topic.totalScore}/100</div>
        </div>

        <div class="topic-meta">
            <span><span class="badge badge-${category}">${badge}</span></span>
            <span>📅 ${topic.date || this.timestamp}</span>
            ${topic.source ? `<span>🔗 ${this.escapeHtml(topic.source)}</span>` : ''}
        </div>

        ${this.generateScoreBreakdown(topic)}

        <div class="section">
            <h3>📈 事件脉络</h3>
            <ul class="timeline">
                ${topic.timeline ? topic.timeline.map(item => `<li>${this.escapeHtml(item)}</li>`).join('') : '<li>暂无详细时间线</li>'}
            </ul>
        </div>

        <div class="section">
            <h3>💡 产品创意详情</h3>
            <div class="product-details">
                ${topic.productDetails ? this.escapeHtml(topic.productDetails) : '暂无详细产品信息'}
            </div>
        </div>

        <div class="section">
            <h3>🎯 综合分析</h3>
            <div class="analysis">
                ${topic.analysis ? this.escapeHtml(topic.analysis) : '暂无分析内容'}
            </div>
        </div>

        ${topic.sources && topic.sources.length > 0 ? `
        <div class="section">
            <h3>🔗 相关链接</h3>
            <ul class="timeline">
                ${topic.sources.map(source => `<li><a href="${source.url}" target="_blank" style="color: inherit;">${this.escapeHtml(source.title)}</a></li>`).join('')}
            </ul>
        </div>
        ` : ''}
    </div>`;
  }

  /**
   * Generate score breakdown section
   */
  generateScoreBreakdown(topic) {
    return `
    <div class="score-breakdown">
        <div class="score-item">
            <div class="score-label">有趣度 (${topic.interestingness}/80)</div>
            <div class="score-bar-container">
                <div class="score-bar" style="width: ${(topic.interestingness / 80) * 100}%"></div>
            </div>
        </div>
        <div class="score-item">
            <div class="score-label">有用度 (${topic.usefulness}/20)</div>
            <div class="score-bar-container">
                <div class="score-bar" style="width: ${(topic.usefulness / 20) * 100}%"></div>
            </div>
        </div>
    </div>`;
  }

  /**
   * Generate footer
   */
  generateFooter() {
    return `
    <div class="footer">
        <p>本报告由 AI News Analyzer 自动生成 | 数据来源: 多个AI行业权威媒体</p>
        <p>🤖 Generated with <a href="https://claude.com/claude-code" target="_blank">Claude Code</a></p>
    </div>`;
  }

  /**
   * Sort topics by score (descending)
   */
  sortTopicsByScore(topics) {
    return [...topics].sort((a, b) => b.totalScore - a.totalScore);
  }

  /**
   * Calculate statistics
   */
  calculateStatistics(topics) {
    return {
      total: topics.length,
      excellent: topics.filter(t => t.totalScore > 80).length,
      good: topics.filter(t => t.totalScore >= 60 && t.totalScore <= 80).length,
      normal: topics.filter(t => t.totalScore < 60).length,
      avgScore: topics.reduce((sum, t) => sum + t.totalScore, 0) / topics.length
    };
  }

  /**
   * Escape HTML to prevent XSS
   */
  escapeHtml(text) {
    const map = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
  }

  /**
   * Save report to file
   */
  saveReport(html, filename) {
    const fs = require('fs');
    const path = require('path');

    // Ensure reports directory exists
    const reportsDir = path.join(__dirname, 'reports');
    if (!fs.existsSync(reportsDir)) {
      fs.mkdirSync(reportsDir, { recursive: true });
    }

    const filepath = path.join(reportsDir, filename);
    fs.writeFileSync(filepath, html, 'utf8');

    return filepath;
  }
}

// Export for use in Node.js
if (typeof module !== 'undefined' && module.exports) {
  module.exports = AINewsReportGenerator;
}
