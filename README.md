
# Locatr – Smart Nearby Places Recommender

Locatr is a location-based web application that helps users discover nearby essential places such as hospitals, ATMs, restaurants, shopping malls, and hotels. It uses real-time geolocation, interactive maps, and road-based routing to provide accurate distances and estimated travel time (ETA).

---

## Features

- Detects the user’s current location using browser geolocation
- Interactive map powered by Leaflet and OpenStreetMap
- Find nearby places by category (Hospital, ATM, Restaurant, Mall, Hotel)
- Calculates real-time distance from the user to each place
- Displays route and ETA using OSRM routing
- Draggable user marker to simulate location changes
- Results sorted based on nearest distance
- Clean, responsive, and professional user interface

---

## Tech Stack

- HTML5
- CSS3
- JavaScript (Vanilla JS)
- Leaflet.js
- OpenStreetMap
- Overpass API
- Leaflet Routing Machine with OSRM

---

## Project Structure

```
Locatr/
├── index.html        # Main HTML file
├── nearby.css        # Styling and UI design
├── nearby.js         # Core logic, map and API handling
└── README.md         # Project documentation
```

---

## How to Run the Project

1. Open the project folder in a code editor
2. Run the project using a local development server (Live Server or localhost)
3. Open the application in a modern web browser
4. Allow location access when prompted

---

## Browser Permissions

Ensure that location access is enabled in the browser for proper functionality.

---

## How It Works

1. The browser retrieves the user’s latitude and longitude using geolocation
2. Leaflet initializes the map centered at the user’s location
3. The Overpass API is queried to fetch nearby places within a 3 km radius
4. Distances are calculated using the Haversine formula
5. Results are dynamically sorted and displayed
6. Selecting a place draws a route with ETA using OSRM

---

## Supported Place Categories

- Hospital
- ATM
- Restaurant
- Shopping Mall
- Hotel

---

## Use Cases

- Smart city and location-based applications
- College mini-projects and hackathons
- Navigation and proximity-based systems
- Frontend and API integration demonstrations

---

## Author

Sejal Chaudhary
Second-year Artificial Intelligence and Data Engineering undergraduate with interests in frontend development, machine learning, and building real-world applications.
