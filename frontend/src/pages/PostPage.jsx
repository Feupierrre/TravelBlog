import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";

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

    if (isLoading) return <div className="container" style={{ padding: '40px', textAlign: 'center' }}>Loading article... ⏳</div>;
    if (!post) return <div className="container" style={{ padding: '40px', textAlign: 'center' }}>Post not found 😢</div>;

    return (
        <div className="container" style={{ padding: '40px 20px' }}>
            
            <Link to="/" style={{ color: 'var(--color-text-muted)', textDecoration: 'none', marginBottom: '20px', display: 'inline-block' }}>
                ← Back to list
            </Link>

            <h1 style={{ fontSize: '3rem', marginBottom: '15px' }}>{post.title}</h1>
            
            <p style={{ color: 'var(--color-text-muted)', marginBottom: '30px', fontSize: '1.1rem' }}>
                📍 {post.location_name} • ✍️ {post.author} • 📅 {post.created_at}
            </p>

            {post.cover_image_url && (
                <img 
                    src={`http://127.0.0.1:8000${post.cover_image_url}`} 
                    alt={post.title} 
                    style={{ width: '100%', borderRadius: 'var(--radius-lg)', marginBottom: '40px' }}
                />
            )}

            <div style={{ lineHeight: '1.8', fontSize: '1.2rem', color: 'var(--color-text-main)', maxWidth: '800px', margin: '0 auto' }}>
                {post.blocks.map((block, index) => {
                    if (block.type === "text") {
                        return (
                            <p key={index} style={{ marginBottom: '24px' }}>
                                {block.text_content}
                            </p>
                        );
                    }
                    if (block.type === "image") {
                        return (
                            <img 
                                key={index}
                                src={`http://127.0.0.1:8000${block.image_url}`}
                                alt="Illustration"
                                style={{ width: '100%', borderRadius: 'var(--radius-md)', margin: '40px 0' }}
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