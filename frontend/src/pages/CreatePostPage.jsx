import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

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
    const removeBlock = (id) => {
        setBlocks(blocks.filter(b => b.id !== id));
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
                alert("Error creating post");
            }
        } catch (err) {
            console.error(err);
            alert("Network error");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="container" style={{ padding: '40px 20px', maxWidth: '800px' }}>
            <h1 style={{ marginBottom: '30px', fontSize: '2.5rem' }}>Write a New Story ✍️</h1>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
                <div>
                    <label style={{fontWeight: 'bold', display: 'block', marginBottom: '10px'}}>Cover Image</label>
                    <div style={{ 
                        border: '2px dashed #E8ECE8', borderRadius: '16px', 
                        height: '250px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        background: coverPreview ? `url(${coverPreview}) center/cover` : '#F9F9F9',
                        cursor: 'pointer', position: 'relative'
                    }}
                    onClick={() => document.getElementById('coverInput').click()}
                    >
                        {!coverPreview && <span style={{color: '#999'}}>+ Upload Cover</span>}
                        <input id="coverInput" type="file" hidden accept="image/*" onChange={e => {
                            if(e.target.files[0]) {
                                setCoverFile(e.target.files[0]);
                                setCoverPreview(URL.createObjectURL(e.target.files[0]));
                            }
                        }} />
                    </div>
                </div>
                <input 
                    type="text" value={title} onChange={e => setTitle(e.target.value)}
                    placeholder="Story Title..." required
                    style={{ width: '100%', padding: '15px', fontSize: '1.8rem', borderRadius: '8px', border: '1px solid #ddd', fontFamily: 'serif' }}
                />
                <input 
                    type="text" value={locationName} onChange={e => setLocationName(e.target.value)}
                    placeholder="📍 Location (e.g. Kyoto)" required
                    style={{ width: '100%', padding: '12px', fontSize: '1rem', borderRadius: '8px', border: '1px solid #ddd' }}
                />
                <hr style={{ border: 'none', borderTop: '1px solid #eee' }} />
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    {blocks.map((block, index) => (
                        <div key={block.id} style={{ position: 'relative' }}>
                            {blocks.length > 1 && (
                                <button type="button" onClick={() => removeBlock(block.id)} style={{
                                    position: 'absolute', right: -30, top: 10, background: 'none', border: 'none', 
                                    color: '#ff6b6b', cursor: 'pointer', fontSize: '20px'
                                }}>×</button>
                            )}
                            {block.type === 'text' && (
                                <textarea 
                                    value={block.value}
                                    onChange={(e) => updateTextBlock(block.id, e.target.value)}
                                    placeholder="Write your paragraph..."
                                    style={{ 
                                        width: '100%', minHeight: '150px', padding: '15px', 
                                        fontSize: '1.1rem', borderRadius: '8px', border: '1px solid #ddd', 
                                        lineHeight: '1.6', resize: 'vertical'
                                    }}
                                />
                            )}
                            {block.type === 'image' && (
                                <div style={{ 
                                    border: '1px solid #ddd', borderRadius: '8px', padding: '10px',
                                    background: '#f8f9fa' 
                                }}>
                                    <input type="file" accept="image/*" onChange={(e) => {
                                        if (e.target.files[0]) updateImageBlock(block.id, e.target.files[0]);
                                    }} />
                                    {block.preview && (
                                        <img src={block.preview} alt="preview" style={{ 
                                            marginTop: '10px', width: '100%', maxHeight: '400px', 
                                            objectFit: 'cover', borderRadius: '4px' 
                                        }} />
                                    )}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
                <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginTop: '10px' }}>
                    <button type="button" onClick={addTextBlock} style={{
                        padding: '10px 20px', background: 'white', border: '1px solid #ddd', 
                        borderRadius: '20px', cursor: 'pointer', fontWeight: 'bold'
                    }}>+ Add Text</button>
                    
                    <button type="button" onClick={addImageBlock} style={{
                        padding: '10px 20px', background: 'white', border: '1px solid #ddd', 
                        borderRadius: '20px', cursor: 'pointer', fontWeight: 'bold'
                    }}>+ Add Image</button>
                </div>
                <button 
                    type="submit" 
                    disabled={isSubmitting}
                    style={{ 
                        marginTop: '30px', padding: '15px', background: 'var(--color-primary)', color: 'white', 
                        border: 'none', borderRadius: '50px', fontSize: '1.1rem', fontWeight: 'bold', 
                        cursor: 'pointer', width: '100%'
                    }}
                >
                    {isSubmitting ? 'Publishing...' : 'Publish Story 🚀'}
                </button>
            </form>
        </div>
    );
};

export default CreatePostPage;