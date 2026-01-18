#!/usr/bin/env node

/**
 * AI News Analyzer - Zhipu GLM-4.7 Version
 * 使用智谱 GLM-4.7 进行智能新闻分析和报告生成
 *
 * 适用于 GitHub Actions 云端执行
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

// 加载配置（优先使用环境变量，否则从配置文件读取）
let config;
const TIANAPI_KEY = process.env.TIANAPI_KEY;
const TIANAPI_ENDPOINT = process.env.TIANAPI_ENDPOINT || 'https://apis.tianapi.com/ai/index';
const MAX_TOPICS = process.env.MAX_TOPICS || '20';

if (TIANAPI_KEY) {
  // 从环境变量构建配置
  config = {
    apiEndpoint: TIANAPI_ENDPOINT,
    apiKey: TIANAPI_KEY,
    apiName: 'TianAPI',
    apiTimeout: 30000,
    maxTopics: parseInt(MAX_TOPICS, 10)
  };
  console.log('✅ 使用环境变量配置');
} else {
  // 从配置文件读取
  const configPath = path.join(__dirname, '../../skills/ai-news-analyzer/api-config.json');
  if (fs.existsSync(configPath)) {
    config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    console.log('✅ 使用配置文件:', configPath);
  } else {
    throw new Error('未找到配置文件且未设置 TIANAPI_KEY 环境变量');
  }
}

// 从环境变量获取智谱 API Key
const ZHIPU_API_KEY = process.env.ZHIPU_API_KEY;
if (!ZHIPU_API_KEY) {
  throw new Error('ZHIPU_API_KEY environment variable is required');
}

/**
 * 智谱 GLM-4.7 分析器
 */
class ZhipuAnalyzer {
  constructor(apiKey) {
    this.apiKey = apiKey;
    this.apiBaseUrl = 'https://open.bigmodel.cn/api/paas/v4/chat/completions';
  }

  /**
   * 调用智谱 GLM-4.7 API 进行分析
   */
  async analyzeWithGLM(topic) {
    const systemPrompt = `你是一个专业的 AI 行业资讯分析师。你的任务是：

1. 分析提供的 AI 新闻话题
2. 评估其"有趣度"（0-80分）和"有用度"（0-20分）
3. 生成事件脉络时间线
4. 提取产品/技术创新的详细细节
5. 提供综合分析说明

评分标准：
- 有趣度（80分）：
  * 70-80: 突破性创新 - 颠覆性技术或重大突破
  * 60-69: 重大进展 - 显著的技术提升或里程碑
  * 50-59: 显著更新 - 重要功能或改进
  * 30-49: 常规新闻 - 一般性的行业动态

- 有用度（20分）：
  * 18-20: 高度可执行 - 提供具体可行的洞察
  * 15-17: 有价值 - 提供有意义的行业见解
  * 10-14: 信息丰富 - 包含有用的背景信息
  * 5-9: 有限效用 - 信息量较少

请严格按照以下 JSON 格式返回分析结果，不要添加任何其他内容：`;

    const userPrompt = `请分析以下 AI 新闻话题：

标题：${topic.title}
描述：${topic.description}
来源：${topic.source}
日期：${topic.ctime}
链接：${topic.url}

请返回以下 JSON 格式的分析结果（必须是纯JSON，不要添加其他解释）：
{
  "interestingness": 数字 (0-80),
  "usefulness": 数字 (0-20),
  "totalScore": 数字 (interestingness + usefulness),
  "timeline": ["事件1", "事件2", ...],
  "productDetails": "产品/技术详情描述",
  "analysis": "综合分析说明为什么这个话题重要",
  "sources": [{"title": "来源标题", "url": "链接"}]
}`;

    try {
      const response = await this.callGLMAPI(systemPrompt, userPrompt);
      return this.parseAnalysisResponse(response, topic);
    } catch (error) {
      console.warn(`  ⚠️  GLM API 调用失败，使用基础评分: ${error.message}`);
      return this.getFallbackAnalysis(topic);
    }
  }

