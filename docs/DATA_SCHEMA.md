# DATA_SCHEMA.md

เอกสารนี้กำหนดโครงสร้างฐานข้อมูลของเว็บแอพ **GrowDay** สำหรับใช้งานกับ **Google Sheets** เป็นฐานข้อมูลหลัก และเชื่อมต่อผ่าน **Google Apps Script Web App**

ไฟล์นี้เป็นเอกสารควบคุมสำคัญ ห้ามเปลี่ยนชื่อชีตหรือชื่อ field โดยไม่แก้ไขโค้ดฝั่ง Frontend และ Google Apps Script ให้ตรงกัน

---

## 1. ภาพรวมฐานข้อมูล

ระบบ GrowDay รุ่นแรก (MVP) ใช้ Google Sheets เป็นฐานข้อมูล โดยแนะนำให้มีชีตหลักดังนี้

```txt
GrowDay Database
├── Plantings
├── Crops
├── HarvestLogs
└── Settings
```

### คำอธิบายแต่ละชีต

| Sheet | ใช้สำหรับ | จำเป็นใน MVP |
|---|---|---|
| `Plantings` | เก็บรายการปลูกแต่ละรอบ | จำเป็น |
| `Crops` | เก็บข้อมูลชนิดผักและอายุเก็บเกี่ยวมาตรฐาน | จำเป็น |
| `HarvestLogs` | เก็บประวัติการเก็บเกี่ยวจริง | แนะนำให้มี |
| `Settings` | เก็บค่าตั้งค่าระบบพื้นฐาน | มีหรือไม่มีก็ได้ในรุ่นแรก |

> คำแนะนำ: แม้ระบบ MVP จะสามารถเก็บข้อมูลเก็บเกี่ยวไว้ใน `Plantings` ได้เลย แต่ควรแยก `HarvestLogs` ไว้ด้วย เพื่อรองรับกรณีเก็บเกี่ยวบางส่วนหลายครั้งในอนาคต

---

## 2. หลักการตั้งชื่อ Field

ให้ใช้รูปแบบ `camelCase` สำหรับ field ที่ส่งผ่าน API และใช้เป็น key ใน JavaScript

ตัวอย่าง:

```txt
cropName
plantedDate
expectedHarvestDate
actualHarvestDate
harvestAgeDays
createdAt
updatedAt
```

### ข้อห้าม

- ห้ามใช้ชื่อ field ภาษาไทยในโค้ด
- ห้ามมีเว้นวรรคในชื่อ field
- ห้ามเปลี่ยนชื่อ field โดยไม่แก้ `API_SPEC.md`
- ห้ามใช้ชื่อ field ไม่ตรงกันระหว่าง Google Sheets, Apps Script และ Frontend
- ห้ามใช้วันที่แบบข้อความที่ตีความยาก เช่น `5 มิ.ย. 69` ในฐานข้อมูล

---

## 3. รูปแบบวันที่และเวลา

### วันที่

ให้เก็บวันที่ในรูปแบบมาตรฐาน:

```txt
YYYY-MM-DD
```

ตัวอย่าง:

```txt
2026-06-05
```

### วันและเวลา

ให้เก็บ timestamp ในรูปแบบ ISO string:

```txt
YYYY-MM-DDTHH:mm:ss.sssZ
```

ตัวอย่าง:

```txt
2026-06-09T08:30:00.000Z
```

### การแสดงผลบนหน้าเว็บ

ในหน้าเว็บให้แสดงเป็นรูปแบบไทยที่อ่านง่าย:

```txt
05/06/2026
```

หรือ

```txt
5 มิ.ย. 2569
```

แต่ในฐานข้อมูลให้เก็บเป็น `YYYY-MM-DD` เท่านั้น

---

## 4. Sheet: Plantings

ชีตหลักสำหรับเก็บข้อมูลรายการปลูกแต่ละรอบ

### ชื่อชีต

```txt
Plantings
```

### หน้าที่ของชีต

- บันทึกว่าปลูกผักอะไร
- ปลูกวันที่เท่าไร
- ปลูกจำนวนเท่าไร
- คาดว่าจะเก็บเกี่ยวได้วันไหน
- ตอนนี้อยู่ในสถานะใด
- เก็บเกี่ยวจริงแล้วหรือยัง
- ได้ผลผลิตจริงเท่าไร

---

### โครงสร้างคอลัมน์

