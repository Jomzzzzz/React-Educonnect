import { useState } from "react";

export default function DynamicCalendar() {
  const today = new Date();

  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ];

  // Number of days in selected month
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

  // Find start weekday of month (Mon-Sun format)
  const startDay = (new Date(currentYear, currentMonth, 1).getDay() + 6) % 7;

  // Build calendar grid
  const calendarCells = [];

  // Empty cells before 1st day
  for (let i = 0; i < startDay; i++) {
    calendarCells.push(null);
  }

  // Actual days
  for (let i = 1; i <= daysInMonth; i++) {
    calendarCells.push(i);
  }

  const nextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  };

  const prevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={prevMonth}
          className="px-3 py-1 bg-gray-100 rounded-lg hover:bg-gray-200"
        >
          ‹
        </button>

        <h3 className="font-semibold text-lg">
          {monthNames[currentMonth]} {currentYear}
        </h3>

        <button
          onClick={nextMonth}
          className="px-3 py-1 bg-gray-100 rounded-lg hover:bg-gray-200"
        >
          ›
        </button>
      </div>

      {/* Weekdays */}
      <div className="grid grid-cols-7 text-center text-sm text-gray-600 gap-2 mb-2">
        {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
          <div key={d} className="font-medium">{d}</div>
        ))}
      </div>

      {/* Days */}
      <div className="grid grid-cols-7 gap-2 text-center text-sm">
        {calendarCells.map((day, i) => {
          const isToday =
            day &&
            day === today.getDate() &&
            currentMonth === today.getMonth() &&
            currentYear === today.getFullYear();

          return (
            <div
              key={i}
              className={`p-2 rounded-lg ${
                !day
                  ? "bg-transparent"
                  : isToday
                  ? "bg-blue-600 text-white font-semibold"
                  : "text-gray-700 hover:bg-gray-100 cursor-pointer"
              }`}
            >
              {day || ""}
            </div>
          );
        })}
      </div>
    </div>
  );
}
