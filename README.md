# React Formy
A light, simple and fast way to keep form state.

> Don't use it inside React.StrictMode

## Install it
`npm install react-formy --save`

## Use it

Simple usage

```js
import * as React from 'react';
import useFormy from 'react-formy';

function MyFormComponent() {
    const { handleSubmit, field } = useFormy()
    
    return (
      <form onSubmit={handleSubmit(values => console.log(values))}>
        <input type="text" {...field('user.name')} />
        <input type="email" {...field('user.email')} />
        <button type="submit">Submit</button>
      </form>
    )
}

export default MyFormComponent
```

### Add some validation
```js
import React from 'react';
import useFormy, { setErrorPropName } from 'react-formy'
import validatejs from 'validate.js'

setErrorPropName('errorMessage') // "errorText" is the default error prop name

function MyFormComponent() {
  const { field, handleSubmit } = useFormy({
      validate: (values) => {
          return validatejs(values, {
            'user.phone': { presence: true, format: /^\(\d+2)\ \d{5}-\d{4}/ },
            'user.address': { presence: true }
          });
      } 
  })

  // ...
      
}
```

### Array fields
```js
import React from 'react';
import useFormy from 'react-formy'

function MyFormComponent() {
    const { field } = useFormy()
    const contacts = field('contacts').value || []
    
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
```

### Reset/Preset form
```js
const { resetForm } = useFormy()

resetForm(); // Reset form
resetForm({ user: { name: 'John Doe' } }) // Reset form with user.name preset value
```

### Set a field value programmatically
```js
const { setFormValues } = useFormy()

setFormValues({ some: { deep: { field: 'value' }} })
```

### Get form values at anytime
```js
const { getFormValues } = useFormy()

console.log(getFormValues())
```

## License
MIT License
