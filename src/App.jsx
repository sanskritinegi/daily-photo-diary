import { useState } from 'react';
import CalendarView from './components/CalendarView';
import AddPhotoButton from './components/AddPhotoButton';
import './App.css';

function App() {
  const [selectedDate, setSelectedDate] = useState(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [refreshKey, setRefreshKey] = useState(0);

  const handleDateSelect = (dateString) => {
    setSelectedDate(dateString);
  };

  const handlePhotoAdded = () => {
    setSelectedDate(null);
    setRefreshKey(prev => prev + 1); // Force calendar refresh
  };

  return (
    <div className="app">
      <div className="app-content" key={refreshKey}>
        <CalendarView 
          selectedDate={selectedDate}
          onDateSelect={handleDateSelect}
          onDateChange={setCurrentDate}
        />
      </div>

      <AddPhotoButton 
        selectedDate={selectedDate}
        onPhotoAdded={handlePhotoAdded}
      />
    </div>
  );
}

export default App;
