from ninja import Schema
from typing import List, Optional


class PostCreateSchema(Schema):
    title: str
    location_name: str
    continent: str


class PostBlockSchema(Schema):
    type: str
    position: int
    text_content: Optional[str] = None
    image_url: Optional[str] = None

    @staticmethod
    def resolve_image_url(obj):
        if obj.image_content:
            return obj.image_content.url
        return None


class PostDetailSchema(Schema):
    id: int
    title: str
    slug: str
    author: str
    location_name: str
    continent: str
    cover_image_url: Optional[str] = None
    created_at: str
    blocks: List[PostBlockSchema]
    author_avatar_url: Optional[str] = None

    @staticmethod
    def resolve_author(obj):
        return obj.author.username

    @staticmethod
    def resolve_cover_image_url(obj):
        if obj.cover_image:
            return obj.cover_image.url
        return None

    @staticmethod
    def resolve_created_at(obj):
        return obj.created_at.strftime("%d %B %Y")

    @staticmethod
    def resolve_author_avatar_url(obj):
        if hasattr(obj.author, 'profile') and obj.author.profile.avatar:
            return obj.author.profile.avatar.url
        return None


class PostListSchema(Schema):
    id: int
    title: str
    slug: str
    author: str
    location_name: str
    continent: str
    cover_image_url: Optional[str] = None
    created_at: str

    @staticmethod
    def resolve_author(obj):
        return obj.author.username

    @staticmethod
    def resolve_cover_image_url(obj):
        if obj.cover_image:
            return obj.cover_image.url
        return None

    @staticmethod
    def resolve_created_at(obj):
        return obj.created_at.strftime("%d %B %Y")


class RegisterSchema(Schema):
    username: str
    email: str
    password: str


class CountrySchema(Schema):
    country_code: str


class UserProfileSchema(Schema):
    id: int
    username: str
    email: str
    avatar_url: Optional[str] = None
    bio: Optional[str] = None
    stories_count: int
    countries_count: int
    visited_countries: List[str]

    @staticmethod
    def resolve_avatar_url(obj):
        profile = None
        if isinstance(obj, dict):
            profile = obj.get('profile')
        elif hasattr(obj, 'profile'):
            profile = obj.profile
        if profile and profile.avatar:
            return profile.avatar.url
        return None

    @staticmethod
    def resolve_bio(obj):
        profile = None
        if isinstance(obj, dict):
            profile = obj.get('profile')
        elif hasattr(obj, 'profile'):
            profile = obj.profile
        if profile and profile.bio:
            return profile.bio
        return ""


class ProfileUpdateSchema(Schema):
    bio: Optional[str] = None


class PublicProfileSchema(Schema):
    username: str
    avatar_url: Optional[str] = None
    bio: Optional[str] = None
    stories_count: int
    countries_count: int
    visited_countries: List[str]

    @staticmethod
    def resolve_avatar_url(obj):
        profile = obj.get('profile') if isinstance(obj, dict) else getattr(obj, 'profile', None)
        if profile and hasattr(profile, 'avatar') and profile.avatar:
            return profile.avatar.url
        return None

    @staticmethod
    def resolve_bio(obj):
        profile = obj.get('profile') if isinstance(obj, dict) else getattr(obj, 'profile', None)
        if profile and hasattr(profile, 'bio') and profile.bio:
            return profile.bio
        return ""