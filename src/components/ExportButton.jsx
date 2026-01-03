import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { startOfMonth, endOfMonth, eachDayOfInterval } from 'date-fns';
import { getMonthPhotos } from '../utils/db';
import { getAbbreviatedMonthName, formatDate } from '../utils/dateHelpers';
import './ExportButton.css';

const ExportButton = ({ currentYear, currentMonth }) => {
  const [isExporting, setIsExporting] = useState(false);

  const photos = useLiveQuery(
    () => getMonthPhotos(currentYear, currentMonth),
    [currentYear, currentMonth]
  ) || {};

  const handleExport = async () => {
    setIsExporting(true);
    
    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      // Set canvas size (square for Instagram)
      const size = 1080; // Instagram square size
      canvas.width = size;
      canvas.height = size;
      
      // Background - paper texture effect
      ctx.fillStyle = '#faf9f6';
      ctx.fillRect(0, 0, size, size);
      
      // Add subtle texture overlay
      ctx.fillStyle = 'rgba(0, 0, 0, 0.02)';
      for (let i = 0; i < 100; i++) {
        const x = Math.random() * size;
        const y = Math.random() * size;
        ctx.fillRect(x, y, 2, 2);
      }
      
      // Month header
      const monthName = getAbbreviatedMonthName(currentYear, currentMonth);
      ctx.fillStyle = '#000';
      ctx.font = 'bold 48px system-ui';
      ctx.textAlign = 'center';
      ctx.fillText(monthName, size / 2, 60);
      
      // Calendar grid - only current month days
      const monthStart = startOfMonth(new Date(currentYear, currentMonth - 1, 1));
      const monthEnd = endOfMonth(monthStart);
      const calendarDays = eachDayOfInterval({ start: monthStart, end: monthEnd });
      const cols = 7;
      const rows = Math.ceil(calendarDays.length / cols);
      const cellSize = (size - 120) / Math.max(cols, rows);
      const startX = (size - (cols * cellSize)) / 2;
      const startY = 100;
      
      // Process days sequentially to load images properly
      for (let index = 0; index < calendarDays.length; index++) {
        const date = calendarDays[index];
        const col = index % cols;
        const row = Math.floor(index / cols);
        const x = startX + col * cellSize;
        const y = startY + row * cellSize;
        
        const dateString = formatDate(date);
        const photo = photos[dateString];
        
        // Draw cell border
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.1)';
        ctx.lineWidth = 1;
        ctx.strokeRect(x, y, cellSize, cellSize);
        
        if (photo) {
          // Draw photo - load sequentially
          const img = new Image();
          await new Promise((resolve, reject) => {
            img.onload = () => {
              ctx.drawImage(img, x, y, cellSize, cellSize);
              resolve();
            };
            img.onerror = reject;
            img.src = photo;
          });
          
          // Overlay day number
          ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
          ctx.fillRect(x, y, cellSize, 20);
          ctx.fillStyle = '#000';
          ctx.font = 'bold 12px system-ui';
          ctx.textAlign = 'left';
          ctx.fillText(date.getDate().toString(), x + 4, y + 14);
        } else {
          // Empty cell - show day number
          ctx.fillStyle = '#ccc';
          ctx.font = '12px system-ui';
          ctx.textAlign = 'left';
          ctx.fillText(date.getDate().toString(), x + 4, y + 14);
        }
      }
      
      // Download
      canvas.toBlob((blob) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        const filename = monthName.replace(/\s+/g, '_').toLowerCase() + '_diary.png';
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }, 'image/png');
      
    } catch (error) {
      console.error('Export error:', error);
      alert('Failed to export. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <button 
      className="export-button" 
      onClick={handleExport}
      disabled={isExporting}
      title="Export month as image"
    >
      {isExporting ? '⏳' : '⬇️'}
    </button>
  );
};

export default ExportButton;

