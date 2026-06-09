# PROMPT_PACK_CODEX.md

ไฟล์นี้คือชุด Prompt สำหรับใช้สั่ง **Codex ใน VS Code** เพื่อพัฒนาเว็บแอพ **GrowDay** ให้ตรงตามเอกสารกำกับระบบ

ให้ใช้ไฟล์นี้ร่วมกับเอกสารต่อไปนี้ในโปรเจกต์:

```txt
README.md
docs/APP_SPEC.md
docs/UI_FLOW.md
docs/DATA_SCHEMA.md
docs/API_SPEC.md
docs/DEVELOPMENT_RULES.md
```

---

## วิธีใช้ Prompt Pack นี้

ให้ใช้ prompt ตามลำดับ ไม่ควรข้ามขั้นตอน โดยเฉพาะช่วงเริ่มต้น เพราะระบบนี้มีหลายส่วนที่ต้องเชื่อมกัน ได้แก่

```txt
Frontend
Google Apps Script
Google Sheets
API
UI Flow
Data Schema
```

แนวทางใช้งาน:

1. เปิดโปรเจกต์ GrowDay ใน VS Code
2. วางไฟล์เอกสารทั้งหมดไว้ให้ครบ
3. เปิด Codex ใน VS Code
4. คัดลอก prompt ทีละชุดไปสั่ง
5. ให้ Codex ทำทีละขั้น
6. หลังแต่ละขั้น ให้ตรวจไฟล์ที่เปลี่ยนก่อนสั่งขั้นถัดไป
7. ถ้า Codex เสนอเปลี่ยน stack หรือเพิ่ม framework ให้ปฏิเสธ
8. ถ้า Codex แก้ชื่อ field, sheet, หรือ action API ให้สั่งแก้กลับทันที

---

## กติกาหลักก่อนใช้ Prompt Pack

ห้าม Codex ทำสิ่งต่อไปนี้ เว้นแต่มีคำสั่งใหม่ชัดเจน:

```txt
- ห้ามใช้ React, Vue, Next.js หรือ framework อื่น
- ห้ามใช้ npm, Vite, Webpack หรือ build tools
- ห้ามเพิ่มระบบ login
- ห้ามเปลี่ยน Google Sheets schema
- ห้ามเปลี่ยนชื่อ API action
- ห้ามเปลี่ยนชื่อ field
- ห้ามเปลี่ยนชื่อ sheet
- ห้ามเพิ่มฐานข้อมูลอื่น
- ห้ามสร้าง UI ซับซ้อนเกิน MVP
- ห้ามใช้ mock data แทน API เมื่อ API พร้อมแล้ว
```

---

# Roadmap การใช้ Prompt

ลำดับที่แนะนำ:

```txt
Step 0  ตรวจเอกสารและสรุปแผน
Step 1  สร้างโครงสร้างไฟล์โปรเจกต์
Step 2  สร้างหน้าเว็บหลักและ layout พื้นฐาน
Step 3  สร้าง state และ utilities
Step 4  สร้าง API client ฝั่ง Frontend
Step 5  สร้าง Dashboard
Step 6  สร้างหน้าบันทึกการปลูก
Step 7  สร้างหน้ารายการปลูก
Step 8  สร้างหน้าบันทึกเก็บเกี่ยว
Step 9  สร้างหน้าสรุปผลผลิต
Step 10 สร้าง Google Apps Script API
Step 11 สร้างระบบ seed Google Sheets
Step 12 เชื่อม Frontend กับ Apps Script จริง
Step 13 ทดสอบ flow ทั้งระบบ
Step 14 ปรับ UI มือถือและข้อความภาษาไทย
Step 15 ตรวจเอกสารกับโค้ดก่อนส่งมอบ
Step 16 สร้างคู่มือ Deploy
```

---

# Step 0: ตรวจเอกสารและสรุปแผน

## ใช้เมื่อไร

ใช้เป็น prompt แรกหลังเปิดโปรเจกต์ใน VS Code เพื่อให้ Codex อ่านเอกสารทั้งหมดและเข้าใจขอบเขตก่อนเริ่มเขียนโค้ด

## Prompt

```txt
คุณคือผู้ช่วยพัฒนาเว็บแอพ GrowDay ใน VS Code

ก่อนเริ่มเขียนโค้ด ให้ตรวจอ่านเอกสารต่อไปนี้ทั้งหมด:

- README.md
- docs/APP_SPEC.md
- docs/UI_FLOW.md
- docs/DATA_SCHEMA.md
- docs/API_SPEC.md
- docs/DEVELOPMENT_RULES.md

จากนั้นให้สรุปแผนพัฒนาเป็นลำดับขั้น โดยยังไม่ต้องแก้ไฟล์ใด ๆ

ข้อกำหนดสำคัญ:
- ใช้ HTML5 + Tailwind CSS CDN + Vanilla JavaScript เท่านั้น
- ใช้ Google Apps Script เป็น backend
- ใช้ Google Sheets เป็น database
- ไม่ใช้ React, Vue, Next.js, npm, Vite, Webpack หรือ build tools
- ไม่ต้องมีระบบ login
- มือถือเป็นหลัก
- ห้ามเพิ่มฟีเจอร์เกิน MVP
- ห้ามเปลี่ยนชื่อ sheet, field, API action หรือ response format
- ให้ตอบกลับเป็นแผนงานที่ชัดเจน พร้อมรายชื่อไฟล์ที่จะสร้างหรือแก้ในแต่ละขั้น
```

## ผลลัพธ์ที่ควรได้

Codex ควรสรุปแผน ไม่ควรเริ่มสร้างโค้ดทันที

---

# Step 1: สร้างโครงสร้างไฟล์โปรเจกต์

## ใช้เมื่อไร

ใช้หลังจาก Codex เข้าใจเอกสารแล้ว เพื่อสร้างไฟล์และโฟลเดอร์พื้นฐาน

## Prompt