  /**
   * 调用智谱 GLM-4.7 API
   * 使用原生 https 模块，无需额外依赖
   */
  async callGLMAPI(systemPrompt, userPrompt) {
    return new Promise((resolve, reject) => {
      const data = JSON.stringify({
        model: 'glm-4-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.3,
        max_tokens: 2000,
        top_p: 0.7
      });

      const url = new URL(this.apiBaseUrl);
      const options = {
        hostname: url.hostname,
        port: 443,
        path: url.pathname,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        }
      };

      const req = https.request(options, (res) => {
        let responseData = '';

        res.on('data', (chunk) => {
          responseData += chunk;
        });

        res.on('end', () => {
          try {
            const result = JSON.parse(responseData);

            if (result.error) {
              reject(new Error(`GLM API Error: ${result.error.message}`));
              return;
            }

            if (result.choices && result.choices[0] && result.choices[0].message) {
              resolve(result.choices[0].message.content);
            } else {
              reject(new Error('Invalid GLM API response format'));
            }
          } catch (error) {
            reject(new Error(`Failed to parse GLM API response: ${error.message}`));
          }
        });
      });

      req.on('error', (error) => {
        reject(new Error(`GLM API request failed: ${error.message}`));
      });

      req.setTimeout(60000, () => {
        req.destroy();
        reject(new Error('GLM API request timeout'));
      });

      req.write(data);
      req.end();
    });
  }

  /**
   * 解析 GLM API 响应
   */
  parseAnalysisResponse(response, originalTopic) {
    try {
      // 尝试从响应中提取 JSON
      let jsonStr = response.trim();

      // 移除可能的 markdown 代码块标记
      jsonStr = jsonStr.replace(/^```json\s*/i, '');
      jsonStr = jsonStr.replace(/^```\s*/i, '');
      jsonStr = jsonStr.replace(/\s*```$/, '');

      // 查找 JSON 对象
      const jsonMatch = jsonStr.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        jsonStr = jsonMatch[0];
      }

      const analysis = JSON.parse(jsonStr);

      return {
        title: originalTopic.title,
        description: originalTopic.description,
        source: originalTopic.source,
        date: originalTopic.ctime,
        url: originalTopic.url,
        imageUrl: originalTopic.picUrl,
        timeline: analysis.timeline || [],
        productDetails: analysis.productDetails || originalTopic.description,
        analysis: analysis.analysis || '',
        interestingness: analysis.interestingness || 50,
        usefulness: analysis.usefulness || 10,
        totalScore: analysis.totalScore || 60,
        sources: analysis.sources || [
          { title: "查看原文", url: originalTopic.url }
        ]
      };
    } catch (error) {
      throw new Error(`Failed to parse analysis response: ${error.message}`);
    }
  }

  /**
   * 降级方案：基础分析（不使用 GLM API）
   */
  getFallbackAnalysis(topic) {
    let interestingness = 50;
    let usefulness = 10;

    const title = topic.title.toLowerCase();
    const desc = topic.description.toLowerCase();

    // 简单的关键词评分
    if (title.includes('突破') || title.includes('首发') || title.includes('首次')) {
      interestingness += 20;
    }
    if (title.includes('模型') || title.includes('ai') || title.includes('人工智能')) {
      interestingness += 10;
    }
    if (title.includes('openai') || title.includes('谷歌') || title.includes('英伟达') || title.includes('智谱')) {
      interestingness += 15;
    }
    if (desc.includes('研究') || desc.includes('论文') || desc.includes('发布')) {
      interestingness += 5;
    }

    if (desc.includes('应用') || desc.includes('工具') || desc.includes('功能')) {
      usefulness += 5;
    }
    if (title.includes('开源') || title.includes('免费') || title.includes('开放')) {
      usefulness += 3;
    }

    interestingness = Math.min(80, interestingness);
    usefulness = Math.min(20, usefulness);
    const totalScore = interestingness + usefulness;

    return {
      title: topic.title,
      description: topic.description,
      source: topic.source,
      date: topic.ctime,
      url: topic.url,
      imageUrl: topic.picUrl,
      timeline: [
        `${topic.ctime}: 新闻发布`,
        `来源: ${topic.source}`,
        `原文链接: ${topic.url}`
      ],
      productDetails: topic.description,
      analysis: `基于 ${topic.source} 的报道。此话题反映了当前AI行业的发展动向。${totalScore > 70 ? '这是重要资讯，值得深入关注。' : '这是常规行业动态。'}`,
      interestingness: interestingness,
      usefulness: usefulness,
      totalScore: totalScore,
      sources: [
        { title: "查看原文", url: topic.url }
      ]
    };
  }
}

/**
 * 从 TianAPI 获取新闻
 */
async function fetchAINews() {
  return new Promise((resolve, reject) => {
    const url = new URL(config.apiEndpoint);
    url.searchParams.append('key', config.apiKey);
    url.searchParams.append('num', config.maxTopics.toString());

    console.log(`📡 正在从 TianAPI 获取新闻...`);
    console.log(`   API: ${config.apiEndpoint}`);
    console.log(`   最大话题数: ${config.maxTopics}`);

    const req = https.get(url.toString(), (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          if (response.code === 200) {
            resolve(response.result.newslist);
          } else {
            reject(new Error(`API Error: ${response.msg}`));
          }
        } catch (error) {
          reject(error);
        }
      });
    });

    req.on('error', reject);
    req.setTimeout(config.apiTimeout, () => {
      req.destroy();
      reject(new Error('API request timeout'));
    });
  });
}

/**
 * 保存分析结果
 */
function saveAnalyzedData(analyzedTopics) {
  const reportsDir = path.join(__dirname, '../../skills/ai-news-analyzer/reports');
  if (!fs.existsSync(reportsDir)) {
    fs.mkdirSync(reportsDir, { recursive: true });
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
  const filename = `analyzed-news-${timestamp}.json`;
  const filepath = path.join(reportsDir, filename);

  fs.writeFileSync(filepath, JSON.stringify(analyzedTopics, null, 2), 'utf8');
  return filepath;
}

/**
 * 主执行函数
 */
async function main() {
  console.log('🤖 AI News Analyzer - Zhipu GLM-4.7 Version\n');
  console.log('━'.repeat(80));
  console.log();

  try {
    // Phase 1: 获取新闻
    console.log('📡 Phase 1: 获取 AI 新闻...');
    const newsList = await fetchAINews();
    console.log(`   ✅ 成功获取 ${newsList.length} 条资讯\n`);

    // Phase 2: 使用智谱 GLM-4.7 进行分析
    console.log('🧠 Phase 2: 使用智谱 GLM-4.7 进行分析...');
    const analyzer = new ZhipuAnalyzer(ZHIPU_API_KEY);

    const analyzedTopics = [];
    for (let i = 0; i < newsList.length; i++) {
      const topic = newsList[i];
      console.log(`   [${i + 1}/${newsList.length}] 分析: ${topic.title.substring(0, 50)}...`);

      try {
        const analyzed = await analyzer.analyzeWithGLM(topic);
        analyzedTopics.push(analyzed);
        console.log(`      ✅ 评分: ${analyzed.totalScore}/100`);
      } catch (error) {
        console.warn(`      ⚠️  跳过: ${error.message}`);
      }
    }

    console.log(`   ✅ 分析完成\n`);

    // 保存分析结果
    const dataPath = saveAnalyzedData(analyzedTopics);
    console.log(`💾 分析结果已保存到: ${dataPath}\n`);

    // 统计信息
    const stats = {
      total: analyzedTopics.length,
      excellent: analyzedTopics.filter(t => t.totalScore > 80).length,
      good: analyzedTopics.filter(t => t.totalScore >= 60 && t.totalScore <= 80).length,
      normal: analyzedTopics.filter(t => t.totalScore < 60).length,
      avgScore: analyzedTopics.reduce((sum, t) => sum + t.totalScore, 0) / analyzedTopics.length
    };

    console.log('📊 分析统计:');
    console.log(`   总话题数: ${stats.total}`);
    console.log(`   优秀 (>80分): ${stats.excellent}`);
    console.log(`   良好 (60-80分): ${stats.good}`);
    console.log(`   普通 (<60分): ${stats.normal}`);
    console.log(`   平均分: ${stats.avgScore.toFixed(1)}`);
    console.log();

    console.log('━'.repeat(80));
    console.log('\n✅ 分析完成！数据已准备好供 HTML 报告生成器使用。\n');

    return {
      success: true,
      topicsCount: analyzedTopics.length,
      stats: stats
    };

  } catch (error) {
    console.error('❌ 错误:', error.message);
    return { success: false, error: error.message };
  }
}

// 执行
if (require.main === module) {
  main().then(result => {
    if (!result.success) {
      process.exit(1);
    }
  }).catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

module.exports = { ZhipuAnalyzer, fetchAINews, main };