| Column | Field | Type | Required | Description | Example |
|---|---|---:|---:|---|---|
| A | `id` | string | yes | รหัสรายการปลูก ไม่ซ้ำกัน | `PLT-20260609-0001` |
| B | `cropId` | string | yes | รหัสชนิดผัก อ้างอิงจากชีต `Crops` | `green_cos` |
| C | `cropName` | string | yes | ชื่อผักสำหรับแสดงผล | `Green Cos` |
| D | `unitType` | string | yes | หน่วยการปลูก | `slot` |
| E | `unitLabel` | string | yes | ชื่อหน่วยที่แสดงบนหน้าเว็บ | `ช่องปลูก` |
| F | `quantity` | number | yes | จำนวนที่ปลูก | `120` |
| G | `plantedDate` | date string | yes | วันที่ย้ายต้นกล้าลงราง/ช่องปลูก | `2026-06-05` |
| H | `harvestAgeDays` | number | yes | อายุเก็บเกี่ยวมาตรฐานของผักชนิดนั้น | `25` |
| I | `expectedHarvestDate` | date string | yes | วันที่คาดว่าจะเก็บเกี่ยวได้ | `2026-06-30` |
| J | `daysRemaining` | number | no | อีกกี่วันถึงวันเก็บเกี่ยว คำนวณใหม่ได้ | `2` |
| K | `status` | string | yes | สถานะรายการปลูก | `growing` |
| L | `actualHarvestDate` | date string | no | วันที่เก็บเกี่ยวจริง | `2026-06-30` |
| M | `actualYield` | number | no | ปริมาณผลผลิตจริง | `12.5` |
| N | `yieldUnit` | string | no | หน่วยผลผลิต | `kg` |
| O | `note` | string | no | หมายเหตุ | `ราง A` |
| P | `createdAt` | datetime string | yes | วันที่สร้างข้อมูล | `2026-06-09T08:30:00.000Z` |
| Q | `updatedAt` | datetime string | yes | วันที่แก้ไขล่าสุด | `2026-06-09T08:30:00.000Z` |

---

### Header Row ที่ต้องใช้ใน Google Sheets

ให้แถวที่ 1 ของชีต `Plantings` เป็นดังนี้

```csv
id,cropId,cropName,unitType,unitLabel,quantity,plantedDate,harvestAgeDays,expectedHarvestDate,daysRemaining,status,actualHarvestDate,actualYield,yieldUnit,note,createdAt,updatedAt
```

---

### ตัวอย่างข้อมูลในชีต Plantings

| id | cropId | cropName | unitType | unitLabel | quantity | plantedDate | harvestAgeDays | expectedHarvestDate | daysRemaining | status | actualHarvestDate | actualYield | yieldUnit | note | createdAt | updatedAt |
|---|---|---|---|---|---:|---|---:|---|---:|---|---|---:|---|---|---|---|
| PLT-20260609-0001 | green_cos | Green Cos | slot | ช่องปลูก | 120 | 2026-06-05 | 25 | 2026-06-30 | 21 | growing |  |  | kg | ราง A | 2026-06-09T08:30:00.000Z | 2026-06-09T08:30:00.000Z |
| PLT-20260609-0002 | red_oak | Red Oak | slot | ช่องปลูก | 80 | 2026-06-07 | 28 | 2026-07-05 | 26 | growing |  |  | kg | ราง B | 2026-06-09T08:35:00.000Z | 2026-06-09T08:35:00.000Z |
| PLT-20260609-0003 | mini_cos | Mini Cos | slot | ช่องปลูก | 100 | 2026-05-15 | 25 | 2026-06-09 | 0 | ready |  |  | kg |  | 2026-06-09T08:40:00.000Z | 2026-06-09T08:40:00.000Z |
| PLT-20260609-0004 | green_oak | Green Oak | slot | ช่องปลูก | 90 | 2026-05-12 | 28 | 2026-06-09 | 0 | harvested | 2026-06-09 | 11.8 | kg | คุณภาพดี | 2026-06-09T08:45:00.000Z | 2026-06-09T09:10:00.000Z |

---

## 5. Sheet: Crops

ชีตสำหรับเก็บข้อมูลชนิดผักและค่ามาตรฐานที่ระบบใช้คำนวณ

### ชื่อชีต

```txt
Crops
```

### หน้าที่ของชีต

- เป็นแหล่งข้อมูล dropdown ชนิดผัก
- เก็บอายุเก็บเกี่ยวมาตรฐานของแต่ละชนิด
- กำหนดสถานะเปิด/ปิดการใช้งานของผักแต่ละรายการ
- ช่วยให้แก้ค่าอายุเก็บเกี่ยวได้โดยไม่ต้องแก้โค้ด

---

### โครงสร้างคอลัมน์

