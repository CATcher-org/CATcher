export interface Rule {
  required?: boolean;
  validate: (any) => boolean;
}

export interface Schema {
  [keyName: string]: Rule;
}

export const isValidObject = (object: object, schema: Schema): boolean => {
  return Object.entries(schema).every(
    ([key, rule]) => {
      return (
        !rule.required ||
        (key in object && // if key is present
          rule.validate(object[key]))
      );
    } // if value abides by schema
  );
};
