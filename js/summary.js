/*
  จัดการหน้าสรุปผลผลิตพื้นฐาน
  แสดงผลผลิตรวม รายการเก็บเกี่ยว และสรุปตามชนิดผักแบบเรียบง่าย
*/

(function () {
  const Utils = window.GrowDayUtils;

  function renderSummary(state) {
    const container = document.getElementById("view-summary");

    if (!container) {
      return;
    }

    const plantings = Array.isArray(state.plantings) ? state.plantings : [];
    const harvestItems = getHarvestItems(state);
    const currentMonthItems = filterCurrentMonthHarvests(harvestItems);
    const monthlyYield = sumYield(currentMonthItems);
    const harvestedCount = plantings.filter(function (planting) {
      return Utils.getPlantingStatus(planting) === "harvested";
    }).length;
    const statusCounts = getStatusCounts(plantings);
    const cropSummary = getCropYieldSummary(harvestItems);
    const recentHarvests = harvestItems.slice(0, 5);

    container.innerHTML = `
      <section class="space-y-4">
        <div class="rounded-2xl bg-green-700 p-5 text-white shadow-sm">
          <p class="text-sm font-medium text-green-100">สรุป</p>
          <h2 class="mt-1 text-2xl font-bold">สรุปผลผลิต</h2>
          <p class="mt-2 text-sm text-green-50">ภาพรวมผลผลิตและสถานะรายการปลูกแบบพื้นฐาน</p>
        </div>

        ${renderTopCards(monthlyYield, harvestedCount)}
        ${renderStatusSummary(statusCounts)}
        ${renderCropSummary(cropSummary)}
        ${renderRecentHarvests(recentHarvests)}
      </section>
    `;
  }

  function renderTopCards(monthlyYield, harvestedCount) {
    return `
      <section class="grid grid-cols-2 gap-3">
        <article class="rounded-2xl border border-green-100 bg-green-50 p-4 shadow-sm">
          <p class="text-xs font-medium text-green-800">ผลผลิตรวมเดือนนี้</p>
          <strong class="mt-2 block text-2xl font-bold text-green-900">${Utils.formatKg(monthlyYield)}</strong>
        </article>
        <article class="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
          <p class="text-xs font-medium text-gray-500">เก็บเกี่ยวแล้ว</p>
          <strong class="mt-2 block text-2xl font-bold text-green-800">${Utils.formatNumber(harvestedCount)}</strong>
          <span class="text-xs text-gray-500">รายการ</span>
        </article>
      </section>
    `;
  }

  function renderStatusSummary(counts) {
    const items = [
      { label: "กำลังปลูก", value: counts.growing, className: "bg-green-50 text-green-800 border-green-100" },
      { label: "พร้อมเก็บ", value: counts.ready, className: "bg-yellow-50 text-yellow-800 border-yellow-100" },
      { label: "เก็บแล้ว", value: counts.harvested, className: "bg-gray-100 text-gray-700 border-gray-200" },
      { label: "ยกเลิก", value: counts.cancelled, className: "bg-red-50 text-red-700 border-red-100" }
    ];

    return `
      <section class="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
        <h3 class="text-base font-bold text-gray-900">จำนวนรายการตามสถานะ</h3>
        <div class="mt-3 grid grid-cols-2 gap-3">
          ${items.map(function (item) {
            return `
              <div class="rounded-2xl border px-4 py-3 ${item.className}">
                <p class="text-xs font-medium">${item.label}</p>
                <strong class="mt-1 block text-xl font-bold">${Utils.formatNumber(item.value)}</strong>
              </div>
            `;
          }).join("")}
        </div>
      </section>
    `;
  }

  function renderCropSummary(items) {
    return `
      <section class="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
        <h3 class="text-base font-bold text-gray-900">ผลผลิตแยกตามชนิดผัก</h3>
        <div class="mt-3 space-y-3">
          ${items.length ? items.map(function (item) {
            return `
              <article class="rounded-2xl border border-gray-100 bg-gray-50 p-3">
                <div class="flex items-center justify-between gap-3">
                  <div>
                    <h4 class="font-semibold text-gray-900">${escapeHtml(item.cropName)}</h4>
                    <p class="text-xs text-gray-500">${Utils.formatNumber(item.count)} ครั้ง</p>
                  </div>
                  <strong class="text-sm text-green-800">${Utils.formatKg(item.totalYield)}</strong>
                </div>
              </article>
            `;
          }).join("") : renderEmpty("ยังไม่มีข้อมูลผลผลิตแยกตามชนิดผัก")}
        </div>
      </section>
    `;
  }

  function renderRecentHarvests(items) {
    return `
      <section class="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
        <h3 class="text-base font-bold text-gray-900">รายการเก็บเกี่ยวล่าสุด</h3>
        <div class="mt-3 space-y-3">
          ${items.length ? items.map(function (item) {
            return `
              <article class="rounded-2xl border border-gray-100 bg-gray-50 p-3">
                <div class="flex items-start justify-between gap-3">
                  <div>
                    <h4 class="font-semibold text-gray-900">${escapeHtml(item.cropName || "-")}</h4>
                    <p class="mt-1 text-xs text-gray-600">วันที่เก็บเกี่ยว ${Utils.formatDateForDisplay(item.harvestDate)}</p>
                  </div>
                  <strong class="shrink-0 text-sm text-green-800">${Utils.formatKg(item.yieldAmount)}</strong>
                </div>
              </article>
            `;
          }).join("") : renderEmpty("ยังไม่มีรายการเก็บเกี่ยว")}
        </div>
      </section>
    `;
  }

  function renderEmpty(message) {
    return `<p class="rounded-2xl bg-gray-50 px-4 py-4 text-center text-sm text-gray-500">${message}</p>`;
  }

  function getHarvestItems(state) {
    const logs = Array.isArray(state.harvestLogs) ? state.harvestLogs : [];

    if (logs.length) {
      return logs
        .map(function (log) {
          return {
            cropId: log.cropId,
            cropName: log.cropName,
            harvestDate: log.harvestDate,
            yieldAmount: Number(log.yieldAmount || 0),
            createdAt: log.createdAt || ""
          };
        })
        .sort(sortHarvestDesc);
    }

    return (state.plantings || [])
      .filter(function (planting) {
        return Utils.getPlantingStatus(planting) === "harvested";
      })
      .map(function (planting) {
        return {
          cropId: planting.cropId,
          cropName: planting.cropName,
          harvestDate: planting.actualHarvestDate,
          yieldAmount: Number(planting.actualYield || 0),
          createdAt: planting.updatedAt || ""
        };
      })
      .sort(sortHarvestDesc);
  }

  function filterCurrentMonthHarvests(items) {
    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth() + 1;

    return items.filter(function (item) {
      const parts = String(item.harvestDate || "").split("-").map(Number);

      return parts[0] === currentYear && parts[1] === currentMonth;
    });
  }

  function sumYield(items) {
    return items.reduce(function (total, item) {
      return total + Number(item.yieldAmount || 0);
    }, 0);
  }

  function getStatusCounts(plantings) {
    return plantings.reduce(function (counts, planting) {
      const status = Utils.getPlantingStatus(planting);
      counts[status] = (counts[status] || 0) + 1;
      return counts;
    }, {
      growing: 0,
      ready: 0,
      harvested: 0,
      cancelled: 0
    });
  }

  function getCropYieldSummary(items) {
    const grouped = {};

    items.forEach(function (item) {
      const key = item.cropId || item.cropName || "unknown";

      if (!grouped[key]) {
        grouped[key] = {
          cropName: item.cropName || "-",
          count: 0,
          totalYield: 0
        };
      }

      grouped[key].count += 1;
      grouped[key].totalYield += Number(item.yieldAmount || 0);
    });

    return Object.keys(grouped)
      .map(function (key) {
        return grouped[key];
      })
      .sort(function (a, b) {
        return b.totalYield - a.totalYield;
      });
  }

  function sortHarvestDesc(a, b) {
    return String(b.harvestDate || b.createdAt || "").localeCompare(String(a.harvestDate || a.createdAt || ""));
  }

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  window.GrowDaySummary = {
    renderSummary
  };
})();
