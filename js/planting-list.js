/*
  จัดการหน้ารายการปลูก
  แสดงรายการ ค้นหา กรองสถานะ แก้ไข และยกเลิกรายการปลูก
*/

(function () {
  const State = window.GrowDayState;
  const Api = window.GrowDayApi;
  const Utils = window.GrowDayUtils;
  let searchText = "";
  let selectedStatus = "all";
  let editingId = "";
  let listenersBound = false;

  function renderPlantingList(state) {
    const container = document.getElementById("view-records");

    if (!container) {
      return;
    }

    const plantings = Array.isArray(state.plantings) ? state.plantings : [];
    const crops = Array.isArray(state.crops) ? state.crops : [];
    const normalized = plantings.map(function (planting) {
      return enrichPlanting(planting, crops);
    });
    const filtered = getFilteredPlantings(normalized);
    const editingPlanting = normalized.find(function (planting) {
      return planting.id === editingId;
    });
    const readyCount = normalized.filter(function (planting) {
      return planting.displayStatus === "ready";
    }).length;

    container.innerHTML = `
      <section class="space-y-4">
        <div class="rounded-2xl bg-green-700 p-5 text-white shadow-sm">
          <p class="text-sm font-medium text-green-100">รายการปลูก</p>
          <h2 class="mt-1 text-2xl font-bold">ติดตามรอบปลูก</h2>
          <p class="mt-2 text-sm text-green-50">ค้นหา กรอง และดูสถานะการปลูกทั้งหมด</p>
        </div>

        <section class="space-y-3 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
          <label for="planting-search" class="text-sm font-semibold text-gray-800">ค้นหาชื่อผัก</label>
          <input
            id="planting-search"
            type="search"
            value="${escapeHtml(searchText)}"
            placeholder="เช่น Green Cos หรือ กรีนคอส"
            class="min-h-12 w-full rounded-2xl border border-gray-200 bg-white px-4 text-base text-gray-900"
          >
          ${renderFilterChips()}
        </section>

        <section class="grid grid-cols-2 gap-3">
          <article class="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
            <p class="text-xs font-medium text-gray-500">จำนวนทั้งหมด</p>
            <strong class="mt-2 block text-2xl font-bold text-green-800">${Utils.formatNumber(normalized.length)}</strong>
          </article>
          <article class="rounded-2xl border border-yellow-100 bg-yellow-50 p-4 shadow-sm">
            <p class="text-xs font-medium text-yellow-800">พร้อมเก็บ</p>
            <strong class="mt-2 block text-2xl font-bold text-yellow-900">${Utils.formatNumber(readyCount)}</strong>
          </article>
        </section>

        ${editingPlanting ? renderEditForm(editingPlanting, crops, state.loading) : ""}

        <section class="space-y-3">
          ${filtered.length ? filtered.map(renderPlantingCard).join("") : renderEmptyState(plantings.length)}
        </section>
      </section>
    `;

    bindPlantingListEvents();
  }

  function renderFilterChips() {
    const filters = [
      { value: "all", label: "ทั้งหมด" },
      { value: "growing", label: "กำลังปลูก" },
      { value: "ready", label: "พร้อมเก็บ" },
      { value: "harvested", label: "เก็บแล้ว" },
      { value: "cancelled", label: "ยกเลิก" }
    ];

    return `
      <div class="flex gap-2 overflow-x-auto pb-1">
        ${filters.map(function (filter) {
          const active = selectedStatus === filter.value;
          const className = active
            ? "border-green-700 bg-green-700 text-white"
            : "border-gray-200 bg-white text-gray-700";

          return `
            <button
              type="button"
              class="planting-filter-chip min-h-11 shrink-0 rounded-full border px-4 text-sm font-semibold ${className}"
              data-filter-status="${filter.value}"
            >
              ${filter.label}
            </button>
          `;
        }).join("")}
      </div>
    `;
  }

  function renderPlantingCard(planting) {
    const chipClass = Utils.getStatusChipClass(planting.displayStatus, planting.daysRemaining);
    const statusLabel = Utils.getStatusLabel(planting.displayStatus, planting.daysRemaining);
    const showHarvestButton = planting.displayStatus !== "harvested" && planting.displayStatus !== "cancelled";
    const harvestButtonClass = planting.displayStatus === "ready"
      ? "bg-green-700 text-white"
      : "border border-green-200 bg-green-50 text-green-800";

    return `
      <article class="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
        <div class="flex items-start justify-between gap-3">
          <div>
            <h3 class="text-lg font-bold text-gray-900">${escapeHtml(planting.cropName || "-")}</h3>
            ${planting.thaiName ? `<p class="text-sm text-gray-500">${escapeHtml(planting.thaiName)}</p>` : ""}
          </div>
          <span class="shrink-0 rounded-full border px-2 py-1 text-xs font-semibold ${chipClass}">
            ${statusLabel}
          </span>
        </div>

        <dl class="mt-4 grid grid-cols-1 gap-3 text-sm">
          <div class="flex justify-between gap-3">
            <dt class="text-gray-500">วันที่ปลูก</dt>
            <dd class="font-semibold text-gray-900">${Utils.formatDateForDisplay(planting.plantedDate)}</dd>
          </div>
          <div class="flex justify-between gap-3">
            <dt class="text-gray-500">คาดว่าเก็บเกี่ยว</dt>
            <dd class="font-semibold text-gray-900">${Utils.formatDateForDisplay(planting.expectedHarvestDate)}</dd>
          </div>
          <div class="flex justify-between gap-3">
            <dt class="text-gray-500">จำนวนที่ปลูก</dt>
            <dd class="font-semibold text-gray-900">${Utils.formatNumber(planting.quantity)} ${escapeHtml(planting.unitLabel || "ช่องปลูก")}</dd>
          </div>
          <div class="flex justify-between gap-3">
            <dt class="text-gray-500">ผลผลิตจริง</dt>
            <dd class="font-semibold text-gray-900">${planting.displayStatus === "harvested" && planting.actualYield ? Utils.formatKg(planting.actualYield) : "-"}</dd>
          </div>
        </dl>

        <div class="mt-4 grid grid-cols-2 gap-3">
          <button
            type="button"
            class="min-h-12 rounded-2xl border border-gray-200 bg-white px-3 text-sm font-semibold text-gray-700"
            data-edit-planting-id="${escapeHtml(planting.id || "")}"
          >
            แก้ไข
          </button>
          ${showHarvestButton ? `
            <button
              type="button"
              class="min-h-12 rounded-2xl px-3 text-sm font-semibold ${harvestButtonClass}"
              data-harvest-planting-id="${escapeHtml(planting.id || "")}"
              data-target-view="harvest"
            >
              เก็บเกี่ยว
            </button>
          ` : `
            <button
              type="button"
              class="min-h-12 rounded-2xl bg-gray-100 px-3 text-sm font-semibold text-gray-500"
              disabled
            >
              เก็บเกี่ยว
            </button>
          `}
        </div>
      </article>
    `;
  }

  function renderEditForm(planting, crops, isLoading) {
    const activeCrops = ensureCurrentCropOption(getActiveCrops(crops), planting, crops);
    const isHarvested = planting.displayStatus === "harvested";
    const selectedCrop = crops.find(function (crop) {
      return crop.cropId === planting.cropId;
    }) || {};
    const harvestAgeDays = Number(selectedCrop.harvestAgeDays || planting.harvestAgeDays || 0);
    const expectedHarvestDate = harvestAgeDays > 0
      ? Utils.addDays(planting.plantedDate, harvestAgeDays)
      : planting.expectedHarvestDate;

    return `
      <section class="rounded-2xl border border-green-100 bg-white p-4 shadow-sm">
        <div class="flex items-start justify-between gap-3">
          <div>
            <p class="text-sm font-medium text-green-700">แก้ไขรายการปลูก</p>
            <h3 class="mt-1 text-lg font-bold text-gray-900">${escapeHtml(planting.cropName || "-")}</h3>
          </div>
          <button
            type="button"
            class="min-h-10 rounded-2xl border border-gray-200 px-3 text-sm font-semibold text-gray-600"
            data-cancel-edit-planting="true"
          >
            ปิด
          </button>
        </div>

        ${isHarvested ? `
          <p class="mt-3 rounded-2xl border border-yellow-100 bg-yellow-50 px-4 py-3 text-sm text-yellow-800">
            รายการนี้เก็บเกี่ยวแล้ว จึงแก้ไขได้เฉพาะหมายเหตุเพื่อป้องกันข้อมูลผลผลิตคลาดเคลื่อน
          </p>
        ` : ""}

        <form id="edit-planting-form" class="mt-4 space-y-4" novalidate>
          <input type="hidden" name="id" value="${escapeHtml(planting.id || "")}">
          <div id="edit-planting-error" class="hidden rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-medium text-red-700"></div>

          <div>
            <label for="edit-crop-id" class="text-sm font-semibold text-gray-800">ชนิดผัก</label>
            <select
              id="edit-crop-id"
              name="cropId"
              class="mt-2 min-h-12 w-full rounded-2xl border border-gray-200 bg-white px-4 text-base text-gray-900 disabled:bg-gray-100 disabled:text-gray-500"
              ${isLoading || isHarvested ? "disabled" : ""}
            >
              ${activeCrops.map(function (crop) {
                const selected = crop.cropId === planting.cropId ? "selected" : "";
                return `<option value="${escapeHtml(crop.cropId)}" ${selected}>${escapeHtml(crop.cropName)}${crop.thaiName ? " - " + escapeHtml(crop.thaiName) : ""}</option>`;
              }).join("")}
            </select>
          </div>

          <div>
            <label for="edit-quantity" class="text-sm font-semibold text-gray-800">จำนวนที่ปลูก</label>
            <input
              id="edit-quantity"
              name="quantity"
              type="number"
              inputmode="decimal"
              min="0"
              step="1"
              value="${escapeHtml(planting.quantity || "")}"
              class="mt-2 min-h-12 w-full rounded-2xl border border-gray-200 bg-white px-4 text-base text-gray-900 disabled:bg-gray-100 disabled:text-gray-500"
              ${isLoading || isHarvested ? "disabled" : ""}
            >
          </div>

          <div>
            <label for="edit-planted-date" class="text-sm font-semibold text-gray-800">วันที่ปลูก</label>
            <input
              id="edit-planted-date"
              name="plantedDate"
              type="date"
              value="${escapeHtml(Utils.formatDateForInput(planting.plantedDate))}"
              class="mt-2 min-h-12 w-full rounded-2xl border border-gray-200 bg-white px-4 text-base text-gray-900 disabled:bg-gray-100 disabled:text-gray-500"
              ${isLoading || isHarvested ? "disabled" : ""}
            >
          </div>

          <div class="rounded-2xl border border-green-100 bg-green-50 p-4">
            <p class="text-sm font-semibold text-green-800">ข้อมูลคำนวณใหม่</p>
            <dl class="mt-3 grid grid-cols-1 gap-3 text-sm">
              <div class="flex items-center justify-between gap-3">
                <dt class="text-gray-600">อายุเก็บเกี่ยว</dt>
                <dd id="edit-harvest-age" class="font-semibold text-gray-900">${harvestAgeDays > 0 ? Utils.formatNumber(harvestAgeDays) + " วัน" : "-"}</dd>
              </div>
              <div class="flex items-center justify-between gap-3">
                <dt class="text-gray-600">คาดว่าเก็บเกี่ยวได้</dt>
                <dd id="edit-expected-date" class="font-semibold text-green-900">${expectedHarvestDate ? Utils.formatDateForDisplay(expectedHarvestDate) : "-"}</dd>
              </div>
            </dl>
          </div>

          <div>
            <label for="edit-note" class="text-sm font-semibold text-gray-800">หมายเหตุ</label>
            <textarea
              id="edit-note"
              name="note"
              rows="3"
              maxlength="200"
              class="mt-2 w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-base text-gray-900"
              ${isLoading ? "disabled" : ""}
            >${escapeHtml(planting.note || "")}</textarea>
          </div>

          <div class="grid grid-cols-1 gap-3">
            <button
              type="submit"
              class="min-h-12 rounded-2xl bg-green-700 px-4 text-base font-semibold text-white disabled:bg-gray-300"
              ${isLoading ? "disabled" : ""}
            >
              ${isLoading ? "กำลังบันทึก..." : "บันทึกการแก้ไข"}
            </button>
          </div>
        </form>
      </section>
    `;
  }

  function renderEmptyState(hasPlantings) {
    const message = hasPlantings
      ? "ไม่พบรายการปลูกตามเงื่อนไขที่เลือก"
      : "ยังไม่มีรายการปลูก เริ่มจากการบันทึกการปลูกครั้งแรก";

    return `
      <div class="rounded-2xl border border-dashed border-gray-300 bg-white p-5 text-center">
        <h3 class="text-base font-bold text-gray-900">${message}</h3>
        <button
          type="button"
          class="mt-4 min-h-12 rounded-2xl bg-green-700 px-4 text-sm font-semibold text-white"
          data-target-view="planting"
        >
          บันทึกการปลูก
        </button>
      </div>
    `;
  }

  function bindPlantingListEvents() {
    if (listenersBound) {
      return;
    }

    listenersBound = true;

    document.addEventListener("input", function (event) {
      if (event.target.id === "planting-search") {
        searchText = event.target.value;
        renderPlantingList(State.getState());
        return;
      }

      if (event.target.closest("#edit-planting-form")) {
        updateEditExpectedPreview();
      }
    });

    document.addEventListener("change", function (event) {
      if (event.target.closest("#edit-planting-form")) {
        updateEditExpectedPreview();
      }
    });

    document.addEventListener("submit", function (event) {
      if (event.target.id === "edit-planting-form") {
        event.preventDefault();
        handleEditSubmit(event.target);
      }
    });

    document.addEventListener("click", function (event) {
      const filterButton = event.target.closest("[data-filter-status]");

      if (filterButton) {
        selectedStatus = filterButton.dataset.filterStatus;
        renderPlantingList(State.getState());
        return;
      }

      const editButton = event.target.closest("[data-edit-planting-id]");

      if (editButton) {
        editingId = editButton.dataset.editPlantingId;
        renderPlantingList(State.getState());
        return;
      }

      const cancelEditButton = event.target.closest("[data-cancel-edit-planting]");

      if (cancelEditButton) {
        editingId = "";
        renderPlantingList(State.getState());
      }
    });
  }

  async function handleEditSubmit(form) {
    hideEditError();

    const state = State.getState();
    const planting = (state.plantings || []).find(function (item) {
      return item.id === editingId;
    });

    if (!planting) {
      showEditError("ไม่พบรายการปลูกที่ต้องการแก้ไข");
      return;
    }

    const payload = getEditPayload(form, planting);
    const validationError = validateEditPayload(payload, Utils.getPlantingStatus(planting));

    if (validationError) {
      showEditError(validationError);
      return;
    }

    State.setState({
      loading: true,
      error: ""
    });

    try {
      await Api.updatePlanting(payload);
      editingId = "";

      if (window.GrowDayApp && typeof window.GrowDayApp.showToast === "function") {
        window.GrowDayApp.showToast("แก้ไขรายการปลูกเรียบร้อยแล้ว");
      }

      if (window.GrowDayApp && typeof window.GrowDayApp.refreshData === "function") {
        await window.GrowDayApp.refreshData("plantings");
      }
    } catch (error) {
      State.setState({
        loading: false,
        error: Utils.generateDisplayError(error)
      });
    }
  }

  function getEditPayload(form, planting) {
    const formData = new FormData(form);
    const status = Utils.getPlantingStatus(planting);
    const basePayload = {
      id: String(formData.get("id") || "").trim(),
      note: String(formData.get("note") || "").trim()
    };

    if (status === "harvested") {
      return basePayload;
    }

    return {
      ...basePayload,
      cropId: String(formData.get("cropId") || "").trim(),
      quantity: Number(formData.get("quantity")),
      plantedDate: String(formData.get("plantedDate") || "").trim()
    };
  }

  function validateEditPayload(payload, status) {
    if (!payload.id) {
      return "ไม่พบรหัสรายการปลูก";
    }

    if (status === "harvested") {
      return "";
    }

    if (!payload.cropId) {
      return "กรุณาเลือกชนิดผัก";
    }

    if (!Utils.validatePositiveNumber(payload.quantity)) {
      return "กรุณาระบุจำนวนที่ปลูกให้ถูกต้อง";
    }

    if (!payload.plantedDate) {
      return "กรุณาระบุวันที่ปลูก";
    }

    return "";
  }

  function updateEditExpectedPreview() {
    const form = document.getElementById("edit-planting-form");
    const cropSelect = document.getElementById("edit-crop-id");
    const dateInput = document.getElementById("edit-planted-date");
    const harvestAge = document.getElementById("edit-harvest-age");
    const expectedDate = document.getElementById("edit-expected-date");

    if (!form || !cropSelect || !dateInput || !harvestAge || !expectedDate) {
      return;
    }

    const state = State.getState();
    const crop = (state.crops || []).find(function (item) {
      return item.cropId === cropSelect.value;
    });
    const age = crop ? Number(crop.harvestAgeDays) : 0;

    harvestAge.textContent = age > 0 ? `${Utils.formatNumber(age)} วัน` : "-";
    expectedDate.textContent = age > 0 && dateInput.value
      ? Utils.formatDateForDisplay(Utils.addDays(dateInput.value, age))
      : "-";
  }

  function showEditError(message) {
    const error = document.getElementById("edit-planting-error");

    if (!error) {
      return;
    }

    error.textContent = message;
    error.classList.remove("hidden");
  }

  function hideEditError() {
    const error = document.getElementById("edit-planting-error");

    if (!error) {
      return;
    }

    error.textContent = "";
    error.classList.add("hidden");
  }

  function getFilteredPlantings(plantings) {
    const query = searchText.trim().toLowerCase();

    return plantings
      .filter(function (planting) {
        const matchesStatus = selectedStatus === "all" || planting.displayStatus === selectedStatus;
        const searchValue = `${planting.cropName || ""} ${planting.thaiName || ""}`.toLowerCase();
        const matchesSearch = !query || searchValue.includes(query);

        return matchesStatus && matchesSearch;
      })
      .sort(function (a, b) {
        if (a.displayStatus === "harvested" && b.displayStatus !== "harvested") {
          return 1;
        }

        if (a.displayStatus !== "harvested" && b.displayStatus === "harvested") {
          return -1;
        }

        return String(a.expectedHarvestDate || "").localeCompare(String(b.expectedHarvestDate || ""));
      });
  }

  function enrichPlanting(planting, crops) {
    const crop = crops.find(function (item) {
      return item.cropId === planting.cropId;
    }) || {};
    const daysRemaining = Number.isFinite(Number(planting.daysRemaining))
      ? Number(planting.daysRemaining)
      : Utils.calculateDaysRemaining(planting.expectedHarvestDate);
    const displayStatus = Utils.getPlantingStatus(planting);

    return {
      ...planting,
      thaiName: planting.thaiName || crop.thaiName || "",
      daysRemaining,
      displayStatus
    };
  }

  function getActiveCrops(crops) {
    return crops.filter(function (crop) {
      return crop.isActive === true || String(crop.isActive).toUpperCase() === "TRUE";
    });
  }

  function ensureCurrentCropOption(activeCrops, planting, crops) {
    const hasCurrentCrop = activeCrops.some(function (crop) {
      return crop.cropId === planting.cropId;
    });

    if (hasCurrentCrop) {
      return activeCrops;
    }

    const currentCrop = crops.find(function (crop) {
      return crop.cropId === planting.cropId;
    });

    return currentCrop ? activeCrops.concat(currentCrop) : activeCrops;
  }

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  window.GrowDayPlantingList = {
    renderPlantingList
  };
})();
