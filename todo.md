# Companies House Monitor - Project TODO

## Core Features

- [x] Set up Companies House API integration with authentication
- [x] Implement local data storage (AsyncStorage) for favorited companies
- [x] Create company data model and types
- [x] Implement deadline calculation logic (accounts and confirmation statement)
- [x] Create API service for Companies House endpoints (company profile, search, filing history, officers)

## UI Screens

- [x] Dashboard (home) screen with company list and urgency indicators
- [x] Company detail screen with full information
- [x] Add company search screen with autocomplete
- [x] Settings screen with API key configuration
- [x] Company search results screen

## Dashboard Features

- [x] Display favorited companies in scrollable list
- [x] Show next deadline with days remaining
- [x] Color-coded urgency indicators (red/amber/green)
- [x] Pull-to-refresh functionality
- [ ] Swipe-to-delete company cards
- [x] Sort by urgency (default), name, and last updated
- [x] Filter to show only companies with deadlines in next 30 days
- [x] Loading indicator during data refresh
- [x] Add company button (floating action or bottom bar)

## Company Detail Features

- [x] Display company name, number, and status
- [x] Show registered office address
- [x] Display company type and incorporation date
- [x] Show annual accounts deadline with due date
- [x] Show confirmation statement deadline with due date
- [x] Display current directors with appointment dates
- [x] Show filing history timeline (last 5-10 filings)
- [x] Display last updated timestamp
- [x] Delete company button
- [x] Error handling for missing data

## Add Company Features

- [x] Search by company number (exact match)
- [x] Search by company name (autocomplete from API)
- [x] Display search results with company details
- [x] Add selected company to favorites
- [x] Handle API errors and invalid searches
- [x] Show loading state during search

## Settings Features

- [x] API key input field with save button
- [x] API key validation (test call to Companies House API)
- [x] Display API key validation status
- [x] Toggle notifications on/off
- [x] Checkboxes for notification timing (30, 14, 7 days)
- [ ] Clear cache button
- [ ] Refresh all companies button
- [x] Display last refresh timestamp
- [x] App version display
- [ ] Documentation link

## Notifications

- [ ] Set up expo-notifications for local push notifications
- [ ] Schedule notifications for 30 days before deadline
- [ ] Schedule notifications for 14 days before deadline
- [ ] Schedule notifications for 7 days before deadline
- [ ] Handle notification permissions
- [ ] Allow users to enable/disable notifications in settings
- [ ] Tap notification to open company detail screen

## Data Management

- [ ] Persist favorited companies to AsyncStorage
- [ ] Persist API key securely (expo-secure-store)
- [ ] Persist notification preferences
- [ ] Auto-refresh data on app open
- [ ] Manual refresh with pull-to-refresh
- [ ] Handle API rate limiting
- [ ] Cache company data with last updated timestamp

## Error Handling

- [ ] Handle API connection failures
- [ ] Display cached data with warning when offline
- [ ] Handle invalid company numbers/names
- [ ] Handle API rate limiting errors
- [ ] Handle missing or incomplete company data
- [ ] Display user-friendly error messages
- [ ] Provide retry options

## UI/UX Polish

- [ ] Implement responsive layouts for iPhone and iPad
- [ ] Use SF Symbols for icons
- [ ] Implement dark mode support
- [ ] Add haptic feedback for interactions
- [ ] Smooth transitions between screens
- [ ] Loading states and spinners
- [ ] Empty state messaging

## Branding

- [x] Generate custom app logo
- [x] Update app.config.ts with app name and logo
- [x] Set up splash screen

## Testing & Deployment

- [ ] Test all user flows end-to-end
- [ ] Test API integration with real Companies House data
- [ ] Test notification scheduling and delivery
- [ ] Test data persistence across app sessions
- [ ] Test error handling and edge cases
- [ ] Test dark mode and responsive layouts
- [ ] Prepare for iOS deployment
