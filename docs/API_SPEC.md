# API_SPEC.md

เอกสารนี้กำหนดสเปก API สำหรับเว็บแอพ **GrowDay** ซึ่งใช้ **Google Apps Script Web App** เป็น Backend และใช้ **Google Sheets** เป็น Database

ไฟล์นี้ต้องใช้คู่กับ:

```txt
README.md
docs/APP_SPEC.md
docs/UI_FLOW.md
docs/DATA_SCHEMA.md
docs/DEVELOPMENT_RULES.md
```

> เป้าหมายของไฟล์นี้คือควบคุมให้ Frontend, Google Apps Script และ Google Sheets ใช้ชื่อ action, field, payload และ response ตรงกัน

---

## 1. ภาพรวม API

ระบบ GrowDay ใช้ Google Apps Script Web App เป็น API แบบง่าย โดยใช้ endpoint เดียว แล้วแยกคำสั่งด้วยค่า `action`

```txt
https://script.google.com/macros/s/{DEPLOYMENT_ID}/exec
```

ตัวอย่างการเรียกใช้งาน:

```txt
GET  {WEB_APP_URL}?action=getPlantings
POST {WEB_APP_URL}
```

---

## 2. หลักการออกแบบ API

API ของ GrowDay ต้องยึดหลักดังนี้

1. ใช้ endpoint เดียว
2. ใช้ `action` เป็นตัวแยกคำสั่ง
3. ส่งข้อมูลกลับเป็น JSON เท่านั้น
4. ใช้ field name ตาม `DATA_SCHEMA.md`
5. วันที่ใน API ต้องเป็นรูปแบบ `YYYY-MM-DD`
6. `createdAt` และ `updatedAt` สร้างโดย Apps Script
7. Frontend ไม่ควรสร้าง `id` เอง
8. Apps Script ต้องตรวจสอบข้อมูลก่อนบันทึก
9. ไม่ลบข้อมูลจริง ให้ใช้ `status = cancelled`
10. เมื่อเกิด error ต้องส่ง response กลับแบบมี `success: false`

---

## 3. HTTP Methods ที่ใช้

| Method | ใช้สำหรับ |
|---|---|
| `GET` | ดึงข้อมูล |
| `POST` | เพิ่ม/แก้ไข/บันทึกข้อมูล |

สำหรับ MVP ยังไม่จำเป็นต้องใช้ `PUT`, `PATCH`, หรือ `DELETE`

---

## 4. รูปแบบ Response มาตรฐาน

ทุก API ต้องตอบกลับในรูปแบบ JSON ตามโครงสร้างนี้

### Success Response

```json
{
  "success": true,
  "action": "getPlantings",
  "message": "OK",
  "data": {}
}
```

### Error Response

```json
{
  "success": false,
  "action": "createPlanting",
  "message": "กรุณาระบุจำนวนที่ปลูก",
  "error": {
    "code": "VALIDATION_ERROR",
    "details": "quantity is required"
  }
}
```

---

## 5. Error Code มาตรฐาน

| Code | ความหมาย | ใช้เมื่อ |
|---|---|---|
| `INVALID_ACTION` | ไม่พบ action ที่เรียก | action ไม่ถูกต้องหรือไม่ได้ส่งมา |
| `VALIDATION_ERROR` | ข้อมูลไม่ครบหรือไม่ถูกต้อง | ผู้ใช้กรอกข้อมูลไม่ครบ |
| `NOT_FOUND` | ไม่พบข้อมูล | ไม่พบ plantingId หรือ cropId |
| `DUPLICATE_DATA` | ข้อมูลซ้ำ | cropId ซ้ำ หรือ id ซ้ำ |
| `SHEET_NOT_FOUND` | ไม่พบชีต | Google Sheets ไม่มีชีตที่กำหนด |
| `SERVER_ERROR` | ข้อผิดพลาดภายในระบบ | Apps Script error |
| `PERMISSION_ERROR` | ไม่มีสิทธิ์เข้าถึง | สิทธิ์ Google Sheets หรือ Web App ไม่ถูกต้อง |

---

## 6. รายการ API Actions

### GET Actions

| Action | ใช้สำหรับ | MVP |
|---|---|---|
| `ping` | ทดสอบว่า API ใช้งานได้ | yes |
| `getInitialData` | โหลดข้อมูลเริ่มต้นทั้งหมด | yes |
| `getCrops` | ดึงรายชื่อผัก | yes |
| `getPlantings` | ดึงรายการปลูกทั้งหมด | yes |
| `getPlantingById` | ดึงรายการปลูกตาม id | optional |
| `getDashboardSummary` | ดึงข้อมูลสรุปหน้าแรก | yes |
| `getHarvestLogs` | ดึงประวัติเก็บเกี่ยว | optional |
| `getReadyPlantings` | ดึงรายการที่พร้อมเก็บเกี่ยว | yes |

### POST Actions

