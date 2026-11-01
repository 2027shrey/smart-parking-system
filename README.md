# ParkIQ — Autonomous Smart Parking System & IoT Telemetry Hub

**ParkIQ** is a modern, responsive, high-fidelity web application for managing smart multi-floor parking infrastructure with real-time IoT sensor telemetry, automated ANPR (Automatic Number Plate Recognition) gates, digital pass generation, indoor pedestrian wayfinding, and transparent Indian Rupee (₹) pricing.

---

## 🌟 Key Features

### 1. 🅿️ Interactive Multi-Floor Grid Map (Light Theme)
- **Clean Light Aesthetic**: High-contrast white and slate styling with crisp stall boundaries and clear status indicators.
- **3 Dynamic Floors / Levels**:
  - **Level 1 (Ground)**: Express Stalls (₹50/h), VIP Stalls (₹120/h) & 350kW Ultra-Fast EV Superchargers (₹80/h).
  - **Level 2 (Mezzanine)**: Standard Daily stalls (₹45/h), EV Chargers (₹75/h), and Compact / Two-Wheelers (₹30/h).
  - **Level 3 (Rooftop)**: Long-Term Shaded Parking under Solar Canopy (₹40/h, Compact ₹25/h).
- **76 Monitored Stalls**: Real-time ultrasonic sensor indicators (🟢 Free, 🔴 Occupied, 🟡 Reserved, ⚡ EV Active).
- **Direct Stall Interaction**: Click any stall to inspect telemetry (sensor latency, distance to elevator, parked car plate, active duration, hourly rate in ₹) or immediately book/release it.
- **Filter Chips**: Instant filtering by status (*All, Free, EV Superchargers, Accessible PRM, VIP*).

### 2. ⚡ Real-Time Traffic & ANPR Simulation Engine
- **Automated Mode**: Toggle `Sim Active` in the top bar to simulate realistic car arrivals and departures every 3.5 seconds.
- **Manual Triggers**:
  - `+ Car In`: Triggers Gate 1 ANPR camera scan, assigns optimal stall, opens the boom barrier, and plays sound effects.
  - `- Car Out`: Vacates a random stall, calculates billing fee in ₹ Rupees, updates gate 2 status, and accumulates daily revenue.
  - `⚡ Rush Hour Surge`: Rapid influx simulation filling 60% of open stalls with dynamic pricing adjustments.
  - `🔄 Reset Lot`: Re-initializes the parking lot to default distribution.

### 3. 🔍 "Find My Car" Indoor Wayfinding
- Enter any vehicle license plate (or click test chips like `MH 02 CK 9021`, `DL 1C AB 4421`, `KA 05 MN 8820`).
- Instantly identifies the exact floor, zone, and stall.
- Provides **turn-by-turn pedestrian directions** from central elevator lobby to the car with estimated walking distance.
- Displays running bill in **₹ Rupees** and lets the driver pay via UPI / Card and validate exit directly.

### 4. 🎟️ Smart Reservation & Digital Pass Generation
- Step-by-step reservation workflow: vehicle details, arrival time, duration slider (1h - 12h), and smart auto-assign or manual stall selection.
- Premium add-ons in **₹ Rupees**:
  - ⚡ 350kW Fast Charging (+₹150)
  - 🧼 Eco Foam Wash (+₹250)
  - 🛡️ Prime Spot Guarantee (+₹50)
- Generates a **High-Tech Digital Parking Pass** with:
  - Canvas-rendered 2D QR Code.
  - Gate Access PIN code (`*7291#`).
  - Barcode ID & expiry countdown.
  - One-click print / mobile pass layout.

### 5. 📊 Operational Telemetry & Analytics Dashboard
- Interactive 24-hour occupancy curve (SVG spline chart).
- Subsystem health monitor (Ultrasonic Zigbee mesh, 4K 60fps ANPR OCR engine, EV power grid load, basement ventilation).
- Live real-time event audit stream logging every gate trigger and transaction in ₹ Rupees.

### 6. 🔊 Synthesized Audio Experience & Theme Toggle
- Clean modern UI chimes and elevator beeps synthesized directly via Web Audio API (zero audio files needed).
- Quick Mute/Unmute audio button and **Light/Dark theme toggle** in the top navbar.

---

## 🚀 Quick Start Guide

### Server is currently running:
👉 **[http://localhost:8080](http://localhost:8080)**

Or open [`index.html`](file:///Users/shrey/.gemini/antigravity/scratch/smart-parking-system/index.html) directly in any browser.

---

## 📁 Project Structure

```text
smart-parking-system/
├── index.html       # Single-page application markup with Light theme & Rupee pricing
├── style.css        # Pavement striping, status indicators, radar beacons, print styling
├── app.js           # State engine, ₹ rates, simulation loop, Web Audio synthesizer, QR generator
├── server.py        # Lightweight local HTTP server with automatic port recovery
└── README.md        # Documentation and feature guide
```
