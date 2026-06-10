/*
  GrowDay Google Apps Script API
  ใช้ Google Sheets เป็นฐานข้อมูล และคืนค่า JSON ตาม docs/API_SPEC.md

  วิธี seed ข้อมูลตอน deploy ครั้งแรก:
  1. Deploy เป็น Web App ให้เรียบร้อย
  2. เรียก POST ไปที่ Web App URL ด้วย body:
     {"action":"seedInitialData","payload":{}}
  3. ฟังก์ชันนี้จะสร้างชีต/header/ข้อมูลตั้งต้นโดยไม่ลบข้อมูลเดิม
*/

var APP_NAME = "GrowDay";
var APP_VERSION = "1.0.0";

var SHEETS = {
  PLANTINGS: "Plantings",
  CROPS: "Crops",
  HARVEST_LOGS: "HarvestLogs",
  SETTINGS: "Settings"
};

var HEADERS = {
  Plantings: [
    "id", "cropId", "cropName", "unitType", "unitLabel", "quantity",
    "plantedDate", "harvestAgeDays", "expectedHarvestDate", "daysRemaining",
    "status", "actualHarvestDate", "actualYield", "yieldUnit", "note",
    "createdAt", "updatedAt"
  ],
  Crops: [
    "cropId", "cropName", "thaiName", "harvestAgeDays", "defaultUnitType",
    "defaultUnitLabel", "expectedYieldPerSlotKg", "isActive", "sortOrder",
    "note", "createdAt", "updatedAt"
  ],
  HarvestLogs: [
    "harvestId", "plantingId", "cropId", "cropName", "harvestDate",
    "yieldAmount", "yieldUnit", "harvestType", "note", "createdAt", "updatedAt"
  ],
  Settings: [
    "key", "value", "description", "updatedAt"
  ]
};

var DEFAULT_CROPS = [
  ["green_cos", "Green Cos", "กรีนคอส", 25, "slot", "ช่องปลูก", 0.10, true, 1, "ผักสลัดยอดนิยม"],
  ["mini_cos", "Mini Cos", "มินิคอส", 25, "slot", "ช่องปลูก", 0.09, true, 2, ""],
  ["green_oak", "Green Oak", "กรีนโอ๊ค", 28, "slot", "ช่องปลูก", 0.09, true, 3, ""],
  ["red_oak", "Red Oak", "เรดโอ๊ค", 28, "slot", "ช่องปลูก", 0.08, true, 4, ""],
  ["finlay", "Finlay", "ฟินเลย์", 28, "slot", "ช่องปลูก", 0.09, true, 5, ""],
  ["green_coral", "Green Coral", "กรีนคอรัล", 28, "slot", "ช่องปลูก", 0.09, true, 6, ""],
  ["red_coral", "Red Coral", "เรดคอรัล", 28, "slot", "ช่องปลูก", 0.08, true, 7, ""],
  ["butterhead", "Butterhead", "บัตเตอร์เฮด", 30, "slot", "ช่องปลูก", 0.10, true, 8, ""],
  ["kale", "Kale", "เคล", 35, "slot", "ช่องปลูก", 0.08, true, 9, ""],
  ["rocket", "Rocket", "ร็อกเก็ต", 25, "slot", "ช่องปลูก", 0.05, true, 10, ""]
];

var DEFAULT_SETTINGS = [
  ["appName", "GrowDay", "ชื่อระบบ"],
  ["groupName", "กลุ่มต่อยอดถุงทองผักสด", "ชื่อกลุ่มผู้ใช้งาน"],
  ["defaultUnitType", "slot", "หน่วยปลูกเริ่มต้น"],
  ["defaultYieldUnit", "kg", "หน่วยผลผลิตเริ่มต้น"]
];

