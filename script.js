const addBtn = document.getElementById("addBtn");
const nameInput = document.getElementById("nameInput");
const staffList = document.getElementById("staffList");

const staffSelect = document.getElementById("staffSelect");
const dateInput = document.getElementById("dateInput");
const timeSelect = document.getElementById("timeSelect");
const statusSelect = document.getElementById("statusSelect");
const submitShiftBtn = document.getElementById("submitShiftBtn");
const shiftList = document.getElementById("shiftList");

const adminShiftList = document.getElementById("adminShiftList");
const reportList = document.getElementById("reportList");
const reportMonthInput = document.getElementById("reportMonthInput");
const alertList = document.getElementById("alertList");
const wageList = document.getElementById("wageList");
const staffCount = document.getElementById("staffCount");
const shiftCount = document.getElementById("shiftCount");
const approvedCount = document.getElementById("approvedCount");
const alertCount = document.getElementById("alertCount");
const chartArea = document.getElementById("chartArea");

let staff = [];
let shifts = [];
let wages = {};
const holidays = [
  "2026-01-01",
  "2026-01-12",
  "2026-02-11",
  "2026-02-23",
  "2026-04-29",
  "2026-05-03",
  "2026-05-04",
  "2026-05-05",
  "2026-07-20",
  "2026-08-11",
  "2026-09-21",
  "2026-09-23",
  "2026-10-12",
  "2026-11-03",
  "2026-11-23"
];



/* =========================
   データ読み込み
========================= */

if (localStorage.getItem("staff")) {
  staff = JSON.parse(localStorage.getItem("staff"));
}

if (localStorage.getItem("shifts")) {
  shifts = JSON.parse(localStorage.getItem("shifts"));
}

if (localStorage.getItem("wages")) {
  wages = JSON.parse(localStorage.getItem("wages"));
}

/* =========================
   給与計算期間判定
========================= */

function getSalaryPeriod(dateStr) {
  const dateObj = new Date(dateStr);
  const year = dateObj.getFullYear();
  const month = dateObj.getMonth() + 1;
  const day = dateObj.getDate();

  if (day <= 15) {
    return `${year}-${String(month).padStart(2, "0")}`;
  } else {
    let nextMonth = month + 1;
    let nextYear = year;
    if (nextMonth > 12) {
      nextMonth = 1;
      nextYear++;
    }
    return `${nextYear}-${String(nextMonth).padStart(2, "0")}`;
  }
}

function getShiftHours(shiftType) {
  switch (shiftType) {
    case "10:00〜": return 5.5;
    case "11:00〜": return 4.5;
    case "17:00〜": return 5;
    case "18:00〜": return 4;
    case "19:00〜": return 3;
    case "10:00〜15:30": return 5.5;
    case "11:00〜15:30": return 4.5;
    case "昼": return 5.5;
    case "夜": return 5;
    default: return 0;
  }
}



/* =========================
   初期表示
========================= */

if (staffList) {
  displayStaff();
}

if (staffSelect) {
  loadStaffSelect();
}

if (shiftList) {
  displayShiftList();
}

if (adminShiftList) {
  displayAdminShiftList();
}

if (reportList) {
  if (reportMonthInput) {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    reportMonthInput.value = getSalaryPeriod(`${yyyy}-${mm}-${dd}`);

    reportMonthInput.addEventListener("change", function () {
      displayReport();
    });
  }
  displayReport();
}

if (alertList) {
  displayAlert();
}

if (wageList) {
  displayWageList();
}

updateDashboard();

drawChart();


/* =========================
   従業員追加
========================= */

if (addBtn) {
  addBtn.addEventListener("click", function () {

    const name = nameInput.value.trim();

    if (name === "") return;

    if (staff.includes(name)) {
      alert("その名前はすでに登録されています");
      return;
    }

    staff.push(name);

    saveData();
    displayStaff();
    loadStaffSelect();
    updateDashboard();
    drawChart();
    drawChart();

    nameInput.value = "";

  });
}



