import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import Layout from './components/Layout'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import { FamilyList } from './pages/families/FamilyList'
import { FamilyDetail } from './pages/families/FamilyDetail'
import { FamilyForm } from './pages/families/FamilyForm'
import { MemberList } from './pages/members/MemberList'
import { MemberDetail } from './pages/members/MemberDetail'
import { MemberForm } from './pages/members/MemberForm'
import { CourseList } from './pages/courses/CourseList'
import { CourseDetail } from './pages/courses/CourseDetail'
import { CourseForm } from './pages/courses/CourseForm'
import { CourseTypeList } from './pages/courseTypes/CourseTypeList'
import { UserList } from './pages/users/UserList'
import { UserForm } from './pages/users/UserForm'
import { ActivityLog } from './pages/ActivityLog'
import { Export } from './pages/Export'
import { Import } from './pages/Import'
import { ChangePassword } from './pages/ChangePassword'
import { Account } from './pages/Account'

function LayoutWrapper({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute>
      <Layout>{children}</Layout>
    </ProtectedRoute>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<Navigate to="/courses" replace />} />
          <Route path="/dashboard" element={<LayoutWrapper><Dashboard /></LayoutWrapper>} />
          <Route path="/change-password" element={<LayoutWrapper><ChangePassword /></LayoutWrapper>} />
          <Route path="/account" element={<LayoutWrapper><Account /></LayoutWrapper>} />
          <Route path="/families" element={<LayoutWrapper><FamilyList /></LayoutWrapper>} />
          <Route path="/families/nouveau" element={<LayoutWrapper><FamilyForm /></LayoutWrapper>} />
          <Route path="/families/:id" element={<LayoutWrapper><FamilyDetail /></LayoutWrapper>} />
          <Route path="/families/:id/modifier" element={<LayoutWrapper><FamilyForm /></LayoutWrapper>} />
          <Route path="/members" element={<LayoutWrapper><MemberList /></LayoutWrapper>} />
          <Route path="/members/nouveau" element={<LayoutWrapper><MemberForm /></LayoutWrapper>} />
          <Route path="/members/:id" element={<LayoutWrapper><MemberDetail /></LayoutWrapper>} />
          <Route path="/members/:id/modifier" element={<LayoutWrapper><MemberForm /></LayoutWrapper>} />
          <Route path="/courses" element={<LayoutWrapper><CourseList /></LayoutWrapper>} />
          <Route path="/courses/nouveau" element={<LayoutWrapper><CourseForm /></LayoutWrapper>} />
          <Route path="/courses/:id" element={<LayoutWrapper><CourseDetail /></LayoutWrapper>} />
          <Route path="/courses/:id/modifier" element={<LayoutWrapper><CourseForm /></LayoutWrapper>} />
          <Route path="/course-types" element={<LayoutWrapper><CourseTypeList /></LayoutWrapper>} />
          <Route path="/users" element={<LayoutWrapper><UserList /></LayoutWrapper>} />
          <Route path="/users/nouveau" element={<LayoutWrapper><UserForm /></LayoutWrapper>} />
          <Route path="/users/:id/modifier" element={<LayoutWrapper><UserForm /></LayoutWrapper>} />
          <Route path="/activity-log" element={<LayoutWrapper><ActivityLog /></LayoutWrapper>} />
          <Route path="/export" element={<LayoutWrapper><Export /></LayoutWrapper>} />
          <Route path="/import" element={<LayoutWrapper><Import /></LayoutWrapper>} />
          <Route path="*" element={<Navigate to="/courses" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