function doGet(e) {
  var action = e && e.parameter ? e.parameter.action : "";

  try {
    switch (action) {
      case "ping":
        return jsonResponse(success("ping", "GrowDay API is running", getPingData()));
      case "getInitialData":
        return jsonResponse(success("getInitialData", "OK", getInitialData()));
      case "getCrops":
        return jsonResponse(success("getCrops", "OK", getCrops(e.parameter || {})));
      case "getPlantings":
        return jsonResponse(success("getPlantings", "OK", getPlantings(e.parameter || {})));
      case "getPlantingById":
        return jsonResponse(success("getPlantingById", "OK", getPlantingById(e.parameter.id)));
      case "getDashboardSummary":
        return jsonResponse(success("getDashboardSummary", "OK", getDashboardSummary()));
      case "getReadyPlantings":
        return jsonResponse(success("getReadyPlantings", "OK", getReadyPlantings()));
      case "getHarvestLogs":
        return jsonResponse(success("getHarvestLogs", "OK", getHarvestLogs(e.parameter || {})));
      default:
        return jsonResponse(fail(action || "", "ไม่พบคำสั่ง API", "INVALID_ACTION", "Unknown GET action"));
    }
  } catch (err) {
    return jsonResponse(handleError(action || "", err));
  }
}

function doPost(e) {
  var body = {};

  try {
    body = JSON.parse(e.postData && e.postData.contents ? e.postData.contents : "{}");
  } catch (err) {
    return jsonResponse(fail("", "รูปแบบข้อมูลไม่ถูกต้อง", "VALIDATION_ERROR", String(err)));
  }

  var action = body.action || "";
  var payload = body.payload || {};

  try {
    switch (action) {
      case "createPlanting":
        return jsonResponse(success("createPlanting", "บันทึกการปลูกเรียบร้อยแล้ว", createPlanting(payload)));
      case "updatePlanting":
        return jsonResponse(success("updatePlanting", "แก้ไขรายการปลูกเรียบร้อยแล้ว", updatePlanting(payload)));
      case "recordHarvest":
        return jsonResponse(success("recordHarvest", "บันทึกผลผลิตเรียบร้อยแล้ว", recordHarvest(payload)));
      case "cancelPlanting":
        return jsonResponse(success("cancelPlanting", "ยกเลิกรายการปลูกเรียบร้อยแล้ว", cancelPlanting(payload)));
      case "seedInitialData":
        return jsonResponse(success("seedInitialData", "สร้างข้อมูลเริ่มต้นเรียบร้อยแล้ว", seedInitialData(payload)));
      default:
        return jsonResponse(fail(action || "", "ไม่พบคำสั่ง API", "INVALID_ACTION", "Unknown POST action"));
    }
  } catch (err) {
    return jsonResponse(handleError(action || "", err));
  }
}

function getPingData() {
  return {
    appName: APP_NAME,
    version: APP_VERSION,
    timestamp: nowIso()
  };
}

function getInitialData() {
  return {
    crops: getCrops({ activeOnly: "true" }),
    plantings: getPlantings({}),
    readyPlantings: getReadyPlantings(),
    harvestLogs: getHarvestLogs({}),
    dashboardSummary: getDashboardSummary(),
    settings: getSettingsObject()
  };
}

function getCrops(params) {
  var crops = readSheetObjects(SHEETS.CROPS);
  var activeOnly = String(params.activeOnly || "").toLowerCase() === "true";

  crops = crops.map(normalizeCrop);

  if (activeOnly) {
    crops = crops.filter(function (crop) {
      return crop.isActive === true;
    });
  }

  return crops.sort(function (a, b) {
    return Number(a.sortOrder || 0) - Number(b.sortOrder || 0);
  });
}

function getPlantings(params) {
  var plantings = readSheetObjects(SHEETS.PLANTINGS).map(normalizePlantingForApi);

  if (params.status) {
    plantings = plantings.filter(function (item) {
      return item.status === params.status;
    });
  }

  if (params.cropId) {
    plantings = plantings.filter(function (item) {
      return item.cropId === params.cropId;
    });
  }

  if (params.fromDate) {
    plantings = plantings.filter(function (item) {
      return item.plantedDate >= params.fromDate;
    });
  }

  if (params.toDate) {
    plantings = plantings.filter(function (item) {
      return item.plantedDate <= params.toDate;
    });
  }

  plantings.sort(function (a, b) {
    return String(b.createdAt || "").localeCompare(String(a.createdAt || ""));
  });

  if (params.limit && Number(params.limit) > 0) {
    plantings = plantings.slice(0, Number(params.limit));
  }

  return plantings;
}

