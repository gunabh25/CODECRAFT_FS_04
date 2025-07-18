/**
 * Combines class names conditionally.
 * Usage: cn("base-class", condition && "conditional-class")
 */
export function cn(...classes) {
  return classes.filter(Boolean).join(' ');
}
