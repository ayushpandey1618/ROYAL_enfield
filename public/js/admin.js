/**
 * Royal Enfield Vishwanath Enterprises - Admin Portal Script
 */

let authToken = sessionStorage.getItem('re_admin_token') || null;
let dashboardData = null;

// Toggle password visibility in admin login
window.togglePasswordVisibility = function () {
  const pwdInput = document.getElementById('adminPassword');
  const toggleBtn = document.getElementById('togglePasswordBtn');
  if (!pwdInput) return;
  if (pwdInput.type === 'password') {
    pwdInput.type = 'text';
    toggleBtn.innerText = '🙈';
    toggleBtn.title = 'Hide Password';
  } else {
    pwdInput.type = 'password';
    toggleBtn.innerHTML = '👁️';
    toggleBtn.title = 'Show Password';
  }
};

document.addEventListener('DOMContentLoaded', () => {
  initAuthCheck();
  initLoginForm();
  initTabNavigation();
  initSearchFilters();
});

// 1. Auth Check
function initAuthCheck() {
  const loginScreen = document.getElementById('loginScreen');
  const adminApp = document.getElementById('adminApp');

  if (authToken) {
    loginScreen.style.display = 'none';
    adminApp.style.display = 'block';
    loadDashboardData();
  } else {
    loginScreen.style.display = 'flex';
    adminApp.style.display = 'none';
  }
}

// 2. Login Form
function initLoginForm() {
  const form = document.getElementById('loginForm');
  const errorMsg = document.getElementById('loginError');

  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const u = document.getElementById('adminUsername').value;
      const p = document.getElementById('adminPassword').value;

      try {
        const res = await fetch('/api/admin/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username: u, password: p })
        });
        const data = await res.json();
        if (data.success) {
          authToken = data.token;
          sessionStorage.setItem('re_admin_token', authToken);
          initAuthCheck();
        } else {
          errorMsg.innerText = data.message || 'Invalid credentials';
          errorMsg.style.display = 'block';
        }
      } catch (err) {
        errorMsg.innerText = 'Server connection failed';
        errorMsg.style.display = 'block';
      }
    });
  }

  // Logout button
  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      sessionStorage.removeItem('re_admin_token');
      authToken = null;
      initAuthCheck();
    });
  }
}

// 3. Tab Navigation
function initTabNavigation() {
  const tabBtns = document.querySelectorAll('.admin-tab-btn');
  const panels = document.querySelectorAll('.admin-panel');

  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      tabBtns.forEach(b => b.classList.remove('active'));
      panels.forEach(p => p.classList.remove('active'));

      btn.classList.add('active');
      const targetId = btn.getAttribute('data-tab');
      const targetPanel = document.getElementById(targetId);
      if (targetPanel) targetPanel.classList.add('active');
    });
  });
}

// 4. Fetch Full Dashboard Data
async function loadDashboardData() {
  try {
    const res = await fetch('/api/admin/dashboard', {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });

    if (res.status === 401 || res.status === 403) {
      sessionStorage.removeItem('re_admin_token');
      authToken = null;
      initAuthCheck();
      return;
    }

    const data = await res.json();
    if (data.success) {
      dashboardData = data;
      renderKPIs(data.stats);
      renderTestRides(data.testRides);
      renderServices(data.services);
      renderInquiries(data.inquiries);
      renderReviews(data.reviews);
      renderBikes(data.bikes);
      populateAnnouncementForm(data.announcement);
    }
  } catch (err) {
    console.error('Error fetching admin dashboard:', err);
  }
}

// Render Stats Cards
function renderKPIs(stats) {
  document.getElementById('kpiTestRides').innerText = stats.totalTestRides;
  document.getElementById('kpiPendingTR').innerText = `${stats.pendingTestRides} Pending`;
  document.getElementById('kpiServices').innerText = stats.totalServices;
  document.getElementById('kpiPendingSrv').innerText = `${stats.pendingServices} Pending`;
  document.getElementById('kpiInquiries').innerText = stats.totalInquiries;
  document.getElementById('kpiReviews').innerText = `${stats.totalReviews} (${stats.rating}★)`;

  // Update tab badges
  document.getElementById('badgeCountTR').innerText = stats.totalTestRides;
  document.getElementById('badgeCountSrv').innerText = stats.totalServices;
  document.getElementById('badgeCountInq').innerText = stats.totalInquiries;
  document.getElementById('badgeCountRev').innerText = stats.totalReviews;
}