function getPlantingById(id) {
  if (!id) {
    throw appError("กรุณาระบุรหัสรายการปลูก", "VALIDATION_ERROR", "id is required");
  }

  var planting = findObjectByField(SHEETS.PLANTINGS, "id", id);

  if (!planting) {
    throw appError("ไม่พบรายการปลูก", "NOT_FOUND", "Planting id not found");
  }

  return normalizePlantingForApi(planting);
}

function getDashboardSummary() {
  var plantings = getPlantings({});
  var harvestLogs = getHarvestLogs({});
  var today = todayString();
  var currentMonth = today.slice(0, 7);
  var activePlantingCount = 0;
  var readyTodayCount = 0;
  var readyIn7DaysCount = 0;

  plantings.forEach(function (item) {
    if (item.status === "growing" || item.status === "ready") {
      activePlantingCount += 1;
    }

    if (item.status !== "harvested" && item.status !== "cancelled") {
      if (item.daysRemaining === 0) {
        readyTodayCount += 1;
      }

      if (item.daysRemaining >= 0 && item.daysRemaining <= 7) {
        readyIn7DaysCount += 1;
      }
    }
  });

  var monthlyYieldKg = harvestLogs.reduce(function (sum, log) {
    if (String(log.harvestDate || "").slice(0, 7) === currentMonth) {
      return sum + Number(log.yieldAmount || 0);
    }
    return sum;
  }, 0);

  var nearHarvest = plantings
    .filter(function (item) {
      return item.status === "growing" || item.status === "ready";
    })
    .sort(function (a, b) {
      return Number(a.daysRemaining) - Number(b.daysRemaining);
    })
    .slice(0, 5)
    .map(function (item) {
      return pickFields(item, ["id", "cropName", "plantedDate", "expectedHarvestDate", "daysRemaining", "status"]);
    });

  var recentPlantings = plantings
    .slice()
    .sort(function (a, b) {
      return String(b.createdAt || "").localeCompare(String(a.createdAt || ""));
    })
    .slice(0, 3)
    .map(function (item) {
      return pickFields(item, ["id", "cropName", "plantedDate", "expectedHarvestDate", "status"]);
    });

  return {
    activePlantingCount: activePlantingCount,
    readyTodayCount: readyTodayCount,
    readyIn7DaysCount: readyIn7DaysCount,
    monthlyYieldKg: monthlyYieldKg,
    nearHarvest: nearHarvest,
    recentPlantings: recentPlantings
  };
}

function getReadyPlantings() {
  return getPlantings({}).filter(function (item) {
    return item.status === "ready";
  });
}

function getHarvestLogs(params) {
  var logs = readSheetObjects(SHEETS.HARVEST_LOGS).map(normalizeHarvestLog);

  if (params.fromDate) {
    logs = logs.filter(function (item) {
      return item.harvestDate >= params.fromDate;
    });
  }

  if (params.toDate) {
    logs = logs.filter(function (item) {
      return item.harvestDate <= params.toDate;
    });
  }

  if (params.cropId) {
    logs = logs.filter(function (item) {
      return item.cropId === params.cropId;
    });
  }

  if (params.plantingId) {
    logs = logs.filter(function (item) {
      return item.plantingId === params.plantingId;
    });
  }

  return logs.sort(function (a, b) {
    return String(b.harvestDate || b.createdAt || "").localeCompare(String(a.harvestDate || a.createdAt || ""));
  });
}