```txt
ให้สร้างโครงสร้างไฟล์โปรเจกต์ GrowDay ตามเอกสาร docs/DEVELOPMENT_RULES.md

ให้สร้างไฟล์และโฟลเดอร์ดังนี้:

- index.html
- css/style.css
- js/config.js
- js/api.js
- js/state.js
- js/utils.js
- js/app.js
- js/dashboard.js
- js/planting-form.js
- js/planting-list.js
- js/harvest-form.js
- js/summary.js
- apps-script/Code.gs
- assets/icons/
- assets/images/

ข้อกำหนด:
- ยังไม่ต้องเขียน logic ซับซ้อน
- ใส่ comment อธิบายหน้าที่ของแต่ละไฟล์
- ห้ามเพิ่ม framework
- ห้ามใช้ npm หรือ build tools
- ห้ามเปลี่ยนชื่อไฟล์จากที่กำหนด
- โครงสร้างต้องเหมาะกับผู้เริ่มต้นแก้ไขต่อได้
```

## ผลลัพธ์ที่ควรได้

ควรได้โครงสร้างไฟล์ครบ และยังไม่มี logic ที่ซับซ้อน

---

# Step 2: สร้างหน้าเว็บหลักและ Layout พื้นฐาน

## ใช้เมื่อไร

ใช้เพื่อสร้าง `index.html` และ layout หลักตาม UI Flow

## Prompt

```txt
ให้สร้าง index.html สำหรับเว็บแอพ GrowDay ตาม docs/UI_FLOW.md และ docs/DEVELOPMENT_RULES.md

ข้อกำหนด:
- ใช้ HTML5
- ใช้ Tailwind CSS CDN
- ใช้ Google Fonts เพียง 1 ฟอนต์ เช่น Noto Sans Thai หรือ Prompt
- ใช้ Vanilla JavaScript เท่านั้น
- รองรับมือถือเป็นหลัก
- ไม่ใช้ framework
- ไม่ใช้ build tools
- หน้าเว็บต้องเปิดแล้วใช้งานได้ทันที

ให้สร้าง layout หลักดังนี้:
1. Header แสดงชื่อ GrowDay และคำอธิบายสั้น
2. Main container สำหรับ render หน้าแต่ละ tab
3. Bottom Navigation 4 เมนู:
   - หน้าแรก
   - ปลูก
   - เก็บเกี่ยว
   - สรุป
4. พื้นที่แสดง loading
5. พื้นที่แสดง error message
6. พื้นที่แสดง toast หรือ success message แบบง่าย

ข้อกำหนด UI:
- โทนสีเขียว ขาว เทา
- card มุมมน
- ปุ่มใหญ่พอกดง่ายบนมือถือ
- ข้อความภาษาไทยเป็นหลัก
- ไม่ใช้ effect ซับซ้อน
- ต้องสอดคล้องกับภาพตัวอย่าง UI ที่ออกแบบไว้ก่อนหน้า

ให้เชื่อมไฟล์ JS ตามโครงสร้าง:
- js/config.js
- js/api.js
- js/state.js
- js/utils.js
- js/dashboard.js
- js/planting-form.js
- js/planting-list.js
- js/harvest-form.js
- js/summary.js
- js/app.js
```

## ผลลัพธ์ที่ควรได้

ได้หน้า HTML หลักพร้อมโครงร่างมือถือและ bottom navigation

---

# Step 3: สร้าง State และ Utilities

## ใช้เมื่อไร

ใช้สร้างฟังก์ชันกลางที่หลายหน้าใช้ร่วมกัน

## Prompt

```txt
ให้สร้าง logic พื้นฐานในไฟล์ js/state.js และ js/utils.js สำหรับ GrowDay

ให้อ้างอิง:
- docs/DATA_SCHEMA.md
- docs/UI_FLOW.md
- docs/DEVELOPMENT_RULES.md

ใน js/state.js ให้สร้าง state กลาง เช่น:
- crops
- plantings
- harvestLogs
- dashboardSummary
- currentTab
- loading
- error

ให้มีฟังก์ชัน:
- setState(partialState)
- getState()
- subscribe(listener)
- notify()
- resetState()

ใน js/utils.js ให้สร้าง helper functions:
- formatDateForDisplay(dateString)
- formatDateForInput(dateString)
- addDays(dateString, days)
- calculateDaysRemaining(expectedHarvestDate)
- getPlantingStatus(planting)
- getStatusLabel(status, daysRemaining)
- getStatusChipClass(status, daysRemaining)
- formatNumber(value)
- formatKg(value)
- validatePositiveNumber(value)
- generateDisplayError(error)

ข้อกำหนด:
- วันที่ในระบบต้องใช้ YYYY-MM-DD
- การแสดงผลวันที่บน UI ใช้ DD/MM/YYYY
- ห้ามใช้ library ภายนอก
- ห้ามเปลี่ยนชื่อ field จาก DATA_SCHEMA.md
- โค้ดต้องอ่านง่ายและมี comment เฉพาะจุดสำคัญ
```

## ผลลัพธ์ที่ควรได้

ได้ state และ helper functions สำหรับใช้ร่วมกันทั้งระบบ

---

# Step 4: สร้าง API Client ฝั่ง Frontend

## ใช้เมื่อไร

ใช้สร้าง `js/api.js` สำหรับเรียก Google Apps Script

## Prompt

```txt
ให้สร้างไฟล์ js/config.js และ js/api.js สำหรับ GrowDay ตาม docs/API_SPEC.md

ใน js/config.js ให้มี:
- WEB_APP_URL เป็นค่าที่ผู้ใช้ต้องใส่เองภายหลัง
- APP_VERSION
- DEFAULT_SETTINGS เช่น defaultUnitType และ defaultYieldUnit

ใน js/api.js ให้สร้าง API client สำหรับเรียก Google Apps Script Web App endpoint เดียว โดยใช้ action ตาม docs/API_SPEC.md

ต้องมีฟังก์ชัน:
- apiGet(action, params = {})
- apiPost(action, payload = {})
- pingApi()
- getInitialData()
- getCrops()
- getPlantings(filters = {})
- getDashboardSummary()
- getReadyPlantings()
- getHarvestLogs(filters = {})
- createPlanting(payload)
- updatePlanting(payload)
- recordHarvest(payload)
- cancelPlanting(payload)

ข้อกำหนด:
- ทุก response ต้องตรวจ success
- ถ้า success = false ให้ throw error ที่มี message ภาษาไทย
- ไม่ตั้ง custom header ที่ทำให้ CORS ซับซ้อน ถ้าไม่จำเป็น
- POST ให้ส่ง body เป็น JSON.stringify({ action, payload })
- ห้ามเปลี่ยนชื่อ action จาก API_SPEC.md
- ห้ามเปลี่ยน response format
- ต้องจัดการกรณี WEB_APP_URL ยังไม่ได้ตั้งค่า
- ต้องมี error message ที่ผู้ใช้ทั่วไปเข้าใจได้
```

