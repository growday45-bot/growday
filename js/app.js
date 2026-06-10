/*
  App controller ของ GrowDay
  เริ่มแอพ โหลดข้อมูล ควบคุม navigation และ render view หลักทั้งหมด
*/

(function () {
  const State = window.GrowDayState;
  const Api = window.GrowDayApi;
  const Utils = window.GrowDayUtils;
  const Config = window.GrowDayConfig || {};
  const Dashboard = window.GrowDayDashboard;
  const PlantingForm = window.GrowDayPlantingForm;
  const PlantingList = window.GrowDayPlantingList;
  const HarvestForm = window.GrowDayHarvestForm;
  const Summary = window.GrowDaySummary;
  let toastTimer = null;

  document.addEventListener("DOMContentLoaded", init);

  function init() {
    bindNavigation();
    State.subscribe(renderApp);
    navigateTo("dashboard", { skipRefresh: true });
    renderApp(State.getState());
    refreshData("initial");
  }

  async function refreshData(scope = "initial") {
    if (!isApiConfigured()) {
      State.setState({
        loading: false,
        error: "ยังไม่ได้ตั้งค่า Google Apps Script Web App URL กรุณาใส่ค่า WEB_APP_URL ในไฟล์ js/config.js"
      });
      return;
    }

    State.setState({
      loading: true,
      error: ""
    });

    try {
      const data = await fetchDataByScope(scope);
      State.setState({
        ...data,
        loading: false,
        error: ""
      });
    } catch (error) {
      State.setState({
        loading: false,
        error: Utils.generateDisplayError(error)
      });
    }
  }

  async function fetchDataByScope(scope) {
    if (scope === "harvest") {
      const results = await Promise.all([
        Api.getPlantings(),
        Api.getHarvestLogs(),
        Api.getDashboardSummary(),
        Api.getReadyPlantings()
      ]);

      return {
        plantings: results[0] || [],
        harvestLogs: results[1] || [],
        dashboardSummary: results[2] || {},
        readyPlantings: results[3] || []
      };
    }

    if (scope === "plantings") {
      const results = await Promise.all([
        Api.getPlantings(),
        Api.getDashboardSummary(),
        Api.getReadyPlantings()
      ]);

      return {
        plantings: results[0] || [],
        dashboardSummary: results[1] || {},
        readyPlantings: results[2] || []
      };
    }

    if (scope === "readyPlantings") {
      const readyPlantings = await Api.getReadyPlantings();

      return {
        readyPlantings: readyPlantings || []
      };
    }

    const initialData = await Api.getInitialData();

    return {
      crops: initialData.crops || [],
      plantings: initialData.plantings || [],
      readyPlantings: initialData.readyPlantings || [],
      harvestLogs: initialData.harvestLogs || [],
      dashboardSummary: initialData.dashboardSummary || {}
    };
  }

  function navigateTo(tabName, options = {}) {
    const normalizedTab = normalizeTabName(tabName);

    State.setState({
      currentTab: normalizedTab,
      error: ""
    });

    if (!options.skipRefresh && normalizedTab === "harvest") {
      refreshData("readyPlantings");
    }
  }

  function normalizeTabName(tabName) {
    const allowedTabs = ["dashboard", "records", "planting", "harvest", "summary"];

    return allowedTabs.includes(tabName) ? tabName : "dashboard";
  }

  function bindNavigation() {
    document.addEventListener("click", function (event) {
      const button = event.target.closest("[data-target-view]");

      if (!button) {
        return;
      }

      if (button.dataset.harvestPlantingId && HarvestForm && typeof HarvestForm.selectPlanting === "function") {
        HarvestForm.selectPlanting(button.dataset.harvestPlantingId);
      }

      navigateTo(button.dataset.targetView);
    });
  }

  function renderApp(state) {
    renderLoading(state.loading);
    renderError(state.error);
    renderCurrentTab(state.currentTab);
    renderViews(state);
  }

  function renderViews(state) {
    if (Dashboard && typeof Dashboard.renderDashboard === "function") {
      Dashboard.renderDashboard(state);
    }

    if (PlantingForm && typeof PlantingForm.renderPlantingForm === "function") {
      PlantingForm.renderPlantingForm(state);
    }

    if (PlantingList && typeof PlantingList.renderPlantingList === "function") {
      PlantingList.renderPlantingList(state);
    }

    if (HarvestForm && typeof HarvestForm.renderHarvestForm === "function") {
      HarvestForm.renderHarvestForm(state);
    }

    if (Summary && typeof Summary.renderSummary === "function") {
      Summary.renderSummary(state);
    }
  }

  function renderCurrentTab(currentTab) {
    document.querySelectorAll("[data-view]").forEach(function (section) {
      section.classList.toggle("hidden", section.dataset.view !== currentTab);
    });

    document.querySelectorAll(".nav-button").forEach(function (button) {
      const target = button.dataset.targetView;
      const isPlantingArea = target === "records" && currentTab === "planting";
      const isActive = target === currentTab || isPlantingArea;

      button.classList.toggle("bg-green-700", isActive);
      button.classList.toggle("bg-green-50", !isActive);
      button.classList.toggle("text-white", isActive);
      button.classList.toggle("text-green-800", !isActive);

      if (isActive) {
        button.setAttribute("aria-current", "page");
      } else {
        button.removeAttribute("aria-current");
      }
    });
  }

  function renderLoading(isLoading) {
    const loading = document.getElementById("loading-state");

    if (loading) {
      loading.classList.toggle("hidden", !isLoading);
    }
  }

  function renderError(message) {
    const error = document.getElementById("error-message");

    if (!error) {
      return;
    }

    error.textContent = message || "";
    error.classList.toggle("hidden", !message);
  }

  function showToast(message) {
    const toast = document.getElementById("toast-message");

    if (!toast) {
      return;
    }

    window.clearTimeout(toastTimer);
    toast.textContent = message || "บันทึกข้อมูลเรียบร้อยแล้ว";
    toast.classList.remove("hidden");

    toastTimer = window.setTimeout(function () {
      toast.classList.add("hidden");
    }, 2500);
  }

  function isApiConfigured() {
    return Boolean(String(Config.WEB_APP_URL || "").trim());
  }

  // Alias เดิมคงไว้เพื่อให้โมดูลฟอร์มเรียกใช้งานต่อได้
  function loadInitialData() {
    return refreshData("initial");
  }

  function loadReadyPlantings() {
    return refreshData("readyPlantings");
  }

  function refreshHarvestData() {
    return refreshData("harvest");
  }

  window.GrowDayApp = {
    init,
    refreshData,
    navigateTo,
    loadInitialData,
    loadReadyPlantings,
    refreshHarvestData,
    showToast
  };
})();