| Column | Field | Type | Required | Description | Example |
|---|---|---:|---:|---|---|
| A | `cropId` | string | yes | รหัสชนิดผัก ไม่ซ้ำกัน | `green_cos` |
| B | `cropName` | string | yes | ชื่อผักสำหรับแสดงผล | `Green Cos` |
| C | `thaiName` | string | no | ชื่อไทยหรือชื่อที่กลุ่มเรียก | `กรีนคอส` |
| D | `harvestAgeDays` | number | yes | อายุเก็บเกี่ยวหลังลงราง/ช่องปลูก | `25` |
| E | `defaultUnitType` | string | yes | หน่วยปลูกเริ่มต้น | `slot` |
| F | `defaultUnitLabel` | string | yes | ชื่อหน่วยที่แสดงผล | `ช่องปลูก` |
| G | `expectedYieldPerSlotKg` | number | no | ผลผลิตคาดการณ์ต่อ 1 ช่องปลูก หน่วยกิโลกรัม | `0.10` |
| H | `isActive` | boolean | yes | เปิดให้เลือกใน dropdown หรือไม่ | `TRUE` |
| I | `sortOrder` | number | yes | ลำดับแสดงผลใน dropdown | `1` |
| J | `note` | string | no | หมายเหตุ | `ผักสลัดยอดนิยม` |
| K | `createdAt` | datetime string | yes | วันที่สร้างข้อมูล | `2026-06-09T08:00:00.000Z` |
| L | `updatedAt` | datetime string | yes | วันที่แก้ไขล่าสุด | `2026-06-09T08:00:00.000Z` |

---

### Header Row ที่ต้องใช้ใน Google Sheets

```csv
cropId,cropName,thaiName,harvestAgeDays,defaultUnitType,defaultUnitLabel,expectedYieldPerSlotKg,isActive,sortOrder,note,createdAt,updatedAt
```

---

### รายชื่อผักเริ่มต้น 10 รายการ

> อายุเก็บเกี่ยวด้านล่างเป็นค่าตั้งต้นสำหรับระบบ MVP นับจากวันที่ย้ายต้นกล้าลงราง/ช่องปลูกจริง  
> ผู้ใช้งานสามารถปรับค่าได้ภายหลังตามสภาพแวดล้อมจริงของกลุ่ม

| cropId | cropName | thaiName | harvestAgeDays | defaultUnitType | defaultUnitLabel | expectedYieldPerSlotKg | isActive | sortOrder |
|---|---|---|---:|---|---|---:|---|---:|
| `green_cos` | Green Cos | กรีนคอส | 25 | slot | ช่องปลูก | 0.10 | TRUE | 1 |
| `mini_cos` | Mini Cos | มินิคอส | 25 | slot | ช่องปลูก | 0.09 | TRUE | 2 |
| `green_oak` | Green Oak | กรีนโอ๊ค | 28 | slot | ช่องปลูก | 0.09 | TRUE | 3 |
| `red_oak` | Red Oak | เรดโอ๊ค | 28 | slot | ช่องปลูก | 0.08 | TRUE | 4 |
| `finlay` | Finlay | ฟินเลย์ | 28 | slot | ช่องปลูก | 0.09 | TRUE | 5 |
| `green_coral` | Green Coral | กรีนคอรัล | 28 | slot | ช่องปลูก | 0.09 | TRUE | 6 |
| `red_coral` | Red Coral | เรดคอรัล | 28 | slot | ช่องปลูก | 0.08 | TRUE | 7 |
| `butterhead` | Butterhead | บัตเตอร์เฮด | 30 | slot | ช่องปลูก | 0.10 | TRUE | 8 |
| `kale` | Kale | เคล | 35 | slot | ช่องปลูก | 0.08 | TRUE | 9 |
| `rocket` | Rocket | ร็อกเก็ต | 25 | slot | ช่องปลูก | 0.05 | TRUE | 10 |

---

### ตัวอย่างข้อมูลในชีต Crops

