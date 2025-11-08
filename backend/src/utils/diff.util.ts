type JsonPrimitive = string | number | boolean | null;
type JsonValue = JsonPrimitive | JsonObject | JsonArray;
type JsonObject = { [key: string]: JsonValue };
type JsonArray = JsonValue[];

export type DiffResult = Record<
  string,
  {
    before: JsonValue;
    after: JsonValue;
  }
>;

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function stable(value: unknown): JsonValue {
  if (value === undefined) {
    return null;
  }
  if (Array.isArray(value)) {
    return (value as unknown[]).map(item => stable(item)) as JsonArray;
  }
  if (isObject(value)) {
    const sortedEntries = Object.keys(value)
      .sort()
      .map(key => [key, stable((value as Record<string, unknown>)[key])]);
    return Object.fromEntries(sortedEntries) as JsonObject;
  }
  if (
    typeof value === 'string' ||
    typeof value === 'number' ||
    typeof value === 'boolean' ||
    value === null
  ) {
    return value;
  }
  return JSON.parse(JSON.stringify(value)) as JsonValue;
}

function isEqual(a: unknown, b: unknown): boolean {
  return JSON.stringify(stable(a)) === JSON.stringify(stable(b));
}

export function diffObjects(
  before: Record<string, unknown> | null | undefined,
  after: Record<string, unknown> | null | undefined
): DiffResult {
  const diff: DiffResult = {};
  const keys = new Set([
    ...Object.keys(before ?? {}),
    ...Object.keys(after ?? {}),
  ]);

  keys.forEach(key => {
    const beforeValue = before ? before[key] : undefined;
    const afterValue = after ? after[key] : undefined;

    if (!isEqual(beforeValue, afterValue)) {
      diff[key] = {
        before: stable(beforeValue),
        after: stable(afterValue),
      };
    }
  });

  return diff;
}
