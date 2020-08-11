import { FormEvent } from 'react';
declare type Nothing = undefined | null;
declare type Formy<T = any> = {
    field: FormyField;
    handleSubmit: (fn: (values: any) => void) => (e: FormEvent) => void;
    resetForm: (newValues: Partial<T>) => void;
    getFormValues: () => Partial<T>;
    setFormValues: (newValues: any) => void;
};
declare type FormyParams<T = any> = {
    validate?: FormyValidator<Partial<T>>;
    errorPropName?: string;
};
export interface KeyValue<T = any> {
    [k: string]: T;
}
export declare type FormyValidator<T = any> = (values: T) => Promise<KeyValue<string> | Nothing> | KeyValue<string> | Nothing;
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
export declare function useFormy<T = any>({ validate, errorPropName }?: FormyParams<T>): Formy<T>;
export default useFormy;
//# sourceMappingURL=formy.d.ts.map