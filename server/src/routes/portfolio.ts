import { Router } from 'express';
import prisma from '../db.js';
import { getAllPrices } from '../priceService.js';

const router = Router();

const INITIAL_CASH = 100000;

// 获取或创建 demo 用户
async function getDemoUser() {
  let user = await prisma.user.findUnique({
    where: { username: 'demo_user' }
  });

  if (!user) {
    user = await prisma.user.create({
      data: { username: 'demo_user', currentCash: INITIAL_CASH }
    });
  }

  return user;
}

/**
 * GET /api/portfolio
 * 获取持仓概览
 */
router.get('/', async (req, res) => {
  try {
    const user = await getDemoUser();
    const positions = await prisma.position.findMany({
      where: { userId: user.id }
    });

    // 获取实时价格
    const prices = await getAllPrices();

    // 计算持仓价值
    const positionsWithValue = positions.map(pos => {
      const coinPrice = prices[pos.coinId]?.usd || parseFloat(pos.avgCost.toString());
      const amount = parseFloat(pos.amount.toString());
      const avgCost = parseFloat(pos.avgCost.toString());
      const totalCost = parseFloat(pos.totalCost.toString());
      const currentValue = amount * coinPrice;
      const pnl = currentValue - totalCost;
      const pnlPct = ((coinPrice / avgCost) - 1) * 100;

      return {
        symbol: pos.symbol,
        coinId: pos.coinId,
        name: pos.name,
        icon: pos.icon,
        amount,
        avgCost,
        totalCost,
        currentPrice: coinPrice,
        currentValue,
        pnl,
        pnlPct
      };
    });

    const cash = parseFloat(user.currentCash.toString());
    const totalPositionValue = positionsWithValue.reduce((sum, p) => sum + p.currentValue, 0);
    const totalAssets = cash + totalPositionValue;
    const totalPnL = totalAssets - INITIAL_CASH;
    const totalPnLPct = ((totalAssets / INITIAL_CASH) - 1) * 100;

    res.json({
      success: true,
      cash,
      positions: positionsWithValue,
      summary: {
        totalAssets,
        totalPositionValue,
        totalPnL,
        totalPnLPct,
        initialCash: INITIAL_CASH
      }
    });
  } catch (error: any) {
    console.error('❌ 获取持仓失败:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

export default router;
