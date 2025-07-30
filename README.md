# Productivity Task Manager

A minimalist dark-themed task management application with local storage persistence, designed for efficient workflow organization.

## Features

- **Task Organization**: Create groups and categorize tasks
- **Visual Indicators**: 
  - Color-coded tasks (red, blue, yellow, green)
  - Completed tasks automatically highlight in green
  - Custom checkbox design with visual feedback
- **Task Details**: 
  - Titles and descriptions
  - External links
  - Color tagging
- **Data Persistence**: All data saved to browser local storage
- **Responsive Design**: Adapts to desktop and mobile devices
- **Special Task Protection**: Learning challenge task with timed deletion lock

## Live Deployment

The application is available at:  
[https://rahul6158.github.io/30/](https://rahul6158.github.io/30/)

## Usage

1. **Group Management**:
   - Add new groups using the input field at the bottom of the page
   - Delete groups (except protected groups)

2. **Task Operations**:
   - Add tasks with titles, descriptions, and links
   - Mark tasks as complete/incomplete
   - Edit existing tasks
   - Delete tasks (with restrictions on protected items)

3. **Task Customization**:
   - Select from four color codes
   - Completed tasks automatically adopt green styling

## Technical Specifications

- **Frontend**: Vanilla HTML, CSS, JavaScript
- **Storage**: Browser LocalStorage API
- **Design**: Dark theme with purple accent colors
- **Compatibility**: Modern browsers (Chrome, Firefox, Edge, Safari)

## Implementation Details

- Custom checkbox implementation with CSS
- Responsive layout using Flexbox
- Data persistence through localStorage
- DOM manipulation for dynamic task management
- Protected task functionality with date validation