function createPlanting(payload) {
  validateCreatePlanting(payload);

  var crop = findCropOrThrow(payload.cropId);
  var now = nowIso();
  var harvestAgeDays = Number(crop.harvestAgeDays);
  var expectedHarvestDate = addDays(payload.plantedDate, harvestAgeDays);
  var daysRemaining = calculateDaysRemaining(expectedHarvestDate);
  var status = daysRemaining <= 0 ? "ready" : "growing";
  var unitType = payload.unitType || crop.defaultUnitType || "slot";

  var planting = {
    id: generateId(SHEETS.PLANTINGS, "PLT"),
    cropId: crop.cropId,
    cropName: crop.cropName,
    unitType: unitType,
    unitLabel: getUnitLabel(unitType, crop),
    quantity: Number(payload.quantity),
    plantedDate: payload.plantedDate,
    harvestAgeDays: harvestAgeDays,
    expectedHarvestDate: expectedHarvestDate,
    daysRemaining: daysRemaining,
    status: status,
    actualHarvestDate: "",
    actualYield: "",
    yieldUnit: "kg",
    note: payload.note || "",
    createdAt: now,
    updatedAt: now
  };

  appendObject(SHEETS.PLANTINGS, planting);
  return normalizePlantingForApi(planting);
}

function updatePlanting(payload) {
  if (!payload.id) {
    throw appError("กรุณาระบุรหัสรายการปลูก", "VALIDATION_ERROR", "id is required");
  }

  var rowInfo = findRowByField(SHEETS.PLANTINGS, "id", payload.id);

  if (!rowInfo) {
    throw appError("ไม่พบรายการปลูก", "NOT_FOUND", "Planting id not found");
  }

  var planting = rowInfo.object;

  if (payload.cropId !== undefined && payload.cropId !== "") {
    var crop = findCropOrThrow(payload.cropId);
    planting.cropId = crop.cropId;
    planting.cropName = crop.cropName;
    planting.harvestAgeDays = Number(crop.harvestAgeDays);
    planting.unitLabel = getUnitLabel(planting.unitType || crop.defaultUnitType || "slot", crop);
  }

  if (payload.unitType !== undefined && payload.unitType !== "") {
    planting.unitType = payload.unitType;
    planting.unitLabel = getUnitLabel(payload.unitType, findCropOrThrow(planting.cropId));
  }

  if (payload.quantity !== undefined && payload.quantity !== "") {
    if (!isPositiveNumber(payload.quantity)) {
      throw appError("กรุณาระบุจำนวนที่ปลูกให้ถูกต้อง", "VALIDATION_ERROR", "quantity must be positive");
    }
    planting.quantity = Number(payload.quantity);
  }

  if (payload.plantedDate !== undefined && payload.plantedDate !== "") {
    if (!isValidDateString(payload.plantedDate)) {
      throw appError("กรุณาระบุวันที่ปลูกให้ถูกต้อง", "VALIDATION_ERROR", "plantedDate must be YYYY-MM-DD");
    }
    planting.plantedDate = payload.plantedDate;
  }

  if (payload.note !== undefined) {
    planting.note = payload.note || "";
  }

  if (payload.status !== undefined && payload.status !== "") {
    validateStatus(payload.status);
    planting.status = payload.status;
  }

  var currentStatus = String(planting.status || "");
  var isHarvested = currentStatus === "harvested" || Boolean(planting.actualHarvestDate);
  var isCancelled = currentStatus === "cancelled";

  if (!isHarvested && !isCancelled) {
    planting.expectedHarvestDate = addDays(planting.plantedDate, Number(planting.harvestAgeDays));
    planting.daysRemaining = calculateDaysRemaining(planting.expectedHarvestDate);
    planting.status = planting.daysRemaining <= 0 ? "ready" : "growing";
  }

  planting.updatedAt = nowIso();
  updateObjectAtRow(SHEETS.PLANTINGS, rowInfo.rowNumber, planting);

  return normalizePlantingForApi(planting);
}

