import { Router, Request, Response } from "express";
import prisma from "../lib/prisma";
import { ProductStatus } from "../generated/prisma/client";

const router = Router();

/*
============================================
POST /api/products
Create Product
============================================
*/

router.post("/", async (req: Request, res: Response) => {
  try {
    const {
      title,
      description,
      price,
      stock,
      image,
      status,
      isAvailable,
    } = req.body;

    // Required field validation
    if (!title || price === undefined || stock === undefined) {
      return res.status(400).json({
        success: false,
        message: "Title, price, and stock are required",
        data: null,
      });
    }

    // Price validation
    if (typeof price !== "number" || price <= 0) {
      return res.status(400).json({
        success: false,
        message: "Price must be a positive number",
        data: null,
      });
    }

    // Stock validation
    if (!Number.isInteger(stock) || stock < 0) {
      return res.status(400).json({
        success: false,
        message: "Stock must be a non-negative integer",
        data: null,
      });
    }

    // Status validation
    if (
      status !== undefined &&
      !Object.values(ProductStatus).includes(status)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid product status",
        data: null,
      });
    }

    // isAvailable validation
    if (
      isAvailable !== undefined &&
      typeof isAvailable !== "boolean"
    ) {
      return res.status(400).json({
        success: false,
        message: "isAvailable must be a boolean",
        data: null,
      });
    }

    // Create product
    const newProduct = await prisma.product.create({
      data: {
        title,
        description,
        price,
        stock,
        image,
        status,
        isAvailable,
      },
    });

    return res.status(201).json({
      success: true,
      message: "Product created successfully",
      data: newProduct,
    });
  } catch (error) {
    console.error("Create product error:", error);

    return res.status(500).json({
      success: false,
      message: "Error creating product",
      data: null,
    });
  }
});

/*
============================================
GET /api/products
Get All Products
============================================
*/

router.get("/", async (_req: Request, res: Response) => {
  try {
    const products = await prisma.product.findMany({
      where: {
        isDeleted: false,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return res.status(200).json({
      success: true,
      message: "Products retrieved successfully",
      data: products,
    });
  } catch (error) {
    console.error("Get products error:", error);

    return res.status(500).json({
      success: false,
      message: "Error retrieving products",
      data: null,
    });
  }
});

/*
============================================
GET /api/products/:id
Get Product By ID
============================================
*/

router.get("/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const product = await prisma.product.findFirst({
      where: {
        id,
        isDeleted: false,
      },
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
        data: null,
      });
    }

    return res.status(200).json({
      success: true,
      message: "Product retrieved successfully",
      data: product,
    });
  } catch (error) {
    console.error("Get product error:", error);

    return res.status(500).json({
      success: false,
      message: "Error retrieving product",
      data: null,
    });
  }
});

/*
============================================
PATCH /api/products/:id
Update Product
============================================
*/

router.patch("/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const {
      title,
      description,
      price,
      stock,
      image,
      status,
      isAvailable,
    } = req.body;

    // Check existing product
    const existingProduct = await prisma.product.findFirst({
      where: {
        id,
        isDeleted: false,
      },
    });

    if (!existingProduct) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
        data: null,
      });
    }

    // Price validation
    if (price !== undefined) {
      if (typeof price !== "number" || price <= 0) {
        return res.status(400).json({
          success: false,
          message: "Price must be a positive number",
          data: null,
        });
      }
    }

    // Stock validation
    if (stock !== undefined) {
      if (!Number.isInteger(stock) || stock < 0) {
        return res.status(400).json({
          success: false,
          message: "Stock must be a non-negative integer",
          data: null,
        });
      }
    }

    // Status validation
    if (
      status !== undefined &&
      !Object.values(ProductStatus).includes(status)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid product status",
        data: null,
      });
    }

    // isAvailable validation
    if (
      isAvailable !== undefined &&
      typeof isAvailable !== "boolean"
    ) {
      return res.status(400).json({
        success: false,
        message: "isAvailable must be a boolean",
        data: null,
      });
    }

    // Update product
    const updatedProduct = await prisma.product.update({
      where: {
        id,
      },
      data: {
        ...(title !== undefined && { title }),
        ...(description !== undefined && { description }),
        ...(price !== undefined && { price }),
        ...(stock !== undefined && { stock }),
        ...(image !== undefined && { image }),
        ...(status !== undefined && { status }),
        ...(isAvailable !== undefined && { isAvailable }),
      },
    });

    return res.status(200).json({
      success: true,
      message: "Product updated successfully",
      data: updatedProduct,
    });
  } catch (error) {
    console.error("Update product error:", error);

    return res.status(500).json({
      success: false,
      message: "Error updating product",
      data: null,
    });
  }
});

/*
============================================
DELETE /api/products/:id
Soft Delete Product
============================================
*/

router.delete("/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Check existing product
    const existingProduct = await prisma.product.findFirst({
      where: {
        id,
        isDeleted: false,
      },
    });

    if (!existingProduct) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
        data: null,
      });
    }

    // Soft delete
    const deletedProduct = await prisma.product.update({
      where: {
        id,
      },
      data: {
        isDeleted: true,
        isAvailable: false,
        status: ProductStatus.DISCONTINUED,
      },
    });

    return res.status(200).json({
      success: true,
      message: "Product deleted successfully",
      data: deletedProduct,
    });
  } catch (error) {
    console.error("Delete product error:", error);

    return res.status(500).json({
      success: false,
      message: "Error deleting product",
      data: null,
    });
  }
});

export default router;