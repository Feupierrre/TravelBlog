import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom"; // useParams нужен, чтобы читать slug из адреса

const PostPage = () => {
    // 1. Достаем slug из URL (например, "odesa" или "my-travel")
    const { slug } = useParams();

    // 2. Состояние для данных и загрузки
    const [post, setPost] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetch(`http://127.0.0.1:8000/api/posts/${slug}`)
            .then((res) => {
                if (!res.ok) {
                    throw new Error("Пост не найден");
                }
                return res.json();
            })
            .then((data) => {
                setPost(data);
                setIsLoading(false);
            })
            .catch((err) => {
                console.error(err);
                setIsLoading(false);
            });
    }, [slug]); 
    if (isLoading) return <div style={{ padding: '40px', textAlign: 'center' }}>Загрузка статьи... ⏳</div>;
    if (!post) return <div style={{ padding: '40px', textAlign: 'center' }}>Пост не найден 😢</div>;
    return (
        <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px', fontFamily: 'sans-serif' }}>
            <Link to="/" style={{ color: '#666', textDecoration: 'none', marginBottom: '20px', display: 'inline-block' }}>
                ← Назад к списку
            </Link>

            <h1 style={{ fontSize: '3rem', marginBottom: '10px' }}>{post.title}</h1>
            <p style={{ color: 'grey', marginBottom: '20px' }}>
                📍 {post.location_name} • ✍️ {post.author} • 📅 {post.created_at}
            </p>

            {post.cover_image_url && (
                <img 
                    src={`http://127.0.0.1:8000${post.cover_image_url}`} 
                    alt={post.title} 
                    style={{ width: '100%', borderRadius: '10px', marginBottom: '40px' }}
                />
            )}

            <div style={{ lineHeight: '1.6', fontSize: '1.2rem', color: '#333' }}>
                {post.blocks.map((block) => {
                    
                    if (block.type === "text") {
                        return (
                            <p key={block.position} style={{ marginBottom: '20px' }}>
                                {block.text_content}
                            </p>
                        );
                    }

                    if (block.type === "image") {
                        return (
                            <img 
                                key={block.position}
                                src={`http://127.0.0.1:8000${block.image_url}`}
                                alt="Illustration"
                                style={{ width: '100%', borderRadius: '8px', margin: '20px 0' }}
                            />
                        );
                    }

                    return null;
                })}
            </div>
        </div>
    );
};

export default PostPage;