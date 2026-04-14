/**
 * Network Monitor Dashboard - Frontend Logic
 * Real-time monitoring with modern UX
 */

// ============================================
// STATE & CONFIGURATION
// ============================================

const state = {
  currentSection: 'dashboard',
  darkMode: localStorage.getItem('darkMode') === 'true',
  refreshInterval: parseInt(localStorage.getItem('refreshInterval')) || 2000,
  cpuThreshold: parseInt(localStorage.getItem('cpuThreshold')) || 80,
  memThreshold: parseInt(localStorage.getItem('memThreshold')) || 80,
  enableNotifications: localStorage.getItem('enableNotifications') !== 'false',
  soundAlerts: localStorage.getItem('soundAlerts') !== 'false',
  alerts: [],
  cpuHistory: [],
  chartInstance: null,
  updateIntervalId: null,
  urlUpdateIntervalId: null
};

// ============================================
// DOM REFERENCES
// ============================================

const elements = {
  loadingSpinner: document.getElementById('loadingSpinner'),
  sidebar: document.querySelector('.sidebar'),
  themeToggle: document.getElementById('themeToggle'),
  currentTime: document.getElementById('currentTime'),
  refreshStatus: document.getElementById('refreshStatus'),
  
  // Metrics
  cpuValue: document.getElementById('cpuValue'),
  cpuFill: document.getElementById('cpuFill'),
  memoryValue: document.getElementById('memoryValue'),
  memoryFill: document.getElementById('memoryFill'),
  networkValue: document.getElementById('networkValue'),
  trafficIn: document.getElementById('trafficIn'),
  trafficOut: document.getElementById('trafficOut'),
  uptimeValue: document.getElementById('uptimeValue'),
  
  // Devices
  devicesTableBody: document.getElementById('devicesTableBody'),
  deviceSearch: document.getElementById('deviceSearch'),
  totalDevices: document.getElementById('totalDevices'),
  onlineDevices: document.getElementById('onlineDevices'),
  offlineDevices: document.getElementById('offlineDevices'),
  
  // URLs
  urlsTableBody: document.getElementById('urlsTableBody'),
  customUrl: document.getElementById('customUrl'),
  monitorCustomUrl: document.getElementById('monitorCustomUrl'),
  refreshUrls: document.getElementById('refreshUrls'),
  totalUrls: document.getElementById('totalUrls'),
  onlineUrls: document.getElementById('onlineUrls'),
  offlineUrls: document.getElementById('offlineUrls'),
  availabilityPercent: document.getElementById('availabilityPercent'),
  
  // Alerts
  alertsContainer: document.getElementById('alertsContainer'),
  
  // Settings
  refreshIntervalSelect: document.getElementById('refreshInterval'),
  cpuThresholdSlider: document.getElementById('cpuThresholdSlider'),
  memThresholdSlider: document.getElementById('memThresholdSlider'),
  cpuThresholdDisplay: document.getElementById('cpuThreshold'),
  memThresholdDisplay: document.getElementById('memThreshold'),
  enableNotificationsCheckbox: document.getElementById('enableNotifications'),
  soundAlertsCheckbox: document.getElementById('soundAlerts'),
  
  // Toast
  notificationToast: document.getElementById('notificationToast')
};

// ============================================
// INITIALIZATION
// ============================================

document.addEventListener('DOMContentLoaded', async () => {
  initializeTheme();
  setupEventListeners();
  await loadInitialData();
  startAutoRefresh();
  initializeChart();
  updateClock();
  setInterval(updateClock, 1000);
});

// ============================================
// THEME & UI SETUP
// ============================================

function initializeTheme() {
  if (state.darkMode) {
    document.body.classList.add('dark-mode');
    elements.themeToggle.textContent = '☀️ Light Mode';
  }
}

