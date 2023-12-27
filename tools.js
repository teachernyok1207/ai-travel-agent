export let currentWeatherDetails

export async function getCurrentWeather(startDate, endDate, city) {
    const apiKey = '70c890cc21b2e019fa6d9b3708a30958';
    const apiUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&start=${startDate}&end=${endDate}&units=metric&appid=${apiKey}`;

    return fetch(apiUrl)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .catch(error => {
            console.error('Error fetching weather data:', error);
            throw error; 
        });
}