| Action | ใช้สำหรับ | MVP |
|---|---|---|
| `createPlanting` | บันทึกการปลูกใหม่ | yes |
| `updatePlanting` | แก้ไขรายการปลูก | yes |
| `recordHarvest` | บันทึกผลผลิตจริง | yes |
| `cancelPlanting` | ยกเลิกรายการปลูก | optional |
| `updateCrop` | แก้ไขข้อมูลชนิดผัก | optional |
| `seedInitialData` | สร้างข้อมูลตั้งต้นใน Google Sheets | optional แต่แนะนำ |

---

## 7. GET: ping

ใช้ทดสอบว่า Apps Script Web App ใช้งานได้

### Request

```txt
GET {WEB_APP_URL}?action=ping
```

### Response

```json
{
  "success": true,
  "action": "ping",
  "message": "GrowDay API is running",
  "data": {
    "appName": "GrowDay",
    "version": "1.0.0",
    "timestamp": "2026-06-09T08:30:00.000Z"
  }
}
```

---

## 8. GET: getInitialData

ใช้โหลดข้อมูลเริ่มต้นเมื่อเปิดแอพครั้งแรก

เหมาะกับ Frontend เพราะเรียกครั้งเดียวแล้วได้ข้อมูลที่ต้องใช้หลายส่วน

### Request

```txt
GET {WEB_APP_URL}?action=getInitialData
```

### Response

```json
{
  "success": true,
  "action": "getInitialData",
  "message": "OK",
  "data": {
    "crops": [],
    "plantings": [],
    "dashboardSummary": {
      "activePlantingCount": 0,
      "readyTodayCount": 0,
      "readyIn7DaysCount": 0,
      "monthlyYieldKg": 0
    },
    "settings": {
      "appName": "GrowDay",
      "groupName": "กลุ่มต่อยอดถุงทองผักสด",
      "defaultUnitType": "slot",
      "defaultYieldUnit": "kg"
    }
  }
}
```

### หมายเหตุ

แนะนำให้ Frontend เรียก `getInitialData` ตอนโหลดหน้าเว็บครั้งแรก เพื่อลดจำนวน request ไปยัง Google Apps Script

---

## 9. GET: getCrops

ใช้ดึงรายชื่อผักสำหรับ dropdown

### Request

```txt
GET {WEB_APP_URL}?action=getCrops
```

### Query Parameters

| Parameter | Required | Description | Example |
|---|---:|---|---|
| `activeOnly` | no | ถ้าเป็น `true` ให้ดึงเฉพาะผักที่เปิดใช้งาน | `true` |

### Request Example

```txt
GET {WEB_APP_URL}?action=getCrops&activeOnly=true
```

### Response

```json
{
  "success": true,
  "action": "getCrops",
  "message": "OK",
  "data": [
    {
      "cropId": "green_cos",
      "cropName": "Green Cos",
      "thaiName": "กรีนคอส",
      "harvestAgeDays": 25,
      "defaultUnitType": "slot",
      "defaultUnitLabel": "ช่องปลูก",
      "expectedYieldPerSlotKg": 0.1,
      "isActive": true,
      "sortOrder": 1,
      "note": "ผักสลัดยอดนิยม",
      "createdAt": "2026-06-09T08:00:00.000Z",
      "updatedAt": "2026-06-09T08:00:00.000Z"
    }
  ]
}
```

---

## 10. GET: getPlantings

ใช้ดึงรายการปลูกทั้งหมด หรือดึงตามเงื่อนไข

### Request

```txt
GET {WEB_APP_URL}?action=getPlantings
```

### Query Parameters

| Parameter | Required | Description | Example |
|---|---:|---|---|
| `status` | no | กรองตามสถานะ | `growing` |
| `cropId` | no | กรองตามชนิดผัก | `green_cos` |
| `fromDate` | no | วันที่ปลูกเริ่มต้น | `2026-06-01` |
| `toDate` | no | วันที่ปลูกสิ้นสุด | `2026-06-30` |
| `limit` | no | จำนวนรายการสูงสุด | `100` |

### Request Example

```txt
GET {WEB_APP_URL}?action=getPlantings&status=growing
```

### Response

```json
{
  "success": true,
  "action": "getPlantings",
  "message": "OK",
  "data": [
    {
      "id": "PLT-20260609-0001",
      "cropId": "green_cos",
      "cropName": "Green Cos",
      "unitType": "slot",
      "unitLabel": "ช่องปลูก",
      "quantity": 120,
      "plantedDate": "2026-06-05",
      "harvestAgeDays": 25,
      "expectedHarvestDate": "2026-06-30",
      "daysRemaining": 21,
      "status": "growing",
      "actualHarvestDate": "",
      "actualYield": "",
      "yieldUnit": "kg",
      "note": "ราง A",
      "createdAt": "2026-06-09T08:30:00.000Z",
      "updatedAt": "2026-06-09T08:30:00.000Z"
    }
  ]
}
```

### ข้อกำหนดสำคัญ

Apps Script ควรคำนวณหรือปรับสถานะล่าสุดก่อนส่งกลับ เช่น:

- ถ้าวันนี้ถึง `expectedHarvestDate` และยังไม่เก็บเกี่ยว ให้แสดงเป็น `ready`
- ถ้ามี `actualHarvestDate` และ `actualYield` ให้แสดงเป็น `harvested`

