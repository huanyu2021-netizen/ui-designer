/**
 * 防抖函数
 * @param func 需要防抖的函数
 * @param delay 延迟时间（毫秒）
 * @returns 防抖后的函数
 */
export const debounce = <T extends (...args: any[]) => any>(func: T, delay: number) => {
  let timeoutId: number | null = null;

  return ((...args: Parameters<T>) => {
    if (timeoutId) {
      window.clearTimeout(timeoutId);
    }
    timeoutId = window.setTimeout(() => {
      func(...args);
    }, delay);
  }) as (...args: Parameters<T>) => void;
};