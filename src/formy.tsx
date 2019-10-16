import cloneDeep from 'lodash.clonedeep'
import set from 'lodash.set'
import get from 'lodash.get'
import { FormEvent, useCallback, useEffect, useRef, useState } from 'react'
import once from 'lodash/once'

let globalErrorPropName = 'errorText'

type Nothing = undefined | null

export interface KeyValue {
  [k: string]: string
}

export type FormyValidator = (values: KeyValue) => Promise<KeyValue | Nothing> | KeyValue | Nothing

export interface FieldOptions {
  defaultValue?: any
  onChange?: (newValue: any) => void
  onBlur?: (e: FocusEvent) => void
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

export function setErrorPropName(name: string) {
  globalErrorPropName = name
}

function useStateRef<T = any>(initialValue?: T): [() => T, (newValue: T) => void] {
  const [value, setValue] = useState(initialValue)
  const valueRef = useRef(value)
  valueRef.current = value
  const getCurrentValue = useCallback(() => valueRef.current as T, [])

  return [
    getCurrentValue,
    setValue,
  ]
}

export function useFormy<T = any>({ validate, errorPropName = globalErrorPropName }: { validate?: FormyValidator, errorPropName?: string } = {}): { field: FormyField, handleSubmit: (fn: (values: any) => void) => (e: FormEvent) => void, resetForm: (newValues: KeyValue) => void, getFormValues: () => T, setFormValues: (newValues: any) => void } {
  const validateRef = useRef(validate)
  const [getValues, setValues] = useStateRef({})
  const [defaultValues, setInitialValues] = useState({} as any)
  const [touched, setTouched] = useState({} as any)
  const [submitted, setSubmitted] = useState(false)
  const [validationResult] = useState({})
  const [getValidationResult, setValidationResult] = useStateRef({})
  const getFieldValue = useCallback((fieldPath) => get(getValues(), fieldPath),
    [])
  const values = getValues()

  useEffect(() => {
    (async () => {
      const _validate = validateRef.current
      const _validationResult = typeof _validate === 'function' &&
        await _validate(values)
      setValidationResult(_validationResult || {})
    })()
  }, [values])

  const field = useCallback(
    (fieldPath, { onChange, onBlur, defaultValue } = {}) => {
      const error = get(getValidationResult(), fieldPath)
      const onFieldChange = (e: any) => setValues(
        set({ ...getValues() }, fieldPath, e && e.target ? e.target.value : e))

      if (defaultValue !== undefined && defaultValues[fieldPath] !==
        defaultValue) {
        setInitialValues({ ...defaultValues, [fieldPath]: defaultValue })
        if (!touched[fieldPath])
          onFieldChange(defaultValue)
      }

      const touchField = () => {
        if (!touched[fieldPath])
          setTouched({ ...touched, [fieldPath]: true })
      }

      // noinspection JSUnusedGlobalSymbols
      return {
        remove(index: number) {
          if (Array.isArray(getFieldValue(fieldPath))) return

          onFieldChange(
            (getFieldValue(fieldPath) as any[]).filter((_, i) => i !== index))
        },
        unshift(v: any) {
          onFieldChange([v, ...((getFieldValue(fieldPath) || []) as any[])])
        },
        push(v: any) {
          onFieldChange([...((getFieldValue(fieldPath) || []) as any[]), v])
        },
        get value() {
          return getFieldValue(fieldPath) || ''
        },
        set value(newValue) {
          setTimeout(() => onFieldChange(newValue))
        },
        onChange: (e: any) => {
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
      validationResult,
      defaultValues,
      errorPropName,
      touched,
      submitted,
    ])

  const handleSubmit = useCallback((onSubmit) => (e: any) => {
    e.preventDefault()

    setSubmitted(true)

    const validationResult = getValidationResult()

    if (validationResult && Object.keys(validationResult).length) {
      return
    }

    typeof onSubmit === 'function' && onSubmit(getValues())
  }, [])

  const resetForm = useCallback((newValues = {}) => {
    setValues(newValues)
    setTouched({})
    setSubmitted(false)
  }, [])

  const setFormValues = useCallback(newValues => {
    setValues({ ...getValues(), ...newValues })
  }, [])

  const getFormValues = useCallback(once(() => {
    return cloneDeep(getValues()) as T
  }), [])

  return {
    field,
    handleSubmit,
    resetForm,
    getFormValues,
    setFormValues,
  }
}

export default useFormy
