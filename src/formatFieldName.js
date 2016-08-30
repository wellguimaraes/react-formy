export default function formatFieldName(name, args) {
  let argIndex = 1;

  return args.length > 1
    ? name.replace(/\[\]/g, () => `[${args[ argIndex++ ]}]`)
    : name;
};