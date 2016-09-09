# React Formy
A light, simple and fast Higher Order Component to keep form state, inspired by redux-form.

## Install it
`npm install react-formy --save`

## Use it

```es6
import formy from 'react-formy';

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

  onSubmit(values) {
    console.log(values);
  }

  render() {
    const { handleSubmit, field, arrayField, form } = this.props;
    
    return (
      <div>
        <form onSubmit={handleSubmit(this.onSubmit.bind(this))}>
          <input type="text" {...field('user.name')} />
          <input type="email" {...field('user.email')} />
          { 
            form.phones.map((it, i) => {
              <div>
                <input type="text" {...field(`phones[${i}]`)} />
                {/* <input type="text" {...field('phones[]', i)} /> */}
                <button type="button" onClick={() => arrayField('phones').remove(i)}></button>
              </div>
            }) 
          }
          <button type="button" onClick={() => arrayField('phones').push()}>Add phone</button>
          <hr/>
          <button type="submit">Submit</button>
        </form>
      </div>
    );
  }
}

export default formy(MyFormComponent);
```
