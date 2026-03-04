import pytest
from pydantic import ValidationError

from app.models.schemas import (
    CouponCreate,
    DiscountType,
    EmailPasswordAuth,
    RedemptionType,
    ReportCreate,
    ReportReason,
    SocialAuth,
    StoreResponse,
    UserResponse,
    WalletType,
)


def test_store_response():
    store = StoreResponse(
        id="uuid-1",
        name="Nike",
        logo=None,
        website="https://nike.com",
        is_active=True,
        created_at="2026-01-01T00:00:00Z",
    )
    assert store.name == "Nike"
    assert store.is_active is True


def test_user_response_defaults():
    user = UserResponse(
        id="uuid-1",
        email="test@test.com",
        created_at="2026-01-01T00:00:00Z",
        updated_at="2026-01-01T00:00:00Z",
    )
    assert user.is_influencer is False
    assert user.is_verified is False
    assert user.name is None


def test_coupon_create_validation():
    coupon = CouponCreate(
        store_id="uuid-1",
        code="SAVE20",
        discount_type=DiscountType.percentage,
        discount_value=20.0,
        redemption_type=RedemptionType.online,
        expires_at="2026-12-31T00:00:00Z",
    )
    assert coupon.discount_value == 20.0


def test_coupon_create_rejects_zero_discount():
    with pytest.raises(ValidationError):
        CouponCreate(
            store_id="uuid-1",
            code="BAD",
            discount_type=DiscountType.percentage,
            discount_value=0,
            redemption_type=RedemptionType.online,
            expires_at="2026-12-31T00:00:00Z",
        )


def test_coupon_create_rejects_negative_discount():
    with pytest.raises(ValidationError):
        CouponCreate(
            store_id="uuid-1",
            code="BAD",
            discount_type=DiscountType.fixed,
            discount_value=-10,
            redemption_type=RedemptionType.online,
            expires_at="2026-12-31T00:00:00Z",
        )


def test_email_password_auth_rejects_short_password():
    with pytest.raises(ValidationError):
        EmailPasswordAuth(email="test@test.com", password="123")


def test_email_password_auth_valid():
    auth = EmailPasswordAuth(email="test@test.com", password="secure123")
    assert auth.email == "test@test.com"


def test_social_auth_valid_google():
    auth = SocialAuth(provider="google", id_token="token123")
    assert auth.provider == "google"


def test_social_auth_rejects_invalid_provider():
    with pytest.raises(ValidationError):
        SocialAuth(provider="facebook", id_token="token123")


def test_report_create():
    report = ReportCreate(
        coupon_id="uuid-1",
        reason=ReportReason.not_working,
        details="Code doesn't work",
    )
    assert report.reason == ReportReason.not_working


def test_wallet_type_enum():
    assert WalletType.credit_card == "credit_card"
    assert WalletType.club == "club"


def test_discount_type_enum():
    assert DiscountType.percentage == "percentage"
    assert DiscountType.fixed == "fixed"
