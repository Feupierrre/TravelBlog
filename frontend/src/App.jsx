import { Routes, Route } from 'react-router-dom';
import Header from './components/Header'; 
import HomePage from './pages/HomePage';
import PostPage from './pages/PostPage';

function App() {
  return (
    <>
      <Header /> 
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path='/post/:slug' element={<PostPage />} />
      </Routes>
    </>
  );
}

export default App;