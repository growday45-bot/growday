/*
  เก็บ state กลางของหน้าเว็บ เช่น crops, plantings, dashboardSummary
  ใช้ช่วยให้แต่ละ view อ่านข้อมูลชุดเดียวกันและ refresh ได้ง่าย
*/

(function () {
  const initialState = {
    crops: [],
    plantings: [],
    readyPlantings: [],
    harvestLogs: [],
    dashboardSummary: {
      activePlantingCount: 0,
      readyTodayCount: 0,
      readyIn7DaysCount: 0,
      monthlyYieldKg: 0,
      nearHarvest: [],
      recentPlantings: []
    },
    currentTab: "dashboard",
    loading: false,
    error: ""
  };

  let state = copyState(initialState);
  const listeners = new Set();

  function copyState(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function getState() {
    return copyState(state);
  }

  function setState(partialState) {
    state = {
      ...state,
      ...partialState
    };
    notify();
  }

  function subscribe(listener) {
    if (typeof listener !== "function") {
      return function unsubscribeNoop() {};
    }

    listeners.add(listener);

    return function unsubscribe() {
      listeners.delete(listener);
    };
  }

  function notify() {
    const snapshot = getState();

    listeners.forEach(function (listener) {
      listener(snapshot);
    });
  }

  function resetState() {
    state = copyState(initialState);
    notify();
  }

  window.GrowDayState = {
    getState,
    setState,
    subscribe,
    notify,
    resetState
  };
})();
