import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import Header from '../components/Header';
import { API_BASE_URL, MEDIA_URL } from '../config';
import './PostPage.css';

const PostPage = () => {
    const { slug } = useParams();
    const [post, setPost] = useState(null);
    const [loading, setLoading] = useState(true);
    const currentUser = localStorage.getItem('username');

    useEffect(() => {
        window.scrollTo(0, 0);   
        setLoading(true);
        fetch(`${API_BASE_URL}/posts/${slug}`)
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

    if (loading) return <div className="post-loading-screen"></div>;
    if (!post) return <div className="post-not-found">Post not found</div>;
    const isAuthor = currentUser === post.author;

    return (
        <div className="post-page">
            <Header />
            <div className="post-hero">
                {post.cover_image_url ? (
                    <img 
                        src={`${MEDIA_URL}${post.cover_image_url}`} 
                        alt={post.title} 
                        className="post-hero-bg" 
                    />
                ) : (
                    <div className="post-hero-bg post-hero-bg-placeholder"></div>
                )}
                <div className="post-hero-overlay"></div>
                <div className="post-hero-content">
                    {post.continent && (
                        <span className="post-continent-badge">{post.continent}</span>
                    )}
                    <h1 className="post-title">{post.title}</h1>
                    
                    <div className="post-meta">
                        <Link to={`/user/${post.author}`} className="post-author-link">
                            By @{post.author}
                        </Link>
                        <span className="post-meta-separator">•</span>
                        <span>{post.location_name}</span>
                        <span className="post-meta-separator">•</span>
                        <span>{post.created_at}</span>
                    </div>
                    {isAuthor && (
                        <Link to={`/edit/${post.slug}`} className="btn-edit-post">
                            <span className="material-symbols-outlined edit-icon">edit</span>
                            Edit Story
                        </Link>
                    )}
                </div>
            </div>
            <div className="post-content-container">
                {post.blocks.map((block) => (
                    <div key={block.id || Math.random()} className="content-block">
                        
                        {block.type === 'text' && (
                            <div 
                                className="text-block" 
                                dangerouslySetInnerHTML={{ __html: block.text_content }}
                            />
                        )}
                        {block.type === 'image' && (block.image_url || block.image_content) && (
                            <div className="image-block">
                                <img 
                                    src={block.image_url ? `${MEDIA_URL}${block.image_url}` : `${MEDIA_URL}${block.image_content}`} 
                                    alt="Story moment" 
                                    className="post-image"
                                />
                            </div>
                        )}
                    </div>
                ))}
                <Link to={`/user/${post.author}`} className="author-box">
                    <div className="author-avatar-wrapper">
                        {post.author_avatar_url ? (
                            <img 
                                src={`${MEDIA_URL}${post.author_avatar_url}`} 
                                alt={post.author} 
                                className="author-avatar-img"
                            />
                        ) : (
                            post.author.charAt(0).toUpperCase()
                        )}
                    </div>
                    <div className="author-info">
                        <div className="author-label">Written by</div>
                        <div className="author-name">@{post.author}</div>
                    </div>
                </Link>
            </div>
        </div>
    );
};

export default PostPage;