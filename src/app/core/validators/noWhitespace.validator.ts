import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export function noWhitespace(): ValidatorFn {
  return (title: AbstractControl): ValidationErrors | null => {
    if (title.value && title.value.trim() === '') {
      return { whitespace: true };
    }
    return null;
  };
}