```csv
cropId,cropName,thaiName,harvestAgeDays,defaultUnitType,defaultUnitLabel,expectedYieldPerSlotKg,isActive,sortOrder,note,createdAt,updatedAt
green_cos,Green Cos,กรีนคอส,25,slot,ช่องปลูก,0.10,TRUE,1,ผักสลัดยอดนิยม,2026-06-09T08:00:00.000Z,2026-06-09T08:00:00.000Z
mini_cos,Mini Cos,มินิคอส,25,slot,ช่องปลูก,0.09,TRUE,2,,2026-06-09T08:00:00.000Z,2026-06-09T08:00:00.000Z
green_oak,Green Oak,กรีนโอ๊ค,28,slot,ช่องปลูก,0.09,TRUE,3,,2026-06-09T08:00:00.000Z,2026-06-09T08:00:00.000Z
red_oak,Red Oak,เรดโอ๊ค,28,slot,ช่องปลูก,0.08,TRUE,4,,2026-06-09T08:00:00.000Z,2026-06-09T08:00:00.000Z
finlay,Finlay,ฟินเลย์,28,slot,ช่องปลูก,0.09,TRUE,5,,2026-06-09T08:00:00.000Z,2026-06-09T08:00:00.000Z
green_coral,Green Coral,กรีนคอรัล,28,slot,ช่องปลูก,0.09,TRUE,6,,2026-06-09T08:00:00.000Z,2026-06-09T08:00:00.000Z
red_coral,Red Coral,เรดคอรัล,28,slot,ช่องปลูก,0.08,TRUE,7,,2026-06-09T08:00:00.000Z,2026-06-09T08:00:00.000Z
butterhead,Butterhead,บัตเตอร์เฮด,30,slot,ช่องปลูก,0.10,TRUE,8,,2026-06-09T08:00:00.000Z,2026-06-09T08:00:00.000Z
kale,Kale,เคล,35,slot,ช่องปลูก,0.08,TRUE,9,,2026-06-09T08:00:00.000Z,2026-06-09T08:00:00.000Z
rocket,Rocket,ร็อกเก็ต,25,slot,ช่องปลูก,0.05,TRUE,10,,2026-06-09T08:00:00.000Z,2026-06-09T08:00:00.000Z
```

---

## 6. Sheet: HarvestLogs

ชีตสำหรับบันทึกประวัติการเก็บเกี่ยวจริง

### ชื่อชีต

```txt
HarvestLogs
```

### หน้าที่ของชีต

- เก็บประวัติการเก็บเกี่ยวแต่ละครั้ง
- รองรับการเก็บเกี่ยวแบบเต็มรอบหรือบางส่วน
- ใช้ทำรายงานผลผลิตรายวัน รายสัปดาห์ รายเดือน
- ทำให้ไม่สูญเสียประวัติ แม้รายการใน `Plantings` ถูกแก้ไขภายหลัง

---

### โครงสร้างคอลัมน์

| Column | Field | Type | Required | Description | Example |
|---|---|---:|---:|---|---|
| A | `harvestId` | string | yes | รหัสรายการเก็บเกี่ยว | `HVT-20260609-0001` |
| B | `plantingId` | string | yes | อ้างอิง `id` จากชีต `Plantings` | `PLT-20260609-0001` |
| C | `cropId` | string | yes | รหัสชนิดผัก | `green_cos` |
| D | `cropName` | string | yes | ชื่อผัก | `Green Cos` |
| E | `harvestDate` | date string | yes | วันที่เก็บเกี่ยวจริง | `2026-06-30` |
| F | `yieldAmount` | number | yes | ปริมาณผลผลิตจริง | `12.5` |
| G | `yieldUnit` | string | yes | หน่วยผลผลิต | `kg` |
| H | `harvestType` | string | yes | ประเภทการเก็บเกี่ยว | `full` |
| I | `note` | string | no | หมายเหตุ | `ส่งลูกค้าประจำ` |
| J | `createdAt` | datetime string | yes | วันที่บันทึก | `2026-06-30T08:30:00.000Z` |
| K | `updatedAt` | datetime string | yes | วันที่แก้ไขล่าสุด | `2026-06-30T08:30:00.000Z` |

---

### Header Row ที่ต้องใช้ใน Google Sheets

```csv
harvestId,plantingId,cropId,cropName,harvestDate,yieldAmount,yieldUnit,harvestType,note,createdAt,updatedAt
```

---

### ค่า harvestType ที่อนุญาต

| Value | ความหมาย | ใช้เมื่อ |
|---|---|---|
| `full` | เก็บเกี่ยวเต็มรอบ | เก็บหมดทั้งรายการ |
| `partial` | เก็บเกี่ยวบางส่วน | เก็บบางส่วน และอาจมีเก็บเพิ่มภายหลัง |

สำหรับ MVP ให้ใช้ `full` เป็นค่าเริ่มต้น

---

### ตัวอย่างข้อมูลในชีต HarvestLogs

```csv
harvestId,plantingId,cropId,cropName,harvestDate,yieldAmount,yieldUnit,harvestType,note,createdAt,updatedAt
HVT-20260630-0001,PLT-20260609-0001,green_cos,Green Cos,2026-06-30,12.5,kg,full,ส่งลูกค้าประจำ,2026-06-30T08:30:00.000Z,2026-06-30T08:30:00.000Z
```

---

## 7. Sheet: Settings

ชีตสำหรับเก็บค่าตั้งค่าระบบพื้นฐาน

