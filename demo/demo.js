import React, { Component, PropTypes } from 'react';
import ReactDOM from 'react-dom';
import formy from '../src/formy';
import at from 'lodash.at';

class Demo extends Component {
  static validateForm(form) {
    const errors = {};

    if (!at(form, 'user.name')[ 0 ])
      errors[ 'user.name' ] = 'User name is required';

    return errors;
  }

  render() {
    const { handleSubmit, field, resetForm } = this.props;

    const vehicles = field('vehicles').value || [];

    return (
      <form onSubmit={handleSubmit((values) => console.log(values))}>

        <div>
          <input type="text" placeholder="name" {...field('user.name')}/>
          <button type="button" onClick={() => field('user.name').value = 'Well'}>Set name</button>
        </div>

        <div>
          <input type="email" placeholder="email" {...field('user.email')}/>
        </div>

        {
          vehicles.map((it, i) => (
            <div key={i}>
              <input type="text" placeholder="type" {...field(`vehicles[${i}].type`)}/>
              <input type="text" placeholder="plate" {...field('vehicles[].plate', i)}/>
              <button type="button" onClick={() => field('vehicles').remove(i)}>Remove</button>
            </div>
          ))
        }

        <button type="button" onClick={() => field('vehicles').push({ type: 'car' })}>Add vehicle</button>

        <div>
          <button type="button" onClick={() => resetForm({ user: { name: 'Well' } })}>Reset form</button>
          <button>Submit</button>
        </div>

      </form>
    );
  }
}

const ConnectedDemo = formy(Demo);

ReactDOM.render(<ConnectedDemo/>, document.querySelector('#main'));
