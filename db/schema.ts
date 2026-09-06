import {
  pgTable,
  text,
  varchar,
  integer,
  real,
  boolean,
  timestamp,
  primaryKey,
  uuid,
  pgEnum,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { relations, sql } from "drizzle-orm";

// ---------------------------------------------------------------------------
// Enums
// ---------------------------------------------------------------------------
export const roleEnum = pgEnum("role", ["customer", "admin", "super_admin"]);
export const vehicleTypeEnum = pgEnum("vehicle_type", ["bike", "three-wheeler"]);
export const partTypeEnum = pgEnum("part_type", ["genuine_honda", "genuine", "oem", "aftermarket"]);
export const orderStatusEnum = pgEnum("order_status", [
  "pending",
  "paid",
  "processing",
  "shipped",
  "out_for_delivery",
  "delivered",
  "cancelled",
]);
export const paymentMethodEnum = pgEnum("payment_method", [
  "card",
  "cod",
  "bank_transfer",
  "installment",
  "koko",
  "mintpay",
]);

// ---------------------------------------------------------------------------
// Auth (Auth.js / NextAuth compatible tables)
// ---------------------------------------------------------------------------
export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name"),
  email: text("email").notNull().unique(),
  emailVerified: timestamp("email_verified", { mode: "date" }),
  image: text("image"),
  passwordHash: text("password_hash"), // null for OAuth-only users
  role: roleEnum("role").notNull().default("customer"),
  active: boolean("active").notNull().default(true),
  phone: text("phone"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  sessionVersion: integer("session_version").notNull().default(1),
  mfaEnabled: boolean("mfa_enabled").notNull().default(false),
  mfaSecretEncrypted: text("mfa_secret_encrypted"),
  mfaRecoveryCodes: text("mfa_recovery_codes"),
  mfaVerifiedAt: timestamp("mfa_verified_at", { mode: "date" }),
  lastLoginAt: timestamp("last_login_at", { mode: "date" }),
  adminInviteStatus: text("admin_invite_status"),
  adminInviteExpiresAt: timestamp("admin_invite_expires_at", { mode: "date" }),
});

