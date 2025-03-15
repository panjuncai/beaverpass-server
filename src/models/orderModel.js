export class OrderModel {
  constructor(prisma) {
    this.prisma = prisma;
  }

  async getOrdersBySellerId(sellerId) {
    const orders = await this.prisma.order.findMany({
      where: {
        sellerId,
      },
    });
    return orders;
  }

  async getOrdersByBuyerId(buyerId) {
    const orders = await this.prisma.order.findMany({
      where: {
        buyerId,
      },
    });
    return orders;
  }

  async getOrderById(id) {
    const order = await this.prisma.order.findUnique({
      where: {
        id,
      },
    });
    return order;
  }

  async createOrder(orderData) {
    const order = await this.prisma.order.create({
      data: orderData,
    });
    return order;
  }

  async updateOrder(orderData) {
    const order = await this.prisma.order.update({
      where: {
        id: orderData.id,
      },
      data: orderData,
    });
    return order;
  }

  async deleteOrder(id) {
    const order = await this.prisma.order.delete({
      where: { id },
    });
    return order;
  }
}
