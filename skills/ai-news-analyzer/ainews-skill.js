#!/usr/bin/env node

/**
 * AI News Analyzer - Main Execution Script
 * Fetches AI news from TianAPI, analyzes with web search, and generates HTML report
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
 * Analyze news topics (this would be called by Claude with web search)
 * For now, returns basic structure that Claude will enhance
 */
function analyzeTopic(topic) {
  return {
    title: topic.title,
    description: topic.description,
    source: topic.source,
    date: topic.ctime,
    url: topic.url,
    imageUrl: topic.picUrl,
    timeline: [],
    productDetails: '',
    analysis: '',
    interestingness: 50,
    usefulness: 10,
    totalScore: 60,
    sources: []
  };
}

/**
 * Save raw data for Claude to process
 */
function saveRawData(newsList) {
  const reportsDir = path.join(__dirname, 'reports');
  if (!fs.existsSync(reportsDir)) {
    fs.mkdirSync(reportsDir, { recursive: true });
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
  const rawDataPath = path.join(reportsDir, `raw-news-${timestamp}.json`);

  fs.writeFileSync(rawDataPath, JSON.stringify(newsList, null, 2), 'utf8');
  return rawDataPath;
}

/**
 * Main execution
 */
async function main() {
  console.log('🚀 AI News Analyzer Starting...\n');

  try {
    // Phase 1: Fetch news
    console.log('📡 Phase 1: Fetching AI news from TianAPI...');
    const newsList = await fetchAINews();
    console.log(`   ✅ Successfully fetched ${newsList.length} topics\n`);

    // Save raw data
    const rawDataPath = saveRawData(newsList);
    console.log(`💾 Raw data saved to: ${rawDataPath}\n`);

    // Display topics
    console.log('📰 News Topics:');
    console.log('━'.repeat(80));
    newsList.forEach((topic, index) => {
      console.log(`${index + 1}. ${topic.title}`);
      console.log(`   📅 ${topic.ctime} | 🔗 ${topic.source}`);
      console.log(`   ${topic.description.substring(0, 100)}...`);
      console.log();
    });

    console.log('━'.repeat(80));
    console.log('\n✅ Phase 1 Complete!');
    console.log('\n📋 Next Steps:');
    console.log('   Claude will now:');
    console.log('   1. Enrich each topic with web search');
    console.log('   2. Analyze and score each topic');
    console.log('   3. Generate HTML report');
    console.log('\n📁 Raw data saved. Ready for Claude processing!\n');

    return {
      success: true,
      topicsCount: newsList.length,
      rawDataPath,
      topics: newsList
    };

  } catch (error) {
    console.error('❌ Error:', error.message);
    return { success: false, error: error.message };
  }
}

// Run if called directly
if (require.main === module) {
  main().then(result => {
    if (!result.success) {
      process.exit(1);
    }
  });
}

module.exports = { fetchAINews, analyzeTopic, saveRawData, main };
