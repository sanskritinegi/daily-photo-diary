import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  eachDayOfInterval, 
  getDay,
  isToday,
  isSameMonth,
  startOfWeek,
  endOfWeek
} from 'date-fns';

// Export eachDayOfInterval for use in components
export { eachDayOfInterval, startOfMonth, endOfMonth };

// Format date as "yyyy-MM-dd"
export const formatDate = (date) => {
  return format(date, 'yyyy-MM-dd');
};

// Get today's date string
export const getTodayString = () => {
  return formatDate(new Date());
};

// Get calendar days for a month (including padding days from previous/next month)
export const getCalendarDays = (year, month) => {
  const monthStart = new Date(year, month - 1, 1);
  const monthEnd = endOfMonth(monthStart);
  
  // Get first day of calendar (start of week containing month start)
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 }); // Monday = 1
  // Get last day of calendar (end of week containing month end)
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
  
  return eachDayOfInterval({ start: calendarStart, end: calendarEnd });
};

// Get day name abbreviation (Mon, Tue, etc.) - capitalized
export const getDayName = (date) => {
  const dayName = format(date, 'EEE');
  return dayName.charAt(0).toUpperCase() + dayName.slice(1).toLowerCase();
};

// Get day number
export const getDayNumber = (date) => {
  return format(date, 'd');
};

// Check if date is today
export const isDateToday = (date) => {
  return isToday(date);
};

// Check if date is in current month
export const isInCurrentMonth = (date, year, month) => {
  const monthDate = new Date(year, month - 1, 1);
  return isSameMonth(date, monthDate);
};

// Get month name
export const getMonthName = (year, month) => {
  const date = new Date(year, month - 1, 1);
  return format(date, 'MMMM yyyy');
};

// Get abbreviated month name (e.g., "Jan '26")
export const getAbbreviatedMonthName = (year, month) => {
  const date = new Date(year, month - 1, 1);
  const monthShort = format(date, 'MMM');
  // Get last 2 digits of year and format as '26
  const yearShort = year.toString().slice(-2);
  return `${monthShort} '${yearShort}`;
};

