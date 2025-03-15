export class PostModel {
  constructor(prisma) {
    this.prisma = prisma;
  }

  async createPost(input, posterId) {
      // 创建帖子
      const post = await this.prisma.post.create({
        data: {
          category: input.category,
          title: input.title,
          description: input.description,
          condition: input.condition,
          amount: input.amount,
          isNegotiable: input.isNegotiable,
          deliveryType: input.deliveryType,
          status: "ACTIVE",
          poster: {
            connect: { id: posterId },
          },
          images: {
            create: input.images.map(image => ({
              imageUrl: image.imageUrl,
              imageType: image.imageType,
            })),
          },
        },
        include: {
          poster: true,
          images: true,
        },
      });

      return post;
   
  }

  async getPostsByFilter(filter) {
      const posts = await this.prisma.post.findMany({
        where: {
          // 根据 filter 构建查询条件
          ...(filter.category && { category: filter.category }),
          ...(filter.condition && { condition: filter.condition }),
          ...(filter.deliveryType && { deliveryType: filter.deliveryType }),
          ...(filter.status && { status: filter.status }),
          ...(filter.minPrice && {
            amount: { gte: parseFloat(filter.minPrice) },
          }),
          ...(filter.maxPrice && {
            amount: { lte: parseFloat(filter.maxPrice) },
          }),
          ...(filter.search && {
            OR: [
              { title: { contains: filter.search, mode: "insensitive" } },
              { description: { contains: filter.search, mode: "insensitive" } },
            ],
          }),
        },
        include: {
          poster: true,
          images: true,
        },
        orderBy: {
          createdAt: "desc",
        },
      });
      return posts;
  }

  async getPostById(id) {
      const post = await this.prisma.post.findUnique({
        where: { id },
        include: {
          poster: true,
          images: true,
        },
      });

      if (!post) {
        return { data: null, error: null };
      }
      return post;
  
  }

  async getPostsByPosterId(posterId) {
      const posts = await this.prisma.post.findMany({
        where: {
          posterId,
          status: {
            not: "DELETED",
          },
        },
        include: {
          poster: true,
          images: true,
        },
        orderBy: {
          createdAt: "desc",
        },
      });
      return posts;
  
  }

}
