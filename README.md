# GrowDay

**GrowDay** คือเว็บแอพสำหรับบันทึกการปลูก คำนวณวันเก็บเกี่ยว และบันทึกผลผลิตจริงของผักไฮโดรโปนิกส์  
พัฒนาสำหรับ **กลุ่มต่อยอดถุงทองผักสด** โดยเน้นให้ใช้งานง่ายบนมือถือ สร้างได้จริงด้วยเครื่องมือฟรี/ต้นทุนต่ำ และไม่ต้องมีระบบล็อกอิน

> เอกสารนี้ใช้เป็น README.md สำหรับกำกับการสร้างเว็บแอพให้ตรงตามเป้าหมาย MVP  
> เทคโนโลยีหลัก: **HTML5 + Tailwind CSS CDN + Vanilla JS + Google Apps Script + Google Sheets + Google Fonts**

---

## 1. วัตถุประสงค์ของระบบ

GrowDay ถูกออกแบบให้เป็นเครื่องมือกลางของกลุ่มผู้ปลูกผักไฮโดรโปนิกส์ สำหรับช่วยจัดการรอบการปลูกและการเก็บเกี่ยวแบบง่าย ไม่ซับซ้อน และใช้งานได้จริงในระดับชุมชน

### เป้าหมายหลัก

1. บันทึกรายการปลูกผักแต่ละรอบได้สะดวก
2. เลือกชนิดผักจากรายการที่กำหนดไว้
3. ระบุจำนวนที่ปลูกเป็น **จำนวนช่องปลูก/จำนวนต้น**
4. ระบุวันที่ปลูก และให้ระบบคำนวณวันที่คาดว่าจะเก็บเกี่ยวได้อัตโนมัติ
5. แสดงรายการปลูกทั้งหมดในรูปแบบที่อ่านง่ายบนมือถือ
6. แสดงจำนวนวันที่เหลือก่อนถึงวันเก็บเกี่ยว
7. บันทึกผลผลิตจริงเมื่อเก็บเกี่ยวแล้ว
8. สรุปภาพรวม เช่น กำลังปลูก, พร้อมเก็บเกี่ยว, เก็บเกี่ยววันนี้, ผลผลิตรวม
9. ใช้งานได้โดยไม่ต้องล็อกอิน เหมาะกับการใช้ภายในกลุ่ม

---

## 2. แนวคิดสำคัญของระบบ

### 2.1 วันที่ปลูกหมายถึงอะไร

ในระบบนี้ให้กำหนดว่า:

> **วันที่ปลูก = วันที่ย้ายต้นกล้าลงราง/ช่องปลูกไฮโดรโปนิกส์จริง**

ไม่ใช่วันที่เพาะเมล็ด

เหตุผล:

- ระยะเพาะกล้าอาจไม่เท่ากันในแต่ละรอบ
- สมาชิกกลุ่มเข้าใจง่ายกว่า
- คำนวณวันเก็บเกี่ยวได้แม่นกว่า
- ลดความซับซ้อนของระบบ MVP

---

### 2.2 หน่วยการปลูกที่เหมาะสม

สำหรับผักไฮโดรโปนิกส์ ควรใช้หน่วยหลักเป็น:

> **จำนวนช่องปลูก / จำนวนต้น**

เหตุผล:

- ระบบไฮโดรโปนิกส์มักมีราง โต๊ะ หรือแผงปลูกที่มีช่องปลูกชัดเจน
- โดยทั่วไป 1 ช่องปลูก = 1 ต้น
- ง่ายต่อการคำนวณผลผลิต
- ง่ายต่อการบันทึกและเข้าใจของผู้ใช้
- เหมาะกว่าการใช้ “พื้นที่ปลูก” เพราะพื้นที่ไม่ได้สะท้อนจำนวนต้นจริงเสมอไป

### หน่วยที่ระบบควรรองรับใน MVP

| หน่วย | ใช้เมื่อ |
|---|---|
| จำนวนช่องปลูก | ค่าเริ่มต้น แนะนำให้ใช้เป็นหลัก |
| จำนวนต้น | ใช้ในกรณีที่กลุ่มนับเป็นต้น |
| โต๊ะ/รางปลูก | ใช้เป็นข้อมูลเสริม ไม่ใช่หน่วยคำนวณหลัก |

---

## 3. รายชื่อผักเริ่มต้น

ระบบต้องมีรายการผักเริ่มต้น 10 รายการ ดังนี้

| ลำดับ | ชื่อผัก | ชื่อในระบบ | อายุเก็บเกี่ยวเริ่มต้นจากวันที่ย้ายลงราง | น้ำหนักเฉลี่ยต่อต้นโดยประมาณ |
|---:|---|---|---:|---:|
| 1 | กรีนคอส | Green Cos | 25 วัน | 0.12 กก. |
| 2 | มินิคอส | Mini Cos | 22 วัน | 0.10 กก. |
| 3 | กรีนโอ๊ค | Green Oak | 25 วัน | 0.12 กก. |
| 4 | เรดโอ๊ค | Red Oak | 25 วัน | 0.11 กก. |
| 5 | ฟินเลย์ | Finlay | 25 วัน | 0.11 กก. |
| 6 | กรีนคอรัล | Green Coral | 25 วัน | 0.12 กก. |
| 7 | เรดคอรัล | Red Coral | 25 วัน | 0.11 กก. |
| 8 | บัตเตอร์เฮด | Butterhead | 25 วัน | 0.13 กก. |
| 9 | เคล | Kale | 35 วัน | 0.10 กก. |
| 10 | ร็อกเก็ต | Rocket | 25 วัน | 0.05 กก. |

