import { useState } from 'react';
import { getDayName, getDayNumber, isDateToday, formatDate } from '../utils/dateHelpers';
import { isPast, startOfDay, isFuture } from 'date-fns';
import './DayCell.css';

const DayCell = ({ date, photo, onPhotoClick, isCurrentMonth }) => {
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const isToday = isDateToday(date);
  const today = startOfDay(new Date());
  const dateStart = startOfDay(date);
  const isPastDate = dateStart < today && !isToday;
  const isFutureDate = isFuture(dateStart);
  const dayName = getDayName(date);
  const dayNumber = getDayNumber(date);
  const dateString = formatDate(date);

  const handleCellClick = () => {
    // Allow deleting photos from future dates (in case they were added before)
    if (photo) {
      setShowDeleteModal(true);
    } else if (!isFutureDate) {
      // Only allow selecting past dates or today
      onPhotoClick(dateString);
    }
    // Future dates without photos are not clickable
  };

  const handleDelete = () => {
    onPhotoClick(dateString, true);
    setShowDeleteModal(false);
  };

  const handleCloseModal = () => {
    setShowDeleteModal(false);
  };

  return (
    <>
      <div
        className={`day-cell ${isToday ? 'today' : ''} ${isPastDate ? 'past' : ''} ${isFutureDate ? 'future' : ''} ${!isCurrentMonth ? 'other-month' : ''} ${photo ? 'has-photo' : ''}`}
        onClick={handleCellClick}
      >
        <div className="day-header">
          <span className="day-name">{dayName}</span>
          <span className="day-number">{dayNumber}</span>
        </div>
        {photo && (
          <div className="photo-container">
            <img src={photo} alt={`Photo for ${dateString}`} className="day-photo" />
          </div>
        )}
      </div>

      {showDeleteModal && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <img src={photo} alt={`Photo for ${dateString}`} className="modal-photo" />
            <div className="modal-actions">
              <button className="btn-delete" onClick={handleDelete}>
                Delete Photo
              </button>
              <button className="btn-cancel" onClick={handleCloseModal}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default DayCell;

