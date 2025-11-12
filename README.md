# Distributed Services Hub - Dashboard UI

**React + Vite Dashboard** for the Distributed Services Hub microservices architecture.

## Overview

This is a modern React dashboard that provides a multi-tab interface for interacting with 5 microservices, demonstrating advanced Java networking concepts through a visual UI.

## Features

### 🎯 Five Interactive Tabs

1. **Service Registry** - Real-time service status monitoring
   - Shows all connected services
   - Live heartbeat monitoring
   - Service metadata display
   - Demonstrates: Multithreading, ConcurrentHashMap, Service Discovery

2. **API Gateway** - External API integration
   - Fetch weather data via HttpURLConnection
   - No third-party HTTP libraries
   - Demonstrates: HttpURLConnection, HTTP GET requests, JSON parsing

3. **Security Test** - SSL/TLS verification
   - Automated security tests
   - Validates SSLServerSocket enforcement
   - Shows insecure vs secure connection attempts
   - Demonstrates: JSSE, SSLServerSocket, SSLSocket, TLS handshake

4. **NIO Log Stream** - Real-time log monitoring
   - Live log streaming from all services
   - Non-blocking I/O demonstration
   - Download and clear log functionality
   - Demonstrates: Java NIO, ServerSocketChannel, Selector, ByteBuffer

5. **RMI Task Runner** - Remote method execution
   - Execute computational tasks remotely
   - Multiple task options (Pi calculation, Fibonacci, Prime check, etc.)
   - Demonstrates: Java RMI, Remote interfaces, RMI Registry, Object serialization

## Architecture

```
┌─────────────────────────────────────────┐
│     React Dashboard (This App)          │
│  ┌──────┬──────┬──────┬──────┬──────┐  │
│  │ Tab1 │ Tab2 │ Tab3 │ Tab4 │ Tab5 │  │
│  └──────┴──────┴──────┴──────┴──────┘  │
└──────────────────┬──────────────────────┘
                   │ WebSocket
                   ▼
┌─────────────────────────────────────────┐
│        Hub Server (Message Broker)       │
│         Port 7070/7071 (WebSocket)       │
└──────────────────┬──────────────────────┘
                   │ TCP Connections
         ┌─────────┼─────────┬────────┐
         ▼         ▼         ▼        ▼
    API Gateway  JSSE     NIO Log   RMI Task
    (Port 9001)  (9090)   (9091)    (1099)
```

## Tech Stack

- **React 18** - UI framework
- **Vite** - Build tool and dev server
- **Lucide React** - Icons
- **WebSocket** - Real-time communication with Hub
- **Tailwind CSS** - Styling (utility-first)

## Installation & Running

### Prerequisites
- Node.js 16+ and npm

### Install Dependencies
```bash
npm install
```

### Development Mode
```bash
npm run dev
```
Opens at: http://localhost:5173

### Production Build
```bash
npm run build
npm run preview
```

## Usage

1. **Start the Hub Server** first (on port 7071)
2. **Start all microservices** (API Gateway, Secure File, NIO Log, RMI Task)
3. **Open the dashboard** in your browser
4. Dashboard will automatically connect to Hub via WebSocket
5. Navigate through tabs to interact with each service

## Project Structure

```
src/
├── components/
│   ├── tabs/
│   │   ├── ServiceRegistryTab.jsx    # Tab 1: Service monitoring
│   │   ├── ApiGatewayTab.jsx         # Tab 2: HTTP API calls
│   │   ├── SecurityTestTab.jsx       # Tab 3: SSL testing
│   │   ├── NioLogStreamTab.jsx       # Tab 4: Log streaming
│   │   └── RmiTaskRunnerTab.jsx      # Tab 5: Remote tasks
│   ├── MultiTabDashboard.jsx         # Main tab container
│   └── ServiceDashboard.jsx          # Entry wrapper
├── App.jsx                            # App root
└── main.jsx                           # Entry point
```

## WebSocket Communication

The dashboard communicates with the Hub Server using WebSocket:

### Sent Messages (Dashboard → Hub)
```json
{
  "command_for": "SERVICE_NAME",
  "payload": "command-data"
}
```

### Received Messages (Hub → Dashboard)
```json
{
  "type": "SERVICE_REGISTRY_UPDATE",
  "payload": {
    "services": [...]
  }
}

{
  "type": "SERVICE_RESULT",
  "result_from": "SERVICE_NAME",
  "data": "result-data"
}
```

## Phase Implementation

✅ **Phase 1:** Hub Server (Member 1)  
✅ **Phase 2:** React Dashboard (Member 2 - Part A)  
✅ **Phase 3:** API Gateway Integration (Member 2 - Part B)  
✅ **Phase 4:** Secure File Service Integration (Member 3)  
✅ **Phase 5:** NIO Log Service Integration (Member 4)  
✅ **Phase 6:** RMI Task Service Integration (Member 5)  

**Status:** All phases complete! 🎉

## Development Notes

- The dashboard auto-reconnects if Hub connection is lost (max 6 attempts)
- Heartbeat sent every 25 seconds to keep connection alive
- Service results are broadcast via custom events for tab isolation
- All tabs are independent and can be viewed in any order

## Contributing

This is part of a Network Programming course project demonstrating:
- Microservices architecture
- Message broker pattern
- Real-time communication
- Service discovery and monitoring
- Advanced Java networking concepts

---

**Team:** Network Programming L3S1  
**Date:** November 12, 2025  
**Status:** Production Ready ✓
```
