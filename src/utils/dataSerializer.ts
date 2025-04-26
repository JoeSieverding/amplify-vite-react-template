// src/utils/dataSerializer.ts
type SerializableValue = string | number | boolean | null | undefined | Date | Record<string, unknown>[] | Record<string, unknown>;

export const serializeData = <T extends SerializableValue>(data: T): T => {
    if (data === null || data === undefined) {
      return data;
    }
  
    // Handle Date objects
    if (data instanceof Date) {
      return data.toISOString() as unknown as T;
    }
  
    // Handle Arrays
    if (Array.isArray(data)) {
      return data.map(item => serializeData(item as SerializableValue)) as unknown as T;
    }
  
    // Handle Objects
    if (typeof data === 'object') {
      const serialized: Record<string, unknown> = {};
      
      for (const [key, value] of Object.entries(data)) {
        // Skip functions and internal properties (those starting with '_')
        if (typeof value !== 'function' && !key.startsWith('_')) {
          serialized[key] = serializeData(value as SerializableValue);
        }
      }
      
      return serialized as unknown as T;
    }
  
    // Return primitive values as-is
    return data;
};
