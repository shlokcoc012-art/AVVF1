import { useCart } from '../context/CartContext'

export default function CartButton() {
  const { items, setIsOpen, total } = useCart()
  const count = items.length
  const isEmpty = count === 0

  const fmt = (n) => '₹' + (n || 0).toLocaleString('en-IN')

  return (
    <button
      onClick={() => setIsOpen(true)}
      data-testid="floating-cart-button"
      aria-label={isEmpty ? 'Open cart (empty)' : `Open cart — ${count} item${count !== 1 ? 's' : ''}, ${fmt(total)}`}
      className={`fixed bottom-6 right-6 z-[100] flex items-center gap-3 text-white font-bold rounded-2xl transition-all duration-300 active:scale-95 hover:scale-105 ${
        isEmpty ? 'cart-btn-empty px-3.5 py-3' : 'cart-btn-flow px-5 py-3'
      }`}
    >
      <div className="relative flex-shrink-0">
        <span className="text-2xl drop-shadow">🛒</span>
        {!isEmpty && (
          <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-black rounded-full min-w-[18px] min-h-[18px] flex items-center justify-center px-1 shadow-md animate-bounce">
            {count}
          </span>
        )}
      </div>

      {isEmpty ? (
        <div className="text-left hidden sm:block">
          <div className="text-[10px] text-amber-200/90 leading-tight uppercase tracking-widest">Your Cart</div>
          <div className="text-xs font-bold leading-tight text-yellow-200">Browse Services →</div>
        </div>
      ) : (
        <>
          <div className="text-left">
            <div className="text-xs text-amber-200 leading-tight">{count} service{count !== 1 ? 's' : ''}</div>
            <div className="text-base font-extrabold leading-tight tracking-wide">{fmt(total)}</div>
          </div>
          <span className="font-black text-base cart-arrow" style={{ color: '#d4a017' }}>→</span>
        </>
      )}
    </button>
  )
}
