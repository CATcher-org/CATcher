export interface Rule {
  required?: boolean;
  validate: (any) => boolean;
}

export interface Schema {
  [keyName: string]: Rule;
}

export const isValidObject = (object, schema: Schema) =>
  Object.entries(schema)
    .map(([key, rule]) => [
      !rule.required || key in object, // if key is present
      rule.validate(object[key]) // if key abides by schema
    ])
    .every((pair) => pair.every(Boolean));
