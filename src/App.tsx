import { BrowserRouter, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import TodoPage from './pages/TodoPage';
import ActivitySheetsPage from './activity-sheets/ActivitySheetsPage';

export default function App() {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/todos" element={<TodoPage />} />
        <Route path="/activity-sheets" element={<ActivitySheetsPage />} />
      </Routes>
    </BrowserRouter>
  );
}
