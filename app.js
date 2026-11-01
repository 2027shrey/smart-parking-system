/**
 * ParkIQ Smart Parking System - Core Application Logic
 * Level: Single Ground Level (30 Stalls: Zone A & Zone B)
 * Currency: Indian Rupees (₹)
 * Theme: Light Background (with optional Dark toggle)
 * Features:
 * - Single-Floor 30-Stall IoT management
 * - Automated ANPR & sensor telemetry simulation
 * - Web Audio API sound synthesizer
 * - Indoor wayfinding & "Find My Car" locator
 * - Instant Digital Pass & QR Canvas Generator
 * - Real-time Analytics & Event Stream
 */

// Initial Seed Data for Parking Stalls
const STALLS_DATA = [];

// Sample Car Pool for realistic simulation (Indian & Global Popular Models)
const SAMPLE_CARS = [
  { model: "Tata Nexon EV", color: "Glacier White", isEV: true },
  { model: "Mahindra XUV400 EV", color: "Napoli Black", isEV: true },
  { model: "MG ZS EV", color: "Starry Black", isEV: true },
  { model: "Hyundai Ioniq 5", color: "Gravity Gold", isEV: true },
  { model: "BYD Atto 3", color: "Boulder Grey", isEV: true },
  { model: "BMW i4", color: "Mineral White", isEV: true },
  { model: "Hyundai Creta", color: "Titan Grey", isEV: false },
  { model: "Kia Seltos", color: "Aurora Black", isEV: false },
  { model: "Mahindra XUV700", color: "Electric Blue", isEV: false },
  { model: "Toyota Fortuner", color: "Super White", isEV: false },
  { model: "Tata Harrier", color: "Daytona Grey", isEV: false },
  { model: "Maruti Grand Vitara", color: "Splendid Silver", isEV: false },
  { model: "Honda City", color: "Platinum White", isEV: false },
  { model: "Volkswagen Taigun", color: "Curcuma Yellow", isEV: false }
];

const SAMPLE_PLATES = [
  "MH 02 CK 9021", "DL 1C AB 4421", "KA 05 MN 8820", "HR 26 DQ 7122",
  "UP 16 BF 3310", "TS 09 EA 5519", "WB 06 H 2914", "TN 07 BL 6019",
  "GJ 01 KP 8045", "KL 07 CD 2291", "RJ 14 QB 5540", "MP 09 VZ 1208",
  "CH 01 AX 9920", "AP 09 TR 4118", "GA 03 J 7821"
];

// Initialize Stalls for Single Ground Level (30 Stalls: Zone A & Zone B)
function initStallsData() {
  STALLS_DATA.length = 0;

  // Zone A: 15 Stalls (A-01 to A-15)
  // A01-A04: EV Superchargers (₹80/h), A05-A07: Accessible (₹40/h), A08-A11: VIP (₹120/h), A12-A15: Express (₹50/h)
  for (let i = 1; i <= 15; i++) {
    const numStr = i < 10 ? `0${i}` : `${i}`;
    const id = `A-${numStr}`;
    let type = "standard";
    let rate = 50;

    if (i <= 4) {
      type = "ev";
      rate = 80;
    } else if (i <= 7) {
      type = "accessible";
      rate = 40;
    } else if (i <= 11) {
      type = "vip";
      rate = 120;
    }

    const isOccupied = i % 3 !== 0;
    let vehicle = null;
    if (isOccupied) {
      const car = SAMPLE_CARS[(i * 3) % SAMPLE_CARS.length];
      vehicle = {
        plate: SAMPLE_PLATES[(i * 2) % SAMPLE_PLATES.length],
        model: car.model,
        color: car.color,
        isEVCharging: type === "ev",
        batteryPct: type === "ev" ? Math.floor(40 + Math.random() * 55) : null,
        entryTime: `${16 + Math.floor(i / 10)}:${(i * 7) % 60 < 10 ? '0' : ''}${(i * 7) % 60}`,
        durationHours: 1.5 + (i % 3)
      };
    }

    STALLS_DATA.push({
      id,
      floor: 1,
      zone: "A",
      number: i,
      type,
      status: isOccupied ? (type === "ev" ? "ev-active" : "occupied") : "available",
      rate,
      sensorLatency: Math.floor(9 + Math.random() * 6),
      distanceToElevator: `${8 + (i * 2)}m`,
      column: `Col A-${Math.ceil(i / 3)}`,
      vehicle
    });
  }

  // Zone B: 15 Stalls (B-01 to B-15)
  // B01-B04: Compact / Two-Wheelers (₹30/h), B05-B15: Standard Daily (₹50/h)
  for (let i = 1; i <= 15; i++) {
    const numStr = i < 10 ? `0${i}` : `${i}`;
    const id = `B-${numStr}`;
    let type = "standard";
    let rate = 50;

    if (i <= 4) {
      type = "compact";
      rate = 30;
    }

    const isOccupied = (i + 1) % 4 !== 0;
    let vehicle = null;
    if (isOccupied) {
      const car = SAMPLE_CARS[(i * 2 + 1) % SAMPLE_CARS.length];
      vehicle = {
        plate: `DL 01 AB ${(i * 41 + 1000) % 9999}`,
        model: car.model,
        color: car.color,
        isEVCharging: false,
        batteryPct: null,
        entryTime: `17:${(i * 9) % 60 < 10 ? '0' : ''}${(i * 9) % 60}`,
        durationHours: 2
      };
    }

    STALLS_DATA.push({
      id,
      floor: 1,
      zone: "B",
      number: i + 15,
      type,
      status: isOccupied ? "occupied" : "available",
      rate,
      sensorLatency: Math.floor(10 + Math.random() * 5),
      distanceToElevator: `${12 + (i * 2)}m`,
      column: `Col B-${Math.ceil(i / 3)}`,
      vehicle
    });
  }
}

