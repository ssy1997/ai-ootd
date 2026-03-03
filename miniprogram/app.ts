// app.ts

App<IAppOption>({
  globalData: {
    userInfo: null as UserInfo | null
  },

  onLaunch() {
    // 初始化云开发
    this.initCloud()
  },

  async initCloud() {
    try {
      wx.cloud.init({
        env: 'cloud1-2gtuuy4b46ac6fcb', // 需要替换为实际的云开发环境ID
        traceUser: true
      })
      console.log('云开发初始化成功')

      // 初始化数据库集合
      await this.initDatabase()
    } catch (err) {
      console.error('云开发初始化失败', err)
    }
  },

  async initDatabase() {
    try {
      const res = await wx.cloud.callFunction({
        name: 'database-init',
        data: { action: 'init' }
      })

      console.log('数据库初始化结果', res.result)
    } catch (err) {
      console.error('数据库初始化失败', err)
    }
  },
})
