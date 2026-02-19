# Companies House Monitor - Mobile App Design

## Overview

A professional iOS app for tracking UK company filing deadlines and compliance obligations. The app emphasizes clarity, urgency, and actionable information with a clean, business-focused interface.

## Screen List

1. **Dashboard (Home)** — Main screen showing favorited companies and upcoming deadlines
2. **Company Detail** — Full company information, filing history, and deadline breakdown
3. **Add Company** — Search and add companies by number or name
4. **Settings** — API key configuration, notification preferences, and app options
5. **Company Search Results** — Autocomplete suggestions from Companies House API

## Primary Content and Functionality

### Dashboard Screen
- **Header**: "Companies House Monitor" with refresh button and settings icon
- **Filter/Sort Controls**: Buttons to toggle urgency filter (next 30 days) and sort options (urgency, name, last updated)
- **Company Cards** (scrollable list):
  - Company name and registration number
  - Next deadline (type: Accounts or Confirmation Statement)
  - Days remaining (e.g., "Due in 14 days")
  - Urgency badge: Red (< 14 days), Amber (15-30 days), Green (> 30 days)
  - Swipe-left to delete
- **Pull-to-Refresh** gesture to update all company data
- **Add Company Button** (floating action button or bottom bar)
- **Loading indicator** during refresh

### Company Detail Screen
- **Header**: Company name, registration number, status badge
- **Key Information Section**:
  - Registered office address
  - Company type and incorporation date
  - Company status (active/dissolved)
- **Deadlines Section**:
  - Annual Accounts deadline with due date and days remaining
  - Confirmation Statement deadline with due date and days remaining
  - Color-coded urgency indicators
- **Directors Section**: List of current directors with appointment dates
- **Filing History Section**: Timeline of recent submissions (last 5-10 filings)
- **Delete Company Button** at bottom
- **Last Updated** timestamp

### Add Company Screen
- **Search Input Field**: "Enter company number or name"
- **Search Type Toggle**: "By Number" / "By Name"
- **Search Results List**:
  - Company name, number, and status
  - Tap to add to favorites
  - Loading state during API calls
- **Error Messages**: Display API errors or no results found
- **Back Button** to return to dashboard

### Settings Screen
- **API Key Section**:
  - Text input to enter/update Companies House API key
  - Save button
  - Status indicator (✓ Valid / ✗ Invalid)
- **Notification Preferences**:
  - Toggle: Enable/disable notifications
  - Checkboxes: Alert at 30 days, 14 days, 7 days before deadline
- **Data Management**:
  - "Clear Cache" button
  - "Refresh All Companies" button
  - Last refresh timestamp
- **About Section**:
  - App version
  - Link to documentation

## Key User Flows

### Flow 1: View Dashboard and Check Deadlines
1. User opens app
2. App auto-refreshes company data from Companies House API
3. Dashboard displays all favorited companies sorted by urgency (default)
4. User sees color-coded urgency indicators at a glance
5. User can filter to show only companies with deadlines in next 30 days

### Flow 2: Add a Company
1. User taps "Add Company" button
2. Search screen opens
3. User enters company number or name
4. App queries Companies House API and displays autocomplete suggestions
5. User taps a result to add to favorites
6. App returns to dashboard with new company added

### Flow 3: View Company Details
1. User taps a company card on dashboard
2. Detail screen opens with full company information
3. User sees all upcoming deadlines with days remaining
4. User can scroll to view filing history and director information
5. User can delete company or return to dashboard

### Flow 4: Receive Deadline Notifications
1. User enables notifications in settings
2. App schedules local notifications for 30, 14, and 7 days before each deadline
3. When deadline approaches, user receives notification (e.g., "Urgent: Accounts due in 14 days for ABC Ltd")
4. User can tap notification to open company detail screen

### Flow 5: Configure API Key
1. User opens settings
2. User enters Companies House API key
3. User taps save
4. App validates key by making a test API call
5. Status indicator shows ✓ Valid or ✗ Invalid

## Color Choices

| Element | Color | Usage |
|---------|-------|-------|
| **Primary** | `#0a7ea4` (Professional Blue) | Buttons, links, active states |
| **Background** | `#ffffff` (Light) / `#151718` (Dark) | Screen background |
| **Surface** | `#f5f5f5` (Light) / `#1e2022` (Dark) | Card backgrounds |
| **Foreground** | `#11181C` (Dark) / `#ECEDEE` (Light) | Primary text |
| **Muted** | `#687076` (Light) / `#9BA1A6` (Dark) | Secondary text |
| **Success** | `#22C55E` (Green) | Deadline > 30 days, valid API key |
| **Warning** | `#F59E0B` (Amber) | Deadline 15-30 days |
| **Error** | `#EF4444` (Red) | Deadline < 14 days, invalid API key |
| **Border** | `#E5E7EB` (Light) / `#334155` (Dark) | Dividers, borders |

## Design Principles

- **Clarity**: Information hierarchy is clear; users can understand deadlines at a glance
- **Urgency**: Color coding and prominent deadline display make urgent actions obvious
- **Efficiency**: One-handed usage; critical buttons are within thumb reach
- **Professional**: Business-appropriate design; suitable for corporate use
- **Responsive**: Layouts adapt to iPhone and iPad with appropriate spacing
- **Accessibility**: High contrast, readable fonts, clear interactive elements