function setupEventListeners() {
  // Navigation
  document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      switchSection(item.dataset.section);
    });
  });

  // Theme Toggle
  elements.themeToggle.addEventListener('click', toggleTheme);

  // Device Search
  elements.deviceSearch.addEventListener('input', filterDevicesTable);

  // Settings
  elements.refreshIntervalSelect.addEventListener('change', (e) => {
    state.refreshInterval = parseInt(e.target.value);
    localStorage.setItem('refreshInterval', state.refreshInterval);
    restartAutoRefresh();
    showNotification('Refresh interval updated');
  });

  elements.cpuThresholdSlider.addEventListener('input', (e) => {
    state.cpuThreshold = parseInt(e.target.value);
    elements.cpuThresholdDisplay.textContent = state.cpuThreshold;
    localStorage.setItem('cpuThreshold', state.cpuThreshold);
  });

  elements.memThresholdSlider.addEventListener('input', (e) => {
    state.memThreshold = parseInt(e.target.value);
    elements.memThresholdDisplay.textContent = state.memThreshold;
    localStorage.setItem('memThreshold', state.memThreshold);
  });

  elements.enableNotificationsCheckbox.addEventListener('change', (e) => {
    state.enableNotifications = e.target.checked;
    localStorage.setItem('enableNotifications', state.enableNotifications);
  });

  elements.soundAlertsCheckbox.addEventListener('change', (e) => {
    state.soundAlerts = e.target.checked;
    localStorage.setItem('soundAlerts', state.soundAlerts);
  });

  // Clear Alerts
  document.querySelector('.btn-clear-alerts').addEventListener('click', clearAlerts);

  // Refresh Button
  document.querySelector('.btn-refresh').addEventListener('click', () => {
    fetchDevices();
    showNotification('Devices refreshed');
  });

  // URL Monitoring
  elements.refreshUrls.addEventListener('click', () => {
    fetchUrls();
    showNotification('URLs refreshed');
  });

  elements.monitorCustomUrl.addEventListener('click', () => {
    const url = elements.customUrl.value.trim();
    if (!url) {
      showNotification('Please enter a URL', 'warning');
      return;
    }
    
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      showNotification('URL must start with http:// or https://', 'warning');
      return;
    }
    
    fetchUrlMonitor(url);
    elements.customUrl.value = '';
  });

  // Allow Enter key to monitor URL
  elements.customUrl.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      elements.monitorCustomUrl.click();
    }
  });
}

function toggleTheme() {
  state.darkMode = !state.darkMode;
  localStorage.setItem('darkMode', state.darkMode);
  document.body.classList.toggle('dark-mode');
  elements.themeToggle.textContent = state.darkMode ? '☀️ Light Mode' : '🌙 Dark Mode';
}

function switchSection(sectionName) {
  // Hide all sections
  document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
  
  // Update navigation
  document.querySelectorAll('.nav-item').forEach(item => {
    item.classList.toggle('active', item.dataset.section === sectionName);
  });

  // Show selected section
  document.getElementById(sectionName).classList.add('active');
  state.currentSection = sectionName;
}

function updateClock() {
  const now = new Date();
  elements.currentTime.textContent = now.toLocaleTimeString();
}

// ============================================
// API CALLS
// ============================================

async function fetchSystemMetrics() {
  try {
    const response = await fetch('/api/system');
    if (!response.ok) throw new Error('Failed to fetch system metrics');
    
    const data = await response.json();
    if (data.success) {
      updateMetricsUI(data.data);
      checkAlerts(data.data);
      addCPUToHistory(data.data.cpu);
      updateChart();
    }
  } catch (error) {
    console.error('Error fetching system metrics:', error);
    showNotification('Failed to fetch system data', 'error');
  }
}

async function fetchDevices() {
  try {
    const response = await fetch('/api/devices');
    if (!response.ok) throw new Error('Failed to fetch devices');
    
    const data = await response.json();
    if (data.success) {
      updateDevicesUI(data.data);
    }
  } catch (error) {
    console.error('Error fetching devices:', error);
    showNotification('Failed to fetch devices', 'error');
  }
}

async function fetchUrls() {
  try {
    const response = await fetch('/api/monitor-urls');
    if (!response.ok) throw new Error('Failed to fetch URLs');
    
    const data = await response.json();
    if (data.success) {
      updateUrlsUI(data.data);
    }
  } catch (error) {
    console.error('Error fetching URLs:', error);
    showNotification('Failed to fetch URLs', 'error');
  }
}

async function fetchUrlMonitor(url) {
  try {
    const encodedUrl = encodeURIComponent(url);
    const response = await fetch(`/api/monitor-urls?url=${encodedUrl}`);
    if (!response.ok) throw new Error('Failed to monitor URL');
    
    const data = await response.json();
    if (data.success) {
      updateUrlsUI(data.data);
      showNotification(`✓ Monitoring ${new URL(url).hostname}`);
    }
  } catch (error) {
    console.error('Error monitoring URL:', error);
    showNotification('Failed to monitor URL', 'error');
  }
}

async function loadInitialData() {
  try {
    await Promise.all([fetchSystemMetrics(), fetchDevices(), fetchUrls()]);
  } finally {
    hideLoadingSpinner();
  }
}

// ============================================
// UPDATE UI FUNCTIONS
// ============================================

function updateMetricsUI(data) {
  const { cpu, memory, uptime, network, alerts } = data;

  // CPU
  elements.cpuValue.textContent = cpu;
  elements.cpuFill.style.width = `${cpu}%`;

  // Memory
  elements.memoryValue.textContent = memory;
  elements.memoryFill.style.width = `${memory}%`;

  // Network
  elements.networkValue.textContent = network.total;
  elements.trafficIn.textContent = `${network.inbound} MB/s`;
  elements.trafficOut.textContent = `${network.outbound} MB/s`;

  // Uptime
  elements.uptimeValue.textContent = uptime;

  // Update last refresh time
  const now = new Date();
  elements.refreshStatus.textContent = `Last updated: ${now.toLocaleTimeString()}`;
}