/* =========================
   Enterキー追加
========================= */

if (nameInput) {
  nameInput.addEventListener("keydown", function (event) {

    if (event.key === "Enter") {
      addBtn.click();
    }

  });
}



/* =========================
   シフト提出
========================= */

if (submitShiftBtn) {
  submitShiftBtn.addEventListener("click", function () {

    const name = staffSelect.value;
    const date = dateInput.value;
    const shiftType = timeSelect.value;
    const status = statusSelect.value;

    if (date === "") return;

    const existingIndex = shifts.findIndex(function (shift) {
      return (
        shift.name === name &&
        shift.date === date &&
        shift.shiftType === shiftType
      );
    });

    if (existingIndex !== -1) {

      shifts[existingIndex].status = status;
      shifts[existingIndex].approved = false;

    } else {

      shifts.push({
        name: name,
        date: date,
        shiftType: shiftType,
        status: status,
        approved: false
      });

    }

    saveShiftData();
    displayShiftList();
    displayAdminShiftList();
    displayReport();
    displayAlert();
    updateDashboard();
    drawChart();

    dateInput.value = "";

  });
}



/* =========================
   従業員一覧表示
========================= */

function displayStaff() {

  if (!staffList) return;

  staffList.innerHTML = "";

  staff.forEach(function (name, index) {

    const li = document.createElement("li");
    li.textContent = name + " ";

    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "削除";

    deleteBtn.addEventListener("click", function () {

      staff.splice(index, 1);

      saveData();
      displayStaff();
      loadStaffSelect();
      drawChart();

    });

    li.appendChild(deleteBtn);
    staffList.appendChild(li);

  });

}



/* =========================
   従業員側提出一覧
========================= */

function displayShiftList() {

  if (!shiftList) return;

  shiftList.innerHTML = "";

  shifts.forEach(function (shift, index) {

    const li = document.createElement("li");

    li.textContent =
      shift.name + " / " +
      shift.date + " / " +
      shift.shiftType + " / " +
      shift.status + " ";

    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "削除";

    deleteBtn.addEventListener("click", function () {

      shifts.splice(index, 1);

      saveShiftData();
      displayShiftList();
      displayAdminShiftList();
      displayReport();
      displayAlert();
      updateDashboard();
      drawChart();

    });

    li.appendChild(deleteBtn);
    shiftList.appendChild(li);

  });

}



/* =========================
   管理画面一覧
========================= */

function displayAdminShiftList() {

  if (!adminShiftList) return;

  adminShiftList.innerHTML = "";

  shifts.forEach(function (shift, index) {

    const li = document.createElement("li");

    if (shift.approved) {

      li.innerHTML =
        shift.name + " / " +
        shift.date + " / " +
        shift.shiftType +
        ' / <span class="status approved">確定勤務</span> ';

      const undoBtn = document.createElement("button");
      undoBtn.textContent = "元に戻す";

      undoBtn.addEventListener("click", function () {
        shifts[index].approved = false;

        saveShiftData();
        displayAdminShiftList();
        displayReport();
        displayAlert();
        updateDashboard();
        drawChart();
      });

      li.appendChild(undoBtn);

    } else {

      let statusClass = "";

      if (shift.status === "出勤") {
        statusClass = "work";
      } else {
        statusClass = "off";
      }

      li.innerHTML =
        shift.name + " / " +
        shift.date + " / " +
        shift.shiftType +
        ' / <span class="status ' + statusClass + '">' +
        shift.status +
        "</span> ";

      if (shift.status === "出勤") {

        const approveBtn = document.createElement("button");
        approveBtn.textContent = "確定";

        approveBtn.addEventListener("click", function () {

          shifts[index].approved = true;

          saveShiftData();
          displayAdminShiftList();
          displayReport();
          displayAlert();
          updateDashboard();
          drawChart();

        });

        li.appendChild(approveBtn);
        const recommendBtn = document.createElement("button");
        recommendBtn.textContent = "おすすめ";

        recommendBtn.addEventListener("click", function () {

          let candidates = shifts.filter(function (s) {
            return (
              s.date === shift.date &&
              s.shiftType === shift.shiftType &&
              s.status === "出勤"
            );
          });

          let bestName = "";
          let minCount = 9999;

          candidates.forEach(function (c) {

            let count = 0;

            shifts.forEach(function (s) {
              if (
                s.name === c.name &&
                s.approved === true
              ) {
                count++;
              }
            });

            if (count < minCount) {
              minCount = count;
              bestName = c.name;
            }

          });

          alert("この日の優先候補：" + bestName);

        });

        li.appendChild(recommendBtn);

      }

    }

    adminShiftList.appendChild(li);

  });

}



