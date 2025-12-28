export type ReviewCategory = 'tv_show' | 'book' | 'movie' | 'sports_team' | 'travel_destination'

export interface User {
  id: string
  wallet_address: string | null
  discord_id?: string | null
  discord_username?: string | null
  username: string | null
  bio: string | null
  profile_image_url: string | null
  ens_name: string | null
  nfts_last_synced_at: string | null
  has_plague_nft: boolean
  created_at: string
  updated_at: string
}

export interface UserNFT {
  id: string
  user_id: string
  contract_address: string
  token_id: string
  collection_name: string | null
  collection_slug: string | null
  image_url: string | null
  synced_at: string
}

export interface Review {
  id: string
  user_id: string
  category: ReviewCategory
  title: string
  content: string
  rating: number
  subject_name: string
  subject_metadata: Record<string, any> | null
  nft_gate_collection: string | null
  likes_count: number
  created_at: string
  updated_at: string
  users?: User
}

export interface Follow {
  id: string
  follower_id: string
  following_id: string
  created_at: string
}

export interface ReviewLike {
  id: string
  user_id: string
  review_id: string
  created_at: string
}

export interface NFTCollection {
  id: string
  contract_address: string
  collection_slug: string | null
  name: string
  image_url: string | null
  description: string | null
  cached_at: string
}
