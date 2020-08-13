import { FieldOptions, Formy, FormyField, FormyParams, FormyValidator } from './types';
export { FormyValidator, Formy, FieldOptions, FormyField };
export declare function setErrorPropName(name: string): void;
export declare function useFormy<T = any>({ validate, errorPropName }?: FormyParams<T>): Formy<T>;
export default useFormy;
//# sourceMappingURL=formy.d.ts.map