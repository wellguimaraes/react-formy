import React, { Component } from 'react';
import at                   from 'lodash.at';
import set                  from 'lodash.set';
import formatFieldName      from './formatFieldName';

export default function(WrappedComponent) {

  const validateForm = WrappedComponent.validateForm;

  return class extends Component {
    constructor(props) {
      super(props);

      this.state = { form: {}, errors: {}, touched: {} };

      this.field        = this.field.bind(this);
      this.arrayField   = this.arrayField.bind(this);
      this.handleSubmit = this.handleSubmit.bind(this);
      this.validate     = this.validate.bind(this);
      this.resetForm    = this.resetForm.bind(this);
      this.handleChange = this.handleChange.bind(this);
    }

    handleChange(name) {
      return (e) => {
        const newValue      = e.nativeEvent ? e.nativeEvent.target.value : e;
        const newFormValues = set({ ...this.state.form }, name, newValue);

        this.setState({
          form   : newFormValues,
          touched: { ...this.state.touched, [name]: true }
        });
      };
    }

    handleFocus(name) {
      return () => {
        this.setState({
          touched: { ...this.state.touched, [name]: true }
        });
      }
    }

    handleSubmit(handler) {
      return (e) => {
        e.preventDefault();
        this.setState({ submitted: true });
        this.validate().then(() => handler && handler(this.state.form))
      };
    }

    hasTouched(fieldName) {
      return this.state.submitted || this.state.touched.hasOwnProperty(fieldName);
    }

    validate() {
      return new Promise((resolve) => {
        if (!validateForm) return resolve();

        let isValid = validateForm(this.state.form);

        if (!(isValid instanceof Promise))
          isValid = Promise.resolve(isValid);

        isValid.then((result) => {
          if (!result || !Object.keys(result).length) {
            this.setState({ errors: {} });
            return resolve();
          }

          this.setState({ errors: result });
        });
      });
    }

    resetForm(newValues) {
      this.setState({
        form     : { ...(newValues || {}) },
        touched  : {},
        submitted: false,
        errors   : {}
      });
    }

    field(name) {
      name = formatFieldName(name, arguments);

      return {
        name    : name,
        value   : at(this.state.form, name)[ 0 ],
        error   : this.hasTouched(name) && this.state.errors[ name ],
        onFocus : this.handleFocus(name),
        onBlur  : this.validate,
        onChange: this.handleChange(name)
      };
    }

    arrayField(name) {
      name = formatFieldName(name, arguments);

      return {

        unshift: (value) => {
          const newFormValues = { ...this.state.form };
          const fieldArray    = at(newFormValues, name)[ 0 ] || [];

          set(newFormValues, name, [ value, ...fieldArray ]);

          this.setState({ form: newFormValues });
        },

        push: (value) => {
          const newFormValues = { ...this.state.form };
          const fieldArray    = at(newFormValues, name)[ 0 ] || [];

          set(newFormValues, name, [ ...fieldArray, value ]);

          this.setState({ form: newFormValues });
        },

        remove: (index) => {
          const form       = this.state.form;
          const fieldArray = at(form, name)[ 0 ];

          if (fieldArray && fieldArray.length > index) {
            fieldArray.splice(index, 1);
            this.setState({ form: { ...form } });
          }
        }

      };
    }

    render() {

      const props = {
        ...this.props,
        handleSubmit: this.handleSubmit,
        field       : this.field,
        arrayField  : this.arrayField,
        resetForm   : this.resetForm,
        form        : this.state.form
      };

      return <WrappedComponent {...props}/>

    }

  }

}