export const userPreferences = pgTable("user_preferences", {
  userId: uuid("user_id").primaryKey().references(() => users.id, { onDelete: "cascade" }),
  orderUpdates: boolean("order_updates").notNull().default(true),
  promotions: boolean("promotions").notNull().default(false),
  productNews: boolean("product_news").notNull().default(false),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const accounts = pgTable(
  "accounts",
  {
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: text("type").notNull(),
    provider: text("provider").notNull(),
    providerAccountId: text("provider_account_id").notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: text("token_type"),
    scope: text("scope"),
    id_token: text("id_token"),
    session_state: text("session_state"),
  },
  (account) => [primaryKey({ columns: [account.provider, account.providerAccountId] })]
);

export const sessions = pgTable("sessions", {
  sessionToken: text("session_token").primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expires: timestamp("expires", { mode: "date" }).notNull(),
});

export const verificationTokens = pgTable(
  "verification_tokens",
  {
    identifier: text("identifier").notNull(),
    token: text("token").notNull(),
    expires: timestamp("expires", { mode: "date" }).notNull(),
  },
  (vt) => [primaryKey({ columns: [vt.identifier, vt.token] })]
);


export const securityRateLimits = pgTable("security_rate_limits", {
  key: text("key").primaryKey(),
  attempts: integer("attempts").notNull().default(1),
  expiresAt: timestamp("expires_at", { mode: "date" }).notNull(),
});

export const adminAuditLogs = pgTable("admin_audit_logs", {
  id: uuid("id").defaultRandom().primaryKey(),
  actorUserId: uuid("actor_user_id").references(() => users.id, { onDelete: "set null" }),
  action: text("action").notNull(),
  targetType: text("target_type").notNull(),
  targetId: text("target_id"),
  metadata: text("metadata"),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
});

// ---------------------------------------------------------------------------
// Catalog
// ---------------------------------------------------------------------------
export const brands = pgTable("brands", {
  id: uuid("id").defaultRandom().primaryKey(),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  logo: text("logo").notNull(),
  vehicleImage: text("vehicle_image").notNull(),
  vehicleType: text("vehicle_type").notNull(),
  description: text("description"),
  coverImage: text("cover_image"),
  active: boolean("active").notNull().default(true),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const categories = pgTable("categories", {
  id: uuid("id").defaultRandom().primaryKey(),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  image: text("image").notNull(),
  icon: text("icon").notNull(),
  coverImage: text("cover_image"),
  description: text("description"),
  active: boolean("active").notNull().default(true),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const vehicleModels = pgTable("vehicle_models", {
  id: uuid("id").defaultRandom().primaryKey(),
  slug: text("slug").notNull(),
  brandId: uuid("brand_id")
    .notNull()
    .references(() => brands.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  image: text("image").notNull(),
  yearFrom: integer("year_from").notNull(),
  yearTo: text("year_to").notNull(), // "Present" or a year, stored as text
});

export const products = pgTable("products", {
  id: uuid("id").defaultRandom().primaryKey(),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  brandId: uuid("brand_id")
    .notNull()
    .references(() => brands.id),
  categoryId: uuid("category_id")
    .notNull()
    .references(() => categories.id),
  vehicleType: text("vehicle_type").notNull(),
  modelYears: text("model_years").notNull(),
  partType: text("part_type").notNull(),
  price: real("price").notNull(),
  previousPrice: real("previous_price"),
  discount: integer("discount"),
  rating: real("rating").notNull().default(0),
  reviewCount: integer("review_count").notNull().default(0),
  stock: integer("stock").notNull().default(0),
  genuine: boolean("genuine").notNull().default(false),
  installmentAvailable: boolean("installment_available").notNull().default(false),
  description: text("description").notNull(),
  warranty: text("warranty").notNull(),
  deliveryEstimate: text("delivery_estimate").notNull(),
  archivedAt: timestamp("archived_at", { mode: "date" }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const productImages = pgTable("product_images", {
  id: uuid("id").defaultRandom().primaryKey(),
  productId: uuid("product_id")
    .notNull()
    .references(() => products.id, { onDelete: "cascade" }),
  url: text("url").notNull(),
  alt: text("alt").notNull(),
  sortOrder: integer("sort_order").notNull().default(0),
});

export const productCompatibility = pgTable("product_compatibility", {
  id: uuid("id").defaultRandom().primaryKey(),
  productId: uuid("product_id")
    .notNull()
    .references(() => products.id, { onDelete: "cascade" }),
  brandName: text("brand_name").notNull(),
  modelName: text("model_name").notNull(),
  years: text("years").notNull(),
});

export const productSpecifications = pgTable("product_specifications", {
  id: uuid("id").defaultRandom().primaryKey(),
  productId: uuid("product_id")
    .notNull()
    .references(() => products.id, { onDelete: "cascade" }),
  label: text("label").notNull(),
  value: text("value").notNull(),
  sortOrder: integer("sort_order").notNull().default(0),
});

export const reviews = pgTable("reviews", {
  id: uuid("id").defaultRandom().primaryKey(),
  productId: uuid("product_id")
    .notNull()
    .references(() => products.id, { onDelete: "cascade" }),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  rating: integer("rating").notNull(),
  comment: text("comment"),
  status: text("status").notNull().default("pending"),
  moderatedAt: timestamp("moderated_at", { mode: "date" }),
  moderatedBy: uuid("moderated_by").references(() => users.id, { onDelete: "set null" }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (t) => [uniqueIndex("reviews_user_product_unique").on(t.userId, t.productId)]);

// ---------------------------------------------------------------------------
// Cart / Wishlist / Compare
// ---------------------------------------------------------------------------
export const carts = pgTable("carts", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" })
    .unique(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const cartItems = pgTable("cart_items", {
  id: uuid("id").defaultRandom().primaryKey(),
  cartId: uuid("cart_id")
    .notNull()
    .references(() => carts.id, { onDelete: "cascade" }),
  productId: uuid("product_id")
    .notNull()
    .references(() => products.id, { onDelete: "cascade" }),
  quantity: integer("quantity").notNull().default(1),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const wishlistItems = pgTable("wishlist_items", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  productId: uuid("product_id")
    .notNull()
    .references(() => products.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (t) => [uniqueIndex("wishlist_user_product_unique").on(t.userId, t.productId)]);

export const compareItems = pgTable("compare_items", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  productId: uuid("product_id")
    .notNull()
    .references(() => products.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (t) => [uniqueIndex("compare_user_product_unique").on(t.userId, t.productId)]);

// ---------------------------------------------------------------------------
// Orders / Payments / Addresses
// ---------------------------------------------------------------------------
export const addresses = pgTable("addresses", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  label: text("label").notNull().default("Home"),
  line1: text("line1").notNull(),
  line2: text("line2"),
  city: text("city").notNull(),
  district: text("district").notNull(),
  postalCode: text("postal_code"),
  phone: text("phone").notNull(),
  isDefault: boolean("is_default").notNull().default(false),
  isSaved: boolean("is_saved").notNull().default(true),
}, (t) => [uniqueIndex("addresses_one_saved_default_per_user").on(t.userId).where(sql`${t.isSaved} = true AND ${t.isDefault} = true`)]);

export const orders = pgTable("orders", {
  id: uuid("id").defaultRandom().primaryKey(),
  orderNumber: text("order_number").notNull().unique(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id),
  addressId: uuid("address_id").references(() => addresses.id),
  status: orderStatusEnum("status").notNull().default("pending"),
  subtotal: real("subtotal").notNull(),
  deliveryFee: real("delivery_fee").notNull().default(0),
  deliveryMethod: text("delivery_method").notNull().default("standard"),
  standardDeliveryFee: real("standard_delivery_fee").notNull().default(0),
  expressDeliveryFee: real("express_delivery_fee").notNull().default(0),
  discountAmount: real("discount_amount").notNull().default(0),
  couponCode: text("coupon_code"),
  total: real("total").notNull(),
  paymentMethod: paymentMethodEnum("payment_method").notNull().default("cod"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const orderItems = pgTable("order_items", {
  id: uuid("id").defaultRandom().primaryKey(),
  orderId: uuid("order_id")
    .notNull()
    .references(() => orders.id, { onDelete: "cascade" }),
  productId: uuid("product_id")
    .notNull()
    .references(() => products.id),
  productName: text("product_name").notNull(), // snapshot at time of order
  unitPrice: real("unit_price").notNull(), // snapshot at time of order
  quantity: integer("quantity").notNull(),
});

export const payments = pgTable("payments", {
  id: uuid("id").defaultRandom().primaryKey(),
  orderId: uuid("order_id")
    .notNull()
    .references(() => orders.id, { onDelete: "cascade" })
    .unique(),
  amount: real("amount").notNull(),
  method: paymentMethodEnum("method").notNull(),
  status: text("status").notNull().default("pending"),
  providerRef: text("provider_ref"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const installmentPlans = pgTable("installment_plans", {
  id: uuid("id").defaultRandom().primaryKey(),
  orderId: uuid("order_id")
    .notNull()
    .references(() => orders.id, { onDelete: "cascade" }),
  months: integer("months").notNull(),
  monthlyAmount: real("monthly_amount").notNull(),
  interestRate: real("interest_rate").notNull().default(0),
});

// ---------------------------------------------------------------------------
// Payment method toggles (admin-controlled)
// ---------------------------------------------------------------------------
export const paymentMethods = pgTable("payment_methods", {
  id: uuid("id").defaultRandom().primaryKey(),
  method: paymentMethodEnum("method").notNull().unique(),
  label: text("label").notNull(),
  description: text("description"),
  enabled: boolean("enabled").notNull().default(false),
  // Free-form JSON for future provider credentials (Koko/Mintpay merchant
  // IDs, API keys, webhook secrets, etc.) so enabling a provider later
  // doesn't require a schema change — just filling this in from the admin
  // dashboard.
  config: text("config"), // stored as JSON string; parse/stringify in app code
  sortOrder: integer("sort_order").notNull().default(0),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// ---------------------------------------------------------------------------
// Coupons / banners / content
// ---------------------------------------------------------------------------
export const coupons = pgTable("coupons", {
  id: uuid("id").defaultRandom().primaryKey(),
  code: text("code").notNull().unique(),
  percentOff: integer("percent_off"),
  amountOff: real("amount_off"),
  active: boolean("active").notNull().default(true),
  startsAt: timestamp("starts_at"),
  expiresAt: timestamp("expires_at"),
  minOrderAmount: real("min_order_amount").notNull().default(0),
  maxDiscount: real("max_discount"),
  usageLimit: integer("usage_limit"),
  perCustomerLimit: integer("per_customer_limit").notNull().default(1),
  usageCount: integer("usage_count").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const couponUsages = pgTable("coupon_usages", {
  id: uuid("id").defaultRandom().primaryKey(),
  couponId: uuid("coupon_id").notNull().references(() => coupons.id, { onDelete: "cascade" }),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  orderId: uuid("order_id").notNull().references(() => orders.id, { onDelete: "cascade" }),
  discountAmount: real("discount_amount").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const inventoryMovements = pgTable("inventory_movements", {
  id: uuid("id").defaultRandom().primaryKey(),
  productId: uuid("product_id").notNull().references(() => products.id, { onDelete: "cascade" }),
  orderId: uuid("order_id").references(() => orders.id, { onDelete: "set null" }),
  actorUserId: uuid("actor_user_id").references(() => users.id, { onDelete: "set null" }),
  quantityChange: integer("quantity_change").notNull(),
  reason: text("reason").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const returnRequests = pgTable("return_requests", {
  id: uuid("id").defaultRandom().primaryKey(),
  orderId: uuid("order_id").notNull().references(() => orders.id, { onDelete: "cascade" }),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  reason: text("reason").notNull(),
  notes: text("notes"),
  status: text("status").notNull().default("pending"),
  refundStatus: text("refund_status").notNull().default("not_required"),
  adminNote: text("admin_note"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const adminNotifications = pgTable("admin_notifications", {
  id: uuid("id").defaultRandom().primaryKey(),
  type: text("type").notNull(),
  title: text("title").notNull(),
  message: text("message"),
  href: text("href").notNull(),
  entityKey: text("entity_key").unique(),
  readAt: timestamp("read_at", { mode: "date" }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const banners = pgTable("banners", {
  id: uuid("id").defaultRandom().primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  image: text("image").notNull(),
  ctaLabel: text("cta_label"),
  ctaHref: text("cta_href"),
  active: boolean("active").notNull().default(true),
  sortOrder: integer("sort_order").notNull().default(0),
});

export const contactMessages = pgTable("contact_messages", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  subject: text("subject"),
  message: text("message").notNull(),
  resolved: boolean("resolved").notNull().default(false),
  readAt: timestamp("read_at", { mode: "date" }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});


// ---------------------------------------------------------------------------
// Storefront CMS / managed catalog taxonomies
// ---------------------------------------------------------------------------
export const vehicleTypes = pgTable("vehicle_types", {
  id: uuid("id").defaultRandom().primaryKey(),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  image: text("image"),
  active: boolean("active").notNull().default(true),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const partTypes = pgTable("part_types", {
  id: uuid("id").defaultRandom().primaryKey(),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  description: text("description"),
  active: boolean("active").notNull().default(true),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const heroSlides = pgTable("hero_slides", {
  id: uuid("id").defaultRandom().primaryKey(),
  eyebrow: text("eyebrow"),
  headline: text("headline").notNull(),
  headlineAccent: text("headline_accent"),
  description: text("description"),
  image: text("image").notNull(),
  mobileImage: text("mobile_image"),
  primaryLabel: text("primary_label").notNull().default("Shop Parts"),
  primaryHref: text("primary_href").notNull().default("/products"),
  secondaryLabel: text("secondary_label"),
  secondaryHref: text("secondary_href"),
  active: boolean("active").notNull().default(true),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const siteSettings = pgTable("site_settings", {
  key: text("key").primaryKey(),
  value: text("value").notNull(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const orderStatusHistory = pgTable("order_status_history", {
  id: uuid("id").defaultRandom().primaryKey(),
  orderId: uuid("order_id").notNull().references(() => orders.id, { onDelete: "cascade" }),
  status: text("status").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// ---------------------------------------------------------------------------
// Relations (for Drizzle's relational query API)
// ---------------------------------------------------------------------------
export const productsRelations = relations(products, ({ one, many }) => ({
  brand: one(brands, { fields: [products.brandId], references: [brands.id] }),
  category: one(categories, { fields: [products.categoryId], references: [categories.id] }),
  images: many(productImages),
  compatibility: many(productCompatibility),
  specifications: many(productSpecifications),
  reviews: many(reviews),
}));

export const brandsRelations = relations(brands, ({ many }) => ({
  products: many(products),
  models: many(vehicleModels),
}));

export const categoriesRelations = relations(categories, ({ many }) => ({
  products: many(products),
}));

export const vehicleModelsRelations = relations(vehicleModels, ({ one }) => ({
  brand: one(brands, { fields: [vehicleModels.brandId], references: [brands.id] }),
}));

export const usersRelations = relations(users, ({ many, one }) => ({
  accounts: many(accounts),
  sessions: many(sessions),
  orders: many(orders),
  addresses: many(addresses),
  wishlistItems: many(wishlistItems),
  compareItems: many(compareItems),
  reviews: many(reviews),
  cart: one(carts, { fields: [users.id], references: [carts.userId] }),
  preferences: one(userPreferences, { fields: [users.id], references: [userPreferences.userId] }),
}));

export const cartsRelations = relations(carts, ({ one, many }) => ({
  user: one(users, { fields: [carts.userId], references: [users.id] }),
  items: many(cartItems),
}));

export const cartItemsRelations = relations(cartItems, ({ one }) => ({
  cart: one(carts, { fields: [cartItems.cartId], references: [carts.id] }),
  product: one(products, { fields: [cartItems.productId], references: [products.id] }),
}));

export const ordersRelations = relations(orders, ({ one, many }) => ({
  user: one(users, { fields: [orders.userId], references: [users.id] }),
  address: one(addresses, { fields: [orders.addressId], references: [addresses.id] }),
  items: many(orderItems),
  payment: one(payments, { fields: [orders.id], references: [payments.orderId] }),
  statusHistory: many(orderStatusHistory),
}));

export const orderItemsRelations = relations(orderItems, ({ one }) => ({
  order: one(orders, { fields: [orderItems.orderId], references: [orders.id] }),
  product: one(products, { fields: [orderItems.productId], references: [products.id] }),
}));

// --- Reverse ("one") sides for every remaining "many" relation above. ---
// Drizzle's relational query API (db.query.*) needs both sides of a
// relationship declared — the "many" side alone (e.g. `images: many(productImages)`
// on productsRelations) isn't enough for nested `with: { images: { orderBy, limit } }`
// queries to resolve; it also needs `product: one(products, ...)` declared here,
// on productImages itself.

export const productImagesRelations = relations(productImages, ({ one }) => ({
  product: one(products, { fields: [productImages.productId], references: [products.id] }),
}));

export const productCompatibilityRelations = relations(productCompatibility, ({ one }) => ({
  product: one(products, { fields: [productCompatibility.productId], references: [products.id] }),
}));

export const productSpecificationsRelations = relations(productSpecifications, ({ one }) => ({
  product: one(products, { fields: [productSpecifications.productId], references: [products.id] }),
}));

export const reviewsRelations = relations(reviews, ({ one }) => ({
  product: one(products, { fields: [reviews.productId], references: [products.id] }),
  user: one(users, { fields: [reviews.userId], references: [users.id] }),
}));

export const accountsRelations = relations(accounts, ({ one }) => ({
  user: one(users, { fields: [accounts.userId], references: [users.id] }),
}));

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, { fields: [sessions.userId], references: [users.id] }),
}));

export const addressesRelations = relations(addresses, ({ one }) => ({
  user: one(users, { fields: [addresses.userId], references: [users.id] }),
}));

export const wishlistItemsRelations = relations(wishlistItems, ({ one }) => ({
  user: one(users, { fields: [wishlistItems.userId], references: [users.id] }),
  product: one(products, { fields: [wishlistItems.productId], references: [products.id] }),
}));

export const compareItemsRelations = relations(compareItems, ({ one }) => ({
  user: one(users, { fields: [compareItems.userId], references: [users.id] }),
  product: one(products, { fields: [compareItems.productId], references: [products.id] }),
}));

export const paymentsRelations = relations(payments, ({ one }) => ({
  order: one(orders, { fields: [payments.orderId], references: [orders.id] }),
}));

export const installmentPlansRelations = relations(installmentPlans, ({ one }) => ({
  order: one(orders, { fields: [installmentPlans.orderId], references: [orders.id] }),
}));

export const orderStatusHistoryRelations = relations(orderStatusHistory, ({ one }) => ({
  order: one(orders, { fields: [orderStatusHistory.orderId], references: [orders.id] }),
}));

export const userPreferencesRelations = relations(userPreferences, ({ one }) => ({
  user: one(users, { fields: [userPreferences.userId], references: [users.id] }),
}));
