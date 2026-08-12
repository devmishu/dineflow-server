import { Router, Request, Response } from "express";
import prisma from "../lib/prisma";

const router = Router();

/**
 * Get a safe string ID from Express params
 */
const getId = (id: string | string[]): string => {
  const value = Array.isArray(id) ? id[0] : id;

  if (!value) {
    throw new Error("Invalid category ID");
  }

  return value;
};

/**
 * ============================================
 * Create Category
 * ============================================
 */
router.post("/", async (req: Request, res: Response) => {
  try {
    const { name, description, image } = req.body;

    // Validate name
    if (
      !name ||
      typeof name !== "string" ||
      !name.trim()
    ) {
      return res.status(400).json({
        success: false,
        message: "Category name is required",
        data: null,
      });
    }

    const categoryName = name.trim();

    // Check duplicate category
    const existingCategory = await prisma.category.findFirst({
      where: {
        name: categoryName,
        isDeleted: false,
      },
    });

    if (existingCategory) {
      return res.status(409).json({
        success: false,
        message: "Category already exists",
        data: null,
      });
    }

    // Create category
    const category = await prisma.category.create({
      data: {
        name: categoryName,
        description: description ?? null,
        image: image ?? null,
      },
    });

    return res.status(201).json({
      success: true,
      message: "Category created successfully",
      data: category,
    });
  } catch (error) {
    console.error("Create category error:", error);

    return res.status(500).json({
      success: false,
      message: "Error creating category",
      data: null,
    });
  }
});

/**
 * ============================================
 * Get All Categories
 * ============================================
 */
router.get("/", async (_req: Request, res: Response) => {
  try {
    const categories = await prisma.category.findMany({
      where: {
        isDeleted: false,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return res.status(200).json({
      success: true,
      message: "Categories retrieved successfully",
      data: categories,
    });
  } catch (error) {
    console.error("Get categories error:", error);

    return res.status(500).json({
      success: false,
      message: "Error retrieving categories",
      data: null,
    });
  }
});

/**
 * ============================================
 * Get Category By ID
 * ============================================
 */
router.get("/:id", async (req: Request, res: Response) => {
  try {
    const id = getId(req.params.id);

    const category = await prisma.category.findFirst({
      where: {
        id,
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

    return res.status(200).json({
      success: true,
      message: "Category retrieved successfully",
      data: category,
    });
  } catch (error) {
    console.error("Get category error:", error);

    return res.status(500).json({
      success: false,
      message: "Error retrieving category",
      data: null,
    });
  }
});

/**
 * ============================================
 * Update Category
 * ============================================
 */
router.patch("/:id", async (req: Request, res: Response) => {
  try {
    const id = getId(req.params.id);

    const {
      name,
      description,
      image,
    } = req.body;

    // Check existing category
    const existingCategory = await prisma.category.findFirst({
      where: {
        id,
        isDeleted: false,
      },
    });

    if (!existingCategory) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
        data: null,
      });
    }

    // Validate name if provided
    if (name !== undefined) {
      if (
        typeof name !== "string" ||
        !name.trim()
      ) {
        return res.status(400).json({
          success: false,
          message: "Category name must be a valid string",
          data: null,
        });
      }

      // Check duplicate name
      const duplicateCategory =
        await prisma.category.findFirst({
          where: {
            name: name.trim(),
            isDeleted: false,
            NOT: {
              id,
            },
          },
        });

      if (duplicateCategory) {
        return res.status(409).json({
          success: false,
          message: "Category name already exists",
          data: null,
        });
      }
    }

    // Update category
    const updatedCategory =
      await prisma.category.update({
        where: {
          id,
        },
        data: {
          ...(name !== undefined && {
            name: name.trim(),
          }),

          ...(description !== undefined && {
            description,
          }),

          ...(image !== undefined && {
            image,
          }),
        },
      });

    return res.status(200).json({
      success: true,
      message: "Category updated successfully",
      data: updatedCategory,
    });
  } catch (error) {
    console.error("Update category error:", error);

    return res.status(500).json({
      success: false,
      message: "Error updating category",
      data: null,
    });
  }
});

/**
 * ============================================
 * Delete Category
 * ============================================
 */
router.delete("/:id", async (req: Request, res: Response) => {
  try {
    const id = getId(req.params.id);

    // Check existing category
    const existingCategory = await prisma.category.findFirst({
      where: {
        id,
        isDeleted: false,
      },
    });

    if (!existingCategory) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
        data: null,
      });
    }

    
    const deletedCategory =
      await prisma.category.update({
        where: {
          id,
        },
        data: {
          isDeleted: true,
        },
      });

    return res.status(200).json({
      success: true,
      message: "Category deleted successfully",
      data: deletedCategory,
    });
  } catch (error) {
    console.error("Delete category error:", error);

    return res.status(500).json({
      success: false,
      message: "Error deleting category",
      data: null,
    });
  }
});

export default router;