## ผลลัพธ์ที่ควรได้

ได้ client สำหรับเชื่อม Apps Script ตาม API spec

---

# Step 5: สร้าง Dashboard

## ใช้เมื่อไร

ใช้สร้างหน้าแรกตาม MVP

## Prompt

```txt
ให้สร้างหน้า Dashboard ของ GrowDay ในไฟล์ js/dashboard.js และเชื่อมกับ app.js

อ้างอิง:
- docs/UI_FLOW.md
- docs/API_SPEC.md
- docs/DATA_SCHEMA.md
- docs/DEVELOPMENT_RULES.md

Dashboard ต้องแสดง:
1. จำนวนรายการกำลังปลูก
2. จำนวนรายการที่พร้อมเก็บวันนี้
3. จำนวนรายการที่จะเก็บเกี่ยวภายใน 7 วัน
4. ผลผลิตรวมเดือนนี้
5. เมนูด่วน:
   - บันทึกการปลูก
   - รายการปลูก
   - บันทึกเก็บเกี่ยว
   - สรุปผลผลิต
6. รายการใกล้ถึงวันเก็บเกี่ยว
7. รายการปลูกล่าสุด

ข้อกำหนด:
- ใช้ข้อมูลจาก state.dashboardSummary และ state.plantings
- ถ้ายังไม่มีข้อมูล ให้แสดง empty state ภาษาไทย
- ถ้าโหลดข้อมูลไม่ได้ ให้แสดงข้อความ error ที่เข้าใจง่าย
- UI ต้องเหมาะกับมือถือ
- ใช้ card มุมมนและสีเขียวแบบเรียบง่าย
- ห้ามใช้ chart library
- ห้ามสร้าง UI ซับซ้อนเกิน MVP
```

## ผลลัพธ์ที่ควรได้

หน้าแรกใช้งานได้ แสดงข้อมูลจาก state และกดเมนูด่วนได้

---

# Step 6: สร้างหน้าบันทึกการปลูก

## ใช้เมื่อไร

ใช้สร้างฟอร์มเพิ่มรายการปลูก

## Prompt

```txt
ให้สร้างหน้าบันทึกการปลูกของ GrowDay ในไฟล์ js/planting-form.js

อ้างอิง:
- docs/UI_FLOW.md
- docs/DATA_SCHEMA.md
- docs/API_SPEC.md
- docs/DEVELOPMENT_RULES.md

ฟอร์มต้องมี:
1. dropdown เลือกชนิดผักจาก state.crops
2. ช่องกรอกจำนวนที่ปลูก
3. หน่วยปลูกเริ่มต้นเป็น slot / ช่องปลูก
4. ช่องเลือกวันที่ปลูก
5. แสดงวันที่คาดว่าเก็บเกี่ยวอัตโนมัติ
6. แสดงอายุเก็บเกี่ยวของผักที่เลือก
7. ช่องหมายเหตุ
8. ปุ่มบันทึกการปลูก
9. ปุ่มล้างข้อมูล

Logic:
- เมื่อเลือกผัก ให้ดึง harvestAgeDays จาก crop
- เมื่อเลือกวันที่ปลูก ให้คำนวณ expectedHarvestDate
- วันที่ปลูกหมายถึงวันที่ย้ายต้นกล้าลงราง/ช่องปลูก
- เมื่อกดบันทึก ให้เรียก createPlanting(payload)
- หลังบันทึกสำเร็จ ให้แจ้ง success, ล้างฟอร์ม และโหลดข้อมูลใหม่

Validation:
- ต้องเลือกชนิดผัก
- quantity ต้องเป็นตัวเลขมากกว่า 0
- plantedDate ต้องไม่ว่าง
- ข้อความ error ต้องเป็นภาษาไทย

ข้อห้าม:
- ห้าม hardcode รายชื่อผักเป็นหลัก ถ้า state.crops มีข้อมูล
- ห้ามให้ผู้ใช้แก้ expectedHarvestDate เองใน MVP
- ห้ามเปลี่ยนชื่อ field จาก DATA_SCHEMA.md
```

## ผลลัพธ์ที่ควรได้

ฟอร์มบันทึกการปลูกทำงานได้และคำนวณวันเก็บเกี่ยวอัตโนมัติ

---

# Step 7: สร้างหน้ารายการปลูก

## ใช้เมื่อไร

ใช้สร้างรายการปลูกทั้งหมดแบบ mobile-friendly table

## Prompt

```txt
ให้สร้างหน้ารายการปลูกของ GrowDay ในไฟล์ js/planting-list.js

อ้างอิง:
- docs/UI_FLOW.md
- docs/DATA_SCHEMA.md
- docs/API_SPEC.md
- docs/DEVELOPMENT_RULES.md

หน้ารายการปลูกต้องมี:
1. ช่องค้นหาชื่อผัก
2. filter chips:
   - ทั้งหมด
   - กำลังปลูก
   - พร้อมเก็บ
   - เก็บแล้ว
   - ยกเลิก
3. summary เล็ก ๆ:
   - จำนวนทั้งหมด
   - จำนวนพร้อมเก็บ
4. รายการปลูกเป็น card สำหรับมือถือ โดยแต่ละ card แสดง:
   - ชื่อผัก
   - วันที่ปลูก
   - วันที่คาดว่าเก็บเกี่ยว
   - อีกกี่วันถึงวันเก็บเกี่ยว
   - จำนวนที่ปลูก
   - ผลผลิตจริง ถ้ามี
   - status chip
   - ปุ่มแก้ไข
   - ปุ่มเก็บเกี่ยว ถ้ายังไม่ harvested หรือ cancelled

Logic:
- ใช้ข้อมูลจาก state.plantings
- ค้นหาจาก cropName และ thaiName ถ้ามี
- กรองตาม status
- เรียงรายการที่ใกล้เก็บเกี่ยวขึ้นก่อน
- ถ้า status เป็น ready ให้ปุ่มเก็บเกี่ยวเด่นขึ้น
- ถ้า status เป็น harvested ให้แสดงผลผลิตจริง
- ถ้าไม่มีข้อมูล ให้แสดง empty state ภาษาไทย

ข้อกำหนด:
- ห้ามใช้ table กว้างที่ล้นมือถือ
- ใช้ card layout แทน table บนมือถือ
- ห้ามเปลี่ยนชื่อ status
- ห้ามลบข้อมูลจริง
```

