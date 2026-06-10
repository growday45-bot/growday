/*
  รวม helper function ทั่วไป เช่น จัดรูปแบบวันที่ คำนวณวันคงเหลือ และแสดงข้อความสถานะ
  ห้ามใส่ logic เฉพาะหน้าที่ยาวเกินจำเป็นในไฟล์นี้
*/

(function () {
  const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
  const MS_PER_DAY = 24 * 60 * 60 * 1000;

  function parseDateOnly(dateString) {
    if (!DATE_PATTERN.test(String(dateString || ""))) {
      return null;
    }

    const parts = dateString.split("-").map(Number);
    const date = new Date(parts[0], parts[1] - 1, parts[2]);

    if (
      date.getFullYear() !== parts[0] ||
      date.getMonth() !== parts[1] - 1 ||
      date.getDate() !== parts[2]
    ) {
      return null;
    }

    return date;
  }

  function toDateInputValue(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  }

  function formatDateForDisplay(dateString) {
    const date = parseDateOnly(dateString);

    if (!date) {
      return "-";
    }

    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();

    return `${day}/${month}/${year}`;
  }

  function formatDateForInput(dateString) {
    const date = parseDateOnly(dateString);

    return date ? toDateInputValue(date) : "";
  }

  function addDays(dateString, days) {
    const date = parseDateOnly(dateString);
    const amount = Number(days);

    if (!date || !Number.isFinite(amount)) {
      return "";
    }

    date.setDate(date.getDate() + amount);

    return toDateInputValue(date);
  }

  function calculateDaysRemaining(expectedHarvestDate) {
    const harvestDate = parseDateOnly(expectedHarvestDate);

    if (!harvestDate) {
      return null;
    }

    const today = new Date();
    const todayOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());

    return Math.round((harvestDate.getTime() - todayOnly.getTime()) / MS_PER_DAY);
  }

  function getPlantingStatus(planting) {
    if (!planting) {
      return "growing";
    }

    if (planting.status === "cancelled") {
      return "cancelled";
    }

    if (
      planting.status === "harvested" ||
      (planting.actualHarvestDate && Number(planting.actualYield) > 0)
    ) {
      return "harvested";
    }

    const daysRemaining = calculateDaysRemaining(planting.expectedHarvestDate);

    if (daysRemaining !== null && daysRemaining <= 0) {
      return "ready";
    }

    return "growing";
  }

  function getStatusLabel(status, daysRemaining) {
    if (status === "harvested") {
      return "เก็บแล้ว";
    }

    if (status === "cancelled") {
      return "ยกเลิก";
    }

    if (status === "ready") {
      if (daysRemaining < 0) {
        return `เลยกำหนด ${Math.abs(daysRemaining)} วัน`;
      }

      return "พร้อมเก็บวันนี้";
    }

    if (Number.isFinite(daysRemaining) && daysRemaining > 0) {
      return `เหลือ ${daysRemaining} วัน`;
    }

    return "กำลังปลูก";
  }

  function getStatusChipClass(status, daysRemaining) {
    if (status === "harvested") {
      return "bg-gray-100 text-gray-700 border-gray-200";
    }

    if (status === "cancelled") {
      return "bg-red-50 text-red-700 border-red-100";
    }

    if (status === "ready" || (Number.isFinite(daysRemaining) && daysRemaining <= 0)) {
      return "bg-yellow-50 text-yellow-800 border-yellow-100";
    }

    return "bg-green-50 text-green-800 border-green-100";
  }

  function formatNumber(value) {
    const number = Number(value);

    if (!Number.isFinite(number)) {
      return "0";
    }

    return new Intl.NumberFormat("th-TH", {
      maximumFractionDigits: 2
    }).format(number);
  }

  function formatKg(value) {
    return `${formatNumber(value)} กก.`;
  }

  function validatePositiveNumber(value) {
    const number = Number(value);

    return Number.isFinite(number) && number > 0;
  }

  function generateDisplayError(error) {
    if (!error) {
      return "เกิดข้อผิดพลาด กรุณาลองใหม่";
    }

    if (typeof error === "string") {
      return error;
    }

    if (error.message) {
      return error.message;
    }

    return "ไม่สามารถดำเนินการได้ กรุณาลองใหม่";
  }

  window.GrowDayUtils = {
    formatDateForDisplay,
    formatDateForInput,
    addDays,
    calculateDaysRemaining,
    getPlantingStatus,
    getStatusLabel,
    getStatusChipClass,
    formatNumber,
    formatKg,
    validatePositiveNumber,
    generateDisplayError
  };
})();
