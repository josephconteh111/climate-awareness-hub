## Overview
The Climate Awareness Hub is a multi-page website designed to educate users about climate change, provide weather information, and facilitate environmental issue reporting. 

The site aims to raise awareness and encourage proactive measures towards climate action.

## Project Structure
```
climate-awareness-hub
├── public
│   ├── index.html          # Home page with introduction and weather preview
│   ├── weather.html        # Weather page with live data and alerts
│   ├── report.html         # Reporting page for environmental issues
│   ├── education.html      # Educational content on climate change
│   ├── css
│   │   └── style.css       # Shared CSS styles for the website
│   ├── js
│   │   ├── main.js         # Shared JavaScript functionality
│   │   ├── weather.js      # Weather-specific JavaScript
│   │   ├── report.js       # Reporting-specific JavaScript
│   │   └── education.js     # Education-specific JavaScript
│   ├── components
│   │   ├── header.html     # Shared navigation bar
│   │   └── footer.html     # Shared footer
│   └── data
│       ├── sample-weather.json  # Sample weather data for testing
│       └── sample-reports.json   # Sample report data for testing
├── package.json            # npm configuration file
└── README.md               # Project documentation
```

## Features
- **Home Page**: Introduction to climate action with a quick weather preview widget.
- **Weather Page**: Integration with OpenWeatherMap API, geolocation for user location detection, live weather updates, dynamic icons, and flood risk alerts.
- **Report Page**: A form for users to report environmental issues, including validation and localStorage support for saving reports.
- **Education Page**: Informative content on climate change, its causes and effects, and tips for environmental protection.

## Setup Instructions
1. Clone the repository:
   ```
   git clone <repository-url>
   ```
2. Navigate to the project directory:
   ```
   cd climate-awareness-hub
   ```
3. Install dependencies:
   ```
   npm install
   ```
4. Open the `public/index.html` file in a web browser to view the website.

## Contributing
Contributions are welcome! Please submit a pull request or open an issue for any suggestions or improvements.

## License
This project is licensed under the MIT License. See the LICENSE file for details.
