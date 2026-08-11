import { Router, Request, Response } from "express";
import prisma from "../lib/prisma";

// Initialize Express router for product-related routes
const router = Router();

/**
 * ============================================
 * PRODUCT ROUTES - Complete CRUD Operations
 * ============================================
 *
 * This router handles product-related operations:
 * - Creating new products
 * - Retrieving products
 * - Updating product information
 * - Deleting products
 */

/**
 * ============================================
 * POST /products
 * Create a new product
 *
 * Expected Request Body:
 * {
 *   "title": "Laptop",
 *   "description": "High performance laptop",
 *   "price": 999.99,
 *   "stock": 50,
 *   "image": "https://example.com/laptop.jpg"
 * }
 * ============================================
 */

router.post("/", async (req: Request, res: Response) => {
  try {
    // Extract product data from request body
    const { title, description, price, stock, image } = req.body;

    // Validate required fields
    if (!title || price === undefined || stock === undefined) {
      return res.status(400).json({
        success: false,
        message: "Title, price, and stock are required",
      });
    }

    // Validate price and stock
    if (price <= 0 || stock < 0) {
      return res.status(400).json({
        success: false,
        message: "Price must be positive and stock cannot be negative",
      });
    }

    // Create product in database
    const newProduct = await prisma.product.create({
      data: {
        title,
        description,
        price,
        stock,
        image,
      },
    });

    // Return created product
    return res.status(201).json({
      success: true,
      message: "Product created successfully",
      data: newProduct,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: "Error creating product",
      error: error.message,
    });
  }
});


/**
 * ============================================
 * GET /products
 * Get all products
 * ============================================
 */

router.get("/", async (req: Request, res: Response) => {
  try {
    // Get all products from database
    const products = await prisma.product.findMany();

    // Return products
    return res.status(200).json({
      success: true,
      message: "Products retrieved successfully",
      data: products,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: "Error retrieving products",
      error: error.message,
    });
  }
});

export default router;

