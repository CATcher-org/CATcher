import { Checkbox } from '../../src/app/core/models/checkbox.model';

const EXPECTED_CHECKED_STRING = '- [x] todo';
const EXPECTED_UNCHECKED_STRING = '- [ ] todo';

describe('Checkbox', () => {
  it('.setChecked() sets the correct isChecked value', () => {
    const checkbox = new Checkbox('todo', false);
    checkbox.setChecked(true);
    expect(checkbox.isChecked).toBe(true);
  });

  it('formats the correct toString value', () => {
    const falseCheckbox = new Checkbox('todo', false);
    const trueCheckbox = new Checkbox('todo', true);

    expect(falseCheckbox.toString()).toBe(EXPECTED_UNCHECKED_STRING);
    expect(trueCheckbox.toString()).toBe(EXPECTED_CHECKED_STRING);
  });
});
