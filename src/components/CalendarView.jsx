import { useState, useRef, useEffect } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { startOfMonth, endOfMonth, eachDayOfInterval } from 'date-fns';
import { db, getMonthPhotos, deletePhoto } from '../utils/db';
import { getAbbreviatedMonthName, formatDate } from '../utils/dateHelpers';
import DayCell from './DayCell';
import './CalendarView.css';

const CalendarView = ({ selectedDate, onDateSelect, onDateChange }) => {
  // Initialize to January 2026, or current month if we're already in 2026+
  const getInitialDate = () => {
    const now = new Date();
    if (now.getFullYear() >= 2026) {
      return now;
    }
    return new Date(2026, 0, 1); // January 2026
  };
  
  const [currentDate, setCurrentDate] = useState(getInitialDate());
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);
  const calendarRef = useRef(null);
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth() + 1;

  // Fetch photos for current month
  const photos = useLiveQuery(
    () => getMonthPhotos(year, month),
    [year, month]
  ) || {};

  // Get only current month days (no padding from other months)
  const monthStart = startOfMonth(new Date(year, month - 1, 1));
  const monthEnd = endOfMonth(monthStart);
  const calendarDays = eachDayOfInterval({ start: monthStart, end: monthEnd });
  
  const monthName = getAbbreviatedMonthName(year, month);

  const handlePhotoClick = async (dateString, shouldDelete = false) => {
    if (shouldDelete) {
      await deletePhoto(dateString);
    } else {
      onDateSelect(dateString);
    }
  };

  const handlePrevMonth = () => {
    const newDate = new Date(year, month - 2, 1);
    setCurrentDate(newDate);
    if (onDateChange) onDateChange(newDate);
  };

  const handleNextMonth = () => {
    const newDate = new Date(year, month, 1);
    setCurrentDate(newDate);
    if (onDateChange) onDateChange(newDate);
  };

  // Swipe gesture handlers
  const minSwipeDistance = 50;

  const onTouchStart = (e) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe) {
      handleNextMonth();
    }
    if (isRightSwipe) {
      handlePrevMonth();
    }
  };

  return (
    <div 
      className="calendar-view"
      ref={calendarRef}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      <div className="calendar-header">
        <button 
          className="month-nav prev" 
          onClick={handlePrevMonth}
          aria-label="Previous month"
        >
          ←
        </button>
        <h2 className="month-title">{monthName}</h2>
        <button 
          className="month-nav next" 
          onClick={handleNextMonth}
          aria-label="Next month"
        >
          →
        </button>
      </div>

      <div className="calendar-grid">
        {calendarDays.map((date, index) => {
          const dateString = formatDate(date);
          const photo = photos[dateString];
          
          return (
            <DayCell
              key={index}
              date={date}
              photo={photo}
              onPhotoClick={handlePhotoClick}
              isCurrentMonth={true}
            />
          );
        })}
      </div>
    </div>
  );
};

export default CalendarView;

