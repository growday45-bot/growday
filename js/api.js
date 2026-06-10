/*
  รวมฟังก์ชันเรียก Google Apps Script API ของ GrowDay
  ทุก action และ response format ต้องยึดตาม docs/API_SPEC.md
*/

(function () {
  const CONFIG = window.GrowDayConfig || {};

  function getWebAppUrl() {
    const url = String(CONFIG.WEB_APP_URL || "").trim();

    if (!url) {
      throw new Error("ยังไม่ได้ตั้งค่า URL สำหรับเชื่อมต่อข้อมูล");
    }

    return url;
  }

  function buildUrl(action, params) {
    const url = new URL(getWebAppUrl());
    url.searchParams.set("action", action);

    Object.keys(params || {}).forEach(function (key) {
      const value = params[key];

      if (value !== undefined && value !== null && value !== "") {
        url.searchParams.set(key, value);
      }
    });

    return url.toString();
  }

  async function parseJsonResponse(response, action) {
    let json;

    try {
      json = await response.json();
    } catch (error) {
      throw new Error("ระบบตอบกลับข้อมูลไม่ถูกต้อง กรุณาลองใหม่");
    }

    if (!response.ok) {
      throw new Error(json.message || "เชื่อมต่อข้อมูลไม่สำเร็จ กรุณาลองใหม่");
    }

    if (!json.success) {
      throw new Error(json.message || getDefaultActionError(action));
    }

    return json.data;
  }

  function getDefaultActionError(action) {
    const messages = {
      ping: "เชื่อมต่อระบบไม่ได้ กรุณาลองใหม่",
      getInitialData: "โหลดข้อมูลเริ่มต้นไม่สำเร็จ",
      getCrops: "โหลดรายชื่อผักไม่สำเร็จ",
      getPlantings: "โหลดรายการปลูกไม่สำเร็จ",
      getDashboardSummary: "โหลดข้อมูลหน้าแรกไม่สำเร็จ",
      getReadyPlantings: "โหลดรายการพร้อมเก็บไม่สำเร็จ",
      getHarvestLogs: "โหลดประวัติเก็บเกี่ยวไม่สำเร็จ",
      createPlanting: "บันทึกการปลูกไม่สำเร็จ",
      updatePlanting: "แก้ไขรายการปลูกไม่สำเร็จ",
      recordHarvest: "บันทึกผลผลิตไม่สำเร็จ",
      cancelPlanting: "ยกเลิกรายการปลูกไม่สำเร็จ"
    };

    return messages[action] || "ดำเนินการไม่สำเร็จ กรุณาลองใหม่";
  }

  async function apiGet(action, params = {}) {
    try {
      const response = await fetch(buildUrl(action, params));

      return parseJsonResponse(response, action);
    } catch (error) {
      throw normalizeError(error, action);
    }
  }

  async function apiPost(action, payload = {}) {
    try {
      const response = await fetch(getWebAppUrl(), {
        method: "POST",
        body: JSON.stringify({
          action,
          payload
        })
      });

      return parseJsonResponse(response, action);
    } catch (error) {
      throw normalizeError(error, action);
    }
  }

  function normalizeError(error, action) {
    if (error && error.message) {
      return error;
    }

    return new Error(getDefaultActionError(action));
  }

  function pingApi() {
    return apiGet("ping");
  }

  function getInitialData() {
    return apiGet("getInitialData");
  }

  function getCrops() {
    return apiGet("getCrops", {
      activeOnly: "true"
    });
  }

  function getPlantings(filters = {}) {
    return apiGet("getPlantings", filters);
  }

  function getDashboardSummary() {
    return apiGet("getDashboardSummary");
  }

  function getReadyPlantings() {
    return apiGet("getReadyPlantings");
  }

  function getHarvestLogs(filters = {}) {
    return apiGet("getHarvestLogs", filters);
  }

  function createPlanting(payload) {
    return apiPost("createPlanting", payload);
  }

  function updatePlanting(payload) {
    return apiPost("updatePlanting", payload);
  }

  function recordHarvest(payload) {
    return apiPost("recordHarvest", payload);
  }

  function cancelPlanting(payload) {
    return apiPost("cancelPlanting", payload);
  }

  window.GrowDayApi = {
    apiGet,
    apiPost,
    pingApi,
    getInitialData,
    getCrops,
    getPlantings,
    getDashboardSummary,
    getReadyPlantings,
    getHarvestLogs,
    createPlanting,
    updatePlanting,
    recordHarvest,
    cancelPlanting
  };
})();