// Render Test Rides
function renderTestRides(list) {
  const tbody = document.getElementById('testRidesTableBody');
  if (!tbody) return;

  if (list.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7" style="text-align: center; color: var(--text-muted);">No test ride bookings yet.</td></tr>`;
    return;
  }

  tbody.innerHTML = list.map(item => `
    <tr>
      <td><strong style="color: var(--gold-light);">${item.id}</strong></td>
      <td>
        <div><strong>${item.customerName}</strong></div>
        <div style="font-size: 0.78rem; color: var(--text-muted);">${item.phone}</div>
      </td>
      <td>${item.bikeModel} <span style="font-size: 0.75rem; color: var(--text-muted);">(${item.bikeColor || 'Standard'})</span></td>
      <td>
        <div>${item.date}</div>
        <div style="font-size: 0.78rem; color: var(--gold-light);">${item.timeSlot}</div>
      </td>
      <td>${item.city}</td>
      <td><span class="badge-status ${item.status.toLowerCase()}">${item.status}</span></td>
      <td>
        <div class="action-btn-group">
          <button class="btn-icon-sm" title="Confirm" onclick="updateTestRideStatus('${item.id}', 'Confirmed')">✓</button>
          <button class="btn-icon-sm" title="Mark Completed" onclick="updateTestRideStatus('${item.id}', 'Completed')">🏁</button>
          <button class="btn-icon-sm danger" title="Cancel" onclick="updateTestRideStatus('${item.id}', 'Cancelled')">✕</button>
        </div>
      </td>
    </tr>
  `).join('');
}

// Update Test Ride Status
window.updateTestRideStatus = async function (id, status) {
  try {
    const res = await fetch(`/api/admin/test-rides/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify({ status })
    });
    const d = await res.json();
    if (d.success) {
      loadDashboardData();
    }
  } catch (err) {
    alert('Error updating status');
  }
};

// Render Service Bookings
function renderServices(list) {
  const tbody = document.getElementById('servicesTableBody');
  if (!tbody) return;

  tbody.innerHTML = list.map(item => `
    <tr>
      <td><strong style="color: var(--gold-light);">${item.id}</strong></td>
      <td>
        <div><strong>${item.customerName}</strong></div>
        <div style="font-size: 0.78rem; color: var(--text-muted);">${item.phone}</div>
      </td>
      <td>${item.bikeModel} <br><span style="font-size: 0.75rem; color: var(--text-muted);">${item.regNumber}</span></td>
      <td>${item.serviceType}</td>
      <td>${item.preferredDate} (${item.preferredTime})</td>
      <td><span class="badge-status ${item.status.toLowerCase()}">${item.status}</span></td>
      <td>
        <div class="action-btn-group">
          <button class="btn-icon-sm" title="Confirm/Schedule" onclick="updateServiceStatus('${item.id}', 'Scheduled')">✓</button>
          <button class="btn-icon-sm" title="Complete" onclick="updateServiceStatus('${item.id}', 'Completed')">🏁</button>
          <button class="btn-icon-sm danger" title="Cancel" onclick="updateServiceStatus('${item.id}', 'Cancelled')">✕</button>
        </div>
      </td>
    </tr>
  `).join('');
}

window.updateServiceStatus = async function (id, status) {
  try {
    const res = await fetch(`/api/admin/services/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify({ status })
    });
    const d = await res.json();
    if (d.success) loadDashboardData();
  } catch (e) {
    alert('Failed to update service status');
  }
};

