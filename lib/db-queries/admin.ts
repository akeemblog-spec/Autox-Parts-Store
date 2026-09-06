import { db } from "@/db";
import { products, orders, users, orderItems } from "@/db/schema";
import { and, desc, sql, eq, ne, gte, isNull } from "drizzle-orm";

export async function getAdminStats() {
  const [productCount] = await db.select({ count: sql<number>`count(*)::int` }).from(products).where(isNull(products.archivedAt));
  const [orderCount] = await db.select({ count: sql<number>`count(*)::int` }).from(orders);
  const [customerCount] = await db.select({ count: sql<number>`count(*)::int` }).from(users).where(eq(users.role, "customer"));
  const [revenue] = await db.select({ total: sql<number>`coalesce(sum(${orders.total}), 0)::float` }).from(orders).where(ne(orders.status, "cancelled"));
  const [lowStock] = await db.select({ count: sql<number>`count(*)::int` }).from(products).where(and(sql`${products.stock} <= 10`, isNull(products.archivedAt)));
  const [pending] = await db.select({ count: sql<number>`count(*)::int` }).from(orders).where(sql`${orders.status} in ('pending','paid','processing')`);
  return { productCount:productCount?.count??0,orderCount:orderCount?.count??0,customerCount:customerCount?.count??0,revenue:revenue?.total??0,lowStock:lowStock?.count??0,pendingOrders:pending?.count??0 };
}

export async function getRecentOrders(limit = 5) {
  return db.query.orders.findMany({ orderBy:[desc(orders.createdAt)],limit,with:{ items:true,user:{columns:{name:true,email:true}} } });
}

export async function getAllOrdersAdmin() {
  return db.query.orders.findMany({
    orderBy:[desc(orders.createdAt)],
    with:{
      items:{with:{product:{with:{images:{orderBy:(img,{asc})=>[asc(img.sortOrder)],limit:1},brand:true}}}},
      user:{columns:{name:true,email:true,phone:true}},
      address:true,
      statusHistory:{orderBy:(h,{asc})=>[asc(h.createdAt)]},
    },
  });
}

export async function getAllProductsAdmin() {
  return db.query.products.findMany({orderBy:[desc(products.createdAt)],with:{brand:true,category:true,images:{orderBy:(img,{asc})=>[asc(img.sortOrder)],limit:1}}});
}

export async function getAdminDashboardData() {
  const since = new Date(); since.setDate(since.getDate()-6); since.setHours(0,0,0,0);
  const [stats,recentOrders,recentSales,statusRows,topSelling,lowStockProducts,recentProducts] = await Promise.all([
    getAdminStats(),
    getRecentOrders(5),
    db.select({total:orders.total,createdAt:orders.createdAt}).from(orders).where(sql`${orders.createdAt} >= ${since} and ${orders.status} != 'cancelled'`).orderBy(orders.createdAt),
    db.select({status:orders.status,count:sql<number>`count(*)::int`}).from(orders).groupBy(orders.status),
    db.select({productId:orderItems.productId,name:orderItems.productName,sold:sql<number>`sum(${orderItems.quantity})::int`,revenue:sql<number>`sum(${orderItems.quantity} * ${orderItems.unitPrice})::float`}).from(orderItems).groupBy(orderItems.productId,orderItems.productName).orderBy(desc(sql`sum(${orderItems.quantity})`)).limit(5),
    db.query.products.findMany({where:and(sql`${products.stock} <= 10`, isNull(products.archivedAt)),orderBy:[products.stock],limit:5,with:{images:{orderBy:(img,{asc})=>[asc(img.sortOrder)],limit:1}}}),
    db.query.products.findMany({where:isNull(products.archivedAt),orderBy:[desc(products.updatedAt)],limit:4,with:{brand:true}}),
  ]);
  const days=Array.from({length:7},(_,i)=>{const d=new Date(since);d.setDate(since.getDate()+i);return {date:d.toISOString().slice(0,10),label:d.toLocaleDateString('en-LK',{month:'short',day:'numeric'}),total:0};});
  for(const sale of recentSales){const key=new Date(sale.createdAt).toISOString().slice(0,10);const day=days.find(d=>d.date===key);if(day)day.total+=sale.total;}
  const statusCounts=Object.fromEntries(statusRows.map(r=>[r.status,r.count]));
  return {stats,recentOrders,salesTrend:days,statusCounts,topSelling,lowStockProducts,recentProducts};
}