> ค่าอายุเก็บเกี่ยวและน้ำหนักเฉลี่ยเป็นค่าเริ่มต้นสำหรับระบบเท่านั้น  
> ต้องออกแบบให้แก้ไขได้ภายหลังผ่าน Google Sheets หรือหน้าตั้งค่าในเวอร์ชันต่อยอด

---

## 4. ขอบเขตฟังก์ชัน MVP

MVP คือรุ่นแรกที่ต้องทำให้ใช้งานจริงก่อน โดยไม่ใส่ฟังก์ชันซับซ้อนเกินจำเป็น

### 4.1 ฟังก์ชันที่ต้องมีใน MVP

1. หน้าแรก / Dashboard
2. บันทึกการปลูก
3. รายการปลูกทั้งหมด
4. แก้ไขรายการปลูก
5. ลบรายการปลูก
6. บันทึกเก็บเกี่ยว / บันทึกผลผลิตจริง
7. สรุปผลผลิตเบื้องต้น
8. ดึงข้อมูลจาก Google Sheets
9. บันทึกข้อมูลลง Google Sheets ผ่าน Google Apps Script

---

## 5. โครงสร้างหน้าจอ

ระบบออกแบบแบบ **Mobile-first** เป็นหลัก เพราะผู้ใช้งานมีแนวโน้มใช้งานผ่านโทรศัพท์มือถือ

### 5.1 หน้าจอหลักที่ต้องมี

| หน้า | ไฟล์ | หน้าที่ |
|---|---|---|
| หน้าแรก | `index.html` | Dashboard และเมนูลัด |
| บันทึกการปลูก | `plant.html` | กรอกข้อมูลรอบปลูก |
| รายการปลูก | `records.html` | แสดงรายการปลูกทั้งหมด |
| บันทึกเก็บเกี่ยว | `harvest.html` | บันทึกผลผลิตจริง |
| สรุปผลผลิต | `summary.html` | แสดงสรุปผลผลิตและสถิติ |
| ไฟล์ JS หลัก | `assets/js/app.js` | ฟังก์ชันกลางของระบบ |
| ไฟล์ API | `assets/js/api.js` | ติดต่อ Google Apps Script |
| ไฟล์ Helper | `assets/js/utils.js` | ฟังก์ชันช่วยคำนวณและจัดรูปแบบ |
| ไฟล์ CSS เสริม | `assets/css/custom.css` | กรณีต้องปรับเพิ่มจาก Tailwind |
| Manifest | `manifest.json` | สำหรับทำเป็น PWA เบื้องต้น |
| Service Worker | `service-worker.js` | เตรียมรองรับ PWA/Cache เบื้องต้น |

---

## 6. รายละเอียดแต่ละหน้าจอ

## 6.1 หน้าแรก / Dashboard

### เป้าหมาย

เปิดเว็บมาแล้วเห็นภาพรวมทันที และเข้าถึงเมนูสำคัญได้เร็ว

### สิ่งที่ต้องแสดง

1. ชื่อระบบ `GrowDay`
2. คำอธิบายสั้น ๆ เช่น `จัดการการปลูกผักไฮโดรโปนิกส์`
3. การ์ดสรุป 4 รายการ
   - กำลังปลูก
   - เก็บเกี่ยววันนี้
   - เก็บเกี่ยวภายใน 7 วัน
   - ผลผลิตเดือนนี้
4. เมนูด่วน
   - บันทึกการปลูก
   - รายการปลูก
   - บันทึกเก็บเกี่ยว
   - สรุปผลผลิต
5. รายการใกล้ถึงวันเก็บเกี่ยว
6. รายการปลูกล่าสุด
7. Bottom navigation

### ตัวอย่างข้อมูลบน Dashboard

| รายการ | ตัวอย่าง |
|---|---:|
| กำลังปลูก | 24 รายการ |
| เก็บเกี่ยววันนี้ | 3 รายการ |
| เก็บเกี่ยวภายใน 7 วัน | 9 รายการ |
| ผลผลิตเดือนนี้ | 186 กก. |

---

## 6.2 หน้าบันทึกการปลูก

### เป้าหมาย

ให้ผู้ใช้บันทึกข้อมูลการปลูกได้ง่ายที่สุด และระบบคำนวณวันเก็บเกี่ยวให้อัตโนมัติ

### ช่องข้อมูล

| ช่อง | ประเภท | จำเป็น | หมายเหตุ |
|---|---|---|---|
| ชนิดผัก | Dropdown | ใช่ | ดึงจากตาราง `Vegetables` |
| หน่วยปลูก | Dropdown | ใช่ | ค่าเริ่มต้น `จำนวนช่องปลูก` |
| จำนวนที่ปลูก | Number input | ใช่ | เช่น 120 |
| วันที่ปลูก | Date input | ใช่ | วันที่ย้ายลงราง/ช่องปลูก |
| วันที่คาดว่าเก็บเกี่ยวได้ | Auto calculate | ใช่ | ระบบคำนวณเอง |
| หมายเหตุ | Textarea | ไม่จำเป็น | เช่น แหล่งต้นกล้า, สูตรปุ๋ย, อุณหภูมิ |

### Logic การคำนวณ

```js
harvestDate = plantingDate + harvestDays
```

ตัวอย่าง:

- ผัก: Green Cos
- วันที่ปลูก: 05/06/2026
- อายุเก็บเกี่ยว: 25 วัน
- วันที่คาดว่าเก็บเกี่ยวได้: 30/06/2026

### ปุ่ม

- `บันทึกการปลูก`
- `ล้างข้อมูล`

---

## 6.3 หน้ารายการปลูก

### เป้าหมาย

แสดงข้อมูลรอบปลูกทั้งหมดในรูปแบบที่ใช้งานง่ายบนมือถือ

### ตัวกรองที่ควรมี

1. ค้นหาชื่อผัก
2. ทั้งหมด
3. กำลังปลูก
4. พร้อมเก็บ
5. เก็บแล้ว

