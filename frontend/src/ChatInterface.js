import React, { useState, useEffect, useRef } from 'react';
import './ChatInterface.css';


// Component for product listing with load more
const ProductListing = ({ products, onLoadMore, hasMore, isLoadingMore, onProductClick }) => {
  return (
    <div className="w-full">
      <p className="mb-4 text-gray-600">Here are the products based on your search:</p>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {products.map(product => (
          <div key={product.id} className="rounded-lg p-4 bg-white hover:shadow-md transition-shadow cursor-pointer" onClick={() => onProductClick(product, products)}>
            <div className="flex gap-4">
              <img
                src={product.image}
                alt={product.title}
                className="w-20 h-20 object-cover rounded flex-shrink-0"
                onError={(e) => {
                  e.target.src = "https://via.placeholder.com/80x80/e5e7eb/9ca3af?text=IMG";
                }}
              />
              <div className="flex-1 min-w-0">
                <h3 className="text-blue-600 hover:text-blue-700 cursor-pointer text-sm">
                  {product.title}
                </h3>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-yellow-500 text-sm">
                    {'★'.repeat(Math.floor(product.rating))}
                  </span>
                  <span className="text-xs text-gray-500">
                    {product.rating.toFixed(2)} ({product.reviews.toLocaleString()})
                  </span>
                </div>
                <div className="flex items-center gap-3 mt-2">
                  <span className="text-sm text-gray-900">{product.price}</span>
                  {product.prime && (
                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
                      Prime
                    </span>
                  )}
                  {product.inStock ? (
                    <span className="text-xs text-green-600">In Stock</span>
                  ) : (
                    <span className="text-xs text-red-600">Out of Stock</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {hasMore && (
        <div className="mt-6 text-center">
          <button
            onClick={onLoadMore}
            disabled={isLoadingMore}
            className="px-5 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
          >
            {isLoadingMore ? (
              <span className="flex items-center gap-2">
                <span className="inline-block w-3 h-3 border-2 border-gray-500 border-t-transparent rounded-full animate-spin"></span>
                Loading...
              </span>
            ) : (
              'Load more'
            )}
          </button>
        </div>
      )}

      <p className="mt-4 text-xs text-gray-500">
        Showing {products.length} results
        {!hasMore && ' • All products loaded'}
      </p>
    </div>
  );
};

const ChatInterface = () => {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedProductIndex, setSelectedProductIndex] = useState(0);
  const [allProducts, setAllProducts] = useState([]);
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  const descriptionRef = useRef(null);


  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading) return;

    const userMessage = {
      id: Date.now(),
      role: 'user',
      content: inputValue
    };

    setMessages(prev => [...prev, userMessage]);
    const query = inputValue;
    setInputValue('');
    setIsLoading(true);

    try {
      console.log('Making API call for query:', query);

      // Call the search API
      const response = await fetch('https://9ahb9n78o3.execute-api.us-east-1.amazonaws.com/prod/node-search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: query,
          limit: 12,
          offset: 0
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const apiData = await response.json();
      console.log('API Response:', JSON.stringify(apiData));
      console.log('API Response structure:', {
        hasProducts: !!apiData.products,
        hasItems: !!apiData.items,
        hasResults: !!apiData.results,
        isArray: Array.isArray(apiData),
        keys: Object.keys(apiData || {}),
        type: typeof apiData
      });

      // Extract products from API response
      let products = [];

      if (apiData && Array.isArray(apiData.products)) {
        console.log('Found products array with', apiData.products.length, 'items');
        products = apiData.products.map((product, index) => ({
          id: product.id || index + 1,
          title: product.name || 'Unknown Product',
          price: product.price ? `$${product.price}` : '$0.00',
          rating: product.rating || (4.0 + Math.random() * 0.8), // Random rating between 4.0-4.8
          reviews: product.reviews || Math.floor(Math.random() * 5000) + 100,
          image: product.imageUrl || "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=200&h=200&fit=crop",
          prime: product.prime !== undefined ? product.prime : Math.random() > 0.3, // 70% chance of prime
          inStock: product.inStock !== false,
          brand: product.brand || '',
          description: product.description || '',
          category: product.category || '',
          score: product.score || 0
        }));
        console.log('Mapped products:', products);
      } else {
        console.log('No products array found in API response');
      }

      if (products.length === 0) {
        console.log('No products found in API response');

        const assistantMessage = {
          id: Date.now() + 1,
          role: 'assistant',
          content: (
            <div>
              <p className="mb-4 text-gray-600">No products found for your search: "{query}"</p>
              <p className="text-sm text-gray-500">Try searching for something else or check your search terms.</p>
            </div>
          )
        };

        setMessages(prev => [...prev, assistantMessage]);
        setIsLoading(false);
        return;
      }

      console.log('Using API products:', products.length, 'items');

      let responseContent = '';
      const searchTerm = query.toLowerCase();

      // Generate appropriate response message
      if (searchTerm.includes('hello') || searchTerm.includes('hi')) {
        responseContent = "Hello! I'm your shopping assistant. I can help you find products. Here are some popular items:";
      } else if (searchTerm.includes('help')) {
        responseContent = "I can help you search for products, compare prices, check reviews, and find the best deals. Here are some popular products:";
      } else {
        responseContent = `Here are some product recommendations for "${query}":`;
      }

      // Create product listing with API data
      const messageId = Date.now() + 1;
      const productListing = <ProductListingMessage
        messageId={messageId}
        initialProducts={products.slice(0, 5)}
        allProducts={products}
        onProductClick={handleProductClick}
      />;

      // Combine text response with product listing
      const combinedContent = (
        <div>
          <p className="mb-4 text-gray-600">{responseContent}</p>
          {productListing}
        </div>
      );

      const assistantMessage = {
        id: Date.now() + 1,
        role: 'assistant',
        content: combinedContent
      };

      setMessages(prev => [...prev, assistantMessage]);
      setIsLoading(false);

    } catch (error) {
      console.error('Search API Error:', error);

      // Check if it's a CORS error
      if (error.message.includes('Failed to fetch')) {
        console.warn('CORS error detected. API Gateway needs CORS configuration for localhost:3000');
      }

      const assistantMessage = {
        id: Date.now() + 1,
        role: 'assistant',
        content: (
          <div>
            <p className="mb-4 text-red-600">Sorry, there was an error searching for products.</p>
            <p className="text-sm text-gray-500">Error: {error.message}</p>
            <p className="text-xs text-gray-400 mt-2">Please try again or check your connection.</p>
          </div>
        )
      };

      setMessages(prev => [...prev, assistantMessage]);
      setIsLoading(false);
    }
  };

  const handleSuggestionClick = (prompt) => {
    setInputValue(prompt);
  };

  const handleReset = () => {
    setMessages([]);
    setInputValue('');
    setIsLoading(false);
    setSelectedProduct(null);
  };

  const handleProductClick = (product, products) => {
    const productIndex = products.findIndex(p => p.id === product.id);
    setSelectedProduct(product);
    setSelectedProductIndex(productIndex);
    setAllProducts(products);
    setIsDescriptionExpanded(false); // Reset description expansion when new product is selected
  };

  const handleCloseOverlay = () => {
    setSelectedProduct(null);
    setIsDescriptionExpanded(false);
  };

  const handlePrevProduct = () => {
    if (selectedProductIndex > 0) {
      const newIndex = selectedProductIndex - 1;
      setSelectedProductIndex(newIndex);
      setSelectedProduct(allProducts[newIndex]);
      setIsDescriptionExpanded(false);
    }
  };

  const handleNextProduct = () => {
    if (selectedProductIndex < allProducts.length - 1) {
      const newIndex = selectedProductIndex + 1;
      setSelectedProductIndex(newIndex);
      setSelectedProduct(allProducts[newIndex]);
      setIsDescriptionExpanded(false);
    }
  };

  const handleDescriptionToggle = () => {
    setIsDescriptionExpanded(!isDescriptionExpanded);

    // If expanding, scroll to description after a brief delay for DOM update
    if (!isDescriptionExpanded) {
      setTimeout(() => {
        if (descriptionRef.current) {
          descriptionRef.current.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
          });
        }
      }, 100);
    }
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-6 py-3">
        <div className="max-w-6xl mx-auto flex items-center gap-3">
          <div
            onClick={handleReset}
            className="w-8 h-8 bg-gray-800 rounded flex items-center justify-center text-white text-sm cursor-pointer hover:bg-gray-700 transition-colors"
          >
            OS
          </div>
          <h1
            onClick={handleReset}
            className="text-base text-gray-700 cursor-pointer hover:text-gray-900 transition-colors"
          >
            Open Shop
          </h1>
        </div>
      </header>

      <div className="flex-1 overflow-hidden flex flex-col">
        <div className="flex-1 overflow-y-auto">
          <div className={`max-w-6xl mx-auto px-4 py-8 ${messages.length > 0 ? 'pb-24' : ''}`}>
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center min-h-[60vh]">
                <div className="text-center mb-8">
                  <h2 className="text-xl text-gray-700 mb-3">
                    Welcome to Open Shop
                  </h2>
                  <p className="text-sm text-gray-500 mb-4">
                    I can help you find products, compare prices, and discover great deals
                  </p>
                </div>

                {/* Centered search box for initial view */}
                <div className="w-full max-w-2xl mb-8">
                  <form onSubmit={handleSendMessage}>
                    <div className="flex items-end gap-2 p-3 border border-gray-300 rounded-xl bg-white shadow-sm focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent transition-all">
                      <textarea
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        placeholder="Search for products or ask me anything..."
                        className="flex-1 resize-none border-none outline-none bg-transparent text-gray-900 placeholder-gray-500 min-h-[24px] max-h-[200px] py-1"
                        rows={1}
                        disabled={isLoading}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleSendMessage(e);
                          }
                        }}
                        style={{
                          height: 'auto',
                          minHeight: '24px'
                        }}
                        onInput={(e) => {
                          e.target.style.height = 'auto';
                          e.target.style.height = e.target.scrollHeight + 'px';
                        }}
                      />
                      <button
                        type="submit"
                        disabled={!inputValue.trim() || isLoading}
                        className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center min-w-[32px] h-8"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="m5 12 7-7 7 7"/>
                          <path d="m12 19 0-14"/>
                        </svg>
                      </button>
                    </div>
                  </form>
                </div>

                {/* Suggestions below search box */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-2xl mx-auto">
                  <button
                    onClick={() => handleSuggestionClick("Comfortable running shoes for marathon")}
                    className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left transition-colors"
                  >
                    <p className="text-sm text-gray-700">Comfortable running shoes for marathon</p>
                  </button>
                  <button
                    onClick={() => handleSuggestionClick("Winter jacket for cold weather protection")}
                    className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left transition-colors"
                  >
                    <p className="text-sm text-gray-700">Winter jacket for cold weather protection</p>
                  </button>
                  <button
                    onClick={() => handleSuggestionClick("Items for outdoor camping trip")}
                    className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left transition-colors"
                  >
                    <p className="text-sm text-gray-700">Items for outdoor camping trip</p>
                  </button>
                  <button
                    onClick={() => handleSuggestionClick("Smartphone with excellent camera quality")}
                    className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left transition-colors"
                  >
                    <p className="text-sm text-gray-700">Smartphone with excellent camera quality</p>
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex gap-3 ${
                      message.role === 'user' ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    {message.role === 'assistant' && (
                      <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-green-500 to-blue-500 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                        OS
                      </div>
                    )}
                    <div
                      className={`${
                        message.role === 'user'
                          ? 'max-w-md bg-blue-500 text-white px-4 py-3 rounded-lg'
                          : 'max-w-5xl'
                      }`}
                    >
                      {typeof message.content === 'string' ? (
                        <p className={message.role === 'user' ? 'text-white' : 'text-gray-600'}>
                          {message.content}
                        </p>
                      ) : (
                        message.content
                      )}
                    </div>
                    {message.role === 'user' && (
                      <div className="flex-shrink-0 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                        U
                      </div>
                    )}
                  </div>
                ))}
                {isLoading && (
                  <div className="flex gap-3">
                    <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-green-500 to-blue-500 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                      OS
                    </div>
                    <div className="px-4 py-3">
                      <div className="flex gap-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Floating search box for chat view */}
        {messages.length > 0 && (
          <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg px-4 py-4">
            <div className="max-w-4xl mx-auto">
              <form onSubmit={handleSendMessage}>
                <div className="flex items-end gap-2 p-3 border border-gray-300 rounded-xl bg-white shadow-sm focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent transition-all">
                  <textarea
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder="Search for products or ask me anything..."
                    className="flex-1 resize-none border-none outline-none bg-transparent text-gray-900 placeholder-gray-500 min-h-[24px] max-h-[200px] py-1"
                    rows={1}
                    disabled={isLoading}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage(e);
                      }
                    }}
                    style={{
                      height: 'auto',
                      minHeight: '24px'
                    }}
                    onInput={(e) => {
                      e.target.style.height = 'auto';
                      e.target.style.height = e.target.scrollHeight + 'px';
                    }}
                  />
                  <button
                    type="submit"
                    disabled={!inputValue.trim() || isLoading}
                    className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center min-w-[32px] h-8"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="m5 12 7-7 7 7"/>
                      <path d="m12 19 0-14"/>
                    </svg>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>

      {/* Product Detail Overlay */}
      {selectedProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={handleCloseOverlay}>
          <div className="bg-white rounded-lg max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            {/* Header with close button */}
            <div className="flex justify-between items-center p-6 border-b">
              <h2 className="text-xl font-semibold text-gray-900">Product Details</h2>
              <button
                onClick={handleCloseOverlay}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ×
              </button>
            </div>

            {/* Product content */}
            <div className="p-6">
              <div className="flex flex-col md:flex-row gap-6">
                {/* Product image */}
                <div className="md:w-1/2">
                  <img
                    src={selectedProduct.image}
                    alt={selectedProduct.title}
                    className="w-full h-64 object-cover rounded-lg"
                    onError={(e) => {
                      e.target.src = "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=300&fit=crop";
                    }}
                  />
                </div>

                {/* Product info */}
                <div className="md:w-1/2">
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">{selectedProduct.title}</h3>
                  <p className="text-3xl font-bold text-blue-600 mb-4">{selectedProduct.price}</p>

                  {/* Rating */}
                  <div className="flex items-center gap-2 mb-4">
                    <div className="flex text-yellow-400">
                      {'★'.repeat(Math.floor(selectedProduct.rating))}
                      {'☆'.repeat(5 - Math.floor(selectedProduct.rating))}
                    </div>
                    <span className="text-gray-600">
                      {selectedProduct.rating.toFixed(2)} ({selectedProduct.reviews.toLocaleString()} reviews)
                    </span>
                  </div>

                  {/* Prime and stock status */}
                  <div className="flex gap-2 mb-6">
                    {selectedProduct.prime && (
                      <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm font-medium">
                        Prime
                      </span>
                    )}
                    <span className={`px-2 py-1 rounded text-sm font-medium ${
                      selectedProduct.inStock
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {selectedProduct.inStock ? 'In Stock' : 'Out of Stock'}
                    </span>
                  </div>

                  {/* Action buttons */}
                  <div className="flex gap-3">
                    <button className="bg-yellow-400 hover:bg-yellow-500 text-black px-6 py-2 rounded font-medium">
                      Add to Cart
                    </button>
                    <button className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded font-medium">
                      Buy Now
                    </button>
                  </div>
                </div>
              </div>

              {/* Description - Full width below the two-column layout */}
              {selectedProduct.description && (
                <div ref={descriptionRef} className="mt-6 pt-6 border-t border-gray-200">
                  <h4 className="text-lg font-semibold text-gray-900 mb-3">Description</h4>
                  <div className="text-gray-700 leading-relaxed">
                    <p className={`${!isDescriptionExpanded ? 'line-clamp-5' : ''}`}>
                      {selectedProduct.description}
                    </p>
                    {(() => {
                      // Check if text would be clamped by creating a temporary element
                      const words = selectedProduct.description.split(' ');
                      const shouldShowButton = words.length > 50; // Rough estimate for 5 lines
                      return shouldShowButton && (
                        <button
                          onClick={handleDescriptionToggle}
                          className="text-blue-600 hover:text-blue-800 font-medium mt-2 text-sm"
                        >
                          {isDescriptionExpanded ? 'Show less' : 'Show more'}
                        </button>
                      );
                    })()}
                  </div>
                </div>
              )}
            </div>

            {/* Navigation arrows */}
            <div className="flex justify-between items-center p-6 border-t">
              <button
                onClick={handlePrevProduct}
                disabled={selectedProductIndex === 0}
                className={`flex items-center gap-2 px-4 py-2 rounded ${
                  selectedProductIndex === 0
                    ? 'text-gray-400 cursor-not-allowed'
                    : 'text-blue-600 hover:bg-blue-50'
                }`}
              >
                ← Previous
              </button>

              <span className="text-gray-500 text-sm">
                {selectedProductIndex + 1} of {allProducts.length}
              </span>

              <button
                onClick={handleNextProduct}
                disabled={selectedProductIndex === allProducts.length - 1}
                className={`flex items-center gap-2 px-4 py-2 rounded ${
                  selectedProductIndex === allProducts.length - 1
                    ? 'text-gray-400 cursor-not-allowed'
                    : 'text-blue-600 hover:bg-blue-50'
                }`}
              >
                Next →
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Separate component to manage product listing state
const ProductListingMessage = ({ messageId, initialProducts, allProducts, onProductClick }) => {
  const [displayedProducts, setDisplayedProducts] = useState(initialProducts);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const productListRef = useRef(null);
  const ITEMS_PER_PAGE = 5;

  const hasMore = displayedProducts.length < allProducts.length;

  useEffect(() => {
    if (productListRef.current && displayedProducts.length > 0) {
      setTimeout(() => {
        productListRef.current.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }, 100);
    }
  }, [displayedProducts.length]);

  const handleLoadMore = () => {
    setIsLoadingMore(true);

    // Simulate loading delay
    setTimeout(() => {
      const currentLength = displayedProducts.length;
      const nextProducts = allProducts.slice(currentLength, currentLength + ITEMS_PER_PAGE);
      setDisplayedProducts(prev => [...prev, ...nextProducts]);
      setIsLoadingMore(false);
    }, 800);
  };

  return (
    <div ref={productListRef}>
      <ProductListing
        products={displayedProducts}
        onLoadMore={handleLoadMore}
        hasMore={hasMore}
        isLoadingMore={isLoadingMore}
        onProductClick={(product) => onProductClick(product, allProducts)}
      />
    </div>
  );
};

export default ChatInterface;