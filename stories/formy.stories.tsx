import { Meta } from '@storybook/react'
import React, { InputHTMLAttributes, useCallback } from 'react'
import { useFormy } from '../src'

const meta: Meta = {
  title: 'Formy',
}

export default meta

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

const simpleEmailRegEx = /^[a-zA-Z0-9.!#$%&’*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/

// noinspection DuplicatedCode
export const Simple = () => {
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

Simple.args = {}
