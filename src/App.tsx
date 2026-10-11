import { Route, Routes } from 'react-router-dom';
import PublicLayout from './layouts/PublicLayout';
import AdminLayout from './layouts/AdminLayout';
import RequireAdmin from './components/admin/RequireAdmin';
import HomePage from './pages/public/HomePage';
import AboutPage from './pages/public/AboutPage';
import EventsPage from './pages/public/EventsPage';
import AdmissionsPage from './pages/public/AdmissionsPage';
import FeedbackPage from './pages/public/FeedbackPage';
import NotFoundPage from './pages/NotFoundPage';
import LoginPage from './pages/admin/LoginPage';
import DashboardPage from './pages/admin/DashboardPage';
import SettingsPage from './pages/admin/SettingsPage';
import FounderTeachersPage from './pages/admin/FounderTeachersPage';
import EventsAdminPage from './pages/admin/EventsAdminPage';
import AchievementsAdminPage from './pages/admin/AchievementsAdminPage';
import GalleryAdminPage from './pages/admin/GalleryAdminPage';
import AdmissionsAdminPage from './pages/admin/AdmissionsAdminPage';
import FeedbackAdminPage from './pages/admin/FeedbackAdminPage';
import NotificationsPage from './pages/admin/NotificationsPage';
import ChangePasswordPage from './pages/admin/ChangePasswordPage';

export default function App() {
  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route index element={<HomePage />} />
        <Route path="about" element={<AboutPage />} />
        <Route path="events" element={<EventsPage />} />
        <Route path="admissions" element={<AdmissionsPage />} />
        <Route path="feedback" element={<FeedbackPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>

      <Route path="/admin/login" element={<LoginPage />} />

      <Route
        path="/admin"
        element={
          <RequireAdmin>
            <AdminLayout />
          </RequireAdmin>
        }
      >
        <Route index element={<DashboardPage />} />
        <Route path="settings" element={<SettingsPage />} />
        <Route path="founder-teachers" element={<FounderTeachersPage />} />
        <Route path="events" element={<EventsAdminPage />} />
        <Route path="achievements" element={<AchievementsAdminPage />} />
        <Route path="gallery" element={<GalleryAdminPage />} />
        <Route path="admissions" element={<AdmissionsAdminPage />} />
        <Route path="feedback" element={<FeedbackAdminPage />} />
        <Route path="notifications" element={<NotificationsPage />} />
        <Route path="change-password" element={<ChangePasswordPage />} />
      </Route>
    </Routes>
  );
}