---

## 11. GET: getPlantingById

ใช้ดึงรายการปลูกตาม `id`

### Request

```txt
GET {WEB_APP_URL}?action=getPlantingById&id=PLT-20260609-0001
```

### Query Parameters

| Parameter | Required | Description |
|---|---:|---|
| `id` | yes | รหัสรายการปลูก |

### Response

```json
{
  "success": true,
  "action": "getPlantingById",
  "message": "OK",
  "data": {
    "id": "PLT-20260609-0001",
    "cropId": "green_cos",
    "cropName": "Green Cos",
    "unitType": "slot",
    "unitLabel": "ช่องปลูก",
    "quantity": 120,
    "plantedDate": "2026-06-05",
    "harvestAgeDays": 25,
    "expectedHarvestDate": "2026-06-30",
    "daysRemaining": 21,
    "status": "growing",
    "actualHarvestDate": "",
    "actualYield": "",
    "yieldUnit": "kg",
    "note": "ราง A",
    "createdAt": "2026-06-09T08:30:00.000Z",
    "updatedAt": "2026-06-09T08:30:00.000Z"
  }
}
```

### Not Found Response

```json
{
  "success": false,
  "action": "getPlantingById",
  "message": "ไม่พบรายการปลูก",
  "error": {
    "code": "NOT_FOUND",
    "details": "Planting id not found"
  }
}
```

---

## 12. GET: getDashboardSummary

ใช้ดึงข้อมูลสรุปหน้าแรก

### Request

```txt
GET {WEB_APP_URL}?action=getDashboardSummary
```

### Response

```json
{
  "success": true,
  "action": "getDashboardSummary",
  "message": "OK",
  "data": {
    "activePlantingCount": 24,
    "readyTodayCount": 3,
    "readyIn7DaysCount": 9,
    "monthlyYieldKg": 186,
    "nearHarvest": [
      {
        "id": "PLT-20260609-0001",
        "cropName": "Green Cos",
        "plantedDate": "2026-06-05",
        "expectedHarvestDate": "2026-06-30",
        "daysRemaining": 2,
        "status": "growing"
      }
    ],
    "recentPlantings": [
      {
        "id": "PLT-20260609-0002",
        "cropName": "Red Oak",
        "plantedDate": "2026-06-07",
        "expectedHarvestDate": "2026-07-05",
        "status": "growing"
      }
    ]
  }
}
```

### วิธีคำนวณ

| Field | วิธีคำนวณ |
|---|---|
| `activePlantingCount` | จำนวนรายการที่ `status = growing` |
| `readyTodayCount` | จำนวนรายการที่พร้อมเก็บวันนี้ |
| `readyIn7DaysCount` | จำนวนรายการที่เก็บเกี่ยวได้ภายใน 7 วัน |
| `monthlyYieldKg` | ผลรวม `yieldAmount` จาก `HarvestLogs` ของเดือนปัจจุบัน |
| `nearHarvest` | รายการที่ใกล้ถึงวันเก็บเกี่ยว เรียงจากใกล้ที่สุด |
| `recentPlantings` | รายการปลูกล่าสุด เรียงจาก createdAt ล่าสุด |

---

## 13. GET: getReadyPlantings

ใช้ดึงรายการที่พร้อมเก็บเกี่ยว สำหรับหน้าบันทึกเก็บเกี่ยว

### Request

```txt
GET {WEB_APP_URL}?action=getReadyPlantings
```

### Response

```json
{
  "success": true,
  "action": "getReadyPlantings",
  "message": "OK",
  "data": [
    {
      "id": "PLT-20260609-0003",
      "cropId": "mini_cos",
      "cropName": "Mini Cos",
      "unitType": "slot",
      "unitLabel": "ช่องปลูก",
      "quantity": 100,
      "plantedDate": "2026-05-15",
      "harvestAgeDays": 25,
      "expectedHarvestDate": "2026-06-09",
      "daysRemaining": 0,
      "status": "ready",
      "actualHarvestDate": "",
      "actualYield": "",
      "yieldUnit": "kg",
      "note": "",
      "createdAt": "2026-06-09T08:40:00.000Z",
      "updatedAt": "2026-06-09T08:40:00.000Z"
    }
  ]
}
```

### เงื่อนไข

ให้คืนรายการที่:

```txt
status = ready
```

หรือคำนวณแล้วพบว่า:

```txt
today >= expectedHarvestDate
และยังไม่มี actualHarvestDate
```

---

## 14. GET: getHarvestLogs

ใช้ดึงประวัติการเก็บเกี่ยว

### Request

```txt
GET {WEB_APP_URL}?action=getHarvestLogs
```

### Query Parameters

| Parameter | Required | Description | Example |
|---|---:|---|---|
| `fromDate` | no | วันที่เริ่มต้น | `2026-06-01` |
| `toDate` | no | วันที่สิ้นสุด | `2026-06-30` |
| `cropId` | no | กรองตามชนิดผัก | `green_cos` |
| `plantingId` | no | กรองตามรายการปลูก | `PLT-20260609-0001` |

### Response

