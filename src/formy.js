import React, { Component } from 'react';
import at                   from 'lodash.at';
import set                  from 'lodash.set';
import cloneDeep            from 'lodash.clonedeep';
import formatFieldName      from './formatFieldName';

export default function(WrappedComponent, options = { errorPropName: 'data-error' }) {

  const validateForm = WrappedComponent.validateForm;

  return class extends Component {
    constructor(props) {
      super(props);

      this.state = { form: {}, errors: {}, touched: {} };

      this.field        = this.field.bind(this);
      this.handleSubmit = this.handleSubmit.bind(this);
      this.validate     = this.validate.bind(this);
      this.resetForm    = this.resetForm.bind(this);
      this.handleChange = this.handleChange.bind(this);
      this.handleBlur   = this.handleBlur.bind(this);
      this.arrayUnshift = this.arrayUnshift.bind(this);
      this.arrayPush    = this.arrayPush.bind(this);
      this.arrayRemove  = this.arrayRemove.bind(this);
    }

    arrayUnshift(name) {
      return (value) => {
        const newFormValues = { ...this.state.form };
        const fieldArray    = at(newFormValues, name)[ 0 ] || [];

        set(newFormValues, name, [ value, ...fieldArray ]);

        this.setState({ form: newFormValues });
      };
    }

    arrayPush(name) {
      return (value) => {
        const newFormValues = { ...this.state.form };
        const fieldArray    = at(newFormValues, name)[ 0 ] || [];

        set(newFormValues, name, [ ...fieldArray, value ]);

        this.setState({ form: newFormValues });
      };
    }

    arrayRemove(name) {
      return (index) => {
        const form       = this.state.form;
        const fieldArray = at(form, name)[ 0 ];

        if (fieldArray && fieldArray.length > index) {
          fieldArray.splice(index, 1);
          this.setState({ form: { ...form } });
        }
      };
    }

    handleChange(name) {
      return (e) => {
        const newValue      = e.nativeEvent ? e.nativeEvent.target.value : e;
        const newFormValues = set({ ...this.state.form }, name, newValue);

        this.setState({ form: newFormValues });
      };
    }

    handleBlur(name) {
      return () => {
        setTimeout(() => this.validate(), 0);
        setTimeout(() => this.setState({ touched: { ...this.state.touched, [name]: true } }), 100);
      }
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

    handleSubmit(handler) {
      return (e) => {
        e.preventDefault();
        this.setState({ submitted: true });
        this.validate().then(() => handler && handler(cloneDeep(this.state.form)))
      };
    }

    resetForm(newValues) {
      this.setState({
        form     : { ...(newValues || {}) },
        touched  : {},
        submitted: false,
        errors   : {}
      });
    }

    field(name, defaultValue = '') {
      name = formatFieldName(name, arguments);

      const errorProp = options.errorPropName;
      const field     = {
        name       : name,
        onBlur     : this.handleBlur(name),
        onChange   : this.handleChange(name),
        [errorProp]: this.hasTouched(name) && this.state.errors[ name ]
      };

      Object.defineProperty(field, 'value', {
        enumerable: true,
        set       : this.handleChange(name),
        get       : () => {
          const value = at(this.state.form, name)[ 0 ];
          return value == undefined || value == null
            ? defaultValue
            : value;
        }
      });

      const fieldValue = at(this.state.form, name)[ 0 ];

      if (fieldValue == undefined || fieldValue == null || Array.isArray(fieldValue)) {
        Object.defineProperty(field, 'unshift', { value: this.arrayUnshift(name) });
        Object.defineProperty(field, 'push', { value: this.arrayPush(name) });
        Object.defineProperty(field, 'remove', { value: this.arrayRemove(name) });
      }

      return field;
    }

    render() {
      const props = {
        ...this.props,
        handleSubmit: this.handleSubmit,
        resetForm   : this.resetForm,
        field       : this.field
      };

      return <WrappedComponent {...props} />
    }

  }

}
