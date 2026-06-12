import Navbar from './components/Navbar'
import Hero from './components/Hero'
import Stats from './components/Stats'
import Learnings from './components/Learnings'
import Services from './components/Services'
import PrashnKundali from './components/PrashnKundali'
import ModernAstrology from './components/ModernAstrology'
import TriComboPromo from './components/TriComboPromo'
import Specialties from './components/Specialties'
import Testimonials from './components/Testimonials'
import CartDrawer from './components/CartDrawer'
import CartButton from './components/CartButton'
import Footer from './components/Footer'
import { CartProvider, useCart } from './context/CartContext'

function AppInner() {
  const { setIsOpen } = useCart()
  // Every "Book Now" entry point opens the cart drawer; booking form lives inside it.
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
      <Testimonials />
      <Footer onBooking={openBooking} />
      <CartDrawer />
      <CartButton />
    </div>
  )
}

function App() {
  return (
    <CartProvider>
      <AppInner />
    </CartProvider>
  )
}

export default App