### ชื่อชีต

```txt
Settings
```

### หน้าที่ของชีต

- เก็บค่ากลางของระบบ
- ใช้ปรับค่าบางอย่างได้โดยไม่ต้องแก้โค้ด
- รองรับการขยายระบบในอนาคต

---

### โครงสร้างคอลัมน์

| Column | Field | Type | Required | Description | Example |
|---|---|---:|---:|---|---|
| A | `key` | string | yes | ชื่อค่าตั้งค่า | `appName` |
| B | `value` | string | yes | ค่าของ setting | `GrowDay` |
| C | `description` | string | no | คำอธิบาย | `ชื่อระบบ` |
| D | `updatedAt` | datetime string | yes | วันที่แก้ไขล่าสุด | `2026-06-09T08:00:00.000Z` |

---

### Header Row ที่ต้องใช้ใน Google Sheets

```csv
key,value,description,updatedAt
```

---

### ตัวอย่างข้อมูลในชีต Settings

```csv
key,value,description,updatedAt
appName,GrowDay,ชื่อระบบ,2026-06-09T08:00:00.000Z
groupName,กลุ่มต่อยอดถุงทองผักสด,ชื่อกลุ่มผู้ใช้งาน,2026-06-09T08:00:00.000Z
defaultUnitType,slot,หน่วยปลูกเริ่มต้น,2026-06-09T08:00:00.000Z
defaultYieldUnit,kg,หน่วยผลผลิตเริ่มต้น,2026-06-09T08:00:00.000Z
```

---

## 8. ค่าหน่วยที่อนุญาต

### unitType

ใช้กับจำนวนที่ปลูก

| Value | Label | ความหมาย | ใช้ใน MVP |
|---|---|---|---|
| `slot` | ช่องปลูก | จำนวนช่องปลูกในรางไฮโดรโปนิกส์ | yes |
| `plant` | ต้น | จำนวนต้น | optional |
| `tray` | ถาด | จำนวนถาดปลูก | optional |
| `row` | ราง | จำนวนรางปลูก | optional |

### ค่าเริ่มต้นที่แนะนำ

```txt
unitType = slot
unitLabel = ช่องปลูก
```

เหตุผล: ผักไฮโดรโปนิกส์มักจัดการตามจำนวนช่องปลูกในราง ซึ่งสัมพันธ์กับจำนวนต้นและคาดการณ์ผลผลิตได้ง่าย

---

### yieldUnit

ใช้กับปริมาณผลผลิตจริง

| Value | Label | ความหมาย | ใช้ใน MVP |
|---|---|---|---|
| `kg` | กก. | กิโลกรัม | yes |
| `g` | กรัม | กรัม | optional |
| `pack` | แพ็ค | จำนวนแพ็ค | optional |

### ค่าเริ่มต้นที่แนะนำ

```txt
yieldUnit = kg
```

---

## 9. ค่าสถานะรายการปลูก

ใช้ใน field `status` ของชีต `Plantings`

| Value | Label บนหน้าเว็บ | ความหมาย | เงื่อนไขแนะนำ |
|---|---|---|---|
| `growing` | กำลังปลูก | ยังไม่ถึงวันเก็บเกี่ยว | วันนี้น้อยกว่า `expectedHarvestDate` |
| `ready` | พร้อมเก็บ | ถึงหรือเลยวันเก็บเกี่ยวแล้ว แต่ยังไม่บันทึกผลผลิต | วันนี้มากกว่าหรือเท่ากับ `expectedHarvestDate` และยังไม่มี `actualHarvestDate` |
| `harvested` | เก็บแล้ว | มีการบันทึกผลผลิตจริงแล้ว | มี `actualHarvestDate` และ `actualYield` |
| `cancelled` | ยกเลิก | รายการถูกยกเลิก | ผู้ใช้กดยกเลิกหรือแก้สถานะ |

---

## 10. Logic การคำนวณวันเก็บเกี่ยว

### หลักการ

```txt
expectedHarvestDate = plantedDate + harvestAgeDays
```

ตัวอย่าง:

```txt
plantedDate = 2026-06-05
harvestAgeDays = 25
expectedHarvestDate = 2026-06-30
```

### วันที่ปลูกหมายถึงอะไร

ในระบบนี้ `plantedDate` หมายถึง:

```txt
วันที่ย้ายต้นกล้าลงราง/ช่องปลูกไฮโดรโปนิกส์จริง
```

ไม่ใช่วันที่เพาะเมล็ด

เหตุผล: ทำให้การคำนวณอายุเก็บเกี่ยวของผักสลัดไฮโดรโปนิกส์ง่ายและเหมาะกับการใช้งานจริงของกลุ่ม

