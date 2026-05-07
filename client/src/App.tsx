import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import Login from './pages/Login'
import { UserList } from './pages/users/UserList'
import { UserForm } from './pages/users/UserForm'
import { FamilyList } from './pages/families/FamilyList'
import { FamilyDetail } from './pages/families/FamilyDetail'
import { FamilyForm } from './pages/families/FamilyForm'
import { MemberList } from './pages/members/MemberList'
import { MemberDetail } from './pages/members/MemberDetail'
import { MemberForm } from './pages/members/MemberForm'
import { CourseTypeList } from './pages/courseTypes/CourseTypeList'

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/users" element={<ProtectedRoute><UserList /></ProtectedRoute>} />
          <Route path="/users/nouveau" element={<ProtectedRoute><UserForm /></ProtectedRoute>} />
          <Route path="/users/:id/modifier" element={<ProtectedRoute><UserForm /></ProtectedRoute>} />
          <Route path="/families" element={<ProtectedRoute><FamilyList /></ProtectedRoute>} />
          <Route path="/families/nouveau" element={<ProtectedRoute><FamilyForm /></ProtectedRoute>} />
          <Route path="/families/:id" element={<ProtectedRoute><FamilyDetail /></ProtectedRoute>} />
          <Route path="/families/:id/modifier" element={<ProtectedRoute><FamilyForm /></ProtectedRoute>} />
          <Route path="/members" element={<ProtectedRoute><MemberList /></ProtectedRoute>} />
          <Route path="/members/nouveau" element={<ProtectedRoute><MemberForm /></ProtectedRoute>} />
          <Route path="/members/:id" element={<ProtectedRoute><MemberDetail /></ProtectedRoute>} />
          <Route path="/members/:id/modifier" element={<ProtectedRoute><MemberForm /></ProtectedRoute>} />
          <Route path="/course-types" element={<ProtectedRoute><CourseTypeList /></ProtectedRoute>} />
          <Route path="/" element={<Navigate to="/families" replace />} />
          <Route path="*" element={<Navigate to="/families" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
