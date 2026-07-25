-- CreateEnum
CREATE TYPE "Currency" AS ENUM ('EUR', 'USD', 'GBP');

-- CreateEnum
CREATE TYPE "CopyCondition" AS ENUM ('SEALED', 'LIKE_NEW', 'VERY_GOOD', 'GOOD', 'ACCEPTABLE', 'DAMAGED');

-- CreateEnum
CREATE TYPE "Authenticity" AS ENUM ('UNCHECKED', 'PROBABLY_ORIGINAL', 'VERIFIED_ORIGINAL', 'DOUBTFUL', 'REPRODUCTION');

-- CreateEnum
CREATE TYPE "WishlistPriority" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'IMMEDIATE');

-- CreateEnum
CREATE TYPE "ListingStatus" AS ENUM ('ACTIVE', 'NEGOTIATING', 'PURCHASED', 'DISCARDED', 'SOLD', 'EXPIRED');

-- CreateEnum
CREATE TYPE "MarketplacePlatform" AS ENUM ('WALLAPOP', 'VINTED', 'EBAY', 'STORE', 'PRIVATE', 'OTHER');

-- CreateEnum
CREATE TYPE "CompletenessSegment" AS ENUM ('LOOSE', 'CIB_PARTIAL', 'CIB_COMPLETE', 'SEALED');

-- CreateEnum
CREATE TYPE "NegotiationTone" AS ENUM ('FRIENDLY', 'DIRECT', 'INFORMED_COLLECTOR', 'BRIEF');

-- CreateEnum
CREATE TYPE "ComponentImportance" AS ENUM ('CRITICAL', 'HIGH', 'MEDIUM', 'LOW', 'OPTIONAL');

-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL,
    "name" TEXT,
    "email" TEXT NOT NULL,
    "emailVerified" TIMESTAMP(3),
    "image" TEXT,
    "passwordHash" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "accounts" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,

    CONSTRAINT "accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sessions" (
    "id" UUID NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "userId" UUID NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "verification_tokens" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL
);