### ข้อมูลที่แสดงในแต่ละรายการ

| ข้อมูล | ตัวอย่าง |
|---|---|
| ชื่อผัก | Green Cos |
| วันที่ปลูก | 05/06/2026 |
| วันที่เก็บเกี่ยวได้ | 30/06/2026 |
| จำนวนที่ปลูก | 120 ช่อง |
| อีกกี่วันจะถึงวันเก็บเกี่ยว | เหลือ 2 วัน |
| ผลผลิตจริง | 12.5 กก. |
| สถานะ | กำลังปลูก / พร้อมเก็บ / เก็บแล้ว / เลยกำหนด |

### ปุ่มต่อรายการ

- `แก้ไข`
- `ลบ`
- `เก็บเกี่ยว`

> บนมือถือไม่ควรใช้ตารางแนวนอนแบบ Desktop เพราะอ่านยาก  
> ให้แสดงเป็น “การ์ดรายการ” แต่ยังมีข้อมูลครบเหมือนตาราง

---

## 6.4 หน้าบันทึกเก็บเกี่ยว

### เป้าหมาย

บันทึกผลผลิตจริงหลังเก็บเกี่ยว เพื่อนำไปสรุปผลผลิตรวม

### ช่องข้อมูล

| ช่อง | ประเภท | จำเป็น | หมายเหตุ |
|---|---|---|---|
| เลือกรายการปลูก | Dropdown | ใช่ | แสดงเฉพาะรายการที่ยังไม่เก็บเกี่ยว |
| วันที่ปลูก | Read-only | ใช่ | ดึงจากรายการเดิม |
| วันที่กำหนดเก็บเกี่ยว | Read-only | ใช่ | ดึงจากรายการเดิม |
| จำนวนที่ปลูก | Read-only | ใช่ | ดึงจากรายการเดิม |
| วันที่เก็บเกี่ยวจริง | Date input | ใช่ | ค่าเริ่มต้นเป็นวันที่ปัจจุบัน |
| ปริมาณผลผลิต | Number input | ใช่ | เช่น 12.5 |
| หน่วย | Dropdown | ใช่ | ค่าเริ่มต้น `กก.` |
| หมายเหตุ | Textarea | ไม่จำเป็น | เช่น คุณภาพดี ส่งลูกค้าประจำ |

### เมื่อบันทึกเก็บเกี่ยวแล้ว

ระบบต้องอัปเดต:

- `actualHarvestDate`
- `actualYield`
- `yieldUnit`
- `status = harvested`
- `updatedAt`

---

## 6.5 หน้าสรุปผลผลิต

### เป้าหมาย

ให้กลุ่มเห็นภาพรวมผลผลิตและการปลูกแบบง่าย

### สิ่งที่ควรแสดงใน MVP

1. ผลผลิตรวมเดือนนี้
2. จำนวนรอบปลูกทั้งหมด
3. จำนวนรายการที่เก็บเกี่ยวแล้ว
4. จำนวนรายการที่ยังไม่เก็บเกี่ยว
5. ผักที่ให้ผลผลิตรวมสูงสุด
6. รายการผลผลิตล่าสุด

### สิ่งที่ยังไม่จำเป็นใน MVP

- กราฟซับซ้อน
- เปรียบเทียบรายปี
- Export PDF
- รายงานหลายมิติ

---

## 7. สถานะรายการปลูก

ระบบควรใช้สถานะมาตรฐานดังนี้

| สถานะ | ค่าในระบบ | เงื่อนไข |
|---|---|---|
| กำลังปลูก | `growing` | วันนี้ยังไม่ถึงวันเก็บเกี่ยว |
| พร้อมเก็บ | `ready` | วันนี้เท่ากับหรือมากกว่าวันเก็บเกี่ยว และยังไม่บันทึกเก็บเกี่ยว |
| เก็บแล้ว | `harvested` | มีการบันทึกผลผลิตจริงแล้ว |
| เลยกำหนด | `overdue` | เลยวันเก็บเกี่ยวมากกว่า 3 วัน และยังไม่เก็บเกี่ยว |

### Logic สถานะเบื้องต้น

```js
if (status === 'harvested') {
  return 'harvested'
}

if (today < expectedHarvestDate) {
  return 'growing'
}

if (today >= expectedHarvestDate && daysLate <= 3) {
  return 'ready'
}

if (daysLate > 3) {
  return 'overdue'
}
```

---

## 8. โครงสร้าง Google Sheets

ให้สร้าง Google Sheets 1 ไฟล์ ชื่อแนะนำ:

```txt
GrowDay Database
```

ภายในมีชีตอย่างน้อย 3 ชีต

1. `Vegetables`
2. `Plantings`
3. `Settings`

---

## 8.1 Sheet: Vegetables

ใช้เก็บข้อมูลชนิดผัก อายุเก็บเกี่ยว และน้ำหนักเฉลี่ย

### Columns

| Column | Field | รายละเอียด | ตัวอย่าง |
|---|---|---|---|
| A | id | รหัสผัก | veg_001 |
| B | nameTH | ชื่อภาษาไทย | กรีนคอส |
| C | nameEN | ชื่อภาษาอังกฤษ | Green Cos |
| D | harvestDays | อายุเก็บเกี่ยว | 25 |
| E | avgWeightKg | น้ำหนักเฉลี่ยต่อต้น | 0.12 |
| F | active | เปิดใช้งาน | TRUE |
| G | sortOrder | ลำดับแสดงผล | 1 |
| H | createdAt | วันที่สร้าง | 2026-06-08T10:00:00+07:00 |
| I | updatedAt | วันที่แก้ไข | 2026-06-08T10:00:00+07:00 |

### ข้อมูลเริ่มต้น