## ผลลัพธ์ที่ควรได้

ได้หน้ารายการปลูกที่ใช้งานบนมือถือได้จริง ค้นหาและกรองได้

---

# Step 8: สร้างระบบแก้ไขรายการปลูก

## ใช้เมื่อไร

ใช้หลังหน้ารายการปลูก เพื่อให้ปุ่มแก้ไขทำงาน

## Prompt

```txt
ให้เพิ่มระบบแก้ไขรายการปลูกใน GrowDay โดยใช้ไฟล์ js/planting-list.js และ js/planting-form.js ตามความเหมาะสม

อ้างอิง:
- docs/DATA_SCHEMA.md
- docs/API_SPEC.md
- docs/DEVELOPMENT_RULES.md

ข้อกำหนด:
- เมื่อกดปุ่มแก้ไขจากรายการปลูก ให้เปิดฟอร์มแก้ไขแบบง่าย
- สามารถแก้ได้เฉพาะ:
  - cropId
  - quantity
  - plantedDate
  - note
- ถ้าแก้ cropId หรือ plantedDate ต้องแสดง expectedHarvestDate ใหม่
- เมื่อบันทึก ให้เรียก updatePlanting(payload)
- หลังบันทึกสำเร็จ ให้โหลดข้อมูลใหม่และแจ้งข้อความสำเร็จ
- ถ้ารายการ status = harvested ไม่ควรแก้ cropId/plantedDate ได้ง่าย ๆ ให้แก้ได้เฉพาะ note หรือให้แสดงคำเตือน
- ห้ามลบข้อมูลจริง
- ห้ามเปลี่ยน field name
- UI ต้องเรียบง่ายบนมือถือ
```

## ผลลัพธ์ที่ควรได้

แก้ไขรายการปลูกได้โดยไม่กระทบ schema และ API

---

# Step 9: สร้างหน้าบันทึกเก็บเกี่ยว

## ใช้เมื่อไร

ใช้สร้างหน้าบันทึกผลผลิตจริง

## Prompt

```txt
ให้สร้างหน้าบันทึกเก็บเกี่ยวของ GrowDay ในไฟล์ js/harvest-form.js

อ้างอิง:
- docs/UI_FLOW.md
- docs/DATA_SCHEMA.md
- docs/API_SPEC.md
- docs/DEVELOPMENT_RULES.md

หน้าบันทึกเก็บเกี่ยวต้องมี:
1. dropdown เลือกรายการปลูกที่พร้อมเก็บ
2. กล่องแสดงข้อมูลรายการปลูก:
   - ชื่อผัก
   - วันที่ปลูก
   - วันที่คาดว่าเก็บเกี่ยว
   - จำนวนช่องปลูก
   - สถานะ
3. ช่องวันที่เก็บเกี่ยวจริง
4. ช่องปริมาณผลผลิตจริง
5. หน่วยผลผลิตเริ่มต้นเป็น kg / กก.
6. ช่องหมายเหตุ
7. ปุ่มบันทึกผลผลิต
8. รายการเก็บเกี่ยวล่าสุด

Logic:
- ใช้รายการจาก getReadyPlantings หรือ state.plantings ที่ status = ready
- เมื่อกดบันทึก ให้เรียก recordHarvest(payload)
- payload ต้องมี plantingId, harvestDate, yieldAmount, yieldUnit, harvestType, note
- harvestType ค่าเริ่มต้นเป็น full
- หลังบันทึกสำเร็จ ให้โหลด plantings, harvestLogs และ dashboard summary ใหม่
- แสดง success message ภาษาไทย

Validation:
- ต้องเลือกรายการปลูก
- harvestDate ต้องไม่ว่าง
- yieldAmount ต้องเป็นตัวเลขมากกว่า 0

ข้อห้าม:
- ห้ามบันทึกผลผลิตเป็นค่าว่าง
- ห้ามใช้หน่วยอื่นเป็นค่าเริ่มต้นนอกจาก kg
- ห้ามเปลี่ยนสถานะเองใน Frontend โดยไม่เรียก API
```

## ผลลัพธ์ที่ควรได้

บันทึกเก็บเกี่ยวได้ และระบบอัปเดต Plantings กับ HarvestLogs ผ่าน API

---

# Step 10: สร้างหน้าสรุปผลผลิต

## ใช้เมื่อไร

ใช้ทำหน้าสรุปพื้นฐาน ไม่ต้องมีกราฟซับซ้อน

## Prompt

```txt
ให้สร้างหน้าสรุปผลผลิตของ GrowDay ในไฟล์ js/summary.js

อ้างอิง:
- docs/UI_FLOW.md
- docs/DATA_SCHEMA.md
- docs/API_SPEC.md
- docs/DEVELOPMENT_RULES.md

หน้าสรุปผลผลิตใน MVP ต้องแสดง:
1. ผลผลิตรวมเดือนนี้
2. จำนวนรายการที่เก็บเกี่ยวแล้ว
3. ผลผลิตแยกตามชนิดผัก
4. รายการเก็บเกี่ยวล่าสุด
5. สรุปจำนวนรายการตามสถานะ:
   - กำลังปลูก
   - พร้อมเก็บ
   - เก็บแล้ว
   - ยกเลิก

ข้อกำหนด:
- ใช้ข้อมูลจาก state.plantings และ state.harvestLogs
- ถ้าไม่มี harvestLogs ให้คำนวณจาก plantings ที่ harvested ได้ชั่วคราว
- ไม่ใช้ chart library
- ใช้ card และ list แบบง่าย
- แสดงหน่วยเป็น กก.
- ตัวเลขควร format อ่านง่าย
- empty state ต้องเป็นภาษาไทย
```

