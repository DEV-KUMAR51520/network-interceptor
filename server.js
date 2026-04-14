/**
 * Network Monitor Dashboard - Backend Server
 * Production-grade Express.js API for system and device monitoring
 */

const express = require('express');
const path = require('path');
const os = require('os');
const cors = require('cors');
const fetch = require('node-fetch');

const app = express();
const PORT = process.env.PORT || 3000;

// ============================================
// MIDDLEWARE
// ============================================
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Calculate CPU usage (simulated with variance)
 * In production, use 'os-utils' or 'systeminformation' package
 */
function getCPUUsage() {
  const baseline = 45;
  const variance = Math.sin(Date.now() / 5000) * 20 + Math.random() * 15;
  const usage = Math.max(10, Math.min(95, baseline + variance));
  return parseFloat(usage.toFixed(2));
}

/**
 * Calculate Memory usage
 */
function getMemoryUsage() {
  const totalMemory = os.totalmem();
  const freeMemory = os.freemem();
  const usedMemory = totalMemory - freeMemory;
  const percentage = (usedMemory / totalMemory) * 100;
  return parseFloat(percentage.toFixed(2));
}

/**
 * Get system uptime in hours
 */
function getSystemUptime() {
  const uptimeSeconds = os.uptime();
  const hours = Math.floor(uptimeSeconds / 3600);
  const minutes = Math.floor((uptimeSeconds % 3600) / 60);
  return { hours, minutes, seconds: os.uptime() };
}

/**
 * Simulate network traffic (in MB/s)
 */
function getNetworkTraffic() {
  const inbound = (Math.random() * 100 + 20).toFixed(2);
  const outbound = (Math.random() * 80 + 10).toFixed(2);
  return {
    inbound: parseFloat(inbound),
    outbound: parseFloat(outbound),
    total: parseFloat((parseFloat(inbound) + parseFloat(outbound)).toFixed(2))
  };
}

/**
 * Generate mock device list with random status
 */
function getDevices() {
  const devices = [
    { id: 1, name: 'Server-01', ip: '192.168.1.10', location: 'Data Center A' },
    { id: 2, name: 'Server-02', ip: '192.168.1.11', location: 'Data Center A' },
    { id: 3, name: 'Router-Main', ip: '192.168.1.1', location: 'Network Room' },
    { id: 4, name: 'Firewall-01', ip: '192.168.1.2', location: 'Network Room' },
    { id: 5, name: 'Database-01', ip: '192.168.1.20', location: 'Data Center B' },
    { id: 6, name: 'Cache-Server', ip: '192.168.1.30', location: 'Data Center B' },
    { id: 7, name: 'Load-Balancer', ip: '192.168.1.5', location: 'Network Room' },
    { id: 8, name: 'Backup-Server', ip: '192.168.1.40', location: 'Data Center A' }
  ];

  return devices.map(device => ({
    ...device,
    status: Math.random() > 0.15 ? 'online' : 'offline', // 85% online
    lastChecked: new Date(Date.now() - Math.random() * 60000).toLocaleTimeString(),
    responseTime: device.status === 'online' ? Math.floor(Math.random() * 100) : null
  }));
}

/**
 * URL Monitoring - Check website health
 * Tracks response time, status code, and uptime
 */
const urlMonitoringData = {};

// Pre-configured URLs to monitor (can be extended)
const monitoredUrls = [
  { id: 1, name: 'Google', url: 'https://www.google.com', category: 'Search' },
  { id: 2, name: 'GitHub', url: 'https://www.github.com', category: 'Development' },
  { id: 3, name: 'Stack Overflow', url: 'https://stackoverflow.com', category: 'Community' },
  { id: 4, name: 'Amazon', url: 'https://www.amazon.com', category: 'E-commerce' },
  { id: 5, name: 'Node.js', url: 'https://nodejs.org', category: 'Framework' }
];

/**
 * Monitor a single URL - Get response time and status
 */
async function monitorUrl(website) {
  const startTime = Date.now();
  
  try {
    const response = await fetch(website.url, {
      method: 'HEAD',
      timeout: 5000,
      redirect: 'follow'
    });
    
    const responseTime = Date.now() - startTime;
    const statusCode = response.status;
    const isUp = statusCode >= 200 && statusCode < 400;
    
    // Store monitoring data
    if (!urlMonitoringData[website.id]) {
      urlMonitoringData[website.id] = {
        checks: [],
        totalChecks: 0,
        successfulChecks: 0
      };
    }
    
    const data = urlMonitoringData[website.id];
    data.checks.push({ timestamp: Date.now(), isUp, responseTime, statusCode });
    data.totalChecks++;
    if (isUp) data.successfulChecks++;
    
    // Keep only last 50 checks in memory
    if (data.checks.length > 50) data.checks.shift();
    
    const uptime = data.totalChecks > 0 ? ((data.successfulChecks / data.totalChecks) * 100).toFixed(2) : 100;
    
    return {
      id: website.id,
      name: website.name,
      url: website.url,
      category: website.category,
      status: isUp ? 'up' : 'down',
      statusCode: statusCode,
      responseTime: responseTime,
      uptime: parseFloat(uptime),
      lastChecked: new Date().toLocaleTimeString(),
      isUp: isUp
    };
  } catch (error) {
    // Site is down or error occurred
    if (!urlMonitoringData[website.id]) {
      urlMonitoringData[website.id] = {
        checks: [],
        totalChecks: 0,
        successfulChecks: 0
      };
    }
    
    const data = urlMonitoringData[website.id];
    data.checks.push({ timestamp: Date.now(), isUp: false, responseTime: 0, statusCode: 0 });
    data.totalChecks++;
    
    if (data.checks.length > 50) data.checks.shift();
    
    const uptime = data.totalChecks > 0 ? ((data.successfulChecks / data.totalChecks) * 100).toFixed(2) : 0;
    
    return {
      id: website.id,
      name: website.name,
      url: website.url,
      category: website.category,
      status: 'down',
      statusCode: 0,
      responseTime: 0,
      uptime: parseFloat(uptime),
      lastChecked: new Date().toLocaleTimeString(),
      isUp: false,
      error: error.message
    };
  }
}

