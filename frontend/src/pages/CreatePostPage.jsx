import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './CreatePostPage.css';

const CreatePostPage = () => {
    const navigate = useNavigate();
    const [title, setTitle] = useState('');
    const [locationName, setLocationName] = useState('');
    const [coverFile, setCoverFile] = useState(null);
    const [coverPreview, setCoverPreview] = useState(null);
    
    const [blocks, setBlocks] = useState([
        { id: Date.now(), type: 'text', value: '' } 
    ]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const addTextBlock = () => {
        setBlocks([...blocks, { id: Date.now(), type: 'text', value: '' }]);
    };
    const addImageBlock = () => {
        setBlocks([...blocks, { id: Date.now(), type: 'image', file: null, preview: null }]);
    };
    const updateTextBlock = (id, text) => {
        setBlocks(blocks.map(b => b.id === id ? { ...b, value: text } : b));
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
    const autoResize = (e) => {
        e.target.style.height = 'auto';
        e.target.style.height = e.target.scrollHeight + 'px';
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        const token = localStorage.getItem('accessToken');
        const formData = new FormData();
        formData.append('title', title);
        formData.append('location_name', locationName);
        if (coverFile) formData.append('cover', coverFile);
        blocks.forEach((block, index) => {
            if (block.type === 'text') {
                formData.append(`block_${index}_text`, block.value);
            } else if (block.type === 'image' && block.file) {
                formData.append(`block_${index}_image`, block.file);
            }
        });
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
                alert("Error creating post. Please check fields.");
            }
        } catch (err) {
            console.error(err);
            alert("Network error");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div style={{ minHeight: '100vh', backgroundColor: '#F2F4F2' }}>
            <div className="create-container">
                <h1 className="page-header-title">Write a New Story ✍️</h1>
                <form onSubmit={handleSubmit}>
                    <div 
                        className="editor-cover-upload"
                        style={coverPreview ? { backgroundImage: `url(${coverPreview})` } : {}}
                        onClick={() => document.getElementById('coverInput').click()}
                    >
                        {!coverPreview && (
                            <div className="cover-placeholder">
                                <span className="material-symbols-outlined" style={{ fontSize: '32px' }}>add_photo_alternate</span>
                                <span>Add a cover image</span>
                            </div>
                        )}
                        <input id="coverInput" type="file" hidden accept="image/*" onChange={e => {
                            if(e.target.files[0]) {
                                setCoverFile(e.target.files[0]);
                                setCoverPreview(URL.createObjectURL(e.target.files[0]));
                            }
                        }} />
                    </div>
                    <div className="meta-card">
                        <input 
                            type="text" 
                            className="editor-title"
                            value={title} 
                            onChange={e => setTitle(e.target.value)}
                            placeholder="Story Title..." 
                            required
                        />
                        <div style={{ position: 'relative' }}>
                            <span style={{ position: 'absolute', left: '12px', top: '15px', fontSize: '1.2rem', zIndex: 1 }}>📍</span>
                            <input 
                                type="text" 
                                className="editor-location"
                                value={locationName} 
                                onChange={e => setLocationName(e.target.value)}
                                placeholder="Add location (e.g. Paris, France)" 
                                required
                            />
                        </div>
                    </div>
                    <div className="editor-blocks">
                        {blocks.map((block, index) => (
                            <div 
                                key={block.id} 
                                className="editor-block" 
                                data-index={index + 1 < 10 ? `0${index + 1}` : index + 1}
                            >                            
                                {blocks.length > 1 && (
                                    <button type="button" className="btn-remove-block" onClick={() => removeBlock(block.id)} title="Remove block">
                                        <span className="material-symbols-outlined" style={{fontSize: '18px'}}>close</span>
                                    </button>
                                )}
                                {block.type === 'text' && (
                                    <textarea 
                                        className="editor-textarea"
                                        value={block.value}
                                        onChange={(e) => {
                                            updateTextBlock(block.id, e.target.value);
                                            autoResize(e);
                                        }}
                                        onInput={autoResize}
                                        placeholder="Type something here..."
                                    />
                                )}
                                {block.type === 'image' && (
                                    <div 
                                        className={`editor-image-upload ${block.preview ? 'has-image' : ''}`}
                                        onClick={() => !block.preview && document.getElementById(`fileInput-${block.id}`).click()}
                                    >
                                        <input 
                                            id={`fileInput-${block.id}`}
                                            type="file" 
                                            accept="image/*" 
                                            hidden
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
                                                    title="Remove image"
                                                >
                                                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>close</span>
                                                </button>
                                            </>
                                        ) : (
                                            <div className="image-upload-placeholder">
                                                <span className="material-symbols-outlined placeholder-icon">add_photo_alternate</span>
                                                <div className="placeholder-text">Click to upload an image</div>
                                                <div className="placeholder-subtext">SVG, PNG, JPG or GIF</div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                    <div className="editor-tools">
                        <button type="button" className="btn-tool" onClick={addTextBlock}>
                            <span className="material-symbols-outlined">text_fields</span>
                            Add Text
                        </button>
                        <button type="button" className="btn-tool" onClick={addImageBlock}>
                            <span className="material-symbols-outlined">image</span>
                            Add Image
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
        </div>
    );
};

export default CreatePostPage;