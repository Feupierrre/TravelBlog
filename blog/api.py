from ninja_extra import NinjaExtraAPI 
from ninja import Schema
from typing import List, Optional
from django.shortcuts import get_object_or_404
from .models import Post, PostBlock
from django.contrib.auth.models import User
from django.contrib.auth.hashers import make_password
from ninja_jwt.controller import NinjaJWTDefaultController
from ninja_jwt.authentication import JWTAuth

api = NinjaExtraAPI()
api.register_controllers(NinjaJWTDefaultController)

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
    cover_image_url: Optional[str] = None
    created_at: str
    blocks: List[PostBlockSchema]

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

@api.get("/posts/{slug}", response=PostDetailSchema)
def get_post(request, slug:str):
    post = get_object_or_404(Post, slug=slug, is_published=True)
    return post

class PostListSchema(Schema):
    id: int
    title: str
    slug: str
    author: str
    location_name: str
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

@api.get("/posts", response=List[PostListSchema])
def list_posts(request):
    return Post.objects.filter(is_published=True)

class RegisterSchema(Schema):
    username: str
    email: str
    password: str

@api.post("/register")
def register(request, payload: RegisterSchema):
    if User.objects.filter(username=payload.username).exists():
        return api.create_response(request, {"message": "Username already taken"}, status=409)
    
    user = User.objects.create(
        username=payload.username,
        email = payload.email,
        password = make_password(payload.password)
    )

    return {"id": user.id, "username": user.username, "message": "User created successfully"}

@api.get("/me", auth=JWTAuth())
def me(request):
    return {
        "username": request.auth.username,
        "email": request.auth.email
    }