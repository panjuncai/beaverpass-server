export class UserModel {
  constructor(prisma) {
    this.prisma = prisma;
  }

  // 验证用户
  async verifyUser(verifyToken) {
    const user = await this.prisma.user.findFirst({
      where: {
        verificationToken: verifyToken,
      },
    });
    return user;
  }

  // 通过邮箱获取用户
  async getUserByEmail(email) {
    const user = await this.prisma.user.findUnique({
      where: {
        email: email,
      },
    });
    return user;
  }

  // 通过 ID 获取用户
  async getUserById(id) {
    const user = await this.prisma.user.findUnique({
      where: {
        id: id,
      },
    });
    return user;
  }

  // 更新用户
  async updateUser(input) {
    const user = await this.prisma.user.update({
      where: {
        id: input.id,
      },
      data: input,
    });
    return user;
  }
}
