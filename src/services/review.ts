import { Router, Request, Response } from "express";
import prisma from "../lib/prisma";

const router = Router();

// ============================================
// POST /reviews
// Create Review
// ============================================

router.post("/", async (req: Request, res: Response) => {
  try {
    const { userId, productId, rating, comment } = req.body;

    // Required fields
    if (!userId || !productId || rating === undefined) {
      return res.status(400).json({
        success: false,
        message: "User ID, product ID and rating are required",
        data: null,
      });
    }

    // Validate rating
    if (
      typeof rating !== "number" ||
      !Number.isInteger(rating) ||
      rating < 1 ||
      rating > 5
    ) {
      return res.status(400).json({
        success: false,
        message: "Rating must be an integer between 1 and 5",
        data: null,
      });
    }

    // Check user
    const user = await prisma.user.findFirst({
      where: {
        id: userId,
        isDeleted: false,
      },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
        data: null,
      });
    }

    // Check product
    const product = await prisma.product.findFirst({
      where: {
        id: productId,
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

    // Check duplicate review
    const existingReview = await prisma.review.findFirst({
      where: {
        userId,
        productId,
        isDeleted: false,
      },
    });

    if (existingReview) {
      return res.status(409).json({
        success: false,
        message: "You have already reviewed this product",
        data: null,
      });
    }

    // Create review
    const review = await prisma.review.create({
      data: {
        userId,
        productId,
        rating,
        comment: comment ?? null,
      },
    });

    return res.status(201).json({
      success: true,
      message: "Review created successfully",
      data: review,
    });
  } catch (error) {
    console.error("Create review error:", error);

    return res.status(500).json({
      success: false,
      message: "Error creating review",
      data: null,
    });
  }
});

// ============================================
// GET /reviews
// Get All Reviews
// ============================================

router.get("/", async (_req: Request, res: Response) => {
  try {
    const reviews = await prisma.review.findMany({
      where: {
        isDeleted: false,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        product: {
          select: {
            id: true,
            title: true,
            image: true,
            price: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return res.status(200).json({
      success: true,
      message: "Reviews retrieved successfully",
      data: reviews,
    });
  } catch (error) {
    console.error("Get reviews error:", error);

    return res.status(500).json({
      success: false,
      message: "Error retrieving reviews",
      data: null,
    });
  }
});

// ============================================
// GET /reviews/:id
// Get Review By ID
// ============================================

router.get("/:id", async (req: Request, res: Response) => {
  try {
    const id = Array.isArray(req.params.id)
      ? req.params.id[0]
      : req.params.id;

    const review = await prisma.review.findFirst({
      where: {
        id,
        isDeleted: false,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        product: {
          select: {
            id: true,
            title: true,
            image: true,
            price: true,
          },
        },
      },
    });

    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Review not found",
        data: null,
      });
    }

    return res.status(200).json({
      success: true,
      message: "Review retrieved successfully",
      data: review,
    });
  } catch (error) {
    console.error("Get review error:", error);

    return res.status(500).json({
      success: false,
      message: "Error retrieving review",
      data: null,
    });
  }
});

// ============================================
// GET /reviews/product/:productId
// Get Reviews By Product
// ============================================

router.get(
  "/product/:productId",
  async (req: Request, res: Response) => {
    try {
      const productId = Array.isArray(req.params.productId)
        ? req.params.productId[0]
        : req.params.productId;

      const reviews = await prisma.review.findMany({
        where: {
          productId,
          isDeleted: false,
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      });

      return res.status(200).json({
        success: true,
        message: "Product reviews retrieved successfully",
        data: reviews,
      });
    } catch (error) {
      console.error("Get product reviews error:", error);

      return res.status(500).json({
        success: false,
        message: "Error retrieving product reviews",
        data: null,
      });
    }
  }
);

export default router;