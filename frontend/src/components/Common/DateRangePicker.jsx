import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function DateRangePicker({ onDateChange, onClose, mode = 'double', startDate = null, endDate = null }) {
  const today = new Date();

  // Initialize selected range from props
  const initializeRange = () => {
    if (startDate && endDate) {
      return {
        start: new Date(startDate),
        end: new Date(endDate)
      };
    }
    return { start: null, end: null };
  };

  // Initialize month/year from selected dates or today
  const initializeMonth = () => {
    if (startDate) {
      const date = new Date(startDate);
      return date.getMonth();
    }
    return today.getMonth();
  };

  const initializeYear = () => {
    if (startDate) {
      const date = new Date(startDate);
      return date.getFullYear();
    }
    return today.getFullYear();
  };

  const [currentMonth, setCurrentMonth] = useState(initializeMonth());
  const [currentYear, setCurrentYear] = useState(initializeYear());
  const [selectedRange, setSelectedRange] = useState(initializeRange());
  const [hasUserInteracted, setHasUserInteracted] = useState(false);
  const isSingleMode = mode === 'single';
  const isDoubleMode = mode === 'double';

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const dayNames = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

  const getDaysInMonth = (month, year) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (month, year) => new Date(year, month, 1).getDay();

  const generateCalendarDays = (month, year) => {
    const daysInMonth = getDaysInMonth(month, year);
    const firstDay = getFirstDayOfMonth(month, year);
    const prevMonthDays = month === 0 ? getDaysInMonth(11, year - 1) : getDaysInMonth(month - 1, year);
    const days = [];

    // Previous month days
    for (let i = firstDay - 1; i >= 0; i--) {
      const prevMonth = month === 0 ? 11 : month - 1;
      const prevYear = month === 0 ? year - 1 : year;
      days.push({ day: prevMonthDays - i, isCurrentMonth: false, month: prevMonth, year: prevYear });
    }

    // Current month days
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({ day: i, isCurrentMonth: true, month, year });
    }

    // Next month days
    const remainingDays = 42 - days.length;
    const nextMonth = month === 11 ? 0 : month + 1;
    const nextYear = month === 11 ? year + 1 : year;
    for (let i = 1; i <= remainingDays; i++) {
      days.push({ day: i, isCurrentMonth: false, month: nextMonth, year: nextYear });
    }

    return days;
  };

  const formatDateString = (date) => {
    if (!date) return '';
    return date.toISOString().split('T')[0];
  };

  const isDateInRange = (date) => {
    if (!selectedRange.start || !selectedRange.end) return false;
    const startTime = new Date(selectedRange.start).setHours(0, 0, 0, 0);
    const endTime = new Date(selectedRange.end).setHours(0, 0, 0, 0);
    const currentTime = new Date(date).setHours(0, 0, 0, 0);
    return currentTime >= startTime && currentTime <= endTime;
  };

  const isStartDate = (date) => {
    if (!selectedRange.start) return false;
    return new Date(date).setHours(0, 0, 0, 0) === new Date(selectedRange.start).setHours(0, 0, 0, 0);
  };

  const isEndDate = (date) => {
    if (!selectedRange.end) return false;
    return new Date(date).setHours(0, 0, 0, 0) === new Date(selectedRange.end).setHours(0, 0, 0, 0);
  };

  const handleDateClick = (day, month, year) => {
    const clickedDate = new Date(year, month, day);
    setHasUserInteracted(true);

    if (!selectedRange.start || (selectedRange.start && selectedRange.end)) {
      setSelectedRange({ start: clickedDate, end: null });
    } else if (clickedDate < selectedRange.start) {
      setSelectedRange({ start: clickedDate, end: selectedRange.start });
    } else {
      setSelectedRange({ ...selectedRange, end: clickedDate });
    }
  };

  const navigateMonth = (direction) => {
    let newMonth = currentMonth + direction;
    let newYear = currentYear;

    if (newMonth > 11) {
      newMonth = 0;
      newYear++;
    } else if (newMonth < 0) {
      newMonth = 11;
      newYear--;
    }

    setCurrentMonth(newMonth);
    setCurrentYear(newYear);
  };

  // Auto-apply when both dates are selected AND user has interacted
  React.useEffect(() => {
    if (hasUserInteracted && selectedRange.start && selectedRange.end) {
      const timer = setTimeout(() => {
        onDateChange({
          startDate: formatDateString(selectedRange.start),
          endDate: formatDateString(selectedRange.end),
        });
        onClose();
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [hasUserInteracted, selectedRange.start, selectedRange.end, onDateChange, onClose]);

  const renderCalendar = (monthOffset = 0) => {
    let month = currentMonth + monthOffset;
    let year = currentYear;

    if (month > 11) {
      month = month - 12;
      year++;
    } else if (month < 0) {
      month = month + 12;
      year--;
    }

    const days = generateCalendarDays(month, year);

    return (
      <div className="w-full">
        {/* Month/Year Header */}
        <div className="bg-blue-500 text-white px-4 py-3 rounded-t-lg flex items-center justify-between">
          <button
            onClick={() => navigateMonth(-1)}
            className="p-1 hover:bg-blue-600 rounded transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 font-semibold">
            <span>{monthNames[month]}</span>
            <select
              value={year}
              onChange={(e) => setCurrentYear(parseInt(e.target.value))}
              className="bg-blue-600 text-white px-2 py-1 rounded cursor-pointer"
            >
              {[2024, 2025, 2026, 2027].map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>

          <button
            onClick={() => navigateMonth(1)}
            className="p-1 hover:bg-blue-600 rounded transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Day Headers */}
        <div className="grid grid-cols-7 gap-0 bg-gray-50 px-4 py-2 border-b border-gray-200">
          {dayNames.map((day, i) => (
            <div key={i} className="text-center text-xs font-semibold text-gray-600">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Days */}
        <div className="grid grid-cols-7 gap-0 px-4 py-3 bg-white">
          {days.map((dateObj, i) => {
            const date = new Date(dateObj.year, dateObj.month, dateObj.day);
            const isInRange = isDateInRange(date);
            const isStart = isStartDate(date);
            const isEnd = isEndDate(date);

            return (
              <div key={i} className="relative h-10 flex items-center justify-center">
                {/* Range background */}
                {isInRange && dateObj.isCurrentMonth && (
                  <div
                    className={`absolute inset-0 bg-blue-100 ${
                      isStart && isEnd ? 'w-0' :
                      isStart ? 'left-1/2 right-0 rounded-r-none' :
                      isEnd ? 'left-0 right-1/2 rounded-l-none' :
                      'left-0 right-0'
                    }`}
                    style={{ zIndex: 0 }}
                  />
                )}

                <button
                  onClick={() => dateObj.isCurrentMonth && handleDateClick(dateObj.day, dateObj.month, dateObj.year)}
                  disabled={!dateObj.isCurrentMonth}
                  className={`
                    relative z-10 w-8 h-8 flex items-center justify-center text-sm rounded-full
                    transition-all
                    ${!dateObj.isCurrentMonth ? 'text-gray-300 cursor-default' : 'text-gray-700 cursor-pointer'}
                    ${isInRange && !isStart && !isEnd && dateObj.isCurrentMonth ? 'bg-blue-100 text-gray-700' : ''}
                    ${(isStart || isEnd) && dateObj.isCurrentMonth ? 'bg-blue-500 text-white font-semibold hover:bg-blue-600' : ''}
                    ${dateObj.isCurrentMonth && !isInRange ? 'hover:bg-gray-100' : ''}
                  `}
                >
                  {dateObj.day}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-lg w-full border border-gray-200 overflow-hidden">
      {isSingleMode ? (
        // Single Month Mode
        <div className="w-80">
          {renderCalendar(0)}
        </div>
      ) : (
        // Double Month Mode
        <div className="flex">
          <div className="flex-1 border-r border-gray-200">
            {renderCalendar(0)}
          </div>
          <div className="flex-1">
            {renderCalendar(1)}
          </div>
        </div>
      )}
    </div>
  );
}

