import React from 'react'
import { Button } from '@/components/ui/button'
import { Link } from 'react-router-dom'

const NotFound = () => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="text-center">
        <div className="mb-8">
          <h1 className="text-6xl font-bold text-red-600">404</h1>
          <p className="text-xl text-gray-700 mt-2">Oops! The page you were looking for doesn't exist.</p>
        </div>
        
        <div className="mb-4">
          <Link to="/">
            <Button variant="default" className="px-6 py-3 text-white bg-blue-600 hover:bg-blue-700">
              Go back to Home
            </Button>
          </Link>
        </div>

        <div>
          <Link to="/contact">
            <Button variant="secondary" className="px-6 py-3 text-blue-600 border border-blue-600 hover:bg-blue-100">
              Contact Us
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}

export default NotFound