```json
{
  "success": true,
  "action": "getHarvestLogs",
  "message": "OK",
  "data": [
    {
      "harvestId": "HVT-20260630-0001",
      "plantingId": "PLT-20260609-0001",
      "cropId": "green_cos",
      "cropName": "Green Cos",
      "harvestDate": "2026-06-30",
      "yieldAmount": 12.5,
      "yieldUnit": "kg",
      "harvestType": "full",
      "note": "ส่งลูกค้าประจำ",
      "createdAt": "2026-06-30T08:30:00.000Z",
      "updatedAt": "2026-06-30T08:30:00.000Z"
    }
  ]
}
```

---

# 15. POST Request มาตรฐาน

ทุก POST ให้ส่งข้อมูลแบบ JSON body

### Header

```txt
Content-Type: application/json
```

### Request Body Format

```json
{
  "action": "createPlanting",
  "payload": {}
}
```

### Apps Script หมายเหตุ

Google Apps Script บางกรณีอาจจัดการ CORS หรือ preflight ไม่สะดวก ถ้าใช้ `fetch()` จาก static hosting แล้วติดปัญหา CORS ให้ใช้วิธีส่งแบบ `text/plain` แต่ body ยังเป็น JSON string ได้

ตัวอย่าง:

```js
fetch(WEB_APP_URL, {
  method: "POST",
  body: JSON.stringify({
    action: "createPlanting",
    payload: data
  })
});
```

---

## 16. POST: createPlanting

ใช้บันทึกรายการปลูกใหม่

### Request

```txt
POST {WEB_APP_URL}
```

### Body

```json
{
  "action": "createPlanting",
  "payload": {
    "cropId": "green_cos",
    "unitType": "slot",
    "quantity": 120,
    "plantedDate": "2026-06-05",
    "note": "ราง A"
  }
}
```

### Field ที่ Frontend ต้องส่ง

| Field | Required | Description |
|---|---:|---|
| `cropId` | yes | รหัสชนิดผัก |
| `unitType` | no | ค่าเริ่มต้น `slot` |
| `quantity` | yes | จำนวนที่ปลูก |
| `plantedDate` | yes | วันที่ย้ายลงราง/ช่องปลูก |
| `note` | no | หมายเหตุ |

### Field ที่ Apps Script ต้องสร้างเอง

| Field | วิธีสร้าง |
|---|---|
| `id` | สร้างจาก `PLT-YYYYMMDD-XXXX` |
| `cropName` | ดึงจากชีต `Crops` |
| `unitLabel` | ดึงจากชีต `Crops` หรือ map จาก `unitType` |
| `harvestAgeDays` | ดึงจากชีต `Crops` |
| `expectedHarvestDate` | `plantedDate + harvestAgeDays` |
| `daysRemaining` | คำนวณจากวันนี้ |
| `status` | คำนวณจากวันเก็บเกี่ยว |
| `yieldUnit` | ค่าเริ่มต้น `kg` |
| `createdAt` | วันที่เวลาปัจจุบัน |
| `updatedAt` | วันที่เวลาปัจจุบัน |

### Response

```json
{
  "success": true,
  "action": "createPlanting",
  "message": "บันทึกการปลูกเรียบร้อยแล้ว",
  "data": {
    "id": "PLT-20260609-0001",
    "cropId": "green_cos",
    "cropName": "Green Cos",
    "unitType": "slot",
    "unitLabel": "ช่องปลูก",
    "quantity": 120,
    "plantedDate": "2026-06-05",
    "harvestAgeDays": 25,
    "expectedHarvestDate": "2026-06-30",
    "daysRemaining": 21,
    "status": "growing",
    "actualHarvestDate": "",
    "actualYield": "",
    "yieldUnit": "kg",
    "note": "ราง A",
    "createdAt": "2026-06-09T08:30:00.000Z",
    "updatedAt": "2026-06-09T08:30:00.000Z"
  }
}
```

### Validation

| Field | Rule | Error Message |
|---|---|---|
| `cropId` | ต้องมี | กรุณาเลือกชนิดผัก |
| `cropId` | ต้องพบใน `Crops` | ไม่พบชนิดผักที่เลือก |
| `quantity` | ต้องมากกว่า 0 | กรุณาระบุจำนวนที่ปลูกให้ถูกต้อง |
| `plantedDate` | ต้องเป็น `YYYY-MM-DD` | กรุณาระบุวันที่ปลูกให้ถูกต้อง |

---

## 17. POST: updatePlanting

ใช้แก้ไขรายการปลูก

### Request

```txt
POST {WEB_APP_URL}
```

### Body

```json
{
  "action": "updatePlanting",
  "payload": {
    "id": "PLT-20260609-0001",
    "cropId": "green_cos",
    "unitType": "slot",
    "quantity": 100,
    "plantedDate": "2026-06-06",
    "note": "แก้ไขจำนวนช่องปลูก"
  }
}
```

### Field ที่แก้ไขได้