/* =========================
   従業員プルダウン
========================= */

function loadStaffSelect() {

  if (!staffSelect) return;

  staffSelect.innerHTML = "";

  staff.forEach(function (name) {

    const option = document.createElement("option");

    option.value = name;
    option.textContent = name;

    staffSelect.appendChild(option);

  });

}



/* =========================
   公平性レポート
========================= */

function displayReport() {

  if (!reportList) return;

  reportList.innerHTML = "";

  staff.forEach(function (name) {

    let wishCount = 0;
    let approvedCount = 0;
    let weekdayHours = 0;
    let weekendHours = 0;

    shifts.forEach(function (shift) {

      if (reportMonthInput && reportMonthInput.value) {
        if (getSalaryPeriod(shift.date) !== reportMonthInput.value) {
          return;
        }
      }

      if (
        shift.name === name &&
        shift.status === "出勤"
      ) {
        wishCount++;
      }

      if (
        shift.name === name &&
        shift.approved === true
      ) {
        approvedCount++;
        let shiftHours = getShiftHours(shift.shiftType);

        const day = new Date(shift.date).getDay();
        const isHoliday = holidays.includes(shift.date);
        const isWeekend = day === 0 || day === 6 || isHoliday;

        if (isWeekend) {
          weekendHours += shiftHours;
        } else {
          weekdayHours += shiftHours;
        }
      }

    });

    let rate = 0;

    if (wishCount > 0) {
      rate = Math.round((approvedCount / wishCount) * 100);
    }

    const li = document.createElement("li");

    let wageData = wages[name] || { weekday: 0, weekend: 0 };
    if (typeof wageData === "number" || typeof wageData === "string") {
      wageData = { weekday: Number(wageData), weekend: Number(wageData) };
    }
    
    let salary = (wageData.weekday * weekdayHours) + (wageData.weekend * weekendHours);

    li.textContent =
      name +
      " 希望" + wishCount +
      " / 確定" + approvedCount +
      " / " + rate + "%" +
      " / 約" + salary.toLocaleString() + "円";

    reportList.appendChild(li);

  });

}



/* =========================
   不足日アラート
========================= */

function displayAlert() {

  if (!alertList) return;

  alertList.innerHTML = "";

  let dates = [];

  shifts.forEach(function (shift) {

    if (!dates.includes(shift.date)) {
      dates.push(shift.date);
    }

  });

  dates.forEach(function (date) {

    let lunchCount = 0;
    let nightCount = 0;

    shifts.forEach(function (shift) {

      if (
        shift.date === date &&
        shift.approved === true &&
        (shift.shiftType === "昼" || shift.shiftType === "10:00〜" || shift.shiftType === "11:00〜")
      ) {
        lunchCount++;
      }

      if (
        shift.date === date &&
        shift.approved === true &&
        (shift.shiftType === "夜" || shift.shiftType === "17:00〜" || shift.shiftType === "18:00〜" || shift.shiftType === "19:00〜")
      ) {
        nightCount++;
      }

    });

    const day = new Date(date).getDay();

    const isHoliday = holidays.includes(date);

    const isWeekend =
      day === 0 || day === 6 || isHoliday;

    if (isWeekend) {

      if (lunchCount < 2) {

        const li = document.createElement("li");
        li.textContent =
          date + " 昼 あと" + (2 - lunchCount) + "人不足";

        alertList.appendChild(li);

      }

      if (nightCount < 3) {

        const li = document.createElement("li");
        li.textContent =
          date + " 夜 あと" + (3 - nightCount) + "人不足";

        alertList.appendChild(li);

      }

    } else {

      if (nightCount < 3) {

        const li = document.createElement("li");
        li.textContent =
          date + " 夜 あと" + (3 - nightCount) + "人不足";

        alertList.appendChild(li);

      }

    }

  });

}