// Global Application State (Single Ground Level & Indian Rupees ₹)
const state = {
  currentFloor: 1,
  activeFilter: "all",
  simulationRunning: false,
  simulationTimer: null,
  soundEnabled: true,
  isDarkTheme: false,
  highlightedSpotId: null,
  revenueToday: 18450.00,
  activityLog: [],
  selectedSpotForModal: null,
  activeNavigationSpot: null
};

// Theme Toggle Function
function toggleTheme() {
  state.isDarkTheme = !state.isDarkTheme;
  const html = document.documentElement;
  const icon = document.getElementById('themeIcon');
  if (state.isDarkTheme) {
    html.classList.remove('light');
    html.classList.add('dark');
    if (icon) icon.textContent = '🌙';
    showToast('Theme Changed', 'Dark theme enabled', '🌙');
  } else {
    html.classList.remove('dark');
    html.classList.add('light');
    if (icon) icon.textContent = '☀️';
    showToast('Theme Changed', 'Light theme enabled', '☀️');
  }
  renderParkingGrid();
}

// Web Audio API Synthesizer (Zero external audio files required)
let audioCtx = null;

function getAudioContext() {
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

function playSound(type) {
  if (!state.soundEnabled) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    if (type === 'entry') {
      // Pleasant dual chime (C5 -> E5)
      osc.type = 'sine';
      osc.frequency.setValueAtTime(523.25, now);
      osc.frequency.exponentialRampToValueAtTime(659.25, now + 0.15);
      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
      osc.start(now);
      osc.stop(now + 0.35);
    } else if (type === 'exit') {
      // Departure chime (E5 -> C5)
      osc.type = 'sine';
      osc.frequency.setValueAtTime(659.25, now);
      osc.frequency.exponentialRampToValueAtTime(440.00, now + 0.18);
      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
      osc.start(now);
      osc.stop(now + 0.35);
    } else if (type === 'book') {
      // Harmonic chord confirmation
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.2);
      gain.gain.setValueAtTime(0.1, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
      osc.start(now);
      osc.stop(now + 0.4);
    } else if (type === 'click') {
      // Subtle click
      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, now);
      gain.gain.setValueAtTime(0.03, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.05);
      osc.start(now);
      osc.stop(now + 0.05);
    }
  } catch (e) {
    console.warn("Audio synth error:", e);
  }
}

function toggleAudio() {
  state.soundEnabled = !state.soundEnabled;
  const icon = document.getElementById('soundIcon');
  if (icon) {
    icon.textContent = state.soundEnabled ? '🔊' : '🔇';
  }
  showToast('Audio Settings', state.soundEnabled ? 'Sound FX Enabled' : 'Sound FX Muted', '🔊');
}

// Main Tab Navigation
function switchMainTab(tabId) {
  playSound('click');
  
  // Hide all tabs
  document.querySelectorAll('.main-tab-content').forEach(el => {
    el.classList.add('hidden');
  });

  // Deactivate desktop tab buttons
  document.querySelectorAll('.nav-tab-btn').forEach(btn => {
    btn.classList.remove('active', 'text-cyan-800', 'bg-white', 'shadow-sm', 'border', 'border-slate-200');
    btn.classList.add('text-slate-600');
  });

  // Deactivate mobile tab buttons
  document.querySelectorAll('.mobile-tab-btn').forEach(btn => {
    btn.classList.remove('text-cyan-700', 'font-bold');
    btn.classList.add('text-slate-600');
  });

  // Show target tab
  const target = document.getElementById(`tab-${tabId}`);
  if (target) {
    target.classList.remove('hidden');
  }

  // Activate matching buttons
  const activeBtn = document.getElementById(`tabBtn-${tabId}`);
  if (activeBtn) {
    activeBtn.classList.add('active', 'text-cyan-800', 'bg-white', 'shadow-sm', 'border', 'border-slate-200');
    activeBtn.classList.remove('text-slate-600');
  }

  const mobileBtn = document.querySelector(`.mobile-tab-btn[data-tab="${tabId}"]`);
  if (mobileBtn) {
    mobileBtn.classList.add('text-cyan-700', 'font-bold');
    mobileBtn.classList.remove('text-slate-600');
  }

  if (tabId === 'parking-lot') {
    renderParkingGrid();
  } else if (tabId === 'find-car') {
    populateQuickPlates();
  } else if (tabId === 'reserve') {
    populateManualBayOptions();
    updateReservationSummary();
  } else if (tabId === 'dashboard') {
    renderActivityLog();
  }
}

// Floor Navigation (Single Level No-Op)
function switchFloor(floorNum) {
  state.currentFloor = 1;
  renderParkingGrid();
}

// Spot Filter (All, Free, EV, Accessible, VIP)
function setSpotFilter(filter) {
  playSound('click');
  state.activeFilter = filter;

  document.querySelectorAll('.filter-chip').forEach(btn => {
    btn.classList.remove('active', 'bg-cyan-50', 'text-cyan-800', 'border-cyan-300', 'font-bold');
    btn.classList.add('bg-slate-100', 'text-slate-600', 'border-slate-200');
  });

  const activeChip = document.getElementById(`filterBtn-${filter}`);
  if (activeChip) {
    activeChip.classList.add('active', 'bg-cyan-50', 'text-cyan-800', 'border-cyan-300', 'font-bold');
    activeChip.classList.remove('bg-slate-100', 'text-slate-600', 'border-slate-200');
  }

  renderParkingGrid();
}