function recordHarvest(payload) {
  validateRecordHarvest(payload);

  var rowInfo = findRowByField(SHEETS.PLANTINGS, "id", payload.plantingId);

  if (!rowInfo) {
    throw appError("ไม่พบรายการปลูก", "NOT_FOUND", "Planting id not found");
  }

  var planting = normalizePlantingForApi(rowInfo.object);

  if (planting.status === "cancelled") {
    throw appError("รายการนี้ถูกยกเลิกแล้ว", "VALIDATION_ERROR", "Cannot harvest cancelled planting");
  }

  var now = nowIso();
  var harvestLog = {
    harvestId: generateId(SHEETS.HARVEST_LOGS, "HVT"),
    plantingId: planting.id,
    cropId: planting.cropId,
    cropName: planting.cropName,
    harvestDate: payload.harvestDate,
    yieldAmount: Number(payload.yieldAmount),
    yieldUnit: payload.yieldUnit || "kg",
    harvestType: payload.harvestType || "full",
    note: payload.note || "",
    createdAt: now,
    updatedAt: now
  };

  appendObject(SHEETS.HARVEST_LOGS, harvestLog);

  planting.status = "harvested";
  planting.actualHarvestDate = payload.harvestDate;
  planting.actualYield = Number(payload.yieldAmount);
  planting.yieldUnit = payload.yieldUnit || "kg";
  planting.note = payload.note !== undefined && payload.note !== "" ? payload.note : planting.note;
  planting.updatedAt = now;
  updateObjectAtRow(SHEETS.PLANTINGS, rowInfo.rowNumber, planting);

  return {
    harvestLog: normalizeHarvestLog(harvestLog),
    planting: {
      id: planting.id,
      status: "harvested",
      actualHarvestDate: planting.actualHarvestDate,
      actualYield: planting.actualYield,
      yieldUnit: planting.yieldUnit,
      updatedAt: planting.updatedAt
    }
  };
}

function cancelPlanting(payload) {
  if (!payload.id) {
    throw appError("กรุณาระบุรหัสรายการปลูก", "VALIDATION_ERROR", "id is required");
  }

  var rowInfo = findRowByField(SHEETS.PLANTINGS, "id", payload.id);

  if (!rowInfo) {
    throw appError("ไม่พบรายการปลูก", "NOT_FOUND", "Planting id not found");
  }

  var planting = rowInfo.object;
  planting.status = "cancelled";
  planting.note = payload.note !== undefined ? payload.note : planting.note;
  planting.updatedAt = nowIso();

  updateObjectAtRow(SHEETS.PLANTINGS, rowInfo.rowNumber, planting);

  return {
    id: planting.id,
    status: "cancelled",
    note: planting.note || "",
    updatedAt: planting.updatedAt
  };
}

function seedInitialData() {
  var createdSheets = [];
  var seededCrops = 0;
  var seededSettings = 0;

  Object.keys(SHEETS).forEach(function (key) {
    var sheetName = SHEETS[key];
    var wasCreated = ensureSheetWithHeaders(sheetName);
    if (wasCreated) {
      createdSheets.push(sheetName);
    }
  });

  var cropRows = readSheetObjects(SHEETS.CROPS);
  if (!cropRows.length) {
    seededCrops = seedCrops();
  }

  seededSettings = seedMissingSettings();

  return {
    createdSheets: createdSheets,
    seededCrops: seededCrops,
    seededSettings: seededSettings
  };
}

function validateCreatePlanting(payload) {
  if (!payload.cropId) {
    throw appError("กรุณาเลือกชนิดผัก", "VALIDATION_ERROR", "cropId is required");
  }

  if (!isPositiveNumber(payload.quantity)) {
    throw appError("กรุณาระบุจำนวนที่ปลูกให้ถูกต้อง", "VALIDATION_ERROR", "quantity must be positive");
  }

  if (!isValidDateString(payload.plantedDate)) {
    throw appError("กรุณาระบุวันที่ปลูกให้ถูกต้อง", "VALIDATION_ERROR", "plantedDate must be YYYY-MM-DD");
  }
}

function validateRecordHarvest(payload) {
  if (!payload.plantingId) {
    throw appError("กรุณาเลือกรายการปลูก", "VALIDATION_ERROR", "plantingId is required");
  }

  if (!isValidDateString(payload.harvestDate)) {
    throw appError("กรุณาระบุวันที่เก็บเกี่ยว", "VALIDATION_ERROR", "harvestDate must be YYYY-MM-DD");
  }

  if (!isPositiveNumber(payload.yieldAmount)) {
    throw appError("กรุณาระบุปริมาณผลผลิตให้ถูกต้อง", "VALIDATION_ERROR", "yieldAmount must be positive");
  }
}

