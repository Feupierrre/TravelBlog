import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Header from '../components/Header';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import './CreatePostPage.css';
import { API_BASE_URL, MEDIA_URL } from '../config';

const CONTINENTS = [
    'Europe', 'Asia', 'Africa', 'North America', 'South America', 'Oceania', 'Antarctica'
];
const QUILL_MODULES = {
    toolbar: [
        [{ 'header': [1, 2, false] }], 
        ['bold', 'italic', 'underline', 'strike'], 
        [{ 'list': 'ordered'}, { 'list': 'bullet' }],
        ['clean'] 
    ],
};

const CreatePostPage = () => {
    const { slug } = useParams();
    const navigate = useNavigate();
    const isEditMode = !!slug;
    const [loading, setLoading] = useState(isEditMode);
    const [title, setTitle] = useState('');
    const [continent, setContinent] = useState('Europe');
    const [location, setLocation] = useState('');
    const [coverImage, setCoverImage] = useState(null);
    const [coverPreview, setCoverPreview] = useState(null);
    const [blocks, setBlocks] = useState([
        { id: Date.now(), type: 'text', content: '' }
    ]);

    useEffect(() => {
        if (!isEditMode) return;

        const fetchPostData = async () => {
            try {
                const res = await fetch(`${API_BASE_URL}/posts/${slug}`);
                if (!res.ok) throw new Error("Post not found");
                const data = await res.json();
                setTitle(data.title);
                setContinent(data.continent);
                setLocation(data.location_name);
                if (data.cover_image_url) {
                    setCoverPreview(`${MEDIA_URL}${data.cover_image_url}`);
                }
                if (data.blocks && data.blocks.length > 0) {
                    const formattedBlocks = data.blocks.map(block => ({
                        id: block.id || Math.random(),
                        type: block.type,
                        content: block.type === 'text' ? block.text_content : null,
                        existingUrl: block.image_url ? `${MEDIA_URL}${block.image_url}` : null,
                        preview: block.image_url ? `${MEDIA_URL}${block.image_url}` : null
                    }));
                    setBlocks(formattedBlocks);
                } else {
                    setBlocks([{ id: Date.now(), type: 'text', content: '' }]);
                }
            } catch (error) {
                console.error("Error fetching post:", error);
                alert("Error loading post data");
            } finally {
                setLoading(false);
            }
        };

        fetchPostData();
    }, [slug, isEditMode]);

    const handleCoverChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setCoverImage(file);
            setCoverPreview(URL.createObjectURL(file));
        }
    };
    const addBlock = (type) => {
        setBlocks(prev => [...prev, { id: Date.now(), type, content: '' }]);
    };
    const removeBlock = (id) => {
        setBlocks(prev => prev.filter(b => b.id !== id));
    };
    const moveBlock = (index, direction) => {
        setBlocks(prev => {
            const newBlocks = [...prev];
            if (direction === 'up' && index > 0) {
                [newBlocks[index], newBlocks[index - 1]] = [newBlocks[index - 1], newBlocks[index]];
            } else if (direction === 'down' && index < newBlocks.length - 1) {
                [newBlocks[index], newBlocks[index + 1]] = [newBlocks[index + 1], newBlocks[index]];
            }
            return newBlocks;
        });
    };
    const handleBlockChange = (id, value) => {
        setBlocks(prev => prev.map(b => b.id === id ? { ...b, content: value } : b));
    };
    const handleImageBlockChange = (id, file) => {
        if (file) {
            setBlocks(prev => prev.map(b => b.id === id ? { 
                ...b, 
                content: file, 
                preview: URL.createObjectURL(file),
                existingUrl: null
            } : b));
        }
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('accessToken');
        if (!token) {
            alert("Please log in first");
            return;
        }
        const formData = new FormData();
        formData.append('title', title);
        formData.append('continent', continent);
        formData.append('location_name', location);
        if (coverImage) {
            formData.append('cover', coverImage);
        }
        const blocksMeta = [];
        blocks.forEach((block, index) => {
            const blockData = { type: block.type };
            
            if (block.type === 'text') {
                blockData.content = block.content;
            } else if (block.type === 'image') {
                if (block.existingUrl && !block.content) {
                    blockData.existing_url = block.existingUrl;
                }
            }
            blocksMeta.push(blockData);
            if (block.type === 'image' && block.content instanceof File) {
                formData.append(`block_image_${index}`, block.content);
            }
        });
        formData.append('blocks_data', JSON.stringify(blocksMeta));
        const url = isEditMode 
            ? `${API_BASE_URL}/posts/${slug}/update`
            : `${API_BASE_URL}/posts/create`;
        try {
            const res = await fetch(url, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });
            if (res.ok) {
                const data = await res.json();
                navigate(`/post/${data.slug || slug}`);
            } else {
                const errData = await res.json();
                console.error("Submission error:", errData);
                alert("Error saving post");
            }
        } catch (err) {
            console.error(err);
            alert("Something went wrong");
        }
    };

    if (loading) return <div className="loading-screen">Loading...</div>;

    return (
        <div className="create-page-wrapper">
            <Header />
            <div className="editor-container">
                <h1 className="page-header-title">
                    {isEditMode ? 'Edit Story' : 'Write a New Story'}
                </h1>
                <div className="title-underline"></div>
                <form onSubmit={handleSubmit}>
                    <div className="cover-upload-wrapper">
                        <label className="cover-upload-area">
                            {coverPreview ? (
                                <img src={coverPreview} alt="Cover" className="cover-preview-img" />
                            ) : (
                                <div className="cover-placeholder-content">
                                    <span className="material-symbols-outlined" style={{fontSize: '48px'}}>add_photo_alternate</span>
                                    <span>{isEditMode ? 'Change Cover' : 'Add Cover Image'}</span>
                                </div>
                            )}
                            <input type="file" hidden accept="image/*" onChange={handleCoverChange} />
                        </label>
                    </div>
                    <input type="text" placeholder="Title..." className="input-title" value={title} onChange={e => setTitle(e.target.value)} required />
                    <div className="meta-row">
                        <select value={continent} onChange={e => setContinent(e.target.value)} className="select-continent">
                            {CONTINENTS.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                        <input type="text" placeholder="Location..." className="input-location" value={location} onChange={e => setLocation(e.target.value)} required />
                    </div>
                    <div className="blocks-list">
                        {blocks.map((block, index) => (
                            <div key={block.id} className="block-container">
                                <div className="block-header">
                                    <span className="block-number">Block {index + 1}</span>
                                    <div className="block-actions">
                                        <button type="button" onClick={() => moveBlock(index, 'up')} disabled={index === 0} className="btn-icon">↑</button>
                                        <button type="button" onClick={() => moveBlock(index, 'down')} disabled={index === blocks.length - 1} className="btn-icon">↓</button>
                                        <button type="button" onClick={() => removeBlock(block.id)} className="btn-icon btn-delete">×</button>
                                    </div>
                                </div>
                                <div className="block-content-area">
                                    {block.type === 'text' ? (
                                        <div className="quill-wrapper">
                                            <ReactQuill 
                                                theme="snow"
                                                value={block.content || ''}
                                                onChange={(value) => handleBlockChange(block.id, value)}
                                                modules={QUILL_MODULES}
                                                placeholder="Tell your story..."
                                            />
                                        </div>
                                    ) : (
                                        <div className="image-upload-area">
                                            {block.preview ? (
                                                <img src={block.preview} alt="Preview" className="block-img-preview" />
                                            ) : (
                                                <div className="image-placeholder-text">Image</div>
                                            )}
                                            <input type="file" className="file-input-hidden" accept="image/*" onChange={(e) => handleImageBlockChange(block.id, e.target.files[0])} />
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="add-block-buttons">
                        <button type="button" className="btn-add" onClick={() => addBlock('text')}>Add Text</button>
                        <button type="button" className="btn-add" onClick={() => addBlock('image')}>Add Image</button>
                    </div>
                    <div style={{textAlign: 'center', marginTop: '60px'}}>
                        <button type="submit" className="btn-publish">{isEditMode ? 'Save Changes' : 'Publish Story'}</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreatePostPage;