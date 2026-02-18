from ninja_extra import NinjaExtraAPI 
from ninja import Schema, File, Form, UploadedFile
from typing import List, Optional
from django.shortcuts import get_object_or_404
from .models import Post, PostBlock, VisitedCountry, Profile
from django.contrib.auth.models import User
from django.contrib.auth.hashers import make_password
from ninja_jwt.controller import NinjaJWTDefaultController
from ninja_jwt.authentication import JWTAuth
from django.utils.text import slugify
from django.db.models import Q
import uuid
import json
import re

api = NinjaExtraAPI()
api.register_controllers(NinjaJWTDefaultController)


def clean_quill_html(html: str) -> str:
    if not html:
        return html
    html = html.replace('&nbsp;', ' ')
    html = html.replace('\u00a0', ' ')  
    html = re.sub(r'\s*style="[^"]*"', '', html)
    html = html.replace('\u00ad', '').replace('&shy;', '')
    return html


# --- SCHEMAS ---

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


# --- API ENDPOINTS ---

@api.post("/register")
def register(request, payload: RegisterSchema):
    if User.objects.filter(username=payload.username).exists():
        return api.create_response(request, {"message": "Username already taken"}, status=409)
    if User.objects.filter(email=payload.email).exists():
        return api.create_response(request, {"message": "Email already registered"}, status=409)

    user = User.objects.create(
        username=payload.username,
        email = payload.email,
        password = make_password(payload.password)
    )
    return {"id": user.id, "username": user.username, "message": "User created successfully"}


@api.post("/posts/create", auth=JWTAuth())
def create_post(request, payload: PostCreateSchema = Form(...), 
                blocks_data: str = Form(...), 
                cover: UploadedFile = File(None)):
    user = request.auth
    base_slug = slugify(payload.title)
    unique_slug = f"{base_slug}-{str(uuid.uuid4())[:8]}"

    post = Post.objects.create(
        author=user,
        title=payload.title,
        slug=unique_slug,
        location_name=payload.location_name,
        continent=payload.continent, 
        is_published=True
    )
    if cover:
        post.cover_image.save(cover.name, cover)
        post.save()
    try:
        blocks_list = json.loads(blocks_data)
    except json.JSONDecodeError:
        return api.create_response(request, {"message": "Invalid blocks data JSON"}, status=400)

    for index, block_info in enumerate(blocks_list):
        b_type = block_info.get('type')
        
        if b_type == 'text':
            content = block_info.get('content')
            if content:
                PostBlock.objects.create(
                    post=post,
                    type='text',
                    position=index,
                    text_content=clean_quill_html(content)  # ← ФИКС
                )
        elif b_type == 'image':
            file_key = f'block_image_{index}'
            image_file = request.FILES.get(file_key)
            if image_file:
                PostBlock.objects.create(
                    post=post,
                    type='image',
                    position=index,
                    image_content=image_file
                )
    return {"slug": post.slug, "message": "Story published!"}


@api.get("/posts/{slug}", response=PostDetailSchema)
def get_post(request, slug:str):
    post = get_object_or_404(Post, slug=slug)
    
    if not post.is_published:
        if not request.user.is_authenticated or post.author != request.user:
            return api.create_response(request, {"message": "Not found"}, status=404)
    return post


@api.get("/posts", response=List[PostListSchema])
def list_posts(request, continent: str = None, author: str = None):
    posts = Post.objects.filter(is_published=True)
    if continent and continent != 'All':
        posts = posts.filter(continent=continent)
    if author:
        posts = posts.filter(author__username=author)
    return posts.order_by('-created_at')


@api.get("/me", response=UserProfileSchema, auth=JWTAuth())
def me(request):
    user = request.auth
    profile, _ = Profile.objects.get_or_create(user=user)
    return {
        "id": user.id,
        "username": user.username,
        "email": user.email,
        "profile": profile,
        "stories_count": Post.objects.filter(author=user, is_published=True).count(),
        "countries_count": VisitedCountry.objects.filter(user=user).count(),
        "visited_countries": [c.country_code for c in VisitedCountry.objects.filter(user=user)]
    }


