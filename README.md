# React Formy
A light, simple and fast higher order component to keep form state.

## Install it
`npm install react-formy --save`

## Use it

Simple usage

```js
import * as React from 'react';
import formy from 'react-formy';

@formy()
class MyFormComponent extends React.Component<Props> {
  render() {
    const { handleSubmit, field } = this.props;
    
    return (
      <form onSubmit={handleSubmit(values => console.log(values))}>
        <input type="text" {...field('user.name')} />
        <input type="email" {...field('user.email')} />
        <button type="submit">Submit</button>
      </form>
    );
  }
}

export default MyFormComponent;
```

### Add some validation
```js
import React from 'react';
import formy, { setErrorPropName } from 'react-formy';
import validate from 'validate.js';

setErrorPropName('errorMessage'); // "errorText" is the default error prop name

@formy({ validate: (values) => {
    return validate(values, {
      'user.phone': { presence: true, format: /^\(\d+2)\ \d{5}-\d{4}/ },
      'user.address': { presence: true }
    });
}})
class MyFormComponent extends React.Component {
  
  // ...
      
}
```

### Array fields
```js
import React from 'react';
import formy from 'react-formy';

@formy()
class MyFormComponent extends React.Component {
  render() {
    const { field } = this.props;
    const contacts = field('contacts').value || [];
    
    return (
      <form>
        {
          contacts.map((it, i) => (
            <div>
              <input type="text" {...field(`contacts[${i}].name`)} />
              <button type="button" onClick={ () => field('contacts').remove(i) }>Remove</button>
            </div>
          )) 
        }
        <button onClick={() => field('contacts').push({ name: 'Some Default Value' })}>Add contact</button>
      </form>
    )
  }
}
```

### Reset/Preset form
```js
const { resetForm } = this.props;

resetForm(); // Reset form
resetForm({ user: { name: 'John Doe' } }); // Reset form with user.name preset value
```

### Set a field value programmatically
```js
const { field } = this.props;

field('some.deep[1].field').value = 'newValue';
```

### Get form values at anytime
```js
const { formValues } = this.props;

console.log(formValues.get())
```

## License
MIT License