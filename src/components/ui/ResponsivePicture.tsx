type Breakpoint = { minWidth: number; density: "@2x" | "@3x" | "@1x" };

type ResponsivePictureProps = {
  /** File name under /public/images without density suffix or extension. */
  name: string;
  alt: string;
  className?: string;
  /** Largest first, mirroring the original markup's source order. */
  breakpoints: Breakpoint[];
  /** Density used below the smallest breakpoint. */
  fallback: Breakpoint["density"];
  /**
   * Intrinsic size of the largest asset. Without it, a lazy image is 0x0 until
   * it loads, which collapses the flex layouts that size from their content.
   */
  width: number;
  height: number;
  loading?: "eager" | "lazy";
};

export function ResponsivePicture({
  name,
  alt,
  className,
  breakpoints,
  fallback,
  width,
  height,
  loading = "lazy",
}: ResponsivePictureProps) {
  const path = (density: string, ext: string) => `/images/${name}${density}.${ext}`;

  return (
    <picture>
      {breakpoints.flatMap(({ minWidth, density }) => [
        <source key={`${minWidth}-webp`} media={`(min-width: ${minWidth}px)`} srcSet={path(density, "webp")} type="image/webp" />,
        <source key={`${minWidth}-jpg`} media={`(min-width: ${minWidth}px)`} srcSet={path(density, "jpg")} type="image/jpeg" />,
      ])}
      <source srcSet={path(fallback, "webp")} type="image/webp" />
      <img
        src={path(fallback, "jpg")}
        alt={alt}
        className={className}
        width={width}
        height={height}
        loading={loading}
        decoding="async"
      />
    </picture>
  );
}
