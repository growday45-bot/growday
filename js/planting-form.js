/*
  จัดการฟอร์มบันทึกการปลูก
  รับชนิดผัก จำนวน วันที่ปลูก และแสดงวันที่คาดว่าเก็บเกี่ยวอัตโนมัติ
*/

(function () {
  const State = window.GrowDayState;
  const Api = window.GrowDayApi;
  const Utils = window.GrowDayUtils;
  const Config = window.GrowDayConfig || {};
  const defaultSettings = Config.DEFAULT_SETTINGS || {};
  let listenersBound = false;

  function renderPlantingForm(state) {
    const container = document.getElementById("view-planting");

    if (!container) {
      return;
    }

    const crops = getActiveCrops(state.crops || []);
    const isLoading = Boolean(state.loading);

    container.innerHTML = `
      <section class="space-y-4">
        <div class="rounded-2xl bg-green-700 p-5 text-white shadow-sm">
          <p class="text-sm font-medium text-green-100">ปลูก</p>
          <h2 class="mt-1 text-2xl font-bold">บันทึกการปลูก</h2>
          <p class="mt-2 text-sm text-green-50">วันที่ปลูกคือวันที่ย้ายต้นกล้าลงรางหรือช่องปลูกจริง</p>
        </div>

        <form id="planting-form" class="space-y-4 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm" novalidate>
          <div id="planting-form-error" class="hidden rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-medium text-red-700"></div>

          <div>
            <label for="planting-crop-id" class="text-sm font-semibold text-gray-800">ชนิดผัก</label>
            <select
              id="planting-crop-id"
              name="cropId"
              class="mt-2 min-h-12 w-full rounded-2xl border border-gray-200 bg-white px-4 text-base text-gray-900"
              ${isLoading ? "disabled" : ""}
            >
              <option value="">เลือกชนิดผัก</option>
              ${crops.map(function (crop) {
                return `<option value="${escapeHtml(crop.cropId)}">${escapeHtml(crop.cropName)}${crop.thaiName ? " - " + escapeHtml(crop.thaiName) : ""}</option>`;
              }).join("")}
            </select>
            ${crops.length ? "" : '<p class="mt-2 text-sm text-yellow-700">ยังไม่มีรายชื่อผัก กรุณาตรวจสอบการเชื่อมต่อข้อมูล</p>'}
          </div>

          <div class="grid grid-cols-1 gap-4">
            <div>
              <label for="planting-quantity" class="text-sm font-semibold text-gray-800">จำนวนที่ปลูก</label>
              <input
                id="planting-quantity"
                name="quantity"
                type="number"
                inputmode="decimal"
                min="0"
                step="1"
                placeholder="เช่น 120"
                class="mt-2 min-h-12 w-full rounded-2xl border border-gray-200 bg-white px-4 text-base text-gray-900"
                ${isLoading ? "disabled" : ""}
              >
            </div>

            <div>
              <label for="planting-unit-type" class="text-sm font-semibold text-gray-800">หน่วยปลูก</label>
              <select
                id="planting-unit-type"
                name="unitType"
                class="mt-2 min-h-12 w-full rounded-2xl border border-gray-200 bg-white px-4 text-base text-gray-900"
                ${isLoading ? "disabled" : ""}
              >
                <option value="slot">ช่องปลูก</option>
                <option value="plant">ต้น</option>
              </select>
            </div>
          </div>

          <div>
            <label for="planting-planted-date" class="text-sm font-semibold text-gray-800">วันที่ปลูก</label>
            <input
              id="planting-planted-date"
              name="plantedDate"
              type="date"
              class="mt-2 min-h-12 w-full rounded-2xl border border-gray-200 bg-white px-4 text-base text-gray-900"
              ${isLoading ? "disabled" : ""}
            >
            <p class="mt-2 text-xs text-gray-500">หมายถึงวันที่ย้ายต้นกล้าลงราง/ช่องปลูกไฮโดรโปนิกส์</p>
          </div>

          <div class="rounded-2xl border border-green-100 bg-green-50 p-4">
            <p class="text-sm font-semibold text-green-800">ข้อมูลคำนวณอัตโนมัติ</p>
            <dl class="mt-3 grid grid-cols-1 gap-3 text-sm">
              <div class="flex items-center justify-between gap-3">
                <dt class="text-gray-600">อายุเก็บเกี่ยว</dt>
                <dd id="planting-harvest-age" class="font-semibold text-gray-900">-</dd>
              </div>
              <div class="flex items-center justify-between gap-3">
                <dt class="text-gray-600">คาดว่าเก็บเกี่ยวได้</dt>
                <dd id="planting-expected-date" class="font-semibold text-green-900">-</dd>
              </div>
            </dl>
          </div>

          <div>
            <label for="planting-note" class="text-sm font-semibold text-gray-800">หมายเหตุ</label>
            <textarea
              id="planting-note"
              name="note"
              rows="3"
              maxlength="200"
              placeholder="เช่น ราง A หรือแหล่งต้นกล้า"
              class="mt-2 w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-base text-gray-900"
              ${isLoading ? "disabled" : ""}
            ></textarea>
          </div>

          <div class="grid grid-cols-1 gap-3">
            <button
              type="submit"
              class="min-h-12 rounded-2xl bg-green-700 px-4 text-base font-semibold text-white disabled:bg-gray-300"
              ${isLoading || !crops.length ? "disabled" : ""}
            >
              ${isLoading ? "กำลังบันทึก..." : "บันทึกการปลูก"}
            </button>
            <button
              type="reset"
              class="min-h-12 rounded-2xl border border-gray-200 bg-white px-4 text-base font-semibold text-gray-700"
              ${isLoading ? "disabled" : ""}
            >
              ล้างข้อมูล
            </button>
          </div>
        </form>
      </section>
    `;

    bindPlantingFormEvents();
    setDefaultUnit();
  }

  function bindPlantingFormEvents() {
    if (listenersBound) {
      return;
    }

    listenersBound = true;

    document.addEventListener("input", function (event) {
      if (event.target.closest("#planting-form")) {
        updateExpectedHarvestPreview();
      }
    });

    document.addEventListener("change", function (event) {
      if (event.target.closest("#planting-form")) {
        updateExpectedHarvestPreview();
      }
    });

    document.addEventListener("reset", function (event) {
      if (event.target.id === "planting-form") {
        window.setTimeout(function () {
          hideFormError();
          setDefaultUnit();
          updateExpectedHarvestPreview();
        }, 0);
      }
    });

    document.addEventListener("submit", function (event) {
      if (event.target.id === "planting-form") {
        event.preventDefault();
        handleSubmit(event.target);
      }
    });
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
      await Api.createPlanting(payload);
      form.reset();
      setDefaultUnit();
      updateExpectedHarvestPreview();

      if (window.GrowDayApp && typeof window.GrowDayApp.showToast === "function") {
        window.GrowDayApp.showToast("บันทึกการปลูกเรียบร้อยแล้ว");
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

  function getPayloadFromForm(form) {
    const formData = new FormData(form);

    return {
      cropId: String(formData.get("cropId") || "").trim(),
      unitType: String(formData.get("unitType") || defaultSettings.defaultUnitType || "slot").trim(),
      quantity: Number(formData.get("quantity")),
      plantedDate: String(formData.get("plantedDate") || "").trim(),
      note: String(formData.get("note") || "").trim()
    };
  }

  function validatePayload(payload) {
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

  function updateExpectedHarvestPreview() {
    const cropSelect = document.getElementById("planting-crop-id");
    const dateInput = document.getElementById("planting-planted-date");
    const harvestAge = document.getElementById("planting-harvest-age");
    const expectedDate = document.getElementById("planting-expected-date");

    if (!cropSelect || !dateInput || !harvestAge || !expectedDate) {
      return;
    }

    const crop = findCropById(cropSelect.value);
    const age = crop ? Number(crop.harvestAgeDays) : 0;

    harvestAge.textContent = age > 0 ? `${Utils.formatNumber(age)} วัน` : "-";

    if (crop && dateInput.value && age > 0) {
      expectedDate.textContent = Utils.formatDateForDisplay(Utils.addDays(dateInput.value, age));
      return;
    }

    expectedDate.textContent = "-";
  }

  function findCropById(cropId) {
    const state = State.getState();

    return (state.crops || []).find(function (crop) {
      return crop.cropId === cropId;
    });
  }

  function getActiveCrops(crops) {
    return crops.filter(function (crop) {
      return crop.isActive === true || String(crop.isActive).toUpperCase() === "TRUE";
    });
  }

  function setDefaultUnit() {
    const unitSelect = document.getElementById("planting-unit-type");

    if (unitSelect) {
      unitSelect.value = defaultSettings.defaultUnitType || "slot";
    }
  }

  function showFormError(message) {
    const error = document.getElementById("planting-form-error");

    if (!error) {
      return;
    }

    error.textContent = message;
    error.classList.remove("hidden");
  }

  function hideFormError() {
    const error = document.getElementById("planting-form-error");

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

  window.GrowDayPlantingForm = {
    renderPlantingForm
  };
})();
