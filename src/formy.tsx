import cloneDeep from 'lodash.clonedeep'
import {
  FormEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState
} from 'react'
import once from 'lodash/once'
import get from 'lodash/get'
import set from 'lodash/set'
import debounce from 'lodash/debounce'
import memoizee from 'memoizee'

type Nothing = undefined | null

type Formy<T = any> = {
  field: FormyField
  handleSubmit: (fn: (values: any) => void) => (e: FormEvent) => void
  resetForm: (newValues: Partial<T>) => void
  getFormValues: () => Partial<T>
  setFormValues: (newValues: any) => void
}

type FormyParams<T = any> = {
  validate?: FormyValidator<Partial<T>>;
  errorPropName?: string
}

export interface KeyValue<T = any> {
  [k: string]: T
}

export type FormyValidator<T = any> = (
  values: T
) => Promise<KeyValue<string> | Nothing> | KeyValue<string> | Nothing

export interface FieldOptions {
  defaultValue?: any
  onChange?: (newValue: any) => void
  onBlur?: (e: FocusEvent) => void
}

export type FormyField = (
  name: string,
  options?: FieldOptions
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

function useStateRef<T = any>(
  initialValue?: T
): [() => T, (newValue: T) => void] {
  const [value, setValue] = useState(initialValue)
  const valueRef = useRef(value)
  valueRef.current = value
  const getCurrentValue = useCallback(() => valueRef.current as T, [])

  return [
    getCurrentValue,
    v => {
      setValue(v)
      valueRef.current
    }
  ]
}

const getFieldOnChange = memoizee(
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

const getFieldOnBlur = memoizee(
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
  errorPropName = globalErrorPropName
}: FormyParams<T> = {}): Formy<T> {
  const validateRef = useRef(validate)
  const [getValues, setValues] = useStateRef({})
  const [defaultValues, setInitialValues] = useState({} as any)
  const [touched, setTouched] = useState({} as any)
  const [submitted, setSubmitted] = useState(false)
  const [validationResult] = useState({})
  const [getValidationResult, setValidationResult] = useStateRef({})
  const values = getValues()
  const getFieldValue = useCallback(
    fieldPath => get(getValues(), fieldPath),
    []
  )

  const runValidationRef = useRef(
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
    }, 300)
  )

  useEffect(() => {
    const _validate = runValidationRef.current

    if (typeof _validate === 'function') {
      (_validate as FormyValidator)(values)
    }
  }, [values])

  const onFieldChange = useMemo(
    () => (fieldPath: string, e: any) =>
      setValues(
        set({ ...getValues() }, fieldPath, e && e.target ? e.target.value : e)
      ),
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
        }
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
        }
      })

      Object.defineProperty(fieldProps, 'unshift', {
        value: (v: any) => {
          onFieldChange(fieldPath, [
            v,
            ...((getFieldValue(fieldPath) || []) as any[])
          ])
        }
      })

      Object.defineProperty(fieldProps, 'push', {
        value: (v: any) => {
          onFieldChange(fieldPath, [
            ...((getFieldValue(fieldPath) || []) as any[]),
            v
          ])
        }
      })

      Object.defineProperty(fieldProps, 'onChange', {
        enumerable: true,
        value: getFieldOnChange(fieldPath, touched, setTouched, onFieldChange,
          onChange)
      })

      Object.defineProperty(fieldProps, 'onBlur', {
        enumerable: true,
        value: getFieldOnBlur(fieldPath, touched, setTouched, onBlur)
      })

      return fieldProps
    },
    [validationResult, defaultValues, errorPropName, touched, submitted]
  )

  const handleSubmit = useCallback(
    onSubmit => (e: any) => {
      e.preventDefault()

      setSubmitted(true)

      const validationResult = getValidationResult()

      if (validationResult && Object.keys(validationResult).length) {
        return
      }

      onSubmit?.(getValues())
    },
    []
  )

  const resetForm = useCallback((newValues = {}) => {
    setValues(newValues)
    setTouched({})
    setSubmitted(false)
  }, [])

  const setFormValues = useCallback(newValues => {
    setValues({ ...getValues(), ...newValues })
  }, [])

  const getFormValues = useCallback(
    once(() => {
      return cloneDeep(getValues()) as T
    }),
    []
  )

  return {
    field,
    handleSubmit,
    resetForm,
    getFormValues,
    setFormValues
  }
}

export default useFormy
