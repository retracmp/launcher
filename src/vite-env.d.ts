/// <reference types="vite/client" />

type Item = {
  ID: string;
  ProfileType: string;
  Attributes: Record<string, any>;
  BackendValue: string;
  Template: string;
  Quantity: number;
};

type Loadout = {
  ID: string;
  ProfileID: string;
  LockerName: string;
  CharacterID: string;
  BackpackID: string;
  PickaxeID: string;
  GliderID: string;
  ContrailID: string;
  LoadingScreenID: string;
  MusicPackID: string;
  DanceIDs: string[6];
  WrapIDs: string[7];
  BannerColour: string;
  BannerIcon: string;
};

type Profile = {
  Items: Record<string, Item>;
  Loadouts: Loadout[];
  Attributes: Record<string, any>;
};

type Stat = {
  Season: number;
  XP: number;
  BookXP: number;
  Premium: bool;
  TierFreeClaimed: number;
  TierPaidClaimed: number;
  LevelClaimed: number;
};

type User = {
  ID: string;
  Account: {
    DisplayName: string;
    Discord: {
      Username: string;
    };
    Stats: Record<int, Stat>;
    State: {
      Packages: string[];
      ClaimedPackages: string[];
    };
  };
  Profiles: {
    athena: Profile;
    common_core: Profile;
  };
};

type PersonResponse = User;

////

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

type int = number;
type bool = boolean;

type DownloadProgress_rust = {
  file_name: string;
  wanted_file_size: number;
  downloaded_file_size: number;
  download_speed: number;
};

type ServersResponse = {
  buckets: Bucket[];
};

type Bucket = {
  constraint: string;
  customKey: string;
  version: string;
  servers: Server[];
};

type Server = {
  id: string;
  bucket_id: string;
  status: ServerStatus;
  partyIdsAssinged: string[];
  playercount: number;
};

type PlayersInfoResponse = Array<{
  id: string;
  displayName: string;
}>;

type LeaderboardResponse = Array<{
  accountId: string;
  eliminations: number;
  wins: number;
  score: number;
}>;

type Catalog = {
  Date: string;
  Storefronts: Section[];
};

type Section = {
  ID: string;
  CatalogID: string;
  Name: string;
  // Offers: Offer[];
  DBMtxOffers: Offer[];
  // moneyOffers: Offer[];
  // kitOffers: Offer[];
  // passOffers: Offer[];
};

type Offer = {
  ID: string;
  StorefrontID: string;
  Grants: Reward[];
  Price: {
    ID: string;
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
    Title: string;
    Description: string;
    ShortDescription: string;
    LongDescription: string;
    Category: string;
    TileSize: string;
    SectionID: string;
    DisplayAssetPath: string;
    NewDisplayAssetPath: string;
    BannerOverride: string;
    PriorityCategory: number;
    PriorityStorefront: number;
    Refundable: bool;
    Giftable: bool;
    CurrencyAnalyticsName: string;
    TotalMtxQuantity: number;
    ExtraMtxQuantity: number;
    FeaturedImageURL: string;
    IconSize: string;
  };
};

type Reward = {
  ID: string;
  Template: string;
  BackendValue: string;
  Quantity: number;
};

type FortniteApiResult = {
  Cosmetic: {
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
  cosmetics: Record<string, FortniteApiResult>;
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
