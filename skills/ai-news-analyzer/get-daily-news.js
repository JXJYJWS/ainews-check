#!/usr/bin/env node

/**
 * Daily AI News Generator
 * 一键获取每日最新 AI 资讯报告
 */

const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');

// Load configuration
const configPath = path.join(__dirname, 'api-config.json');
const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));

/**
 * Fetch news from TianAPI
 */
async function fetchAINews() {
  return new Promise((resolve, reject) => {
    const url = new URL(config.apiEndpoint);
    url.searchParams.append('key', config.apiKey);
    url.searchParams.append('num', config.maxTopics.toString());

    const protocol = url.protocol === 'https:' ? https : http;

    console.log('📡 正在获取最新 AI 资讯...');
    console.log(`   API: ${config.apiEndpoint}`);
    console.log(`   最大话题数: ${config.maxTopics}`);
    console.log();

    const req = protocol.get(url.toString(), (res) => {
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
 * Analyze a single topic with basic scoring
 */
function analyzeTopic(topic) {
  let interestingness = 50; // Base score
  let usefulness = 10;

  // Extract keywords for scoring
  const title = topic.title.toLowerCase();
  const desc = topic.description.toLowerCase();

  // Interestingness scoring (up to 80)
  if (title.includes('突破') || title.includes('首发') || title.includes('首次')) {
    interestingness += 20;
  }
  if (title.includes('模型') || title.includes('AI') || title.includes('人工智能')) {
    interestingness += 10;
  }
  if (title.includes('openai') || title.includes('谷歌') || title.includes('苹果') || title.includes('英伟达')) {
    interestingness += 15;
  }
  if (desc.includes('研究') || desc.includes('论文') || desc.includes('发布')) {
    interestingness += 5;
  }

  // Usefulness scoring (up to 20)
  if (desc.includes('应用') || desc.includes('工具') || desc.includes('功能')) {
    usefulness += 5;
  }
  if (title.includes('开源') || title.includes('免费') || title.includes('开放')) {
    usefulness += 3;
  }

  // Cap scores
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

/**
 * 查找最新的已分析数据文件
 */
function findLatestAnalyzedData() {
  const reportsDir = path.join(__dirname, 'reports');
  if (!fs.existsSync(reportsDir)) {
    return null;
  }

  const files = fs.readdirSync(reportsDir)
    .filter(file => file.startsWith('analyzed-news-') && file.endsWith('.json'))
    .sort()
    .reverse();

  if (files.length === 0) {
    return null;
  }

  return path.join(reportsDir, files[0]);
}

/**
 * Main execution
 */
async function main() {
  console.log('🤖 AI News Analyzer - 每日资讯生成器\n');
  console.log('━'.repeat(80));
  console.log();

  try {
    let analyzedTopics;

    // 检查是否有 Claude Agent SDK 生成的分析数据
    const analyzedDataPath = findLatestAnalyzedData();

    if (analyzedDataPath) {
      console.log(`📂 发现已分析数据: ${path.basename(analyzedDataPath)}`);
      console.log('   使用 Claude Agent SDK 的分析结果\n');
      analyzedTopics = JSON.parse(fs.readFileSync(analyzedDataPath, 'utf8'));
      console.log(`✅ 已加载 ${analyzedTopics.length} 条已分析资讯\n`);
    } else {
      // Phase 1: Fetch news
      console.log('📡 Phase 1: 获取最新资讯...');
      const newsList = await fetchAINews();
      console.log(`✅ 成功获取 ${newsList.length} 条资讯\n`);

      // Phase 2: Analyze topics (基础分析)
      console.log('🤖 Phase 2: 正在分析资讯 (基础模式)...');
      analyzedTopics = newsList.map(topic => analyzeTopic(topic));
      console.log(`✅ 分析完成\n`);
    }

    // Phase 3: Generate HTML report
    console.log('📝 正在生成 HTML 报告...');
    const AINewsReportGenerator = require('./html-report-generator.js');
    const generator = new AINewsReportGenerator();
    const html = generator.generateReport(analyzedTopics);

    // Save report
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
    const filename = `ai-news-report-${timestamp}.html`;
    const filepath = generator.saveReport(html, filename);

    console.log(`✅ 报告生成完成\n`);
    console.log('━'.repeat(80));
    console.log();

    // Display statistics
    const stats = generator.calculateStatistics(analyzedTopics);
    console.log('📊 报告统计:');
    console.log(`   总话题数: ${stats.total}`);
    console.log(`   优秀 (>80分): ${stats.excellent}`);
    console.log(`   良好 (60-80分): ${stats.good}`);
    console.log(`   普通 (<60分): ${stats.normal}`);
    console.log(`   平均分: ${stats.avgScore.toFixed(1)}`);
    console.log();

    // Top topics
    console.log('🏆 Top 5 高分话题:');
    const sortedTopics = [...analyzedTopics].sort((a, b) => b.totalScore - a.totalScore);
    sortedTopics.slice(0, 5).forEach((topic, index) => {
      console.log(`   ${index + 1}. [${topic.totalScore}分] ${topic.title}`);
    });
    console.log();

    console.log('━'.repeat(80));
    console.log();
    console.log('📄 报告已保存到:');
    console.log(`   ${filepath}`);
    console.log();

    // Open report in browser
    const { exec } = require('child_process');
    const openCmd = process.platform === 'win32' ? 'start' :
                    process.platform === 'darwin' ? 'open' : 'xdg-open';

    console.log('🌐 正在打开报告...');
    exec(`${openCmd} "${filepath}"`, (error) => {
      if (error) {
        console.log('   💡 提示: 请手动在浏览器中打开上述 HTML 文件');
      } else {
        console.log('   ✅ 报告已在浏览器中打开');
      }
      console.log();
      console.log('✨ 完成！');
    });

  } catch (error) {
    console.error('❌ 错误:', error.message);
    console.log();
    console.log('💡 故障排除建议:');
    console.log('   1. 检查网络连接');
    console.log('   2. 检查 api-config.json 中的 API key 是否正确');
    console.log('   3. 确认 TianAPI 服务是否正常');
    process.exit(1);
  }
}

// Run
main();