| Field | Required | Description |
|---|---:|---|
| `id` | yes | รหัสรายการปลูกที่ต้องการแก้ |
| `cropId` | no | รหัสชนิดผัก |
| `unitType` | no | หน่วยปลูก |
| `quantity` | no | จำนวนที่ปลูก |
| `plantedDate` | no | วันที่ปลูก |
| `note` | no | หมายเหตุ |
| `status` | no | สถานะ ใช้เฉพาะกรณีจำเป็น |

### ข้อกำหนดสำคัญ

ถ้าแก้ `cropId` หรือ `plantedDate` ต้องคำนวณใหม่:

```txt
harvestAgeDays
expectedHarvestDate
daysRemaining
status
```

### Response

```json
{
  "success": true,
  "action": "updatePlanting",
  "message": "แก้ไขรายการปลูกเรียบร้อยแล้ว",
  "data": {
    "id": "PLT-20260609-0001",
    "cropId": "green_cos",
    "cropName": "Green Cos",
    "unitType": "slot",
    "unitLabel": "ช่องปลูก",
    "quantity": 100,
    "plantedDate": "2026-06-06",
    "harvestAgeDays": 25,
    "expectedHarvestDate": "2026-07-01",
    "daysRemaining": 22,
    "status": "growing",
    "actualHarvestDate": "",
    "actualYield": "",
    "yieldUnit": "kg",
    "note": "แก้ไขจำนวนช่องปลูก",
    "createdAt": "2026-06-09T08:30:00.000Z",
    "updatedAt": "2026-06-09T09:00:00.000Z"
  }
}
```

---

## 18. POST: recordHarvest

ใช้บันทึกผลผลิตจริง

### Request

```txt
POST {WEB_APP_URL}
```

### Body

```json
{
  "action": "recordHarvest",
  "payload": {
    "plantingId": "PLT-20260609-0001",
    "harvestDate": "2026-06-30",
    "yieldAmount": 12.5,
    "yieldUnit": "kg",
    "harvestType": "full",
    "note": "คุณภาพดี ส่งลูกค้าประจำ"
  }
}
```

### Field ที่ Frontend ต้องส่ง

| Field | Required | Description |
|---|---:|---|
| `plantingId` | yes | id ของรายการปลูก |
| `harvestDate` | yes | วันที่เก็บเกี่ยวจริง |
| `yieldAmount` | yes | ปริมาณผลผลิตจริง |
| `yieldUnit` | no | ค่าเริ่มต้น `kg` |
| `harvestType` | no | ค่าเริ่มต้น `full` |
| `note` | no | หมายเหตุ |

### สิ่งที่ Apps Script ต้องทำ

1. ตรวจสอบว่า `plantingId` มีอยู่จริง
2. สร้าง `harvestId`
3. บันทึกข้อมูลลงชีต `HarvestLogs`
4. อัปเดตข้อมูลในชีต `Plantings`
   - `status = harvested`
   - `actualHarvestDate = harvestDate`
   - `actualYield = yieldAmount`
   - `yieldUnit = yieldUnit`
   - `updatedAt = now`
5. ส่งข้อมูลกลับเป็น JSON

### Response

```json
{
  "success": true,
  "action": "recordHarvest",
  "message": "บันทึกผลผลิตเรียบร้อยแล้ว",
  "data": {
    "harvestLog": {
      "harvestId": "HVT-20260630-0001",
      "plantingId": "PLT-20260609-0001",
      "cropId": "green_cos",
      "cropName": "Green Cos",
      "harvestDate": "2026-06-30",
      "yieldAmount": 12.5,
      "yieldUnit": "kg",
      "harvestType": "full",
      "note": "คุณภาพดี ส่งลูกค้าประจำ",
      "createdAt": "2026-06-30T08:30:00.000Z",
      "updatedAt": "2026-06-30T08:30:00.000Z"
    },
    "planting": {
      "id": "PLT-20260609-0001",
      "status": "harvested",
      "actualHarvestDate": "2026-06-30",
      "actualYield": 12.5,
      "yieldUnit": "kg",
      "updatedAt": "2026-06-30T08:30:00.000Z"
    }
  }
}
```

### Validation

| Field | Rule | Error Message |
|---|---|---|
| `plantingId` | ต้องมี | กรุณาเลือกรายการปลูก |
| `plantingId` | ต้องพบใน `Plantings` | ไม่พบรายการปลูก |
| `harvestDate` | ต้องเป็น `YYYY-MM-DD` | กรุณาระบุวันที่เก็บเกี่ยว |
| `yieldAmount` | ต้องมากกว่า 0 | กรุณาระบุปริมาณผลผลิตให้ถูกต้อง |

---

## 19. POST: cancelPlanting

ใช้ยกเลิกรายการปลูก โดยไม่ลบข้อมูลจริงออกจากชีต

### Request

```txt
POST {WEB_APP_URL}
```

### Body

```json
{
  "action": "cancelPlanting",
  "payload": {
    "id": "PLT-20260609-0001",
    "note": "ต้นเสียหายจากระบบน้ำขัดข้อง"
  }
}
```

### สิ่งที่ Apps Script ต้องทำ

- หาแถวจาก `id`
- เปลี่ยน `status` เป็น `cancelled`
- เพิ่มหรืออัปเดต `note`
- อัปเดต `updatedAt`