## ผลลัพธ์ที่ควรได้

ได้หน้าสรุปใช้งานได้จริงโดยไม่ซับซ้อน

---

# Step 11: สร้าง App Controller และ Navigation

## ใช้เมื่อไร

ใช้เชื่อมทุกหน้ากับ `app.js`

## Prompt

```txt
ให้สร้าง app controller ในไฟล์ js/app.js สำหรับ GrowDay

อ้างอิง:
- docs/UI_FLOW.md
- docs/API_SPEC.md
- docs/DEVELOPMENT_RULES.md

หน้าที่ของ app.js:
1. init แอพเมื่อ DOMContentLoaded
2. โหลด getInitialData()
3. เก็บข้อมูลลง state
4. จัดการ Bottom Navigation
5. render หน้า:
   - dashboard
   - planting list / planting form
   - harvest form
   - summary
6. จัดการ loading state
7. จัดการ error state
8. จัดการ success toast
9. มีฟังก์ชัน refreshData()
10. มีฟังก์ชัน navigateTo(tabName)

ข้อกำหนด:
- เมื่อเปิดแอพ ให้ไปหน้า dashboard
- เมนูปลูกอาจแสดงรายการปลูกเป็นค่าเริ่มต้น และมีปุ่มไปบันทึกการปลูก
- ทุกครั้งที่บันทึกข้อมูลสำเร็จ ให้ refresh เฉพาะข้อมูลที่จำเป็น
- ถ้า API ยังไม่ตั้งค่า WEB_APP_URL ให้แสดงข้อความแนะนำการตั้งค่า
- ห้ามใช้ framework
- ห้ามทำ routing ซับซ้อน
```

## ผลลัพธ์ที่ควรได้

แอพเปลี่ยนหน้าผ่าน Bottom Navigation ได้และโหลดข้อมูลเริ่มต้นได้

---

# Step 12: สร้าง Google Apps Script API

## ใช้เมื่อไร

ใช้สร้าง backend หลักใน `apps-script/Code.gs`

## Prompt

```txt
ให้สร้าง Google Apps Script API ในไฟล์ apps-script/Code.gs สำหรับ GrowDay ตามเอกสารต่อไปนี้อย่างเคร่งครัด:

- docs/API_SPEC.md
- docs/DATA_SCHEMA.md
- docs/DEVELOPMENT_RULES.md

ต้องรองรับ GET actions:
- ping
- getInitialData
- getCrops
- getPlantings
- getPlantingById
- getDashboardSummary
- getReadyPlantings
- getHarvestLogs

ต้องรองรับ POST actions:
- createPlanting
- updatePlanting
- recordHarvest
- cancelPlanting
- seedInitialData

ข้อกำหนดสำคัญ:
- ใช้ Google Sheets เป็น database
- ใช้ชื่อ sheet ตาม DATA_SCHEMA.md:
  - Plantings
  - Crops
  - HarvestLogs
  - Settings
- อ่าน header row เพื่อ map field กับ column
- เขียนข้อมูลโดยใช้ field name
- ทุก response ต้องเป็น JSON format ตาม API_SPEC.md
- วันที่ต้องเป็น YYYY-MM-DD
- timestamp ต้องเป็น ISO string
- createPlanting ต้องดึง harvestAgeDays จาก Crops
- createPlanting ต้องคำนวณ expectedHarvestDate
- recordHarvest ต้องเพิ่มข้อมูลใน HarvestLogs
- recordHarvest ต้อง update Plantings เป็น harvested
- cancelPlanting ต้องเปลี่ยน status เป็น cancelled ไม่ใช่ลบแถว
- ต้องมี helper functions แยกชัดเจน
- โค้ดต้องอ่านง่าย เหมาะกับผู้เริ่มต้นแก้ไขต่อ

ห้าม:
- ห้ามเปลี่ยนชื่อ field
- ห้ามเปลี่ยนชื่อ sheet
- ห้ามเปลี่ยน action
- ห้ามลบข้อมูลจริง
- ห้ามคืน response นอก format
```

## ผลลัพธ์ที่ควรได้

ได้ `Code.gs` ครบตาม API spec

---

# Step 13: สร้างระบบ Seed Google Sheets

## ใช้เมื่อไร

ใช้หลังสร้าง Apps Script API เพื่อเตรียมชีตและข้อมูลเริ่มต้น

## Prompt

```txt
ให้ตรวจและปรับฟังก์ชัน seedInitialData ใน apps-script/Code.gs ให้สมบูรณ์ตาม docs/DATA_SCHEMA.md และ docs/API_SPEC.md

seedInitialData ต้องทำงานดังนี้:
1. ตรวจว่ามีชีต Plantings หรือไม่ ถ้าไม่มีให้สร้าง
2. ตรวจว่ามีชีต Crops หรือไม่ ถ้าไม่มีให้สร้าง
3. ตรวจว่ามีชีต HarvestLogs หรือไม่ ถ้าไม่มีให้สร้าง
4. ตรวจว่ามีชีต Settings หรือไม่ ถ้าไม่มีให้สร้าง
5. สร้าง header row ให้ตรงกับ DATA_SCHEMA.md
6. ถ้าชีต Crops ยังไม่มีข้อมูล ให้เพิ่มผักเริ่มต้น 10 รายการ:
   - Green Cos
   - Mini Cos
   - Green Oak
   - Red Oak
   - Finlay
   - Green Coral
   - Red Coral
   - Butterhead
   - Kale
   - Rocket
7. เพิ่ม Settings เริ่มต้น เช่น appName, groupName, defaultUnitType, defaultYieldUnit
8. ห้ามลบข้อมูลเดิม
9. ถ้า header มีอยู่แล้ว ไม่ควรเขียนทับข้อมูลแถวอื่น

ให้เพิ่ม comment อธิบายวิธีเรียก seedInitialData ตอน deploy ครั้งแรก
```