// Render Inquiries / Motoverse Leads
function renderInquiries(list) {
  const tbody = document.getElementById('inquiriesTableBody');
  if (!tbody) return;

  tbody.innerHTML = list.map(item => `
    <tr>
      <td><strong style="color: var(--gold-light);">${item.id}</strong></td>
      <td>
        <div><strong>${item.name}</strong></div>
        <div style="font-size: 0.78rem; color: var(--text-muted);">${item.phone}</div>
      </td>
      <td><span class="motoverse-tag" style="font-size: 0.7rem;">${item.type}</span></td>
      <td style="max-width: 250px; font-size: 0.82rem;">${item.details || 'N/A'}</td>
      <td><span class="badge-status ${item.status === 'New' ? 'pending' : 'confirmed'}">${item.status}</span></td>
      <td>
        <div class="action-btn-group">
          <button class="btn-icon-sm" title="Mark Followed Up" onclick="updateInquiryStatus('${item.id}', 'Followed Up')">✓</button>
          <button class="btn-icon-sm" title="Mark Closed" onclick="updateInquiryStatus('${item.id}', 'Closed')">🏁</button>
        </div>
      </td>
    </tr>
  `).join('');
}

window.updateInquiryStatus = async function (id, status) {
  try {
    const res = await fetch(`/api/admin/inquiries/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify({ status })
    });
    const d = await res.json();
    if (d.success) loadDashboardData();
  } catch (e) {
    alert('Failed to update inquiry');
  }
};

// Render Reviews
function renderReviews(list) {
  const tbody = document.getElementById('reviewsTableBody');
  if (!tbody) return;

  tbody.innerHTML = list.map(item => `
    <tr>
      <td><strong style="color: #fff;">${item.author}</strong></td>
      <td><span style="color: #facc15;">${'★'.repeat(item.rating)}</span></td>
      <td style="font-size: 0.82rem; color: var(--text-secondary); max-width: 320px;">"${item.text}"</td>
      <td>${item.date}</td>
      <td>
        <button class="btn-icon-sm danger" title="Remove Review" onclick="deleteReview('${item.id}')">🗑️</button>
      </td>
    </tr>
  `).join('');
}

window.deleteReview = async function (id) {
  if (!confirm('Are you sure you want to remove this customer review?')) return;
  try {
    const res = await fetch(`/api/admin/reviews/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    const d = await res.json();
    if (d.success) loadDashboardData();
  } catch (e) {
    alert('Failed to remove review');
  }
};

// Render Bikes with real thumbnails and dedicated modal editor
function renderBikes(list) {
  const tbody = document.getElementById('bikesTableBody');
  if (!tbody) return;

  tbody.innerHTML = list.map(b => `
    <tr>
      <td>
        <div style="display: flex; align-items: center; gap: 12px;">
          <img src="${b.image}" alt="${b.name}" style="width: 60px; height: 40px; object-fit: contain; background: #181822; border-radius: 4px; padding: 2px; border: 1px solid var(--border-subtle);">
          <div>
            <strong style="color: #fff; font-size: 0.95rem;">${b.name}</strong>
            <div style="font-size: 0.75rem; color: var(--text-muted);">${b.tagline || ''}</div>
          </div>
        </div>
      </td>
      <td><span class="bike-badge" style="position: static;">${b.category}</span></td>
      <td><strong style="color: var(--gold-light); font-size: 1rem;">₹${b.priceExShowroom.toLocaleString('en-IN')}</strong></td>
      <td><strong style="color: #fff; font-size: 1rem;">₹${b.priceOnRoad.toLocaleString('en-IN')}</strong></td>
      <td>${b.power}</td>
      <td>
        <button class="btn btn-primary btn-sm" onclick="openPriceEditorModal('${b.id}')">
          ✏️ Edit Price
        </button>
      </td>
    </tr>
  `).join('');
}

// Open Dedicated Price Editor Modal
window.openPriceEditorModal = function (bikeId) {
  if (!dashboardData || !dashboardData.bikes) return;
  const bike = dashboardData.bikes.find(b => b.id === bikeId);
  if (!bike) return;

  document.getElementById('editBikeId').value = bike.id;
  document.getElementById('editBikeName').innerText = bike.name;
  document.getElementById('editBikeCategory').innerText = bike.category;
  document.getElementById('editBikeImg').src = bike.image;
  document.getElementById('editExPrice').value = bike.priceExShowroom;
  document.getElementById('editOnRoadPrice').value = bike.priceOnRoad;

  const modal = document.getElementById('priceEditorModal');
  if (modal) modal.classList.add('active');
};

window.closePriceEditorModal = function () {
  const modal = document.getElementById('priceEditorModal');
  if (modal) modal.classList.remove('active');
};

// Auto-Calculate On-Road estimate based on UP RTO (8%) + standard RE insurance (~₹13,800)
window.autoCalculateOnRoad = function () {
  const exVal = parseInt(document.getElementById('editExPrice').value, 10);
  if (!exVal || isNaN(exVal)) {
    alert('Please enter a valid Ex-Showroom price first.');
    return;
  }
  const rto = Math.round(exVal * 0.08);
  const insurance = 13800;
  const estimatedOnRoad = exVal + rto + insurance;
  document.getElementById('editOnRoadPrice').value = estimatedOnRoad;
};

// Initialize Price Editor Form Handler
document.addEventListener('DOMContentLoaded', () => {
  const priceForm = document.getElementById('priceEditorForm');
  if (priceForm) {
    priceForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const bikeId = document.getElementById('editBikeId').value;
      const exPrice = parseInt(document.getElementById('editExPrice').value, 10);
      const onRoadPrice = parseInt(document.getElementById('editOnRoadPrice').value, 10);
      const saveBtn = document.getElementById('savePriceBtn');

      if (!exPrice || !onRoadPrice) {
        alert('Please fill out both Ex-Showroom and On-Road prices.');
        return;
      }

      saveBtn.disabled = true;
      saveBtn.innerText = 'Updating Live Website...';

      try {
        const res = await fetch(`/api/admin/bikes/${bikeId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authToken}`
          },
          body: JSON.stringify({
            priceExShowroom: exPrice,
            priceOnRoad: onRoadPrice
          })
        });

        const data = await res.json();
        if (data.success) {
          alert(`Success! Price for ${data.bike.name} has been updated to:\nEx-Showroom: ₹${exPrice.toLocaleString('en-IN')}\nOn-Road: ₹${onRoadPrice.toLocaleString('en-IN')}\n\nThis is now LIVE on the showroom website & EMI calculator!`);
          closePriceEditorModal();
          loadDashboardData();
        } else {
          alert(data.message || 'Failed to update price');
        }
      } catch (err) {
        alert('Error communicating with server');
      } finally {
        saveBtn.disabled = false;
        saveBtn.innerText = 'Save & Publish Price';
      }
    });
  }
});

