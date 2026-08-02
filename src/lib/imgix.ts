export function imgixUrl(
  supabaseUrl: string,
  options: {
    width?: number;
    height?: number;
    quality?: number;
    format?: "webp" | "png" | "jpg";
  } = {},
) {
  if (!supabaseUrl) return "";

  // If no Imgix domain is configured, fallback to Supabase's native transformations (if Pro)
  // or just return the original URL
  const imgixDomain = import.meta.env.VITE_IMGIX_DOMAIN;
  if (!imgixDomain) {
    return supabaseUrl;
  }

  const params = new URLSearchParams();
  if (options.width) params.append("w", options.width.toString());
  if (options.height) params.append("h", options.height.toString());
  if (options.quality) params.append("q", options.quality.toString());
  params.append("auto", "format,compress");

  // Strip https:// to append to Imgix domain if needed, or pass full URL as proxy
  const encodedUrl = encodeURIComponent(supabaseUrl);
  return `https://${imgixDomain}/${encodedUrl}?${params}`;
}
