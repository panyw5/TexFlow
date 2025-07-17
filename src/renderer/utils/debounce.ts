// Simple debounce utility function

export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number,
  immediate?: boolean
): T & { cancel: () => void } {
  let timeout: NodeJS.Timeout | null = null;
  let args: Parameters<T> | null = null;
  let result: ReturnType<T>;

  const later = () => {
    timeout = null;
    if (!immediate && args) {
      result = func.apply(null, args);
      args = null;
    }
  };

  const debounced = function (this: any, ...newArgs: Parameters<T>) {
    args = newArgs;
    const callNow = immediate && !timeout;
    
    if (timeout) {
      clearTimeout(timeout);
    }
    
    timeout = setTimeout(later, wait);
    
    if (callNow) {
      result = func.apply(this, args);
      args = null;
    }
    
    return result;
  } as T & { cancel: () => void };

  debounced.cancel = () => {
    if (timeout) {
      clearTimeout(timeout);
      timeout = null;
    }
    args = null;
  };

  return debounced;
}
