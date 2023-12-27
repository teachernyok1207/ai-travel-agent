import OpenAI from "openai"
import { getCurrentWeather } from "./tools"

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
    dangerouslyAllowBrowser: true
})

// For Increase and Decrease Number
const minusButton = document.getElementById("minus-button")
const numberOfTravellers = document.getElementById("number-of-travellers")
const plusButton = document.getElementById("plus-button")
let currentTraveller = parseInt(numberOfTravellers.textContent)

minusButton.addEventListener("click",function(){
    if (currentTraveller != 1){
        currentTraveller -= 1
    }
    numberOfTravellers.textContent = currentTraveller
})

plusButton.addEventListener("click",function(){
    currentTraveller += 1
    numberOfTravellers.textContent = currentTraveller
})

// Objects for Button Process
const frontScreen = document.getElementById("frontScreen")
const bookingScreen = document.getElementById("bookingScreen")
const loadingScreen = document.getElementById("loadingScreen")
const resultScreen = document.getElementById("resultScreen")
const letsBegin = document.getElementById("lets-begin")
const planMyTrip = document.getElementById("plan-my-trip")

// Fetch Inputs
const flyingFrom = document.getElementById("flying-from")
const flyingTo = document.getElementById("flying-to")
const fromDate = document.getElementById("from-date")
const toDate = document.getElementById("to-date")
const budget = document.getElementById("budget")

// Fetch Results
const resultFromDate = document.getElementById("result-from-date")
const resultToDate = document.getElementById("result-to-date")
const resultDestination = document.getElementById("result-destination")
const resultWeather = document.getElementById("result-weather")
const resultFlight = document.getElementById("result-flight")
const resultHotel = document.getElementById("result-hotel")
const resultActivities = document.getElementById("result-activities")
const resultRestart = document.getElementById("result-restart")

letsBegin.addEventListener("click",function(){
    frontScreen.style.display = "none"
    bookingScreen.style.display = "flex"    
})

planMyTrip.addEventListener("click",async function(e){
    // Try
    e.preventDefault()
    
    if (toDate.value < fromDate.value){
        alert("Error Entering Your Flight Date!")
    }else{
        if (!flyingFrom.value || !flyingTo.value || !fromDate.value || !toDate.value){
            alert("Please fill all the required field!")
        }else{
            try {
                
                bookingScreen.style.display = "none"
                loadingScreen.style.display = "flex"
                
                const weatherData = await getCurrentWeather(fromDate.value,toDate.value,flyingTo.value)
                console.log(weatherData)
                let weatherAiDetails = await constructWeatherFromAI(weatherData)
                let flightAiDetails = await constructFlightFromAI()
                let accommodationAiDetails = await constructAccommodationFromAI()
                let activitiesAiDetails = await constructActivitiesFromAI(weatherAiDetails)
                const formattedFromDate = formatDate(fromDate.value)
                const formattedToDate = formatDate(toDate.value)
                
                resultFromDate.innerHTML = `→ ${formattedFromDate}`
                resultToDate.innerHTML = `${formattedToDate} ←`
                resultDestination.innerHTML = `${flyingFrom.value} → ${flyingTo.value}`
                resultWeather.innerHTML = weatherAiDetails
                resultFlight.innerHTML = flightAiDetails
                resultHotel.innerHTML = accommodationAiDetails
                resultActivities.innerHTML = activitiesAiDetails
                
                resultScreen.style.display = "flex"
                loadingScreen.style.display = "none"
            } catch (error) {
                console.error('Error fetching weather data:', error)
                loadingScreen.style.display = "none"
                frontScreen.style.display = "flex"
                alert('Error fetching weather data:', error)
            }   
        }
    }
})

// Declare message
const weatherMessages = [
    {
        role: "system",
        content: `
            You are a helpful AI Travel Agent. The highest and lowest temperature and the weather condition of the locations are now provided. All you have to do is to construct a short paragraph about the weather condition of the destination. Provide your shortest answer around 1-3 sentence only.
        `
    }
]