```csv
id,nameTH,nameEN,harvestDays,avgWeightKg,active,sortOrder
veg_001,กรีนคอส,Green Cos,25,0.12,TRUE,1
veg_002,มินิคอส,Mini Cos,22,0.10,TRUE,2
veg_003,กรีนโอ๊ค,Green Oak,25,0.12,TRUE,3
veg_004,เรดโอ๊ค,Red Oak,25,0.11,TRUE,4
veg_005,ฟินเลย์,Finlay,25,0.11,TRUE,5
veg_006,กรีนคอรัล,Green Coral,25,0.12,TRUE,6
veg_007,เรดคอรัล,Red Coral,25,0.11,TRUE,7
veg_008,บัตเตอร์เฮด,Butterhead,25,0.13,TRUE,8
veg_009,เคล,Kale,35,0.10,TRUE,9
veg_010,ร็อกเก็ต,Rocket,25,0.05,TRUE,10
```

---

## 8.2 Sheet: Plantings

ใช้เก็บข้อมูลการปลูกและการเก็บเกี่ยว

### Columns

| Column | Field | รายละเอียด | ตัวอย่าง |
|---|---|---|---|
| A | id | รหัสรายการปลูก | plt_20260608_001 |
| B | vegetableId | รหัสผัก | veg_001 |
| C | vegetableName | ชื่อผักที่บันทึก | Green Cos |
| D | unitType | หน่วยปลูก | slot |
| E | quantity | จำนวนที่ปลูก | 120 |
| F | plantDate | วันที่ปลูก | 2026-06-05 |
| G | expectedHarvestDate | วันที่คาดว่าจะเก็บเกี่ยว | 2026-06-30 |
| H | actualHarvestDate | วันที่เก็บเกี่ยวจริง | 2026-06-30 |
| I | expectedYieldKg | ผลผลิตคาดการณ์ | 14.4 |
| J | actualYield | ผลผลิตจริง | 12.5 |
| K | yieldUnit | หน่วยผลผลิต | kg |
| L | status | สถานะ | growing |
| M | note | หมายเหตุ | โต๊ะ A |
| N | createdAt | วันที่สร้าง | ISO datetime |
| O | updatedAt | วันที่แก้ไข | ISO datetime |
| P | deletedAt | วันที่ลบ | ว่างถ้ายังไม่ลบ |

### หมายเหตุ

- การลบข้อมูลควรใช้ soft delete โดยใส่ค่าใน `deletedAt`
- ไม่ควรลบแถวจริงออกจาก Google Sheets ทันที
- ช่วยให้ตรวจสอบย้อนหลังได้

---

## 8.3 Sheet: Settings

ใช้เก็บค่าตั้งค่าทั่วไป

### Columns

| Column | Field | Value | รายละเอียด |
|---|---|---|---|
| A | key | appName | ชื่อระบบ |
| B | value | GrowDay | ค่า |
| C | description | ชื่อเว็บแอพ | คำอธิบาย |

### ตัวอย่างข้อมูล

```csv
key,value,description
appName,GrowDay,ชื่อเว็บแอพ
groupName,กลุ่มต่อยอดถุงทองผักสด,ชื่อกลุ่มผู้ใช้งาน
defaultUnit,slot,หน่วยปลูกเริ่มต้น
yieldUnit,kg,หน่วยผลผลิตเริ่มต้น
```

---

## 9. โครงสร้างโปรเจกต์ Frontend

```txt
growday/
├── index.html
├── plant.html
├── records.html
├── harvest.html
├── summary.html
├── manifest.json
├── service-worker.js
├── assets/
│   ├── css/
│   │   └── custom.css
│   ├── js/
│   │   ├── app.js
│   │   ├── api.js
│   │   └── utils.js
│   └── icons/
│       ├── icon-192.png
│       └── icon-512.png
└── README.md
```

---

## 10. แนวทาง UI/UX

### 10.1 หลักการออกแบบ

1. Mobile-first
2. ปุ่มใหญ่ กดง่าย
3. ใช้ภาษาไทยเป็นหลัก
4. ไม่ซ่อนฟังก์ชันสำคัญหลายชั้น
5. สีหลักเป็นเขียว สื่อถึงผักสดและการเกษตร
6. พื้นหลังขาวหรือเขียวอ่อนมาก เพื่อให้อ่านง่าย
7. ใช้การ์ดแทนตารางแนวนอนบนมือถือ
8. แสดงสถานะด้วย badge สี
9. ใช้ตัวเลขใหญ่ใน Dashboard
10. ใช้ Bottom Navigation 4 เมนู

### 10.2 เมนูหลักด้านล่าง

| เมนู | ไฟล์ | หน้าที่ |
|---|---|---|
| หน้าแรก | `index.html` | Dashboard |
| ปลูก | `plant.html` หรือ `records.html` | บันทึก/ดูรายการปลูก |
| เก็บเกี่ยว | `harvest.html` | บันทึกผลผลิต |
| สรุป | `summary.html` | สรุปผลผลิต |

### 10.3 โทนสีแนะนำ

| บทบาท | สี | Tailwind |
|---|---|---|
| สีหลัก | เขียว | `green-700` |
| สีรอง | เขียวอ่อน | `green-100` |
| พื้นหลัง | ขาว/เทาอ่อน | `white`, `slate-50` |
| ข้อความหลัก | ดำเทา | `slate-900` |
| ข้อความรอง | เทา | `slate-500` |
| เตือนใกล้เก็บ | เหลืองอ่อน | `amber-100` |
| พร้อมเก็บ | เขียวอ่อน | `green-100` |
| เลยกำหนด | แดงอ่อน | `red-100` |

---

## 11. Google Fonts

แนะนำใช้ฟอนต์:

```html
<link href="https://fonts.googleapis.com/css2?family=Noto+Sans+Thai:wght@400;500;600;700&display=swap" rel="stylesheet">
```

และกำหนด CSS:

```css
body {
  font-family: 'Noto Sans Thai', sans-serif;
}
```

---

## 12. Tailwind CSS CDN

ใน MVP สามารถใช้ Tailwind CDN ได้ เพื่อให้เริ่มต้นง่าย

```html
<script src="https://cdn.tailwindcss.com"></script>
```

> หมายเหตุ: หากระบบใช้งานจริงระยะยาวและต้องการประสิทธิภาพสูงขึ้น สามารถเปลี่ยนเป็น Tailwind build process ภายหลังได้ แต่ MVP ยังไม่จำเป็น

---

## 13. Google Apps Script API

ระบบ Backend ใช้ Google Apps Script เป็น Web App เพื่อรับ/ส่งข้อมูลกับ Google Sheets

### 13.1 Endpoint หลัก

ให้สร้าง Web App URL จาก Google Apps Script แล้วนำไปใส่ในไฟล์ `api.js`

```js
const API_URL = 'YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL';
```

---

## 13.2 รูปแบบ Request มาตรฐาน

ใช้ `POST` เป็นหลัก

```js
{
  "action": "createPlanting",
  "payload": {
    "vegetableId": "veg_001",
    "unitType": "slot",
    "quantity": 120,
    "plantDate": "2026-06-05",
    "note": "โต๊ะ A"
  }
}
```

---

## 13.3 รูปแบบ Response มาตรฐาน

### สำเร็จ

```json
{
  "success": true,
  "data": {},
  "message": "success"
}
```

### ผิดพลาด

```json
{
  "success": false,
  "error": "ERROR_MESSAGE",
  "message": "เกิดข้อผิดพลาด"
}
```

---

## 13.4 Actions ที่ต้องมี

| Action | หน้าที่ |
|---|---|
| `getVegetables` | ดึงรายการผัก |
| `getPlantings` | ดึงรายการปลูก |
| `createPlanting` | บันทึกการปลูก |
| `updatePlanting` | แก้ไขรายการปลูก |
| `deletePlanting` | ลบรายการปลูกแบบ soft delete |
| `recordHarvest` | บันทึกผลผลิตจริง |
| `getDashboardSummary` | ดึงข้อมูลสรุปหน้าแรก |
| `getProductionSummary` | ดึงข้อมูลสรุปผลผลิต |

---

## 14. ตัวอย่าง Frontend API Wrapper

ไฟล์ `assets/js/api.js`

```js
const API_URL = 'YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL';

async function callApi(action, payload = {}) {
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      body: JSON.stringify({ action, payload }),
      headers: {
        'Content-Type': 'text/plain;charset=utf-8'
      }
    });

    const result = await response.json();

    if (!result.success) {
      throw new Error(result.message || 'เกิดข้อผิดพลาด');
    }

    return result.data;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
}

async function getVegetables() {
  return callApi('getVegetables');
}

async function getPlantings() {
  return callApi('getPlantings');
}

async function createPlanting(payload) {
  return callApi('createPlanting', payload);
}

async function recordHarvest(payload) {
  return callApi('recordHarvest', payload);
}
```

> ใช้ `Content-Type: text/plain` เพื่อลดปัญหา CORS กับ Google Apps Script Web App

---

## 15. ตัวอย่าง Google Apps Script

ไฟล์ `Code.gs`

```js
const SHEET_NAMES = {
  VEGETABLES: 'Vegetables',
  PLANTINGS: 'Plantings',
  SETTINGS: 'Settings'
};

function doPost(e) {
  try {
    const body = JSON.parse(e.postData.contents);
    const action = body.action;
    const payload = body.payload || {};

    let data;

    switch (action) {
      case 'getVegetables':
        data = getVegetables();
        break;

      case 'getPlantings':
        data = getPlantings();
        break;

      case 'createPlanting':
        data = createPlanting(payload);
        break;

      case 'updatePlanting':
        data = updatePlanting(payload);
        break;

      case 'deletePlanting':
        data = deletePlanting(payload);
        break;

      case 'recordHarvest':
        data = recordHarvest(payload);
        break;

      case 'getDashboardSummary':
        data = getDashboardSummary();
        break;

      case 'getProductionSummary':
        data = getProductionSummary();
        break;

      default:
        throw new Error('Unknown action: ' + action);
    }

    return jsonResponse({
      success: true,
      data,
      message: 'success'
    });

  } catch (error) {
    return jsonResponse({
      success: false,
      error: String(error),
      message: error.message || 'เกิดข้อผิดพลาด'
    });
  }
}

function jsonResponse(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

function getSheet(name) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(name);
  if (!sheet) throw new Error('Sheet not found: ' + name);
  return sheet;
}

function getVegetables() {
  const sheet = getSheet(SHEET_NAMES.VEGETABLES);
  const values = sheet.getDataRange().getValues();
  const headers = values.shift();

  return values
    .map(rowToObject(headers))
    .filter(item => String(item.active).toUpperCase() === 'TRUE')
    .sort((a, b) => Number(a.sortOrder || 0) - Number(b.sortOrder || 0));
}

function getPlantings() {
  const sheet = getSheet(SHEET_NAMES.PLANTINGS);
  const values = sheet.getDataRange().getValues();
  const headers = values.shift();

  return values
    .map(rowToObject(headers))
    .filter(item => !item.deletedAt);
}

function rowToObject(headers) {
  return function(row) {
    const obj = {};
    headers.forEach((header, index) => {
      obj[header] = row[index];
    });
    return obj;
  };
}
```