---

## 11. Logic การคำนวณ daysRemaining

### หลักการ

```txt
daysRemaining = expectedHarvestDate - today
```

### ผลลัพธ์ที่ใช้แสดงบนหน้าเว็บ

| daysRemaining | Label |
|---:|---|
| มากกว่า 0 | `เหลือ X วัน` |
| เท่ากับ 0 | `พร้อมเก็บวันนี้` |
| น้อยกว่า 0 | `เลยกำหนด X วัน` |

### หมายเหตุ

ไม่จำเป็นต้องเก็บ `daysRemaining` ใน Google Sheets ก็ได้ เพราะสามารถคำนวณใหม่ใน Apps Script หรือ Frontend ได้ทุกครั้งที่โหลดข้อมูล

แต่ถ้าเก็บในชีต ให้ถือว่าเป็นข้อมูลช่วยแสดงผล ไม่ใช่ข้อมูลหลัก

---

## 12. Logic การคำนวณผลผลิตคาดการณ์

### สูตรพื้นฐาน

```txt
expectedYield = quantity * expectedYieldPerSlotKg
```

ตัวอย่าง:

```txt
quantity = 120 ช่องปลูก
expectedYieldPerSlotKg = 0.10 กก./ช่อง
expectedYield = 12.0 กก.
```

### MVP

ในรุ่นแรกยังไม่จำเป็นต้องแสดง `expectedYield` ก็ได้

ถ้าจะเพิ่ม ควรแสดงเป็นข้อมูลประกอบเท่านั้น ไม่ควรใช้แทนผลผลิตจริง

---

## 13. Validation Rules

### createPlanting

ข้อมูลที่จำเป็น:

| Field | Rule |
|---|---|
| `cropId` | ต้องมี และต้องพบในชีต `Crops` |
| `cropName` | ต้องมี |
| `unitType` | ต้องมี ค่าเริ่มต้นคือ `slot` |
| `quantity` | ต้องเป็นตัวเลขมากกว่า 0 |
| `plantedDate` | ต้องเป็นวันที่รูปแบบ `YYYY-MM-DD` |
| `harvestAgeDays` | ต้องเป็นตัวเลขมากกว่า 0 |
| `expectedHarvestDate` | คำนวณจากระบบ ไม่ควรให้ผู้ใช้กรอกเอง |

---

### recordHarvest

ข้อมูลที่จำเป็น:

| Field | Rule |
|---|---|
| `plantingId` | ต้องมี และต้องพบในชีต `Plantings` |
| `harvestDate` | ต้องเป็นวันที่รูปแบบ `YYYY-MM-DD` |
| `yieldAmount` | ต้องเป็นตัวเลขมากกว่า 0 |
| `yieldUnit` | ค่าเริ่มต้นคือ `kg` |
| `harvestType` | ค่าเริ่มต้นคือ `full` |

---

## 14. การสร้าง ID

### Planting ID

รูปแบบที่แนะนำ:

```txt
PLT-YYYYMMDD-XXXX
```

ตัวอย่าง:

```txt
PLT-20260609-0001
```

### Harvest ID

รูปแบบที่แนะนำ:

```txt
HVT-YYYYMMDD-XXXX
```

ตัวอย่าง:

```txt
HVT-20260630-0001
```

### วิธีสร้างแบบง่ายใน Apps Script

- ใช้วันที่ปัจจุบัน
- นับจำนวนแถวในชีต
- เติมเลข 4 หลักด้านท้าย

ตัวอย่างแนวคิด:

```txt
PLT + วันที่วันนี้ + ลำดับแถว
```

---

## 15. ความสัมพันธ์ของข้อมูล

```txt
Crops.cropId
   ↓
Plantings.cropId

Plantings.id
   ↓
HarvestLogs.plantingId
```

### คำอธิบาย

- `Crops` เป็นข้อมูลตั้งต้นของชนิดผัก
- `Plantings` บันทึกการปลูกแต่ละครั้ง
- `HarvestLogs` บันทึกผลผลิตจริงของแต่ละรายการปลูก
- หนึ่งรายการปลูกอาจมี harvest log ได้มากกว่า 1 รายการในอนาคต

---

## 16. ข้อมูลที่ Frontend ควรโหลด

### เมื่อเปิดแอพครั้งแรก

ควรโหลดข้อมูลดังนี้

```txt
1. Crops
2. Plantings
3. Dashboard Summary
```

### เมื่อเข้าหน้าบันทึกการปลูก

ควรใช้ข้อมูลจาก `Crops` เพื่อสร้าง dropdown รายชื่อผัก