// ============================================
// API ENDPOINTS
// ============================================

/**
 * GET /api/system
 * Returns current system metrics
 */
app.get('/api/system', (req, res) => {
  try {
    const cpuUsage = getCPUUsage();
    const memoryUsage = getMemoryUsage();
    const uptime = getSystemUptime();
    const network = getNetworkTraffic();

    res.json({
      success: true,
      timestamp: new Date().toISOString(),
      data: {
        cpu: cpuUsage,
        memory: memoryUsage,
        uptime: `${uptime.hours}h ${uptime.minutes}m`,
        network: network,
        alerts: generateAlerts(cpuUsage, memoryUsage)
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch system metrics',
      details: error.message
    });
  }
});

/**
 * GET /api/devices
 * Returns list of monitored devices
 */
app.get('/api/devices', (req, res) => {
  try {
    const devices = getDevices();
    res.json({
      success: true,
      timestamp: new Date().toISOString(),
      data: {
        devices: devices,
        total: devices.length,
        online: devices.filter(d => d.status === 'online').length,
        offline: devices.filter(d => d.status === 'offline').length
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch devices',
      details: error.message
    });
  }
});

/**
 * GET /api/health
 * Health check endpoint
 */
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

/**
 * GET /api/monitor-urls
 * Monitor health of external URLs
 * Routes user-provided URLs or uses pre-configured list
 */
app.get('/api/monitor-urls', async (req, res) => {
  try {
    const customUrl = req.query.url; // ?url=https://example.com
    
    let urlsToCheck = monitoredUrls;
    
    if (customUrl) {
      // Monitor custom URL provided by user
      try {
        const url = new URL(customUrl); // Validate URL format
        urlsToCheck = [{
          id: 'custom',
          name: url.hostname,
          url: customUrl,
          category: 'Custom'
        }];
      } catch (e) {
        return res.status(400).json({
          success: false,
          error: 'Invalid URL format',
          example: 'http://localhost:3000/api/monitor-urls?url=https://example.com'
        });
      }
    }
    
    // Monitor all URLs in parallel
    const results = await Promise.all(
      urlsToCheck.map(website => monitorUrl(website))
    );
    
    const upCount = results.filter(r => r.isUp).length;
    const downCount = results.filter(r => !r.isUp).length;
    
    res.json({
      success: true,
      timestamp: new Date().toISOString(),
      data: {
        websites: results,
        summary: {
          total: results.length,
          up: upCount,
          down: downCount,
          availability: ((upCount / results.length) * 100).toFixed(2) + '%'
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to monitor URLs',
      details: error.message
    });
  }
});

/**
 * POST /api/monitor-urls/batch
 * Monitor multiple custom URLs
 * Body: { urls: ['https://example.com', 'https://test.com'] }
 */
app.post('/api/monitor-urls/batch', async (req, res) => {
  try {
    const { urls } = req.body;
    
    if (!Array.isArray(urls)) {
      return res.status(400).json({
        success: false,
        error: 'URLs must be an array'
      });
    }
    
    const urlsToCheck = urls.map((url, index) => ({
      id: `batch-${index}`,
      name: new URL(url).hostname,
      url: url,
      category: 'Custom'
    }));
    
    const results = await Promise.all(
      urlsToCheck.map(website => monitorUrl(website))
    );
    
    res.json({
      success: true,
      timestamp: new Date().toISOString(),
      data: {
        websites: results,
        totalMonitored: results.length,
        upCount: results.filter(r => r.isUp).length,
        downCount: results.filter(r => !r.isUp).length
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to monitor batch URLs',
      details: error.message
    });
  }
});

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Generate alerts based on thresholds
 */
function generateAlerts(cpu, memory) {
  const alerts = [];

  if (cpu > 80) {
    alerts.push({
      id: 'cpu-' + Date.now(),
      type: 'cpu',
      severity: cpu > 90 ? 'critical' : 'warning',
      message: `CPU usage is ${cpu}%`,
      timestamp: new Date().toISOString()
    });
  }

  if (memory > 80) {
    alerts.push({
      id: 'mem-' + Date.now(),
      type: 'memory',
      severity: memory > 90 ? 'critical' : 'warning',
      message: `Memory usage is ${memory}%`,
      timestamp: new Date().toISOString()
    });
  }

  return alerts;
}

// ============================================
// ERROR HANDLING
// ============================================

app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found',
    path: req.path
  });
});

// ============================================
// SERVER STARTUP
// ============================================

app.listen(PORT, () => {
  console.log(`
  ╔════════════════════════════════════════════╗
  ║   🚀 Network Monitor Dashboard Running     ║
  ║   📊 Server: http://localhost:${PORT}       ║
  ║   🔌 API: http://localhost:${PORT}/api      ║
  ╚════════════════════════════════════════════╝
  `);
});

module.exports = app;
