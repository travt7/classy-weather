import React from "react";

function getWeatherIcon(wmoCode) {
  const icons = new Map([
    [[0], "☀️"],
    [[1], "🌤"],
    [[2], "⛅️"],
    [[3], "☁️"],
    [[45, 48], "🌫"],
    [[51, 56, 61, 66, 80], "🌦"],
    [[53, 55, 63, 65, 57, 67, 81, 82], "🌧"],
    [[71, 73, 75, 77, 85, 86], "🌨"],
    [[95], "🌩"],
    [[96, 99], "⛈"],
  ]);
  const arr = [...icons.keys()].find((key) => key.includes(wmoCode));
  if (!arr) return "NOT FOUND";
  return icons.get(arr);
}

function convertToFlag(countryCode) {
  const codePoints = countryCode
    .toUpperCase()
    .split("")
    .map((char) => 127397 + char.charCodeAt());
  return String.fromCodePoint(...codePoints);
}

function formatDay(dateStr) {
  return new Intl.DateTimeFormat("en", {
    weekday: "short",
  }).format(new Date(dateStr));
}

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      location: "Lisbon",
      isLoading: false,
      displayLocation: "", //need city and weather onto the UI
      weather: {}, //initialize as an empty object bc it will become an object later
    }; //add all state to this object
    //need to explicitly bind an instance of the App class to the
    //fetchWeather method.
    this.fetchWeather = this.fetchWeather.bind(this); //giving an instance of the App
    //class access to the fetchWeather App class method. when the fetchWeather method is
    //used as an event handler (as it is in the onClick attribute), you want
    //to make sure that this inside fetchWeather refers to the instance of the App class.
    //An instance of the App class has access to the state var and fetchWeather method.
  }

  async fetchWeather() {
    //console.log("Loading data...");
    //console.log(this); //refers to the instance of the App class
    //The binding in the constructor (this.fetchWeather = this.fetchWeather.bind(this);)
    //ensures that when the fetchWeather method is invoked, this within the method refers
    //to the instance of the class, allowing you to access the component's state, props,
    //and other methods.

    try {
      this.setState({ isLoading: true }); //this will only update/mutate the isLoading
      //property on the state. Updating the state(that is an object) with a useState hook
      //is different. We could not update the one property, we would have to first destructure
      //the current state with ...this.state and then mutate this one isLoading property
      //and then return the entire object with all of it's properties.

      // 1) Getting location (geocoding)
      const geoRes = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${this.state.location}`
      );
      const geoData = await geoRes.json();
      console.log(geoData); //don't want this entire object array in state

      if (!geoData.results) throw new Error("Location not found");

      const { latitude, longitude, timezone, name, country_code } =
        geoData.results.at(0);
      //we want the name property from the results property in state so we can display it
      this.setState({
        displayLocation: `${name} ${convertToFlag(country_code)}`,
      });

      // 2) Getting actual weather
      const weatherRes = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&timezone=${timezone}&daily=weathercode,temperature_2m_max,temperature_2m_min`
      );
      const weatherData = await weatherRes.json();
      this.setState({ weather: weatherData.daily });
      console.log(weatherData.daily);
    } catch (err) {
      console.err(err);
    } finally {
      //this will run regardless of whether the try catch threw an error
      this.setState({ isLoading: false });
    }
  }
  //this gives me all the data that I need to nicely display and render in the div in the UI

  render() {
    return (
      <div className="app">
        <h1>Classy Weather</h1>
        <div>
          <input
            type="text"
            placeholder="Search for location..."
            value={this.state.location} //set the value of the input element to the state's location property
            onChange={(e) => this.setState({ location: e.target.value })} //the onChange will set the location property on the state object. Tying the state object to the
            //input element using value prop. It's called with each event(keypress) that occurs
          />
        </div>
        <button onClick={this.fetchWeather}>Get Weather</button>

        {this.state.isLoading && <p className="loader">Loading...</p>}

        {this.state.weather.weathercode && (
          <Weather
            weather={this.state.weather}
            location={this.state.displayLocation}
            //with this instantiation, you are creating a Weather component instance with
            //specific props, and it will render based on the data provided through those
            //props. The weather prop is set to this.state.weather and the location prop is
            //set to this.state.displayLocation.
          />
        )}
      </div>
    );
  }
}
//I am updating the state property on an instance of the App class, and you've
//ensured that the this context is correctly bound for the fetchWeather class method.

export default App;

//Render the received weather data from the API. For that create brand new component and
//INCLUDE it in our App's JSX. Do so conditionally, only if there is actually some weather
//data do we want to display the weather component.
class Weather extends React.Component {
  render() {
    const {
      temperature_2m_max: max,
      temperature_2m_min: min,
      time: dates,
      weathercode: codes,
    } = this.props.weather; //these destructured props are arrays
    //render method called each time the component is rendered
    //The location
    //for the heading is taken from the 'location' property of the props object, not
    //from the weather components state. The props object is an input to a React
    //Component. The props object is passed to the
    //React component from it's parent. Weather's parent is App and location is
    //expected to be passed to the Weather component as a prop called location when
    //it is instantiated within a parent component.
    console.log(this.props); //cl the Weather instances props object
    return (
      <div>
        <h2>Weather {this.props.location}</h2>
        <ul className="weather">
          {dates.map((date, i) => (
            <Day
              date={date}
              max={max.at(i)}
              min={min.at(i)}
              code={codes.at(i)}
              key={date}
              isToday={i === 0}
            />
          ))}
        </ul>
      </div>
    );
  }
}
//The Day Class Component is instantiated in the Weather Class Component above with
//properties such as date, max, min, code, key, isToday that are passed down into
//the Day class as an object?
class Day extends React.Component {
  render() {
    const { date, max, min, code, isToday } = this.props; //use this data to render weather
    //These properties are expected to be passed down in the props object when the
    //Day component is instantiated in the Weather class.
    return (
      <li className="day">
        <span>{getWeatherIcon(code)}</span>
        <p>{isToday ? "Today" : formatDay(date)}</p>
        <p>
          {Math.floor(min)}&deg; &mdash; <strong>{Math.ceil(max)}&deg;</strong>
        </p>
      </li>
    );
  }
}