### เมื่อเข้าหน้ารายการปลูก

ควรใช้ข้อมูลจาก `Plantings` และคำนวณสถานะล่าสุด

### เมื่อเข้าหน้าบันทึกเก็บเกี่ยว

ควรแสดงเฉพาะรายการที่มีสถานะ:

```txt
ready
growing ที่ใกล้เก็บเกี่ยว
```

แต่ใน MVP แนะนำให้เลือกจากรายการ `ready` เป็นหลัก

---

## 17. ข้อมูลสำหรับ Dashboard Summary

Dashboard ไม่จำเป็นต้องมีชีตแยก สามารถคำนวณจาก `Plantings` และ `HarvestLogs`

### ค่าที่ควรแสดง

| Field | วิธีคำนวณ |
|---|---|
| `activePlantingCount` | จำนวนรายการที่ `status` = `growing` |
| `readyTodayCount` | จำนวนรายการที่ `status` = `ready` หรือ `expectedHarvestDate` = วันนี้ |
| `readyIn7DaysCount` | จำนวนรายการที่ `expectedHarvestDate` อยู่ใน 7 วันข้างหน้า |
| `monthlyYieldKg` | ผลรวม `yieldAmount` จาก `HarvestLogs` ในเดือนปัจจุบัน |

---

## 18. การจัดการข้อมูลซ้ำ

### ห้ามสร้าง cropId ซ้ำ

ตัวอย่างที่ห้าม:

```txt
green_cos
green_cos
```

### รายการปลูกสามารถซ้ำชื่อผักได้

ตัวอย่างที่ถูกต้อง:

```txt
Green Cos ปลูกวันที่ 2026-06-05
Green Cos ปลูกวันที่ 2026-06-10
```

เพราะเป็นคนละรอบการปลูก

---

## 19. การลบข้อมูล

สำหรับ MVP ไม่แนะนำให้ลบข้อมูลจริงออกจาก Google Sheets

### วิธีที่แนะนำ

ให้เปลี่ยน `status` เป็น:

```txt
cancelled
```

แทนการลบแถว

เหตุผล:

- ลดความเสี่ยงข้อมูลหาย
- ยังตรวจสอบย้อนหลังได้
- ใช้กับผู้ใช้ที่ไม่ชำนาญได้ปลอดภัยกว่า

---

## 20. ข้อกำหนดสำคัญสำหรับ Google Apps Script

Apps Script ต้องทำงานตามหลักต่อไปนี้

1. อ่าน header row เพื่อ map field กับ column
2. ไม่อ้างอิง column number แบบตายตัวถ้าเลี่ยงได้
3. คืนค่าข้อมูลเป็น JSON
4. แปลงวันที่จาก Google Sheets เป็น `YYYY-MM-DD`
5. ตรวจสอบข้อมูลก่อนบันทึก
6. สร้าง `createdAt` และ `updatedAt` อัตโนมัติ
7. เมื่อบันทึกการเก็บเกี่ยว ให้ update `Plantings.status` เป็น `harvested`
8. ไม่ลบข้อมูลจริง ยกเว้นมีคำสั่งชัดเจนในอนาคต

---

## 21. ตัวอย่าง JSON Object

### Planting Object

```json
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
```

---

### Crop Object

```json
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
```

---

### Harvest Log Object

```json
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
```

---

## 22. ข้อมูลตัวอย่างสำหรับทดสอบระบบ

### Plantings Test Data

```csv
id,cropId,cropName,unitType,unitLabel,quantity,plantedDate,harvestAgeDays,expectedHarvestDate,daysRemaining,status,actualHarvestDate,actualYield,yieldUnit,note,createdAt,updatedAt
PLT-20260609-0001,green_cos,Green Cos,slot,ช่องปลูก,120,2026-06-05,25,2026-06-30,21,growing,,,kg,ราง A,2026-06-09T08:30:00.000Z,2026-06-09T08:30:00.000Z
PLT-20260609-0002,red_oak,Red Oak,slot,ช่องปลูก,80,2026-06-07,28,2026-07-05,26,growing,,,kg,ราง B,2026-06-09T08:35:00.000Z,2026-06-09T08:35:00.000Z
PLT-20260609-0003,mini_cos,Mini Cos,slot,ช่องปลูก,100,2026-05-15,25,2026-06-09,0,ready,,,kg,,2026-06-09T08:40:00.000Z,2026-06-09T08:40:00.000Z
PLT-20260609-0004,green_oak,Green Oak,slot,ช่องปลูก,90,2026-05-12,28,2026-06-09,0,harvested,2026-06-09,11.8,kg,คุณภาพดี,2026-06-09T08:45:00.000Z,2026-06-09T09:10:00.000Z
```