function validateStatus(status) {
  var allowed = ["growing", "ready", "harvested", "cancelled"];
  if (allowed.indexOf(status) === -1) {
    throw appError("สถานะรายการไม่ถูกต้อง", "VALIDATION_ERROR", "Invalid status");
  }
}

function findCropOrThrow(cropId) {
  var crop = findObjectByField(SHEETS.CROPS, "cropId", cropId);

  if (!crop) {
    throw appError("ไม่พบชนิดผักที่เลือก", "NOT_FOUND", "Crop not found");
  }

  return normalizeCrop(crop);
}

function normalizeCrop(crop) {
  return {
    cropId: crop.cropId || "",
    cropName: crop.cropName || "",
    thaiName: crop.thaiName || "",
    harvestAgeDays: Number(crop.harvestAgeDays || 0),
    defaultUnitType: crop.defaultUnitType || "slot",
    defaultUnitLabel: crop.defaultUnitLabel || "ช่องปลูก",
    expectedYieldPerSlotKg: Number(crop.expectedYieldPerSlotKg || 0),
    isActive: crop.isActive === true || String(crop.isActive).toUpperCase() === "TRUE",
    sortOrder: Number(crop.sortOrder || 0),
    note: crop.note || "",
    createdAt: crop.createdAt || "",
    updatedAt: crop.updatedAt || ""
  };
}

function normalizePlantingForApi(planting) {
  var item = {
    id: planting.id || "",
    cropId: planting.cropId || "",
    cropName: planting.cropName || "",
    unitType: planting.unitType || "slot",
    unitLabel: planting.unitLabel || "ช่องปลูก",
    quantity: Number(planting.quantity || 0),
    plantedDate: formatDateValue(planting.plantedDate),
    harvestAgeDays: Number(planting.harvestAgeDays || 0),
    expectedHarvestDate: formatDateValue(planting.expectedHarvestDate),
    daysRemaining: Number(planting.daysRemaining || 0),
    status: planting.status || "growing",
    actualHarvestDate: formatDateValue(planting.actualHarvestDate),
    actualYield: planting.actualYield === "" || planting.actualYield === undefined ? "" : Number(planting.actualYield),
    yieldUnit: planting.yieldUnit || "kg",
    note: planting.note || "",
    createdAt: planting.createdAt || "",
    updatedAt: planting.updatedAt || ""
  };

  item.daysRemaining = calculateDaysRemaining(item.expectedHarvestDate);

  if (item.status !== "harvested" && item.status !== "cancelled") {
    item.status = item.daysRemaining <= 0 ? "ready" : "growing";
  }

  if (item.actualHarvestDate && Number(item.actualYield) > 0) {
    item.status = "harvested";
  }

  return item;
}

function normalizeHarvestLog(log) {
  return {
    harvestId: log.harvestId || "",
    plantingId: log.plantingId || "",
    cropId: log.cropId || "",
    cropName: log.cropName || "",
    harvestDate: formatDateValue(log.harvestDate),
    yieldAmount: Number(log.yieldAmount || 0),
    yieldUnit: log.yieldUnit || "kg",
    harvestType: log.harvestType || "full",
    note: log.note || "",
    createdAt: log.createdAt || "",
    updatedAt: log.updatedAt || ""
  };
}

function getSettingsObject() {
  var settings = {};
  readSheetObjects(SHEETS.SETTINGS).forEach(function (row) {
    if (row.key) {
      settings[row.key] = row.value;
    }
  });

  return {
    appName: settings.appName || "GrowDay",
    groupName: settings.groupName || "กลุ่มต่อยอดถุงทองผักสด",
    defaultUnitType: settings.defaultUnitType || "slot",
    defaultYieldUnit: settings.defaultYieldUnit || "kg"
  };
}

function readSheetObjects(sheetName) {
  var sheet = getSheetOrThrow(sheetName);
  var values = sheet.getDataRange().getValues();

  if (values.length < 2) {
    return [];
  }

  var headers = values[0].map(function (header) {
    return String(header).trim();
  });

  return values.slice(1)
    .filter(function (row) {
      return row.some(function (cell) {
        return cell !== "";
      });
    })
    .map(function (row) {
      var obj = {};
      headers.forEach(function (header, index) {
        obj[header] = normalizeCellValue(row[index]);
      });
      return obj;
    });
}