const flightMessages = [
    {
        role: "system",
        content: `
            You are a helpful AI Travel Agent. The user will be giving two locations which is the origin and the destination. As well as the flight dates which is the date from, date to, and the budget of the traveller. All you have to do is to suggest the name of the airline that is suitable for the scheduled flights and how to transport from the origin to the destinations as well as their budgets. Provide your shortest answer around 1-3 sentence only. 
        `
    }
]

const hotelMessages = [
    {
        role: "system",
        content: `
            You are a helpful AI Travel Agent. Provide the your suggested hotel accommodation based on the destination, the budget, the number of the travelers. Provide your shortest answer around 1-3 sentence only. 
        `
    }
]

const activityMessages = [
    {
        role: "system",
        content: `
            You are a helpful AI Travel Agent. The user will provide all the details that you may need like the weather conditions, number of travelers, dates, destinations, and budgets. All you need to do is to provide 2-3 activities that are suitable to all their inputs such as food trips, museum visits, outdoor adventures etc. 
        `
    }
]

async function constructWeatherFromAI(weather){
    weatherMessages.push(
        {
            role: "user",
            content: `Lowest Temperature in Celsius: ${weather.main.temp_min}, Highest Temperature in Celsius: ${weather.main.temp_max}, Weather Condition: ${weather.weather[0].description}, Location: ${flyingTo.value}`
        }
    )
    
    const { choices } = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: weatherMessages,
        temperature: 0.65,
        frequency_penalty: 0.5
    })
    console.log(choices[0].message.content)
    return choices[0].message.content
}

async function constructFlightFromAI(){
    flightMessages.push(
        {
            role: "user",
            content: `Origin: ${flyingFrom.value}, Destination: ${flyingTo.value}, Date From: ${fromDate.value}, Date To: ${toDate.value}, Budget: ${budget.value}`
        }
    )
    
    const { choices } = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: flightMessages,
        temperature: 0.65,
        frequency_penalty: 0.5
    })
    return choices[0].message.content
}

async function constructAccommodationFromAI(){
    hotelMessages.push(
        {
            role: "user",
            content: `Destination: ${flyingTo.value}, Date From: ${fromDate.value}, Date To: ${toDate.value}, Budget: ${budget.value}, Number of Travelers: ${numberOfTravellers.textContent}`
        }
    )
    
    const { choices } = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: hotelMessages,
        temperature: 0.65,
        frequency_penalty: 0.5
    })
    return choices[0].message.content
}

async function constructActivitiesFromAI(weather){
    activityMessages.push(
        {
            role: "user",
            content: `Destination: ${flyingTo.value}, Date From: ${fromDate.value}, Date To: ${toDate.value}, Budget: ${budget.value}, Number of Travelers: ${numberOfTravellers.textContent}, Weather Conditions: ${weather}`
        }
    )
    
    const { choices } = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: activityMessages,
        temperature: 0.65,
        frequency_penalty: 0.5
    })
    return choices[0].message.content
}

// Format Date
function getOrdinalSuffix(number) {
    if (number >= 11 && number <= 13) {
        return 'th'
    }
    const lastDigit = number % 10
    switch (lastDigit) {
        case 1: return 'st'
        case 2: return 'nd'
        case 3: return 'rd'
        default: return 'th'
    }
}

function formatDate(dateString) {
    const date = new Date(dateString)
    const day = date.getDate()
    const month = new Intl.DateTimeFormat('en', { month: 'short' }).format(date)
    const year = date.getFullYear().toString().slice(-2)

    const formattedDate = `${day}${getOrdinalSuffix(day)} ${month} ${year}`
    return formattedDate
}

// Reset The Page
resultRestart.addEventListener("click", function(e){
    // Resetting All
    numberOfTravellers.textContent = 1
    flyingFrom.value = ""
    flyingTo.value = ""
    fromDate.value = ""
    toDate.value = ""
    budget.value = 1
    
    resultScreen.style.display = "none"
    frontScreen.style.display = "flex"
})