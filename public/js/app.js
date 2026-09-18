/**
 * Royal Enfield Showroom - Vishwanath Enterprises
 * Main Application Logic & Interactivity
 */

document.addEventListener('DOMContentLoaded', () => {
  initLiveShowroomStatus();
  loadShowroomInfo();
  loadBikeCatalog();
  loadReviews();
  init3DControls();
  initEmiCalculator();
  initBookingForms();
  initModals();
});

// Toast Notification Helper
function showToast(message, type = 'success') {
  let container = document.getElementById('toastContainer');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toastContainer';
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `
    <div style="font-size: 1.2rem;">${type === 'success' ? '✓' : '⚠️'}</div>
    <div>
      <div style="font-weight: 600; font-size: 0.88rem; color: #fff;">${type === 'success' ? 'Success' : 'Notice'}</div>
      <div style="font-size: 0.82rem; color: #cbd5e1;">${message}</div>
    </div>
  `;

  container.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(100%)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}

// 1. Live Showroom Status (Robertsganj IST Time)
function initLiveShowroomStatus() {
  const badge = document.getElementById('liveStatusBadge');
  if (!badge) return;

  const now = new Date();
  // Get current hour in IST
  const hours = now.getHours();
  const minutes = now.getMinutes();
  const currentTimeDec = hours + minutes / 60;

  // Open 9:30 AM (9.5) to 8:00 PM (20.0) every day
  const isOpen = currentTimeDec >= 9.5 && currentTimeDec < 20.0;

  if (isOpen) {
    badge.className = 'status-badge';
    badge.innerHTML = `<span class="pulse-dot"></span> Open Today until 8:00 PM`;
  } else {
    badge.className = 'status-badge closed';
    badge.innerHTML = `<span class="pulse-dot"></span> Closed · Opens 9:30 AM`;
  }
}

// 2. Fetch Showroom Information
async function loadShowroomInfo() {
  try {
    const res = await fetch('/api/info');
    const data = await res.json();
    if (data.success) {
      if (data.announcement && data.announcement.active) {
        const bannerTitle = document.getElementById('motoverseTitle');
        const bannerSub = document.getElementById('motoverseSub');
        if (bannerTitle) bannerTitle.innerText = data.announcement.title;
        if (bannerSub) bannerSub.innerHTML = data.announcement.subtitle;
      }
    }
  } catch (err) {
    console.warn('Using default showroom static details:', err);
  }
}

// 3. Load & Render Bike Catalog
let allBikes = [];
async function loadBikeCatalog() {
  const grid = document.getElementById('bikesGrid');
  if (!grid) return;

  try {
    const res = await fetch('/api/bikes');
    const data = await res.json();
    if (data.success && data.bikes) {
      allBikes = data.bikes;
      renderBikeCards(allBikes);
      populateBikeDropdowns(allBikes);
      setupCatalogFilters();
    }
  } catch (err) {
    console.error('Error fetching bike catalog:', err);
  }
}

function renderBikeCards(bikes) {
  const grid = document.getElementById('bikesGrid');
  if (!grid) return;

  grid.innerHTML = bikes.map(bike => `
    <div class="bike-card" data-category="${bike.category}">
      <div class="bike-card-img-wrap">
        <img src="${bike.image}" alt="${bike.name}" class="bike-card-img" loading="lazy">
        <span class="bike-badge">${bike.category}</span>
      </div>
      <div class="bike-card-body">
        <h3 class="bike-card-title">${bike.name}</h3>
        <p class="bike-card-tagline">${bike.tagline}</p>

        <div class="bike-specs-mini">
          <div class="spec-mini-item">
            <span class="spec-mini-val">${bike.displacement}</span>
            <span class="spec-mini-lbl">Displacement</span>
          </div>
          <div class="spec-mini-item">
            <span class="spec-mini-val">${bike.power.split('@')[0]}</span>
            <span class="spec-mini-lbl">Power</span>
          </div>
          <div class="spec-mini-item">
            <span class="spec-mini-val">${bike.mileage}</span>
            <span class="spec-mini-lbl">Mileage</span>
          </div>
        </div>

        <div class="bike-card-price-row">
          <div class="price-box-item">
            <span class="price-label">Ex-Showroom</span>
            <span class="price-val">₹${bike.priceExShowroom.toLocaleString('en-IN')}*</span>
            <span class="price-sub">Robertsganj, UP</span>
          </div>
          <div class="price-box-item" style="text-align: right;">
            <span class="price-label">On-Road Est.</span>
            <span class="price-val" style="color: #fff; font-size: 1.15rem;">₹${bike.priceOnRoad.toLocaleString('en-IN')}</span>
          </div>
        </div>

        <div class="bike-card-actions">
          <button class="btn btn-primary btn-sm" onclick="selectBikeForTestRide('${bike.name}')">
            Book Ride
          </button>
          <button class="btn btn-secondary btn-sm" onclick="selectBikeForCalculator('${bike.id}')">
            Calculate EMI
          </button>
        </div>
      </div>
    </div>
  `).join('');
}

