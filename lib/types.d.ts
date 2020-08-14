import { FormEvent } from 'react';
export declare type Nothing = undefined | null;
export declare type Formy<T = any> = {
    field: FormyField;
    handleSubmit: (fn: (values: any) => void) => (e: FormEvent) => void;
    resetForm: (newValues: Partial<T>) => void;
    getFormValues: () => Partial<T>;
    isDirty: boolean;
    isSubmitting: boolean;
    setFormValues: (newValues: any) => void;
};
export declare type FormyParams<T = any> = {
    validate?: FormyValidator<Partial<T>>;
    errorPropName?: string;
};
export interface KeyValue<T = any> {
    [k: string]: T;
}
export declare type FormyValidator<T = any> = (values: T) => Promise<KeyValue<string> | Nothing> | KeyValue<string> | Nothing;
export declare type FormyField = (name: string, options?: FieldOptions) => {
    onChange: any;
    onBlur: any;
    name: any;
    value: any;
    [errorKey: string]: string;
} & any;
export declare type FieldOptions = {
    defaultValue?: any;
    onChange?: (newValue: any) => void;
    onBlur?: (e: FocusEvent) => void;
};
//# sourceMappingURL=types.d.ts.map