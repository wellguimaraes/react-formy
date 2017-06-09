# React Formy
A light, simple and fast higher order component to keep form state.

## Install it
`npm install react-formy --save`

## Use it

Simple usage

```js
import React from 'react';
import formy from 'react-formy';

@formy()
class MyFormComponent extends React.Component {
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

function validateForm(values) {
  return validate(values, {
    'user.phone': { presence: true, format: /^\(\d+2)\ \d{5}-\d{4}/ },
    'user.address': { presence: true }
  });
}

@formy(validateForm)
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
              <input type="text" {...field('contacts[].phone', i)} /> { /* You can use indexes this way too */ }
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

## License
MIT License

Copyright (c) 2016 Wellington Guimaraes

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