## ผลลัพธ์ที่ควรได้

มีระบบสร้างชีตและข้อมูลผักตั้งต้นอัตโนมัติ

---

# Step 14: เชื่อม Frontend กับ Apps Script จริง

## ใช้เมื่อไร

ใช้หลัง deploy Apps Script Web App แล้วมี URL จริง

## Prompt

```txt
ให้เชื่อม Frontend ของ GrowDay กับ Google Apps Script Web App จริง

งานที่ต้องทำ:
1. เปิดไฟล์ js/config.js
2. ตรวจว่ามีตัวแปร WEB_APP_URL
3. ใส่ comment แนะนำตำแหน่งที่ต้องวาง URL จาก Apps Script
4. ตรวจ js/api.js ว่าเรียก endpoint จาก WEB_APP_URL เท่านั้น
5. ตรวจทุกหน้าให้ใช้ API client จาก js/api.js
6. ห้ามเรียก fetch ตรงกระจัดกระจายในไฟล์อื่น
7. ถ้า WEB_APP_URL ยังว่าง ให้แสดงข้อความแนะนำผู้ใช้/ผู้พัฒนา
8. หลังตั้งค่าแล้ว getInitialData ต้องโหลดข้อมูลจริงจาก Apps Script

ข้อห้าม:
- ห้าม hardcode URL หลายจุด
- ห้ามใช้ mock data เป็นหลัก
- ห้ามเปลี่ยน API action
- ห้ามเปลี่ยน response format
```

## ผลลัพธ์ที่ควรได้

Frontend พร้อมเรียก Apps Script endpoint จริงจาก config จุดเดียว

---

# Step 15: ทดสอบ Flow ทั้งระบบ

## ใช้เมื่อไร

ใช้หลัง Frontend และ Apps Script พร้อมแล้ว

## Prompt

```txt
ช่วยตรวจและสร้าง checklist ทดสอบระบบ GrowDay ทั้ง flow ตามเอกสาร:

- docs/APP_SPEC.md
- docs/UI_FLOW.md
- docs/DATA_SCHEMA.md
- docs/API_SPEC.md
- docs/DEVELOPMENT_RULES.md

ให้ตรวจ flow ต่อไปนี้:
1. เปิดเว็บแอพ
2. โหลด getInitialData
3. แสดง Dashboard
4. ไปหน้าบันทึกการปลูก
5. เลือกผัก Green Cos
6. กรอกจำนวน 120 ช่องปลูก
7. เลือกวันที่ปลูก
8. ระบบคำนวณวันที่คาดว่าเก็บเกี่ยว
9. กดบันทึกการปลูก
10. ตรวจว่าข้อมูลถูกบันทึกใน Google Sheets
11. กลับมาหน้ารายการปลูก
12. ค้นหา/กรองสถานะ
13. กดบันทึกเก็บเกี่ยว
14. กรอกผลผลิตจริง 12.5 กก.
15. ตรวจว่า HarvestLogs เพิ่มข้อมูล
16. ตรวจว่า Plantings เปลี่ยน status เป็น harvested
17. ตรวจ Dashboard และ Summary เปลี่ยนตามข้อมูล

ให้ Codex ตรวจโค้ดว่ามีจุดไหนอาจผิด และแก้ไขเฉพาะ bug ที่พบ

ข้อห้าม:
- ห้าม refactor ใหญ่โดยไม่จำเป็น
- ห้ามเปลี่ยน schema
- ห้ามเพิ่มฟีเจอร์ใหม่
```

## ผลลัพธ์ที่ควรได้

ได้ checklist และแก้ bug ที่จำเป็นเท่านั้น

---

# Step 16: ปรับ UI มือถือและข้อความภาษาไทย

## ใช้เมื่อไร

ใช้หลังระบบทำงานแล้ว เพื่อปรับความเรียบร้อย

## Prompt

```txt
ให้ปรับ UI เว็บแอพ GrowDay ให้เหมาะกับมือถือและใช้งานง่ายขึ้น โดยยึด docs/UI_FLOW.md และ docs/DEVELOPMENT_RULES.md

ให้ตรวจและปรับ:
1. ขนาดตัวอักษรให้อ่านง่าย
2. ปุ่มให้กดง่ายบนมือถือ
3. card spacing ให้ไม่แน่นเกินไป
4. bottom navigation ให้ใช้งานชัดเจน
5. form label ให้ชัดเจน
6. error message ให้อยู่ใกล้ field
7. success message ให้เข้าใจง่าย
8. empty state ให้เป็นภาษาไทย
9. สีสถานะให้ดูง่าย:
   - growing
   - ready
   - harvested
   - cancelled
10. หน้าเว็บต้องไม่ล้นจอบนมือถือ

ข้อห้าม:
- ห้ามเปลี่ยน flow หลัก
- ห้ามเพิ่ม animation ซับซ้อน
- ห้ามเพิ่ม library
- ห้ามเปลี่ยน stack
- ห้ามทำ UI สวยเกินจริงจนสร้างยาก
```

## ผลลัพธ์ที่ควรได้

หน้าเว็บอ่านง่ายขึ้นและเหมาะกับการใช้งานจริงบนมือถือ

---

# Step 17: ตรวจความตรงกับเอกสารก่อนส่งมอบ

## ใช้เมื่อไร

ใช้เมื่อระบบใกล้เสร็จ เพื่อให้ Codex ตรวจงานเทียบเอกสาร

## Prompt

