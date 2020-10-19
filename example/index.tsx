import 'react-app-polyfill/ie11'
import { InputHTMLAttributes, useCallback } from 'react'
import * as React from 'react'
import * as ReactDOM from 'react-dom'
import { useFormy } from '../src'

const simpleEmailRegEx = /^[a-zA-Z0-9.!#$%&’*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/

interface ITextInputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: string | string[]
  type: 'text' | 'email'
}

const TextInput = ({ error, type = 'text', ...props }: ITextInputProps) => {
  return (
    <div>
      <input type={type} {...props} />
      {error && <div style={{ color: 'red' }}>{error}</div>}
    </div>
  )
}

// noinspection DuplicatedCode
const App = () => {
  const { field, handleSubmit } = useFormy({
    validate: values => {
      const validationResult = {} as any

      if (!values.email || !simpleEmailRegEx.test(values.email)) {
        validationResult.email = 'Email is not valid'
      }

      return validationResult
    },
  })

  const onSubmit = useCallback(v => console.log(v), [])

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)}>
        <TextInput {...field('name')} placeholder="name" />
        <TextInput {...field('email')} placeholder="email" />
        <button type="submit">Submit</button>
      </form>
    </>
  )
}

ReactDOM.render(<App />, document.getElementById('root'))
