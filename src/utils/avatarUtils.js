/**
 * DiceBear Avatar Generator Utility (Free / Unlimited / No Auth)
 * Generates vector avatar URLs for users, mechanics, and vehicles without custom photos.
 */

export function getAvatarUrl(seed = "carvis", style = "bottts") {
  const cleanSeed = encodeURIComponent(seed.toString().trim() || "user");
  return `https://api.dicebear.com/7.x/${style}/svg?seed=${cleanSeed}&backgroundColor=0a0f24,030712`;
}

export function getMechanicAvatarUrl(name = "Usta") {
  const cleanSeed = encodeURIComponent(name.toString().trim());
  return `https://api.dicebear.com/7.x/bottts-neutral/svg?seed=${cleanSeed}&backgroundColor=0f172a`;
}

export function getUserAvatarUrl(name = "Sürücü") {
  const cleanSeed = encodeURIComponent(name.toString().trim());
  return `https://api.dicebear.com/7.x/avataaars/svg?seed=${cleanSeed}&backgroundColor=0284c7`;
}