/* =========================
   保存
========================= */

function saveData() {
  localStorage.setItem("staff", JSON.stringify(staff));
}

function saveShiftData() {
  localStorage.setItem("shifts", JSON.stringify(shifts));
}

function saveWageData() {
  localStorage.setItem("wages", JSON.stringify(wages));
}

//
function displayWageList() {
  if (!wageList) return;

  wageList.innerHTML = "";

  staff.forEach(function (name) {

    const row = document.createElement("div");
    row.style.marginBottom = "10px";

    const text = document.createElement("span");
    text.textContent = name + " ";
    text.style.display = "inline-block";
    text.style.minWidth = "60px";

    let wageData = wages[name] || { weekday: "", weekend: "" };
    if (typeof wageData === "number" || typeof wageData === "string") {
      wageData = { weekday: wageData, weekend: wageData };
    }

    const weekdayLabel = document.createElement("span");
    weekdayLabel.textContent = "平日: ";
    
    const weekdayInput = document.createElement("input");
    weekdayInput.type = "number";
    weekdayInput.value = wageData.weekday;
    weekdayInput.style.width = "70px";
    weekdayInput.style.marginRight = "10px";

    const weekendLabel = document.createElement("span");
    weekendLabel.textContent = "休日・祝日: ";

    const weekendInput = document.createElement("input");
    weekendInput.type = "number";
    weekendInput.value = wageData.weekend;
    weekendInput.style.width = "70px";
    weekendInput.style.marginRight = "10px";

    const button = document.createElement("button");
    button.textContent = "保存";

    button.addEventListener("click", function () {
      wages[name] = {
        weekday: Number(weekdayInput.value),
        weekend: Number(weekendInput.value)
      };
      saveWageData();
      displayReport();
      alert("保存しました");
    });

    row.appendChild(text);
    row.appendChild(weekdayLabel);
    row.appendChild(weekdayInput);
    row.appendChild(weekendLabel);
    row.appendChild(weekendInput);
    row.appendChild(button);

    wageList.appendChild(row);

  });
}
function updateDashboard() {

  if (!staffCount) return;

  staffCount.textContent = staff.length;

  shiftCount.textContent = shifts.length;

  let approved = shifts.filter(function (s) {
    return s.approved === true;
  }).length;

  approvedCount.textContent = approved;

  let shortage = alertList ? alertList.children.length : 0;

  alertCount.textContent = shortage;
}

//棒グラフ
function drawChart() {

  if (!chartArea) return;

  chartArea.innerHTML = "";

  staff.forEach(function (name) {

    let count = 0;

    shifts.forEach(function (shift) {
      if (
        shift.name === name &&
        shift.approved === true
      ) {
        count++;
      }
    });

    const row = document.createElement("div");
    row.className = "chart-row";

    const label = document.createElement("span");
    label.textContent = name;

    const bar = document.createElement("div");
    bar.className = "bar";
    bar.style.width = (count * 30) + "px";
    bar.textContent = count;

    row.appendChild(label);
    row.appendChild(bar);

    chartArea.appendChild(row);

  });
}