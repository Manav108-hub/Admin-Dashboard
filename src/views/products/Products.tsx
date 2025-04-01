import React, { useState, useEffect } from "react";
import { 
    Table,
    Button,
    Modal,
    TextInput,
    Label,
    Dropdown,
    Badge
} from "flowbite-react";
import { HiOutlineDotsVertical, HiPlus } from "react-icons/hi";
import { createProduct, updateProduct, deleteProduct, fetchProducts } from "src/services/productServices";
import { Product } from "src/types/products/products";

const ProductManagement: React.FC = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [currentProduct, setCurrentProduct] = useState<Partial<Product>>({});
    const [imageFiles, setImageFiles] = useState<File[]>([]);
    const [isEditMode, setIsEditMode] = useState(false);

    useEffect(() => {
        const loadProducts = async () => {
          try {
            const fetchedProducts = await fetchProducts();
            setProducts(fetchedProducts);
          } catch (error) {
            console.error('Failed to fetch products', error);
          }
        };
        loadProducts();
    }, []);
    
    const handleSubmitProduct = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
          if (isEditMode && currentProduct.id) {
            // Update existing product
            await updateProduct(
              currentProduct.id, 
              {
                name: currentProduct.name || '',
                description: currentProduct.description || '',
                price: currentProduct.price || 0,
                sizes: currentProduct.sizes || [],
                stockQuantity: currentProduct.stockQuantity || 0,
              }, 
              imageFiles
            );
    
            // Update local state
            setProducts(products.map(p => 
              p.id === currentProduct.id 
                ? { ...p, ...currentProduct, imageUrls: [...(p.imageUrls || []), ...(currentProduct.imageUrls || [])] } 
                : p
            ));
          } else {
            // Create new product
            const newProduct = await createProduct(
              {
                name: currentProduct.name || '',
                description: currentProduct.description || '',
                price: currentProduct.price || 0,
                sizes: currentProduct.sizes || [],
                stockQuantity: currentProduct.stockQuantity || 0,
                imageUrls: []
              },
              imageFiles
            );
            
            setProducts([...products, newProduct]);
        }
          
          // Reset form and close modal
          setIsAddModalOpen(false);
          setCurrentProduct({});
          setImageFiles([]);
          setIsEditMode(false);
        } catch (error) {
          console.error('Failed to save product', error);
        }
    };
    
      // Handler for deleting a product
    const handleDeleteProduct = async (productId: string) => {
        try {
          await deleteProduct(productId);
          setProducts(products.filter(p => p.id !== productId));
        } catch (error) {
          console.error('Failed to delete product', error);
        }
    };
    
      // Handler for editing a product
    const handleEditProduct = (product: Product) => {
        setCurrentProduct(product);
        setIsEditMode(true);
        setIsAddModalOpen(true);
    };
    
      // Handler for image file selection
    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
          setImageFiles(Array.from(e.target.files));
        }
    };

    return (
        <div className="max-w-4xl mx-auto mt-8 p-4">
            <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold">Product Management</h2>
            <Button 
                onClick={() => {
                setCurrentProduct({});
                setIsEditMode(false);
                setIsAddModalOpen(true);
                }}
                color="primary"
            >
                <HiPlus className="mr-2" /> Add Product
            </Button>
            </div>

            {/* Products Table */}
            <div className="overflow-x-auto">
            <Table hoverable>
                <Table.Head>
                <Table.HeadCell>Product</Table.HeadCell>
                <Table.HeadCell>Price</Table.HeadCell>
                <Table.HeadCell>Stock</Table.HeadCell>
                <Table.HeadCell>Sizes</Table.HeadCell>
                <Table.HeadCell>Actions</Table.HeadCell>
                </Table.Head>
                <Table.Body className="divide-y">
                {products.map((product) => (
                    <Table.Row key={product.id}>
                    <Table.Cell>
                        <div className="flex items-center">
                        {product.imageUrls && product.imageUrls.length > 0 && (
                            <img 
                            src={product.imageUrls[0]} 
                            alt={product.name} 
                            className="h-12 w-12 mr-3 rounded-md object-cover"
                            />
                        )}
                        <div>
                            <div className="text-base font-semibold">{product.name}</div>
                            <div className="text-sm text-gray-500">{product.description}</div>
                        </div>
                        </div>
                    </Table.Cell>
                    <Table.Cell>${product.price.toFixed(2)}</Table.Cell>
                    <Table.Cell>
                        <Badge color={product.stockQuantity > 0 ? 'success' : 'failure'}>
                        {product.stockQuantity}
                        </Badge>
                    </Table.Cell>
                    <Table.Cell>{product.sizes.join(', ')}</Table.Cell>
                    <Table.Cell>
                        <Dropdown
                        label=""
                        dismissOnClick={false}
                        renderTrigger={() => (
                            <Button size="sm" color="light">
                            <HiOutlineDotsVertical />
                            </Button>
                        )}
                        >
                        <Dropdown.Item onClick={() => handleEditProduct(product)}>Edit</Dropdown.Item>
                        <Dropdown.Item 
                            onClick={() => handleDeleteProduct(product.id || '')}
                            className="text-red-600"
                        >
                            Delete
                        </Dropdown.Item>
                        </Dropdown>
                    </Table.Cell>
                    </Table.Row>
                ))}
                </Table.Body>
            </Table>
            </div>

            {/* Product Modal (Add/Edit) */}
            <Modal 
            show={isAddModalOpen} 
            onClose={() => {
                setIsAddModalOpen(false);
                setCurrentProduct({});
                setIsEditMode(false);
            }}
            size="md"
            >
            <Modal.Header>{isEditMode ? 'Edit Product' : 'Add New Product'}</Modal.Header>
            <Modal.Body>
                <form onSubmit={handleSubmitProduct} className="space-y-4">
                <div>
                    <Label htmlFor="name">Product Name</Label>
                    <TextInput
                    id="name"
                    placeholder="Enter product name"
                    value={currentProduct.name || ''}
                    onChange={(e) => setCurrentProduct({...currentProduct, name: e.target.value})}
                    required
                    />
                </div>
                <div>
                    <Label htmlFor="description">Description</Label>
                    <TextInput
                    id="description"
                    placeholder="Enter product description"
                    value={currentProduct.description || ''}
                    onChange={(e) => setCurrentProduct({...currentProduct, description: e.target.value})}
                    />
                </div>
                <div>
                    <Label htmlFor="price">Price</Label>
                    <TextInput
                    id="price"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="Enter price"
                    value={currentProduct.price || ''}
                    onChange={(e) => setCurrentProduct({...currentProduct, price: parseFloat(e.target.value)})}
                    required
                    />
                </div>
                <div>
                    <Label htmlFor="sizes">Sizes (comma-separated)</Label>
                    <TextInput
                    id="sizes"
                    placeholder="S, M, L, XL"
                    value={(currentProduct.sizes || []).join(', ')}
                    onChange={(e) => setCurrentProduct({...currentProduct, sizes: e.target.value.split(',').map(s => s.trim())})}
                    />
                </div>
                <div>
                    <Label htmlFor="stockQuantity">Stock Quantity</Label>
                    <TextInput
                    id="stockQuantity"
                    type="number"
                    min="0"
                    placeholder="Enter stock quantity"
                    value={currentProduct.stockQuantity || ''}
                    onChange={(e) => setCurrentProduct({...currentProduct, stockQuantity: parseInt(e.target.value)})}
                    required
                    />
                </div>
                <div>
                    <Label htmlFor="images">Product Images</Label>
                    <TextInput
                    id="images"
                    type="file"
                    multiple
                    onChange={handleImageUpload}
                    />
                    {currentProduct.imageUrls && currentProduct.imageUrls.length > 0 && (
                    <div className="mt-2 flex gap-2">
                        {currentProduct.imageUrls.map((url, index) => (
                        <img 
                            key={index} 
                            src={url} 
                            alt={`Product image ${index + 1}`} 
                            className="h-20 w-20 object-cover rounded-md"
                        />
                        ))}
                    </div>
                    )}
                </div>
                <Button type="submit" color="primary" className="w-full">
                    {isEditMode ? 'Update Product' : 'Save Product'}
                </Button>
                </form>
            </Modal.Body>
            </Modal>
        </div>
    );
};

export default ProductManagement;