-- CreateTable
CREATE TABLE "platforms" (
    "id" UUID NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "shortName" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "platforms_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "regions" (
    "id" UUID NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "regions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "games" (
    "id" UUID NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "generation" INTEGER NOT NULL,
    "releaseYear" INTEGER,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "games_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "game_editions" (
    "id" UUID NOT NULL,
    "gameId" UUID NOT NULL,
    "platformId" UUID NOT NULL,
    "regionId" UUID NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "versionLabel" TEXT,
    "language" TEXT NOT NULL DEFAULT 'es',
    "productCode" TEXT,
    "editionLabel" TEXT NOT NULL DEFAULT 'Estándar',
    "imageUrl" TEXT,
    "description" TEXT,
    "referencePriceCents" INTEGER,
    "targetPriceCents" INTEGER,
    "maxPriceCents" INTEGER,
    "currency" "Currency" NOT NULL DEFAULT 'EUR',
    "isIndicativePricing" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "game_editions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "component_definitions" (
    "id" UUID NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "importance" "ComponentImportance" NOT NULL DEFAULT 'MEDIUM',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "component_definitions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "edition_components" (
    "id" UUID NOT NULL,
    "gameEditionId" UUID NOT NULL,
    "componentDefinitionId" UUID NOT NULL,
    "weight" INTEGER NOT NULL DEFAULT 1,
    "isRequired" BOOLEAN NOT NULL DEFAULT true,
    "notes" TEXT,

    CONSTRAINT "edition_components_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tags" (
    "id" UUID NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tags_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "game_edition_tags" (
    "gameEditionId" UUID NOT NULL,
    "tagId" UUID NOT NULL,

    CONSTRAINT "game_edition_tags_pkey" PRIMARY KEY ("gameEditionId","tagId")
);

-- CreateTable
CREATE TABLE "collections" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "collections_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "collection_entries" (
    "id" UUID NOT NULL,
    "collectionId" UUID NOT NULL,
    "gameEditionId" UUID NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "collection_entries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "owned_copies" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "gameEditionId" UUID NOT NULL,
    "condition" "CopyCondition" NOT NULL,
    "regionLabel" TEXT,
    "language" TEXT NOT NULL DEFAULT 'es',
    "pricePaidCents" INTEGER,
    "currency" "Currency" NOT NULL DEFAULT 'EUR',
    "purchasedAt" TIMESTAMP(3),
    "purchasePlatform" "MarketplacePlatform",
    "sellerName" TEXT,
    "listingUrl" TEXT,
    "notes" TEXT,
    "photoUrls" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "authenticity" "Authenticity" NOT NULL DEFAULT 'UNCHECKED',
    "completenessPercent" INTEGER NOT NULL DEFAULT 0,
    "isPrimary" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "owned_copies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "owned_copy_components" (
    "id" UUID NOT NULL,
    "ownedCopyId" UUID NOT NULL,
    "componentDefinitionId" UUID NOT NULL,
    "isPresent" BOOLEAN NOT NULL DEFAULT false,
    "condition" "CopyCondition",
    "notes" TEXT,

    CONSTRAINT "owned_copy_components_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "wishlist_entries" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "gameEditionId" UUID NOT NULL,
    "priority" "WishlistPriority" NOT NULL DEFAULT 'MEDIUM',
    "targetPriceCents" INTEGER,
    "maxPriceCents" INTEGER,
    "currency" "Currency" NOT NULL DEFAULT 'EUR',
    "minCondition" "CopyCondition",
    "requiredComponentIds" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "desiredRegion" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "wishlist_entries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sellers" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "platform" "MarketplacePlatform",
    "profileUrl" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sellers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "listings" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "gameEditionId" UUID NOT NULL,
    "sellerId" UUID,
    "platform" "MarketplacePlatform" NOT NULL,
    "url" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "priceCents" INTEGER NOT NULL,
    "shippingCents" INTEGER NOT NULL DEFAULT 0,
    "feeCents" INTEGER NOT NULL DEFAULT 0,
    "totalCents" INTEGER NOT NULL,
    "currency" "Currency" NOT NULL DEFAULT 'EUR',
    "sellerName" TEXT,
    "location" TEXT,
    "description" TEXT,
    "apparentCondition" "CopyCondition",
    "estimatedAuthenticity" "Authenticity" NOT NULL DEFAULT 'UNCHECKED',
    "publishedAt" TIMESTAMP(3),
    "savedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" "ListingStatus" NOT NULL DEFAULT 'ACTIVE',
    "completenessSegment" "CompletenessSegment" NOT NULL DEFAULT 'CIB_PARTIAL',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "listings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "listing_images" (
    "id" UUID NOT NULL,
    "listingId" UUID NOT NULL,
    "url" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "listing_images_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "listing_components" (
    "id" UUID NOT NULL,
    "listingId" UUID NOT NULL,
    "componentDefinitionId" UUID NOT NULL,
    "isVisible" BOOLEAN NOT NULL DEFAULT true,
    "notes" TEXT,

    CONSTRAINT "listing_components_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "purchases" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "gameEditionId" UUID NOT NULL,
    "ownedCopyId" UUID,
    "listingId" UUID,
    "sellerId" UUID,
    "platform" "MarketplacePlatform",
    "pricePaidCents" INTEGER NOT NULL,
    "shippingCents" INTEGER NOT NULL DEFAULT 0,
    "feeCents" INTEGER NOT NULL DEFAULT 0,
    "totalCents" INTEGER NOT NULL,
    "currency" "Currency" NOT NULL DEFAULT 'EUR',
    "purchasedAt" TIMESTAMP(3) NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "purchases_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "price_observations" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "gameEditionId" UUID NOT NULL,
    "observedAt" TIMESTAMP(3) NOT NULL,
    "priceCents" INTEGER NOT NULL,
    "currency" "Currency" NOT NULL DEFAULT 'EUR',
    "condition" "CopyCondition",
    "completenessSegment" "CompletenessSegment" NOT NULL,
    "platform" "MarketplacePlatform",
    "url" TEXT,
    "notes" TEXT,
    "isIndicative" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "price_observations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "negotiations" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "listingId" UUID,
    "listedPriceCents" INTEGER NOT NULL,
    "initialOfferCents" INTEGER NOT NULL,
    "maxPriceCents" INTEGER NOT NULL,
    "currency" "Currency" NOT NULL DEFAULT 'EUR',
    "observedDefects" TEXT,
    "buySpeed" TEXT,
    "deliveryMode" TEXT,
    "tone" "NegotiationTone" NOT NULL DEFAULT 'FRIENDLY',
    "generatedMessage" TEXT NOT NULL,
    "generatorKind" TEXT NOT NULL DEFAULT 'template',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "negotiations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "accounts_userId_idx" ON "accounts"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "accounts_provider_providerAccountId_key" ON "accounts"("provider", "providerAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "sessions_sessionToken_key" ON "sessions"("sessionToken");

-- CreateIndex
CREATE INDEX "sessions_userId_idx" ON "sessions"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "verification_tokens_token_key" ON "verification_tokens"("token");

-- CreateIndex
CREATE UNIQUE INDEX "verification_tokens_identifier_token_key" ON "verification_tokens"("identifier", "token");

-- CreateIndex
CREATE UNIQUE INDEX "platforms_slug_key" ON "platforms"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "regions_slug_key" ON "regions"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "regions_code_key" ON "regions"("code");

-- CreateIndex
CREATE UNIQUE INDEX "games_slug_key" ON "games"("slug");

-- CreateIndex
CREATE INDEX "games_generation_idx" ON "games"("generation");

-- CreateIndex
CREATE INDEX "games_name_idx" ON "games"("name");

-- CreateIndex
CREATE UNIQUE INDEX "game_editions_slug_key" ON "game_editions"("slug");

-- CreateIndex
CREATE INDEX "game_editions_gameId_idx" ON "game_editions"("gameId");

-- CreateIndex
CREATE INDEX "game_editions_platformId_idx" ON "game_editions"("platformId");

-- CreateIndex
CREATE INDEX "game_editions_regionId_idx" ON "game_editions"("regionId");

-- CreateIndex
CREATE INDEX "game_editions_language_idx" ON "game_editions"("language");

-- CreateIndex
CREATE UNIQUE INDEX "component_definitions_slug_key" ON "component_definitions"("slug");

-- CreateIndex
CREATE INDEX "edition_components_gameEditionId_idx" ON "edition_components"("gameEditionId");

-- CreateIndex
CREATE UNIQUE INDEX "edition_components_gameEditionId_componentDefinitionId_key" ON "edition_components"("gameEditionId", "componentDefinitionId");

-- CreateIndex
CREATE UNIQUE INDEX "tags_slug_key" ON "tags"("slug");

-- CreateIndex
CREATE INDEX "collections_userId_idx" ON "collections"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "collections_userId_slug_key" ON "collections"("userId", "slug");

-- CreateIndex
CREATE INDEX "collection_entries_collectionId_idx" ON "collection_entries"("collectionId");

-- CreateIndex
CREATE INDEX "collection_entries_gameEditionId_idx" ON "collection_entries"("gameEditionId");

-- CreateIndex
CREATE UNIQUE INDEX "collection_entries_collectionId_gameEditionId_key" ON "collection_entries"("collectionId", "gameEditionId");

-- CreateIndex
CREATE INDEX "owned_copies_userId_idx" ON "owned_copies"("userId");

-- CreateIndex
CREATE INDEX "owned_copies_gameEditionId_idx" ON "owned_copies"("gameEditionId");

-- CreateIndex
CREATE INDEX "owned_copies_userId_gameEditionId_idx" ON "owned_copies"("userId", "gameEditionId");

-- CreateIndex
CREATE INDEX "owned_copy_components_ownedCopyId_idx" ON "owned_copy_components"("ownedCopyId");

-- CreateIndex
CREATE UNIQUE INDEX "owned_copy_components_ownedCopyId_componentDefinitionId_key" ON "owned_copy_components"("ownedCopyId", "componentDefinitionId");

-- CreateIndex
CREATE INDEX "wishlist_entries_userId_priority_idx" ON "wishlist_entries"("userId", "priority");

-- CreateIndex
CREATE INDEX "wishlist_entries_gameEditionId_idx" ON "wishlist_entries"("gameEditionId");

-- CreateIndex
CREATE UNIQUE INDEX "wishlist_entries_userId_gameEditionId_key" ON "wishlist_entries"("userId", "gameEditionId");

-- CreateIndex
CREATE INDEX "sellers_userId_idx" ON "sellers"("userId");

-- CreateIndex
CREATE INDEX "listings_userId_status_idx" ON "listings"("userId", "status");

-- CreateIndex
CREATE INDEX "listings_gameEditionId_idx" ON "listings"("gameEditionId");

-- CreateIndex
CREATE INDEX "listings_platform_idx" ON "listings"("platform");

-- CreateIndex
CREATE INDEX "listing_images_listingId_idx" ON "listing_images"("listingId");

-- CreateIndex
CREATE INDEX "listing_components_listingId_idx" ON "listing_components"("listingId");

-- CreateIndex
CREATE UNIQUE INDEX "listing_components_listingId_componentDefinitionId_key" ON "listing_components"("listingId", "componentDefinitionId");

-- CreateIndex
CREATE INDEX "purchases_userId_purchasedAt_idx" ON "purchases"("userId", "purchasedAt");

-- CreateIndex
CREATE INDEX "purchases_gameEditionId_idx" ON "purchases"("gameEditionId");

-- CreateIndex
CREATE INDEX "price_observations_gameEditionId_observedAt_idx" ON "price_observations"("gameEditionId", "observedAt");

-- CreateIndex
CREATE INDEX "price_observations_gameEditionId_completenessSegment_idx" ON "price_observations"("gameEditionId", "completenessSegment");

-- CreateIndex
CREATE INDEX "price_observations_userId_idx" ON "price_observations"("userId");

-- CreateIndex
CREATE INDEX "negotiations_userId_idx" ON "negotiations"("userId");

-- CreateIndex
CREATE INDEX "negotiations_listingId_idx" ON "negotiations"("listingId");

-- AddForeignKey
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "game_editions" ADD CONSTRAINT "game_editions_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "games"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "game_editions" ADD CONSTRAINT "game_editions_platformId_fkey" FOREIGN KEY ("platformId") REFERENCES "platforms"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "game_editions" ADD CONSTRAINT "game_editions_regionId_fkey" FOREIGN KEY ("regionId") REFERENCES "regions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "edition_components" ADD CONSTRAINT "edition_components_gameEditionId_fkey" FOREIGN KEY ("gameEditionId") REFERENCES "game_editions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "edition_components" ADD CONSTRAINT "edition_components_componentDefinitionId_fkey" FOREIGN KEY ("componentDefinitionId") REFERENCES "component_definitions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "game_edition_tags" ADD CONSTRAINT "game_edition_tags_gameEditionId_fkey" FOREIGN KEY ("gameEditionId") REFERENCES "game_editions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "game_edition_tags" ADD CONSTRAINT "game_edition_tags_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "tags"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "collections" ADD CONSTRAINT "collections_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "collection_entries" ADD CONSTRAINT "collection_entries_collectionId_fkey" FOREIGN KEY ("collectionId") REFERENCES "collections"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "collection_entries" ADD CONSTRAINT "collection_entries_gameEditionId_fkey" FOREIGN KEY ("gameEditionId") REFERENCES "game_editions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "owned_copies" ADD CONSTRAINT "owned_copies_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "owned_copies" ADD CONSTRAINT "owned_copies_gameEditionId_fkey" FOREIGN KEY ("gameEditionId") REFERENCES "game_editions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "owned_copy_components" ADD CONSTRAINT "owned_copy_components_ownedCopyId_fkey" FOREIGN KEY ("ownedCopyId") REFERENCES "owned_copies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "owned_copy_components" ADD CONSTRAINT "owned_copy_components_componentDefinitionId_fkey" FOREIGN KEY ("componentDefinitionId") REFERENCES "component_definitions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "wishlist_entries" ADD CONSTRAINT "wishlist_entries_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "wishlist_entries" ADD CONSTRAINT "wishlist_entries_gameEditionId_fkey" FOREIGN KEY ("gameEditionId") REFERENCES "game_editions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sellers" ADD CONSTRAINT "sellers_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "listings" ADD CONSTRAINT "listings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "listings" ADD CONSTRAINT "listings_gameEditionId_fkey" FOREIGN KEY ("gameEditionId") REFERENCES "game_editions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "listings" ADD CONSTRAINT "listings_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "sellers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "listing_images" ADD CONSTRAINT "listing_images_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "listings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "listing_components" ADD CONSTRAINT "listing_components_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "listings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "listing_components" ADD CONSTRAINT "listing_components_componentDefinitionId_fkey" FOREIGN KEY ("componentDefinitionId") REFERENCES "component_definitions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "purchases" ADD CONSTRAINT "purchases_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "purchases" ADD CONSTRAINT "purchases_gameEditionId_fkey" FOREIGN KEY ("gameEditionId") REFERENCES "game_editions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "purchases" ADD CONSTRAINT "purchases_ownedCopyId_fkey" FOREIGN KEY ("ownedCopyId") REFERENCES "owned_copies"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "purchases" ADD CONSTRAINT "purchases_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "listings"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "purchases" ADD CONSTRAINT "purchases_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "sellers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "price_observations" ADD CONSTRAINT "price_observations_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "price_observations" ADD CONSTRAINT "price_observations_gameEditionId_fkey" FOREIGN KEY ("gameEditionId") REFERENCES "game_editions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "negotiations" ADD CONSTRAINT "negotiations_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "negotiations" ADD CONSTRAINT "negotiations_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "listings"("id") ON DELETE SET NULL ON UPDATE CASCADE;
