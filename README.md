# React Formy
A light, simple and fast higher order component to keep form state. Inspired by redux-form but with a much simpler usage.

## Install it
`npm install react-formy --save`

## Use it

Simple usage

```es6
import formy from 'react-formy';

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

export default formy(MyFormComponent);
```

### Add some validation
```es6
class MyFormComponent extends React.Component {

 static validateForm(form) {
    const errors = {};
  
    if (!form.user || form.user.phone)
      errors['user.phone'] = 'Phone is required';
    
    if (!form.address)
      errors['address'] = 'Address is required';
      
    // We could use some validation lib like validate.js
      
    return errors;
  }
  
  // ...
  
}
```

### Array fields
```es6
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
        <button onClick={() => field('contacts').push({ name: 'Some Default Value' })}>Add contact</button
      </form>
    )
  }
}
```

### Reset/Preset form
```es6
const { resetForm } = this.props;

resetForm(); // Reset form
resetForm({ user: { name: 'John Doe' } }); // Reset form with user.name preset value
```

### Set a field value programmatically
```es6
const { field } = this.props;

field('some.deep[1].field').value = 'newValue';
```