// Render the 2D Interactive Parking Grid for Single Ground Floor
function renderParkingGrid() {
  const row1El = document.getElementById('gridRow1');
  const row2El = document.getElementById('gridRow2');
  if (!row1El || !row2El) return;

  const zone1Stalls = STALLS_DATA.filter(s => s.zone === "A");
  const zone2Stalls = STALLS_DATA.filter(s => s.zone === "B");

  const z1Label = document.getElementById('zone1Label');
  const z2Label = document.getElementById('zone2Label');
  if (z1Label && z2Label) {
    z1Label.textContent = `ZONE A (Stalls 01 - 15)`;
    z2Label.textContent = `ZONE B (Stalls 01 - 15)`;
  }

  row1El.innerHTML = zone1Stalls.map(s => renderStallCard(s)).join('');
  row2El.innerHTML = zone2Stalls.map(s => renderStallCard(s)).join('');

  updateKpiMetrics();
}

// Generate Individual Stall Card HTML (Rupees ₹ & Light Contrast)
function renderStallCard(stall) {
  let visible = true;
  if (state.activeFilter === 'available' && stall.status !== 'available') visible = false;
  if (state.activeFilter === 'ev' && stall.type !== 'ev') visible = false;
  if (state.activeFilter === 'accessible' && stall.type !== 'accessible') visible = false;
  if (state.activeFilter === 'vip' && stall.type !== 'vip') visible = false;

  const isHighlighted = state.highlightedSpotId === stall.id;

  // Status Styling
  let statusClass = `status-${stall.status}`;
  let statusDot = '<span class="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>';

  if (stall.status === 'occupied') {
    statusDot = '<span class="w-2.5 h-2.5 rounded-full bg-rose-500"></span>';
  } else if (stall.status === 'reserved') {
    statusDot = '<span class="w-2.5 h-2.5 rounded-full bg-amber-500"></span>';
  } else if (stall.status === 'ev-active') {
    statusDot = '<span class="w-2.5 h-2.5 rounded-full bg-cyan-500 animate-ping"></span>';
  }

  // Type Badges
  let typeIcon = "🚗";
  let typeLabel = "Standard";
  if (stall.type === 'ev') {
    typeIcon = "⚡";
    typeLabel = "EV Supercharger";
  } else if (stall.type === 'accessible') {
    typeIcon = "♿";
    typeLabel = "Accessible";
  } else if (stall.type === 'vip') {
    typeIcon = "⭐";
    typeLabel = "VIP Express";
  } else if (stall.type === 'compact') {
    typeIcon = "🏍️";
    typeLabel = "Compact / Moto";
  }

  return `
    <div id="stall-${stall.id}" onclick="openSpotDetailsModal('${stall.id}')" 
         class="parking-stall ${statusClass} ${isHighlighted ? 'stall-highlighted' : ''} ${visible ? '' : 'opacity-25 pointer-events-none'}" 
         data-stall-id="${stall.id}">
      
      <!-- Stall Header -->
      <div class="flex items-center justify-between">
        <div class="flex items-center space-x-1.5">
          <span class="font-mono font-black text-sm tracking-wider text-slate-900">${stall.id}</span>
          <span class="text-xs" title="${typeLabel}">${typeIcon}</span>
        </div>
        <div class="flex items-center space-x-1">
          ${statusDot}
        </div>
      </div>

      <!-- Stall Center Visual (Car or Open Stall) -->
      <div class="my-1.5 flex flex-col items-center justify-center min-h-[46px]">
        ${stall.vehicle ? `
          <div class="flex flex-col items-center text-center">
            <span class="text-2xl filter drop-shadow-sm">🚗</span>
            <span class="font-mono text-[10px] font-bold text-slate-800 uppercase bg-slate-100 px-2 py-0.5 rounded border border-slate-300 mt-1 truncate max-w-[95px] shadow-sm">
              ${stall.vehicle.plate}
            </span>
          </div>
        ` : `
          <div class="flex flex-col items-center text-emerald-700">
            <span class="text-xs font-mono font-black tracking-widest uppercase">FREE</span>
            <span class="text-[10px] font-mono font-bold text-slate-600">₹${stall.rate}/h</span>
          </div>
        `}
      </div>

      <!-- Stall Footer: EV battery status or distance -->
      <div class="flex items-center justify-between text-[9px] font-mono text-slate-500 pt-1 border-t border-slate-200">
        <span class="truncate font-semibold">${stall.column}</span>
        ${stall.vehicle && stall.vehicle.isEVCharging ? `
          <span class="text-cyan-700 font-bold flex items-center">
            ⚡ ${stall.vehicle.batteryPct || 75}%
          </span>
        ` : `
          <span class="font-medium">${stall.distanceToElevator}</span>
        `}
      </div>

    </div>
  `;
}

// Update Top KPI Counters in Indian Rupees (₹)
function updateKpiMetrics() {
  const total = STALLS_DATA.length;
  const available = STALLS_DATA.filter(s => s.status === 'available').length;
  const occupied = STALLS_DATA.filter(s => s.status === 'occupied' || s.status === 'ev-active').length;
  const evCharging = STALLS_DATA.filter(s => s.status === 'ev-active' || (s.type === 'ev' && s.status === 'occupied')).length;

  const availPct = Math.round((available / total) * 100);
  const occPct = Math.round((occupied / total) * 100);

  const statAvailEl = document.getElementById('statAvailableSpots');
  const statAvailPctEl = document.getElementById('statAvailablePct');
  const statAvailBarEl = document.getElementById('statAvailableBar');

  if (statAvailEl) statAvailEl.textContent = available;
  if (statAvailPctEl) statAvailPctEl.textContent = `${availPct}%`;
  if (statAvailBarEl) statAvailBarEl.style.width = `${availPct}%`;

  const statOccEl = document.getElementById('statOccupiedSpots');
  const statOccPctEl = document.getElementById('statOccupiedPct');
  const statOccBarEl = document.getElementById('statOccupiedBar');

  if (statOccEl) statOccEl.textContent = occupied;
  if (statOccPctEl) statOccPctEl.textContent = `${occPct}%`;
  if (statOccBarEl) statOccBarEl.style.width = `${occPct}%`;

  const statEVEl = document.getElementById('statEVCount');
  if (statEVEl) statEVEl.textContent = `${evCharging} / 4 Stalls`;

  const statRateEl = document.getElementById('statCurrentRate');
  if (statRateEl) statRateEl.textContent = `₹50/hr`;
}

