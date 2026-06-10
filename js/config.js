/*
  เก็บค่าตั้งต้นของ Frontend เช่น Google Apps Script Web App URL
  ห้ามเขียน WEB_APP_URL ซ้ำในหลายไฟล์ ให้แก้จากไฟล์นี้จุดเดียว
*/

window.GrowDayConfig = {
  // วาง URL จาก Google Apps Script Web App ตรงนี้เท่านั้น
  // ตัวอย่างรูปแบบ: https://script.google.com/macros/s/DEPLOYMENT_ID/exec
  // ถ้าย้าย deployment หรือ deploy ใหม่ ให้แก้เฉพาะค่านี้ ไม่ต้องแก้ไฟล์อื่น
  WEB_APP_URL: "https://script.google.com/macros/s/AKfycbwIEsYnufvAk0XwItIPW-jeb7bZd7cM0ODya0bHS1HB22lh90-xjuO_vF7tD69QMqBIbA/exec",
  APP_VERSION: "1.0.0",
  DEFAULT_SETTINGS: {
    defaultUnitType: "slot",
    defaultUnitLabel: "ช่องปลูก",
    defaultYieldUnit: "kg",
    defaultYieldUnitLabel: "กก."
  }
};
