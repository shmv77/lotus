import { Link } from 'react-router-dom'
import { Facebook, Twitter, Instagram, Youtube } from 'lucide-react'

const Footer = () => {
  return (
    <footer className="glass-card border-t border-dark-700 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <h3 className="text-2xl font-display font-bold gradient-text mb-4">
              LOTUS
            </h3>
            <p className="text-gray-400 text-sm">
              Premium cocktails and spirits delivered to your door.
            </p>
            <div className="flex space-x-4 mt-4">
              <a href="#" className="text-gray-400 hover:text-accent-primary transition-colors">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-accent-primary transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-accent-primary transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-accent-primary transition-colors">
                <Youtube className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Shop */}
          <div>
            <h4 className="text-white font-semibold mb-4">Shop</h4>
            <ul className="space-y-2 text-gray-400 text-sm">
              <li>
                <Link to="/products" className="hover:text-white transition-colors">
                  All Products
                </Link>
              </li>
              <li>
                <Link to="/products?category=cocktails" className="hover:text-white transition-colors">
                  Cocktails
                </Link>
              </li>
              <li>
                <Link to="/products?category=spirits" className="hover:text-white transition-colors">
                  Spirits
                </Link>
              </li>
              <li>
                <Link to="/products?category=accessories" className="hover:text-white transition-colors">
                  Accessories
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h4 className="text-white font-semibold mb-4">Customer Service</h4>
            <ul className="space-y-2 text-gray-400 text-sm">
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Contact Us
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Shipping Info
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Returns
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  FAQ
                </a>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-white font-semibold mb-4">Legal</h4>
            <ul className="space-y-2 text-gray-400 text-sm">
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Terms of Service
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Cookie Policy
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-dark-700 mt-8 pt-8 text-center text-gray-400 text-sm">
          <p>&copy; {new Date().getFullYear()} Lotus. All rights reserved.</p>
          <p className="mt-2">Please drink responsibly. Must be 21+ to purchase.</p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
