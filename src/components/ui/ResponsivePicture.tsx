type Density = "@1x" | "@2x" | "@3x";
type Breakpoint = { minWidth: number; density: Density };

type ResponsivePictureProps = {
  /** Path under /public/images without density suffix or extension. */
  name: string;
  alt: string;
  className?: string;
  /** Largest first, mirroring the original markup's source order. */
  breakpoints: Breakpoint[];
  /** Density used below the smallest breakpoint. */
  fallback: Density;
  /** Format of the non-WebP files. */
  ext?: "jpg" | "png";
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
  ext = "jpg",
  width,
  height,
  loading = "lazy",
}: ResponsivePictureProps) {
  const path = (density: string, format: string) => `/images/${name}${density}.${format}`;
  const mime = ext === "png" ? "image/png" : "image/jpeg";

  return (
    <picture>
      {breakpoints.flatMap(({ minWidth, density }) => [
        <source key={`${minWidth}-webp`} media={`(min-width: ${minWidth}px)`} srcSet={path(density, "webp")} type="image/webp" />,
        <source key={`${minWidth}-${ext}`} media={`(min-width: ${minWidth}px)`} srcSet={path(density, ext)} type={mime} />,
      ])}
      <source srcSet={path(fallback, "webp")} type="image/webp" />
      <img
        src={path(fallback, ext)}
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
