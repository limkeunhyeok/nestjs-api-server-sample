export function removeUndefined<T extends object>(obj: T): Partial<T> {
  return Object.entries(obj).reduce((acc, [key, value]) => {
    if (value !== undefined) {
      (acc as T)[key as keyof T] = value as T[keyof T];
    }
    return acc;
  }, {} as Partial<T>);
}