> หมายเหตุ: ตัวอย่างข้างต้นเป็นโครงเริ่มต้น ยังต้องเติมฟังก์ชัน `createPlanting`, `updatePlanting`, `deletePlanting`, `recordHarvest`, `getDashboardSummary` และ `getProductionSummary`

---

## 16. Utility Functions ที่ต้องมี

ไฟล์ `assets/js/utils.js`

### 16.1 คำนวณวันเก็บเกี่ยว

```js
function addDays(dateString, days) {
  const date = new Date(dateString);
  date.setDate(date.getDate() + Number(days));
  return date.toISOString().slice(0, 10);
}
```

### 16.2 คำนวณจำนวนวันที่เหลือ

```js
function daysBetween(fromDate, toDate) {
  const start = new Date(fromDate);
  const end = new Date(toDate);
  const diff = end - start;
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}
```

### 16.3 แปลงวันที่เป็นรูปแบบไทยแบบสั้น

```js
function formatDateTH(dateString) {
  if (!dateString) return '-';

  const date = new Date(dateString);
  return date.toLocaleDateString('th-TH', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
}
```

### 16.4 สร้างรหัสรายการปลูก

```js
function generateId(prefix = 'plt') {
  const now = new Date();
  const timestamp = now.getTime();
  return `${prefix}_${timestamp}`;
}
```

---

## 17. Logic การคำนวณผลผลิตคาดการณ์

สูตร:

```txt
ผลผลิตคาดการณ์ = จำนวนที่ปลูก x น้ำหนักเฉลี่ยต่อต้น
```

ตัวอย่าง:

```txt
จำนวนที่ปลูก = 120 ช่อง
น้ำหนักเฉลี่ย Green Cos = 0.12 กก./ต้น

ผลผลิตคาดการณ์ = 120 x 0.12 = 14.4 กก.
```

### ข้อควรระวัง

- ผลผลิตจริงอาจน้อยกว่าหรือมากกว่าค่าคาดการณ์
- น้ำหนักเฉลี่ยต้องปรับจากประสบการณ์จริงของกลุ่ม
- ใน MVP ให้ใช้เป็นค่าประมาณเพื่อวางแผนเท่านั้น

---

## 18. การจัดการสถานะอัตโนมัติ

สถานะควรคำนวณจากข้อมูลจริงทุกครั้งที่โหลดรายการ ไม่จำเป็นต้องบันทึกสถานะใหม่ทุกครั้ง เว้นแต่เป็น `harvested`

### Function ตัวอย่าง

```js
function getPlantingStatus(item, today = new Date()) {
  if (item.status === 'harvested' || item.actualHarvestDate) {
    return 'harvested';
  }

  const todayString = today.toISOString().slice(0, 10);
  const daysLeft = daysBetween(todayString, item.expectedHarvestDate);

  if (daysLeft > 0) {
    return 'growing';
  }

  if (daysLeft <= 0 && daysLeft >= -3) {
    return 'ready';
  }

  return 'overdue';
}
```

---

## 19. การ Deploy

## 19.1 Frontend

แนะนำใช้ **Cloudflare Pages**

### ขั้นตอน

1. สร้าง GitHub Repository เช่น `growday`
2. ใส่ไฟล์ frontend ทั้งหมดลง repository
3. เชื่อม Cloudflare Pages กับ GitHub
4. ตั้งค่า build:
   - Framework preset: `None`
   - Build command: ว่าง
   - Output directory: `/`
5. Deploy

---

## 19.2 Backend

ใช้ Google Apps Script

### ขั้นตอน

1. สร้าง Google Sheets ชื่อ `GrowDay Database`
2. สร้างชีต `Vegetables`, `Plantings`, `Settings`
3. เปิด Extensions > Apps Script
4. วางโค้ด `Code.gs`
5. Deploy > New deployment
6. เลือก Type: Web app
7. Execute as: Me
8. Who has access: Anyone
9. Copy Web App URL
10. นำ URL ไปใส่ใน `assets/js/api.js`

---

## 20. PWA เบื้องต้น

MVP สามารถเตรียมให้ “เพิ่มไปยังหน้าจอมือถือ” ได้

### manifest.json

```json
{
  "name": "GrowDay",
  "short_name": "GrowDay",
  "description": "ระบบจัดการการปลูกผักไฮโดรโปนิกส์",
  "start_url": "./index.html",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#15803d",
  "icons": [
    {
      "src": "assets/icons/icon-192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "assets/icons/icon-512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
```

---

## 21. ข้อกำหนดด้านการใช้งานจริง

### ต้องทำ

- ใช้งานบนมือถือได้ดี
- หน้าโหลดเร็ว
- ปุ่มใหญ่ อ่านง่าย
- บันทึกข้อมูลได้จริงลง Google Sheets
- แสดง Loading ขณะดึงข้อมูล
- แสดงข้อความเมื่อบันทึกสำเร็จ
- แสดงข้อความเมื่อเกิดข้อผิดพลาด
- ป้องกันการกดบันทึกซ้ำ
- Validate ข้อมูลก่อนส่ง API
- รองรับกรณีไม่มีข้อมูล
- รองรับกรณีอินเทอร์เน็ตช้า

### ไม่ควรทำใน MVP

- ไม่ต้องมีระบบล็อกอิน
- ไม่ต้องมีระบบสมาชิก
- ไม่ต้องมีสิทธิ์หลายระดับ
- ไม่ต้องมีกราฟซับซ้อน
- ไม่ต้องมีระบบแจ้งเตือน LINE ในรุ่นแรก
- ไม่ต้องมีระบบจัดการรูปภาพ
- ไม่ต้องทำให้หน้าตาสวยเกินจนพัฒนายาก
- ไม่ต้องใช้ Framework ใหญ่ เช่น React/Vue หากยังไม่จำเป็น

---

## 22. Validation Rules

### บันทึกการปลูก

