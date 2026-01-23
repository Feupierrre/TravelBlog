from typing import List, Optional
from ninja import NinjaAPI, Schema
from django.shortcuts import get_object_or_404
from .models import Post

api = NinjaAPI()

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