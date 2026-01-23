from django.db import models
from django.contrib.auth.models import User

class Post(models.Model):
    title = models.CharField("Heading", max_length=200)
    slug = models.SlugField(unique=True, help_text="Post URL (Example: bali-trip)")
    author = models.ForeignKey(User, on_delete=models.CASCADE, verbose_name="Автор")

    cover_image = models.ImageField("Cover", upload_to='covers/', blank=True, null=True)
    location_name = models.CharField("Location", max_length=100, help_text="Example: Bali, Indonesia")

    created_at = models.DateTimeField("Created date", auto_now_add=True)
    is_published = models.BooleanField("Published", default=False)

    def __str__(self):
        return self.title

    class Meta:
        verbose_name = "Post"
        verbose_name_plural = "Posts"
        ordering = ['-created_at']

class PostBlock(models.Model):

    BLOCK_TYPES = [
        ('text', 'Text (Markdown)'),
        ('image', 'Image'),
    ]
    
    post = models.ForeignKey(Post, related_name='blocks', on_delete=models.CASCADE)
    
    type = models.CharField("Block Type", max_length=10, choices=BLOCK_TYPES)
    position = models.PositiveIntegerField("Serial Number", default=0)
    
    text_content = models.TextField("Text", blank=True, null=True, help_text="Supports Markdown")
    image_content = models.ImageField("Image", upload_to='post_images/', blank=True, null=True)
    image_caption = models.CharField("Photo Caption", max_length=200, blank=True)

    class Meta:
        verbose_name = "Content block"
        verbose_name_plural = "Content blocks"
        ordering = ['position']