-- AlterTable
ALTER TABLE "POSOrder" ADD COLUMN     "openOutletKey" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "POSOrder_openOutletKey_key" ON "POSOrder"("openOutletKey");

-- CreateIndex
CREATE UNIQUE INDEX "POSOrderItem_orderId_menuItemId_key" ON "POSOrderItem"("orderId", "menuItemId");