function populateBikeDropdowns(bikes) {
  const trSelect = document.getElementById('testRideBike');
  const srvSelect = document.getElementById('serviceBike');
  const calcSelect = document.getElementById('calcBikeSelect');

  const optionsHtml = bikes.map(b => `<option value="${b.name}" data-price="${b.priceExShowroom}">${b.name}</option>`).join('');

  if (trSelect) trSelect.innerHTML = `<option value="">-- Select Royal Enfield Model --</option>` + optionsHtml;
  if (srvSelect) srvSelect.innerHTML = `<option value="">-- Select Your Motorcycle --</option>` + optionsHtml;
  if (calcSelect) {
    calcSelect.innerHTML = bikes.map(b => `<option value="${b.id}">${b.name} (Ex: ₹${b.priceExShowroom.toLocaleString('en-IN')})</option>`).join('');
  }
}

function setupCatalogFilters() {
  const filterBtns = document.querySelectorAll('.filter-btn');
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const cat = btn.getAttribute('data-filter');

      if (cat === 'all') {
        renderBikeCards(allBikes);
      } else {
        const filtered = allBikes.filter(b => b.category.toLowerCase() === cat.toLowerCase());
        renderBikeCards(filtered);
      }
    });
  });
}

// 4. Interactive Showroom Hero Customizer & 3D Controls
function init3DControls() {
  const swatches = document.querySelectorAll('.swatch-btn');
  const shadeLabel = document.getElementById('currentShadeName');
  const tankTint = document.getElementById('tankTintLayer');
  const ambientGlow = document.getElementById('ambientGlow');
  const customPicker = document.getElementById('customColorPicker');

  function applyColorSelection(hex, name) {
    if (shadeLabel) shadeLabel.innerText = `${name} (${hex.toUpperCase()})`;

    // 1. Update Photorealistic Tank Tint & Ambient Glow
    if (tankTint) {
      if (hex === '#181818') {
        tankTint.style.setProperty('--active-tank-color', 'transparent');
        tankTint.style.opacity = '0';
      } else {
        tankTint.style.setProperty('--active-tank-color', hex);
        tankTint.style.opacity = '0.78';
      }
    }

    if (ambientGlow) {
      ambientGlow.style.setProperty('--ambient-glow-color', hex === '#181818' ? 'rgba(229, 169, 60, 0.35)' : `${hex}99`);
    }

    // 2. Update 3D Model if active
    if (window.reBike3D) {
      window.reBike3D.setColor(hex);
    }
  }

  // Predefined Swatches
  swatches.forEach(swatch => {
    swatch.addEventListener('click', () => {
      swatches.forEach(s => s.classList.remove('active'));
      swatch.classList.add('active');

      const colorHex = swatch.getAttribute('data-color');
      const name = swatch.getAttribute('data-name');
      applyColorSelection(colorHex, name);
      showToast(`Applied: ${name}`);
    });
  });

  // Custom Color Picker (for ANY user-chosen color!)
  if (customPicker) {
    customPicker.addEventListener('input', (e) => {
      swatches.forEach(s => s.classList.remove('active'));
      const pickedColor = e.target.value;
      applyColorSelection(pickedColor, 'Custom Customizer Shade');
    });
  }

  // Engine Audio Synthesizer Toggle
  const soundBtn = document.getElementById('engineSoundBtn');
  if (soundBtn) {
    soundBtn.addEventListener('click', () => {
      if (window.reSoundEngine) {
        const isRunning = window.reSoundEngine.toggle();
        soundBtn.classList.toggle('playing', isRunning);
        soundBtn.title = isRunning ? 'Stop Engine Thump' : 'Start Engine Thump';
        showToast(isRunning ? '🏍️ Engine Started: Pure Royal Enfield single-cylinder thump active!' : 'Engine Switched Off');
      }
    });
  }

  // Rev Button
  const revBtn = document.getElementById('engineRevBtn');
  if (revBtn) {
    revBtn.addEventListener('click', () => {
      if (window.reSoundEngine) {
        window.reSoundEngine.rev(1600);
        showToast('🔊 Revving 349cc Throttle! Dug-dug-dug torque!');
      }
    });
  }

  // Headlight Beam Toggle
  const lightBtn = document.getElementById('headlightToggleBtn');
  const beamCone = document.getElementById('headlightBeamCone');
  if (lightBtn) {
    lightBtn.addEventListener('click', () => {
      let isOn = true;
      if (beamCone) {
        beamCone.classList.toggle('off');
        isOn = !beamCone.classList.contains('off');
      }
      if (window.reBike3D) {
        window.reBike3D.toggleHeadlight();
      }
      lightBtn.classList.toggle('active', isOn);
      showToast(isOn ? '💡 High-Beam Projector Turned ON' : '💡 Headlamp Turned OFF');
    });
  }
}

// Hero View Mode Switcher
window.switchHeroView = function (mode) {
  const photoStage = document.getElementById('showroomPhotoStage');
  const canvas = document.getElementById('bikeCanvas');
  const btnShowroom = document.getElementById('btnViewShowroom');
  const btnStudio = document.getElementById('btnViewStudio');

  if (mode === 'studio') {
    if (photoStage) photoStage.style.display = 'none';
    if (canvas) canvas.style.display = 'block';
    if (btnStudio) btnStudio.classList.add('active');
    if (btnShowroom) btnShowroom.classList.remove('active');
    if (window.reBike3D) window.reBike3D.resetRotation();
    showToast('Switched to 3D Studio Stage');
  } else {
    if (photoStage) photoStage.style.display = 'flex';
    if (canvas) canvas.style.display = 'none';
    if (btnShowroom) btnShowroom.classList.add('active');
    if (btnStudio) btnStudio.classList.remove('active');
    zoomHeroView('reset');
    showToast('Switched to Official Robertsganj Showroom Photo');
  }
};

// Zoom / Focus into Tank or Engine on Showroom Photo
window.zoomHeroView = function (part) {
  const img = document.getElementById('showroomHeroImg');
  if (!img) return;

  if (part === 'tank') {
    img.style.transform = 'scale(1.45) translate(-6%, 5%)';
    showToast('Zooming into Teardrop Tank & Pinstripes');
  } else if (part === 'engine') {
    img.style.transform = 'scale(1.55) translate(-8%, -8%)';
    showToast('Zooming into 349cc J-Series Engine Block');
  } else {
    img.style.transform = 'scale(1) translate(0, 0)';
  }
};

// 5. EMI & On-Road Price Calculator
function initEmiCalculator() {
  const calcBike = document.getElementById('calcBikeSelect');
  const downPaymentSlider = document.getElementById('downPaymentRange');
  const tenureSlider = document.getElementById('tenureRange');
  const rateSlider = document.getElementById('interestRange');

  const dpVal = document.getElementById('downPaymentVal');
  const tenureVal = document.getElementById('tenureVal');
  const rateVal = document.getElementById('interestVal');

  const emiDisplay = document.getElementById('monthlyEmiDisplay');
  const onRoadDisplay = document.getElementById('calcOnRoadPrice');
  const loanAmtDisplay = document.getElementById('calcLoanAmount');
  const totalInterestDisplay = document.getElementById('calcTotalInterest');

  function calculate() {
    if (!calcBike || allBikes.length === 0) return;

    const selectedBike = allBikes.find(b => b.id === calcBike.value) || allBikes[0];
    const exPrice = selectedBike.priceExShowroom;

    // Use admin-configured onRoad price, or fallback to UP RTO (~8%) + Insurance (~₹13,800)
    const rto = Math.round(exPrice * 0.08);
    const insurance = 13800;
    const onRoad = selectedBike.priceOnRoad || (exPrice + rto + insurance);

    const downPaymentPercent = parseInt(downPaymentSlider.value, 10);
    const downPaymentAmt = Math.round((onRoad * downPaymentPercent) / 100);
    const loanAmount = onRoad - downPaymentAmt;

    const tenureMonths = parseInt(tenureSlider.value, 10);
    const annualRate = parseFloat(rateSlider.value);
    const monthlyRate = annualRate / (12 * 100);

    // Standard EMI formula: P * r * (1+r)^n / ((1+r)^n - 1)
    let emi = 0;
    if (monthlyRate > 0) {
      emi = Math.round((loanAmount * monthlyRate * Math.pow(1 + monthlyRate, tenureMonths)) / (Math.pow(1 + monthlyRate, tenureMonths) - 1));
    } else {
      emi = Math.round(loanAmount / tenureMonths);
    }

    const totalRepayment = emi * tenureMonths;
    const totalInterest = totalRepayment - loanAmount;

    // Update UI
    if (dpVal) dpVal.innerText = `${downPaymentPercent}% (₹${downPaymentAmt.toLocaleString('en-IN')})`;
    if (tenureVal) tenureVal.innerText = `${tenureMonths} Months (${(tenureMonths / 12).toFixed(1)} Yrs)`;
    if (rateVal) rateVal.innerText = `${annualRate}% p.a.`;

    if (emiDisplay) emiDisplay.innerText = `₹${emi.toLocaleString('en-IN')}`;
    if (onRoadDisplay) onRoadDisplay.innerText = `₹${onRoad.toLocaleString('en-IN')}`;
    if (loanAmtDisplay) loanAmtDisplay.innerText = `₹${loanAmount.toLocaleString('en-IN')}`;
    if (totalInterestDisplay) totalInterestDisplay.innerText = `₹${totalInterest.toLocaleString('en-IN')}`;
  }

  if (calcBike) calcBike.addEventListener('change', calculate);
  if (downPaymentSlider) downPaymentSlider.addEventListener('input', calculate);
  if (tenureSlider) tenureSlider.addEventListener('input', calculate);
  if (rateSlider) rateSlider.addEventListener('input', calculate);

  // Initial run
  setTimeout(calculate, 200);
}

// Helper: jump to calculator from bike card
window.selectBikeForCalculator = function (bikeId) {
  const calcSelect = document.getElementById('calcBikeSelect');
  const section = document.getElementById('calculatorSection');
  if (calcSelect) {
    calcSelect.value = bikeId;
    calcSelect.dispatchEvent(new Event('change'));
  }
  if (section) {
    section.scrollIntoView({ behavior: 'smooth' });
  }
};

// Helper: jump to test ride from bike card
window.selectBikeForTestRide = function (bikeName) {
  const trSelect = document.getElementById('testRideBike');
  const section = document.getElementById('testRideSection');
  if (trSelect) {
    trSelect.value = bikeName;
  }
  if (section) {
    section.scrollIntoView({ behavior: 'smooth' });
  }
};