// Modal: Open Details for Clicked Stall (Rupees ₹)
function openSpotDetailsModal(stallId) {
  playSound('click');
  const stall = STALLS_DATA.find(s => s.id === stallId);
  if (!stall) return;

  state.selectedSpotForModal = stall;

  const modal = document.getElementById('spotDetailsModal');
  const badge = document.getElementById('modalSpotBadge');
  const typeEl = document.getElementById('modalSpotType');
  const titleEl = document.getElementById('modalSpotTitle');
  const locEl = document.getElementById('modalSpotLocation');
  const statusEl = document.getElementById('modalSpotStatus');
  const rateEl = document.getElementById('modalSpotRate');
  const latencyEl = document.getElementById('modalSpotLatency');
  const vehRow = document.getElementById('modalVehicleInfoRow');
  const vehPlate = document.getElementById('modalVehiclePlate');
  const durRow = document.getElementById('modalDurationRow');
  const actionsEl = document.getElementById('modalActions');

  if (titleEl) titleEl.textContent = `Stall ${stall.id}`;
  if (locEl) locEl.textContent = `Ground Floor • Zone ${stall.zone} • ${stall.distanceToElevator} from Main Lobby`;
  if (rateEl) rateEl.textContent = `₹${stall.rate} / hour`;
  if (latencyEl) latencyEl.textContent = `${stall.distanceToElevator} from Main Entrance`;

  if (badge) {
    badge.textContent = stall.id;
    if (stall.status === 'available') {
      badge.className = "w-14 h-14 rounded-2xl flex items-center justify-center text-xl font-black font-mono bg-emerald-100 text-emerald-800 border border-emerald-300";
    } else if (stall.status === 'ev-active') {
      badge.className = "w-14 h-14 rounded-2xl flex items-center justify-center text-xl font-black font-mono bg-cyan-100 text-cyan-800 border border-cyan-300";
    } else {
      badge.className = "w-14 h-14 rounded-2xl flex items-center justify-center text-xl font-black font-mono bg-rose-100 text-rose-800 border border-rose-300";
    }
  }

  if (typeEl) {
    typeEl.textContent = stall.type === 'ev' ? '⚡ EV Supercharger (350kW)' :
                         stall.type === 'vip' ? '⭐ VIP Executive Stall' :
                         stall.type === 'accessible' ? '♿ PRM Accessible' : 'Standard Stall';
  }

  if (statusEl) {
    statusEl.textContent = stall.status.toUpperCase();
    statusEl.className = stall.status === 'available' ? 'text-emerald-700 font-mono font-bold' :
                         stall.status === 'ev-active' ? 'text-cyan-800 font-mono font-bold' : 'text-rose-700 font-mono font-bold';
  }

  if (stall.vehicle) {
    if (vehRow) vehRow.classList.remove('hidden');
    if (vehPlate) vehPlate.textContent = `${stall.vehicle.plate} (${stall.vehicle.model})`;
    if (durRow) durRow.classList.remove('hidden');
  } else {
    if (vehRow) vehRow.classList.add('hidden');
    if (durRow) durRow.classList.add('hidden');
  }

  // Set Driver-Centric Action Buttons
  if (actionsEl) {
    if (stall.status === 'available') {
      actionsEl.innerHTML = `
        <button onclick="bookSpecificSpot('${stall.id}')" class="flex-1 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs shadow-md shadow-cyan-600/20 transition">
          Reserve This Stall (₹${stall.rate}/h) 🎟️
        </button>
        <button onclick="startNavigationToSpot('${stall.id}')" class="px-3.5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold border border-slate-300">
          Directions 🧭
        </button>
      `;
    } else {
      actionsEl.innerHTML = `
        <button onclick="autoSelectBestFreeSpot()" class="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-600/20 transition">
          Find Next Available Spot 🎯
        </button>
        <button onclick="quickSelectPlate('${stall.vehicle ? stall.vehicle.plate : ""}')" class="px-3.5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold border border-slate-300">
          Is this your car? Pay 💳
        </button>
      `;
    }
  }

  if (modal) {
    modal.classList.remove('hidden');
    modal.classList.add('flex');
  }
}

function closeSpotModal() {
  playSound('click');
  const modal = document.getElementById('spotDetailsModal');
  if (modal) {
    modal.classList.add('hidden');
    modal.classList.remove('flex');
  }
}

// Action: Release an Occupied Spot (Rupees)
function releaseSpot(stallId) {
  const stall = STALLS_DATA.find(s => s.id === stallId);
  if (!stall || stall.status === 'available') return;

  const plate = stall.vehicle ? stall.vehicle.plate : "Vehicle";
  const fee = Math.round(stall.rate * 1.5);

  stall.status = 'available';
  stall.vehicle = null;
  state.revenueToday += fee;

  closeSpotModal();
  playSound('exit');
  renderParkingGrid();

  logActivity(`Gate 2 Exit: ${plate} left Stall ${stallId}. Paid ₹${fee}.`);
  showToast('Vehicle Exit Validated', `${plate} vacated stall ${stallId}. Paid ₹${fee}`, '🚪');

  const gate2 = document.getElementById('gate2Status');
  if (gate2) {
    gate2.innerHTML = '<span class="text-emerald-700 animate-pulse font-bold">BARRIER OPEN ⬆</span>';
    setTimeout(() => {
      gate2.textContent = 'ACTIVE';
    }, 2500);
  }
}

