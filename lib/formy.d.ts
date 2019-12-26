import { FormEvent } from 'react';
declare type Nothing = undefined | null;
export interface KeyValue {
    [k: string]: string;
}
export declare type FormyValidator = (values: KeyValue) => Promise<KeyValue | Nothing> | KeyValue | Nothing;
export interface FieldOptions {
    defaultValue?: any;
    onChange?: (newValue: any) => void;
    onBlur?: (e: FocusEvent) => void;
}
export declare type FormyField = (name: string, options?: FieldOptions) => {
    onChange: any;
    onBlur: any;
    name: any;
    value: any;
    [errorKey: string]: string;
} & any;
export declare function setErrorPropName(name: string): void;
export declare function useFormy<T = any>({ validate, errorPropName }?: {
    validate?: FormyValidator;
    errorPropName?: string;
}): {
    field: FormyField;
    handleSubmit: (fn: (values: any) => void) => (e: FormEvent) => void;
    resetForm: (newValues: KeyValue) => void;
    getFormValues: () => T;
    setFormValues: (newValues: any) => void;
};
export default useFormy;
//# sourceMappingURL=formy.d.ts.map