function updateDevicesUI(data) {
  const { devices, total, online, offline } = data;

  elements.totalDevices.textContent = total;
  elements.onlineDevices.textContent = online;
  elements.offlineDevices.textContent = offline;

  // Populate table
  elements.devicesTableBody.innerHTML = devices.map(device => `
    <tr>
      <td><strong>${device.name}</strong></td>
      <td>${device.ip}</td>
      <td>${device.location}</td>
      <td>
        <span class="status-badge ${device.status}">
          <span class="status-dot ${device.status}"></span>
          ${device.status}
        </span>
      </td>
      <td>${device.responseTime ? `${device.responseTime}ms` : 'N/A'}</td>
      <td>${device.lastChecked}</td>
    </tr>
  `).join('');
}

function filterDevicesTable() {
  const query = elements.deviceSearch.value.toLowerCase();
  const rows = elements.devicesTableBody.querySelectorAll('tr');

  rows.forEach(row => {
    const text = row.textContent.toLowerCase();
    row.style.display = text.includes(query) ? '' : 'none';
  });
}

function updateUrlsUI(data) {
  const { websites, summary } = data;

  elements.totalUrls.textContent = summary.total;
  elements.onlineUrls.textContent = summary.up;
  elements.offlineUrls.textContent = summary.down;
  elements.availabilityPercent.textContent = summary.availability;

  // Populate table
  elements.urlsTableBody.innerHTML = websites.map(website => `
    <tr>
      <td><strong>${website.name}</strong></td>
      <td>
        <a href="${website.url}" target="_blank" style="color: var(--accent-primary); text-decoration: none;">
          ${website.url}
        </a>
      </td>
      <td>${website.category}</td>
      <td>
        <span class="url-status-badge ${website.status}">
          ${website.status === 'up' ? '✓' : '✕'} ${website.status}
        </span>
      </td>
      <td>${website.statusCode > 0 ? website.statusCode : 'N/A'}</td>
      <td>
        <span class="url-response-time">
          ${website.responseTime}ms
        </span>
      </td>
      <td>
        <span class="url-uptime">
          ${website.uptime}%
        </span>
      </td>
      <td>${website.lastChecked}</td>
    </tr>
  `).join('');
}

// ============================================
// ALERTS SYSTEM
// ============================================

function checkAlerts(data) {
  const { cpu, memory } = data;
  
  // CPU Alert
  if (cpu > state.cpuThreshold) {
    addAlert('cpu', cpu > 90 ? 'critical' : 'warning', `CPU usage is ${cpu}%`);
  }

  // Memory Alert
  if (memory > state.memThreshold) {
    addAlert('memory', memory > 90 ? 'critical' : 'warning', `Memory usage is ${memory}%`);
  }
}

function addAlert(type, severity, message) {
  const alertId = `${type}-${Date.now()}`;
  
  // Check if alert already exists
  if (state.alerts.some(a => a.type === type && a.message === message)) {
    return;
  }

  const alert = {
    id: alertId,
    type,
    severity,
    message,
    timestamp: new Date().toISOString()
  };

  state.alerts.unshift(alert);
  
  // Limit to last 10
  if (state.alerts.length > 10) {
    state.alerts.pop();
  }

  updateAlertsUI();
  
  // Sound and notification
  if (state.soundAlerts) playAlertSound();
  if (state.enableNotifications) showNotification(message, severity);
}

function updateAlertsUI() {
  if (state.alerts.length === 0) {
    elements.alertsContainer.innerHTML = `
      <div class="no-alerts">
        <p>✓ No active alerts</p>
        <p class="no-alerts-text">All systems operating normally</p>
      </div>
    `;
  } else {
    elements.alertsContainer.innerHTML = state.alerts.map(alert => `
      <div class="alert-item ${alert.severity}">
        <div class="alert-content">
          <div class="alert-message">
            ${alert.type === 'cpu' ? '⚡' : '💾'} 
            ${alert.message}
          </div>
          <div class="alert-time">${new Date(alert.timestamp).toLocaleTimeString()}</div>
        </div>
        <button class="alert-close" onclick="removeAlert('${alert.id}')">✕</button>
      </div>
    `).join('');
  }
}

function removeAlert(alertId) {
  state.alerts = state.alerts.filter(a => a.id !== alertId);
  updateAlertsUI();
}

function clearAlerts() {
  state.alerts = [];
  updateAlertsUI();
  showNotification('Alerts cleared');
}