// Announcement Form
function populateAnnouncementForm(ann) {
  if (!ann) return;
  const titleInput = document.getElementById('annTitle');
  const subInput = document.getElementById('annSub');
  const festInput = document.getElementById('annFestive');

  if (titleInput) titleInput.value = ann.title;
  if (subInput) subInput.value = ann.subtitle;
  if (festInput) festInput.value = ann.festiveOffer || '';

  const form = document.getElementById('announcementForm');
  if (form) {
    form.onsubmit = async (e) => {
      e.preventDefault();
      try {
        const res = await fetch('/api/admin/announcement', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authToken}`
          },
          body: JSON.stringify({
            title: titleInput.value,
            subtitle: subInput.value,
            festiveOffer: festInput.value,
            active: true
          })
        });
        const d = await res.json();
        if (d.success) alert('Showroom announcements updated live!');
      } catch (err) {
        alert('Failed to update announcement');
      }
    };
  }
}

// 5. Search Filters
function initSearchFilters() {
  const trSearch = document.getElementById('testRideSearch');
  if (trSearch) {
    trSearch.addEventListener('input', (e) => {
      const q = e.target.value.toLowerCase();
      if (!dashboardData) return;
      const filtered = dashboardData.testRides.filter(item =>
        item.customerName.toLowerCase().includes(q) ||
        item.phone.includes(q) ||
        item.bikeModel.toLowerCase().includes(q) ||
        item.id.toLowerCase().includes(q)
      );
      renderTestRides(filtered);
    });
  }
}