// 6. Booking Forms Handling
function initBookingForms() {
  // Test Ride Form
  const trForm = document.getElementById('testRideForm');
  if (trForm) {
    trForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const submitBtn = trForm.querySelector('button[type="submit"]');
      submitBtn.disabled = true;
      submitBtn.innerText = 'Submitting Booking...';

      const payload = {
        customerName: document.getElementById('testRideName').value,
        phone: document.getElementById('testRidePhone').value,
        email: document.getElementById('testRideEmail').value,
        bikeModel: document.getElementById('testRideBike').value,
        date: document.getElementById('testRideDate').value,
        timeSlot: document.getElementById('testRideSlot').value,
        city: document.getElementById('testRideCity').value || 'Robertsganj',
        notes: document.getElementById('testRideNotes').value
      };

      try {
        const res = await fetch('/api/bookings/test-ride', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        const data = await res.json();
        if (data.success) {
          showToast(`Booking Confirmed! Ref: ${data.bookingId}. See you at Vishwanath Enterprises, Robertsganj.`);
          trForm.reset();
        } else {
          showToast(data.message || 'Booking failed', 'error');
        }
      } catch (err) {
        showToast('Network error submitting booking', 'error');
      } finally {
        submitBtn.disabled = false;
        submitBtn.innerText = 'Confirm Test Ride Slot';
      }
    });
  }

  // Service Booking Form
  const srvForm = document.getElementById('serviceForm');
  if (srvForm) {
    srvForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const submitBtn = srvForm.querySelector('button[type="submit"]');
      submitBtn.disabled = true;
      submitBtn.innerText = 'Scheduling Appointment...';

      const payload = {
        customerName: document.getElementById('serviceName').value,
        phone: document.getElementById('servicePhone').value,
        bikeModel: document.getElementById('serviceBike').value,
        regNumber: document.getElementById('serviceRegNo').value,
        serviceType: document.getElementById('serviceType').value,
        preferredDate: document.getElementById('serviceDate').value,
        preferredTime: document.getElementById('serviceTime').value,
        notes: document.getElementById('serviceNotes').value
      };

      try {
        const res = await fetch('/api/bookings/service', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        const data = await res.json();
        if (data.success) {
          showToast(`Service Booked! Token: ${data.serviceId}. Vishwanath Service Center will contact you.`);
          srvForm.reset();
        } else {
          showToast(data.message || 'Service booking failed', 'error');
        }
      } catch (err) {
        showToast('Network error submitting service booking', 'error');
      } finally {
        submitBtn.disabled = false;
        submitBtn.innerText = 'Schedule Service Appointment';
      }
    });
  }

  // Motoverse Enquiry Form
  const motoverseForm = document.getElementById('motoverseForm');
  if (motoverseForm) {
    motoverseForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const payload = {
        name: document.getElementById('mvName').value,
        phone: document.getElementById('mvPhone').value,
        email: document.getElementById('mvEmail').value,
        type: 'Motoverse 2026 Passes',
        details: document.getElementById('mvDetails').value
      };

      try {
        const res = await fetch('/api/inquiries', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        const data = await res.json();
        if (data.success) {
          showToast('Motoverse Pass enquiry registered! Showroom team will get in touch.');
          closeAllModals();
          motoverseForm.reset();
        }
      } catch (err) {
        showToast('Error sending request', 'error');
      }
    });
  }

  // Review Submission Form
  const reviewForm = document.getElementById('reviewForm');
  if (reviewForm) {
    reviewForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const payload = {
        author: document.getElementById('reviewAuthor').value,
        rating: document.getElementById('reviewRating').value,
        text: document.getElementById('reviewText').value
      };

      try {
        const res = await fetch('/api/reviews', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        const data = await res.json();
        if (data.success) {
          showToast('Thank you! Your review has been added to the showroom profile.');
          closeAllModals();
          reviewForm.reset();
          loadReviews(); // Reload list
        }
      } catch (err) {
        showToast('Error submitting review', 'error');
      }
    });
  }
}

// 7. Customer Reviews Fetch & Render
async function loadReviews() {
  const container = document.getElementById('reviewsGrid');
  if (!container) return;

  try {
    const res = await fetch('/api/reviews');
    const data = await res.json();
    if (data.success && data.reviews) {
      container.innerHTML = data.reviews.map(r => `
        <div class="review-card">
          <div>
            <div class="review-top">
              <div class="review-author-info">
                <div class="author-avatar">${r.author.charAt(0)}</div>
                <div>
                  <div class="author-name">${r.author}</div>
                  <div class="review-stars">${'★'.repeat(r.rating)}${'☆'.repeat(5 - r.rating)}</div>
                </div>
              </div>
              <span style="font-size: 0.72rem; color: #4ade80; border: 1px solid rgba(74, 222, 128, 0.3); padding: 2px 6px; border-radius: 4px;">Verified</span>
            </div>
            <p class="review-text">"${r.text}"</p>
          </div>
          <div class="review-date">${r.date} · Google Verified Review</div>
        </div>
      `).join('');
    }
  } catch (err) {
    console.error('Error fetching reviews:', err);
  }
}

// 8. Modals System
function initModals() {
  const closeBtns = document.querySelectorAll('.modal-close-btn');
  closeBtns.forEach(b => b.addEventListener('click', closeAllModals));

  const overlays = document.querySelectorAll('.modal-overlay');
  overlays.forEach(o => {
    o.addEventListener('click', (e) => {
      if (e.target === o) closeAllModals();
    });
  });
}

window.openMotoverseModal = function () {
  const modal = document.getElementById('motoverseModal');
  if (modal) modal.classList.add('active');
};

window.openReviewModal = function () {
  const modal = document.getElementById('reviewModal');
  if (modal) modal.classList.add('active');
};

function closeAllModals() {
  const modals = document.querySelectorAll('.modal-overlay');
  modals.forEach(m => m.classList.remove('active'));
}