// ============================================
// CHART.JS INTEGRATION
// ============================================

function initializeChart() {
  const ctx = document.getElementById('cpuChart').getContext('2d');
  
  state.chartInstance = new Chart(ctx, {
    type: 'line',
    data: {
      labels: generateTimeLabels(30),
      datasets: [{
        label: 'CPU Usage (%)',
        data: new Array(30).fill(null),
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        borderWidth: 2,
        fill: true,
        tension: 0.4,
        pointRadius: 3,
        pointHoverRadius: 6,
        pointBackgroundColor: 'rgb(59, 130, 246)',
        pointBorderColor: '#fff',
        pointBorderWidth: 1
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        legend: {
          display: true,
          labels: {
            color: getComputedStyle(document.body).getPropertyValue('--text-primary'),
            font: { size: 12, weight: '500' },
            padding: 15
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          max: 100,
          ticks: {
            color: getComputedStyle(document.body).getPropertyValue('--text-secondary'),
            callback: value => value + '%'
          },
          grid: {
            color: getComputedStyle(document.body).getPropertyValue('--border-color')
          }
        },
        x: {
          ticks: {
            color: getComputedStyle(document.body).getPropertyValue('--text-secondary')
          },
          grid: {
            display: false
          }
        }
      }
    }
  });
}

function updateChart() {
  if (!state.chartInstance) return;

  // Keep last 30 data points
  const maxDataPoints = 30;
  if (state.cpuHistory.length > maxDataPoints) {
    state.cpuHistory = state.cpuHistory.slice(-maxDataPoints);
  }

  state.chartInstance.data.datasets[0].data = state.cpuHistory;
  state.chartInstance.data.labels = generateTimeLabels(state.cpuHistory.length);
  state.chartInstance.update('none'); // No animation for smooth updates
}

function addCPUToHistory(cpu) {
  state.cpuHistory.push(cpu);
  if (state.cpuHistory.length > 30) {
    state.cpuHistory.shift();
  }
}

function generateTimeLabels(count) {
  const now = new Date();
  const labels = [];
  
  for (let i = count - 1; i >= 0; i--) {
    const time = new Date(now.getTime() - i * 2000);
    labels.push(time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
  }
  
  return labels;
}

// ============================================
// AUTO REFRESH
// ============================================

function startAutoRefresh() {
  state.updateIntervalId = setInterval(() => {
    fetchSystemMetrics();
    fetchDevices();
  }, state.refreshInterval);
  
  // Refresh URLs every 10 seconds (less frequent than system metrics)
  if (!state.urlUpdateIntervalId) {
    state.urlUpdateIntervalId = setInterval(() => {
      if (state.currentSection === 'urls') {
        fetchUrls();
      }
    }, 10000);
  }
}

function restartAutoRefresh() {
  clearInterval(state.updateIntervalId);
  startAutoRefresh();
}

// ============================================
// NOTIFICATIONS
// ============================================

function showNotification(message, type = 'info') {
  const toast = elements.notificationToast;
  
  let icon = '✓';
  if (type === 'error') icon = '✕';
  if (type === 'warning') icon = '⚠️';
  if (type === 'critical') icon = '🚨';

  toast.innerHTML = `<strong>${icon} ${message}</strong>`;
  toast.classList.remove('hidden');

  setTimeout(() => {
    toast.classList.add('hidden');
  }, 3000);
}

function playAlertSound() {
  // Create a simple beep using Web Audio API
  const audioContext = new (window.AudioContext || window.webkitAudioContext)();
  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();

  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);

  oscillator.frequency.value = 800;
  gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);

  oscillator.start(audioContext.currentTime);
  oscillator.stop(audioContext.currentTime + 0.1);
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

function hideLoadingSpinner() {
  elements.loadingSpinner.classList.add('hidden');
}

// ============================================
// SETTINGS INITIALIZATION
// ============================================

function initializeSettings() {
  elements.refreshIntervalSelect.value = state.refreshInterval;
  elements.cpuThresholdSlider.value = state.cpuThreshold;
  elements.memThresholdSlider.value = state.memThreshold;
  elements.cpuThresholdDisplay.textContent = state.cpuThreshold;
  elements.memThresholdDisplay.textContent = state.memThreshold;
  elements.enableNotificationsCheckbox.checked = state.enableNotifications;
  elements.soundAlertsCheckbox.checked = state.soundAlerts;
}

// Initialize settings when page loads
document.addEventListener('DOMContentLoaded', initializeSettings);

// ============================================
// ERROR BOUNDARY
// ============================================

window.addEventListener('error', (event) => {
  console.error('Global error:', event.error);
  showNotification('An error occurred', 'error');
});

window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason);
  showNotification('Network error occurred', 'error');
});
