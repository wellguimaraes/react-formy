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

export interface KeyValue {
  [k: string]: string
}

export type FormyValidator = (
  values: KeyValue
) => Promise<KeyValue | Nothing> | KeyValue | Nothing

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
  let [value, setValue] = useState(initialValue)
  let valueRef = useRef(value)
  valueRef.current = value
  let getCurrentValue = useCallback(() => valueRef.current as T, [])

  return [
    getCurrentValue,
    v => {
      setValue(v)
      valueRef.current
    }
  ]
}

let getFieldOnChange = memoizee(
  (
    fieldPath: string,
    touched: { [key: string]: boolean },
    setTouched: (value: unknown) => void,
    onFieldChange: (fieldPath: string, e: any) => void,
    onChange: (e: any) => void,
  ) => (e: any) => {
    if (!touched[fieldPath]) setTouched({ ...touched, [fieldPath]: true })
    onFieldChange(fieldPath, e)
    typeof onChange === 'function' && onChange(e)
  },
  { length: 1 }
)

let getFieldOnBlur = memoizee(
  (
    fieldPath: string,
    touched: { [key: string]: boolean },
    setTouched: (value: unknown) => void,
    onBlur: (e: any) => any
  ) => (e: any) => {
    if (!touched[fieldPath]) setTouched({ ...touched, [fieldPath]: true })
    typeof onBlur === 'function' && onBlur(e)
  },
  { length: 1 }
)

export function useFormy<T = any>({
  validate,
  errorPropName = globalErrorPropName
}: { validate?: FormyValidator; errorPropName?: string } = {}): {
  field: FormyField
  handleSubmit: (fn: (values: any) => void) => (e: FormEvent) => void
  resetForm: (newValues: KeyValue) => void
  getFormValues: () => T
  setFormValues: (newValues: any) => void
} {
  let validateRef = useRef(validate)
  let [getValues, setValues] = useStateRef({})
  let [defaultValues, setInitialValues] = useState({} as any)
  let [touched, setTouched] = useState({} as any)
  let [submitted, setSubmitted] = useState(false)
  let [validationResult] = useState({})
  let [getValidationResult, setValidationResult] = useStateRef({})
  let values = getValues()
  let getFieldValue = useCallback(
    fieldPath => get(getValues(), fieldPath),
    []
  )

  let runValidationRef = useRef(
    debounce(async (values) => {
      let _validate = validateRef.current
      let _validationResult =
        (typeof _validate === 'function' && (await _validate(values))) || {}
      let _currentValidationResult = getValidationResult() || {}

      if (
        JSON.stringify(_currentValidationResult) !==
        JSON.stringify(_validationResult)
      )
        setValidationResult(_validationResult || {})
    }, 300)
  )

  useEffect(() => {
    let _validate = runValidationRef.current
    if (typeof _validate === 'function') _validate(values)
  }, [values])

  let onFieldChange = useMemo(
    () => (fieldPath: string, e: any) =>
      setValues(
        set({ ...getValues() }, fieldPath, e && e.target ? e.target.value : e)
      ),
    []
  )

  let field = useCallback(
    (fieldPath, { onChange, onBlur, defaultValue } = {}) => {
      if (
        defaultValue !== undefined &&
        defaultValues[fieldPath] !== defaultValue
      ) {
        setInitialValues({ ...defaultValues, [fieldPath]: defaultValue })
        if (!touched[fieldPath]) onFieldChange(fieldPath, defaultValue)
      }

      // noinspection JSUnusedGlobalSymbols
      let fieldProps = {
        set value(newValue) {
          setTimeout(() => onFieldChange(fieldPath, newValue))
        },
        get value() {
          let currentValue = getFieldValue(fieldPath)
          return currentValue === undefined ? '' : currentValue
        },
        get [errorPropName]() {
          let error = get(getValidationResult(), fieldPath)
          return (submitted && error) || (touched[fieldPath] && error)
        }
      }

      Object.defineProperty(fieldProps, 'remove', {
        value: (index: number) => {
          if (Array.isArray(getFieldValue(fieldPath))) return

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
        value: getFieldOnChange(fieldPath, touched, setTouched, onFieldChange, onChange)
      })

      Object.defineProperty(fieldProps, 'onBlur', {
        enumerable: true,
        value: getFieldOnBlur(fieldPath, touched, setTouched, onBlur)
      })

      return fieldProps
    },
    [validationResult, defaultValues, errorPropName, touched, submitted]
  )

  let handleSubmit = useCallback(
    onSubmit => (e: any) => {
      e.preventDefault()

      setSubmitted(true)

      let validationResult = getValidationResult()

      if (validationResult && Object.keys(validationResult).length) {
        return
      }

      typeof onSubmit === 'function' && onSubmit(getValues())
    },
    []
  )

  let resetForm = useCallback((newValues = {}) => {
    setValues(newValues)
    setTouched({})
    setSubmitted(false)
  }, [])

  let setFormValues = useCallback(newValues => {
    setValues({ ...getValues(), ...newValues })
  }, [])

  let getFormValues = useCallback(
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
