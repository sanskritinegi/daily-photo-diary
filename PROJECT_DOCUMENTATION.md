# Daily Photo Diary - Complete Project Documentation

## Table of Contents
1. [Project Overview](#project-overview)
2. [Architecture & Tech Stack](#architecture--tech-stack)
3. [Project Structure](#project-structure)
4. [Key Features Implemented](#key-features-implemented)
5. [Design Decisions](#design-decisions)
6. [Component Details](#component-details)
7. [Database Schema](#database-schema)
8. [Deployment](#deployment)
9. [Future Roadmap](#future-roadmap)
10. [Development Workflow](#development-workflow)

---

## Project Overview

**Daily Photo Diary** is a web-based PWA (Progressive Web App) that allows users to capture one photo per day and view them in a beautiful calendar grid layout. The app has a scrapbook-inspired aesthetic with a minimalist design.

### Core Concept
- Users select ONE photo per day from their gallery or camera
- Photos are displayed in a calendar grid (3 columns mobile, 7 columns desktop)
- All data is stored locally in the browser (IndexedDB)
- Users can export monthly collages as Instagram Story format (1080x1920)

### Target Users
Young people (18-30) who want to document daily life and share aesthetic monthly layouts on social media.

---

## Architecture & Tech Stack

### Frontend
- **Framework**: React 19.2.0 + Vite 7.2.4
- **Styling**: CSS (mobile-first, scrapbook aesthetic)
- **Font**: Patrick Hand (Google Fonts) - handwritten style
- **Icons**: Material Icons Outlined (Google Material Icons)

### Data Storage
- **Database**: IndexedDB via Dexie.js 4.2.1
- **Storage Format**: Base64 encoded images
- **Why IndexedDB**: Can store large images locally without size limits of localStorage

### Date Handling
- **Library**: date-fns 4.1.0
- Used for all date calculations, formatting, and calendar logic

### PWA Support
- **Manifest**: Configured for installable PWA
- **Offline**: Works offline after first load
- **Installable**: Can be added to home screen on iOS/Android

---

## Project Structure

```
daily-photo-diary/
├── public/
│   ├── manifest.json          # PWA manifest
│   └── vite.svg               # App icon
├── src/
│   ├── components/
│   │   ├── CalendarView.jsx   # Main calendar grid component
│   │   ├── CalendarView.css
│   │   ├── DayCell.jsx        # Individual day cell component
│   │   ├── DayCell.css
│   │   ├── AddPhotoButton.jsx # Photo upload/camera button
│   │   ├── AddPhotoButton.css
│   │   ├── ExportButton.jsx   # Monthly collage export
│   │   └── ExportButton.css
│   ├── utils/
│   │   ├── db.js              # IndexedDB operations (Dexie)
│   │   └── dateHelpers.js     # Date utility functions
│   ├── App.jsx                # Main app component
│   ├── App.css                # Global app styles
│   ├── index.css              # Base styles
│   └── main.jsx               # App entry point
├── index.html                 # HTML template
├── package.json
├── vite.config.js
├── vercel.json                # Vercel deployment config
├── netlify.toml               # Netlify deployment config
└── DEPLOYMENT.md              # Deployment guide
```

---

## Key Features Implemented

### 1. Calendar Grid View
- **Mobile**: 3-column grid
- **Desktop**: 7-column grid (responsive)
- Shows only current month days (no padding from other months)
- Month navigation with arrows (← Jan '26 →)
- Swipe gestures for mobile navigation

### 2. Photo Management
- **Upload**: Select from gallery or take photo with camera
- **Storage**: Photos stored as base64 in IndexedDB
- **Compression**: Auto-compresses to max 1200px width, ~2MB limit
- **Deletion**: Click photo to delete (with confirmation modal)
- **Validation**: Cannot add photos to future dates

### 3. Date Styling
- **Today**: Black text, 2px border (when no photo)
- **Past dates**: Black text (when no photo)
- **Future dates**: Gray text, 30% opacity, not clickable
- **Photos**: Fill entire cell with day name/number overlay

### 4. Export Feature
- **Format**: Instagram Story (1080x1920 vertical)
- **Layout**: 4-column grid
- **Styling**: Paper texture background, Patrick Hand font
- **Quality**: High-quality image smoothing, proper aspect ratio
- **Clipping**: Images properly contained within cell boundaries

### 5. Camera Integration
- **Mobile**: Uses native camera app via `capture="environment"`
- **Desktop**: Uses MediaDevices API for webcam access
- **Options Modal**: Choose between camera or gallery

---

## Design Decisions

### Why No Camera API Directly?
Web camera UX is poor on mobile; users prefer using native camera app, which provides better quality and features.

### Why IndexedDB?
- Can store images locally without size limits of localStorage
- Persistent storage that survives browser restarts
- Better performance for large data

### Why No Auth?
Reduces complexity for MVP; users can export backups manually. Future: Can add Firebase auth if needed.

### Why Base64?
Simple storage format, no need for blob URLs. Images are compressed before storage.

### Why Local-Only Storage?
- Privacy: User data stays on device
- No backend costs
- Works offline
- Fast performance

### Mobile-First Design
- 3-column grid on mobile matches the design aesthetic
- Swipe gestures for navigation
- Touch-optimized buttons and interactions

---

## Component Details

### CalendarView.jsx
**Purpose**: Main calendar container and month navigation

**Key Features**:
- Manages current month state
- Fetches photos for current month using Dexie React hooks
- Handles month navigation (prev/next)
- Swipe gesture support for mobile
- Initializes to January 2026 (or current month if in 2026+)

**Props**:
- `selectedDate`: Currently selected date string
- `onDateSelect`: Callback when date is selected
- `onDateChange`: Callback when month changes

**State**:
- `currentDate`: Current month being viewed
- `touchStart/touchEnd`: For swipe gestures

### DayCell.jsx
**Purpose**: Individual calendar day cell

**Key Features**:
- Displays day name and number
- Shows photo if exists
- Handles click (select date or show delete modal)
- Determines if date is past/today/future
- Styling based on date state

**Props**:
- `date`: Date object
- `photo`: Base64 image string (optional)
- `onPhotoClick`: Callback for photo actions
- `isCurrentMonth`: Boolean for styling

**States**:
- `showDeleteModal`: Controls delete confirmation modal

### AddPhotoButton.jsx
**Purpose**: Photo upload/camera interface

**Key Features**:
- Shows options modal (camera vs gallery)
- Handles file selection
- Validates file type and future dates
- Saves photo to IndexedDB
- Desktop webcam support with live preview

**Props**:
- `selectedDate`: Date string to add photo to
- `onPhotoAdded`: Callback after successful upload

**States**:
- `showOptions`: Controls camera/gallery modal
- `showCamera`: Controls webcam preview (desktop)

### ExportButton.jsx
**Purpose**: Generate and download monthly collage

**Key Features**:
- Creates 1080x1920 canvas (Instagram Story format)
- 4-column grid layout
- Loads all photos sequentially
- Applies proper clipping to prevent cell bleeding
- High-quality image rendering
- Downloads as PNG

**Props**:
- `currentYear`: Current year
- `currentMonth`: Current month (1-12)

**States**:
- `isExporting`: Loading state during export

---

## Database Schema

### IndexedDB Structure (via Dexie)

```javascript
Database: 'DailyPhotoDiary'
Version: 1

Table: photos
  - date: string (primary key, format: "yyyy-MM-dd")
  - image: string (base64 encoded)
  - timestamp: number (Date.now())
```

### Database Operations (db.js)

**savePhoto(date, imageFile)**
- Converts file to base64
- Compresses to max 1200px width
- Stores in IndexedDB
- Returns boolean success

**getPhoto(date)**
- Retrieves single photo by date
- Returns object or null

**getMonthPhotos(year, month)**
- Gets all photos for a month
- Returns map: { "2026-01-03": "base64...", ... }

**deletePhoto(date)**
- Removes photo from IndexedDB
- Returns boolean success

### Image Compression
- Max width: 1200px (maintains aspect ratio)
- Quality: 0.85 JPEG (further compressed to 0.7 if > 2MB)
- Format: JPEG for storage efficiency

---

## Date Utilities (dateHelpers.js)

### Key Functions

**formatDate(date)**: Returns "yyyy-MM-dd" format

**getTodayString()**: Returns today's date string

**getCalendarDays(year, month)**: Returns array of Date objects for month (no padding)

**getDayName(date)**: Returns capitalized day name ("Mon", "Tue", etc.)

**getDayNumber(date)**: Returns day number as string

**isDateToday(date)**: Checks if date is today

**isInCurrentMonth(date, year, month)**: Checks if date is in specified month

**getAbbreviatedMonthName(year, month)**: Returns "Jan '26" format

---

## Styling & Design

### Color Scheme
- Background: `#fafafa` (light gray)
- Text: `#000` (black) for past/today, `#999` (gray) for future
- Borders: `#000` (black, 1px)
- Paper texture: Subtle overlay with repeating gradients

### Typography
- **Font**: Patrick Hand (Google Fonts)
- **Headers**: 20px mobile, 24px desktop
- **Day labels**: 13px
- **Buttons**: 15px mobile, 16px desktop

### Layout
- **Mobile**: 3-column grid, minimal padding
- **Desktop**: 7-column grid
- **Cells**: Square (aspect-ratio: 1), black borders
- **Gap**: 0px (cells touch each other)

### Responsive Breakpoints
- Mobile: < 768px (3 columns)
- Desktop: >= 769px (7 columns)

---

## Deployment

### Current Setup
- **Platform**: Vercel (auto-deploys from GitHub)
- **Repository**: https://github.com/sanskritinegi/daily-photo-diary
- **Live URL**: https://daily-photo-diary-sable.vercel.app

### Deployment Process
1. Push to GitHub: `git push origin main`
2. Vercel automatically detects changes
3. Builds and deploys in ~2-3 minutes
4. HTTPS enabled (required for camera/webcam)

### Configuration Files
- **vercel.json**: Vercel build settings
- **netlify.toml**: Alternative Netlify config
- **manifest.json**: PWA configuration

### Environment
- No environment variables needed (fully client-side)
- No API keys required
- Works entirely in browser

---

## Future Roadmap

### Phase 2 Features (Planned)

#### 1. Multiple Photos Per Day
- Allow users to add multiple photos per day
- Grid view within day cell
- Swipeable gallery for day view

#### 2. Text Captions
- Add text notes to each day
- Character limit (e.g., 200 chars)
- Display in day cell or modal

#### 3. Sticker/Decoration Editor
- Add stickers before export
- Washi tape decorations
- Hand-drawn style elements

#### 4. Multiple Export Formats
- Instagram Story (current: 1080x1920)
- Instagram Post (1080x1080 square)
- Instagram Reel (1080x1920 vertical)
- Desktop wallpaper (custom sizes)

#### 5. Cloud Backup (Optional)
- Firebase integration
- User accounts (email/password)
- Sync across devices
- Manual backup/restore

#### 6. Weekly/Yearly Views
- Weekly summary view
- Year overview (all months)
- Statistics (photos per month, streaks)

#### 7. Video Montage Generation
- Auto-generate monthly video
- Music selection
- Transition effects

### iOS Native App (Future)

#### Architecture Options
1. **React Native**: Share codebase with web
2. **Swift/SwiftUI**: Native iOS app
3. **Expo**: React Native with easier deployment

#### Key Considerations
- **Storage**: Use Core Data or SQLite instead of IndexedDB
- **Camera**: Native iOS camera API
- **Photos**: PhotoKit framework for gallery access
- **Export**: Native share sheet
- **Sync**: iCloud or Firebase for cross-device sync

#### Recommended Approach
- **Phase 1**: Keep web app as primary
- **Phase 2**: Build React Native app (share ~70% code)
- **Phase 3**: Native Swift app if needed for performance

#### iOS-Specific Features
- Widget support (show today's photo)
- Shortcuts integration
- Apple Watch companion app
- Siri integration ("Show me my photo from last Tuesday")
- Live Activities (photo reminders)

---

## Development Workflow

### Local Development
```bash
# Install dependencies
npm install

# Run dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Making Changes
1. Make code changes locally
2. Test with `npm run dev`
3. Commit: `git add . && git commit -m "Description"`
4. Push: `git push origin main`
5. Vercel auto-deploys

### Code Style
- **Components**: Functional components with hooks
- **Styling**: CSS modules (separate .css files)
- **State**: React hooks (useState, useEffect)
- **Data**: Dexie React hooks for IndexedDB

### Testing Checklist
- [ ] Photo upload works (gallery and camera)
- [ ] Photos display correctly in calendar
- [ ] Delete functionality works
- [ ] Month navigation works
- [ ] Export generates correct collage
- [ ] Mobile responsive design
- [ ] PWA installable
- [ ] Future dates blocked
- [ ] Past dates show black text

---

## Known Issues & Limitations

### Current Limitations
1. **No cloud sync**: Data only on device
2. **No accounts**: Can't sync across devices
3. **Browser-specific**: Data tied to browser
4. **Export quality**: Depends on original photo quality
5. **Large months**: 31 days might be tight in 4-column layout

### Browser Compatibility
- Modern browsers only (Chrome, Safari, Firefox)
- iOS Safari 14+
- Android Chrome 90+
- Requires HTTPS for camera/webcam

### Performance Considerations
- Images compressed before storage
- Lazy loading could be added for large months
- Export can take 10-30 seconds for months with many photos

---

## Key Design Patterns

### 1. Mobile-First Responsive Design
- Start with mobile layout (3 columns)
- Scale up to desktop (7 columns)
- Touch-optimized interactions

### 2. Local-First Architecture
- All data stored locally
- No backend required
- Works offline
- Fast performance

### 3. Progressive Enhancement
- Basic functionality works everywhere
- Advanced features (camera) require modern browsers
- Graceful degradation

### 4. Component Composition
- Small, focused components
- Reusable DayCell component
- Clear separation of concerns

---

## Important Notes for Future Development

### When Adding Features

1. **Maintain Local Storage**: Keep IndexedDB as primary storage
2. **Preserve Privacy**: Don't add tracking or analytics without user consent
3. **Keep It Simple**: Avoid feature bloat
4. **Mobile First**: Always test on mobile devices
5. **Export Quality**: Maintain high-quality exports

### When Building iOS App

1. **Share Logic**: Extract business logic to shared utilities
2. **Platform-Specific UI**: Use React Native or native UI
3. **Storage Migration**: Plan for data export/import
4. **Camera API**: Use native iOS camera for best UX
5. **App Store**: Follow Apple guidelines for photo apps

### Code Organization Principles

- **Components**: One component per file
- **Utils**: Shared logic in utils folder
- **Styles**: Component-specific CSS files
- **Constants**: Extract magic numbers to constants
- **Types**: Consider TypeScript for future refactor

---

## Contact & Resources

### Repository
- GitHub: https://github.com/sanskritinegi/daily-photo-diary
- Live Site: https://daily-photo-diary-sable.vercel.app

### Dependencies
- React: ^19.2.0
- Vite: ^7.2.4
- Dexie: ^4.2.1
- date-fns: ^4.1.0

### Documentation
- Vite: https://vite.dev
- Dexie: https://dexie.org
- date-fns: https://date-fns.org
- React: https://react.dev

---

## Quick Reference: Common Tasks

### Add a New Feature
1. Create component in `src/components/`
2. Add styles in corresponding `.css` file
3. Import and use in `App.jsx` or parent component
4. Test on mobile and desktop
5. Commit and push

### Fix a Bug
1. Reproduce issue
2. Identify root cause
3. Fix in relevant component/util
4. Test thoroughly
5. Commit with descriptive message

### Update Styling
1. Edit component's `.css` file
2. Test responsive behavior
3. Ensure mobile-first approach
4. Check Patrick Hand font usage
5. Verify color consistency

### Deploy Changes
1. `git add .`
2. `git commit -m "Description"`
3. `git push origin main`
4. Wait for Vercel deployment (~2-3 min)
5. Verify on live site

---

**Last Updated**: January 2026
**Version**: 1.0.0
**Status**: MVP Complete, Ready for Phase 2 Features