| Field | Rule |
|---|---|
| vegetableId | ต้องเลือก |
| unitType | ต้องเลือก |
| quantity | ต้องเป็นตัวเลขมากกว่า 0 |
| plantDate | ต้องเลือกวันที่ |
| note | ไม่เกิน 200 ตัวอักษร |

### บันทึกเก็บเกี่ยว

| Field | Rule |
|---|---|
| plantingId | ต้องเลือก |
| actualHarvestDate | ต้องเลือกวันที่ |
| actualYield | ต้องเป็นตัวเลขมากกว่าหรือเท่ากับ 0 |
| yieldUnit | ต้องเลือก |
| note | ไม่เกิน 200 ตัวอักษร |

---

## 23. Error Message ภาษาไทย

| กรณี | ข้อความ |
|---|---|
| ไม่ได้เลือกชนิดผัก | กรุณาเลือกชนิดผัก |
| ไม่ได้ใส่จำนวน | กรุณาระบุจำนวนที่ปลูก |
| จำนวนไม่ถูกต้อง | จำนวนที่ปลูกต้องมากกว่า 0 |
| ไม่ได้เลือกวันที่ปลูก | กรุณาเลือกวันที่ปลูก |
| บันทึกสำเร็จ | บันทึกข้อมูลเรียบร้อยแล้ว |
| บันทึกไม่สำเร็จ | ไม่สามารถบันทึกข้อมูลได้ กรุณาลองใหม่ |
| โหลดข้อมูลไม่ได้ | ไม่สามารถโหลดข้อมูลได้ กรุณาตรวจสอบอินเทอร์เน็ต |
| ไม่พบข้อมูล | ยังไม่มีข้อมูลในระบบ |

---

## 24. Loading / Empty / Error States

### Loading

แสดงข้อความ:

```txt
กำลังโหลดข้อมูล...
```

หรือ skeleton card แบบง่าย

### Empty State

กรณียังไม่มีรายการปลูก:

```txt
ยังไม่มีรายการปลูก
เริ่มบันทึกการปลูกครั้งแรกได้เลย
```

พร้อมปุ่ม:

```txt
+ บันทึกการปลูก
```

### Error State

กรณีโหลดข้อมูลไม่ได้:

```txt
โหลดข้อมูลไม่สำเร็จ
กรุณาตรวจสอบอินเทอร์เน็ตแล้วลองใหม่
```

พร้อมปุ่ม:

```txt
ลองอีกครั้ง
```

---

## 25. Accessibility ขั้นพื้นฐาน

ควรทำอย่างน้อย:

1. ปุ่มต้องมีข้อความชัดเจน
2. สีตัวอักษรตัดกับพื้นหลัง
3. Form field ต้องมี label
4. ขนาดตัวอักษรหลักไม่น้อยกว่า 16px
5. ปุ่มกดควรสูงอย่างน้อย 44px
6. ไม่ใช้สีเพียงอย่างเดียวในการบอกสถานะ ควรมีข้อความกำกับด้วย
7. รองรับการใช้งานบนหน้าจอมือถือขนาดเล็ก

---

## 26. Performance

ระบบควรเบาและเร็ว

### แนวทาง

- ใช้ Vanilla JS
- ไม่ใช้ library หนักโดยไม่จำเป็น
- ลดรูปภาพในหน้าเว็บ
- ใช้ SVG icon หรือ emoji/icon font เท่าที่จำเป็น
- ดึงข้อมูลเท่าที่ใช้
- Cache รายการผักไว้ใน `localStorage` ได้
- กรณีข้อมูลรายการปลูกมากขึ้น ให้แบ่งหน้า หรือแสดงเฉพาะล่าสุดก่อน

---

## 27. LocalStorage ที่แนะนำ

ใช้เก็บข้อมูลชั่วคราวเพื่อให้ใช้งานสะดวกขึ้น

| Key | ใช้เก็บ |
|---|---|
| `GROWDAY_VEGETABLES_CACHE` | รายการผัก |
| `GROWDAY_LAST_SYNC` | เวลาดึงข้อมูลล่าสุด |
| `GROWDAY_DRAFT_PLANTING` | ข้อมูลที่กรอกค้างไว้ |
| `GROWDAY_SELECTED_FILTER` | ตัวกรองล่าสุด |

> LocalStorage ใช้เพื่อความสะดวกเท่านั้น  
> ข้อมูลจริงต้องอยู่ใน Google Sheets

---

## 28. Security และข้อควรระวัง

เนื่องจากระบบไม่มีล็อกอิน และ Google Apps Script Web App เปิดแบบ Anyone จึงควรระวังดังนี้

### ข้อควรทำ

1. อย่าเก็บข้อมูลส่วนบุคคลที่อ่อนไหว
2. ใช้เฉพาะข้อมูลการปลูกและผลผลิต
3. ตรวจสอบ action ที่อนุญาตใน Apps Script
4. Validate ข้อมูลฝั่ง Apps Script อีกครั้ง
5. อาจเพิ่ม `APP_SECRET` แบบง่ายในอนาคต ถ้าต้องการลดความเสี่ยงจากคนภายนอกเรียก API
6. ไม่แสดง URL ของ API ในที่สาธารณะเกินจำเป็น

### ข้อจำกัด

- ถ้าใครรู้ URL หน้าเว็บและ API อาจเข้าถึงระบบได้
- เหมาะกับระบบภายในกลุ่มขนาดเล็ก
- หากขยายใช้งานวงกว้าง ควรเพิ่มระบบล็อกอินหรือสิทธิ์ผู้ดูแล

---

## 29. Definition of Done

งาน MVP ถือว่าเสร็จเมื่อ:

