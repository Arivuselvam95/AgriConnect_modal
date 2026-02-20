import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { productService } from '../../services/product.service';
import { orderService } from '../../services/order.service';
import {
  ShoppingBag,
  Plus,
  Package,
  Phone,
  MapPin,
  X,
} from 'lucide-react';
import './FarmHub.css';

const FarmHub = () => {
  const { user } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState('marketplace');
  const [products, setProducts] = useState([]);
  const [myProducts, setMyProducts] = useState([]);
  const [myOrders, setMyOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [newProduct, setNewProduct] = useState({
    name: '',
    price: '',
    quantity: '',
    description: '',
    image: '',
  });

  useEffect(() => {
    if (activeTab === 'marketplace') {
      fetchProducts();
    } else if (activeTab === 'my-products') {
      fetchMyProducts();
    } else if (activeTab === 'my-orders') {
      fetchMyOrders();
    }
  }, [activeTab]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const data = await productService.getAllProducts();
      setProducts(data);
    } catch (err) {
      console.error('Failed to fetch products');
    } finally {
      setLoading(false);
    }
  };

  const fetchMyProducts = async () => {
    setLoading(true);
    try {
      const data = await productService.getMyProducts();
      setMyProducts(data);
    } catch (err) {
      console.error('Failed to fetch my products');
    } finally {
      setLoading(false);
    }
  };

  const fetchMyOrders = async () => {
    setLoading(true);
    try {
      const data = await orderService.getMyOrders();
      setMyOrders(data);
    } catch (err) {
      console.error('Failed to fetch my orders');
    } finally {
      setLoading(false);
    }
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      await productService.createProduct({
        ...newProduct,
        price: parseFloat(newProduct.price),
        quantity: parseInt(newProduct.quantity),
      });
      setSuccess('Product added successfully!');
      setShowAddProduct(false);
      setNewProduct({
        name: '',
        price: '',
        quantity: '',
        description: '',
        image: '',
      });
      fetchMyProducts();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add product');
    }
  };

  const handleBuyProduct = async (productId) => {
    try {
      await orderService.createOrder({
        productId,
        quantity: 1,
      });
      alert('Order placed successfully!');
      fetchProducts();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to place order');
    }
  };

  return (
    <div className="farmhub-page">
      <div className="farmhub-container">
        <div className="farmhub-header">
          <h1>Farm Hub</h1>
          <p>Your marketplace for agricultural products</p>
        </div>

        <div className="tabs">
          <button
            className={`tab ${activeTab === 'marketplace' ? 'active' : ''}`}
            onClick={() => setActiveTab('marketplace')}
          >
            <ShoppingBag size={18} />
            Marketplace
          </button>

          {user?.role === 'farmer' && (
            <button
              className={`tab ${activeTab === 'my-products' ? 'active' : ''}`}
              onClick={() => setActiveTab('my-products')}
            >
              <Package size={18} />
              My Products
            </button>
          )}

          {user?.role === 'consumer' && (
            <button
              className={`tab ${activeTab === 'my-orders' ? 'active' : ''}`}
              onClick={() => setActiveTab('my-orders')}
            >
              <Package size={18} />
              My Orders
            </button>
          )}
        </div>

        {success && <div className="success-box">{success}</div>}

        {activeTab === 'marketplace' && (
          <div className="tab-content">
            <div className="products-grid">
              {loading ? (
                <p>Loading products...</p>
              ) : products.length === 0 ? (
                <p className="empty-state">No products available</p>
              ) : (
                products.map((product) => (
                  <div key={product._id} className="product-card">
                    <div className="product-image">
                      {product.image ? (
                        <img src={product.image} alt={product.name} />
                      ) : (
                        <div className="image-placeholder">
                          <Package size={48} color="#999" />
                        </div>
                      )}
                    </div>
                    <div className="product-info">
                      <h3>{product.name}</h3>
                      <p className="product-description">
                        {product.description || 'No description available'}
                      </p>
                      <div className="product-meta">
                        <span className="price">₹{product.price}/unit</span>
                        <span className="quantity">Stock: {product.quantity}</span>
                      </div>
                      <div className="farmer-info">
                        <MapPin size={14} />
                        <span>
                          {product.farmer?.name} - {product.farmer?.district},{' '}
                          {product.farmer?.state}
                        </span>
                      </div>
                      <div className="product-actions">
                        <button className="contact-btn">
                          <Phone size={16} />
                          Contact Farmer
                        </button>
                        {user?.role === 'consumer' && product.quantity > 0 && (
                          <button
                            className="buy-btn"
                            onClick={() => handleBuyProduct(product._id)}
                          >
                            Buy Now
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {activeTab === 'my-products' && (
          <div className="tab-content">
            <div className="my-products-header">
              <button
                className="add-product-btn"
                onClick={() => setShowAddProduct(true)}
              >
                <Plus size={20} />
                Add New Product
              </button>
            </div>

            {showAddProduct && (
              <div className="modal-overlay" onClick={() => setShowAddProduct(false)}>
                <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                  <div className="modal-header">
                    <h2>Add New Product</h2>
                    <button
                      className="close-btn"
                      onClick={() => setShowAddProduct(false)}
                    >
                      <X size={24} />
                    </button>
                  </div>

                  <form onSubmit={handleAddProduct} className="product-form">
                    {error && <div className="error-box">{error}</div>}

                    <div className="form-group">
                      <label htmlFor="name">Product Name</label>
                      <input
                        type="text"
                        id="name"
                        value={newProduct.name}
                        onChange={(e) =>
                          setNewProduct({ ...newProduct, name: e.target.value })
                        }
                        required
                      />
                    </div>

                    <div className="form-row">
                      <div className="form-group">
                        <label htmlFor="price">Price (₹)</label>
                        <input
                          type="number"
                          id="price"
                          value={newProduct.price}
                          onChange={(e) =>
                            setNewProduct({ ...newProduct, price: e.target.value })
                          }
                          required
                          step="0.01"
                        />
                      </div>

                      <div className="form-group">
                        <label htmlFor="quantity">Quantity</label>
                        <input
                          type="number"
                          id="quantity"
                          value={newProduct.quantity}
                          onChange={(e) =>
                            setNewProduct({ ...newProduct, quantity: e.target.value })
                          }
                          required
                        />
                      </div>
                    </div>

                    <div className="form-group">
                      <label htmlFor="description">Description</label>
                      <textarea
                        id="description"
                        value={newProduct.description}
                        onChange={(e) =>
                          setNewProduct({ ...newProduct, description: e.target.value })
                        }
                        rows="3"
                      ></textarea>
                    </div>

                    <div className="form-group">
                      <label htmlFor="image">Image URL (optional)</label>
                      <input
                        type="url"
                        id="image"
                        value={newProduct.image}
                        onChange={(e) =>
                          setNewProduct({ ...newProduct, image: e.target.value })
                        }
                        placeholder="https://example.com/image.jpg"
                      />
                    </div>

                    <button type="submit" className="submit-btn">
                      Add Product
                    </button>
                  </form>
                </div>
              </div>
            )}

            <div className="products-grid">
              {loading ? (
                <p>Loading your products...</p>
              ) : myProducts.length === 0 ? (
                <p className="empty-state">You haven't added any products yet</p>
              ) : (
                myProducts.map((product) => (
                  <div key={product._id} className="product-card">
                    <div className="product-image">
                      {product.image ? (
                        <img src={product.image} alt={product.name} />
                      ) : (
                        <div className="image-placeholder">
                          <Package size={48} color="#999" />
                        </div>
                      )}
                    </div>
                    <div className="product-info">
                      <h3>{product.name}</h3>
                      <p className="product-description">
                        {product.description || 'No description'}
                      </p>
                      <div className="product-meta">
                        <span className="price">₹{product.price}/unit</span>
                        <span className="quantity">Stock: {product.quantity}</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {activeTab === 'my-orders' && (
          <div className="tab-content">
            <div className="orders-list">
              {loading ? (
                <p>Loading your orders...</p>
              ) : myOrders.length === 0 ? (
                <p className="empty-state">You haven't placed any orders yet</p>
              ) : (
                myOrders.map((order) => (
                  <div key={order._id} className="order-card">
                    <div className="order-header">
                      <h3>{order.product?.name}</h3>
                      <span className={`order-status status-${order.status}`}>
                        {order.status}
                      </span>
                    </div>
                    <div className="order-details">
                      <p>
                        <strong>Quantity:</strong> {order.quantity}
                      </p>
                      <p>
                        <strong>Total Price:</strong> ₹{order.totalPrice}
                      </p>
                      <p>
                        <strong>Order Date:</strong>{' '}
                        {new Date(order.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FarmHub;
