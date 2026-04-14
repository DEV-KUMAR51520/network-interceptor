# SETUP GUIDE - Network Monitor Dashboard

## 🚀 Quick Start (5 Minutes)

### Step 1: Install Dependencies
Navigate to the project folder and install Node.js dependencies:
```bash
cd network-monitor
npm install
```

Expected output:
```
added 63 packages, and audited 64 packages in 2s
```

### Step 2: Start the Server
```bash
npm start
```

Expected output:
```
╔════════════════════════════════════════════╗
║   🚀 Network Monitor Dashboard Running     ║
║   📊 Server: http://localhost:3000       ║
║   🔌 API: http://localhost:3000/api      ║
╚════════════════════════════════════════════╝
```

### Step 3: Open Browser
Open your web browser and navigate to:
```
http://localhost:3000
```

✅ **Dashboard is now live!**

---

## 📋 System Requirements

- **Node.js**: v14.0.0 or higher
- **npm**: v6.0.0 or higher
- **Browser**: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
- **RAM**: Minimum 512MB
- **Disk Space**: ~100MB (including node_modules)

### Check Node.js Version
```bash
node --version
npm --version
```

---

## 📂 Project Structure Overview

```
network-monitor/
│
├── 📄 server.js              # Express backend (port 3000)
├── 📦 package.json           # Dependencies & scripts
├── 📖 README.md              # Full documentation
├── 📋 SETUP_GUIDE.md         # This file
├── 📝 .gitignore             # Git rules
│
└── 📁 public/                # Frontend files
    ├── 🌐 index.html         # Dashboard UI
    ├── 🎨 style.css          # Modern glassmorphism styling
    └── ⚙️ script.js          # Real-time logic & API calls
```

---

## 🔧 Available npm Scripts

### Development
```bash
npm start        # Start server (production mode)
npm run dev      # Start with auto-reload (requires nodemon)
```

### To Use Development Mode
First install nodemon globally:
```bash
npm install -g nodemon
```

Then use:
```bash
npm run dev
```

---

## 🌐 API Endpoints Reference

### System Metrics
```
GET http://localhost:3000/api/system
```
Returns: CPU, Memory, Uptime, Network Traffic

### Devices
```
GET http://localhost:3000/api/devices
```
Returns: List of 8 simulated network devices

### Health Check
```
GET http://localhost:3000/api/health
```
Returns: Server status and uptime

### Frontend
```
GET http://localhost:3000
```
Returns: Dashboard HTML

---

## 🎯 Dashboard Features Tour

### 1. Dashboard Tab (Home)
- **CPU Usage Card**: Real-time processor load with progress bar
- **Memory Card**: RAM utilization percentage
- **Network Card**: Inbound/Outbound traffic
- **Uptime Card**: System continuous run time
- **CPU Trend Chart**: Historical 30-second trend visualization

### 2. Devices Tab
- **Device List**: 8 simulated network devices
- **Status**: Online/Offline with visual badges
- **Search**: Filter devices by name or IP
- **Summary**: Total, online, and offline device count

### 3. Alerts Tab
- **Real-time Alerts**: Triggered when CPU/Memory > 80%
- **Severity Levels**: Warning and Critical
- **Clear Function**: Remove all alerts at once

### 4. Settings Tab
- **Refresh Interval**: Set update frequency (2s, 5s, 10s)
- **Alert Thresholds**: Configure CPU/Memory warning levels
- **Notifications**: Toggle browser alerts and sound

---

## 🎨 UI Features

### Dark Mode
- Located in sidebar footer
- Automatically saves preference
- Smooth transition between themes

### Responsive Design
Optimized for:
- **Desktop** (1440px+)
- **Laptop** (1024px - 1440px)
- **Tablet** (768px - 1024px)
- **Mobile** (< 768px)

### Glassmorphism Design
- Modern frosted glass effect
- Gradient accents
- Smooth shadows and animations
- Professional SaaS look

---

## ⚙️ Configuration

### Change Port Number
Edit `server.js` line 9:
```javascript
const PORT = process.env.PORT || 3000;
```

Or use environment variable:
```bash
PORT=3001 npm start
```

### Default Alert Thresholds
Edit in Settings tab or modify defaults in `script.js`:
```javascript
cpuThreshold: 80,
memThreshold: 80
```

---

## 🧪 Testing the Dashboard

### Test 1: Real-time Updates
1. Open dashboard
2. Observe CPU changing every 2 seconds
3. Check chart updates with new data

### Test 2: Alerts
1. Go to Settings
2. Lower CPU threshold to 40%
3. Alert should appear in Alerts tab

### Test 3: Device Status
1. Click Devices tab
2. See 8 devices with varying online/offline status
3. Use search to filter devices

### Test 4: Dark Mode
1. Click theme toggle in sidebar
2. Entire interface should switch colors

### Test 5: API Endpoints
Open browser console and test:
```javascript
// Fetch system metrics
fetch('/api/system').then(r => r.json()).then(d => console.log(d))

// Fetch devices
fetch('/api/devices').then(r => r.json()).then(d => console.log(d))
```

---

## 🐛 Troubleshooting

### Problem: Port 3000 Already in Use
**Solution:**
```bash
# Use different port
PORT=3001 npm start

# Or kill process on port 3000
# On Windows:
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# On Mac/Linux:
lsof -ti:3000 | xargs kill -9
```

