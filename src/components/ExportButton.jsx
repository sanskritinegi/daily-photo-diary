import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { startOfMonth, endOfMonth, eachDayOfInterval } from 'date-fns';
import { getMonthPhotos } from '../utils/db';
import { getAbbreviatedMonthName, formatDate, getDayName } from '../utils/dateHelpers';
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
      
      // Instagram Story size: 1080x1920 (vertical)
      const width = 1080;
      const height = 1920;
      canvas.width = width;
      canvas.height = height;
      
      // Background - paper texture effect
      ctx.fillStyle = '#fafafa';
      ctx.fillRect(0, 0, width, height);
      
      // Add subtle texture overlay
      ctx.fillStyle = 'rgba(0, 0, 0, 0.015)';
      for (let i = 0; i < 200; i++) {
        const x = Math.random() * width;
        const y = Math.random() * height;
        ctx.fillRect(x, y, 2, 2);
      }
      
      // Month header at top
      const monthName = getAbbreviatedMonthName(currentYear, currentMonth);
      ctx.fillStyle = '#000';
      ctx.font = 'bold 64px "Patrick Hand", cursive';
      ctx.textAlign = 'center';
      ctx.fillText(monthName, width / 2, 100);
      
      // Calendar grid - only current month days
      const monthStart = startOfMonth(new Date(currentYear, currentMonth - 1, 1));
      const monthEnd = endOfMonth(monthStart);
      const calendarDays = eachDayOfInterval({ start: monthStart, end: monthEnd });
      
      // Calculate grid layout for Instagram story
      // Use 4 columns to reduce side padding
      const cols = 4;
      const rows = Math.ceil(calendarDays.length / cols);
      
      // Calculate cell size to fit in available space
      const padding = 40;
      const headerHeight = 150;
      const availableHeight = height - headerHeight - padding * 2;
      const availableWidth = width - padding * 2;
      
      const cellWidth = Math.floor(availableWidth / cols);
      const cellHeight = Math.floor(availableHeight / rows);
      const cellSize = Math.min(cellWidth, cellHeight);
      
      // Center the grid
      const gridWidth = cellSize * cols;
      const gridHeight = cellSize * rows;
      const startX = (width - gridWidth) / 2;
      const startY = headerHeight + 40;
      
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
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 1;
        ctx.strokeRect(x, y, cellSize, cellSize);
        
        if (photo) {
          // Draw photo - load sequentially
          const img = new Image();
          await new Promise((resolve, reject) => {
            img.onload = () => {
              // Draw photo to fill cell
              ctx.drawImage(img, x, y, cellSize, cellSize);
              
              // Overlay gradient for text readability
              const gradient = ctx.createLinearGradient(x, y, x, y + 30);
              gradient.addColorStop(0, 'rgba(0, 0, 0, 0.6)');
              gradient.addColorStop(1, 'transparent');
              ctx.fillStyle = gradient;
              ctx.fillRect(x, y, cellSize, 30);
              
              // Day name and number overlay
              const dayName = getDayName(date);
              const dayNumber = date.getDate();
              
              ctx.fillStyle = '#fff';
              ctx.font = '400 20px "Patrick Hand", cursive';
              ctx.textAlign = 'left';
              ctx.fillText(dayName, x + 8, y + 22);
              
              ctx.font = '400 20px "Patrick Hand", cursive';
              ctx.textAlign = 'right';
              ctx.fillText(dayNumber.toString(), x + cellSize - 8, y + 22);
              
              resolve();
            };
            img.onerror = reject;
            img.src = photo;
          });
        } else {
          // Empty cell - show day name and number in gray
          const dayName = getDayName(date);
          const dayNumber = date.getDate();
          
          ctx.fillStyle = '#999';
          ctx.font = '400 20px "Patrick Hand", cursive';
          ctx.textAlign = 'left';
          ctx.fillText(dayName, x + 8, y + 22);
          
          ctx.textAlign = 'right';
          ctx.fillText(dayNumber.toString(), x + cellSize - 8, y + 22);
        }
      }
      
      // Download
      canvas.toBlob((blob) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        const filename = monthName.replace(/\s+/g, '_').toLowerCase() + '_story.png';
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
      title="Download month as Instagram story"
    >
      {isExporting ? (
        <span className="material-icons-outlined">hourglass_empty</span>
      ) : (
        <span className="material-icons-outlined">download</span>
      )}
    </button>
  );
};

export default ExportButton;
