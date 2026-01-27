import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import './PostPage.css'; // <--- 1. Подключаем стили

const PostPage = () => {
    const { slug } = useParams();
    const [post, setPost] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetch(`http://127.0.0.1:8000/api/posts/${slug}`)
            .then((res) => {
                if (!res.ok) throw new Error("Пост не найден");
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

    if (isLoading) return <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Загрузка истории... 🌿</div>;
    if (!post) return <div className="container" style={{ padding: '40px' }}>Пост не найден 😢</div>;

    return (
        <article>
            {/* 1. HEADER С ПАРАЛЛАКСОМ */}
            <div className="post-header">
                {/* Фоновая картинка */}
                <div 
                    className="post-bg" 
                    style={{ backgroundImage: post.cover_image_url ? `url(http://127.0.0.1:8000${post.cover_image_url})` : 'none' }}
                ></div>
                
                {/* Затемнение */}
                <div className="post-overlay"></div>

                {/* Заголовок поверх картинки */}
                <div className="post-title-container">
                    <span className="post-meta-tag">Travel Story</span>
                    <h1 className="post-title">{post.title}</h1>
                    <div className="post-info">
                        <span>📍 {post.location_name}</span>
                        <span>•</span>
                        <span>✍️ {post.author}</span>
                        <span>•</span>
                        <span>📅 {post.created_at}</span>
                    </div>
                </div>
            </div>

            {/* 2. ТЕКСТ СТАТЬИ */}
            <div className="container">
                <div className="post-content">
                    
                    {/* Кнопка назад (маленькая сверху) */}
                    <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', fontSize: '0.9rem', color: 'var(--color-text-muted)', marginBottom: '30px' }}>
                        <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>arrow_back</span>
                        Back to Journal
                    </Link>

                    {post.blocks.map((block, index) => {
                        if (block.type === "text") {
                            return (
                                <p key={index}>
                                    {block.text_content}
                                </p>
                            );
                        }
                        if (block.type === "image") {
                            return (
                                <img 
                                    key={index}
                                    src={`http://127.0.0.1:8000${block.image_url}`}
                                    alt="Detail"
                                    className="post-image"
                                />
                            );
                        }
                        return null;
                    })}

                    <div style={{ marginTop: '60px', paddingTop: '20px', borderTop: '1px solid var(--color-border)', color: 'var(--color-text-muted)', fontStyle: 'italic' }}>
                        Written by {post.author}
                    </div>
                </div>
            </div>
        </article>
    );
};

export default PostPage;