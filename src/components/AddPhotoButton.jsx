import { useRef, useState, useEffect } from 'react';
import { startOfDay, isFuture } from 'date-fns';
import { savePhoto } from '../utils/db';
import './AddPhotoButton.css';

const AddPhotoButton = ({ selectedDate, onPhotoAdded }) => {
  const cameraInputRef = useRef(null);
  const galleryInputRef = useRef(null);
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const [showOptions, setShowOptions] = useState(false);
  const [showCamera, setShowCamera] = useState(false);

  // Check if selected date is in the future
  const isFutureDate = selectedDate ? isFuture(startOfDay(new Date(selectedDate))) : false;

  // Initialize camera stream when showCamera becomes true
  useEffect(() => {
    if (showCamera && videoRef.current && !streamRef.current) {
      const initCamera = async () => {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ 
            video: { facingMode: 'environment' } 
          });
          streamRef.current = stream;
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
        } catch (error) {
          console.error('Error accessing camera:', error);
          alert('Unable to access camera. Please check permissions or use gallery instead.');
          setShowCamera(false);
        }
      };
      initCamera();
    }

    // Cleanup function
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
    };
  }, [showCamera]);

  const handleButtonClick = () => {
    if (isFutureDate) {
      alert('Cannot add memories to future dates');
      return;
    }
    setShowOptions(true);
  };

  const handleCameraClick = async () => {
    setShowOptions(false);
    
    // Check if we're on mobile - use file input with capture
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    
    if (isMobile) {
      // On mobile, use file input with capture attribute
      cameraInputRef.current?.click();
    } else {
      // On desktop, use webcam API
      setShowCamera(true);
    }
  };

  const handleGalleryClick = () => {
    setShowOptions(false);
    galleryInputRef.current?.click();
  };

  const handleCapturePhoto = () => {
    if (!videoRef.current) return;

    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0);

    canvas.toBlob(async (blob) => {
      if (blob && selectedDate) {
        // Stop the camera stream
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop());
          streamRef.current = null;
        }
        setShowCamera(false);

        // Create a File object from the blob
        const file = new File([blob], 'photo.jpg', { type: 'image/jpeg' });
        await handleFileSave(file);
      }
    }, 'image/jpeg', 0.9);
  };

  const handleCancelCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setShowCamera(false);
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    await handleFileSave(file);
  };

  const handleFileSave = async (file) => {
    if (!selectedDate) return;

    // Double check - prevent adding to future dates
    if (isFuture(startOfDay(new Date(selectedDate)))) {
      alert('Cannot add memories to future dates');
      return;
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    // Save photo
    const success = await savePhoto(selectedDate, file);
    
    if (success) {
      onPhotoAdded();
      // Reset file inputs
      if (cameraInputRef.current) {
        cameraInputRef.current.value = '';
      }
      if (galleryInputRef.current) {
        galleryInputRef.current.value = '';
      }
    } else {
      alert('Failed to save photo. Please try again.');
    }
  };

  const handleCloseOptions = () => {
    setShowOptions(false);
  };

  if (!selectedDate) {
    return (
      <div className="add-photo-button-container">
        <p className="instruction-text">Select a date to add a memory</p>
      </div>
    );
  }

  if (isFutureDate) {
    return (
      <div className="add-photo-button-container">
        <p className="instruction-text">Cannot add memories to future dates</p>
      </div>
    );
  }

  return (
    <>
      <div className="add-photo-button-container">
        <input
          ref={cameraInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleFileChange}
          style={{ display: 'none' }}
        />
        <input
          ref={galleryInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          style={{ display: 'none' }}
        />
        <button className="add-photo-button" onClick={handleButtonClick}>
          + Add memory
        </button>
      </div>

      {showOptions && (
        <div className="options-modal-overlay" onClick={handleCloseOptions}>
          <div className="options-modal" onClick={(e) => e.stopPropagation()}>
            <h3 className="options-title">Add Memory</h3>
            <div className="options-buttons">
              <button className="option-button camera" onClick={handleCameraClick}>
                <span className="option-icon">📷</span>
                <span>Take Photo</span>
              </button>
              <button className="option-button gallery" onClick={handleGalleryClick}>
                <span className="option-icon">🖼️</span>
                <span>Choose from Gallery</span>
              </button>
            </div>
            <button className="options-cancel" onClick={handleCloseOptions}>
              Cancel
            </button>
          </div>
        </div>
      )}

      {showCamera && (
        <div className="camera-modal-overlay">
          <div className="camera-modal">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              className="camera-video"
            />
            <div className="camera-controls">
              <button className="camera-capture-btn" onClick={handleCapturePhoto}>
                <span className="capture-icon">📷</span>
              </button>
              <button className="camera-cancel-btn" onClick={handleCancelCamera}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AddPhotoButton;
