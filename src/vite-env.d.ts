/// <reference types="vite/client" />

type Variant = {
  ID: string;
  ItemID: string;
  Channel: string;
  Owned: string[];
  Active: string;
};

type Item = {
  ID: string;
  TemplateID: string;
  Quantity: number;
  Favorite: boolean;
  HasSeen: boolean;
  Variants: Variant[];
  ProfileType: string;
};

type Gift = {
  ID: string;
  ProfileID: string;
  TemplateID: string;
  Quantity: number;
  FromID: string;
  GiftedAt: number;
  Message: string;
  Loot: Item[];
};

type Quest = {
  ID: string;
  ProfileID: string;
  TemplateID: string;
  State: string;
  Objectives: string[];
  ObjectiveCounts: number[];
  BundleID: string;
  ScheduleID: string;
};

type Attribute = {
  ID: string;
  ProfileID: string;
  Key: string;
  ValueJSON: string;
  Type: string;
};

type Loadout = {
  ID: string;
  PersonID: string;
  ProfileID: string;
  TemplateID: string;
  LockerName: string;
  BannerID: string;
  BannerColorID: string;
  CharacterID: string;
  PickaxeID: string;
  BackpackID: string;
  GliderID: string;
  DanceID: string[];
  ItemWrapID: string[];
  ContrailID: string;
  LoadingScreenID: string;
  MusicPackID: string;
};

type Profile = {
  ID: string;
  Items: Record<string, Item>;
  Gifts: Record<string, Gift>;
  Quests: Record<string, Quest>;
  Attributes: Record<string, Attribute>;
  Loadouts: Record<string, Loadout>;
  Revision: number;
  Type: string;
};

type DiscordAccount = {
  ID: string;
  PersonID: string;
  Username: string;
  Avatar: string;
  Banner: string;
  AccessToken: string;
  RefreshToken: string;
  HasContentCreatorRole: boolean;
  HasCrystalDonatorRole: boolean;
  HasLlamaDonatorRole: boolean;
  HasRetracPlusRole: boolean;
  HasRetracUltimateRole: boolean;
  LastBoostedAt: string;
  HasGamerDonatorRole: bool;
  HasPUBGDonatorRole: bool;
  HasFeverDonatorRole: bool;
};

type Ban = {
  ID: string;
  PersonID: string;
  IssuedBy: string;
  Expiry: string;
  Reason: string;
};

type SeasonStat = {
  ID: string;
  PersonID: string;
  Season: number;
  SeasonXP: number;
  BookXP: number;
  BookPurchased: boolean;
  Hype: number;
  Eliminations: int;
  MatchesPlayed: int;
  Top1_1: int;
  Top10_1: int;
  Top25_1: int;
  Top1_2: int;
  Top7_2: int;
  Top15_2: int;
  Top1_3: int;
  Top5_3: int;
  Top12_3: int;
  Top1_4: int;
  Top5_4: int;
  Top10_4: int;
};

type Person = {
  ID: string;
  DisplayName: string;
  RefundTickets: number;
  Permissions: number;
  AthenaProfile: Profile;
  CommonCoreProfile: Profile;
  CommonPublicProfile: Profile;
  Profile0Profile: Profile;
  CollectionsProfile: Profile;
  CreativeProfile: Profile;
  CurrentSeasonStats: SeasonStat;
  AllSeasonStats: SeasonStat[];
  BanHistory: Ban[];
  Discord: DiscordAccount;
  Relationships: Record<string, Relationship>;
  Parties: Record<string, Party>;
  Invites: Record<string, Invite>;
  Intentions: Record<string, Intention>;
};

type LibraryEntry = {
  releaseVersion: number;
  title: string;
  description: string;
  posterPath: string;
  binaryPath: string;
  binaryHash: string;
  path: string;
};

type LauncherStats = {
  PlayersOnline: number;
  CurrentBuild: string;
  CurrentSeason: number;
};

type LauncherVersion = {
  current_version: string;
};

type PersonResponse = {
  snapshot: Person;
  season: {
    level: number;
    xp: number;
    bookLevel: number;
    bookXp: number;
  };
};

type int = number;
type bool = boolean;

type DownloadProgress_rust = {
  file_name: string;
  wanted_file_size: number;
  downloaded_file_size: number;
  download_speed: number;
};

type ServersResponse = {
  Buckets: Bucket[];
};

type Bucket = {
  Constraint: string;
  CustomKey: string;
  Version: string;
  Servers: Record<string, Server>;
  Queue: string[];
};

type Server = {
  ID: string;
  Address: string;
  Port: number;
  Constraint: string;
  Status: ServerStatus;
  Parties: string[];
  DonatorOnly: bool;
};

type PlayersInfoResponse = Array<{
  id: string;
  displayName: string;
}>;

type LeaderboardResponse = Record<string, SeasonStat>;

type Catalog = {
  ID: string;
  Sections: Section[];
  Name: string;
};

type Section = {
  ID: string;
  CatalogID: string;
  Name: string;
  Offers: Offer[];
  // itemOffers: Offer[];
  // moneyOffers: Offer[];
  // kitOffers: Offer[];
  // passOffers: Offer[];
};

type Offer = {
  ID: string;
  ShopSectionID: string;
  Type: string;
  Rewards: Reward[];
  Price: {
    ID: string;
    ShopOfferID: string;
    PriceType: string;
    SaleType: string;
    OriginalPrice: number;
    FinalPrice: number;
  };
  Display: {
    ID: string;
    ShopOfferID: string;
    Title: string;
    Description: string;
    ShortDescription: string;
    LongDescription: string;
  };
  Meta: {
    ID: string;
    ShopOfferID: string;
    TileSize: string;
    SectionID: string;
    DisplayAssetPath: string;
    NewDisplayAssetPath: string;
    BannerOverride: string;
    Giftable: boolean;
    Refundable: boolean;
    PriorityShop: number;
    PriorityCategory: number;
    OnlyOnce: boolean;
    OriginalOffer: number;
    ExtraBonus: number;
    FeaturedImageURL: string;
    ReleaseSeason: number;
    IconSize: string;
    CurrencyAnalyticsName: string;
    Categories: string[];
  };
};

type Reward = {
  ID: string;
  Template: string;
  BackendValue: string;
  Quantity: number;
  ProfileType: string;
  Status: number;
  ShopOfferID: string;
};

type FortniteApiResult = {
  id: string;
  name: string;
  description: string;
  type: {
    value: string;
    displayValue: string;
    backendValue: string;
  };
  rarity: {
    value: string;
    displayValue: string;
    backendValue: string;
  };
  set: {
    value: string;
    text: string;
    backendValue: string;
  };
  images: {
    smallIcon: string;
    icon: string;
    featured: string;
    lego: {
      small: string;
      large: string;
      wide: string;
    };
  };
  variants: Array<{
    channel: string;
    type: string;
    options: Array<{
      tag: string;
      name: string;
      image: string;
    }>;
  }>;
  gameplayTags: string[];
  path: string;
  added: string;
};

//

type RetracApiResponse = {
  sets: Record<
    string,
    {
      backendNmae: string;
      displayName: string;
      items: FortniteApiResult[];
    }
  >;
  items: Record<string, FortniteApiResult>;
};

type ContentPagesResult = {
  battleroyalenewsv2?: {
    news: {
      motds: Array<{
        id: string;
        image: string;
        title: string;
        body: string;
      }>;
    };
  };
};
