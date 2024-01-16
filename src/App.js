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
  //we can define state objects and methods as class fields and got rid of all the
  //boilderplate code. The big win is that we no longer need to bind the this keyword
  //to our event handler methods. Now the class instance methods are defined as a
  //normal variable. This gives functional components a great advantage.
  state = {
    location: "",
    isLoading: false,
    displayLocation: "", //need city and weather onto the UI
    weather: {}, //initialize as an empty object bc it will become an object later
  }; //add all state to this object
  //constructor(props) {
  //super(props);
  //need to explicitly bind an instance of the App class to the
  //fetchWeather method.
  //this.fetchWeather = this.fetchWeather.bind(this); //giving an instance of the App
  //class access to the fetchWeather App class method. when the fetchWeather method is
  //used as an event handler (as it is in the onClick attribute), you want
  //to make sure that this inside fetchWeather refers to the instance of the App class.
  //An instance of the App class has access to the state var and fetchWeather method.

  //arrow functions do not lose their binding to the this keyword and we can simply
  //assign a function value to this fetchWeather variable. Arrow functions don't have
  //their own this keyword but instead get access to the surrounding one.
  //async fetchWeather() {
  fetchWeather = async () => {
    //console.log("Loading data...");
    //console.log(this); //refers to the instance of the App class
    //The binding in the constructor (this.fetchWeather = this.fetchWeather.bind(this);)
    //ensures that when the fetchWeather method is invoked, this within the method refers
    //to the instance of the class, allowing you to access the component's state, props,
    //and other methods.
    if (this.state.location.length < 2) return this.setState({ weather: {} }); //API only searches if we have 2 chars
    //so if not 2 chars fetchWeather returns before running any further and sets our
    //state.weather back to an empty object. Allows weather component to unmount. Ideal
    //to clean up after some side effects we created.

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
      console.error(err);
    } finally {
      //this will run regardless of whether the try catch threw an error
      this.setState({ isLoading: false });
    }
  };
  //this gives me all the data that I need to nicely display and render in the div in the UI
  setLocation = (e) => this.setState({ location: e.target.value });

  //called right after the DOM has been created just like the empty dependency array
  //of the useEffect hook. Ideal place to perform initial side effects as the component
  //loads. Like useEffect [] it only runs on mount but not re renders.
  componentDidMount() {
    this.setState({ location: localStorage.getItem("location") || "" });
    //this.fetchWeather(); //So as soon as the App is loaded this will immediately start
    //fetching for the weather. When there is no location in the input tag this function
    //will still attempt fetchWeather() on initial mount so I commented it out.
    //Here I want to set the state to the data that is coming from localStorage.
    //setting location
    //state property to the location key's value in localStorage. But when App loads
    //for first time there will be no local storage yet associated with this key so
    //need a default of an empty string.
  }

  //React gives this access to the previous state and previous props.
  //Similar to useEffect with some variable in dependency array. So we can use the
  //prevState param to check if the state.location has changed. Similar to
  //useEffect[location] but difference is this method is only called on re render and
  //not on initial mount.
  componentDidUpdate(prevProps, prevState) {
    //comparing current state with previous state. If the current state has changed
    //across renders then call fetchWeather. Now every time I type in the input it
    //triggers a re render bc the state.location is changing
    if (this.state.location !== prevState.location) {
      this.fetchWeather();
      //now we can remove the Get Weather button in the JSX because the location
      //state changes by typing in the input tag, re render happens, fetchWeather() called. No button needed.
      localStorage.setItem("location", this.state.location); //since location on state
      //is already a string we don't need to convert it to a string. I am setting the
      //Key to location and Value to this.state.location on the localStorage.
      //I need to read that value from local storage and perfect place is the
      //componentDidMount lifecycle method.
    }
  }
  //feature where the location will be remembered in local storage. How? Each time we
  //type a new char in the input I want to store the location into local storage.

  render() {
    return (
      <div className="app">
        <h1>Classy Weather</h1>
        <Input
          location={this.state.location}
          onChangeLocation={this.setLocation}
        />

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

//The instance of the Input class component is in our App JSX. The Input class component
//no longer has access to the state object as it is outside of the scope of this Input
//Component?? The input element depends on the state and needs to update state. The
//location state needs to stay in the App Component bc we need it in our fetchWeather
//method.
//We need child to parent communication in order to update state in App meaning the
//child Input is going to update the state in the parent App. The way we do that is
//pass down the state updating function into the child component Input. So we need to
//pass this code as a prop bc the state setter needs to update state in App and right
//now it's out of scope:onChange={(e) => this.setState({ location: e.target.value })}
//So we create an event handler in App and pass it to the Input class instance as a
//prop so the class Input will have access to it through the props object.
class Input extends React.Component {
  render() {
    return (
      <div>
        <input
          type="text"
          placeholder="Search for location..."
          value={this.props.location} //set the value of the input element to the state's location property
          onChange={this.props.onChangeLocation} //the onChange will set the location property on the state object. Tying the state object to the
          //input element using value prop. It's called with each event(keypress) that occurs
        />
      </div>
    );
  }
}

//Render the received weather data from the API. For that create brand new component and
//INCLUDE it in our App's JSX. Do so conditionally, only if there is actually some weather
//data do we want to display the weather component.
class Weather extends React.Component {
  //we can use componentWillUnmount() Lifecycle method here bc sometimes this component will
  //unmount and not exist unlike the App component. When there is no string in the
  //input tag there is no weather component.
  componentWillUnmount() {
    //very similar to returning a clean up func from a useEffect. Difference is this
    //one only runs after the component unmounts/disappears/destroyed. Doesn't run
    //between renders.
    console.log("Weather will unmount");
  }

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