### Problem: Module Not Found Error
**Solution:**
```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

### Problem: Page Won't Load
**Solution:**
1. Clear browser cache: `Ctrl+Shift+Delete`
2. Hard refresh: `Ctrl+Shift+R`
3. Check server console: `npm start`

### Problem: Data Not Updating
**Solution:**
1. Open DevTools: `F12`
2. Check Console tab for errors
3. Check Network tab to see API responses
4. Verify update interval in Settings

### Problem: Dark Mode Not Saving
**Solution:**
1. Open DevTools
2. Go to Application > Local Storage
3. Check if entries for 'darkMode' exist
4. Clear site data and refresh

---

## 📊 Understanding the Data

### CPU Usage Simulation
- Baseline: 45%
- Variance: ±20% sine wave + random
- Range: 10% - 95%
- Updates: Every 2 seconds

### Memory Usage
- Uses actual system memory from Node.js `os` module
- Real system RAM utilization percentage
- No simulation - genuine OS data

### Network Traffic
- Simulated data (MB/s)
- Inbound: 20 - 120 MB/s
- Outbound: 10 - 90 MB/s
- For production, integrate real network monitoring

### Device Status
- 8 mock devices with IP addresses
- 85% probability of being online
- Random response times: 20 - 120ms
- Last checked timestamp updates

---

## 🔐 Production Considerations

### Before Deploying:

1. **Environment Variables**
   ```
   NODE_ENV=production
   PORT=3000
   ```

2. **Security**
   - Enable HTTPS
   - Add authentication
   - Rate limiting
   - CORS configuration review

3. **Logging**
   - Set up centralized logging (Winston, Pino)
   - Error tracking (Sentry)
   - Performance monitoring (New Relic)

4. **Database**
   - Store historical metrics
   - User management
   - Alert history

---

## 📈 Performance Tips

### For Better Performance:

1. **Increase Refresh Interval**
   - Use 5-10 seconds for production
   - Reduces server load

2. **Browser Cache**
   - Static assets cached via HTTP headers
   - JS/CSS minification for production

3. **Chart Optimization**
   - Limit to last 30 data points
   - Use efficient update method (`update('none')`)

4. **Mobile Optimization**
   - Responsive images
   - Touch-friendly UI
   - Reduced animations on low-end devices

---

## 🚀 Deployment Options

### Heroku
```bash
heroku login
heroku create
git push heroku main
```

### Railway.app
1. Connect GitHub repo
2. Set start command: `node server.js`
3. Deploy

### Docker
```dockerfile
FROM node:14
WORKDIR /app
COPY . .
RUN npm install --production
CMD ["node", "server.js"]
```

---

## 📚 Code Structure Explanation

### Backend Files

**server.js** (150 lines)
- Express app setup
- Utility functions for metrics
- REST API endpoints
- Error handling middleware

### Frontend Files

**index.html** (300 lines)
- Semantic HTML5 structure
- Sidebar navigation
- Metric cards
- Device table
- Alerts section
- Settings panel
- Chart canvas

**style.css** (800+ lines)
- CSS variables for theming
- Glassmorphism components
- Responsive grid layouts
- Dark mode support
- Animation keyframes
- Mobile breakpoints

**script.js** (600+ lines)
- State management
- API integration
- Chart.js initialization
- Event listeners
- Real-time updates
- Alert system
- Dark mode toggle
- Notifications

---

## ✅ Verification Checklist

- [ ] Node.js installed (v14+)
- [ ] `npm install` completed
- [ ] `npm start` runs without errors
- [ ] Browser opens `http://localhost:3000`
- [ ] Dashboard displays all 4 metrics
- [ ] Chart.js line chart appears
- [ ] Device table loads 8 devices
- [ ] Dark mode toggle works
- [ ] Search filters devices
- [ ] Update happens every 2 seconds
- [ ] Alerts trigger when thresholds exceeded
- [ ] Settings persist after refresh

---

## 🎓 Learning Resources

### JavaScript Concepts Used
- ES6+ syntax (Arrow functions, Promises, Async/Await)
- DOM manipulation
- Fetch API
- LocalStorage
- Event listeners
- Chart.js library

### CSS Concepts
- Flexbox & CSS Grid
- CSS Variables
- Animations & Transitions
- Media queries
- Glassmorphism effect

### Node.js/Express
- Express routing
- Middleware
- RESTful API design
- Error handling
- Module exports

---

## 💡 Next Steps

1. **Explore the Code**
   - Read comments in each file
   - Understand the API structure
   - Study CSS organization

2. **Customize**
   - Change colors in CSS variables
   - Modify device list
   - Add new metrics

3. **Extend**
   - Add database integration
   - Implement WebSockets
   - Build user authentication
   - Add export functionality

4. **Deploy**
   - Choose hosting platform
   - Set up environment variables
   - Configure SSL/TLS
   - Monitor production

---

## 📞 Support Commands

```bash
# View node version
node -v

# View npm version
npm -v

# Check Node installation
which node

# List installed packages
npm list

# Clear npm cache
npm cache clean --force

# Reinstall specific package
npm install express --save

# Update all packages
npm update
```

---

## 🎉 You're All Set!

Your production-quality Network Monitoring Dashboard is ready to go!

**Remember:**
- Keep the server running: `npm start`
- Open browser: `http://localhost:3000`
- Explore all features and tabs
- Read the main README.md for more details

Build something amazing! 🚀

---

Last Updated: April 2026
Version: 1.0.0