---

## 23. Checklist ก่อนเริ่มเขียนโค้ด

ก่อนเริ่มพัฒนา ให้ตรวจสอบว่า Google Sheets มีชีตและ header ครบดังนี้

```txt
[ ] Sheet: Plantings
[ ] Header ของ Plantings ครบและเรียงถูกต้อง
[ ] Sheet: Crops
[ ] Header ของ Crops ครบและเรียงถูกต้อง
[ ] มีข้อมูลผักเริ่มต้น 10 รายการใน Crops
[ ] Sheet: HarvestLogs
[ ] Header ของ HarvestLogs ครบและเรียงถูกต้อง
[ ] Sheet: Settings
[ ] Header ของ Settings ครบและเรียงถูกต้อง
[ ] วันที่เก็บเป็นรูปแบบ YYYY-MM-DD
[ ] Apps Script อ่าน/เขียนข้อมูลด้วย field name
[ ] Frontend ใช้ field name ตามเอกสารนี้
```

---

## 24. Acceptance Criteria ด้านข้อมูล

ระบบถือว่าทำงานถูกต้องเมื่อ:

1. เพิ่มรายการปลูกใหม่แล้วข้อมูลถูกบันทึกลง `Plantings`
2. เลือกผักแล้วระบบดึง `harvestAgeDays` จาก `Crops`
3. ระบบคำนวณ `expectedHarvestDate` ถูกต้อง
4. หน้า Dashboard แสดงจำนวนรายการตามข้อมูลจริง
5. หน้ารายการปลูกแสดงข้อมูลจาก `Plantings`
6. บันทึกเก็บเกี่ยวแล้วสร้างข้อมูลใน `HarvestLogs`
7. บันทึกเก็บเกี่ยวแล้วอัปเดต `Plantings.status` เป็น `harvested`
8. ข้อมูลวันที่ที่ส่งให้ Frontend อยู่ในรูปแบบ `YYYY-MM-DD`
9. ไม่มีการเปลี่ยนชื่อ field โดยไม่อัปเดตเอกสารที่เกี่ยวข้อง
10. ระบบยังใช้งานได้แม้มีรายการปลูกจำนวนมากขึ้นในระดับหลายร้อยรายการ

---

## 25. Prompt สำหรับสั่ง Codex / AI Coding Agent

ใช้ prompt นี้เมื่อต้องการให้ AI สร้างหรือแก้โค้ดที่เกี่ยวข้องกับฐานข้อมูล

```txt
ให้พัฒนาโค้ดส่วนฐานข้อมูลของ GrowDay ตาม docs/DATA_SCHEMA.md อย่างเคร่งครัด

ข้อกำหนด:
- ใช้ Google Sheets เป็นฐานข้อมูล
- ใช้ชีต Plantings, Crops, HarvestLogs, Settings ตามเอกสาร
- ใช้ field name ตาม DATA_SCHEMA.md เท่านั้น
- ห้ามเปลี่ยนชื่อ field
- ห้ามเปลี่ยนชื่อ sheet
- Apps Script ต้องอ่าน header row เพื่อ map field กับ column
- วันที่ต้องอยู่ในรูปแบบ YYYY-MM-DD
- createdAt และ updatedAt ต้องสร้างอัตโนมัติ
- เมื่อบันทึกเก็บเกี่ยว ให้เพิ่มข้อมูลใน HarvestLogs และอัปเดต Plantings.status เป็น harvested
- ห้ามลบข้อมูลจริง ให้ใช้ status cancelled แทน
```

---

## 26. หมายเหตุสำหรับการพัฒนาจริง

- ถ้า Google Sheets ถูกแก้ไขด้วยมือ ต้องระวังไม่ให้ header row เปลี่ยน
- ถ้ามีการเพิ่มคอลัมน์ใหม่ ควรเพิ่มท้ายตาราง ไม่ควรแทรกกลางตาราง
- ถ้าต้องเปลี่ยนชื่อ field ให้แก้พร้อมกันใน `DATA_SCHEMA.md`, `API_SPEC.md`, Apps Script และ Frontend
- หากระบบเริ่มมีข้อมูลจำนวนมาก ควรเพิ่ม filter ฝั่ง Apps Script ไม่โหลดข้อมูลทั้งหมดทุกครั้ง
- สำหรับ MVP ไม่จำเป็นต้องทำระบบผู้ใช้หรือสิทธิ์การเข้าถึงภายในเว็บแอพ
- การป้องกันการเข้าถึงข้อมูลให้จัดการที่สิทธิ์ของ Google Apps Script Web App และ Google Sheets เป็นหลัก
