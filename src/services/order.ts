import { Router, Request, Response } from "express";
import prisma from "../lib/prisma";

const router = Router();

/**
 * ============================================
 * Create Order
 * ============================================
 */
router.post("/", async (req: Request, res: Response) => {
  try {
    const { userId, items } = req.body;

    if (!userId || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "userId and items are required",
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

    // Validate items
    for (const item of items) {
      if (
        !item.productId ||
        !Number.isInteger(item.quantity) ||
        item.quantity <= 0
      ) {
        return res.status(400).json({
          success: false,
          message: "Each item must have productId and valid quantity",
          data: null,
        });
      }
    }

    // Get products
    const productIds = items.map(
      (item: { productId: string }) => item.productId
    );

    const products = await prisma.product.findMany({
      where: {
        id: {
          in: productIds,
        },
        isDeleted: false,
        isAvailable: true,
      },
    });

    if (products.length !== productIds.length) {
      return res.status(404).json({
        success: false,
        message: "One or more products not found or unavailable",
        data: null,
      });
    }

    // Create order items
    const orderItems = items.map(
      (item: { productId: string; quantity: number }) => {
        const product = products.find(
          (p) => p.id === item.productId
        );

        if (!product) {
          throw new Error("Product not found");
        }

        if (product.stock < item.quantity) {
          throw new Error(
            `Not enough stock for ${product.title}`
          );
        }

        return {
          productId: product.id,
          quantity: item.quantity,
          price: product.price,
          subtotal: product.price * item.quantity,
        };
      }
    );

    const totalAmount = orderItems.reduce(
      (total, item) => total + item.subtotal,
      0
    );

    const order = await prisma.order.create({
      data: {
        userId,
        totalAmount,
        status: "PENDING",
        items: {
          create: orderItems,
        },
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    // Update product stock
    for (const item of orderItems) {
      await prisma.product.update({
        where: {
          id: item.productId,
        },
        data: {
          stock: {
            decrement: item.quantity,
          },
        },
      });
    }

    return res.status(201).json({
      success: true,
      message: "Order created successfully",
      data: order,
    });
  } catch (error) {
    console.error("Create order error:", error);

    return res.status(500).json({
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Error creating order",
      data: null,
    });
  }
});

/**
 * ============================================
 * Get All Orders
 * ============================================
 */
router.get("/", async (_req: Request, res: Response) => {
  try {
    const orders = await prisma.order.findMany({
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
        items: {
          include: {
            product: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return res.status(200).json({
      success: true,
      message: "Orders retrieved successfully",
      data: orders,
    });
  } catch (error) {
    console.error("Get orders error:", error);

    return res.status(500).json({
      success: false,
      message: "Error retrieving orders",
      data: null,
    });
  }
});

/**
 * ============================================
 * Get Order By ID
 * ============================================
 */
router.get("/:id", async (req: Request, res: Response) => {
  try {
    const id = Array.isArray(req.params.id)
      ? req.params.id[0]
      : req.params.id;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Invalid order ID",
        data: null,
      });
    }

    const order = await prisma.order.findFirst({
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
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
        data: null,
      });
    }

    return res.status(200).json({
      success: true,
      message: "Order retrieved successfully",
      data: order,
    });
  } catch (error) {
    console.error("Get order error:", error);

    return res.status(500).json({
      success: false,
      message: "Error retrieving order",
      data: null,
    });
  }
});

/**
 * ============================================
 * Update Order
 * ============================================
 */
router.patch("/:id", async (req: Request, res: Response) => {
  try {
    const id = Array.isArray(req.params.id)
      ? req.params.id[0]
      : req.params.id;

    const { status } = req.body;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Invalid order ID",
        data: null,
      });
    }

    const existingOrder = await prisma.order.findFirst({
      where: {
        id,
        isDeleted: false,
      },
    });

    if (!existingOrder) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
        data: null,
      });
    }

    const validStatuses = [
      "PENDING",
      "CONFIRMED",
      "PREPARING",
      "DELIVERED",
      "CANCELLED",
    ];

    if (
      status !== undefined &&
      !validStatuses.includes(status)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid order status",
        data: null,
      });
    }

    const updatedOrder = await prisma.order.update({
      where: {
        id,
      },
      data: {
        ...(status !== undefined && {
          status,
        }),
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    return res.status(200).json({
      success: true,
      message: "Order updated successfully",
      data: updatedOrder,
    });
  } catch (error) {
    console.error("Update order error:", error);

    return res.status(500).json({
      success: false,
      message: "Error updating order",
      data: null,
    });
  }
});

/**
 * ============================================
 * Delete Order
 * ============================================
 */
router.delete("/:id", async (req: Request, res: Response) => {
  try {
    const id = Array.isArray(req.params.id)
      ? req.params.id[0]
      : req.params.id;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Invalid order ID",
        data: null,
      });
    }

    const existingOrder = await prisma.order.findFirst({
      where: {
        id,
        isDeleted: false,
      },
    });

    if (!existingOrder) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
        data: null,
      });
    }

    const deletedOrder = await prisma.order.update({
      where: {
        id,
      },
      data: {
        isDeleted: true,
      },
    });

    return res.status(200).json({
      success: true,
      message: "Order deleted successfully",
      data: deletedOrder,
    });
  } catch (error) {
    console.error("Delete order error:", error);

    return res.status(500).json({
      success: false,
      message: "Error deleting order",
      data: null,
    });
  }
});

export default router;