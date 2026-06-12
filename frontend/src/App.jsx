import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import Stats from './components/Stats'
import Learnings from './components/Learnings'
import Services from './components/Services'
import PrashnKundali from './components/PrashnKundali'
import ModernAstrology from './components/ModernAstrology'
import TriComboPromo from './components/TriComboPromo'
import Specialties from './components/Specialties'
import HolisticHealing from './components/HolisticHealing'
import Testimonials from './components/Testimonials'
import CartDrawer from './components/CartDrawer'
import CartButton from './components/CartButton'
import Footer from './components/Footer'
import { CartProvider, useCart } from './context/CartContext'
import { AuthProvider } from './admin/AuthContext'
import AdminLogin from './admin/AdminLogin'
import AdminDashboard from './admin/AdminDashboard'
import ProtectedRoute from './admin/ProtectedRoute'

function PublicSite() {
  const { setIsOpen } = useCart()
  const openBooking = () => setIsOpen(true)

  return (
    <div className="min-h-screen bg-amber-50">
      <Navbar onBooking={openBooking} />
      <Hero onBooking={openBooking} />
      <Stats />
      <Learnings />
      <Services />
      <PrashnKundali />
      <TriComboPromo />
      <ModernAstrology />
      <Specialties />
      <HolisticHealing />
      <Testimonials />
      <Footer onBooking={openBooking} />
      <CartDrawer />
      <CartButton />
    </div>
  )
}

function PublicSiteWithCart() {
  return (
    <CartProvider>
      <PublicSite />
    </CartProvider>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route path="/*" element={<PublicSiteWithCart />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
