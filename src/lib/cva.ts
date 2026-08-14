export type VariantProps<T extends (...args: any) => any> = T extends (
  props?: infer P
) => any
  ? NonNullable<P>
  : Record<string, never>;

export type ClassValue = string | number | boolean | undefined | null;

export function cva<T extends Record<string, Record<string, string>>>(
  base?: string,
  config?: {
    variants?: T;
    defaultVariants?: { [K in keyof T]?: keyof T[K] };
  }
) {
  return (
    props?: { [K in keyof T]?: keyof T[K] } & { className?: string }
  ) => {
    if (!config || !config.variants) {
      return [base, props?.className].filter(Boolean).join(" ");
    }
    const { variants, defaultVariants } = config;
    const variantClasses = Object.keys(variants).map((key) => {
      const val = props?.[key] !== undefined ? props[key] : defaultVariants?.[key];
      return val !== undefined && variants[key] ? variants[key][val as string] : "";
    });
    return [base, ...variantClasses, props?.className].filter(Boolean).join(" ");
  };
}
