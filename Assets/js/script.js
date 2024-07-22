const apiKey = '58f91c77f2eecc48613b9892a1ce0d0a';

const getCoordinates = async (city) => {
    const apiUrl = `https://api.openweathermap.org/geo/1.0/direct?q=${city}&limit=1&appid=${apiKey}`;
    const response = await fetch(apiUrl);
    if (!response.ok) throw new Error('Failed to fetch coordinates');
    const data = await response.json();
    if (data.length === 0) throw new Error('City not found');
    return { lat: data[0].lat, lon: data[0].lon };
};

const getWeatherData = async (lat, lon) => {
    const apiUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=imperial`;
    const response = await fetch(apiUrl);
    if (!response.ok) throw new Error('Failed to fetch weather data');
    return await response.json();
};

const saveSearchHistory = (city) => {
    let searchHistory = JSON.parse(localStorage.getItem('searchHistory')) || [];
    if (!searchHistory.includes(city)) {
        searchHistory.push(city);
        localStorage.setItem('searchHistory', JSON.stringify(searchHistory));
    }
};

const loadSearchHistory = () => {
    let searchHistory = JSON.parse(localStorage.getItem('searchHistory')) || [];
    const searchHistoryList = document.getElementById('search-history');
    searchHistoryList.innerHTML = '';
    searchHistory.forEach(city => {
        const li = document.createElement('li');
        li.textContent = city;
        li.addEventListener('click', () => {
            document.getElementById('city-input').value = city;
            handleSearch();
        });
        searchHistoryList.appendChild(li);
    });
};

const displayWeather = (weatherData) => {
    const currentWeather = weatherData.list[0];
    const forecast = weatherData.list.filter((_, index) => index % 8 === 0).slice(0, 5);

    const currentWeatherDiv = document.getElementById('current-weather');
    currentWeatherDiv.innerHTML = `
        <h3>
            ${weatherData.city.name} (${new Date(currentWeather.dt * 1000).toLocaleDateString()})
            <img src="https://openweathermap.org/img/wn/${currentWeather.weather[0].icon}.png" alt="${currentWeather.weather[0].description}">
        </h3>
        
        <p>Temp: ${currentWeather.main.temp}°F</p>
        <p>Wind: ${currentWeather.wind.speed} MPH</p>
        <p>Humidity: ${currentWeather.main.humidity}%</p>
       
    `;

    const forecastDiv = document.getElementById('forecast');
    forecastDiv.innerHTML = '';
    forecast.forEach(day => {
        const forecastDay = document.createElement('div');
        forecastDay.setAttribute('class', 'forecast-day');
        forecastDay.innerHTML = `
            <h4>${new Date(day.dt * 1000).toLocaleDateString()}</h4>
            <img src="https://openweathermap.org/img/wn/${day.weather[0].icon}.png" alt="${day.weather[0].description}">
            <p>Temp: ${day.main.temp}°F</p>
            <p>Wind: ${day.wind.speed} MPH</p>
            <p>Humidity: ${day.main.humidity}%</p>
        `;
        forecastDiv.appendChild(forecastDay);
    });
};

const handleSearch = async () => {
    const city = document.getElementById('city-input').value;
    if (!city) return;
    try {
        const { lat, lon } = await getCoordinates(city);
        const weatherData = await getWeatherData(lat, lon);
        displayWeather(weatherData);
        saveSearchHistory(city);
        loadSearchHistory();
    } catch (error) {
        console.error(error);
        alert('Failed to retrieve weather data. Please try again.');
    }
};

document.getElementById('city-form').addEventListener('submit', (event) => {
    event.preventDefault();
    handleSearch();
});

window.onload = () => {
    loadSearchHistory();
};
