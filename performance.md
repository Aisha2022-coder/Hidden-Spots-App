# Performance Testing & Reporting

## 1. API Latency Testing

A script (`server/performance-test.js`) is provided to measure response times for key backend endpoints.

### How to Run:

1. In a terminal, go to the `server/` directory:
   ```sh
   cd server
   node performance-test.js
   ```
2. The script will output average response times for:
   - `/api/spots`
   - `/api/spots/top`
   - `/api/spots/:id`

---

## 2. Map Render Speed (Frontend)

To measure map render speed:

- Use a stopwatch or screen recording to measure the time from app launch to map fully loaded (all markers visible).
- Repeat 3 times and average the results.
- Optionally, use React Native performance tools or the Expo profiler.

---

## 3. Reporting Template

| Test                | Avg Time (ms) | Notes                        |
|---------------------|---------------|------------------------------|
| `/api/spots`        |               |                              |
| `/api/spots/top`    |               |                              |
| `/api/spots/:id`    |               |                              |
| Map Render (client) |               |                              |

- Add any observations about slow endpoints or UI bottlenecks.
- Note device/network conditions for context.

---

## 4. Improving Performance

- Use indexes in MongoDB for geospatial and text queries.
- Optimize image sizes (Cloudinary already helps).
- Minimize number of markers on map for large datasets.
- Use pagination or lazy loading for large lists.

---

**Fill out this file with your results before submission!** 