from django.contrib import admin
from .models import Post, PostBlock

class PostBlockInline(admin.TabularInline):
    model = PostBlock
    extra = 1 
    fields = ('position', 'type', 'text_content', 'image_content', 'image_caption')
    ordering = ('position',)

@admin.register(Post)
class PostAdmin(admin.ModelAdmin):
    list_display = ('title', 'author', 'created_at', 'is_published')
    prepopulated_fields = {'slug': ('title',)} 
    inlines = [PostBlockInline] 