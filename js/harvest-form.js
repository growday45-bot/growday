/*
  จัดการฟอร์มบันทึกเก็บเกี่ยว
  เลือกรายการพร้อมเก็บ บันทึกวันที่เก็บเกี่ยวจริง และปริมาณผลผลิต
*/

(function () {
  const State = window.GrowDayState;
  const Api = window.GrowDayApi;
  const Utils = window.GrowDayUtils;
  const Config = window.GrowDayConfig || {};
  const defaultSettings = Config.DEFAULT_SETTINGS || {};
  let selectedPlantingId = "";
  let listenersBound = false;

  function renderHarvestForm(state) {
    const container = document.getElementById("view-harvest");

    if (!container) {
      return;
    }

    const readyPlantings = getReadyPlantings(state);
    let selectedPlanting = readyPlantings.find(function (planting) {
      return planting.id === selectedPlantingId;
    }) || readyPlantings[0] || null;
    const recentHarvests = getRecentHarvests(state);
    const today = getTodayInputValue();

    if (selectedPlanting && selectedPlanting.id !== selectedPlantingId) {
      selectedPlantingId = selectedPlanting.id;
    }

    container.innerHTML = `
      <section class="space-y-4">
        <div class="rounded-2xl bg-green-700 p-5 text-white shadow-sm">
          <p class="text-sm font-medium text-green-100">เก็บเกี่ยว</p>
          <h2 class="mt-1 text-2xl font-bold">บันทึกผลผลิตจริง</h2>
          <p class="mt-2 text-sm text-green-50">เลือกรายการที่พร้อมเก็บ แล้วบันทึกผลผลิตลง Google Sheets</p>
        </div>

        <form id="harvest-form" class="space-y-4 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm" novalidate>
          <div id="harvest-form-error" class="hidden rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-medium text-red-700"></div>

          <div>
            <label for="harvest-planting-id" class="text-sm font-semibold text-gray-800">เลือกรายการปลูกที่พร้อมเก็บ</label>
            <select
              id="harvest-planting-id"
              name="plantingId"
              class="mt-2 min-h-12 w-full rounded-2xl border border-gray-200 bg-white px-4 text-base text-gray-900"
              ${readyPlantings.length ? "" : "disabled"}
            >
              ${readyPlantings.length ? readyPlantings.map(function (planting) {
                const selected = planting.id === selectedPlantingId ? "selected" : "";
                return `<option value="${escapeHtml(planting.id)}" ${selected}>${escapeHtml(planting.cropName || "-")} • ปลูก ${Utils.formatDateForDisplay(planting.plantedDate)}</option>`;
              }).join("") : '<option value="">ยังไม่มีรายการพร้อมเก็บ</option>'}
            </select>
          </div>

          ${selectedPlanting ? renderPlantingInfo(selectedPlanting) : renderNoReadyPlantings()}

          <div>
            <label for="harvest-date" class="text-sm font-semibold text-gray-800">วันที่เก็บเกี่ยวจริง</label>
            <input
              id="harvest-date"
              name="harvestDate"
              type="date"
              value="${today}"
              class="mt-2 min-h-12 w-full rounded-2xl border border-gray-200 bg-white px-4 text-base text-gray-900"
              ${readyPlantings.length ? "" : "disabled"}
            >
          </div>

          <div>
            <label for="harvest-yield-amount" class="text-sm font-semibold text-gray-800">ปริมาณผลผลิตจริง</label>
            <input
              id="harvest-yield-amount"
              name="yieldAmount"
              type="number"
              inputmode="decimal"
              min="0"
              step="0.01"
              placeholder="เช่น 12.5"
              class="mt-2 min-h-12 w-full rounded-2xl border border-gray-200 bg-white px-4 text-base text-gray-900"
              ${readyPlantings.length ? "" : "disabled"}
            >
          </div>

          <div>
            <label for="harvest-yield-unit" class="text-sm font-semibold text-gray-800">หน่วยผลผลิต</label>
            <select
              id="harvest-yield-unit"
              name="yieldUnit"
              class="mt-2 min-h-12 w-full rounded-2xl border border-gray-200 bg-white px-4 text-base text-gray-900"
              ${readyPlantings.length ? "" : "disabled"}
            >
              <option value="kg">กก.</option>
            </select>
          </div>

          <div>
            <label for="harvest-note" class="text-sm font-semibold text-gray-800">หมายเหตุ</label>
            <textarea
              id="harvest-note"
              name="note"
              rows="3"
              maxlength="200"
              placeholder="เช่น คุณภาพดี หรือส่งลูกค้าประจำ"
              class="mt-2 w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-base text-gray-900"
              ${readyPlantings.length ? "" : "disabled"}
            ></textarea>
          </div>

          <button
            type="submit"
            class="min-h-12 w-full rounded-2xl bg-green-700 px-4 text-base font-semibold text-white disabled:bg-gray-300"
            ${readyPlantings.length ? "" : "disabled"}
          >
            บันทึกผลผลิต
          </button>
        </form>

        <section class="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
          <h3 class="text-base font-bold text-gray-900">รายการเก็บเกี่ยวล่าสุด</h3>
          <div class="mt-3 space-y-3">
            ${recentHarvests.length ? recentHarvests.map(renderRecentHarvest).join("") : '<p class="rounded-2xl bg-gray-50 px-4 py-4 text-center text-sm text-gray-500">ยังไม่มีประวัติเก็บเกี่ยว</p>'}
          </div>
        </section>
      </section>
    `;

    bindHarvestEvents();
  }

  function renderPlantingInfo(planting) {
    const daysRemaining = Number.isFinite(Number(planting.daysRemaining))
      ? Number(planting.daysRemaining)
      : Utils.calculateDaysRemaining(planting.expectedHarvestDate);
    const status = Utils.getPlantingStatus(planting);

    return `
      <section class="rounded-2xl border border-green-100 bg-green-50 p-4">
        <p class="text-sm font-semibold text-green-800">ข้อมูลรายการปลูก</p>
        <dl class="mt-3 grid grid-cols-1 gap-3 text-sm">
          <div class="flex justify-between gap-3">
            <dt class="text-gray-600">ชื่อผัก</dt>
            <dd class="font-semibold text-gray-900">${escapeHtml(planting.cropName || "-")}</dd>
          </div>
          <div class="flex justify-between gap-3">
            <dt class="text-gray-600">วันที่ปลูก</dt>
            <dd class="font-semibold text-gray-900">${Utils.formatDateForDisplay(planting.plantedDate)}</dd>
          </div>
          <div class="flex justify-between gap-3">
            <dt class="text-gray-600">คาดว่าเก็บเกี่ยว</dt>
            <dd class="font-semibold text-gray-900">${Utils.formatDateForDisplay(planting.expectedHarvestDate)}</dd>
          </div>
          <div class="flex justify-between gap-3">
            <dt class="text-gray-600">จำนวนช่องปลูก</dt>
            <dd class="font-semibold text-gray-900">${Utils.formatNumber(planting.quantity)} ${escapeHtml(planting.unitLabel || "ช่องปลูก")}</dd>
          </div>
          <div class="flex justify-between gap-3">
            <dt class="text-gray-600">สถานะ</dt>
            <dd class="font-semibold text-green-900">${Utils.getStatusLabel(status, daysRemaining)}</dd>
          </div>
        </dl>
      </section>
    `;
  }

  function renderNoReadyPlantings() {
    return `
      <section class="rounded-2xl border border-dashed border-gray-300 bg-gray-50 p-4 text-center">
        <p class="text-sm font-semibold text-gray-800">ยังไม่มีรายการที่พร้อมเก็บเกี่ยว</p>
        <p class="mt-1 text-sm text-gray-500">เมื่อมีรายการถึงวันเก็บเกี่ยว ระบบจะแสดงให้เลือกที่นี่</p>
      </section>
    `;
  }

  function renderRecentHarvest(item) {
    return `
      <article class="rounded-2xl border border-gray-100 bg-gray-50 p-3">
        <div class="flex items-start justify-between gap-3">
          <div>
            <h4 class="font-semibold text-gray-900">${escapeHtml(item.cropName || "-")}</h4>
            <p class="mt-1 text-xs text-gray-600">วันที่เก็บเกี่ยว ${Utils.formatDateForDisplay(item.harvestDate || item.actualHarvestDate)}</p>
          </div>
          <strong class="shrink-0 text-sm text-green-800">${Utils.formatKg(item.yieldAmount || item.actualYield || 0)}</strong>
        </div>
      </article>
    `;
  }

  function bindHarvestEvents() {
    if (listenersBound) {
      return;
    }

    listenersBound = true;

    document.addEventListener("change", function (event) {
      if (event.target.id === "harvest-planting-id") {
        selectedPlantingId = event.target.value;
        renderHarvestForm(State.getState());
      }
    });

    document.addEventListener("submit", function (event) {
      if (event.target.id === "harvest-form") {
        event.preventDefault();
        handleSubmit(event.target);
      }
    });
  }

  function selectPlanting(plantingId) {
    selectedPlantingId = plantingId || "";
  }

  async function handleSubmit(form) {
    hideFormError();

    const payload = getPayloadFromForm(form);
    const validationError = validatePayload(payload);

    if (validationError) {
      showFormError(validationError);
      return;
    }

    State.setState({
      loading: true,
      error: ""
    });

    try {
      await Api.recordHarvest(payload);
      selectedPlantingId = "";

      if (window.GrowDayApp && typeof window.GrowDayApp.showToast === "function") {
        window.GrowDayApp.showToast("บันทึกผลผลิตเรียบร้อยแล้ว");
      }

      if (window.GrowDayApp && typeof window.GrowDayApp.refreshHarvestData === "function") {
        await window.GrowDayApp.refreshHarvestData();
      }
    } catch (error) {
      State.setState({
        loading: false,
        error: Utils.generateDisplayError(error)
      });
    }
  }

  function getPayloadFromForm(form) {
    const formData = new FormData(form);

    return {
      plantingId: String(formData.get("plantingId") || "").trim(),
      harvestDate: String(formData.get("harvestDate") || "").trim(),
      yieldAmount: Number(formData.get("yieldAmount")),
      yieldUnit: String(formData.get("yieldUnit") || defaultSettings.defaultYieldUnit || "kg").trim(),
      harvestType: "full",
      note: String(formData.get("note") || "").trim()
    };
  }

  function validatePayload(payload) {
    if (!payload.plantingId) {
      return "กรุณาเลือกรายการปลูก";
    }

    if (!payload.harvestDate) {
      return "กรุณาระบุวันที่เก็บเกี่ยว";
    }

    if (!Utils.validatePositiveNumber(payload.yieldAmount)) {
      return "กรุณาระบุปริมาณผลผลิตให้ถูกต้อง";
    }

    return "";
  }

  function getReadyPlantings(state) {
    const apiReady = Array.isArray(state.readyPlantings) ? state.readyPlantings : [];
    const source = apiReady.length ? apiReady : state.plantings || [];

    return source
      .filter(function (planting) {
        return Utils.getPlantingStatus(planting) === "ready";
      })
      .sort(function (a, b) {
        return String(a.expectedHarvestDate || "").localeCompare(String(b.expectedHarvestDate || ""));
      });
  }

  function getRecentHarvests(state) {
    const logs = Array.isArray(state.harvestLogs) ? state.harvestLogs : [];

    if (logs.length) {
      return logs
        .slice()
        .sort(function (a, b) {
          return String(b.harvestDate || b.createdAt || "").localeCompare(String(a.harvestDate || a.createdAt || ""));
        })
        .slice(0, 3);
    }

    return (state.plantings || [])
      .filter(function (planting) {
        return Utils.getPlantingStatus(planting) === "harvested";
      })
      .sort(function (a, b) {
        return String(b.actualHarvestDate || b.updatedAt || "").localeCompare(String(a.actualHarvestDate || a.updatedAt || ""));
      })
      .slice(0, 3);
  }

  function getTodayInputValue() {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  }

  function showFormError(message) {
    const error = document.getElementById("harvest-form-error");

    if (!error) {
      return;
    }

    error.textContent = message;
    error.classList.remove("hidden");
  }

  function hideFormError() {
    const error = document.getElementById("harvest-form-error");

    if (!error) {
      return;
    }

    error.textContent = "";
    error.classList.add("hidden");
  }

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  window.GrowDayHarvestForm = {
    renderHarvestForm,
    selectPlanting
  };
})();
