const axios = require("axios");
const Destination = require("../models/Destination");

const WEATHER_API_KEY = process.env.OPENWEATHER_API_KEY;
const CACHE_DURATION_MS = 30 * 60 * 1000; // 30 minutes

// Fetch weather for a single destination
const fetchWeatherForDestination = async (destination) => {
  try {
    const { lat, lng } = destination.location.coordinates;
    if (!lat || !lng) return null;

    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lng}&appid=${WEATHER_API_KEY}&units=metric`;
    const response = await axios.get(url);
    const data = response.data;

    const weather = {
      temp: Math.round(data.main.temp),
      feelsLike: Math.round(data.main.feels_like),
      condition: data.weather[0].main,
      description: data.weather[0].description,
      humidity: data.main.humidity,
      windSpeed: data.wind.speed,
      icon: data.weather[0].icon,
      lastFetched: new Date(),
    };

    // Update destination weather cache in DB
    await Destination.findByIdAndUpdate(destination._id, { weather });

    return weather;
  } catch (error) {
    console.error(
      `Weather fetch failed for ${destination.name}:`,
      error.message,
    );
    return null;
  }
};

// Get weather for a destination (uses cache if fresh)
const getWeather = async (destinationId) => {
  const destination = await Destination.findById(destinationId);
  if (!destination) return null;

  const now = new Date();
  const lastFetched = destination.weather?.lastFetched;
  const isCacheValid =
    lastFetched && now - new Date(lastFetched) < CACHE_DURATION_MS;

  if (isCacheValid) {
    return destination.weather; // return cached
  }

  return await fetchWeatherForDestination(destination);
};

// Refresh weather for all active destinations (called periodically)
const refreshAllWeather = async () => {
  try {
    const destinations = await Destination.find({
      isActive: true,
      "location.coordinates.lat": { $exists: true },
    });

    console.log(
      `🌤 Refreshing weather for ${destinations.length} destinations...`,
    );

    for (const dest of destinations) {
      await fetchWeatherForDestination(dest);
      // Small delay to avoid rate limiting
      await new Promise((r) => setTimeout(r, 1000));
    }

    console.log("✅ Weather refresh complete.");
  } catch (error) {
    console.error("Weather refresh error:", error.message);
  }
};

module.exports = { getWeather, refreshAllWeather };
