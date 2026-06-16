// This file contains JavaScript code specifically for the weather page, including API calls and dynamic updates related to weather data.

document.addEventListener('DOMContentLoaded', function() {
    const apiKey = 'YOUR_API_KEY'; // Replace with your OpenWeatherMap API key
    const weatherContainer = document.getElementById('weather-container');
    const locationButton = document.getElementById('location-button');

    // Function to fetch weather data
    function fetchWeatherData(lat, lon) {
        const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;

        fetch(url)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                displayWeather(data);
            })
            .catch(error => {
                console.error('There was a problem with the fetch operation:', error);
            });
    }

    // Function to display weather data
    function displayWeather(data) {
        const temperature = data.main.temp;
        const weatherCondition = data.weather[0].description;
        const windSpeed = data.wind.speed;
        const humidity = data.main.humidity;
        const weatherIcon = `http://openweathermap.org/img/wn/${data.weather[0].icon}.png`;

        weatherContainer.innerHTML = `
            <h2>Current Weather</h2>
            <img src="${weatherIcon}" alt="${weatherCondition}">
            <p>Temperature: ${temperature}°C</p>
            <p>Condition: ${weatherCondition}</p>
            <p>Wind Speed: ${windSpeed} m/s</p>
            <p>Humidity: ${humidity}%</p>
        `;
    }

    // Function to get user's location
    function getLocation() {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(position => {
                const lat = position.coords.latitude;
                const lon = position.coords.longitude;
                fetchWeatherData(lat, lon);
            }, () => {
                alert('Unable to retrieve your location.');
            });
        } else {
            alert('Geolocation is not supported by this browser.');
        }
    }

    // Event listener for location button
    locationButton.addEventListener('click', getLocation);
});