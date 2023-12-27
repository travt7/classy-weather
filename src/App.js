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
    //this constructor is a special method that gets called each time a new object is
    //instantiated from this Counter class. We are defining a state property on the
    //new object. The current class/component will get the state we define here.
    //For each state variable we want, we need to create one property in this object.
    this.state = { count: 5 };
  }

  render() {
    return (
      <div>
        <button>-</button>
        <span>{this.state.count}</span>
        <button>+</button>
      </div>
    );
  }
}
//this will point to the instance variable of class Counter

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
