# Yayoi Kusama Handbag Artwork (YKHA)

## 單元測試及覆蓋率
```
yarn
yarn hardhat compile
yarn hardhat test
yarn hardhat coverage
```

## 白名單頁面
```
cd frontend_whitelist
yarn
yarn http-server -c-1
```

## 公售頁面
```
cd frontend_public
yarn
yarn http-server -c-1
```

## 操作說明
- 基本條件
```
1. 總數7000個
2. 白名單總數3000個
3. 一次鑄造上限5個
```

- mint: 公開鑄造
```
輸入：
1. amount (數量)
條件：
1. 必須在公開鑄造階段
2. 公開鑄造費用一個 1.2 ETH
```

- whitelistMint: 白名單鑄造
```
輸入：
1. signature (授權金鑰)
2. amount (數量)
條件：
1. 必須在白名單鑄造階段
2. 一個地址鑄造總數不能超過5個
3. 白名單鑄造費用一個 1 ETH
```

- withdraw: 提領所有資金到指定錢包
```
條件：
1. 必須進到receiver錢包
```

- setBaseURI: 解盲
```
輸入：
1. newBaseURI (解盲圖的連結)
條件：
1. 必須是owner操作
```

- flipPublicSale: 切換公開鑄造狀態
```
條件：
1. 必須是owner操作
```

- flipWhitelistSale: 切換白名單鑄造狀態
```
條件：
1. 必須是owner操作
```

- updateSaleInfo: 更新
```
輸入：
1. newSaleInfo (新的鑄造資訊)
條件：
1. 必須是owner操作
2. 不能更改到白名單總數的狀態
```