// Action: Park a car in a specific stall
function simulateCarEntrySpecific(stallId) {
  const stall = STALLS_DATA.find(s => s.id === stallId);
  if (!stall || stall.status !== 'available') return;

  const randomCar = SAMPLE_CARS[Math.floor(Math.random() * SAMPLE_CARS.length)];
  const randomPlate = SAMPLE_PLATES[Math.floor(Math.random() * SAMPLE_PLATES.length)];

  stall.status = stall.type === 'ev' ? 'ev-active' : 'occupied';
  stall.vehicle = {
    plate: randomPlate,
    model: randomCar.model,
    color: randomCar.color,
    isEVCharging: stall.type === 'ev',
    batteryPct: stall.type === 'ev' ? 52 : null,
    entryTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    durationHours: 2
  };

  closeSpotModal();
  playSound('entry');
  renderParkingGrid();

  logActivity(`Gate 1 ANPR: ${randomPlate} assigned to Stall ${stallId}.`);
  showToast('Vehicle Parked', `${randomPlate} (${randomCar.model}) entered stall ${stallId}`, '🚗');

  const gate1 = document.getElementById('gate1Status');
  if (gate1) {
    gate1.innerHTML = '<span class="text-cyan-700 animate-pulse font-bold">BARRIER OPEN ⬆</span>';
    setTimeout(() => {
      gate1.innerHTML = '<span class="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1 animate-pulse"></span> READY';
    }, 2500);
  }
}