function appendObject(sheetName, obj) {
  var sheet = getSheetOrThrow(sheetName);
  var headers = getHeaders(sheet);
  sheet.appendRow(objectToRow(obj, headers));
}

function updateObjectAtRow(sheetName, rowNumber, obj) {
  var sheet = getSheetOrThrow(sheetName);
  var headers = getHeaders(sheet);
  sheet.getRange(rowNumber, 1, 1, headers.length).setValues([objectToRow(obj, headers)]);
}

function objectToRow(obj, headers) {
  return headers.map(function (header) {
    return obj[header] !== undefined ? obj[header] : "";
  });
}

function findObjectByField(sheetName, fieldName, value) {
  var rowInfo = findRowByField(sheetName, fieldName, value);
  return rowInfo ? rowInfo.object : null;
}

function findRowByField(sheetName, fieldName, value) {
  var sheet = getSheetOrThrow(sheetName);
  var values = sheet.getDataRange().getValues();

  if (values.length < 2) {
    return null;
  }

  var headers = values[0].map(function (header) {
    return String(header).trim();
  });
  var fieldIndex = headers.indexOf(fieldName);

  if (fieldIndex === -1) {
    throw appError("ไม่พบ field ในชีต", "SERVER_ERROR", fieldName + " header not found");
  }

  for (var i = 1; i < values.length; i += 1) {
    if (String(values[i][fieldIndex]) === String(value)) {
      var obj = {};
      headers.forEach(function (header, index) {
        obj[header] = normalizeCellValue(values[i][index]);
      });
      return {
        rowNumber: i + 1,
        object: obj
      };
    }
  }

  return null;
}

function getSheetOrThrow(sheetName) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetName);

  if (!sheet) {
    throw appError("ไม่พบชีต " + sheetName, "SHEET_NOT_FOUND", sheetName + " not found");
  }

  return sheet;
}

function getHeaders(sheet) {
  var lastColumn = sheet.getLastColumn();

  if (lastColumn < 1) {
    throw appError("ไม่พบ header row", "SERVER_ERROR", "Header row missing");
  }

  return sheet.getRange(1, 1, 1, lastColumn).getValues()[0].map(function (header) {
    return String(header).trim();
  });
}

function ensureSheetWithHeaders(sheetName) {
  var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = spreadsheet.getSheetByName(sheetName);
  var created = false;

  if (!sheet) {
    sheet = spreadsheet.insertSheet(sheetName);
    created = true;
  }

  var headers = HEADERS[sheetName];
  if (!headers) {
    return created;
  }

  var hasAnyData = sheet.getLastRow() > 0 && sheet.getLastColumn() > 0;
  var currentHeaders = hasAnyData
    ? sheet.getRange(1, 1, 1, Math.max(sheet.getLastColumn(), headers.length)).getValues()[0]
    : [];
  var firstRowHasData = currentHeaders.some(function (cell) {
    return cell !== "";
  });
  var exactHeader = headers.every(function (header, index) {
    return String(currentHeaders[index] || "").trim() === header;
  });

  if (!firstRowHasData) {
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    return created;
  }

  if (exactHeader) {
    return created;
  }

  // ถ้าแถว 1 มีข้อมูลอยู่แล้วแต่ไม่ใช่ header ให้แทรก header ใหม่ด้านบนเพื่อไม่ทับข้อมูลเดิม
  sheet.insertRowBefore(1);
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);

  if (sheet.getLastColumn() > headers.length) {
    sheet.getRange(1, headers.length + 1, 1, sheet.getLastColumn() - headers.length).clearContent();
  }

  return created;
}

function seedCrops() {
  var now = nowIso();
  var sheet = getSheetOrThrow(SHEETS.CROPS);
  var rows = DEFAULT_CROPS.map(function (crop) {
    return crop.concat([now, now]);
  });

  if (rows.length) {
    sheet.getRange(2, 1, rows.length, HEADERS.Crops.length).setValues(rows);
  }

  return rows.length;
}

