/*
  จัดการการแสดงผลหน้า Dashboard
  แสดงสรุปการปลูก รายการใกล้เก็บเกี่ยว และรายการปลูกล่าสุด
*/

(function () {
  const Utils = window.GrowDayUtils;

  function renderDashboard(state) {
    const container = document.getElementById("view-dashboard");

    if (!container) {
      return;
    }

    const summary = state.dashboardSummary || {};
    const plantings = Array.isArray(state.plantings) ? state.plantings : [];
    const nearHarvest = getNearHarvest(summary, plantings);
    const recentPlantings = getRecentPlantings(summary, plantings);
    const hasAnyData = plantings.length > 0 || nearHarvest.length > 0 || recentPlantings.length > 0;

    container.innerHTML = `
      <section class="space-y-5">
        <div class="overflow-hidden rounded-2xl border border-green-100 bg-white shadow-sm">
          <div class="growday-hero-frame relative aspect-[21/9] w-full overflow-hidden">
            <img
              src="assets/images/hero-hydroponic-greenhouse.png"
              alt="โรงเรือนผักไฮโดรโปนิก"
              class="h-full w-full object-cover"
              onerror="this.parentElement.innerHTML='<div class=&quot;growday-hero-fallback flex h-full w-full items-center justify-center px-5 text-center&quot;><div><p class=&quot;text-sm font-semibold text-green-700&quot;>GrowDay</p><p class=&quot;mt-1 text-xs text-gray-600&quot;>จัดการรอบปลูกผักไฮโดรโปนิก</p></div></div>';"
            >
          </div>
          <div class="p-5">
            <p class="text-sm font-semibold text-green-700">หน้าแรก</p>
            <h2 class="mt-1 text-2xl font-bold text-gray-900">ภาพรวมการปลูก</h2>
            <p class="mt-2 text-sm leading-6 text-gray-600">ดูสถานะรอบปลูกและผลผลิตล่าสุดของกลุ่ม</p>
          </div>
        </div>

        ${renderSummaryCards(summary)}
        ${renderQuickMenu()}
        ${!hasAnyData ? renderEmptyState() : ""}
        ${renderNearHarvest(nearHarvest)}
        ${renderRecentPlantings(recentPlantings)}
      </section>
    `;
  }

  function renderSummaryCards(summary) {
    const cards = [
      {
        label: "กำลังปลูก",
        value: Utils.formatNumber(summary.activePlantingCount || 0),
        unit: "รายการ",
        tone: "pastel-card-green"
      },
      {
        label: "พร้อมเก็บวันนี้",
        value: Utils.formatNumber(summary.readyTodayCount || 0),
        unit: "รายการ",
        tone: "pastel-card-yellow"
      },
      {
        label: "เก็บเกี่ยวใน 7 วัน",
        value: Utils.formatNumber(summary.readyIn7DaysCount || 0),
        unit: "รายการ",
        tone: "pastel-card-pink"
      },
      {
        label: "ผลผลิตเดือนนี้",
        value: Utils.formatNumber(summary.monthlyYieldKg || 0),
        unit: "กก.",
        tone: "pastel-card-blue"
      }
    ];

    return `
      <div class="grid grid-cols-2 gap-3">
        ${cards.map(function (card) {
          return `
            <article class="rounded-2xl border ${card.tone} p-4 shadow-sm">
              <p class="text-xs font-semibold text-gray-600">${card.label}</p>
              <div class="mt-2 flex items-end gap-1">
                <strong class="text-2xl font-bold text-green-800">${card.value}</strong>
                <span class="pb-1 text-xs text-gray-500">${card.unit}</span>
              </div>
            </article>
          `;
        }).join("")}
      </div>
    `;
  }

  function renderQuickMenu() {
    const items = [
      { label: "บันทึกการปลูก", target: "planting", tone: "pastel-menu-green" },
      { label: "รายการปลูก", target: "records", tone: "pastel-menu-blue" },
      { label: "บันทึกเก็บเกี่ยว", target: "harvest", tone: "pastel-menu-yellow" },
      { label: "สรุปผลผลิต", target: "summary", tone: "pastel-menu-pink" }
    ];

    return `
      <section class="rounded-2xl border border-green-100 bg-white p-5 shadow-sm">
        <h3 class="text-base font-bold text-gray-900">เมนูด่วน</h3>
        <div class="mt-3 grid grid-cols-2 gap-3">
          ${items.map(function (item) {
            return `
              <button
                type="button"
                class="quick-menu-button min-h-14 rounded-2xl border px-3 text-sm font-semibold shadow-sm ${item.tone}"
                data-target-view="${item.target}"
              >
                ${item.label}
              </button>
            `;
          }).join("")}
        </div>
      </section>
    `;
  }

  function renderEmptyState() {
    return `
      <section class="pastel-empty rounded-2xl border border-dashed p-5 text-center shadow-sm">
        <div class="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-white text-2xl shadow-sm">🌱</div>
        <h3 class="mt-3 text-base font-bold text-gray-900">ยังไม่มีรายการปลูก</h3>
        <p class="mt-2 text-sm text-gray-600">เริ่มจากบันทึกการปลูกครั้งแรก แล้วข้อมูลจะแสดงในหน้านี้</p>
        <button
          type="button"
          class="quick-menu-button mt-4 min-h-12 rounded-2xl bg-green-700 px-4 text-sm font-semibold text-white shadow-sm"
          data-target-view="planting"
        >
          บันทึกการปลูก
        </button>
      </section>
    `;
  }

  function renderNearHarvest(items) {
    return `
      <section class="rounded-2xl border border-green-100 bg-white p-5 shadow-sm">
        <div class="flex items-center justify-between gap-3">
          <h3 class="text-base font-bold text-gray-900">ใกล้ถึงวันเก็บเกี่ยว</h3>
          <span class="text-xs text-gray-500">สูงสุด 5 รายการ</span>
        </div>
        <div class="mt-3 space-y-3">
          ${items.length ? items.map(renderPlantingItem).join("") : renderSmallEmpty("ยังไม่มีรายการใกล้เก็บเกี่ยว")}
        </div>
      </section>
    `;
  }

  function renderRecentPlantings(items) {
    return `
      <section class="rounded-2xl border border-green-100 bg-white p-5 shadow-sm">
        <h3 class="text-base font-bold text-gray-900">รายการปลูกล่าสุด</h3>
        <div class="mt-3 space-y-3">
          ${items.length ? items.map(renderPlantingItem).join("") : renderSmallEmpty("ยังไม่มีรายการปลูกล่าสุด")}
        </div>
      </section>
    `;
  }

  function renderPlantingItem(planting) {
    const daysRemaining = Number.isFinite(planting.daysRemaining)
      ? planting.daysRemaining
      : Utils.calculateDaysRemaining(planting.expectedHarvestDate);
    const status = Utils.getPlantingStatus(planting);
    const label = Utils.getStatusLabel(status, daysRemaining);
    const chipClass = Utils.getStatusChipClass(status, daysRemaining);

    return `
      <article class="pastel-list-item rounded-2xl border p-4">
        <div class="flex items-start justify-between gap-3">
          <div>
            <h4 class="font-semibold text-gray-900">${escapeHtml(planting.cropName || "-")}</h4>
            <p class="mt-1 text-xs text-gray-600">
              ปลูก ${Utils.formatDateForDisplay(planting.plantedDate)}
              • เก็บเกี่ยว ${Utils.formatDateForDisplay(planting.expectedHarvestDate)}
            </p>
          </div>
          <span class="shrink-0 rounded-full border px-2 py-1 text-xs font-semibold ${chipClass}">
            ${label}
          </span>
        </div>
      </article>
    `;
  }

  function renderSmallEmpty(message) {
    return `<p class="rounded-2xl bg-blue-50 px-4 py-4 text-center text-sm text-gray-600">🌿 ${message}</p>`;
  }

  function getNearHarvest(summary, plantings) {
    if (Array.isArray(summary.nearHarvest) && summary.nearHarvest.length) {
      return summary.nearHarvest.slice(0, 5);
    }

    return plantings
      .filter(function (planting) {
        const status = Utils.getPlantingStatus(planting);
        return status === "growing" || status === "ready";
      })
      .sort(function (a, b) {
        return String(a.expectedHarvestDate || "").localeCompare(String(b.expectedHarvestDate || ""));
      })
      .slice(0, 5);
  }

  function getRecentPlantings(summary, plantings) {
    if (Array.isArray(summary.recentPlantings) && summary.recentPlantings.length) {
      return summary.recentPlantings.slice(0, 3);
    }

    return plantings
      .slice()
      .sort(function (a, b) {
        return String(b.createdAt || "").localeCompare(String(a.createdAt || ""));
      })
      .slice(0, 3);
  }

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  window.GrowDayDashboard = {
    renderDashboard
  };
})();
