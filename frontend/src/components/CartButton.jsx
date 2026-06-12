import { useCart } from '../context/CartContext'

export default function CartButton() {
  const { items, setIsOpen, total } = useCart()
  const count = items.length

  if (count === 0) return null

  function fmt(n) {
    return '₹' + n.toLocaleString('en-IN')
  }

  return (
    <button
      onClick={() => setIsOpen(true)}
      className="fixed bottom-6 right-6 z-[100] flex items-center gap-3 text-white font-bold px-5 py-3 rounded-2xl transition-all active:scale-95 cart-btn-flow"
    >
<div className="relative flex-shrink-0">
        <span className="text-2xl drop-shadow">🛒</span>
        <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-black rounded-full min-w-[18px] min-h-[18px] flex items-center justify-center px-1 shadow-md animate-bounce">
          {count}
        </span>
      </div>

      <div className="text-left">
        <div className="text-xs text-amber-200 leading-tight">{count} service{count !== 1 ? 's' : ''}</div>
        <div className="text-base font-extrabold leading-tight tracking-wide">{fmt(total)}</div>
      </div>

      {/* Animated arrow */}
      <span className="font-black text-base cart-arrow" style={{color:'#d4a017'}}>→</span>
    </button>
  )
}
