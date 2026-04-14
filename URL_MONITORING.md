# 🌐 URL Network Monitoring Feature

## Overview

The Network Monitoring Dashboard now includes **real-time URL monitoring** to check the health and performance of any external website or API endpoint.

---

## Features

### ✅ Pre-configured URL Monitoring
Monitor 5 popular websites automatically:
- **Google** - Search engine
- **GitHub** - Development platform  
- **Stack Overflow** - Developer community
- **Amazon** - E-commerce site
- **Node.js** - Framework documentation

### ✅ Custom URL Monitoring
Add any URL dynamically with just a few clicks!

### ✅ Real-Time Metrics
For each monitored URL, track:
- **Status**: Up/Down indicator
- **HTTP Status Code**: 200, 404, 503, etc.
- **Response Time**: Latency in milliseconds
- **Uptime**: Historical availability percentage (%)
- **Category**: Custom or predefined categories
- **Last Checked**: Timestamp of last check

### ✅ Visual Dashboard
- Summary cards showing total, online, and offline counts
- Availability percentage
- Color-coded status badges (green for up, red for down)
- Formatted response times in milliseconds

---

## How to Use

### 1. **View Pre-configured URLs**
- Click **"URLs"** tab in the sidebar
- Dashboard automatically loads and monitors 5 pre-configured websites
- View their status, response times, and historical uptime

### 2. **Monitor Custom URL**
1. Enter any valid URL in the input field (e.g., `https://example.com`)
2. Click **"🔍 Monitor"** button or press **Enter**
3. Dashboard immediately checks the URL's health
4. Results appear in the table below

### 3. **Refresh URLs**
- Click **"🔄 Refresh"** button to re-check all monitored URLs
- Automatically updates status, response times, and metrics
- Updates happen every 10 seconds when viewing the URLs tab

---

## API Usage

### Get Pre-configured URLs
```bash
curl http://localhost:3000/api/monitor-urls
```

**Response:**
```json
{
  "success": true,
  "timestamp": "2026-04-14T10:30:45.123Z",
  "data": {
    "websites": [
      {
        "id": 1,
        "name": "Google",
        "url": "https://www.google.com",
        "category": "Search",
        "status": "up",
        "statusCode": 200,
        "responseTime": 145,
        "uptime": 98.5,
        "lastChecked": "10:30:45",
        "isUp": true
      }
    ],
    "summary": {
      "total": 5,
      "up": 5,
      "down": 0,
      "availability": "100.00%"
    }
  }
}
```

### Monitor Custom URL
```bash
curl "http://localhost:3000/api/monitor-urls?url=https://example.com"
```

### Monitor Multiple URLs (Batch)
```bash
curl -X POST http://localhost:3000/api/monitor-urls/batch \
  -H "Content-Type: application/json" \
  -d '{
    "urls": [
      "https://example.com",
      "https://test.com",
      "https://api.example.com"
    ]
  }'
```

---

## Understanding the Metrics

### Status
- **Up**: Website responded with HTTP 200-399 status codes
- **Down**: Website didn't respond or returned error status (4xx, 5xx)

### Response Time
- Time (in milliseconds) for website to respond
- Indicates performance and server latency
- Lower is better (< 200ms is excellent)

### Uptime %
- Historical availability based on monitoring checks
- Calculated as: (successful checks / total checks) × 100
- Stored for last 50 checks per URL

### Status Codes
- **2xx**: Success (200 OK, 201 Created, etc.)
- **3xx**: Redirect (301, 302, 304, etc.)
- **4xx**: Client error (404 Not Found, 403 Forbidden)
- **5xx**: Server error (500, 503 Service Unavailable)

---

## Use Cases

### 🔧 **Development**
Monitor your own API endpoints during development:
```
https://localhost:3000/api/health
https://yourapi.example.com/status
```

### 📊 **Uptime Monitoring**
Track critical services:
```
https://your-production-api.com
https://your-database-cluster.com
https://cdn.your-domain.com
```

### 🏢 **Third-party Services**
Monitor SaaS providers you depend on:
```
https://api.stripe.com
https://api.github.com
https://amazonaws.com
```

### 🌍 **CDN & DNS**
Check global availability:
```
https://cloudflare.com
https://your-cdn.com
https://dns.your-domain.com
```

---

## Configuration

### Pre-configured URLs
To modify pre-configured URLs, edit `server.js`:

