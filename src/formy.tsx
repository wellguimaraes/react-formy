import cloneDeep from 'lodash/cloneDeep'
import debounce from 'lodash/debounce'
import get from 'lodash/get'
import set from 'lodash/set'
import memoizee from 'memoizee'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  FieldOptions,
  Formy,
  FormyField,
  FormyParams,
  FormyValidator,
} from './types'

export { FormyValidator, Formy, FieldOptions, FormyField }

let globalErrorPropName = 'errorText'

export function setErrorPropName(name: string) {
  globalErrorPropName = name
}

function useStateRef<T = any>(
  initialValue?: T
): [() => T, (newValue: T) => void] {
  const [value, setValue] = useState(initialValue)
  const valueRef = useRef(value)
  valueRef.current = value
  const getCurrentValue = useCallback(() => valueRef.current as T, [])
  const setCurrentValue = useCallback((v) => {
    setValue(v)
    valueRef.current = v
  }, [])

  return [getCurrentValue, setCurrentValue]
}

const getFieldChangeListener = memoizee(
  (
    fieldPath: string,
    touched: { [key: string]: boolean },
    setTouched: (value: unknown) => void,
    onFieldChange: (fieldPath: string, e: any) => void,
    onChange: (e: any) => void
  ) => (e: any) => {
    if (!touched[fieldPath]) {
      setTouched({ ...touched, [fieldPath]: true })
    }
    onFieldChange(fieldPath, e)
    typeof onChange === 'function' && onChange(e)
  },
  { length: 1 }
)

const getFieldBlurListener = memoizee(
  (
    fieldPath: string,
    touched: { [key: string]: boolean },
    setTouched: (value: unknown) => void,
    onBlur: (e: any) => any
  ) => (e: any) => {
    if (!touched[fieldPath]) {
      setTouched({ ...touched, [fieldPath]: true })
    }
    typeof onBlur === 'function' && onBlur(e)
  },
  { length: 1 }
)

export function useFormy<T = any>({
  validate,
  errorPropName = globalErrorPropName,
}: FormyParams<T> = {}): Formy<T> {
  const validateRef = useRef(validate)
  const [getValues, setValues] = useStateRef({})
  const [defaultValues, setInitialValues] = useState({} as any)
  const [touched, setTouched] = useState({} as any)
  const [isDirty, setDirty] = useState(false)
  const [isSubmitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [validationResult] = useState({})
  const [getValidationResult, setValidationResult] = useStateRef({})
  const values = getValues()

  const getFieldValue = useCallback(
    (fieldPath) => get(getValues(), fieldPath),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  )

  const runValidation = useCallback(
    debounce(async (values: Partial<T>) => {
      const _validate = validateRef.current
      const _validationResult =
        (typeof _validate === 'function' && (await _validate(values))) || {}
      const _currentValidationResult = getValidationResult() || {}

      if (
        JSON.stringify(_currentValidationResult) !==
        JSON.stringify(_validationResult)
      ) {
        setValidationResult(_validationResult || {})
      }
    }, 300),
    []
  )

  useEffect(() => {
    if (Object.keys(touched).length) runValidation?.(values)
  }, [values])

  const onFieldChange = useMemo(
    () => (fieldPath: string, e: any) => {
      setValues(
        set({ ...getValues() }, fieldPath, e && e.target ? e.target.value : e)
      )
      setDirty(true)
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  )

  const field = useCallback(
    (fieldPath, { onChange, onBlur, defaultValue } = {}) => {
      if (
        defaultValue !== undefined &&
        defaultValues[fieldPath] !== defaultValue
      ) {
        setInitialValues({ ...defaultValues, [fieldPath]: defaultValue })
        if (!touched[fieldPath]) {
          onFieldChange(fieldPath, defaultValue)
        }
      }

      // noinspection JSUnusedGlobalSymbols
      const fieldProps = {
        set value(newValue) {
          setTimeout(() => onFieldChange(fieldPath, newValue))
        },
        get value() {
          const currentValue = getFieldValue(fieldPath)
          return currentValue === undefined ? '' : currentValue
        },
        get [errorPropName]() {
          const error = get(getValidationResult(), fieldPath)
          return (submitted && error) || (touched[fieldPath] && error)
        },
      }

      Object.defineProperty(fieldProps, 'remove', {
        value: (index: number) => {
          if (Array.isArray(getFieldValue(fieldPath))) {
            return
          }

          onFieldChange(
            fieldPath,
            (getFieldValue(fieldPath) as any[]).filter((_, i) => i !== index)
          )
        },
      })

      Object.defineProperty(fieldProps, 'unshift', {
        value: (v: any) => {
          onFieldChange(fieldPath, [
            v,
            ...((getFieldValue(fieldPath) || []) as any[]),
          ])
        },
      })

      Object.defineProperty(fieldProps, 'push', {
        value: (v: any) => {
          onFieldChange(fieldPath, [
            ...((getFieldValue(fieldPath) || []) as any[]),
            v,
          ])
        },
      })

      Object.defineProperty(fieldProps, 'onChange', {
        enumerable: true,
        value: getFieldChangeListener(
          fieldPath,
          touched,
          setTouched,
          onFieldChange,
          onChange
        ),
      })

      Object.defineProperty(fieldProps, 'onBlur', {
        enumerable: true,
        value: getFieldBlurListener(fieldPath, touched, setTouched, onBlur),
      })

      return fieldProps
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [validationResult, defaultValues, errorPropName, touched, submitted]
  )

  const handleSubmit = useCallback(
    (onSubmit) => (e: any) => {
      e.preventDefault()

      setSubmitted(true)

      const validationResult = getValidationResult()

      if (validationResult && Object.keys(validationResult).length) {
        return
      }

      setSubmitting(true)

      Promise.resolve(onSubmit?.(getValues())).then(
        () => setSubmitting(false),
        () => setSubmitting(false)
      )
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  )

  const resetForm = useCallback(
    (newValues = {}) => {
      setValues(newValues)
      setTouched({})
      setSubmitted(false)
      setDirty(false)
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  )

  const setFormValues = useCallback(
    (newValues) => setValues({ ...getValues(), ...newValues }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  )

  const getFormValues = useCallback(
    () => cloneDeep(getValues()) as T,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  )

  return {
    field,
    handleSubmit,
    resetForm,
    isDirty,
    isSubmitting,
    getFormValues,
    setFormValues,
  }
}

export default useFormy
