# Result Management System (Single Page)

A lightweight, single-page Academic Result Portal for students. This application allows students to look up their academic results by selecting a semester and entering their Student ID or Registration Roll Number.

## Features

- **Single-Page Application**: Fast, modern React interface built with Vite.
- **Local Data Source**: Reads student results directly from a local `results.json` file.
- **No Backend Required**: Completely serverless. Perfect for static hosting or local file usage.
- **Print Support**: Includes a print-friendly stylesheet for saving result sheets as PDFs.
- **Responsive Design**: Clean and minimalistic academic UI designed to work seamlessly across desktop and mobile devices.

## Getting Started

### Prerequisites
- Node.js (v16+)

### Installation
1. Navigate into the `client` directory:
   ```bash
   cd client
   ```
2. Install the dependencies:
   ```bash
   npm install
   ```

### Running Locally
To start the Vite development server:
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) to view it in the browser.

### Updating Data
The student data is stored in `client/public/results.json`.
To add or update student results, simply edit the JSON file following this structure:

```json
[
  {
    "id": "0242320005101821",
    "roll": "232-15-821",
    "name": "Sakibul Islam",
    "batch": "65",
    "department": "B.Sc. in Computer Science & Engineering",
    "semester": "Spring 2026, 261",
    "sgpa": 4.00,
    "courses": [
      { "sl": 1, "code": "CSE323", "title": "Operating Systems", "credit": 3.00, "grade": "A+", "point": 4.00 }
    ]
  }
]
```

## Future Upgrades
The project has been simplified to its core frontend component. In the future, if an Admin Panel or dynamic server integration is required, a dedicated backend (Node.js/Express) and database (MongoDB) can be seamlessly integrated.
