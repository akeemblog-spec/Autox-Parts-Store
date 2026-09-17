export const homeCampaigns = {
  finder: {
    eyebrow: "RIDE BETTER · FIT PERFECTLY",
    title: "SPECIFIC PARTS",
    accent: "FOR YOUR BIKE?",
    secondLine: "",
    description: "Find the correct parts quickly with our advanced parts finder.",
    button: "TRY PARTS FINDER",
    href: "/parts-finder",
    image: "/images/campaigns/parts-finder-garage.webp",
  },
  threewheel: {
    eyebrow: "RELIABLE THREE WHEELER PARTS",
    title: "GENUINE",
    accent: "PARTS",
    secondLine: "FOR A SMOOTHER TOMORROW",
    description: "Keep Your Three Wheeler Running Stronger for Longer.",
    button: "SHOP THREE WHEELER PARTS",
    href: "/three-wheelers",
    image: "/images/campaigns/three-wheeler-garage.webp",
  },
  accessories: {
    eyebrow: "RIDE FURTHER // GEAR BETTER",
    title: "UPGRADE",
    accent: "YOUR RIDE",
    secondLine: "",
    description: "Premium accessories for better performance, comfort and style.",
    button: "SHOP ACCESSORIES",
    href: "/products",
    image: "/images/campaigns/accessories-helmet.webp",
  },
  offers: {
    eyebrow: "GENUINE PARTS // REAL PERFORMANCE",
    title: "SPECIAL",
    accent: "OFFERS",
    secondLine: "",
    description: "Top deals on genuine parts for your bike.",
    button: "VIEW OFFERS",
    href: "/offers",
    image: "/images/campaigns/special-offers-parts.webp",
  },
} as const;

export type HomeCampaign = keyof typeof homeCampaigns;
export type CampaignField = keyof typeof homeCampaigns.finder;
export const campaignFields: CampaignField[] = ["eyebrow", "title", "accent", "secondLine", "description", "button", "href", "image"];

export function campaignSetting(key: HomeCampaign, field: CampaignField) {
  return `home_campaign_${key}_${field}`;
}

export function getHomeCampaign(key: HomeCampaign, settings: Record<string, string>) {
  const defaults = homeCampaigns[key];
  return Object.fromEntries(campaignFields.map(field => [field, settings[campaignSetting(key, field)] ?? defaults[field]])) as Record<CampaignField, string>;
}
