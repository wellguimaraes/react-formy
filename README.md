# React Formy
A light, simple and fast Higher Order Component to keep form state, inspired by redux-form.

## Install it
`npm install react-formy --save`

## Use it

Simple usage

```es6
import formy from 'react-formy';

class MyFormComponent extends React.Component {
  onSubmit(values) {
    console.log(values);
  }

  render() {
    const { handleSubmit, field } = this.props;
    
    return (
      <form onSubmit={handleSubmit(this.onSubmit.bind(this))}>
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
  
    if (!form.user.name)
      errors['user.name'] = 'User name is required';
    
    if (!form.user.email)
      errors['user.email'] = 'User email is required';
      
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
    const { arrayField, form } = this.props;
    
    return (
      <form>
        {
          form.contacts.map((it, i) => (
            <div>
              <input type="text" {...field(`contacts[${i}].name`)} />
              <input type="text" {...field('contacts[].phone', i)} /> { /* You can use indexes this way too */ }
              <button type="button" onClick={() => arrayField('contacts').remove(i)}>
                Remove
              </button>
            </div>
          )) 
        }
        <button onClick={() => arrayField('contacts').push({name: 'Some Default Value'})}>
          Add contact
        </button
      </form>
    )
  }
}
```
