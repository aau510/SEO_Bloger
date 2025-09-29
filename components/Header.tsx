'use client'

import { SparklesIcon, Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline'
import { useState } from 'react'

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <header className="bg-white/80 backdrop-blur-lg shadow-lg border-b border-gray-200/50 sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center animate-float">
              <SparklesIcon className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                SEO博客智能体
              </h1>
              <p className="text-xs text-gray-500 -mt-1">AI-Powered Content Generation</p>
            </div>
          </div>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <a href="#features" className="text-gray-600 hover:text-blue-600 transition-colors font-medium">
              功能特色
            </a>
            <a href="#workflow" className="text-gray-600 hover:text-blue-600 transition-colors font-medium">
              工作流程
            </a>
            <a href="#demo" className="text-gray-600 hover:text-blue-600 transition-colors font-medium">
              在线演示
            </a>
            <div className="flex items-center space-x-2 px-3 py-1.5 bg-green-100 text-green-800 rounded-full text-sm">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="font-medium">系统正常</span>
            </div>
          </nav>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            {isMenuOpen ? (
              <XMarkIcon className="h-6 w-6 text-gray-600" />
            ) : (
              <Bars3Icon className="h-6 w-6 text-gray-600" />
            )}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden mt-4 pb-4 border-t border-gray-200">
            <nav className="flex flex-col space-y-3 pt-4">
              <a href="#features" className="text-gray-600 hover:text-blue-600 transition-colors font-medium py-2">
                功能特色
              </a>
              <a href="#workflow" className="text-gray-600 hover:text-blue-600 transition-colors font-medium py-2">
                工作流程
              </a>
              <a href="#demo" className="text-gray-600 hover:text-blue-600 transition-colors font-medium py-2">
                在线演示
              </a>
              <div className="flex items-center space-x-2 px-3 py-2 bg-green-100 text-green-800 rounded-lg text-sm w-fit">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="font-medium">系统正常</span>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}