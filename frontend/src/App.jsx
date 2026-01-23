
import { useState, useEffect } from "react";

function App() {

  const [posts, setPosts] = useState([])

  useEffect(() => {
    fetch('http://127.0.0.1:8000/api/posts')
    .then(response => response.json())
    .then(data => {
      console.log("The data has arrived: ", data);
      setPosts(data);
    })
    .catch(error => console.error("Error", error));
  }, []);

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
      <h1>Мой Тревел Блог ✈️</h1>
      
      {posts.length === 0 && <p>Загрузка постов...</p>}

      <div style={{ display: 'grid', gap: '20px' }}>
        {posts.map(post => (
          <div key={post.id} style={{ border: '1px solid #ccc', padding: '10px', borderRadius: '8px' }}>
            <h2>{post.title}</h2>
            <p>📍 {post.location_name}</p>
            {post.cover_image_url && (
              <img 
                src={`http://127.0.0.1:8000${post.cover_image_url}`} 
                alt={post.title} 
                style={{ width: '200px', borderRadius: '4px' }}
              />
            )}
            <br />
            <small>Автор: {post.author}</small>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;