@api.post("/me/update", response=UserProfileSchema, auth=JWTAuth())
def update_profile(request, payload: ProfileUpdateSchema = Form(...), avatar: UploadedFile = File(None)):
    user = request.auth
    profile, _ = Profile.objects.get_or_create(user=user)
    if payload.bio is not None:
        profile.bio = payload.bio
    if avatar:
        profile.avatar.save(avatar.name, avatar)
    profile.save()
    return me(request)


@api.post("/countries", auth=JWTAuth())
def toggle_country(request, payload: CountrySchema):
    user = request.auth
    country, created = VisitedCountry.objects.get_or_create(
        user=user, 
        country_code=payload.country_code)
    if not created:
        country.delete()
        return {"status": "removed", "code": payload.country_code}
    return {"status": "added", "code": payload.country_code}


@api.delete("/posts/{slug}", auth=JWTAuth())
def delete_post(request, slug: str):
    post = get_object_or_404(Post, slug=slug)
    
    if post.author != request.auth:
        return api.create_response(request, {"message": "Forbidden"}, status=403)
        
    post.delete()
    return {"success": True}


@api.post("/posts/{slug}/update", auth=JWTAuth())
def update_post(request, slug: str, payload: PostCreateSchema = Form(...), 
                blocks_data: str = Form(...), 
                cover: UploadedFile = File(None)):
    post = get_object_or_404(Post, slug=slug)
    if post.author != request.auth:
        return api.create_response(request, {"message": "Forbidden"}, status=403)
    post.title = payload.title
    post.location_name = payload.location_name
    post.continent = payload.continent
    if cover:
        post.cover_image.save(cover.name, cover)
    post.save()
    existing_images = {}
    for block in post.blocks.filter(type='image'):
        if block.image_content:
            try:
                existing_images[block.image_content.url] = block.image_content
            except:
                pass
    PostBlock.objects.filter(post=post).delete() 
    try:
        blocks_list = json.loads(blocks_data)
    except json.JSONDecodeError:
        return api.create_response(request, {"message": "Invalid blocks data"}, status=400)
    for index, block_info in enumerate(blocks_list):
        b_type = block_info.get('type')
        
        if b_type == 'text':
            content = block_info.get('content')
            if content:
                PostBlock.objects.create(
                    post=post,
                    type='text',
                    position=index,
                    text_content=clean_quill_html(content)  # ← ФИКС
                )
        elif b_type == 'image':
            file_key = f'block_image_{index}'
            image_file = request.FILES.get(file_key)
            existing_url = block_info.get('existing_url')
            if image_file:
                PostBlock.objects.create(
                    post=post,
                    type='image',
                    position=index,
                    image_content=image_file
                )
            elif existing_url:
                matched_file = None                
                for url_key, file_obj in existing_images.items():
                    if url_key in existing_url or existing_url in url_key:
                        matched_file = file_obj
                        break
                if matched_file:
                    new_block = PostBlock(post=post, type='image', position=index)
                    new_block.image_content = matched_file
                    new_block.save()

    return {"slug": post.slug, "message": "Story updated!"}


@api.get("/users/{username}", response=PublicProfileSchema)
def get_user_profile(request, username: str):
    user = get_object_or_404(User, username=username)
    profile = Profile.objects.filter(user=user).first()
    stories_count = Post.objects.filter(author=user, is_published=True).count()
    countries_count = VisitedCountry.objects.filter(user=user).count()
    visited_countries_list = [c.country_code for c in VisitedCountry.objects.filter(user=user)]
    return {
        "username": user.username,
        "profile": profile,  
        "stories_count": stories_count,
        "countries_count": countries_count,
        "visited_countries": visited_countries_list
    }


@api.get("/my-posts", response=List[PostListSchema], auth=JWTAuth())
def my_posts(request):
    return Post.objects.filter(author=request.auth).order_by('-created_at')