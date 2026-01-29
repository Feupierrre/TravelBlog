import { Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import HomePage from './pages/HomePage';
import PostPage from './pages/PostPage';
import LoginPage from './pages/LoginPage';       
import RegisterPage from './pages/RegisterPage'; 
import ProfilePage from './pages/ProfilePage';

function App() {
  return (
    <>
      <Header />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/post/:slug" element={<PostPage />} />
        <Route path="/login" element={<LoginPage />} />      
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/profile" element={<ProfilePage />} />
      </Routes>
    </>
  );
}

export default App;