export interface Product {
    id?: string;
    name: string;
    description: string;
    price: number;
    sizes: string[];
    stockQuantity: number;
    imageUrls: string[];
}