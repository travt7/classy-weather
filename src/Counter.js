import React from "react";
//this is how to set up a new component using classes
//In React, components are the building blocks of a user interface. They encapsulate the
//logic and rendering of a part of the UI.
//extends indicates that Counter is a subclass of React.Component. Modern JS Class that
//extends the parent class of React.Component

//Class: A blueprint or a template that defines the structure and behavior of objects
//Instance/Object: A specific occurrence of a class, created using the class blueprint.
//An instance has its own set of data and can perform actions as defined by the class.
//Instantiate: The process of creating an instance (object) of a class, which can then
//be used in the program.

//The parent class gives us a couple of methods: render method is equivalent to the
//function body of a function component. Every component needs a render method that
//returns JSX.
class Counter extends React.Component {
  constructor(props) {
    super(props);
    //constructor is a special method that gets called each time a new object is
    //instantiated from this Counter class. We are defining a state property on the
    //new object. The current class/component will get the state we define here.
    //For each state variable(like count) we want, we need to create one property in this object.

    //Things you might typically find inside a React component class:
    //State: Data that the React Component can manage and update. It changes over time and triggers
    //re rendering of the component/class when updated. It's initialized in the
    //constructor.
    this.state = { count: 5 }; //assigning an object to this.state The word this is an object instantiated from the Counter
    //class. state is a property of the object instance from Counter class. Count is a property
    //on the state property and it is initialized to 5.
    this.handleDecrement = this.handleDecrement.bind(this);
    this.handleIncrement = this.handleIncrement.bind(this);
  }

  //define a method on the Counter Class. In these methods, this refers to the instance of the Counter class
  handleDecrement() {
    this.setState((curState) => {
      return { count: curState.count - 1 };
    });
  }

  handleIncrement() {
    this.setState((curState) => {
      return { count: curState.count + 1 };
    });
  }

  render() {
    const date = new Date("june 21 2027");
    date.setDate(date.getDate() + this.state.count);

    return (
      <div>
        <button onClick={this.handleDecrement}>-</button>
        <span>
          {date.toDateString()} [{this.state.count}]
        </span>
        <button onClick={this.handleIncrement}>+</button>
      </div>
    );
  }
}
//this will point to the instance variable of class Counter. Throughout the class, the this keyword consistently
//refers to the instance of the Counter class. It's a way to access and manipulate the properties and methods of
//the specific instance of the class that is being created when you instantiate it.

//you would typically see the instantiation in another part of your code, where you
//decide to use the Counter component

/* function App() {
  return (
    <div>
      <Counter /> {/* Instantiation of the Counter class/component */ //}
//</div>
//);
//} */

export default Counter;
