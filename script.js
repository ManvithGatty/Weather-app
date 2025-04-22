const apiKey = "fca4646983673ce6d9d4137f0dac19f6";

const cityInput = document.getElementById("cityInput");
const searchBtn = document.getElementById("searchBtn");
const locateBtn = document.getElementById("locateBtn");
const weatherDisplay = document.getElementById("weatherDisplay");
const forecastDisplay = document.getElementById("forecast");
const recentCities = document.getElementById("recentCities");
const recentDropdown = document.getElementById("recentDropdown");


searchBtn.addEventListener("click", function(){
    const city = cityInput.value.trim();
    if (!city) {
      alert("Please enter a city name.");
      return;
    }

    getWeatherByCity(city);
    updateRecentCities(city);
});

recentDropdown.addEventListener("change", function(e){
    const city = e.target.value;
    if (city) {
      getWeatherByCity(city);
    }
});


locateBtn.addEventListener("click", function(){
    navigator.geolocation.getCurrentPosition(
      (position) => {
        getWeatherByCoords(position.coords.latitude, position.coords.longitude);
      },
      function(){
        alert("Could not get your location.");
      }
    );
});

function getWeatherByCity(city) {
    fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${apiKey}`
    )
      .then((res) => {
        if (!res.ok) throw new Error("City not found");
        return res.json();
      })
      .then((data) => {
        showWeather(data);
        getForecast(data.coord.lat, data.coord.lon);
      })
      .catch((err) => {
        alert(err.message);
      });
  }

  function getWeatherByCoords(lat, lon) {
    fetch(
      `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`
    )
      .then((res) => res.json())
      .then((data) => {
        showWeather(data);
        getForecast(lat, lon);
        updateRecentCities(data.name);
      })
      .catch(() => alert("Failed to fetch weather."));
  }

  
function showWeather(data) {
    weatherDisplay.classList.add("p-10");
    weatherDisplay.innerHTML = `
      <div class="flex flex-col gap-2">
        <h2 class="text-2xl font-bold italic">${data.name}</h2>
        <p><strong>Temp:</strong> ${data.main.temp}°C</p>
        <p><strong>Humidity:</strong> ${data.main.humidity}%</p>
        <p><strong>Wind:</strong> ${data.wind.speed} m/s</p>
      </div>
      <div class="justify-center">
        <img src="https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png" class="m-0" />
        <p>${data.weather[0].description}</p>
      </div>
      `;
  }

function getForecast(lat, lon) {
    fetch(
      `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`
    )
      .then((res) => res.json())
      .then((data) => {
        const daily = {};
        data.list.forEach((item) => {
          const date = item.dt_txt.split(" ")[0];
          if (!daily[date]) daily[date] = item;
        });
  
        forecastDisplay.innerHTML = "";
        Object.entries(daily).slice(0, 5).forEach(([date, item]) => {
          forecastDisplay.innerHTML += `
            <div class="bg-white p-10 rounded-2xl ">
              <p class="font-bold">${date}</p>
              <img src="https://openweathermap.org/img/wn/${item.weather[0].icon}.png" class="mx-auto" />
              <p>${item.weather[0].main}</p>
              <p>Temp: ${item.main.temp}°C</p>
              <p>Wind: ${item.wind.speed} m/s</p>
              <p>Humidity: ${item.main.humidity}%</p>
            </div>
          `;
        });
      });
  }
  
  function updateRecentCities(city) {
    let cities = JSON.parse(localStorage.getItem("recentCities")) || [];
    if (!cities.includes(city)) {
      cities.unshift(city);
      if (cities.length > 5) cities.pop();
      localStorage.setItem("recentCities", JSON.stringify(cities));
      populateDropdown();
    }
  }
  
  function populateDropdown() {
    let cities = JSON.parse(localStorage.getItem("recentCities")) || [];
    if (cities.length) {
      recentCities.classList.remove("hidden");
      recentDropdown.innerHTML = cities
        .map((city) => `<option value="${city}">${city}</option>`)
        .join("");
    }
  }
  
  populateDropdown();