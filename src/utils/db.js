import Dexie from 'dexie';

// Initialize Dexie database
export const db = new Dexie('DailyPhotoDiary');

// Define schema
db.version(1).stores({
  photos: 'date, image, timestamp' // date is primary key
});

// Database operations
export const savePhoto = async (date, imageFile) => {
  try {
    // Convert file to base64
    const base64 = await fileToBase64(imageFile);
    
    await db.photos.put({
      date: date,
      image: base64,
      timestamp: Date.now()
    });
    
    return true;
  } catch (error) {
    console.error('Error saving photo:', error);
    return false;
  }
};

export const getPhoto = async (date) => {
  try {
    return await db.photos.get(date);
  } catch (error) {
    console.error('Error getting photo:', error);
    return null;
  }
};

export const getMonthPhotos = async (year, month) => {
  try {
    // Get all photos for the month
    const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
    const endDate = `${year}-${String(month).padStart(2, '0')}-31`;
    
    const photos = await db.photos
      .where('date')
      .between(startDate, endDate, true, true)
      .toArray();
    
    // Convert to map for easy lookup
    const photoMap = {};
    photos.forEach(photo => {
      photoMap[photo.date] = photo.image;
    });
    
    return photoMap;
  } catch (error) {
    console.error('Error getting month photos:', error);
    return {};
  }
};

export const deletePhoto = async (date) => {
  try {
    await db.photos.delete(date);
    return true;
  } catch (error) {
    console.error('Error deleting photo:', error);
    return false;
  }
};

// Helper: Convert file to base64 with compression
const fileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        // Create canvas for compression
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        // Calculate new dimensions (max 1200px width)
        let width = img.width;
        let height = img.height;
        const maxWidth = 1200;
        
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }
        
        canvas.width = width;
        canvas.height = height;
        
        // Draw and compress
        ctx.drawImage(img, 0, 0, width, height);
        const compressedBase64 = canvas.toDataURL('image/jpeg', 0.85);
        
        // Check size (limit to ~2MB)
        if (compressedBase64.length > 2000000) {
          // Further compress if needed
          const furtherCompressed = canvas.toDataURL('image/jpeg', 0.7);
          resolve(furtherCompressed);
        } else {
          resolve(compressedBase64);
        }
      };
      
      img.onerror = reject;
      img.src = e.target.result;
    };
    
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

