from datetime import datetime
from enum import Enum
from typing import Optional

from pydantic import BaseModel, Field


# --- Enums (mirrors database.types.ts) ---


class DiscountType(str, Enum):
    percentage = "percentage"
    fixed = "fixed"


class RedemptionType(str, Enum):
    online = "online"
    physical = "physical"
    both = "both"


class WalletType(str, Enum):
    credit_card = "credit_card"
    club = "club"


class ReportReason(str, Enum):
    not_working = "not_working"
    expired = "expired"
    inappropriate = "inappropriate"
    other = "other"


class ReportStatus(str, Enum):
    pending = "pending"
    reviewed = "reviewed"
    resolved = "resolved"


class InfluencerRequestStatus(str, Enum):
    pending = "pending"
    approved = "approved"
    rejected = "rejected"


# --- Response Models (Row equivalents from database.types.ts) ---


class UserResponse(BaseModel):
    id: str
    email: str
    name: Optional[str] = None
    profile_image: Optional[str] = None
    bio: Optional[str] = None
    is_influencer: bool = False
    is_verified: bool = False
    created_at: datetime
    updated_at: datetime


class WalletResponse(BaseModel):
    id: str
    name: str
    type: WalletType
    logo: Optional[str] = None
    is_active: bool = True
    created_at: datetime


class StoreResponse(BaseModel):
    id: str
    name: str
    logo: Optional[str] = None
    website: Optional[str] = None
    is_active: bool = True
    created_at: datetime


class WalletBrief(BaseModel):
    """Wallet join data used in BenefitWithWallet."""

    name: str
    type: WalletType


class BenefitResponse(BaseModel):
    id: str
    store_id: str
    wallet_id: str
    discount_type: DiscountType
    discount_value: float
    description: Optional[str] = None
    redemption_type: RedemptionType
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    is_active: bool = True
    created_at: datetime
    wallet: WalletBrief


class UserBrief(BaseModel):
    """User join data used in CouponWithUser."""

    id: str
    name: str
    profile_image: Optional[str] = None
    is_verified: bool


class CouponResponse(BaseModel):
    id: str
    user_id: str
    store_id: str
    code: str
    discount_type: DiscountType
    discount_value: float
    description: Optional[str] = None
    redemption_type: RedemptionType
    expires_at: datetime
    is_active: bool = True
    created_at: datetime
    user: UserBrief


class FollowResponse(BaseModel):
    id: str
    follower_id: str
    following_id: str
    created_at: datetime


class ReportResponse(BaseModel):
    id: str
    coupon_id: str
    user_id: str
    reason: ReportReason
    details: Optional[str] = None
    status: ReportStatus
    created_at: datetime


class InfluencerRequestResponse(BaseModel):
    id: str
    user_id: str
    instagram_url: str
    followers_count: int
    interests: Optional[list[str]] = None
    motivation: Optional[str] = None
    status: InfluencerRequestStatus
    admin_notes: Optional[str] = None
    created_at: datetime
    reviewed_at: Optional[datetime] = None


# --- Request Models (Insert/Create equivalents) ---


class CouponCreate(BaseModel):
    store_id: str
    code: str
    discount_type: DiscountType
    discount_value: float = Field(gt=0)
    description: Optional[str] = Field(None, max_length=100)
    redemption_type: RedemptionType
    expires_at: datetime


class ReportCreate(BaseModel):
    coupon_id: str
    reason: ReportReason
    details: Optional[str] = None


class InfluencerRequestCreate(BaseModel):
    instagram_url: str
    followers_count: int = Field(gt=0)
    interests: Optional[list[str]] = None
    motivation: Optional[str] = None


class UserUpdate(BaseModel):
    name: Optional[str] = None
    bio: Optional[str] = Field(None, max_length=100)
    profile_image: Optional[str] = None


class UserWalletUpdate(BaseModel):
    wallet_ids: list[str]


# --- Auth Models ---


class EmailPasswordAuth(BaseModel):
    email: str
    password: str = Field(min_length=6)


class SocialAuth(BaseModel):
    provider: str = Field(pattern="^(google)$")
    id_token: str


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    user: UserResponse


class RefreshTokenRequest(BaseModel):
    refresh_token: str


class RegisterPushTokenRequest(BaseModel):
    expo_push_token: str