- [ ] เปิดเว็บบนมือถือได้ถูกต้อง
- [ ] หน้าแรกแสดง Dashboard ได้
- [ ] ดึงรายการผักจาก Google Sheets ได้
- [ ] บันทึกการปลูกลง Google Sheets ได้
- [ ] ระบบคำนวณวันเก็บเกี่ยวอัตโนมัติได้
- [ ] แสดงรายการปลูกทั้งหมดได้
- [ ] ค้นหา/กรองรายการปลูกได้
- [ ] แก้ไขรายการปลูกได้
- [ ] ลบรายการปลูกแบบ soft delete ได้
- [ ] บันทึกผลผลิตจริงได้
- [ ] สถานะเปลี่ยนเป็นเก็บแล้วหลังบันทึกผลผลิต
- [ ] หน้าสรุปผลผลิตแสดงข้อมูลรวมได้
- [ ] มี Loading, Empty, Error state
- [ ] ใช้ภาษาไทยอ่านง่าย
- [ ] UI ตรงกับแนวทาง mockup
- [ ] ไม่มีระบบล็อกอิน
- [ ] Deploy frontend ได้
- [ ] Deploy Google Apps Script Web App ได้

---

## 30. Roadmap การพัฒนา

### Phase 1: MVP

- สร้าง Google Sheets
- สร้าง Apps Script API
- สร้างหน้าเว็บ 5 หน้า
- เชื่อม API
- บันทึกและแสดงข้อมูลจริง
- Deploy ใช้งานจริง

### Phase 2: ปรับปรุงการใช้งาน

- เพิ่มหน้าตั้งค่าผัก
- แก้ไขอายุเก็บเกี่ยวผ่านหน้าเว็บ
- เพิ่มรายงานรายเดือน
- เพิ่ม export CSV
- เพิ่มตัวกรองตามช่วงวันที่

### Phase 3: ระบบช่วยวางแผน

- คาดการณ์ผลผลิตรวมล่วงหน้า
- แจ้งเตือนรายการใกล้เก็บเกี่ยวผ่าน LINE
- บันทึก pH/EC รายวัน
- กราฟเปรียบเทียบผลผลิตคาดการณ์กับผลผลิตจริง
- ระบบผู้ใช้/ผู้ดูแล หากจำเป็น

---

## 31. Prompt สำหรับ AI Coding Agent

ใช้ข้อความนี้เพื่อกำกับ AI หรือทีมพัฒนาให้สร้างระบบตรงตามต้องการ

```txt
สร้างเว็บแอพชื่อ GrowDay สำหรับกลุ่มต่อยอดถุงทองผักสด เป็นระบบจัดการการปลูกผักไฮโดรโปนิกส์แบบ Mobile-first ใช้ HTML5 + Tailwind CSS CDN + Vanilla JavaScript เป็น frontend และใช้ Google Apps Script + Google Sheets เป็น backend/database

ระบบไม่ต้องมีล็อกอิน เปิดหน้าเว็บแล้วใช้งานได้ทันที

ให้สร้างฟังก์ชัน MVP ตามนี้:
1. Dashboard แสดงกำลังปลูก เก็บเกี่ยววันนี้ เก็บเกี่ยวภายใน 7 วัน และผลผลิตเดือนนี้
2. บันทึกการปลูก โดยเลือกชนิดผักจาก dropdown ระบุจำนวนช่องปลูก/จำนวนต้น ระบุวันที่ปลูก และคำนวณวันที่เก็บเกี่ยวได้อัตโนมัติ
3. รายการปลูกทั้งหมด แสดงชื่อผัก วันที่ปลูก วันที่เก็บเกี่ยวได้ อีกกี่วันจะถึงวันเก็บเกี่ยว จำนวนที่ปลูก ผลผลิตจริง และสถานะ
4. แก้ไข/ลบรายการปลูก
5. บันทึกเก็บเกี่ยว โดยเลือกจากรายการที่ยังไม่เก็บเกี่ยว ระบุวันที่เก็บเกี่ยวจริงและปริมาณผลผลิต
6. สรุปผลผลิตเบื้องต้น

ใช้ Google Sheets 3 ชีต:
- Vegetables
- Plantings
- Settings

ออกแบบ UI ให้เรียบง่าย ใช้งานจริงบนมือถือได้ ปุ่มใหญ่ อ่านง่าย สีหลักเขียว ขาว เทาอ่อน ไม่ใช้ดีไซน์ที่พัฒนาได้ยาก ไม่ใช้ framework หนัก ไม่ใช้ระบบล็อกอินใน MVP

วันที่ปลูกหมายถึงวันที่ย้ายต้นกล้าลงราง/ช่องปลูก ไม่ใช่วันที่เพาะเมล็ด
หน่วยหลักของการปลูกคือจำนวนช่องปลูก/จำนวนต้น
```

---

## 32. ข้อสรุปสำคัญ

GrowDay MVP ต้องเป็นระบบที่:

- ใช้งานง่าย
- บันทึกข้อมูลได้จริง
- คำนวณวันเก็บเกี่ยวได้อัตโนมัติ
- แสดงรายการปลูกบนมือถือได้ดี
- บันทึกผลผลิตจริงได้
- ใช้ Google Sheets เป็นฐานข้อมูล
- ไม่ต้องล็อกอิน
- พัฒนาด้วยโค้ดพื้นฐานที่ดูแลต่อได้
- พร้อมต่อยอดในอนาคตโดยไม่ต้องรื้อระบบใหม่

---

## 33. License / การนำไปใช้

เอกสารนี้จัดทำเพื่อใช้เป็นแนวทางพัฒนาเว็บแอพ GrowDay สำหรับกลุ่มต่อยอดถุงทองผักสด สามารถปรับแก้เนื้อหา ฟังก์ชัน และโครงสร้างให้เหมาะกับการใช้งานจริงของกลุ่มได้
