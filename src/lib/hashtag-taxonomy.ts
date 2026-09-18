export interface HashtagParams {
  city: string;
  service: string;
  maxTags?: number;
}

const CITY_TAGS: Record<string, string[]> = {
  "Pearl": ["#PearlMS", "#PearlMSRoofing", "#PearlContractor"],
  "Jackson": ["#JacksonMS", "#JacksonMSRoofing", "#JacksonMetro"],
  "Brandon": ["#BrandonMS", "#BrandonMSRoofing", "#RankinCounty"],
  "Madison": ["#MadisonMS", "#MadisonMSRoofing", "#MadisonCountyMS"],
  "Flowood": ["#FlowoodMS", "#FlowoodRoofing", "#FlowoodContractor"],
  "Byram": ["#ByramMS", "#ByramMSRoofing", "#HindsCounty"],
  "Clinton": ["#ClintonMS", "#ClintonMSRoofing"],
  "Ridgeland": ["#RidgelandMS", "#RidgelandRoofing"],
  "Canton": ["#CantonMS", "#CantonMSRoofing"],
  "Terry": ["#TerryMS", "#TerryContractor"],
  "Florence": ["#FlorenceMS", "#FlorenceContractor"],
  "Vicksburg": ["#VicksburgMS", "#WarrenCountyMS"],
  "Richland": ["#RichlandMS", "#RichlandContractor"],
};

const SERVICE_TAGS: Record<string, string[]> = {
  "Residential Roofing": ["#RoofReplacement", "#ResidentialRoofing", "#NewRoof"],
  "Roof install": ["#RoofReplacement", "#GAFShingles", "#ArchitecturalShingles", "#NewRoof"],
  "Metal Roofing": ["#MetalRoofing", "#StandingSeam", "#DurableRoofing", "#MetalRoof"],
  "Commercial Roofing": ["#CommercialRoofing", "#FlatRoofing", "#TPO"],
  "General Remodeling": ["#HomeRemodeling", "#HomeRenovation", "#MississippiHomes"],
  "Kitchen Remodeling": ["#KitchenRemodel", "#KitchenDesign", "#CustomKitchen"],
  "Bathroom Remodeling": ["#BathroomRemodel", "#TileShower", "#BathRenovation"],
  "Whole House Remodeling": ["#FullHomeRenovation", "#HouseTransformation", "#MississippiContractor"],
  "Fencing & Decking": ["#CustomFence", "#DeckBuilder", "#OutdoorLiving"],
  "Siding & Gutters": ["#SidingReplacement", "#SeamlessGutters", "#ExteriorUpgrade"],
  "Roof Inspection & Tarping": ["#StormDamageRepair", "#RoofInspection", "#EmergencyTarping"],
};

const BRAND_CORE_TAGS = ["#BornAgainRoofing", "#CentralMSRoofing", "#MississippiContractors"];

export function generateControlledHashtags({
  city,
  service,
  maxTags = 7,
}: HashtagParams): string[] {
  const cleanCity = city.replace(/,.*$/, "").trim();
  const cityMatches = CITY_TAGS[cleanCity] || [`#${cleanCity.replace(/\s+/g, "")}MS`];
  
  // Find matching service key
  let serviceMatches: string[] = ["#RoofingContractor", "#HomeImprovement"];
  for (const [key, tags] of Object.entries(SERVICE_TAGS)) {
    if (service.toLowerCase().includes(key.toLowerCase()) || key.toLowerCase().includes(service.toLowerCase())) {
      serviceMatches = tags;
      break;
    }
  }

  const combined = [
    ...BRAND_CORE_TAGS.slice(0, 2),
    ...cityMatches.slice(0, 2),
    ...serviceMatches.slice(0, 3),
    BRAND_CORE_TAGS[2],
  ];

  // Deduplicate and cap at maxTags
  const unique = Array.from(new Set(combined));
  return unique.slice(0, maxTags);
}
