from ninja import Router, File, Form, UploadedFile
from ninja_jwt.authentication import JWTAuth
from django.shortcuts import get_object_or_404
from django.contrib.auth.models import User
from django.contrib.auth.hashers import make_password
from typing import List

from ..models import Post, VisitedCountry, Profile
from ..schemas import RegisterSchema, UserProfileSchema, ProfileUpdateSchema, PublicProfileSchema

router = Router()


@router.post("/register")
def register(request, payload: RegisterSchema):
    if User.objects.filter(username=payload.username).exists():
        return {"error": "Username already taken"}
    if User.objects.filter(email=payload.email).exists():
        return {"error": "Email already registered"}

    user = User.objects.create(
        username=payload.username,
        email=payload.email,
        password=make_password(payload.password)
    )
    return {"id": user.id, "username": user.username, "message": "User created successfully"}


@router.get("/me", response=UserProfileSchema, auth=JWTAuth())
def me(request):
    user = request.auth
    profile, _ = Profile.objects.get_or_create(user=user)

    visited_countries = list(
        VisitedCountry.objects
            .filter(user=user)
            .values_list('country_code', flat=True)
    )
    return {
        "id": user.id,
        "username": user.username,
        "email": user.email,
        "profile": profile,
        "stories_count": Post.objects.filter(author=user, is_published=True).count(),
        "countries_count": len(visited_countries),
        "visited_countries": visited_countries,
    }


@router.post("/me/update", response=UserProfileSchema, auth=JWTAuth())
def update_profile(request, payload: ProfileUpdateSchema = Form(...), avatar: UploadedFile = File(None)):
    user = request.auth
    profile, _ = Profile.objects.get_or_create(user=user)
    if payload.bio is not None:
        profile.bio = payload.bio
    if avatar:
        profile.avatar.save(avatar.name, avatar)
    profile.save()
    return me(request)


@router.get("/users/{username}", response=PublicProfileSchema)
def get_user_profile(request, username: str):
    user = get_object_or_404(
        User.objects.select_related('profile'),
        username=username
    )
    profile = getattr(user, 'profile', None)

    visited_countries = list(
        VisitedCountry.objects
            .filter(user=user)
            .values_list('country_code', flat=True)
    )
    return {
        "username": user.username,
        "profile": profile,
        "stories_count": Post.objects.filter(author=user, is_published=True).count(),
        "countries_count": len(visited_countries),
        "visited_countries": visited_countries,
    }