### Response

```json
{
  "success": true,
  "action": "cancelPlanting",
  "message": "ยกเลิกรายการปลูกเรียบร้อยแล้ว",
  "data": {
    "id": "PLT-20260609-0001",
    "status": "cancelled",
    "note": "ต้นเสียหายจากระบบน้ำขัดข้อง",
    "updatedAt": "2026-06-30T08:30:00.000Z"
  }
}
```

---

## 20. POST: seedInitialData

ใช้สร้างชีตและข้อมูลเริ่มต้นใน Google Sheets

เหมาะสำหรับตอนติดตั้งระบบครั้งแรก

### Request

```txt
POST {WEB_APP_URL}
```

### Body

```json
{
  "action": "seedInitialData",
  "payload": {
    "force": false
  }
}
```

### สิ่งที่ Apps Script ต้องทำ

1. ตรวจสอบว่ามีชีตต่อไปนี้หรือไม่
   - `Plantings`
   - `Crops`
   - `HarvestLogs`
   - `Settings`
2. ถ้าไม่มี ให้สร้างชีต
3. ตรวจสอบ header row
4. ถ้าไม่มีข้อมูลใน `Crops` ให้เพิ่มผักเริ่มต้น 10 รายการ
5. ไม่ลบข้อมูลเดิม
6. ถ้า `force = true` ให้ระวังมากเป็นพิเศษ และไม่ควรใช้ใน production

### Response

```json
{
  "success": true,
  "action": "seedInitialData",
  "message": "สร้างข้อมูลเริ่มต้นเรียบร้อยแล้ว",
  "data": {
    "createdSheets": ["Plantings", "Crops", "HarvestLogs", "Settings"],
    "seededCrops": 10
  }
}
```

---

# 21. Frontend Fetch Examples

## 21.1 ตัวอย่างเรียก getInitialData

```js
const WEB_APP_URL = "https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec";

async function getInitialData() {
  const url = `${WEB_APP_URL}?action=getInitialData`;
  const res = await fetch(url);
  const json = await res.json();

  if (!json.success) {
    throw new Error(json.message || "โหลดข้อมูลไม่สำเร็จ");
  }

  return json.data;
}
```

---

## 21.2 ตัวอย่างบันทึกการปลูก

```js
async function createPlanting(payload) {
  const res = await fetch(WEB_APP_URL, {
    method: "POST",
    body: JSON.stringify({
      action: "createPlanting",
      payload
    })
  });

  const json = await res.json();

  if (!json.success) {
    throw new Error(json.message || "บันทึกการปลูกไม่สำเร็จ");
  }

  return json.data;
}

createPlanting({
  cropId: "green_cos",
  unitType: "slot",
  quantity: 120,
  plantedDate: "2026-06-05",
  note: "ราง A"
});
```

---

## 21.3 ตัวอย่างบันทึกเก็บเกี่ยว

```js
async function recordHarvest(payload) {
  const res = await fetch(WEB_APP_URL, {
    method: "POST",
    body: JSON.stringify({
      action: "recordHarvest",
      payload
    })
  });

  const json = await res.json();

  if (!json.success) {
    throw new Error(json.message || "บันทึกผลผลิตไม่สำเร็จ");
  }

  return json.data;
}

recordHarvest({
  plantingId: "PLT-20260609-0001",
  harvestDate: "2026-06-30",
  yieldAmount: 12.5,
  yieldUnit: "kg",
  harvestType: "full",
  note: "คุณภาพดี"
});
```

---

# 22. Apps Script Routing Design

ใน Apps Script ควรแยก routing ชัดเจน

```js
function doGet(e) {
  const action = e.parameter.action;

  try {
    switch (action) {
      case "ping":
        return jsonResponse(success("ping", "GrowDay API is running", getPingData()));

      case "getInitialData":
        return jsonResponse(success("getInitialData", "OK", getInitialData()));

      case "getCrops":
        return jsonResponse(success("getCrops", "OK", getCrops(e.parameter)));

      case "getPlantings":
        return jsonResponse(success("getPlantings", "OK", getPlantings(e.parameter)));

      case "getPlantingById":
        return jsonResponse(success("getPlantingById", "OK", getPlantingById(e.parameter.id)));

      case "getDashboardSummary":
        return jsonResponse(success("getDashboardSummary", "OK", getDashboardSummary()));

      case "getReadyPlantings":
        return jsonResponse(success("getReadyPlantings", "OK", getReadyPlantings()));

      case "getHarvestLogs":
        return jsonResponse(success("getHarvestLogs", "OK", getHarvestLogs(e.parameter)));

      default:
        return jsonResponse(fail(action || "", "ไม่พบคำสั่ง API", "INVALID_ACTION"));
    }
  } catch (err) {
    return jsonResponse(fail(action || "", "เกิดข้อผิดพลาดภายในระบบ", "SERVER_ERROR", String(err)));
  }
}
```

