import { Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import HomePage from './pages/HomePage';
import PostPage from './pages/PostPage';
import LoginPage from './pages/LoginPage';       
import RegisterPage from './pages/RegisterPage'; 
import ProfilePage from './pages/ProfilePage';
import CreatePostPage from './pages/CreatePostPage';
import AboutPage from './pages/AboutPage';
import PlacesPage from './pages/PlacesPage';
import PublicProfilePage from './pages/PublicProfilePage';
import Footer from './components/Footer';

function App() {
  return (
    <>
      <Header />
      <div style={{ minHeight: '80vh' }}> 
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/post/:slug" element={<PostPage />} />
          <Route path="/login" element={<LoginPage />} />      
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/write" element={<CreatePostPage />} />
          <Route path="/edit/:slug" element={<CreatePostPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/places" element={<PlacesPage />} />
          <Route path="/user/:username" element={<PublicProfilePage />} />
        </Routes>
      </div>
      <Footer />
    </>
  );
}

export default App;