```txt
ช่วยตรวจโปรเจกต์ GrowDay ทั้งหมดว่าโค้ดตรงตามเอกสารหรือไม่:

- README.md
- docs/APP_SPEC.md
- docs/UI_FLOW.md
- docs/DATA_SCHEMA.md
- docs/API_SPEC.md
- docs/DEVELOPMENT_RULES.md

ให้ตรวจหัวข้อต่อไปนี้:
1. ใช้ stack ถูกต้องหรือไม่
2. มีฟีเจอร์ครบตาม MVP หรือไม่
3. มีฟีเจอร์เกินจำเป็นหรือไม่
4. UI ตรงตาม UI_FLOW.md หรือไม่
5. Google Sheets schema ตรง DATA_SCHEMA.md หรือไม่
6. API action ตรง API_SPEC.md หรือไม่
7. API response format ถูกต้องหรือไม่
8. ใช้ field name ตรงกันทุกไฟล์หรือไม่
9. วันที่ใช้รูปแบบ YYYY-MM-DD หรือไม่
10. มีการลบข้อมูลจริงหรือไม่
11. มี mock data ค้างอยู่หรือไม่
12. มี framework หรือ library ที่ห้ามใช้หรือไม่
13. มีจุดใดที่ควรแก้ก่อนส่งมอบ

ให้รายงานผลเป็น:
- ผ่าน
- ต้องแก้
- ข้อเสนอแนะ

ถ้าต้องแก้ ให้แก้เฉพาะจุดที่จำเป็นและอธิบายว่าแก้อะไร
```

## ผลลัพธ์ที่ควรได้

ได้รายงานตรวจงานและแก้เฉพาะจุดสำคัญ

---

# Step 18: สร้างคู่มือ Deploy

## ใช้เมื่อไร

ใช้เพื่อสร้างคู่มือ deploy ให้ผู้ใช้/ทีมงานทำตาม

## Prompt

```txt
ให้สร้างไฟล์ docs/DEPLOY_GUIDE.md สำหรับ GrowDay

คู่มือต้องอธิบายเป็นภาษาไทยแบบทำตามได้จริง สำหรับผู้ที่ไม่เชี่ยวชาญโค้ด

ต้องมีหัวข้อ:
1. สิ่งที่ต้องเตรียม
2. วิธีสร้าง Google Sheets
3. วิธีเปิด Apps Script
4. วิธีวาง Code.gs
5. วิธี Deploy เป็น Web App
6. วิธีเรียก seedInitialData
7. วิธีนำ Web App URL ไปใส่ใน js/config.js
8. วิธีเปิดทดสอบ index.html
9. วิธี deploy Frontend ผ่าน Cloudflare Pages หรือ GitHub Pages แบบง่าย
10. วิธีตรวจว่าระบบทำงานถูกต้อง
11. ปัญหาที่พบบ่อยและวิธีแก้
12. ข้อควรระวังเรื่องสิทธิ์การเข้าถึง

ข้อกำหนด:
- เขียนภาษาไทย
- เป็นขั้นตอนชัดเจน
- ไม่ใช้ศัพท์เทคนิคเกินจำเป็น
- ยึด API_SPEC.md และ DEVELOPMENT_RULES.md
```

## ผลลัพธ์ที่ควรได้

ได้ไฟล์คู่มือ deploy สำหรับส่งต่อผู้ใช้หรือทีมงาน

---

# Step 19: สร้างไฟล์ส่งมอบงาน

## ใช้เมื่อไร

ใช้ตอนท้ายสุดเพื่อสร้าง checklist ส่งมอบ

## Prompt

```txt
ให้สร้างไฟล์ docs/HANDOVER_CHECKLIST.md สำหรับ GrowDay

เนื้อหาต้องมี:
1. รายการไฟล์ที่ต้องส่งมอบ
2. รายการ Google Sheets ที่ต้องมี
3. รายการ Apps Script function ที่ต้องมี
4. รายการ API action ที่ต้องทดสอบ
5. รายการหน้าจอที่ต้องทดสอบ
6. checklist ก่อนส่งให้กลุ่มใช้งานจริง
7. checklist หลัง deploy
8. วิธีแก้ไขข้อมูลผักในชีต Crops
9. วิธีสำรองข้อมูล Google Sheets
10. ข้อจำกัดของระบบ MVP

ให้เขียนภาษาไทย เข้าใจง่าย และเหมาะสำหรับใช้ตรวจงานก่อนส่งมอบจริง
```

## ผลลัพธ์ที่ควรได้

ได้ checklist ส่งมอบงานแบบครบถ้วน

---

# Prompt เสริม A: ตรวจว่าหลุด Stack หรือไม่

ใช้เมื่อสงสัยว่า Codex เผลอเพิ่มของที่ไม่ควรใช้

```txt
ช่วยตรวจโปรเจกต์ GrowDay ว่ามีการใช้สิ่งที่ห้ามตาม docs/DEVELOPMENT_RULES.md หรือไม่

ให้ตรวจโดยเฉพาะ:
- React
- Vue
- Next.js
- npm
- package.json
- Vite
- Webpack
- Firebase
- Supabase
- database อื่น
- login system
- auth library
- chart library
- UI library หนัก ๆ
- field name ที่ไม่ตรง DATA_SCHEMA.md
- API action ที่ไม่ตรง API_SPEC.md

ให้รายงานสิ่งที่พบ และถ้าพบสิ่งที่ไม่ควรมี ให้เสนอวิธีเอาออกโดยไม่กระทบ MVP
```

---

# Prompt เสริม B: ตรวจ Field Name และ API Action

ใช้เมื่อพบปัญหา Frontend เรียก API แล้วข้อมูลไม่ขึ้น

```txt
ช่วยตรวจความตรงกันของ field name และ API action ในโปรเจกต์ GrowDay

ให้อ้างอิง:
- docs/DATA_SCHEMA.md
- docs/API_SPEC.md

ตรวจไฟล์:
- js/api.js
- js/app.js
- js/dashboard.js
- js/planting-form.js
- js/planting-list.js
- js/harvest-form.js
- js/summary.js
- apps-script/Code.gs

ให้ตรวจว่า:
1. ใช้ field name ตรง DATA_SCHEMA.md หรือไม่
2. ใช้ action ตรง API_SPEC.md หรือไม่
3. response format ตรง API_SPEC.md หรือไม่
4. มีการใช้ชื่อ field เก่า/ผิด/สะกดไม่ตรงหรือไม่
5. มีจุดไหนที่ทำให้ข้อมูลไม่แสดงหรือบันทึกไม่ได้หรือไม่

ถ้าพบปัญหา ให้แก้เฉพาะจุดที่ผิด ห้าม refactor ใหญ่
```

---

# Prompt เสริม C: ตรวจ Logic วันเก็บเกี่ยว

ใช้เมื่อวันที่คาดว่าเก็บเกี่ยวผิด

