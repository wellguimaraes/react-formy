import cloneDeep from 'lodash.clonedeep'
import set from 'lodash.set'
import get from 'lodash.get'
import { FormEvent, useCallback, useEffect, useRef, useState } from 'react'
import once from 'lodash/once'

export interface KeyValue {
  [k: string]: string
}

type Nothing = undefined | null

export type FormyValidator = (
  values: KeyValue,
  submitted: boolean
) => Promise<KeyValue | Nothing> | KeyValue | Nothing
export type inlineValidator = (
  value: any,
  values: any,
) => Promise<string | Nothing> | string | Nothing

export interface FieldOptions {
  defaultValue?: any
  onChange?: (newValue: any) => void
  onBlur?: (e: FocusEvent) => void
  onFocus?: (e: FocusEvent) => void
  validate?: inlineValidator
}

export type FormyField = (
  name: string,
  options?: FieldOptions,
) => {
  onChange: any
  onBlur: any
  name: any
  value: any
  [errorKey: string]: string
} & any

let globalErrorPropName = 'errorText'

export function setErrorPropName(name: string) {
  globalErrorPropName = name
}

export function useFormy<T = any>({ validate, errorPropName = globalErrorPropName }: { validate?: FormyValidator, errorPropName?: string } = {}): { field: FormyField, handleSubmit: (fn: (values: any) => void) => (e: FormEvent) => void, resetForm: (newValues: KeyValue) => void, getFormValues: () => T, setFormValues: (newValues: any) => void } {
  const [values, setValues] = useState({})
  const [defaultValues, setInitialValues] = useState({} as any)
  const [touched, setTouched] = useState({} as any)
  const [submitted, setSubmitted] = useState(false)
  const [validationResult, setValidationResult] = useState({})
  const validateRef = useRef(validate)
  const valuesRef = useRef({})
  valuesRef.current = values

  useEffect(() => {
    (async () => {
      const _validate = validateRef.current
      const _validationResult = typeof _validate === 'function' &&
        await _validate(values, submitted)
      setValidationResult(_validationResult || {})
    })()
  }, [values, submitted])

  const field = useCallback(
    (fieldPath, { onChange, onBlur, defaultValue } = {}) => {
      const value = get(values, fieldPath)
      const error = get(validationResult, fieldPath)
      const onFieldChange = (e: any) => setValues(
        set({ ...values }, fieldPath, e && e.target ? e.target.value : e))

      if (defaultValue !== undefined && defaultValues[fieldPath] !==
        defaultValue) {
        setInitialValues({ ...defaultValues, [fieldPath]: defaultValue })
        if (!touched[fieldPath])
          onFieldChange(defaultValue)
      }

      function touchField() {
        if (!touched[fieldPath])
          setTouched({ ...touched, [fieldPath]: true })
      }

      // noinspection JSUnusedGlobalSymbols
      return {
        remove(index: number) {
          if (Array.isArray(value)) return

          onFieldChange((value as any[]).filter((_, i) => i !== index))
        },
        unshift(v: any) {
          onFieldChange([v, ...((value || []) as any[])])
        },
        push(v: any) {
          onFieldChange([...((value || []) as any[]), v])
        },
        get value() {
          return value || ''
        },
        set value(newValue) {
          setTimeout(() => onFieldChange(newValue))
        },
        onChange: (e: any) => {
          touchField()
          onFieldChange(e)
          typeof onChange === 'function' && onChange(e)
        },
        onBlur: (e: any) => {
          touchField()
          typeof onBlur === 'function' && onBlur(e)
        },
        get [errorPropName]() {
          return (submitted && error) || (touched[fieldPath] && error)
        },
      }
    }, [
      values,
      validationResult,
      defaultValues,
      errorPropName,
      touched,
      submitted
    ])

  const handleSubmit = useCallback((onSubmit) => (e: any) => {
    e.preventDefault()
    setSubmitted(true)

    if (validationResult && Object.keys(validationResult).length) {
      return
    }

    typeof onSubmit === 'function' && onSubmit(values)
  }, [validationResult, values])

  const resetForm = useCallback((newValues = {}) => {
    setValues(newValues)
    setTouched({})
    setSubmitted(false)
  }, [])

  const setFormValues = useCallback(newValues => {
    setValues({ ...valuesRef.current, ...newValues })
  }, [])

  const getFormValues = useCallback(once(() => {
    return cloneDeep(values) as T
  }), [values])

  return {
    field,
    handleSubmit,
    resetForm,
    getFormValues,
    setFormValues,
  }
}

export default useFormy
