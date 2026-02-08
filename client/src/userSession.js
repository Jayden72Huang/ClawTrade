/**
 * 用户会话管理 - 为每个浏览器生成唯一ID
 */

const USER_ID_KEY = 'clawtrade_user_id';

/**
 * 获取或生成用户ID
 */
export function getUserId() {
  let userId = localStorage.getItem(USER_ID_KEY);

  if (!userId) {
    // 生成唯一ID: user_时间戳_随机字符串
    userId = `user_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    localStorage.setItem(USER_ID_KEY, userId);
    console.log('🆔 生成新用户ID:', userId);
  }

  return userId;
}

/**
 * 重置用户ID（清除账户）
 */
export function resetUserId() {
  localStorage.removeItem(USER_ID_KEY);
  console.log('🔄 用户ID已重置');
}

/**
 * 获取用户显示名称
 */
export function getUserDisplayName() {
  const userId = getUserId();
  // 取最后6位作为显示名称
  return userId.slice(-6).toUpperCase();
}
