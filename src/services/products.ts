import { Router, Request, Response } from "express";
import prisma from "../lib/prisma";
import { ProductStatus } from "../generated/prisma/client";

const router = Router();

/**
 * Get safe string ID from params
 */
const getId = (id: string | string[]): string => {
  const value = Array.isArray(id) ? id[0] : id;

  if (!value) {
    throw new Error("Invalid product ID");
  }

  return value;
};

/**
 * ============================================
 * Create Product
 * ============================================
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
      categoryId,
    } = req.body;

    // Required fields
    if (
      !title ||
      price === undefined ||
      stock === undefined ||
      !categoryId
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Title, price, stock, and categoryId are required",
        data: null,
      });
    }

    // Validate title
    if (
      typeof title !== "string" ||
      title.trim().length === 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Title must be a valid string",
        data: null,
      });
    }

    // Validate price
    if (typeof price !== "number" || price <= 0) {
      return res.status(400).json({
        success: false,
        message: "Price must be a positive number",
        data: null,
      });
    }

    // Validate stock
    if (!Number.isInteger(stock) || stock < 0) {
      return res.status(400).json({
        success: false,
        message: "Stock must be a non-negative integer",
        data: null,
      });
    }

    // Validate categoryId
    if (
      typeof categoryId !== "string" ||
      categoryId.trim().length === 0
    ) {
      return res.status(400).json({
        success: false,
        message: "categoryId must be a valid string",
        data: null,
      });
    }

    // Check category
    const category = await prisma.category.findFirst({
      where: {
        id: categoryId,
        isDeleted: false,
      },
    });

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
        data: null,
      });
    }

    // Validate status
    if (
      status !== undefined &&
      !Object.values(ProductStatus).includes(
        status as ProductStatus
      )
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid product status",
        data: null,
      });
    }

    // Validate isAvailable
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
        title: title.trim(),

        description:
          description !== undefined
            ? description
            : null,

        price,

        stock,

        image:
          image !== undefined
            ? image
            : null,

        status:
          status !== undefined
            ? (status as ProductStatus)
            : ProductStatus.AVAILABLE,

        isAvailable:
          isAvailable !== undefined
            ? isAvailable
            : true,

        categoryId,
      },

      include: {
        category: true,
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

/**
 * ============================================
 * Get All Products
 * ============================================
 */
router.get("/", async (_req: Request, res: Response) => {
  try {
    const products = await prisma.product.findMany({
      where: {
        isDeleted: false,
      },

      include: {
        category: true,
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

/**
 * ============================================
 * Get Product By ID
 * ============================================
 */
router.get("/:id", async (req: Request, res: Response) => {
  try {
    const id = getId(req.params.id);

    const product = await prisma.product.findFirst({
      where: {
        id,
        isDeleted: false,
      },

      include: {
        category: true,
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

/**
 * ============================================
 * Update Product
 * ============================================
 */
router.patch("/:id", async (req: Request, res: Response) => {
  try {
    const id = getId(req.params.id);

    const {
      title,
      description,
      price,
      stock,
      image,
      status,
      isAvailable,
      categoryId,
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

    // Validate title
    if (title !== undefined) {
      if (
        typeof title !== "string" ||
        title.trim().length === 0
      ) {
        return res.status(400).json({
          success: false,
          message: "Title must be a valid string",
          data: null,
        });
      }
    }

    // Validate description
    if (
      description !== undefined &&
      description !== null &&
      typeof description !== "string"
    ) {
      return res.status(400).json({
        success: false,
        message: "Description must be a string",
        data: null,
      });
    }

    // Validate price
    if (price !== undefined) {
      if (
        typeof price !== "number" ||
        price <= 0
      ) {
        return res.status(400).json({
          success: false,
          message: "Price must be a positive number",
          data: null,
        });
      }
    }

    // Validate stock
    if (stock !== undefined) {
      if (
        !Number.isInteger(stock) ||
        stock < 0
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Stock must be a non-negative integer",
          data: null,
        });
      }
    }

    // Validate categoryId
    if (categoryId !== undefined) {
      if (
        typeof categoryId !== "string" ||
        categoryId.trim().length === 0
      ) {
        return res.status(400).json({
          success: false,
          message: "categoryId must be a valid string",
          data: null,
        });
      }

      // Check new category
      const category = await prisma.category.findFirst({
        where: {
          id: categoryId,
          isDeleted: false,
        },
      });

      if (!category) {
        return res.status(404).json({
          success: false,
          message: "Category not found",
          data: null,
        });
      }
    }

    // Validate status
    if (
      status !== undefined &&
      !Object.values(ProductStatus).includes(
        status as ProductStatus
      )
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid product status",
        data: null,
      });
    }

    // Validate isAvailable
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
        ...(title !== undefined && {
          title: title.trim(),
        }),

        ...(description !== undefined && {
          description,
        }),

        ...(price !== undefined && {
          price,
        }),

        ...(stock !== undefined && {
          stock,
        }),

        ...(image !== undefined && {
          image,
        }),

        ...(status !== undefined && {
          status: status as ProductStatus,
        }),

        ...(isAvailable !== undefined && {
          isAvailable,
        }),

        ...(categoryId !== undefined && {
          categoryId,
        }),
      },

      include: {
        category: true,
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

/**
 * ============================================
 * Delete Product
 * ============================================
 */
router.delete("/:id", async (req: Request, res: Response) => {
  try {
    const id = getId(req.params.id);

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

    
    const deletedProduct = await prisma.product.update({
      where: {
        id,
      },

      data: {
        isDeleted: true,
        isAvailable: false,
        status: ProductStatus.DISCONTINUED,
      },

      include: {
        category: true,
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