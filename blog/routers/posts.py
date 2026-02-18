from ninja import Router, File, Form, UploadedFile
from ninja_jwt.authentication import JWTAuth
from django.shortcuts import get_object_or_404
from typing import List, Optional
from django.utils.text import slugify
import logging
import uuid
import json

from ..models import Post, PostBlock
from ..schemas import PostCreateSchema, PostDetailSchema, PostListSchema
from ..utils import clean_quill_html

logger = logging.getLogger(__name__)

router = Router()

# 1. Сначала идут специфичные маршруты

@router.post("/create", auth=JWTAuth())
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
        return {"error": "Invalid blocks data JSON"}

    for index, block_info in enumerate(blocks_list):
        b_type = block_info.get('type')
        if b_type == 'text':
            content = block_info.get('content')
            if content:
                PostBlock.objects.create(
                    post=post,
                    type='text',
                    position=index,
                    text_content=clean_quill_html(content)
                )
        elif b_type == 'image':
            image_file = request.FILES.get(f'block_image_{index}')
            if image_file:
                PostBlock.objects.create(
                    post=post,
                    type='image',
                    position=index,
                    image_content=image_file
                )
    return {"slug": post.slug, "message": "Story published!"}


# ВАЖНО: Эта функция перемещена СЮДА (выше get_post), 
# чтобы маршрут /{slug} не перехватывал запрос "my-posts"
@router.get("/my-posts", response=List[PostListSchema], auth=JWTAuth())
def my_posts(request):
    return Post.objects.filter(author=request.auth).order_by('-created_at')


# 2. Затем идут универсальные маршруты (slug)

@router.get("/{slug}", response=PostDetailSchema)
def get_post(request, slug: str):
    post = get_object_or_404(
        Post.objects
            .select_related('author', 'author__profile')
            .prefetch_related('blocks'),
        slug=slug
    )
    if not post.is_published:
        if not request.user.is_authenticated or post.author != request.user:
            return {"error": "Not found"}
    return post


@router.get("", response=List[PostListSchema])
def list_posts(request, continent: str = None, author: str = None):
    posts = (
        Post.objects
            .filter(is_published=True)
            .select_related('author')
    )
    if continent and continent != 'All':
        posts = posts.filter(continent=continent)
    if author:
        posts = posts.filter(author__username=author)
    return posts.order_by('-created_at')


@router.delete("/{slug}", auth=JWTAuth())
def delete_post(request, slug: str):
    post = get_object_or_404(Post.objects.select_related('author'), slug=slug)
    if post.author != request.auth:
        return {"error": "Forbidden"}
    post.delete()
    return {"success": True}


@router.post("/{slug}/update", auth=JWTAuth())
def update_post(request, slug: str, payload: PostCreateSchema = Form(...),
                blocks_data: str = Form(...),
                cover: UploadedFile = File(None)):
    post = get_object_or_404(
        Post.objects.select_related('author').prefetch_related('blocks'),
        slug=slug
    )
    if post.author != request.auth:
        return {"error": "Forbidden"}

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
            except Exception as e:
                logger.warning(f"Could not get image URL for block {block.id}: {e}")

    PostBlock.objects.filter(post=post).delete()

    try:
        blocks_list = json.loads(blocks_data)
    except json.JSONDecodeError:
        return {"error": "Invalid blocks data"}

    for index, block_info in enumerate(blocks_list):
        b_type = block_info.get('type')
        if b_type == 'text':
            content = block_info.get('content')
            if content:
                PostBlock.objects.create(
                    post=post,
                    type='text',
                    position=index,
                    text_content=clean_quill_html(content)
                )
        elif b_type == 'image':
            image_file = request.FILES.get(f'block_image_{index}')
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