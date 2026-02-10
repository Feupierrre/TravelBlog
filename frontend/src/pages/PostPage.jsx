import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import Header from '../components/Header';
import './PostPage.css';

const PostPage = () => {
    const { slug } = useParams();
    const [post, setPost] = useState(null);
    const [loading, setLoading] = useState(true);
    const currentUser = localStorage.getItem('username');

    useEffect(() => {
        window.scrollTo(0, 0);   
        setLoading(true);
        fetch(`http://127.0.0.1:8000/api/posts/${slug}`)
            .then(res => {
                if (!res.ok) throw new Error('Not found');
                return res.json();
            })
            .then(data => {
                setPost(data);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    }, [slug]);

    if (loading) return <div style={{height: '100vh', background: '#FFF'}}></div>;
    if (!post) return <div style={{padding: '100px', textAlign: 'center'}}>Post not found</div>;

    const isAuthor = currentUser === post.author;

    return (
        <div className="post-page">
            <Header />
            <div className="post-hero">
                {post.cover_image_url ? (
                    <img src={`http://127.0.0.1:8000${post.cover_image_url}`} alt={post.title} className="post-hero-bg" />
                ) : (
                    <div className="post-hero-bg" style={{background: '#222'}}></div>
                )}
                <div className="post-hero-overlay"></div>
                <div className="post-hero-content">
                    {post.continent && (
                        <span className="post-continent-badge">{post.continent}</span>
                    )}
                    <h1 className="post-title">{post.title}</h1>
                    <div className="post-meta">
                        <span>{post.location_name}</span>
                        <span>•</span>
                        <span>{post.created_at}</span>
                    </div>

                    {isAuthor && (
                        <Link to={`/edit/${post.slug}`} className="btn-edit-post">
                            <span className="material-symbols-outlined" style={{fontSize: '18px'}}>edit</span>
                            Edit Story
                        </Link>
                    )}
                </div>
            </div>
            
            <div className="post-content-container">
                {post.blocks.map((block) => (
                    <div key={block.id || Math.random()} className="content-block">
                        {block.type === 'text' && (
                            <div className="text-block">
                                {block.text_content}
                            </div>
                        )}
                        {block.type === 'image' && block.image_url && (
                            <div className="image-block">
                                <img 
                                    src={`http://127.0.0.1:8000${block.image_url}`} 
                                    alt="Story moment" 
                                    className="post-image"
                                />
                            </div>
                        )}
                    </div>
                ))}
                <div className="author-box">
                    <div style={{
                        width: '70px', height: '70px', background: '#F0F0F0', borderRadius: '50%', 
                        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.8rem', fontWeight: 'bold', color: '#888'
                    }}>
                        {post.author.charAt(0).toUpperCase()}
                    </div>
                    <div>
                        <div style={{fontSize: '0.8rem', textTransform: 'uppercase', color: '#999', fontWeight: '700', letterSpacing: '1px'}}>Written by</div>
                        <div style={{fontSize: '1.4rem', fontWeight: '800', color: '#1A1A1A'}}>{post.author}</div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PostPage;