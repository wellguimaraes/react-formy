import at from 'lodash.at'
import cloneDeep from 'lodash.clonedeep'
import set from 'lodash.set'
import * as React from 'react'
import { FormEvent } from 'react'

export interface KeyValue {
  [k: string]: string
}

export type FormyValidator = (values: KeyValue) => Promise<KeyValue | undefined>
export type inlineValidator = (value: any, values: any) => Promise<string | null | undefined> | string | null | undefined

export interface FieldOptions {
  defaultValue?: any,
  onChange?: (newValue: any) => void,
  onBlur?: () => void,
  validate?: inlineValidator
}

export interface FormyComponent {
  field?: (name: string, options?: FieldOptions) => {
    onChange: any
    onBlur: any
    name: any
    value: any
    [errorKey: string]: string
  } & any,
  handleSubmit?: (fn: (values: any) => void) => (e: FormEvent) => void,
  resetForm: (values: any) => void
}

export interface FormyState {
  form: KeyValue,
  errors: KeyValue,
  touched: KeyValue,
  submitted: boolean,
}

export interface FormyOptions {
  validateForm?: FormyValidator,
  errorPropName?: string
}

let globalErrorPropName = 'errorText'

export function setErrorPropName(name: string) {
  globalErrorPropName = name
}

export const formy = <T extends object>({validateForm = async () => ({}), errorPropName }: FormyOptions = {}) => (WrappedComponent: React.ComponentType<T & FormyComponent>): React.ComponentType<T & FormyComponent> => {
  return class extends React.Component<T & FormyComponent, FormyState> {
    state = {
      form: {},
      errors: {},
      touched: {},
      submitted: false,
    }

    inlineValidators = {} as any

    arrayUnshift = (name: string) => {
      return (value: string) => {
        const newFormValues = { ...this.state.form }
        const fieldArray = (at(newFormValues, name)[0] || []) as Array<any>

        set(newFormValues, name, [value, ...fieldArray])

        this.setState({ form: newFormValues })
      }
    }

    arrayPush = (name: string) => {
      return (value: any) => {
        const newFormValues = { ...this.state.form }
        const fieldArray = (at(newFormValues, name)[0] || []) as Array<any>

        set(newFormValues, name, [...fieldArray, value])

        this.setState({ form: newFormValues })
      }
    }

    arrayRemove = (name: string) => {
      return (index: number) => {
        const form = this.state.form
        const fieldArray = (at(form, name)[0]) as Array<any>

        if (fieldArray && fieldArray.length > index) {
          fieldArray.splice(index, 1)
          this.setState({ form: { ...form } })
        }
      }
    }

    handleChange = (name: string, afterChange?: (newValue: any) => void) => {
      return (e: any) => {
        const newValue = e.target ? e.target.value : e
        const newFormValues = set({ ...this.state.form }, name, newValue)

        this.setState({ form: newFormValues }, () => {
          afterChange && afterChange(newValue)
        })
      }
    }

    handleBlur = (
      name: string,
      afterBlur?: () => void) => {
      return async () => {
        await this.validate()

        this.setState({
          touched: {
            ...this.state.touched,
            [name]: true,
          },
        }, () => afterBlur && afterBlur())
      }
    }

    hasTouched = (name: string) => {
      return this.state.submitted ||
        this.state.touched.hasOwnProperty(name)
    }

    validate = async () => {
      if (!validateForm) {
        return true
      }

      const customValidationErrors = Object.keys(this.inlineValidators)
        .map(key => {
          const value = at(this.state.form, key)[0]
          const inlineValidator = (this.inlineValidators as any)[key]
          const validationResult = inlineValidator(value, this.state.form)

          return {
            key,
            validationResult,
          }
        })
        .filter(it => it.validationResult)
        .reduce((prev, curr) => {
          prev[curr.key] = curr.validationResult
          return prev
        }, {} as any)

      const result = {
        ...await validateForm(this.state.form),
        ...customValidationErrors,
      }

      if (!result || !Object.keys(result).length) {
        this.setState({ errors: {} })
        return true
      } else {
        this.setState({ errors: result })
        return false
      }
    }

    handleSubmit = (handler: (values: any) => void) => {
      return (e: FormEvent) => {
        e.preventDefault()
        this.setState({ submitted: true }, async () => {
          if (await this.validate() && handler)
            handler(cloneDeep(this.state.form))
        })
      }
    }

    resetForm = (newValues: any) => {
      this.setState({
        form: { ...(newValues || {}) },
        touched: {},
        submitted: false,
        errors: {},
      })
    }

    field = (name: string, fieldOptions: FieldOptions = {}) => {
      const { defaultValue = '', onChange, onBlur, validate } = fieldOptions
      const errorProp = errorPropName || globalErrorPropName

      if (validate) {
        this.inlineValidators[name] = validate
      }

      const field = {
        name: name,
        onBlur: this.handleBlur(name, onBlur),
        onChange: this.handleChange(name, onChange),
        [errorProp]: this.hasTouched(name) && (this.state.errors as any)[name],
      }

      Object.defineProperty(field, 'value', {
        enumerable: true,
        set: this.handleChange(name),
        get: () => {
          const value = at(this.state.form, name)[0]
          return value === undefined || value === null
            ? defaultValue
            : value
        },
      })

      const fieldValue = at(this.state.form, name)[0]

      if (fieldValue === undefined || fieldValue === null ||
        Array.isArray(fieldValue)) {

        Object.defineProperty(field, 'unshift', {
          value: this.arrayUnshift(name),
        })

        Object.defineProperty(field, 'push', {
          value: this.arrayPush(name),
        })

        Object.defineProperty(field, 'remove', {
          value: this.arrayRemove(name),
        })
      }

      return field
    }

    render() {
      const props = {
        ...this.props,
        handleSubmit: this.handleSubmit,
        resetForm: this.resetForm,
        field: this.field,
      }

      return (
        <WrappedComponent {...props}/>
      )
    }

  }
}

export default formy