```javascript
const monitoredUrls = [
  { id: 1, name: 'Google', url: 'https://www.google.com', category: 'Search' },
  // Add more or modify existing...
];
```

### Response Timeout
Default timeout is **5 seconds** per URL check. Edit in `server.js`:

```javascript
const response = await fetch(website.url, {
  timeout: 5000,  // Change to desired milliseconds
});
```

### History Retention
By default, keeps last **50 checks** per URL. Modify in `server.js`:

```javascript
if (data.checks.length > 50) data.checks.shift();  // Change 50 to desired count
```

---

## Performance Considerations

### Auto-Refresh Interval
- **System Metrics**: Every 2 seconds (configurable in Settings)
- **URLs**: Every 10 seconds (when viewing URLs tab)
- **Custom checks**: On-demand (when clicking Monitor button)

### Timeout Handling
- If URL takes > 5 seconds to respond: marked as **Down**
- No network blocking - other tabs continue working normally
- Error messages captured and displayed

### Backend Resources
- Monitoring is performed asynchronously (non-blocking)
- Each check creates ~1KB of data stored
- Memory-efficient with circular buffer (50 checks max per URL)

---

## Practical Examples

### Monitor Your Own Server
```
https://localhost:3000
https://your-server.com
https://your-api.com/health
```

### Monitor Specific Endpoints
```
https://your-api.com/api/system
https://your-api.com/api/health
https://your-database.com:5432/status
```

### Monitor Multiple Services
1. Enter first URL → Click Monitor → Records data
2. Refresh to update all checked URLs
3. Enter another URL → Click Monitor → Adds to list
4. Toggle between Pre-configured and Custom URLs

---

## Troubleshooting

### "Failed to monitor URL"
- ✅ Verify URL is valid (starts with http:// or https://)
- ✅ Check internet connection
- ✅ Ensure target server is accessible
- ✅ Firewall might be blocking the request

### URL shows "Down" but website works
- Server might be blocking HEAD requests
- Try refreshing (sometimes temporary timeout)
- Check if website requires authentication

### Response time is very high
- Network latency (check your internet connection)
- Server is slow to respond
- Geolocation distance from server

### "Last Checked" not updating
- Click the Refresh button manually
- Make sure you're viewing the URLs tab
- Auto-refresh only happens when tab is active

---

## 📊 Data Storage

URL monitoring data is stored in-memory for the current session:
- **Per URL**: Last 50 checks stored
- **Session-based**: Data resets when server restarts
- **Persistence**: Can be extended with database integration

For production, consider:
- InfluxDB for time-series data
- MongoDB for historical records
- PostgreSQL for relational data

---

## 🚀 Future Enhancements

Potential additions:
- [ ] SMS/Email alerts when URL goes down
- [ ] Historical charts showing uptime over time
- [ ] Latency trends visualization
- [ ] Response time distribution
- [ ] SSL certificate expiration monitoring
- [ ] Webhook notifications
- [ ] Custom check intervals per-URL
- [ ] IP geolocation testing
- [ ] Full page load metrics
- [ ] Waterfall performance analysis

---

## 🎯 Integration with Dashboard

**URLs Tab Features:**
- Real-time status monitoring
- One-click custom URL addition
- Bulk monitoring with API
- Summary statistics
- Individual URL details
- Auto-refresh capability

**Alert Integration:**
Could trigger alerts (future enhancement):
- URL goes down
- Response time exceeds threshold
- Uptime drops below target
- HTTP status code changes

---

## 💡 Tips

1. **Use meaningful URL categories** - Helps organize monitoring
2. **Monitor in batches** - Use API's batch endpoint for multiple URLs
3. **Check regularly** - Keep the URLs tab open for continuous monitoring
4. **Set alerts** - Plan to add custom alert rules per URL (future)
5. **Track trends** - Note response times during peak/off-peak hours

---

## Example Monitoring Checklist

```
☐ Personal Blog: https://myblog.com
☐ API Server: https://api.example.com/health
☐ Database: https://db.example.com/status
☐ CDN: https://cdn.example.com
☐ GitHub Repo: https://github.com/yourrepo
☐ API Docs: https://docs.api.example.com
☐ Payment Gateway: https://stripe.com/status
☐ Analytics: https://analytics.example.com
```

---

**Version**: 1.0.0  
**Last Updated**: April 2026  
**Status**: Production Ready! 🚀

Happy monitoring! 📊🌐
