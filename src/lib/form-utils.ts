/**
 * Compares current form values with initial values and returns only the changed fields
 * @param currentValues - Current form values
 * @param initialValues - Initial form values
 * @returns Object containing only the fields that have changed
 */
export function getChangedValues<T extends Record<string, any>>(
  currentValues: T,
  initialValues?: Partial<T>
): Partial<T> {
  if (!initialValues) {
    // If no initial values provided, return all current values
    return currentValues;
  }

  const changedValues: Partial<T> = {};

  for (const key in currentValues) {
    if (currentValues.hasOwnProperty(key)) {
      const currentValue = currentValues[key];
      const initialValue = initialValues[key];

      // Check if the value has changed
      if (currentValue !== initialValue && currentValue !== null) {
        changedValues[key] = currentValue;
      }
    }
  }

  return changedValues;
}

/**
 * Checks if any values have changed
 * @param currentValues - Current form values
 * @param initialValues - Initial form values
 * @returns Boolean indicating if any values have changed
 */
export function hasValuesChanged<T extends Record<string, any>>(
  currentValues: T,
  initialValues?: Partial<T>
): boolean {
  const changedValues = getChangedValues(currentValues, initialValues);
  return Object.keys(changedValues).length > 0;
}

/**
 * Type-safe utility for form field comparison
 */
export interface FormFieldComparator<T> {
  compare: (current: T, initial: T) => boolean;
  getValue: (value: T) => any;
}

/**
 * Creates a custom comparator for specific field types
 */
export function createFieldComparator<T>(
  compareFn: (current: T, initial: T) => boolean
): FormFieldComparator<T> {
  return {
    compare: compareFn,
    getValue: (value) => value,
  };
}

/**
 * Common field comparators
 */
export const FieldComparators = {
  // For array fields (compare by length and content)
  array: createFieldComparator<any[]>((current, initial) => {
    if (current.length !== initial.length) return false;
    return current.every((item, index) => item === initial[index]);
  }),

  // For date fields (compare by timestamp)
  date: createFieldComparator<Date>((current, initial) => {
    return current.getTime() === initial.getTime();
  }),

  // For number fields with precision
  number: (precision: number = 2) => 
    createFieldComparator<number>((current, initial) => {
      return Math.abs(current - initial) < Math.pow(10, -precision);
    }),

  // For object fields (deep comparison)
  object: createFieldComparator<Record<string, any>>((current, initial) => {
    return JSON.stringify(current) === JSON.stringify(initial);
  }),
};
