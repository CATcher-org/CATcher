import { filter, throwIfEmpty } from 'rxjs/operators';
import { pipe } from 'rxjs';

export function throwIfFalse(predicate, error_func) {
    return pipe(
        filter(v => predicate(v)),
        throwIfEmpty(error_func)
    );
}
