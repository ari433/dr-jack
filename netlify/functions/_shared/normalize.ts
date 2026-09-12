const replacements: Record<string, string> = {
  "ë": "e", "ç": "c", "Ë": "e", "Ç": "c"
};

export function normalize(value: unknown): string {
  return String(value ?? "")
    .replace(/[ëçËÇ]/g, c => replacements[c])
    .trim().toLowerCase().replace(/\s+/g, " ");
}

export function canonicalProduct(value: unknown) {
  const v = normalize(value);
  const products: Record<string, string> = { dublin: "dublin", oslo: "oslo", basel: "basel", california: "california" };
  return products[v] || v;
}

export function canonicalVariant(value: unknown) {
  const v = normalize(value);
  if (["femer", "femra", "female", "women", "grate"].includes(v)) return "femra";
  if (["mashkull", "meshkuj", "male", "men", "burra"].includes(v)) return "meshkuj";
  return v;
}

export function canonicalColor(value: unknown) {
  let v = normalize(value);
  const aliases: Record<string, string> = {
    "bardhe": "e bardhe", "white": "e bardhe", "e bardh": "e bardhe",
    "zeze": "e zeze", "black": "e zeze", "e zez": "e zeze",
    "kuqe": "e kuqe", "red": "e kuqe", "e kuq": "e kuqe",
    "roze": "roze", "pink": "roze",
    "gri e erret": "gri e erret", "dark grey": "gri e erret",
    "gri": "gri", "grey": "gri", "gray": "gri",
    "vjollce e erret": "vjollce e erret", "dark purple": "vjollce e erret",
    "vjollce": "vjollce", "purple": "vjollce",
    "gjelber": "e gjelber", "e gjelber": "e gjelber", "green": "e gjelber",
    "verdhe": "e verdhe", "e verdhe": "e verdhe", "yellow": "e verdhe",
    "blu e erret": "blu e erret", "dark blue": "blu e erret",
    "bezhe": "bezhe", "beige": "bezhe",
    "kafe": "e kafte", "kaft": "e kafte", "e kafte": "e kafte", "brown": "e kafte",
    "lava": "lava"
  };
  return aliases[v] || v;
}