function seedMissingSettings() {
  var now = nowIso();
  var sheet = getSheetOrThrow(SHEETS.SETTINGS);
  var existingKeys = {};
  var rows = [];

  readSheetObjects(SHEETS.SETTINGS).forEach(function (setting) {
    if (setting.key) {
      existingKeys[setting.key] = true;
    }
  });

  DEFAULT_SETTINGS.forEach(function (setting) {
    if (!existingKeys[setting[0]]) {
      rows.push(setting.concat([now]));
    }
  });

  if (rows.length) {
    sheet.getRange(sheet.getLastRow() + 1, 1, rows.length, HEADERS.Settings.length).setValues(rows);
  }

  return rows.length;
}

function generateId(sheetName, prefix) {
  var datePart = todayString().replace(/-/g, "");
  var count = readSheetObjects(sheetName).length + 1;
  var id = "";

  do {
    id = prefix + "-" + datePart + "-" + String(count).padStart(4, "0");
    count += 1;
  } while (findObjectByField(sheetName, prefix === "PLT" ? "id" : "harvestId", id));

  return id;
}

function getUnitLabel(unitType, crop) {
  if (unitType === "plant") {
    return "ต้น";
  }
  if (unitType === "tray") {
    return "ถาด";
  }
  if (unitType === "row") {
    return "ราง";
  }
  return crop && crop.defaultUnitLabel ? crop.defaultUnitLabel : "ช่องปลูก";
}

function addDays(dateString, days) {
  var date = parseDateString(dateString);
  date.setDate(date.getDate() + Number(days));
  return formatDate(date);
}

function calculateDaysRemaining(dateString) {
  var target = parseDateString(dateString);
  var now = new Date();
  var today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  return Math.round((target.getTime() - today.getTime()) / (24 * 60 * 60 * 1000));
}

function parseDateString(dateString) {
  if (!isValidDateString(dateString)) {
    throw appError("รูปแบบวันที่ไม่ถูกต้อง", "VALIDATION_ERROR", "Date must be YYYY-MM-DD");
  }

  var parts = String(dateString).split("-").map(Number);
  return new Date(parts[0], parts[1] - 1, parts[2]);
}

function isValidDateString(dateString) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(String(dateString || ""))) {
    return false;
  }

  var parts = String(dateString).split("-").map(Number);
  var date = new Date(parts[0], parts[1] - 1, parts[2]);

  return date.getFullYear() === parts[0] &&
    date.getMonth() === parts[1] - 1 &&
    date.getDate() === parts[2];
}

function formatDate(date) {
  return Utilities.formatDate(date, Session.getScriptTimeZone(), "yyyy-MM-dd");
}

function formatDateValue(value) {
  if (!value) {
    return "";
  }

  if (Object.prototype.toString.call(value) === "[object Date]") {
    return formatDate(value);
  }

  var text = String(value);
  return isValidDateString(text) ? text : "";
}

function todayString() {
  return formatDate(new Date());
}

function nowIso() {
  return new Date().toISOString();
}

function normalizeCellValue(value) {
  if (Object.prototype.toString.call(value) === "[object Date]") {
    return formatDate(value);
  }
  return value;
}

function isPositiveNumber(value) {
  var number = Number(value);
  return isFinite(number) && number > 0;
}

function pickFields(obj, fields) {
  var picked = {};
  fields.forEach(function (field) {
    picked[field] = obj[field];
  });
  return picked;
}

function success(action, message, data) {
  return {
    success: true,
    action: action,
    message: message || "OK",
    data: data === undefined ? null : data
  };
}

function fail(action, message, code, details) {
  return {
    success: false,
    action: action,
    message: message || "เกิดข้อผิดพลาด",
    error: {
      code: code || "SERVER_ERROR",
      details: details || ""
    }
  };
}

function jsonResponse(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

function appError(message, code, details) {
  var err = new Error(message);
  err.code = code || "SERVER_ERROR";
  err.details = details || "";
  return err;
}

function handleError(action, err) {
  return fail(
    action,
    err.message || "เกิดข้อผิดพลาดภายในระบบ",
    err.code || "SERVER_ERROR",
    err.details || String(err)
  );
}
