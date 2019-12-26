"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var lodash_clonedeep_1 = __importDefault(require("lodash.clonedeep"));
var lodash_set_1 = __importDefault(require("lodash.set"));
var lodash_get_1 = __importDefault(require("lodash.get"));
var react_1 = require("react");
var once_1 = __importDefault(require("lodash/once"));
var globalErrorPropName = 'errorText';
function setErrorPropName(name) {
    globalErrorPropName = name;
}
exports.setErrorPropName = setErrorPropName;
function useStateRef(initialValue) {
    var _a = react_1.useState(initialValue), value = _a[0], setValue = _a[1];
    var valueRef = react_1.useRef(value);
    valueRef.current = value;
    var getCurrentValue = react_1.useCallback(function () { return valueRef.current; }, []);
    return [
        getCurrentValue,
        function (v) {
            setValue(v);
            valueRef.current;
        },
    ];
}
function useFormy(_a) {
    var _this = this;
    var _b = _a === void 0 ? {} : _a, validate = _b.validate, _c = _b.errorPropName, errorPropName = _c === void 0 ? globalErrorPropName : _c;
    var validateRef = react_1.useRef(validate);
    var _d = useStateRef({}), getValues = _d[0], setValues = _d[1];
    var _e = react_1.useState({}), defaultValues = _e[0], setInitialValues = _e[1];
    var _f = react_1.useState({}), touched = _f[0], setTouched = _f[1];
    var _g = react_1.useState(false), submitted = _g[0], setSubmitted = _g[1];
    var validationResult = react_1.useState({})[0];
    var _h = useStateRef({}), getValidationResult = _h[0], setValidationResult = _h[1];
    var getFieldValue = react_1.useCallback(function (fieldPath) { return lodash_get_1.default(getValues(), fieldPath); }, []);
    var values = getValues();
    react_1.useEffect(function () {
        (function () { return __awaiter(_this, void 0, void 0, function () {
            var _validate, _validationResult, _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _validate = validateRef.current;
                        _a = typeof _validate === 'function';
                        if (!_a) return [3 /*break*/, 2];
                        return [4 /*yield*/, _validate(values)];
                    case 1:
                        _a = (_b.sent());
                        _b.label = 2;
                    case 2:
                        _validationResult = _a;
                        setValidationResult(_validationResult || {});
                        return [2 /*return*/];
                }
            });
        }); })();
    }, [values]);
    var field = react_1.useCallback(function (fieldPath, _a) {
        var _b, _c;
        var _d = _a === void 0 ? {} : _a, onChange = _d.onChange, onBlur = _d.onBlur, defaultValue = _d.defaultValue;
        var error = lodash_get_1.default(getValidationResult(), fieldPath);
        var onFieldChange = function (e) { return setValues(lodash_set_1.default(__assign({}, getValues()), fieldPath, e && e.target ? e.target.value : e)); };
        if (defaultValue !== undefined && defaultValues[fieldPath] !==
            defaultValue) {
            setInitialValues(__assign({}, defaultValues, (_b = {}, _b[fieldPath] = defaultValue, _b)));
            if (!touched[fieldPath])
                onFieldChange(defaultValue);
        }
        var touchField = function () {
            var _a;
            if (!touched[fieldPath])
                setTouched(__assign({}, touched, (_a = {}, _a[fieldPath] = true, _a)));
        };
        // noinspection JSUnusedGlobalSymbols
        return _c = {
                remove: function (index) {
                    if (Array.isArray(getFieldValue(fieldPath)))
                        return;
                    onFieldChange(getFieldValue(fieldPath).filter(function (_, i) { return i !== index; }));
                },
                unshift: function (v) {
                    onFieldChange([v].concat((getFieldValue(fieldPath) || [])));
                },
                push: function (v) {
                    onFieldChange((getFieldValue(fieldPath) || []).concat([v]));
                },
                get value() {
                    return getFieldValue(fieldPath) || '';
                },
                set value(newValue) {
                    setTimeout(function () { return onFieldChange(newValue); });
                },
                onChange: function (e) {
                    onFieldChange(e);
                    typeof onChange === 'function' && onChange(e);
                },
                onBlur: function (e) {
                    touchField();
                    typeof onBlur === 'function' && onBlur(e);
                }
            },
            Object.defineProperty(_c, errorPropName, {
                get: function () {
                    return (submitted && error) || (touched[fieldPath] && error);
                },
                enumerable: true,
                configurable: true
            }),
            _c;
    }, [
        validationResult,
        defaultValues,
        errorPropName,
        touched,
        submitted,
    ]);
    var handleSubmit = react_1.useCallback(function (onSubmit) { return function (e) {
        e.preventDefault();
        setSubmitted(true);
        var validationResult = getValidationResult();
        if (validationResult && Object.keys(validationResult).length) {
            return;
        }
        typeof onSubmit === 'function' && onSubmit(getValues());
    }; }, []);
    var resetForm = react_1.useCallback(function (newValues) {
        if (newValues === void 0) { newValues = {}; }
        setValues(newValues);
        setTouched({});
        setSubmitted(false);
    }, []);
    var setFormValues = react_1.useCallback(function (newValues) {
        setValues(__assign({}, getValues(), newValues));
    }, []);
    var getFormValues = react_1.useCallback(once_1.default(function () {
        return lodash_clonedeep_1.default(getValues());
    }), []);
    return {
        field: field,
        handleSubmit: handleSubmit,
        resetForm: resetForm,
        getFormValues: getFormValues,
        setFormValues: setFormValues,
    };
}
exports.useFormy = useFormy;
exports.default = useFormy;