/** Create an object with methods that are autoSpy-ed to use as mock dependency */
export function autoSpy<T>(obj: new (...args: any[]) => T): SpyOf<T> {
    const res: SpyOf<T> = {} as any;

    // turns out that in target:es2015 the methods attached to the prototype are not enumerable so Object.keys returns []. So to workaround that and keep some backwards compatibility - merge with ownPropertyNames - that disregards the enumerable property.
    const keys = [...Object.keys(obj.prototype), ...Object.getOwnPropertyNames(obj.prototype)];
    keys.forEach(key => {
        res[key] = jasmine.createSpy(key);
    });

    return res;
}

/** Keeps the types of properties of a type but assigns type of Spy to the methods */
type SpyOf<T> = T &
    Partial<{ [k in keyof T]: T[k] extends (...args: any[]) => any ? jasmine.Spy : T[k] }>;
