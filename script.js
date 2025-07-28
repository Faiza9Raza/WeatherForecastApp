console.log('Welcome to weather dashboard')
document.addEventListener('DOMContentLoaded', () => {

    const API_KEY = '57c6c56b8da62f1b95d258e5391f1fef'; 

    // --- Element Selectors ---
    const cityInput = document.getElementById('city-input');
    const searchBtn = document.getElementById('search-btn');
    const locationBtn = document.getElementById('location-btn');

    const weatherContent = document.getElementById('weather-content');
    const loader = document.getElementById('loader-container');
    const errorMessage = document.getElementById('error-message');

    // Current Weather Elements
    const cityNameEl = document.getElementById('city-name');
    const currentDateEl = document.getElementById('current-date');
    const currentTempEl = document.getElementById('current-temp');
    const weatherIconEl = document.getElementById('current-weather-icon');
    const weatherDescriptionEl = document.getElementById('weather-description');
    const humidityEl = document.getElementById('humidity');
    const windSpeedEl = document.getElementById('wind-speed');
    const visibilityEl = document.getElementById('visibility');
    const feelsLikeEl = document.getElementById('feels-like');

    // Forecast Container
    const forecastContainer = document.getElementById('forecast-container');

    // --- Event Listeners ---
    searchBtn.addEventListener('click', handleSearch);
    cityInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    });
    locationBtn.addEventListener('click', getUserLocation);

    // --- Functions ---

    // Handle search button click
    function handleSearch() {
        const city = cityInput.value.trim();
        if (city) {
            fetchWeatherData(city);
        } else {
            showError("Please enter a city name.");
        }
    }

    // Get user's current location
    function getUserLocation() {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const { latitude, longitude } = position.coords;
                    fetchWeatherData(null, latitude, longitude);
                },
                (error) => {
                    showError("Unable to retrieve your location. Please search for a city manually.");
                    console.error("Geolocation error:", error);
                }
            );
        } else {
            showError("Geolocation is not supported by your browser.");
        }
    }

    // Fetch weather data from API
    async function fetchWeatherData(city = null, lat = null, lon = null) {
        if (API_KEY === 'YOUR_API_KEY_HERE') {
            showError("Please replace 'YOUR_API_KEY_HERE' with your actual OpenWeatherMap API key in the script.");
            return;
        }

        showLoader();
        hideError();

        // Determine which API URL to use
        const currentWeatherURL = city
            ? `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`
            : `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`;

        const forecastURL = city
            ? `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${API_KEY}&units=metric`
            : `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`;

        try {
            // Use Promise.all to fetch both current weather and forecast simultaneously
            const [currentWeatherResponse, forecastResponse] = await Promise.all([
                fetch(currentWeatherURL),
                fetch(forecastURL)
            ]);

            if (!currentWeatherResponse.ok || !forecastResponse.ok) {
                throw new Error(`HTTP error! Status: ${currentWeatherResponse.status} / ${forecastResponse.status}`);
            }

            const currentWeatherData = await currentWeatherResponse.json();
            const forecastData = await forecastResponse.json();

            updateUI(currentWeatherData, forecastData);

        } catch (error) {
            console.error("Error fetching weather data:", error);
            showError("Could not fetch weather data. Please check the city name or your API key.");
        } finally {
            hideLoader();
        }
    }

    // Update all UI elements with fetched data
    function updateUI(currentWeather, forecast) {
        // Update Current Weather
        cityNameEl.textContent = currentWeather.name;
        currentDateEl.textContent = new Date().toLocaleDateString('en-US', {
            weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
        });
        currentTempEl.textContent = `${Math.round(currentWeather.main.temp)}°C`;
        weatherIconEl.src = `https://openweathermap.org/img/wn/${currentWeather.weather[0].icon}@2x.png`;
        weatherIconEl.alt = currentWeather.weather[0].description;
        weatherDescriptionEl.textContent = currentWeather.weather[0].description;

        // Update Extra Details
        humidityEl.textContent = `${currentWeather.main.humidity}%`;
        windSpeedEl.textContent = `${(currentWeather.wind.speed * 3.6).toFixed(1)} km/h`; // m/s to km/h
        visibilityEl.textContent = `${(currentWeather.visibility / 1000).toFixed(1)} km`;
        feelsLikeEl.textContent = `${Math.round(currentWeather.main.feels_like)}°C`;

        // Update 5-Day Forecast
        updateForecastUI(forecast.list);
    }

    // Process and display the 5-day forecast
    function updateForecastUI(forecastList) {
        forecastContainer.innerHTML = ''; // Clear previous forecast

        // Filter the list to get one forecast per day (around noon)
        const dailyForecasts = forecastList.filter(item => item.dt_txt.includes("12:00:00"));

        dailyForecasts.forEach(forecast => {
            const forecastCard = document.createElement('div');
            forecastCard.className = 'forecast-card';

            const day = new Date(forecast.dt * 1000).toLocaleDateString('en-US', { weekday: 'short' });
            const icon = `https://openweathermap.org/img/wn/${forecast.weather[0].icon}@2x.png`;
            const temp = `${Math.round(forecast.main.temp)}°C`;

            forecastCard.innerHTML = `
                        <p class="day">${day}</p>
                        <img src="${icon}" alt="${forecast.weather[0].description}" class="forecast-icon">
                        <p class="temp">${temp}</p>
                    `;
            forecastContainer.appendChild(forecastCard);
        });
    }

    // --- UI Helper Functions ---
    function showLoader() {
        loader.classList.remove('hidden');
        weatherContent.classList.add('hidden');
    }

    function hideLoader() {
        loader.classList.add('hidden');
        weatherContent.classList.remove('hidden');
    }

    function showError(message) {
        errorMessage.querySelector('p').textContent = message;
        errorMessage.classList.remove('hidden');
        weatherContent.classList.add('hidden');
    }

    function hideError() {
        errorMessage.classList.add('hidden');
    }
    // Fetch weather for a default city when the page loads
    fetchWeatherData("Varanasi");
});
