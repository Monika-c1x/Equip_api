/**
 * String utility functions
 */
export class StringUtils {
  /**
   * Generate random string of specified length
   */
  static generateRandomString(length: number = 32): string {
    const chars =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  /**
   * Generate random number string (digits only)
   */
  static generateRandomNumbers(length: number = 6): string {
    const chars = '0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  /**
   * Capitalize first letter of string
   */
  static capitalize(str: string): string {
    if (!str || str.length === 0) return '';
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  }

  /**
   * Convert camelCase to snake_case
   */
  static camelToSnakeCase(str: string): string {
    return str.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
  }

  /**
   * Convert snake_case to camelCase
   */
  static snakeToCamelCase(str: string): string {
    return str.replace(/_([a-z])/g, (g) => g[1].toUpperCase());
  }

  /**
   * Truncate string to specified length with ellipsis
   */
  static truncate(
    str: string,
    length: number = 50,
    ellipsis: string = '...',
  ): string {
    if (str.length <= length) return str;
    return str.substring(0, length - ellipsis.length) + ellipsis;
  }

  /**
   * Mask email address for privacy (e.g., j***@example.com)
   */
  static maskEmail(email: string): string {
    const [localPart, domain] = email.split('@');
    if (!localPart || !domain) return email;

    const masked =
      localPart.charAt(0) +
      '*'.repeat(Math.max(1, localPart.length - 2)) +
      localPart.charAt(localPart.length - 1);

    return `${masked}@${domain}`;
  }

  /**
   * Check if string contains only alphanumeric characters
   */
  static isAlphanumeric(str: string): boolean {
    return /^[a-zA-Z0-9]+$/.test(str);
  }

  /**
   * Generate slug from string (lowercase, hyphens instead of spaces)
   */
  static generateSlug(str: string): string {
    return str
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '-')
      .replace(/[^\w-]/g, '')
      .replace(/-+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  /**
   * Count occurrences of substring in string
   */
  static countOccurrences(str: string, substr: string): number {
    if (substr.length === 0) return 0;
    return str.split(substr).length - 1;
  }

  /**
   * Remove duplicates from comma-separated string
   */
  static removeDuplicates(str: string, separator: string = ','): string {
    return [...new Set(str.split(separator).map((s) => s.trim()))]
      .filter((s) => s)
      .join(separator);
  }
}