```js
function doPost(e) {
  let body = {};

  try {
    body = JSON.parse(e.postData.contents || "{}");
  } catch (err) {
    return jsonResponse(fail("", "รูปแบบข้อมูลไม่ถูกต้อง", "VALIDATION_ERROR", String(err)));
  }

  const action = body.action;
  const payload = body.payload || {};

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
        return jsonResponse(fail(action || "", "ไม่พบคำสั่ง API", "INVALID_ACTION"));
    }
  } catch (err) {
    return jsonResponse(fail(action || "", "เกิดข้อผิดพลาดภายในระบบ", "SERVER_ERROR", String(err)));
  }
}
```

---

## 23. Helper Response Functions

Apps Script ควรมี helper เพื่อให้ response เป็นมาตรฐานเดียวกัน

```js
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
```

---

## 24. Apps Script Data Handling Rules

### การอ่านข้อมูลจากชีต

Apps Script ต้องอ่านข้อมูลโดยใช้ header row

แนวคิด:

```js
function rowsToObjects(values) {
  const headers = values[0];
  return values.slice(1).map(row => {
    const obj = {};
    headers.forEach((header, index) => {
      obj[header] = row[index];
    });
    return obj;
  });
}
```

### การเขียนข้อมูลลงชีต

ให้แปลง object เป็น array ตาม header row เสมอ

แนวคิด:

```js
function objectToRow(obj, headers) {
  return headers.map(header => obj[header] !== undefined ? obj[header] : "");
}
```

### ข้อดี

- ถ้าเพิ่มคอลัมน์ท้ายตาราง โค้ดยังทำงานได้
- ลดความเสี่ยง column ผิด
- ใช้ field name ตรงกับ `DATA_SCHEMA.md`

---

## 25. CORS และ Google Apps Script

Google Apps Script Web App มีข้อจำกัดเรื่อง CORS บางกรณี โดยเฉพาะการส่ง request ที่ทำให้เกิด preflight

### แนวทางที่แนะนำสำหรับ MVP

1. ใช้ `GET` สำหรับดึงข้อมูล
2. ใช้ `POST` แบบไม่ตั้ง header ซับซ้อน
3. ส่ง `body` เป็น JSON string
4. ไม่จำเป็นต้องตั้ง `Content-Type: application/json` หากเกิดปัญหา CORS
5. Apps Script อ่านข้อมูลจาก `e.postData.contents`

### ตัวอย่าง POST ที่เหมาะกับ Apps Script

```js
fetch(WEB_APP_URL, {
  method: "POST",
  body: JSON.stringify({
    action: "createPlanting",
    payload: {
      cropId: "green_cos",
      quantity: 120,
      plantedDate: "2026-06-05"
    }
  })
});
```

---

## 26. Frontend State After API Calls

หลังจากเรียก API สำเร็จ Frontend ควรทำดังนี้

### หลัง createPlanting สำเร็จ

1. แจ้งข้อความสำเร็จ
2. ล้างฟอร์ม
3. โหลดรายการปลูกใหม่ หรือเพิ่ม item ใหม่เข้า local state
4. กลับไปหน้า `รายการปลูก` หรือ `หน้าแรก`

### หลัง updatePlanting สำเร็จ

1. แจ้งข้อความสำเร็จ
2. อัปเดต item ใน local state
3. ปิด modal หรือกลับไปหน้ารายการ

### หลัง recordHarvest สำเร็จ

1. แจ้งข้อความสำเร็จ
2. โหลดรายการปลูกใหม่
3. โหลด dashboard summary ใหม่
4. แสดงรายการใน `เก็บเกี่ยวล่าสุด`

### หลังเกิด error

1. แสดงข้อความ `message` จาก response
2. ไม่ล้างข้อมูลในฟอร์ม
3. ให้ผู้ใช้แก้ข้อมูลแล้วส่งใหม่ได้

---

## 27. Security / Access Control

สำหรับ MVP ไม่มีระบบ login ภายในเว็บแอพ

การควบคุมสิทธิ์ให้จัดการที่:

1. สิทธิ์ของ Google Sheets
2. สิทธิ์การ deploy Google Apps Script Web App
3. การไม่เผยแพร่ URL ให้คนนอกกลุ่มโดยไม่จำเป็น

### คำแนะนำการ Deploy Apps Script

สำหรับใช้งานเฉพาะกลุ่มแบบง่าย:

```txt
Execute as: Me
Who has access: Anyone with the link
```

ข้อควรระวัง:

- ใครมี URL ของ Web App อาจเรียก API ได้
- ไม่ควรเก็บข้อมูลส่วนบุคคลสำคัญในระบบนี้
- ถ้าต้องการความปลอดภัยมากขึ้นในอนาคต ควรเพิ่ม token แบบง่ายหรือระบบ login

---

## 28. Simple Token Option

ถ้าต้องการเพิ่มความปลอดภัยแบบไม่ซับซ้อน สามารถเพิ่ม `apiToken` ได้

### Request Example

```json
{
  "action": "createPlanting",
  "apiToken": "GROWDAY_SECRET_TOKEN",
  "payload": {
    "cropId": "green_cos",
    "quantity": 120,
    "plantedDate": "2026-06-05"
  }
}
```

### หมายเหตุ

