import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import './CreatePostPage.css';

const CONTINENTS = [
    'Europe', 'Asia', 'Africa', 'North America', 'South America', 'Oceania', 'Antarctica'
];

const CreatePostPage = () => {
    const navigate = useNavigate();
    const [title, setTitle] = useState('');
    const [locationName, setLocationName] = useState('');
    const [continent, setContinent] = useState('Europe'); 
    const [coverImage, setCoverImage] = useState(null);
    const [coverPreview, setCoverPreview] = useState(null);
    
    const [blocks, setBlocks] = useState([
        { id: 1, type: 'text', content: '' }, 
        { id: 2, type: 'image', file: null, preview: null }
    ]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const addTextBlock = () => {
        setBlocks([...blocks, { id: Date.now(), type: 'text', content: '' }]);
    };

    const addImageBlock = () => {
        setBlocks([...blocks, { id: Date.now(), type: 'image', file: null, preview: null }]);
    };

    const updateTextBlock = (id, text) => {
        setBlocks(blocks.map(b => b.id === id ? { ...b, content: text } : b));
    };

    const updateImageBlock = (id, file) => {
        const previewUrl = URL.createObjectURL(file);
        setBlocks(blocks.map(b => b.id === id ? { ...b, file: file, preview: previewUrl } : b));
    };

    const removeImageFromBlock = (id, e) => {
        e.stopPropagation();
        setBlocks(blocks.map(b => b.id === id ? { ...b, file: null, preview: null } : b));
    };

    const removeBlock = (id) => {
        setBlocks(blocks.filter(b => b.id !== id));
    };

    const handleCoverChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setCoverImage(file);
            setCoverPreview(URL.createObjectURL(file));
        }
    };

    const handlePublish = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        const formData = new FormData();
        formData.append('title', title);
        formData.append('location_name', locationName);
        formData.append('continent', continent); 
        if (coverImage) formData.append('cover', coverImage);
        blocks.forEach((block, index) => {
            formData.append(`block_${index}_type`, block.type);
            if (block.type === 'text') {
                formData.append(`block_${index}_content`, block.content);
            } else if (block.type === 'image' && block.file) {
                formData.append(`block_${index}_image`, block.file);
            }
        });

        const token = localStorage.getItem('accessToken');
        
        try {
            const res = await fetch('http://127.0.0.1:8000/api/posts/create', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` },
                body: formData
            });

            if (res.ok) {
                const data = await res.json();
                navigate(`/post/${data.slug}`);
            } else {
                alert('Error publishing story');
            }
        } catch (err) {
            console.error(err);
            alert('Something went wrong');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="editor-container">
            <Header />

            <form onSubmit={handlePublish} className="editor-form">
                
                <h1 className="page-header-title">Write a New Story ✍️</h1>
                <div className="title-underline"></div>

                <div className="cover-upload-wrapper">
                    <div 
                        className={`cover-upload-area ${coverPreview ? 'has-image' : ''}`}
                        onClick={() => document.getElementById('coverInput').click()}
                    >
                        <input id="coverInput" type="file" hidden accept="image/*" onChange={handleCoverChange} />
                        
                        {coverPreview ? (
                            <img src={coverPreview} alt="Cover" className="cover-preview" />
                        ) : (
                            <div className="cover-placeholder">
                                <span className="material-symbols-outlined cover-icon">add_photo_alternate</span>
                                <span className="cover-text">Add a cover image</span>
                            </div>
                        )}
                    </div>
                </div>

                <div className="editor-meta-card">
                    <input 
                        type="text" 
                        className="editor-title"
                        placeholder="Story Title..."
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        required
                    />
                    <div className="meta-row">
                        <input 
                            type="text" 
                            className="location-input"
                            placeholder="📍 Add location (e.g. Paris, France)"
                            value={locationName}
                            onChange={(e) => setLocationName(e.target.value)}
                            required
                        />
                        <select 
                            className="continent-select"
                            value={continent}
                            onChange={(e) => setContinent(e.target.value)}
                        >
                            {CONTINENTS.map(c => (
                                <option key={c} value={c}>{c}</option>
                            ))}
                        </select>
                    </div>
                </div>
                <div className="editor-blocks">
                    {blocks.map((block, index) => (
                        <div key={block.id} className="editor-block">
                            <span className="block-number">{index + 1 < 10 ? `0${index + 1}` : index + 1}</span>
                            <button 
                                type="button" 
                                className="btn-remove-block"
                                onClick={() => removeBlock(block.id)}
                                title="Remove block"
                            >
                                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>close</span>
                            </button>
                            {block.type === 'text' && (
                                <textarea 
                                    className="editor-textarea"
                                    placeholder="Type something here..."
                                    value={block.content}
                                    onChange={(e) => updateTextBlock(block.id, e.target.value)}
                                    rows={4}
                                />
                            )}
                            {block.type === 'image' && (
                                <div 
                                    className={`editor-image-upload ${block.preview ? 'has-image' : ''}`}
                                    onClick={() => !block.preview && document.getElementById(`fileInput-${block.id}`).click()}
                                >
                                    <input 
                                        id={`fileInput-${block.id}`}
                                        type="file" accept="image/*" hidden
                                        onChange={(e) => {
                                            if (e.target.files[0]) updateImageBlock(block.id, e.target.files[0]);
                                            e.target.value = null; 
                                        }} 
                                    />
                                    {block.preview ? (
                                        <>
                                            <img src={block.preview} alt="preview" className="editor-img-preview" />
                                            <button 
                                                type="button" 
                                                className="btn-remove-image-inside"
                                                onClick={(e) => removeImageFromBlock(block.id, e)}
                                            >
                                                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>close</span>
                                            </button>
                                        </>
                                    ) : (
                                        <div className="image-upload-placeholder">
                                            <span className="material-symbols-outlined placeholder-icon">add_photo_alternate</span>
                                            <div className="placeholder-text">Click to upload</div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
                <div className="editor-controls">
                    <button type="button" className="btn-add-block" onClick={addTextBlock}>
                        <span className="material-symbols-outlined">text_fields</span> Add Text
                    </button>
                    <button type="button" className="btn-add-block" onClick={addImageBlock}>
                        <span className="material-symbols-outlined">image</span> Add Image
                    </button>
                </div>
                <div className="editor-footer">
                    <div className="footer-pill">
                        <span>Ready to share?</span>
                        <button type="submit" className="btn-publish" disabled={isSubmitting}>
                            {isSubmitting ? 'Publishing...' : 'Publish Story'}
                        </button>
                    </div>
                </div>

            </form>
        </div>
    );
};

export default CreatePostPage;