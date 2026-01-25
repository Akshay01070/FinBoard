import { FlattenedField } from '@/types';

/**
 * Flattens a nested JSON object into an array of field paths and values
 */
export function flattenObject(
    obj: unknown,
    prefix = '',
    result: FlattenedField[] = []
): FlattenedField[] {
    if (obj === null || obj === undefined) {
        return result;
    }

    if (Array.isArray(obj)) {
        // For arrays, we note it's an array and optionally flatten first element
        result.push({
            path: prefix,
            value: obj,
            type: 'array',
            isArray: true,
        });

        // If array has objects, flatten the first one as a sample
        if (obj.length > 0 && typeof obj[0] === 'object' && obj[0] !== null) {
            flattenObject(obj[0], `${prefix}[0]`, result);
        }
    } else if (typeof obj === 'object') {
        for (const [key, value] of Object.entries(obj)) {
            const newPath = prefix ? `${prefix}.${key}` : key;

            if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
                // Recursively flatten nested objects
                flattenObject(value, newPath, result);
            } else if (Array.isArray(value)) {
                flattenObject(value, newPath, result);
            } else {
                result.push({
                    path: newPath,
                    value,
                    type: typeof value,
                    isArray: false,
                });
            }
        }
    } else {
        result.push({
            path: prefix,
            value: obj,
            type: typeof obj,
            isArray: false,
        });
    }

    return result;
}

/**
 * Gets a value from a nested object using a dot-notation path
 */
export function getValueByPath(obj: unknown, path: string): unknown {
    if (!path || obj === null || obj === undefined) {
        return undefined;
    }

    const keys = path.split(/[.\[\]]/).filter(Boolean);
    let current: unknown = obj;

    for (const key of keys) {
        if (current === null || current === undefined) {
            return undefined;
        }
        if (typeof current === 'object') {
            current = (current as Record<string, unknown>)[key];
        } else {
            return undefined;
        }
    }

    return current;
}

/**
 * Formats a value based on the specified format
 */
export function formatValue(
    value: unknown,
    format?: 'currency' | 'percentage' | 'number' | 'text',
    options?: { currency?: string }
): string {
    if (value === null || value === undefined) {
        return '-';
    }

    const numValue = typeof value === 'string' ? parseFloat(value) : value;

    switch (format) {
        case 'currency':
            if (typeof numValue === 'number' && !isNaN(numValue)) {
                return new Intl.NumberFormat('en-US', {
                    style: 'currency',
                    currency: options?.currency || 'USD',
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 6, // Allow up to 6 decimals for crypto
                }).format(numValue);
            }
            return String(value);

        case 'percentage':
            if (typeof numValue === 'number' && !isNaN(numValue)) {
                return `${(numValue * 100).toFixed(2)}%`;
            }
            return String(value);

        case 'number':
            if (typeof numValue === 'number' && !isNaN(numValue)) {
                return new Intl.NumberFormat('en-US', {
                    maximumFractionDigits: 6,
                }).format(numValue);
            }
            return String(value);

        case 'text':
        default:
            return String(value);
    }
}

/**
 * Gets the array data from a path for table display
 */
export function getArrayData(obj: unknown, path: string): Record<string, unknown>[] {
    const value = getValueByPath(obj, path);

    if (Array.isArray(value)) {
        return value.filter(item => typeof item === 'object' && item !== null) as Record<string, unknown>[];
    }

    return [];
}