// Start Wayfinding Navigation to a specific stall (Single Level)
function startNavigationToSpot(stallId) {
  closeSpotModal();
  state.highlightedSpotId = stallId;
  const stall = STALLS_DATA.find(s => s.id === stallId);
  if (!stall) return;

  renderParkingGrid();

  // Display navigation banner
  const banner = document.getElementById('navigationBanner');
  const plateText = document.getElementById('navBannerPlate');
  const directionsText = document.getElementById('navBannerDirections');

  if (banner && plateText && directionsText) {
    plateText.textContent = `Wayfinding to Stall ${stall.id} (Zone ${stall.zone})`;
    directionsText.textContent = `Enter through Main Gate -> Follow marked Lane ${stall.zone === 'A' ? '1' : '2'} walkway -> Walk ${stall.distanceToElevator} to Stall ${stall.id}.`;
    banner.classList.remove('hidden');
    banner.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  playSound('click');
}

function dismissNavigation() {
  state.highlightedSpotId = null;
  const banner = document.getElementById('navigationBanner');
  if (banner) banner.classList.add('hidden');
  renderParkingGrid();
}

// Auto-Find and Highlight the Best Available Spot for Driver
function autoSelectBestFreeSpot() {
  playSound('click');
  closeSpotModal();
  switchMainTab('parking-lot');

  const availableStalls = STALLS_DATA.filter(s => s.status === 'available');
  if (availableStalls.length === 0) {
    showToast('Parking Lot Full', 'All stalls are currently occupied. Please wait for the next departure.', '⚠️');
    return;
  }

  // Sort by walking distance (e.g. "12m", "18m", etc.)
  const bestStall = [...availableStalls].sort((a, b) => {
    const distA = parseInt(a.distanceToElevator, 10) || 999;
    const distB = parseInt(b.distanceToElevator, 10) || 999;
    return distA - distB;
  })[0];

  state.highlightedSpotId = bestStall.id;
  renderParkingGrid();

  const stallEl = document.getElementById(`stall-${bestStall.id}`);
  if (stallEl) {
    stallEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
    stallEl.classList.add('ring-4', 'ring-cyan-500');
    setTimeout(() => {
      stallEl.classList.remove('ring-4', 'ring-cyan-500');
    }, 2500);
  }

  openSpotDetailsModal(bestStall.id);
  showToast('Best Spot Assigned!', `Found Stall ${bestStall.id} (${bestStall.type.toUpperCase()}) — only ${bestStall.distanceToElevator} walk to Entrance.`, '🎯');
}

// Simulation Engine: Auto Traffic
function toggleAutoSimulation() {
  playSound('click');
  state.simulationRunning = !state.simulationRunning;

  const btn = document.getElementById('simToggleBtn');
  const led = document.getElementById('simLed');
  const label = document.getElementById('simBtnLabel');

  if (state.simulationRunning) {
    if (led) led.className = "w-2 h-2 rounded-full bg-emerald-500 animate-ping";
    if (label) label.textContent = "Sim Active";
    if (btn) btn.className = "px-2.5 py-1.5 rounded-md text-xs font-semibold flex items-center space-x-1.5 bg-emerald-50 text-emerald-800 border border-emerald-300 transition shadow-sm";

    showToast('Simulation Started', 'Real-time vehicle arrivals & departures running every 3.5s', '⚡');

    state.simulationTimer = setInterval(() => {
      if (Math.random() < 0.6) {
        triggerQuickCarEntry();
      } else {
        triggerQuickCarExit();
      }
    }, 3500);

  } else {
    if (led) led.className = "w-2 h-2 rounded-full bg-slate-400";
    if (label) label.textContent = "Sim Off";
    if (btn) btn.className = "px-2.5 py-1.5 rounded-md text-xs font-semibold flex items-center space-x-1.5 bg-white text-slate-700 border border-slate-200 shadow-sm transition";

    clearInterval(state.simulationTimer);
    showToast('Simulation Paused', 'Automated traffic simulation stopped', '⏸️');
  }
}

// Simulate a vehicle entering through Gate 1
function triggerQuickCarEntry() {
  const availableSpots = STALLS_DATA.filter(s => s.status === 'available');

  if (availableSpots.length === 0) {
    showToast('Lot Full', 'All 30 stalls are currently occupied!', '🛑');
    return;
  }

  const targetSpot = availableSpots[Math.floor(Math.random() * availableSpots.length)];
  const randomCar = SAMPLE_CARS[Math.floor(Math.random() * SAMPLE_CARS.length)];
  const randomPlate = SAMPLE_PLATES[Math.floor(Math.random() * SAMPLE_PLATES.length)];

  targetSpot.status = targetSpot.type === 'ev' ? 'ev-active' : 'occupied';
  targetSpot.vehicle = {
    plate: randomPlate,
    model: randomCar.model,
    color: randomCar.color,
    isEVCharging: targetSpot.type === 'ev',
    batteryPct: targetSpot.type === 'ev' ? 45 : null,
    entryTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    durationHours: 2.0
  };

  playSound('entry');
  renderParkingGrid();

  logActivity(`Gate 1 ANPR: ${randomPlate} (${randomCar.model}) entered -> Assigned Stall ${targetSpot.id}`);
  showToast('Vehicle Entry', `${randomPlate} parked at stall ${targetSpot.id}`, '🚗');

  const drivewayCar = document.getElementById('drivewayMovingCar');
  const movingPlate = document.getElementById('movingCarPlate');
  if (drivewayCar && movingPlate) {
    movingPlate.textContent = randomPlate;
    drivewayCar.classList.remove('hidden');
    drivewayCar.style.left = '5%';
    setTimeout(() => {
      drivewayCar.style.left = '75%';
    }, 50);
    setTimeout(() => {
      drivewayCar.classList.add('hidden');
    }, 1500);
  }
}

// Simulate a vehicle exiting through Gate 2 (Rupees)
function triggerQuickCarExit() {
  const occupiedSpots = STALLS_DATA.filter(s => s.status === 'occupied' || s.status === 'ev-active');
  if (occupiedSpots.length === 0) return;

  const targetSpot = occupiedSpots[Math.floor(Math.random() * occupiedSpots.length)];
  const plate = targetSpot.vehicle ? targetSpot.vehicle.plate : "Vehicle";
  const fee = Math.round(targetSpot.rate * 2.2);

  targetSpot.status = 'available';
  targetSpot.vehicle = null;
  state.revenueToday += fee;

  playSound('exit');
  renderParkingGrid();

  logActivity(`Gate 2 Exit: ${plate} left Stall ${targetSpot.id}. Paid ₹${fee}.`);
  showToast('Vehicle Departed', `${plate} vacated stall ${targetSpot.id}. Paid ₹${fee}`, '🚪');
}

// Rush Hour Surge
function triggerRushHour() {
  playSound('entry');
  let filledCount = 0;
  STALLS_DATA.forEach(s => {
    if (s.status === 'available' && Math.random() < 0.6) {
      const car = SAMPLE_CARS[Math.floor(Math.random() * SAMPLE_CARS.length)];
      s.status = s.type === 'ev' ? 'ev-active' : 'occupied';
      s.vehicle = {
        plate: SAMPLE_PLATES[(s.number * 3) % SAMPLE_PLATES.length],
        model: car.model,
        color: car.color,
        isEVCharging: s.type === 'ev',
        batteryPct: 60,
        entryTime: '18:50',
        durationHours: 3
      };
      filledCount++;
    }
  });

  renderParkingGrid();
  logActivity(`Rush hour surge simulated: ${filledCount} stalls filled.`);
  showToast('Rush Hour Surge', `Traffic surge filled ${filledCount} stalls. Dynamic rates updated!`, '⚡');
}

// Reset Lot
function resetLotOccupancy() {
  playSound('click');
  initStallsData();
  renderParkingGrid();
  logActivity('Lot matrix reset to baseline distribution.');
  showToast('Lot Reset', 'Parking lot reset to initial state', '🔄');
}

// Find My Car / Vehicle Search (Single Level & Rupees)
function searchCarLocation() {
  playSound('click');
  const input = document.getElementById('findCarPlateInput');
  if (!input) return;

  const query = input.value.trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
  if (!query) {
    showToast('Input Required', 'Please enter a license plate number', '⚠️');
    return;
  }

  const match = STALLS_DATA.find(s => {
    if (!s.vehicle || !s.vehicle.plate) return false;
    const cleanPlate = s.vehicle.plate.toUpperCase().replace(/[^A-Z0-9]/g, '');
    return cleanPlate.includes(query);
  });

  const resultCard = document.getElementById('findCarResultCard');
  if (!match) {
    showToast('Vehicle Not Found', `No parked car matching "${query}" was found.`, '🔍');
    if (resultCard) resultCard.classList.add('hidden');
    return;
  }

  // Populate Result Card
  state.activeNavigationSpot = match;
  if (resultCard) {
    resultCard.classList.remove('hidden');

    document.getElementById('foundPlateDisplay').textContent = match.vehicle.plate;
    document.getElementById('foundModelDisplay').textContent = `${match.vehicle.model} • ${match.vehicle.color}`;
    document.getElementById('foundSpotId').textContent = match.id;
    document.getElementById('foundFloor').textContent = 'Ground Floor';
    document.getElementById('foundZone').textContent = `Zone ${match.zone} • ${match.column}`;
    document.getElementById('foundTimeParked').textContent = `${match.vehicle.durationHours || 1.8} hours`;
    document.getElementById('foundCurrentBill').textContent = `₹${Math.round(match.rate * (match.vehicle.durationHours || 1.8))}.00`;

    const steps = document.getElementById('foundStepDirections');
    if (steps) {
      steps.innerHTML = `
        <li>Enter through the Pedestrian Gate near Main Lobby A.</li>
        <li>Follow the green pedestrian walkway along Lane 1 for <strong>${match.distanceToElevator}</strong>.</li>
        <li>Your car is parked in <strong>Stall ${match.id}</strong> (Zone ${match.zone}).</li>
      `;
    }
  }

  showToast('Car Found!', `${match.vehicle.plate} is in Stall ${match.id} (Zone ${match.zone})`, '🎯');
}

function highlightOnMapFromFind() {
  if (!state.activeNavigationSpot) return;
  switchMainTab('parking-lot');
  startNavigationToSpot(state.activeNavigationSpot.id);
}

function openPayAndExitModal() {
  if (!state.activeNavigationSpot) return;
  releaseSpot(state.activeNavigationSpot.id);
  const resultCard = document.getElementById('findCarResultCard');
  if (resultCard) resultCard.classList.add('hidden');
}

// Populate Quick Plates Chips in Find My Car Tab
function populateQuickPlates() {
  const container = document.getElementById('quickPlateChips');
  if (!container) return;

  const occupied = STALLS_DATA.filter(s => s.vehicle && s.vehicle.plate).slice(0, 5);
  container.innerHTML = occupied.map(s => `
    <button onclick="quickSelectPlate('${s.vehicle.plate}')" class="px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-cyan-800 font-mono font-bold text-[11px] border border-slate-300 shadow-sm">
      ${s.vehicle.plate}
    </button>
  `).join('');
}

function quickSelectPlate(plate) {
  const input = document.getElementById('findCarPlateInput');
  if (input) {
    input.value = plate;
    searchCarLocation();
  }
}

// Booking Tab Logic (Single Level & Rupees)
function populateManualBayOptions() {
  const select = document.getElementById('manualBaySelect');
  if (!select) return;

  const available = STALLS_DATA.filter(s => s.status === 'available');
  select.innerHTML = available.map(s => `
    <option value="${s.id}">Stall ${s.id} (Zone ${s.zone} - ₹${s.rate}/h)</option>
  `).join('');
}

function handleManualBaySelect(val) {
  const label = document.getElementById('selectedBayName');
  if (label) label.textContent = `Selected: Stall ${val}`;
  updateReservationSummary();
}

function toggleSpotPickMode(mode) {
  const label = document.getElementById('selectedBayName');
  if (label) {
    label.textContent = mode === 'auto' ? 'Currently: Auto Optimal' : 'Manual Select';
  }
  updateReservationSummary();
}

function handleDurationChange(val) {
  const disp = document.getElementById('durationValDisplay');
  if (disp) disp.textContent = val;
  updateReservationSummary();
}

function updateReservationSummary() {
  const slider = document.getElementById('resDurationSlider');
  const duration = slider ? parseInt(slider.value, 10) : 2;
  const baseRate = 50.00;
  let total = baseRate * duration;

  if (document.getElementById('addonEV')?.checked) total += 150.00;
  if (document.getElementById('addonWash')?.checked) total += 250.00;
  if (document.getElementById('addonCover')?.checked) total += 50.00;

  const totalEl = document.getElementById('reservationTotalPrice');
  if (totalEl) totalEl.textContent = `₹${total}`;
}

function openSmartBookingModal(preset) {
  switchMainTab('reserve');
  if (preset === 'day') {
    const slider = document.getElementById('resDurationSlider');
    if (slider) slider.value = 12;
    handleDurationChange(12);
  }
}

function bookSpecificSpot(stallId) {
  closeSpotModal();
  switchMainTab('reserve');
  const select = document.getElementById('manualBaySelect');
  if (select) {
    select.value = stallId;
    handleManualBaySelect(stallId);
  }
}

function handleReservationSubmit(e) {
  e.preventDefault();
  playSound('book');

  const plateInput = document.getElementById('resPlateInput');
  const plate = plateInput ? plateInput.value.trim().toUpperCase() : "MH 02 CK 9021";
  const modelInput = document.getElementById('resModelInput');
  const model = modelInput && modelInput.value.trim() ? modelInput.value.trim() : "Standard Vehicle";
  const duration = parseInt(document.getElementById('resDurationSlider')?.value || 2, 10);

  let assignedStall = null;
  const manualVal = document.getElementById('manualBaySelect')?.value;
  if (manualVal) {
    assignedStall = STALLS_DATA.find(s => s.id === manualVal && s.status === 'available');
  }
  if (!assignedStall) {
    assignedStall = STALLS_DATA.find(s => s.status === 'available');
  }

  if (!assignedStall) {
    showToast('Reservation Failed', 'No stalls currently available.', '🛑');
    return;
  }

  assignedStall.status = 'reserved';
  assignedStall.vehicle = {
    plate,
    model,
    color: "Customer Reserved",
    isEVCharging: false,
    entryTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    durationHours: duration
  };

  renderParkingGrid();
  logActivity(`Booking Confirmed: ${plate} reserved Stall ${assignedStall.id} for ${duration}h.`);

  showDigitalTicketModal(assignedStall, plate, duration);
}

// Digital Ticket & Canvas QR Generator
function showDigitalTicketModal(stall, plate, duration) {
  const passId = `#PK-${Math.floor(1000 + Math.random() * 8999)}`;
  const gatePin = `*${Math.floor(1000 + Math.random() * 8999)}#`;

  document.getElementById('ticketPassId').textContent = passId;
  document.getElementById('ticketSpotId').textContent = stall.id;
  document.getElementById('ticketFloorInfo').textContent = `Ground Floor (Zone ${stall.zone} • ${stall.distanceToElevator})`;
  document.getElementById('ticketPlate').textContent = plate;
  document.getElementById('ticketBarcodeCode').textContent = `ANPR-${plate.replace(/\s+/g, '-')}`;
  document.getElementById('ticketGatePin').textContent = gatePin;

  const validUntil = new Date(Date.now() + duration * 3600000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  document.getElementById('ticketValidUntil').textContent = validUntil;

  drawQrCodeCanvas('ticketQrCanvas', `${passId}:${stall.id}:${plate}`);

  const modal = document.getElementById('digitalTicketModal');
  if (modal) {
    modal.classList.remove('hidden');
    modal.classList.add('flex');
  }

  showToast('Digital Pass Issued', `Pass ${passId} ready for Stall ${stall.id}`, '🎟️');
}

function closeTicketModal() {
  playSound('click');
  const modal = document.getElementById('digitalTicketModal');
  if (modal) {
    modal.classList.add('hidden');
    modal.classList.remove('flex');
  }
}

function printTicket() {
  window.print();
}

// Algorithmic High-Fidelity QR Code Pattern Drawer
function drawQrCodeCanvas(canvasId, dataStr) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const width = canvas.width;
  const height = canvas.height;

  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, width, height);

  const gridSize = 21;
  const cellSize = width / gridSize;
  ctx.fillStyle = '#0f172a';

  let hash = 0;
  for (let i = 0; i < dataStr.length; i++) {
    hash = (hash << 5) - hash + dataStr.charCodeAt(i);
    hash |= 0;
  }

  function drawFinderPattern(startX, startY) {
    ctx.fillRect(startX * cellSize, startY * cellSize, 7 * cellSize, 7 * cellSize);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect((startX + 1) * cellSize, (startY + 1) * cellSize, 5 * cellSize, 5 * cellSize);
    ctx.fillStyle = '#0f172a';
    ctx.fillRect((startX + 2) * cellSize, (startY + 2) * cellSize, 3 * cellSize, 3 * cellSize);
  }

  drawFinderPattern(0, 0);
  drawFinderPattern(14, 0);
  drawFinderPattern(0, 14);

  for (let i = 8; i < 13; i++) {
    if (i % 2 === 0) {
      ctx.fillRect(6 * cellSize, i * cellSize, cellSize, cellSize);
      ctx.fillRect(i * cellSize, 6 * cellSize, cellSize, cellSize);
    }
  }

  for (let row = 0; row < gridSize; row++) {
    for (let col = 0; col < gridSize; col++) {
      if ((row < 8 && col < 8) || (row < 8 && col >= 13) || (row >= 13 && col < 8)) {
        continue;
      }
      const val = Math.sin(hash * (row + 1) + col * 17) * 10000;
      if (val - Math.floor(val) > 0.45) {
        ctx.fillRect(col * cellSize, row * cellSize, cellSize, cellSize);
      }
    }
  }
}