```txt
ช่วยตรวจ logic การคำนวณวันเก็บเกี่ยวของ GrowDay

ให้อ้างอิง:
- docs/DATA_SCHEMA.md
- docs/API_SPEC.md
- docs/DEVELOPMENT_RULES.md

กติกาที่ต้องถูกต้อง:
- plantedDate หมายถึงวันที่ย้ายต้นกล้าลงราง/ช่องปลูก
- expectedHarvestDate = plantedDate + harvestAgeDays
- harvestAgeDays ต้องดึงจากชีต Crops
- วันที่ต้องเก็บและส่งผ่าน API เป็น YYYY-MM-DD
- หน้าเว็บแสดงวันที่เป็น DD/MM/YYYY
- daysRemaining = expectedHarvestDate - today
- ถ้า daysRemaining > 0 แสดง เหลือ X วัน
- ถ้า daysRemaining = 0 แสดง พร้อมเก็บวันนี้
- ถ้า daysRemaining < 0 แสดง เลยกำหนด X วัน

ให้ตรวจไฟล์ที่เกี่ยวข้องทั้งหมดและแก้เฉพาะ bug ที่ทำให้วันที่ผิด
```

---

# Prompt เสริม D: ปรับข้อความให้เหมาะกับผู้ใช้ชุมชน

ใช้เมื่อ UI มีศัพท์เทคนิคมากเกินไป

```txt
ช่วยปรับข้อความใน UI ของ GrowDay ให้เหมาะกับผู้ใช้ทั่วไปในชุมชน

ให้อ้างอิง docs/DEVELOPMENT_RULES.md หัวข้อภาษาและข้อความ

ข้อกำหนด:
- ใช้ภาษาไทยง่าย
- หลีกเลี่ยงศัพท์เทคนิค เช่น API, payload, endpoint, schema, backend, database
- ข้อความ error ต้องบอกวิธีแก้แบบเข้าใจง่าย
- ปุ่มต้องสั้นและชัด
- label ของฟอร์มต้องตรงกับการใช้งานจริง
- ไม่เปลี่ยน logic
- ไม่เปลี่ยน field name
- ไม่เปลี่ยน API action
```

---

# Prompt เสริม E: ทำเวอร์ชัน Demo แบบไม่ต่อ API ชั่วคราว

ใช้เฉพาะกรณีอยากดูหน้าตา UI ก่อน โดยยังไม่ได้ deploy Apps Script

```txt
ให้สร้างโหมด Demo ชั่วคราวสำหรับ GrowDay เพื่อทดสอบ UI โดยยังไม่ต่อ Google Apps Script

ข้อกำหนด:
- โหมด Demo ต้องแยกชัดเจนในโค้ด
- ข้อมูล demo ต้องอยู่ในไฟล์เดียว เช่น js/demo-data.js
- ห้ามใช้ demo data แทน API ใน production
- ต้องมีตัวแปร DEMO_MODE ใน js/config.js
- ถ้า DEMO_MODE = true ให้ใช้ข้อมูล demo
- ถ้า DEMO_MODE = false ให้ใช้ API จริง
- ต้องมีข้อความบอกผู้พัฒนาว่ากำลังอยู่ใน Demo Mode
- ห้ามเปลี่ยน DATA_SCHEMA.md
- ห้ามเปลี่ยน API_SPEC.md
```

---

# Prompt เสริม F: เตรียมโค้ดให้ส่งขึ้น GitHub

ใช้ก่อน push ขึ้น GitHub

```txt
ช่วยตรวจโปรเจกต์ GrowDay ก่อน push ขึ้น GitHub

ให้ตรวจ:
1. ไม่มีข้อมูลลับ เช่น Web App URL ที่ไม่ควรเผยแพร่, token, email ส่วนตัว
2. ไม่มีไฟล์ขยะ
3. ไม่มี console.log ที่ไม่จำเป็นมากเกินไป
4. README.md อธิบายการเริ่มใช้งานได้
5. docs ครบ
6. โครงสร้างไฟล์อ่านง่าย
7. ไม่มี dependency ที่ไม่จำเป็น
8. ใช้ stack ตาม DEVELOPMENT_RULES.md
9. มี comment ตรงจุดที่ผู้ใช้ต้องตั้งค่าเอง เช่น WEB_APP_URL
10. พร้อม deploy ผ่าน static hosting

ถ้าพบปัญหา ให้แก้เฉพาะจุดที่จำเป็นและสรุปว่าแก้อะไร
```

---

# ลำดับ Prompt ที่แนะนำแบบย่อ

ถ้าต้องการทำแบบเร็ว ให้ใช้ชุดนี้ก่อน:

```txt
1. Step 0 ตรวจเอกสารและสรุปแผน
2. Step 1 สร้างโครงสร้างไฟล์
3. Step 2 สร้าง layout
4. Step 3 สร้าง state/utils
5. Step 4 สร้าง API client
6. Step 5 Dashboard
7. Step 6 บันทึกการปลูก
8. Step 7 รายการปลูก
9. Step 9 บันทึกเก็บเกี่ยว
10. Step 10 สรุปผลผลิต
11. Step 11 App controller
12. Step 12 Apps Script API
13. Step 13 seed Google Sheets
14. Step 14 เชื่อมต่อจริง
15. Step 15 ทดสอบ flow
16. Step 17 ตรวจตรงเอกสาร
```

---

# หมายเหตุสำคัญ

Prompt Pack นี้ออกแบบมาให้ Codex ทำงานแบบค่อยเป็นค่อยไป

อย่าสั่ง prompt ใหญ่ครั้งเดียวว่า “สร้างทั้งระบบให้เสร็จ” เพราะมีโอกาสสูงที่ Codex จะ:

```txt
- เพิ่ม framework เอง
- เปลี่ยน field name
- ทำ schema ไม่ตรง
- ทำ UI เกิน MVP
- เชื่อม API ไม่ตรง
- ลืม Google Apps Script
- ใช้ mock data ค้างไว้
```

วิธีที่ปลอดภัยที่สุดคือให้ทำทีละขั้น ตรวจทีละรอบ แล้วค่อยสั่งขั้นถัดไป
