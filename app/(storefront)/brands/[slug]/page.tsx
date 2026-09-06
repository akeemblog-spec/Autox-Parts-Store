import { BrandPageServer } from "@/components/pages/BrandPageServer";
export const dynamic = "force-dynamic";
export default async function DynamicBrandPage({ params }: { params: Promise<{ slug: string }> }) { const { slug } = await params; return <BrandPageServer slug={slug}/>; }