// Live Activity & ANPR Log
function logActivity(text) {
  const time = new Date().toLocaleTimeString();
  const entry = { time, text };
  state.activityLog.unshift(entry);
  if (state.activityLog.length > 30) state.activityLog.pop();
  renderActivityLog();
}

function renderActivityLog() {
  const container = document.getElementById('activityLogContainer');
  if (!container) return;

  if (state.activityLog.length === 0) {
    container.innerHTML = '<p class="text-slate-400 text-xs">No recent events logged.</p>';
    return;
  }

  container.innerHTML = state.activityLog.map(e => `
    <div class="flex items-start space-x-2 py-1.5 border-b border-slate-200">
      <span class="text-cyan-800 text-[10px] whitespace-nowrap font-bold">[${e.time}]</span>
      <span class="text-slate-700 text-xs font-medium">${e.text}</span>
    </div>
  `).join('');
}

function clearActivityLog() {
  state.activityLog = [];
  renderActivityLog();
}

// Toast Notifications
let toastTimeout = null;
function showToast(title, message, icon = '🚗') {
  const toast = document.getElementById('toastNotification');
  const toastTitle = document.getElementById('toastTitle');
  const toastMsg = document.getElementById('toastMessage');
  const toastIcon = document.getElementById('toastIcon');

  if (!toast) return;

  if (toastTitle) toastTitle.textContent = title;
  if (toastMsg) toastMsg.textContent = message;
  if (toastIcon) toastIcon.textContent = icon;

  toast.classList.remove('translate-y-24', 'opacity-0');
  toast.classList.add('translate-y-0', 'opacity-100');

  clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => {
    toast.classList.remove('translate-y-0', 'opacity-100');
    toast.classList.add('translate-y-24', 'opacity-0');
  }, 3200);
}

// Live Clock & Environmental Telemetry Jitter
function startTelemetryTicker() {
  setInterval(() => {
    const now = new Date();
    const clockEl = document.getElementById('liveClock');
    if (clockEl) {
      clockEl.textContent = now.toLocaleTimeString();
    }

    const latEl = document.getElementById('sensorLatency');
    if (latEl && Math.random() < 0.3) {
      latEl.textContent = `${Math.floor(10 + Math.random() * 5)}ms`;
    }
  }, 1000);
}

// Initialize Application on Page Load
window.addEventListener('DOMContentLoaded', () => {
  initStallsData();
  renderParkingGrid();
  startTelemetryTicker();

  logActivity('Facility online: 30 ultrasonic nodes active on Ground Level.');
  logActivity('ANPR Vision Engine active at Gate 1 and Gate 2.');
  logActivity('Single-Level Smart Parking Matrix operational in Autonomous Mode.');

  const dateInput = document.getElementById('resDateInput');
  if (dateInput) {
    dateInput.value = new Date().toISOString().split('T')[0];
  }
});