สำหรับ MVP ยังไม่จำเป็น แต่ถ้าเผยแพร่ Web App URL ในวงกว้าง ควรเพิ่ม token

---

## 29. Performance Guidelines

Google Sheets และ Apps Script เหมาะกับระบบข้อมูลระดับเล็กถึงกลาง

### แนวทางสำหรับ MVP

- โหลดข้อมูลครั้งแรกด้วย `getInitialData`
- หลีกเลี่ยงการเรียก API ถี่เกินจำเป็น
- กรองข้อมูลฝั่ง Apps Script เมื่อข้อมูลเริ่มมาก
- จำกัด `getPlantings` ด้วย `limit`
- ใช้ cache ใน Frontend ชั่วคราวระหว่างเปิดหน้าเว็บ
- แยก `HarvestLogs` เพื่อทำสรุปผลผลิตง่ายขึ้น

### ขนาดข้อมูลที่ยังเหมาะสม

ระบบนี้เหมาะกับข้อมูลระดับ:

```txt
หลักร้อยถึงหลักพันรายการ
```

ถ้าข้อมูลหลายหมื่นรายการ ควรพิจารณาฐานข้อมูลจริงในอนาคต

---

## 30. API Acceptance Criteria

API ถือว่าทำงานถูกต้องเมื่อ:

1. `ping` ตอบกลับได้
2. `getCrops` แสดงผักเริ่มต้น 10 รายการ
3. `getPlantings` อ่านข้อมูลจากชีต `Plantings` ได้
4. `getDashboardSummary` คำนวณข้อมูลสรุปได้ถูกต้อง
5. `createPlanting` บันทึกข้อมูลลงชีต `Plantings`
6. `createPlanting` คำนวณ `expectedHarvestDate` จาก `plantedDate + harvestAgeDays`
7. `recordHarvest` เพิ่มข้อมูลลงชีต `HarvestLogs`
8. `recordHarvest` อัปเดตสถานะรายการปลูกเป็น `harvested`
9. Error response มี `success: false`
10. ทุก response เป็น JSON
11. ทุก field ใช้ชื่อตาม `DATA_SCHEMA.md`
12. วันที่ส่งกลับเป็น `YYYY-MM-DD`
13. ไม่มีการลบข้อมูลจริงจากชีตใน MVP

---

## 31. Prompt สำหรับสั่ง Codex / AI Coding Agent

ใช้ prompt นี้เมื่อสั่ง AI พัฒนา Apps Script API

```txt
ให้สร้าง Google Apps Script API สำหรับเว็บแอพ GrowDay ตาม docs/API_SPEC.md และ docs/DATA_SCHEMA.md อย่างเคร่งครัด

ข้อกำหนด:
- ใช้ Google Apps Script Web App เป็น backend
- ใช้ Google Sheets เป็น database
- ใช้ endpoint เดียว และแยกคำสั่งด้วย action
- รองรับ GET actions: ping, getInitialData, getCrops, getPlantings, getDashboardSummary, getReadyPlantings
- รองรับ POST actions: createPlanting, updatePlanting, recordHarvest, cancelPlanting, seedInitialData
- ทุก response ต้องเป็น JSON รูปแบบมาตรฐาน success/action/message/data หรือ success/action/message/error
- อ่านและเขียน Google Sheets ด้วย field name จาก header row
- ใช้ชื่อ sheet และ field ตาม docs/DATA_SCHEMA.md เท่านั้น
- ห้ามเปลี่ยนชื่อ field
- วันที่ใน API ต้องเป็น YYYY-MM-DD
- createdAt และ updatedAt ต้องสร้างอัตโนมัติ
- createPlanting ต้องคำนวณ expectedHarvestDate จาก plantedDate + harvestAgeDays
- recordHarvest ต้องเพิ่มข้อมูลใน HarvestLogs และอัปเดต Plantings เป็น harvested
- ไม่ลบข้อมูลจริง ให้ใช้ status cancelled
- โค้ดต้องอ่านง่าย แยก helper function ชัดเจน และเหมาะกับผู้เริ่มต้นนำไปแก้ไขต่อ
```

---

## 32. หมายเหตุสำหรับการพัฒนาจริง

- ถ้าใช้ Cloudflare Pages หรือ static hosting แล้ว POST ติด CORS ให้ปรับ fetch ไม่ส่ง custom header
- ถ้าต้องการเพิ่มความปลอดภัย ให้เพิ่ม `apiToken` ใน request
- ถ้าต้องการใช้งานแบบ offline ควรเพิ่ม localStorage cache ใน Frontend แต่ไม่ต้องทำใน MVP
- ถ้า Google Sheets ถูกแก้ header ด้วยมือ API อาจทำงานผิด ให้ล็อกแถว header หรือทำ checklist ก่อนใช้งาน
- ถ้าต้องการทำ dashboard ละเอียดขึ้น ให้เพิ่ม API summary แยกภายหลัง
- ถ้าเพิ่มฟีเจอร์ใหม่ ต้องอัปเดต `API_SPEC.md` และ `DATA_SCHEMA.md` พร้อมกัน
